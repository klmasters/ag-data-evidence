---
title: Backgrounding Economics
sidebar_position: 4
---

Backgrounding means buying light calves, feeding them to a heavier weight, and selling them again. The money is in the weight they put on. This page uses Kansas auction prices to measure how much that gain is worth.

The measure is the **value of gain**: what a steer is worth at about 750 lb, minus what it was worth at about 540 lb, divided by the pounds it added. Lighter calves bring more per cwt (hundredweight, 100 lb), so the price drops as they get heavier, but the heavier steer is still worth more in total. The value of gain is what is left after that drop, spread over every pound added.

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

- **The steer and the price.** Auction prices for steers, from the Kansas weekly auction summary, grouped in 100 lb weight classes. The price for your exact weight is read off a straight line between the two nearest classes, since a 600 lb steer sits between the 500-600 and 600-700 classes. Prices are the average of the four weeks around the date.
- **The dates.** The decision is made in the middle of the month you pick. The sale date is that day plus the days it takes to gain the weight, which is the pounds gained divided by the gain per day you set. Each past year is replayed with its own prices on those two dates.
- **Selling now.** Weight today times the price per cwt for that weight. This is what the steer brings, not profit, because what you paid for it is not included.
- **Selling heavier.** Weight at sale times the price per cwt at that weight on the sale date, minus the hay.
- **The hay.** The hay eaten is the days on feed times the pounds of hay per day you set, which is an assumption and not USDA data. A slower gain means more days, so more hay. It is priced at the average of the hay reports between the two dates, using Good quality large square 3x4 bales of the hay you pick, from the Kansas Direct Hay report. Hay reports start in July 2020, so the first year that can be replayed with a fall start is 2020.
- **What is left out.** Grain, minerals, labor, yardage, vet costs, interest and death loss are not counted. A steer that gains 2 lb a day on hay alone is itself an assumption. Years that are not finished yet, or have no hay reports in the window, are skipped.
- **The past is not a forecast.** Each year is one outcome. The average is only the middle of what has happened.

## Latest week

Week of <Value data={latest} column=week fmt='mmm d, yyyy' />. Steers only, 500-600 lb as the light class and 700-800 lb as the heavy class.

<KMStats>
  <BigValue data={latest} value=light_price fmt='$#,##0.00' title="500-600 lb steers, $ per cwt" />
  <BigValue data={latest} value=heavy_price fmt='$#,##0.00' title="700-800 lb steers, $ per cwt" />
  <BigValue data={latest} value=price_slide fmt='$#,##0.00' title="Price slide, $ per cwt" />
  <BigValue data={latest} value=value_of_gain fmt='$0.00' title="Value of gain, $ per lb" />
</KMStats>

The price slide is the light price minus the heavy price. A single week can swing when few head sold in one of the classes, so the charts below use a 4-week average.

## Value of gain over time

Each point is the average of the last four weekly values, which smooths out the weeks when few head sold.

