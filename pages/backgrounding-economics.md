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
