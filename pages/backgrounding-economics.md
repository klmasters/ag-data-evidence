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

## Value of gain next to hay prices

Hay is a feed cost, so one thing to look for is whether gain gets more or less valuable when hay moves. These two charts share a time axis and a date range, but a pattern across them is not proof of cause. Hay prices start in July 2020.

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

```sql compare_gain
-- The average is taken over the whole history first and filtered to the date range afterwards,
-- so the first weeks of a chosen range still average a full four weeks.
with averaged as (
  select
    week,
    avg(value_of_gain) over (order by week rows between 3 preceding and current row) as gain_avg
  from ${weekly}
)
select week, gain_avg
from averaged
where week between '${inputs.compare_range.start}' and '${inputs.compare_range.end}'
order by week
```

<KMLineChart
  data={compare_gain}
  x=week
  y=gain_avg
  title="Value of gain, $ per lb (4-week average)"
  yFmt='$0.00'
  yMin=0
  colorPalette={['#2f7d3c']}
  chartAreaHeight={150}
  connectGroup="gain_hay"
/>

```sql compare_hay
select
  cast(report_begin_date as date) as week,
  sum(wtd_avg_price * quantity) / sum(quantity) as price
from supabase_ag_pipeline.raw_mmn_2885_details
where class = 'Alfalfa'
  and quality = 'Good'
  and package = 'Large Square 3x4'
  and price_unit = 'Per Ton'
  and sale_type in ('Trade', 'Contract (Trade)')
  and quantity > 0
  and wtd_avg_price is not null
  and cast(report_begin_date as date) between '${inputs.compare_range.start}' and '${inputs.compare_range.end}'
group by 1
order by 1
```

<KMLineChart
  data={compare_hay}
  x=week
  y=price
  title="Alfalfa hay price, $ per ton (Good quality, large square bales)"
  yFmt='$#,##0'
  colorPalette={['#e8843e']}
  chartAreaHeight={150}
  connectGroup="gain_hay"
/>
