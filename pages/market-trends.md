---
title: Market Trends
---

Weekly Kansas auction prices for feeder cattle, from the USDA Kansas Weekly Cattle Auction Summary (report 1895). Prices are quoted per cwt (hundredweight), which means per 100 pounds of live weight.

<Dropdown name=class defaultValue="Steers" title="Class">
  <DropdownOption value="Steers" />
  <DropdownOption value="Heifers" />
</Dropdown>

```sql weekly
select
  cast(report_begin_date as date) as week,
  class,
  cast(floor(avg_weight / 100) * 100 as integer) as weight_lo,
  concat(
    cast(cast(floor(avg_weight / 100) * 100 as integer) as varchar), '-',
    cast(cast(floor(avg_weight / 100) * 100 as integer) + 100 as varchar), ' lb'
  ) as weight_class,
  sum(head_count) as head,
  sum(avg_price * head_count) / sum(head_count) as avg_price
from supabase_ag_pipeline.raw_mmn_1895
where commodity = 'Feeder Cattle'
  and class in ('Steers', 'Heifers')
  and price_unit = 'Per Cwt'
  and lot_desc = 'None'
  and avg_weight >= 400
  and avg_weight < 800
group by all
having sum(head_count) > 0
```

```sql latest
with picked as (
  select week, weight_class, avg_price
  from ${weekly}
  where class = '${inputs.class.value}' and weight_lo = 500
),
last_week as (select max(week) as week from picked)
select
  cur.week,
  cur.avg_price as price,
  cur.avg_price / prev.avg_price - 1 as wow_change,
  cur.avg_price / yr.avg_price - 1 as yoy_change
from picked cur
join last_week using (week)
left join picked prev on prev.week = cur.week - interval 7 day
left join picked yr on yr.week = cur.week - interval 364 day
```

## Latest week: 500-600 lb {inputs.class.value}

Week of <Value data={latest} column=week fmt='mmm d, yyyy' />

<KMStats>
  <BigValue data={latest} value=price fmt='$#,##0.00' title="Price per cwt (100 lb)" />
  <BigValue data={latest} value=wow_change fmt='+0.0%;-0.0%' title="vs. prior week" />
  <BigValue data={latest} value=yoy_change fmt='+0.0%;-0.0%' title="vs. year ago" />
</KMStats>

## Price by weight class

```sql price_trend
select week, weight_class, avg_price
from ${weekly}
where class = '${inputs.class.value}'
order by week, weight_class
```

<KMLineChart
  data={price_trend}
  x=week
  y=avg_price
  series=weight_class
  yFmt='$#,##0'
  yAxisTitle="$ per cwt (100 lb)"
  colorPalette={['#2f7d3c', '#e8843e', '#3f8fc4', '#8f3d56']}
/>

Prices are head-weighted averages across all auction lines in each weight class, priced per cwt, excluding special lots (fancy, unweaned, thin-fleshed). Lighter calves bring a higher price per cwt, so the lines sit in weight order.

## Seasonal comparison: 500-600 lb {inputs.class.value}

Each line is one year, so you can see whether this year is running ahead of or behind a normal year at the same point in the calendar.

```sql seasonal
select
  -- week_of_year lines the years up: week 1 is Jan 1-7, week 2 is Jan 8-14, and so on.
  cast(floor((dayofyear(week) - 1) / 7) + 1 as integer) as week_of_year,
  cast(year(week) as varchar) as yr,
  min(week) as week,
  avg(avg_price) as avg_price
from ${weekly}
where class = '${inputs.class.value}'
  and weight_lo = 500
  and year(week) >= (select max(year(week)) from ${weekly}) - 4
group by 1, 2
order by yr, week_of_year
```

<KMLineChart
  data={seasonal}
  x=week_of_year
  y=avg_price
  series=yr
  handleMissing=connect
  xFmt='0'
  xAxisTitle="Week of year (1 = first week of January)"
  yFmt='$#,##0'
  yAxisTitle="$ per cwt (100 lb)"
  colorPalette={['#8fb890', '#69a06d', '#458a4d', '#2c6b38', '#17432a']}
/>

## Heifer discount to steers: 500-600 lb

Heifers usually sell for less than steers of the same weight. This is how much less, as a percent of the steer price. A shrinking discount often shows up when producers are keeping heifers back to rebuild the herd. This chart ignores the Class selector above.

```sql heifer_spread
select s.week, 1 - h.avg_price / s.avg_price as heifer_discount
from ${weekly} s
join ${weekly} h on h.week = s.week and h.weight_lo = s.weight_lo
where s.class = 'Steers' and h.class = 'Heifers' and s.weight_lo = 500
order by s.week
```

<KMLineChart
  data={heifer_spread}
  x=week
  y=heifer_discount
  yFmt='0%'
  yAxisTitle="Heifer discount to steers"
  colorPalette={['#2f7d3c']}
/>

## Auction volume: feeder cattle

"Receipts" is the total number of head of feeder cattle sold across the reporting Kansas auctions that week. Slaughter and replacement cattle are reported separately and are not included here.

```sql volume
select
  cast(report_begin_date as date) as week,
  max(receipts) as receipts,
  max(receipts_week_ago) as receipts_week_ago,
  max(receipts_year_ago) as receipts_year_ago
from supabase_ag_pipeline.raw_mmn_1895
where commodity = 'Feeder Cattle' and receipts is not null
group by 1
```

```sql volume_latest
select
  week,
  receipts,
  receipts / nullif(receipts_week_ago, 0) - 1 as wow_change,
  receipts / nullif(receipts_year_ago, 0) - 1 as yoy_change
from ${volume}
order by week desc
limit 1
```

<KMStats>
  <BigValue data={volume_latest} value=receipts fmt='#,##0' title="Head sold, latest week" />
  <BigValue data={volume_latest} value=wow_change fmt='+0.0%;-0.0%' title="vs. prior week" />
  <BigValue data={volume_latest} value=yoy_change fmt='+0.0%;-0.0%' title="vs. same week last year" />
</KMStats>

```sql volume_trend
select week, 'This year' as period, receipts as head_sold
from ${volume}
where week > (select max(week) from ${volume}) - interval 364 day
union all
select week, 'Same week last year' as period, receipts_year_ago as head_sold
from ${volume}
where week > (select max(week) from ${volume}) - interval 364 day
order by week
```

<KMLineChart
  data={volume_trend}
  x=week
  y=head_sold
  series=period
  yAxisTitle="Head sold"
  seriesColors={{ 'This year': '#e8843e', 'Same week last year': '#66c27a' }}
/>

The grey line is the same calendar week one year earlier, as reported by USDA in the same report, so the two lines line up week for week.

## Data table

<DataTable data={price_trend} rows=12 search=true>
  <Column id=week fmt='yyyy-mm-dd' />
  <Column id=weight_class />
  <Column id=avg_price fmt='$#,##0.00' title="$ per cwt (100 lb)" />
</DataTable>
