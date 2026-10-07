---
title: Overview
sidebar_position: 1
---

This site follows the Kansas cattle market alongside the things that move it: the price of hay and how dry the state is. The data is public. The cattle and hay numbers come from USDA Market News reports, and the drought numbers come from the U.S. Drought Monitor. A set of scripts loads each source into a database every week, and this site is rebuilt from that database.

Each source reports on its own schedule, so the dates below do not always match. Hay usually runs about a week behind cattle.

```sql steer_latest
with weekly as (
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
  group by 1
  having sum(head_count) > 0
),
newest as (select max(week) as week from weekly)
select
  cur.week,
  cur.price,
  cur.price / prev.price - 1 as wow_change
from weekly cur
join newest using (week)
left join weekly prev on prev.week = cur.week - interval 7 day
```

## Feeder cattle prices

Kansas auction prices, from the weekly auction summary. Week of <Value data={steer_latest} column=week fmt='mmm d, yyyy' />

<KMStats>
  <BigValue data={steer_latest} value=price fmt='$#,##0.00' title="500-600 lb steers, $ per cwt" />
  <BigValue data={steer_latest} value=wow_change fmt='+0.0%;-0.0%' title="vs. prior week" />
</KMStats>

[See the full price history on Market Trends](/market-trends)

```sql direct_latest
-- Same rules as the Direct vs. Auction page. Each direct week (a Monday) is paired with the
-- auction week that began in the seven days up to it.
with auction as (
  select
    cast(report_begin_date as date) as week,
    sum(avg_price * head_count) / sum(head_count) as price
  from supabase_ag_pipeline.raw_mmn_1895
  where commodity = 'Feeder Cattle'
    and class = 'Steers'
    and price_unit = 'Per Cwt'
    and lot_desc = 'None'
    and avg_weight >= 800
    and avg_weight < 900
    and head_count > 0
  group by 1
),
direct as (
  select
    cast(report_begin_date as date) as week,
    sum(wtd_avg_price * head_count) / sum(head_count) as price
  from supabase_ag_pipeline.raw_mmn_3097_details
  where commodity = 'Feeder Cattle'
    and class = 'Steers'
    and price_unit = 'Per Cwt'
    and lot_desc = 'None'
    and purchase_type = 'Cash'
    and delivery_month = 'Current'
    and wtd_avg_wt >= 800
    and wtd_avg_wt < 900
    and head_count > 0
  group by 1
)
select
  auction.week,
  auction.price as auction_price,
  direct.price as direct_price,
  direct.price - auction.price as difference
from auction
join direct on direct.week between auction.week and auction.week + interval 6 day
order by auction.week desc
limit 1
```

## Direct cattle sales

Cattle sold directly, without an auction, from the Kansas Direct Cattle report. The comparison is for 800-900 lb steers, where the two kinds of sale overlap most. Auction week of <Value data={direct_latest} column=week fmt='mmm d, yyyy' />

<KMStats>
  <BigValue data={direct_latest} value=auction_price fmt='$#,##0.00' title="Auction, $ per cwt" />
  <BigValue data={direct_latest} value=direct_price fmt='$#,##0.00' title="Direct, $ per cwt" />
  <BigValue data={direct_latest} value=difference fmt='+$#,##0.00;-$#,##0.00' title="Direct minus auction" />
</KMStats>

[Compare direct and auction prices by class and weight](/direct-vs-auction)

```sql hay_latest
with weekly as (
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
  group by 1
),
ordered as (
  select week, price, lag(price) over (order by week) as prev_price
  from weekly
)
select week, price, price / prev_price - 1 as change
from ordered
order by week desc
limit 1
```

## Hay prices

Kansas direct hay sales. Hay is reported weekly or every other week, so the comparison is to the previous report. Week of <Value data={hay_latest} column=week fmt='mmm d, yyyy' />

<KMStats>
  <BigValue data={hay_latest} value=price fmt='$#,##0' title="Alfalfa, Good, $ per ton" />
  <BigValue data={hay_latest} value=change fmt='+0.0%;-0.0%' title="vs. previous report" />
</KMStats>

[See what hay costs against the value of weight gain on Backgrounding Economics](/backgrounding-economics)

```sql drought_latest
with d as (
  select cast(map_date as date) as week, d1_pct
  from supabase_ag_pipeline.raw_usdm_kansas
),
newest as (select max(week) as week from d)
select
  cur.week,
  cur.d1_pct / 100 as in_drought,
  cur.d1_pct - yr.d1_pct as vs_year_ago
from d cur
join newest using (week)
left join d yr on yr.week = cur.week - interval 364 day
```

## Drought

The share of Kansas in moderate drought or worse. Week of <Value data={drought_latest} column=week fmt='mmm d, yyyy' />

<KMStats>
  <BigValue data={drought_latest} value=in_drought fmt='0.0%' title="In drought (D1 or worse)" />
  <BigValue data={drought_latest} value=vs_year_ago fmt='+0.0" pts";-0.0" pts"' title="vs. year ago" />
</KMStats>

[See how drought lines up with hay and cattle prices](/drought-market-conditions)
