---
title: Backgrounding Economics
sidebar_position: 2
---

Backgrounding means buying light calves, feeding them to a heavier weight, and selling them again. The money is in the weight they put on. This page uses Kansas auction and hay prices to show what feeding calves up has been worth in past years.

## Sell now, or feed it up?

Say you own a steer and it is time to decide: sell it at today's weight, or feed it hay until it is heavier and sell it then. This section replays that choice in every past year, using the auction prices and hay prices from that year, and shows what feeding added or took away. Set the steer and the plan below.

<Dropdown name=start_month defaultValue="10" title="Month you decide">
  <DropdownOption value="1" valueLabel="January" />
  <DropdownOption value="2" valueLabel="February" />
  <DropdownOption value="3" valueLabel="March" />
  <DropdownOption value="4" valueLabel="April" />
  <DropdownOption value="5" valueLabel="May" />
  <DropdownOption value="6" valueLabel="June" />
  <DropdownOption value="7" valueLabel="July" />
  <DropdownOption value="8" valueLabel="August" />
  <DropdownOption value="9" valueLabel="September" />
  <DropdownOption value="10" valueLabel="October" />
  <DropdownOption value="11" valueLabel="November" />
  <DropdownOption value="12" valueLabel="December" />
</Dropdown>

<Dropdown name=hay_type defaultValue="Alfalfa" title="Hay you feed">
  <DropdownOption value="Alfalfa" />
  <DropdownOption value="Brome Grass" valueLabel="Brome grass" />
  <DropdownOption value="Bluestem Grass" valueLabel="Bluestem grass" />
</Dropdown>

<Grid cols=4>
  <Slider title="Weight today, lb" name=start_wt min=500 max=800 step=25 defaultValue=600 />
  <Slider title="Selling weight, lb" name=end_wt min=550 max=850 step=25 defaultValue=700 />
  <Slider title="Gain per day, lb" name=adg min=1 max=3.5 step=0.25 defaultValue=2 />
  <Slider title="Hay per day, lb" name=scen_hay_day min=10 max=35 step=1 defaultValue=20 />
</Grid>

Each column is one choice, worked out step by step. Prices and costs are the average of <Value data={scenario_compare} column=years fmt='0' /> past years, each replayed on the same dates.

<DataTable data={scenario_compare} rows=12>
  <Column id=item title=" " />
  <Column id=sell_now title="Sell now" />
  <Column id=sell_heavier title="Sell heavier" />
</DataTable>

<KMBarChart
  data={scenario_years}
  x=year
  y=extra
  sort=false
  title="What feeding added or took away, $ per head"
  yFmt='+$#,##0;-$#,##0'
  fillColor='#2f7d3c'
  chartAreaHeight={200}
/>

<DataTable data={scenario_years} rows=10>
  <Column id=year title="Year" />
  <Column id=sale_date title="Sale date" fmt='mmm d' />
  <Column id=start_price title="Price now, $ per cwt" fmt='$#,##0.00' />
  <Column id=end_price title="Price when heavier, $ per cwt" fmt='$#,##0.00' />
  <Column id=hay_price title="Hay, $ per ton" fmt='$#,##0' />
  <Column id=sell_now title="Sell now, $" fmt='$#,##0' />
  <Column id=keep_value title="Sell heavier, $" fmt='$#,##0' />
  <Column id=hay_cost title="Hay cost, $" fmt='$#,##0' />
  <Column id=extra title="Feeding adds, $" fmt='+$#,##0;-$#,##0' />
</DataTable>

### What this assumes

