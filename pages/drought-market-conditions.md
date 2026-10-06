---
title: "Drought & Market Conditions"
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
