---
title: "Drought & Market Conditions"
sidebar_position: 3
---

How dry Kansas is, from the U.S. Drought Monitor, and how drought lines up with hay prices, cattle prices, and auction volume.

The Drought Monitor maps every part of Kansas from "abnormally dry" (D0) up to "exceptional drought" (D4). Each number below is the share of the state at that level **or worse**.

```sql drought_latest
with d as (
  select cast(map_date as date) as week, d1_pct, d2_pct
  from supabase_ag_pipeline.raw_usdm_kansas
),
newest as (select max(week) as week from d)
select
  cur.week,
  cur.d1_pct / 100 as in_drought,
  cur.d2_pct / 100 as severe_drought,
  cur.d1_pct - yr.d1_pct as in_drought_vs_year_ago
from d cur
join newest using (week)
left join d yr on yr.week = cur.week - interval 364 day
```

## Kansas drought right now

Week of <Value data={drought_latest} column=week fmt='mmm d, yyyy' />

<KMStats>
  <BigValue data={drought_latest} value=in_drought fmt='0.0%' title="In drought (D1 or worse)" />
  <BigValue data={drought_latest} value=severe_drought fmt='0.0%' title="Severe drought (D2 or worse)" />
  <BigValue data={drought_latest} value=in_drought_vs_year_ago fmt='+0.0" pts";-0.0" pts"' title="In drought vs. year ago" />
</KMStats>

## Drought since 2000

Each band is the share of Kansas at one drought level, from abnormally dry (D0) up to exceptional drought (D4). Major droughts show up as tall, dark bands, like 2011 to 2013 and 2022 to 2023.

```sql drought_weeks
select cast(map_date as date) as week
from supabase_ag_pipeline.raw_usdm_kansas
```

