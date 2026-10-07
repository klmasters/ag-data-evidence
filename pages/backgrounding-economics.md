---
title: Backgrounding Economics
sidebar_position: 4
---

Backgrounding means buying light calves, feeding them to a heavier weight, and selling them again. The money is in the weight they put on. This page uses Kansas auction prices to measure how much that gain is worth.

The measure is the **value of gain**: what a steer is worth at about 750 lb, minus what it was worth at about 540 lb, divided by the pounds it added. Lighter calves bring more per cwt (hundredweight, 100 lb), so the price drops as they get heavier, but the heavier steer is still worth more in total. The value of gain is what is left after that drop, spread over every pound added.

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

```sql gain_weeks
select week from ${weekly}
```

<DateRange
  name=gain_range
  data={gain_weeks}
  dates=week
  title="Date range"
  presetRanges={['Last 6 Months', 'Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

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

Latest hay report, week of <Value data={latest_hay} column=week fmt='mmm d, yyyy' />

<KMStats>
  <BigValue data={latest_hay} value=price_per_ton fmt='$#,##0' title="Alfalfa hay, $ per ton" />
  <BigValue data={latest_hay} value=hay_cost fmt='$0.00' title="Hay cost per lb of gain" />
  <BigValue data={latest_hay} value=gain_avg fmt='$0.00' title="Value of gain, 4-week avg, $ per lb" />
  <BigValue data={latest_hay} value=left_after_hay fmt='$0.00' title="Left after hay, $ per lb" />
</KMStats>

```sql compare_weeks
select week
from ${weekly}
where week >= date '2020-07-20'
```

<DateRange
  name=compare_range
  data={compare_weeks}
  dates=week
  title="Date range"
  presetRanges={['Last 6 Months', 'Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

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

```sql compare_left
select week, left_after_hay
from ${hay_vs_gain}
where week between '${inputs.compare_range.start}' and '${inputs.compare_range.end}'
order by week
```

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

<DataTable data={yearly_gain} rows=10>
  <Column id=year title="Year" />
  <Column id=light_price title="500-600 lb steers, $ per cwt" fmt='$#,##0' />
  <Column id=price_slide title="Price slide, $ per cwt" fmt='$#,##0' />
  <Column id=value_of_gain title="Value of gain, $ per lb" fmt='$0.00' />
  <Column id=hay_price title="Alfalfa hay, $ per ton" fmt='$#,##0' />
  <Column id=hay_cost title="Hay cost per lb of gain" fmt='$0.00' />
  <Column id=left_after_hay title="Left after hay, $ per lb" fmt='$0.00' />
</DataTable>