- **The steer and the price.** Auction prices for steers, from the [Kansas weekly auction summary (report 1895)](https://mymarketnews.ams.usda.gov/viewReport/1895), grouped in 100 lb weight classes. The price for your exact weight is read off a straight line between the two nearest classes, since a 600 lb steer sits between the 500-600 and 600-700 classes. Prices are the average of the four weeks around the date.
- **The dates.** The decision is made in the middle of the month you pick. The sale date is that day plus the days it takes to gain the weight, which is the pounds gained divided by the gain per day you set. Each past year is replayed with its own prices on those two dates.
- **Selling now.** Weight today times the price per cwt for that weight. This is what the steer brings, not profit, because what you paid for it is not included.
- **Selling heavier.** Weight at sale times the price per cwt at that weight on the sale date, minus the hay.
- **The hay.** The hay eaten is the days on feed times the pounds of hay per day you set, which is an assumption and not USDA data. A slower gain means more days, so more hay. It is priced at the average of the hay reports between the two dates, using Good quality large square 3x4 bales of the hay you pick, from the [Kansas Direct Hay report (report 2885)](https://mymarketnews.ams.usda.gov/viewReport/2885). Hay reports start in July 2020, so the first year that can be replayed with a fall start is 2020.
- **What is left out.** Grain, minerals, labor, yardage, vet costs, interest and death loss are not counted. A steer that gains 2 lb a day on hay alone is itself an assumption. Years that are not finished yet, or have no hay reports in the window, are skipped.
- **The past is not a forecast.** Each year is one outcome. The average is only the middle of what has happened.

<!-- Queries: kept at the bottom so the page layout reads top to bottom. -->

```sql scenario_years
-- Replays the sell-now-or-feed decision in each past year. For every year it finds the price of a
-- steer at the starting weight on the decision date and at the selling weight on the sale date,
-- plus the average hay price between the two dates.
with params as (
  select
    cast('${inputs.start_month.value}' as integer) as m,
    cast('${inputs.start_wt}' as double) as start_wt,
    cast('${inputs.end_wt}' as double) as end_wt,
    cast('${inputs.adg}' as double) as adg,
    cast('${inputs.scen_hay_day}' as double) as hay_day
),
plan as (
  select *, round((end_wt - start_wt) / adg) as days
  from params
  where end_wt > start_wt
),
bins as (
  -- Steers by week and 100 lb weight class, with the class's average weight and price.
  select
    cast(report_begin_date as date) as week,
    cast(floor(avg_weight / 100) * 100 as integer) as bin,
    sum(head_count) as head,
    sum(avg_weight * head_count) / sum(head_count) as avg_wt,
    sum(avg_price * head_count) / sum(head_count) as avg_price
  from supabase_ag_pipeline.raw_mmn_1895
  where commodity = 'Feeder Cattle'
    and class = 'Steers'
    and price_unit = 'Per Cwt'
    and lot_desc = 'None'
    and avg_weight >= 400
    and avg_weight < 900
    and head_count > 0
  group by 1, 2
),
last_week as (select max(week) as last_week from bins),
years as (select unnest(range(2019, 2027)) as yr),
periods as (
  -- Two dates per year: the decision date (the 15th) and the sale date.
  select yr, 'start' as kind, make_date(yr, m, 15) as center, start_wt as wt
  from years cross join plan
  union all
  select yr, 'sale' as kind, make_date(yr, m, 15) + cast(round(days) as integer) as center, end_wt as wt
  from years cross join plan
),
period_bins as (
  -- Each weight class, pooled over the four weeks around the date.
  select
    p.yr,
    p.kind,
    p.wt,
    sum(b.avg_wt * b.head) / sum(b.head) as bin_wt,
    sum(b.avg_price * b.head) / sum(b.head) as bin_price
  from periods p
  cross join last_week
  join bins b on b.week between p.center - 14 and p.center + 14
  where p.center <= last_week.last_week
  group by p.yr, p.kind, p.wt, b.bin
),
ranked as (
  select *, row_number() over (partition by yr, kind order by abs(bin_wt - wt)) as rn
  from period_bins
),
prices as (
  -- The price at the steer's weight, on a straight line between the two nearest weight classes.
  select
    yr,
    kind,
    max(case when rn = 1 then bin_price end)
      + (max(wt) - max(case when rn = 1 then bin_wt end))
        * (max(case when rn = 2 then bin_price end) - max(case when rn = 1 then bin_price end))
        / (max(case when rn = 2 then bin_wt end) - max(case when rn = 1 then bin_wt end)) as price
  from ranked
  where rn <= 2
  group by yr, kind
  having count(*) = 2
),
hay_weeks as (
  select
    cast(report_begin_date as date) as week,
    sum(wtd_avg_price * quantity) as dollars,
    sum(quantity) as tons
  from supabase_ag_pipeline.raw_mmn_2885_details
  where class = '${inputs.hay_type.value}'
    and quality = 'Good'
    and package = 'Large Square 3x4'
    and price_unit = 'Per Ton'
    and sale_type in ('Trade', 'Contract (Trade)')
    and quantity > 0
    and wtd_avg_price is not null
  group by 1
),
hay as (
  select
    y.yr,
    sum(h.dollars) / sum(h.tons) as hay_price
  from years y
  cross join plan
  join hay_weeks h
    on h.week between make_date(y.yr, plan.m, 15)
      and make_date(y.yr, plan.m, 15) + cast(round(plan.days) as integer)
  group by y.yr
),
joined as (
  select
    s.yr,
    make_date(s.yr, plan.m, 15) + cast(round(plan.days) as integer) as sale_date,
    s.price as start_price,
    e.price as end_price,
    hay.hay_price,
    plan.start_wt,
    plan.end_wt,
    plan.hay_day,
    plan.days
  from prices s
  join prices e on e.yr = s.yr and e.kind = 'sale'
  join hay on hay.yr = s.yr
  cross join plan
  where s.kind = 'start'
)
select
  cast(yr as varchar) as year,
  sale_date,
  start_price,
  end_price,
  hay_price,
  start_price * start_wt / 100 as sell_now,
  end_price * end_wt / 100 as keep_value,
  days * hay_day / 2000 * hay_price as hay_cost,
  end_price * end_wt / 100 - days * hay_day / 2000 * hay_price
    - start_price * start_wt / 100 as extra,
  days,
  days * hay_day / 2000 as hay_tons
from joined
order by yr
```

```sql scenario_compare
-- One table for the whole decision. The dates are shown without a year, since every past year uses
-- the same month and day (2025 is only a stand-in year for the labels). Money and prices are the
-- averages of the past years in scenario_years. Numbers are turned into text by hand (no curly
-- braces, which Evidence would read as page code); the money helper adds the thousands comma.
with params as (
  select
    cast('${inputs.start_month.value}' as integer) as m,
    cast('${inputs.start_wt}' as double) as start_wt,
    cast('${inputs.end_wt}' as double) as end_wt,
    cast('${inputs.adg}' as double) as adg
),
plan as (
  select
    *,
    make_date(2025, m, 15) as start_date,
    cast(round((end_wt - start_wt) / adg) as integer) as days,
    make_date(2025, m, 15) + cast(round((end_wt - start_wt) / adg) as integer) as sale_date
  from params
  where end_wt > start_wt
),
avgs as (
  select
    count(*) as years,
    count(*) filter (where extra > 0) as wins,
    avg(start_price) as start_price,
    avg(end_price) as end_price,
    avg(sell_now) as sell_now,
    avg(keep_value) as keep_value,
    avg(hay_cost) as hay_cost,
    avg(keep_value - hay_cost) as left_after_hay,
    abs(avg(extra)) as extra_size,
    avg(extra) >= 0 as extra_up,
    max(hay_tons) as hay_tons
  from ${scenario_years}
),
t as (
  select * from plan cross join avgs
)
select 1 as ord, 'Steer weight' as item,
  cast(cast(start_wt as integer) as varchar) || ' lb' as sell_now,
  cast(cast(end_wt as integer) as varchar) || ' lb' as sell_heavier, years from t
union all
select 2, 'Date',
  strftime(start_date, '%b %-d'),
  strftime(sale_date, '%b %-d') || ', ' || days || ' days later', years from t
union all
select 3, 'Auction prices averaged over',
  strftime(start_date - 14, '%b %-d') || ' to ' || strftime(start_date + 14, '%b %-d'),
  strftime(sale_date - 14, '%b %-d') || ' to ' || strftime(sale_date + 14, '%b %-d'), years from t
union all
select 4, 'Average price at that weight',
  '$' || printf('%.2f', start_price) || ' per cwt',
  '$' || printf('%.2f', end_price) || ' per cwt', years from t
union all
select 5, 'What the steer brings',
  (case when cast(round(sell_now) as bigint) >= 1000 then '$' || cast(cast(round(sell_now) as bigint) // 1000 as varchar) || ',' || lpad(cast(cast(round(sell_now) as bigint) % 1000 as varchar), 3, '0') else '$' || cast(cast(round(sell_now) as bigint) as varchar) end),
  (case when cast(round(keep_value) as bigint) >= 1000 then '$' || cast(cast(round(keep_value) as bigint) // 1000 as varchar) || ',' || lpad(cast(cast(round(keep_value) as bigint) % 1000 as varchar), 3, '0') else '$' || cast(cast(round(keep_value) as bigint) as varchar) end), years from t
union all
select 6, 'Hay prices averaged over',
  'No hay fed',
  strftime(start_date, '%b %-d') || ' to ' || strftime(sale_date, '%b %-d'), years from t
union all
select 7, 'Hay cost',
  '$0',
  '-' || (case when cast(round(hay_cost) as bigint) >= 1000 then '$' || cast(cast(round(hay_cost) as bigint) // 1000 as varchar) || ',' || lpad(cast(cast(round(hay_cost) as bigint) % 1000 as varchar), 3, '0') else '$' || cast(cast(round(hay_cost) as bigint) as varchar) end) || ' (' || printf('%.2f', hay_tons) || ' tons)', years from t
union all
select 8, 'Left after hay',
  (case when cast(round(sell_now) as bigint) >= 1000 then '$' || cast(cast(round(sell_now) as bigint) // 1000 as varchar) || ',' || lpad(cast(cast(round(sell_now) as bigint) % 1000 as varchar), 3, '0') else '$' || cast(cast(round(sell_now) as bigint) as varchar) end),
  (case when cast(round(left_after_hay) as bigint) >= 1000 then '$' || cast(cast(round(left_after_hay) as bigint) // 1000 as varchar) || ',' || lpad(cast(cast(round(left_after_hay) as bigint) % 1000 as varchar), 3, '0') else '$' || cast(cast(round(left_after_hay) as bigint) as varchar) end), years from t
union all
select 9, 'Feeding adds',
  '',
  case when extra_up then '+' else '-' end || (case when cast(round(extra_size) as bigint) >= 1000 then '$' || cast(cast(round(extra_size) as bigint) // 1000 as varchar) || ',' || lpad(cast(cast(round(extra_size) as bigint) % 1000 as varchar), 3, '0') else '$' || cast(cast(round(extra_size) as bigint) as varchar) end) || ' per head', years from t
order by ord
```
