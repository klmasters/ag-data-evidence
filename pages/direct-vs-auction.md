---
title: Direct vs. Auction
sidebar_position: 5
---

Feeder cattle in Kansas are sold two main ways. At an **auction**, cattle are sold one lot at a time in a sale barn ring, and USDA summarizes each week's sales. In a **direct** sale, a seller and a buyer agree on a price without an auction, and USDA reports those sales separately. This page compares the two prices for the same kind of cattle.

The auction numbers come from the Kansas Weekly Cattle Auction Summary (report 1895) and the direct numbers from the Kansas Direct Cattle report (3097). Prices are per cwt (hundredweight, 100 lb). To keep the comparison fair, both sides use the same rules: head-weighted averages, no special lots (fancy, unweaned, fleshy and so on), and cattle grouped by their average weight. Direct sales are also limited to cash sales for current delivery, since a price for cattle delivered months from now is not comparable to today's auction price.

<Dropdown name=class defaultValue="Steers" title="Class">
  <DropdownOption value="Steers" />
  <DropdownOption value="Heifers" />
</Dropdown>

<Dropdown name=weight_lo defaultValue="800" title="Weight class">
  <DropdownOption value="600" valueLabel="600-700 lb" />
  <DropdownOption value="700" valueLabel="700-800 lb" />
  <DropdownOption value="800" valueLabel="800-900 lb" />
  <DropdownOption value="900" valueLabel="900-1,000 lb" />
</Dropdown>

```sql weekly
-- Auction weeks start on a Sunday (a Friday in the early years) and direct weeks on a Monday.
-- Each direct week is paired with the auction week that began in the seven days up to it.
-- "week" is the auction week's start date. Only weeks with both kinds of sale are kept.
with auction as (
  select
    cast(report_begin_date as date) as week,
    class,
    cast(floor(avg_weight / 100) * 100 as integer) as weight_lo,
    sum(head_count) as head,
    sum(avg_price * head_count) / sum(head_count) as price
  from supabase_ag_pipeline.raw_mmn_1895
  where commodity = 'Feeder Cattle'
    and class in ('Steers', 'Heifers')
    and price_unit = 'Per Cwt'
    and lot_desc = 'None'
    and avg_weight >= 600
    and avg_weight < 1000
    and head_count > 0
  group by 1, 2, 3
),
direct as (
  select
    cast(report_begin_date as date) as week,
    class,
    cast(floor(wtd_avg_wt / 100) * 100 as integer) as weight_lo,
    sum(head_count) as head,
    sum(wtd_avg_price * head_count) / sum(head_count) as price
  from supabase_ag_pipeline.raw_mmn_3097_details
  where commodity = 'Feeder Cattle'
    and class in ('Steers', 'Heifers')
    and price_unit = 'Per Cwt'
    and lot_desc = 'None'
    and purchase_type = 'Cash'
    and delivery_month = 'Current'
    and wtd_avg_wt >= 600
    and wtd_avg_wt < 1000
    and head_count > 0
  group by 1, 2, 3
)
select
  auction.week,
  auction.class,
  auction.weight_lo,
  auction.price as auction_price,
  auction.head as auction_head,
  direct.price as direct_price,
  direct.head as direct_head,
  direct.price - auction.price as difference
from auction
join direct
  on direct.class = auction.class
  and direct.weight_lo = auction.weight_lo
  and direct.week between auction.week and auction.week + interval 6 day
```

```sql latest
select *
from ${weekly}
where class = '${inputs.class.value}'
  and weight_lo = ${inputs.weight_lo.value}
order by week desc
limit 1
```

## Latest week

Auction week of <Value data={latest} column=week fmt='mmm d, yyyy' />, the most recent week with both kinds of sale in this class and weight.

<KMStats>
  <BigValue data={latest} value=auction_price fmt='$#,##0.00' title="Auction, $ per cwt" />
  <BigValue data={latest} value=direct_price fmt='$#,##0.00' title="Direct, $ per cwt" />
  <BigValue data={latest} value=difference fmt='+$#,##0.00;-$#,##0.00' title="Direct minus auction" />
</KMStats>

<KMStats>
  <BigValue data={latest} value=auction_head fmt='#,##0' title="Head sold at auction" />
  <BigValue data={latest} value=direct_head fmt='#,##0' title="Head sold direct" />
</KMStats>