<DateRange
  name=drought_range
  data={drought_weeks}
  dates=week
  title="Date range"
  presetRanges={['Last 6 Months', 'Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

```sql drought_bands
with d as (
  select cast(map_date as date) as week, d0_pct, d1_pct, d2_pct, d3_pct, d4_pct
  from supabase_ag_pipeline.raw_usdm_kansas
  where cast(map_date as date) between '${inputs.drought_range.start}' and '${inputs.drought_range.end}'
)
select week, 'D0 Abnormally dry' as level, (d0_pct - d1_pct) / 100 as share from d
union all select week, 'D1 Moderate drought', (d1_pct - d2_pct) / 100 from d
union all select week, 'D2 Severe drought', (d2_pct - d3_pct) / 100 from d
union all select week, 'D3 Extreme drought', (d3_pct - d4_pct) / 100 from d
union all select week, 'D4 Exceptional drought', d4_pct / 100 from d
order by week
```

<KMAreaChart
  data={drought_bands}
  x=week
  y=share
  series=level
  seriesOrder={['D4 Exceptional drought', 'D3 Extreme drought', 'D2 Severe drought', 'D1 Moderate drought', 'D0 Abnormally dry']}
  seriesColors={{
    'D0 Abnormally dry': '#FFFF00',
    'D1 Moderate drought': '#FCD37F',
    'D2 Severe drought': '#FFAA00',
    'D3 Extreme drought': '#E60000',
    'D4 Exceptional drought': '#730000'
  }}
  echartsOptions={{ series: [{ name: 'D0 Abnormally dry', lineStyle: { color: '#9a8600', width: 1 } }] }}
  yFmt='0%'
  yMax=1
  yAxisTitle="Share of Kansas"
/>

## Drought next to the markets

Drought is only one of many things that move cattle and hay markets. These charts share a time axis so you can compare them, but a pattern across charts is not proof of cause. Hay prices start in July 2020.

```sql market_weeks
select week
from ${drought_weeks}
where week >= date '2020-07-20'
```

<DateRange
  name=market_range
  data={market_weeks}
  dates=week
  title="Date range"
  presetRanges={['Last 6 Months', 'Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

```sql severe_drought
select
  cast(map_date as date) as week,
  d2_pct / 100 as severe_share
from supabase_ag_pipeline.raw_usdm_kansas
where cast(map_date as date) between '${inputs.market_range.start}' and '${inputs.market_range.end}'
order by week
```

<KMLineChart
  data={severe_drought}
  x=week
  y=severe_share
  title="Share of Kansas in severe drought (D2 or worse)"
  yFmt='0%'
  yMin=0
  yMax=1
  colorPalette={['#d97706']}
  chartAreaHeight={150}
  connectGroup="markets"
/>

```sql hay_price
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
  and cast(report_begin_date as date) between '${inputs.market_range.start}' and '${inputs.market_range.end}'
group by 1
order by 1
```

<KMLineChart
  data={hay_price}
  x=week
  y=price
  title="Alfalfa hay price, $ per ton (Good quality, large square bales)"
  yFmt='$#,##0'
  colorPalette={['#2f7d3c']}
  chartAreaHeight={150}
  connectGroup="markets"
/>

```sql steer_price
select
  cast(report_begin_date as date) as week,
  sum(avg_price * head_count) / sum(head_count) as price
from supabase_ag_pipeline.raw_mmn_1895
where commodity = 'Feeder Cattle'
  and class = 'Steers'
  and price_unit = 'Per Cwt'
  and lot_desc = 'None'
  and avg_weight >= 500
  and avg_weight < 600
  and cast(report_begin_date as date) between '${inputs.market_range.start}' and '${inputs.market_range.end}'
group by 1
having sum(head_count) > 0
order by 1
```

<KMLineChart
  data={steer_price}
  x=week
  y=price
  title="500-600 lb steer price, $ per cwt (100 lb)"
  yFmt='$#,##0'
  colorPalette={['#3f8fc4']}
  chartAreaHeight={150}
  connectGroup="markets"
/>

```sql auction_volume
-- The average is taken over the whole history first and filtered to the date range afterwards,
-- so the first weeks of a chosen range still average a full eight weeks.
with weekly as (
  select cast(report_begin_date as date) as week, max(receipts) as head_sold
  from supabase_ag_pipeline.raw_mmn_1895
  where commodity = 'Feeder Cattle' and receipts is not null
  group by 1
),
smoothed as (
  select week, avg(head_sold) over (order by week rows between 7 preceding and current row) as head_avg
  from weekly
)
select week, head_avg
from smoothed
where week between '${inputs.market_range.start}' and '${inputs.market_range.end}'
order by week
```

<KMLineChart
  data={auction_volume}
  x=week
  y=head_avg
  title="Feeder cattle sold at Kansas auctions, head per week (8-week average)"
  yFmt='#,##0'
  colorPalette={['#8f3d56']}
  chartAreaHeight={150}
  connectGroup="markets"
/>

## Year by year

Yearly averages of the measures above. Prices and volume are averages of the weekly figures. 2020 starts in July and 2026 ends in September, so those two years cover fewer weeks.

```sql yearly_summary
with drought as (
  select
    year(cast(map_date as date)) as yr,
    avg(d1_pct) / 100 as in_drought,
    avg(d2_pct) / 100 as severe_drought
  from supabase_ag_pipeline.raw_usdm_kansas
  where cast(map_date as date) >= date '2020-07-20'
  group by 1
),
hay_weekly as (
  select
    cast(report_begin_date as date) as week,
    sum(wtd_avg_price * quantity) / sum(quantity) as price
  from supabase_ag_pipeline.raw_mmn_2885_details
  where class = 'Alfalfa' and quality = 'Good' and package = 'Large Square 3x4'
    and price_unit = 'Per Ton' and sale_type in ('Trade', 'Contract (Trade)')
    and quantity > 0 and wtd_avg_price is not null
  group by 1
),
hay as (
  select year(week) as yr, avg(price) as hay_price from hay_weekly where week >= date '2020-07-20' group by 1
),
steer_weekly as (
  select
    cast(report_begin_date as date) as week,
    sum(avg_price * head_count) / sum(head_count) as price
  from supabase_ag_pipeline.raw_mmn_1895
  where commodity = 'Feeder Cattle' and class = 'Steers' and price_unit = 'Per Cwt'
    and lot_desc = 'None' and avg_weight >= 500 and avg_weight < 600
  group by 1
  having sum(head_count) > 0
),
steer as (
  select year(week) as yr, avg(price) as steer_price from steer_weekly where week >= date '2020-07-20' group by 1
),
volume_weekly as (
  select cast(report_begin_date as date) as week, max(receipts) as head_sold
  from supabase_ag_pipeline.raw_mmn_1895
  where commodity = 'Feeder Cattle' and receipts is not null
  group by 1
),
volume as (
  select year(week) as yr, avg(head_sold) as head_per_week from volume_weekly where week >= date '2020-07-20' group by 1
)
select
  cast(drought.yr as varchar) as year,
  drought.in_drought,
  drought.severe_drought,
  hay.hay_price,
  steer.steer_price,
  volume.head_per_week
from drought
left join hay using (yr)
left join steer using (yr)
left join volume using (yr)
order by drought.yr
```

<DataTable data={yearly_summary} rows=10>
  <Column id=year title="Year" />
  <Column id=in_drought title="In drought (D1+)" fmt='0%' />
  <Column id=severe_drought title="Severe drought (D2+)" fmt='0%' />
  <Column id=hay_price title="Alfalfa hay, $ per ton" fmt='$#,##0' />
  <Column id=steer_price title="500-600 lb steers, $ per cwt" fmt='$#,##0' />
  <Column id=head_per_week title="Feeder cattle sold, head per week" fmt='#,##0' />
</DataTable>