<DateRange
  name=gain_range
  data={gain_weeks}
  dates=week
  title="Date range"
  presetRanges={['Last 6 Months', 'Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

<KMLineChart
  data={gain_trend}
  x=week
  y=gain_avg
  title="Value of gain, $ per lb (4-week average)"
  yFmt='$0.00'
  yMin=0
  colorPalette={['#2f7d3c']}
/>

## Value of gain and the cost of hay

Hay is sold by the ton and gain is measured in pounds, so the two numbers cannot be compared directly. Two conversions put them in the same units, dollars per pound of gain. A ton is 2,000 lb, so $260 a ton is $0.13 per lb of hay. Then it depends on how much hay a steer eats for each pound it puts on, which is not in the USDA data. The slider sets that assumption. Hay prices start in July 2020.

<Slider
  title="Pounds of hay per pound of gain"
  name=hay_lb
  min=6
  max=16
  step=1
  defaultValue=10
/>

Latest hay report, week of <Value data={latest_hay} column=week fmt='mmm d, yyyy' />

<KMStats>
  <BigValue data={latest_hay} value=price_per_ton fmt='$#,##0' title="Alfalfa hay, $ per ton" />
  <BigValue data={latest_hay} value=hay_cost fmt='$0.00' title="Hay cost per lb of gain" />
  <BigValue data={latest_hay} value=gain_avg fmt='$0.00' title="Value of gain, 4-week avg, $ per lb" />
  <BigValue data={latest_hay} value=left_after_hay fmt='$0.00' title="Left after hay, $ per lb" />
</KMStats>

<DateRange
  name=compare_range
  data={compare_weeks}
  dates=week
  title="Date range"
  presetRanges={['Last 6 Months', 'Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

<KMLineChart
  data={compare_lines}
  x=week
  y=dollars
  series=series
  title="Value of gain and hay cost of that gain, $ per lb of gain"
  yFmt='$0.00'
  yMin=0
  seriesColors={{
    'Value of gain': '#2f7d3c',
    'Hay cost of that gain': '#e8843e'
  }}
  chartAreaHeight={180}
  connectGroup="gain_hay"
/>

<KMLineChart
  data={compare_left}
  x=week
  y=left_after_hay
  title="Left after hay, $ per lb of gain"
  yFmt='$0.00'
  colorPalette={['#3f8fc4']}
  chartAreaHeight={150}
  connectGroup="gain_hay"
/>

The value of gain comes from auction prices. The hay cost is the hay price per pound times the slider's pounds of hay per pound of gain, and that slider value is an assumption, not USDA data. Hay is only one feed cost. Grain, minerals, labor, yardage, interest and death loss are all left out, so "left after hay" is not profit.

## Year by year

Yearly averages of the weekly figures. The cattle columns cover every week since April 2019. The hay columns cover the hay reports, which start in July 2020, so 2019 has no hay figures and 2020 covers only part of the year. The hay cost and "left after hay" columns follow the slider above. 2026 ends in September.

<DataTable data={yearly_gain} rows=10>
  <Column id=year title="Year" />
  <Column id=light_price title="500-600 lb steers, $ per cwt" fmt='$#,##0' />
  <Column id=price_slide title="Price slide, $ per cwt" fmt='$#,##0' />
  <Column id=value_of_gain title="Value of gain, $ per lb" fmt='$0.00' />
  <Column id=hay_price title="Alfalfa hay, $ per ton" fmt='$#,##0' />
  <Column id=hay_cost title="Hay cost per lb of gain" fmt='$0.00' />
  <Column id=left_after_hay title="Left after hay, $ per lb" fmt='$0.00' />
</DataTable>

<!-- Queries: kept at the bottom so the page layout reads top to bottom. -->

```sql weekly
with w as (
  select
    cast(report_begin_date as date) as week,
    cast(floor(avg_weight / 100) * 100 as integer) as weight_lo,
    sum(head_count) as head,
    sum(avg_weight * head_count) / sum(head_count) as avg_wt,
    sum(avg_price * head_count) / sum(head_count) as avg_price
  from supabase_ag_pipeline.raw_mmn_1895
  where commodity = 'Feeder Cattle'
    and class = 'Steers'
    and price_unit = 'Per Cwt'
    and lot_desc = 'None'
    and avg_weight >= 500
    and avg_weight < 800
    and head_count > 0
  group by 1, 2
)
select
  light.week,
  light.head as light_head,
  heavy.head as heavy_head,
  light.avg_wt as light_wt,
  heavy.avg_wt as heavy_wt,
  light.avg_price as light_price,
  heavy.avg_price as heavy_price,
  light.avg_price - heavy.avg_price as price_slide,
  (heavy.avg_price * heavy.avg_wt - light.avg_price * light.avg_wt) / 100
    / (heavy.avg_wt - light.avg_wt) as value_of_gain
from w light
join w heavy on heavy.week = light.week
where light.weight_lo = 500 and heavy.weight_lo = 700
```

```sql latest
select *
from ${weekly}
order by week desc
limit 1
```

```sql gain_weeks
select week from ${weekly}
```

```sql gain_trend
with averaged as (
  select
    week,
    avg(value_of_gain) over (order by week rows between 3 preceding and current row) as gain_avg
  from ${weekly}
)
select week, gain_avg
from averaged
where week between '${inputs.gain_range.start}' and '${inputs.gain_range.end}'
order by week
```

```sql hay_vs_gain
-- One row per hay report. Each is matched to the latest cattle week on or before it: cattle weeks
-- start on Sundays and hay weeks on Mondays, so this pairs a hay report with the cattle week
-- just before it. The 4-week average is taken first, over the whole history.
with avg_gain as (
  select
    week,
    avg(value_of_gain) over (order by week rows between 3 preceding and current row) as gain_avg
  from ${weekly}
),
hay as (
  select
    cast(report_begin_date as date) as week,
    sum(wtd_avg_price * quantity) / sum(quantity) as price_per_ton
  from supabase_ag_pipeline.raw_mmn_2885_details
  where class = 'Alfalfa'
    and quality = 'Good'
    and package = 'Large Square 3x4'
    and price_unit = 'Per Ton'
    and sale_type in ('Trade', 'Contract (Trade)')
    and quantity > 0
    and wtd_avg_price is not null
  group by 1
),
assumption as (select cast('${inputs.hay_lb}' as double) as hay_lb)
select
  hay.week,
  hay.price_per_ton,
  hay.price_per_ton / 2000 * assumption.hay_lb as hay_cost,
  avg_gain.gain_avg,
  avg_gain.gain_avg - hay.price_per_ton / 2000 * assumption.hay_lb as left_after_hay
from hay
cross join assumption
asof join avg_gain on avg_gain.week <= hay.week
order by hay.week
```

```sql latest_hay
select * from ${hay_vs_gain} order by week desc limit 1
```

```sql compare_weeks
select week
from ${weekly}
where week >= date '2020-07-20'
```

```sql compare_lines
select week, 'Value of gain' as series, gain_avg as dollars
from ${hay_vs_gain}
where week between '${inputs.compare_range.start}' and '${inputs.compare_range.end}'
union all
select week, 'Hay cost of that gain' as series, hay_cost as dollars
from ${hay_vs_gain}
where week between '${inputs.compare_range.start}' and '${inputs.compare_range.end}'
order by week
```

```sql compare_left
select week, left_after_hay
from ${hay_vs_gain}
where week between '${inputs.compare_range.start}' and '${inputs.compare_range.end}'
order by week
```

```sql yearly_gain
with cattle as (
  select
    year(week) as yr,
    avg(light_price) as light_price,
    avg(price_slide) as price_slide,
    avg(value_of_gain) as value_of_gain
  from ${weekly}
  group by 1
),
hay as (
  select
    year(week) as yr,
    avg(price_per_ton) as hay_price,
    avg(hay_cost) as hay_cost,
    avg(left_after_hay) as left_after_hay
  from ${hay_vs_gain}
  group by 1
)
select
  cast(cattle.yr as varchar) as year,
  cattle.light_price,
  cattle.price_slide,
  cattle.value_of_gain,
  hay.hay_price,
  hay.hay_cost,
  hay.left_after_hay
from cattle
left join hay using (yr)
order by cattle.yr
```

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
