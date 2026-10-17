---
title: Hay Market
sidebar_position: 3
---

Hay is the biggest feed cost for a cow herd or a set of backgrounded calves, and Kansas sells several kinds of it. This page looks at how the price changes with three things: **hay type** (alfalfa, brome grass, bluestem grass, or wheat straw), **package** (how the hay is baled, such as large round bales or 3x4 large squares) and **quality** (the USDA grade, from Fair up to Supreme).

The numbers come from the [Kansas Direct Hay report (USDA Market News report 2885)](https://mymarketnews.ams.usda.gov/viewReport/2885). Prices are dollars per ton. Only actual trades are used, so asking and offering prices, which come with no tons sold, are left out. Every average is weighted by tons sold, so a big sale counts for more than a small one. Hay pellets are left out because they are a processed feed that sells for a very different price.

## Price by hay type

<Dropdown name=type_package defaultValue="Large Round" title="Package">
  <DropdownOption value="Large Round" />
  <DropdownOption value="Large Square 3x4" />
</Dropdown>

USDA lists straw bales as "Round" and "Large Square", so those are counted here as large round and large square. Each type's price mixes every quality grade reported for it. Alfalfa is mostly graded Fair/Good, and the grass hays are mostly graded Good, so the lines are not graded alike.

Week of <Value data={type_latest} column=week fmt='mmm d, yyyy' />, the most recent report. Change is from each type's previous report.

<KMStats>
  <BigValue data={type_latest} value=alfalfa fmt='$#,##0' title="Alfalfa, $ per ton" comparison=alfalfa_change comparisonFmt='+0.0%;-0.0%' comparisonTitle="vs. previous report" />
  <BigValue data={type_latest} value=brome fmt='$#,##0' title="Brome grass, $ per ton" comparison=brome_change comparisonFmt='+0.0%;-0.0%' comparisonTitle="vs. previous report" />
  <BigValue data={type_latest} value=bluestem fmt='$#,##0' title="Bluestem grass, $ per ton" comparison=bluestem_change comparisonFmt='+0.0%;-0.0%' comparisonTitle="vs. previous report" />
  <BigValue data={type_latest} value=straw fmt='$#,##0' title="Wheat straw, $ per ton" comparison=straw_change comparisonFmt='+0.0%;-0.0%' comparisonTitle="vs. previous report" />
</KMStats>

<DateRange
  name=type_range
  data={type_weeks}
  dates=week
  title="Date range"
  presetRanges={['Last 6 Months', 'Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

<KMLineChart
  data={type_lines}
  x=week
  y=price
  series=hay_type
  title="Price by hay type, $ per ton"
  yFmt='$#,##0'
  seriesColors={{
    'Alfalfa': '#2f7d3c',
    'Brome Grass': '#e8843e',
    'Bluestem Grass': '#3f8fc4',
    'Wheat Straw': '#8f3d56'
  }}
  chartAreaHeight={240}
/>

### Year by year

Yearly averages, weighted by tons sold, for the package chosen above. 2020 starts in July and 2026 ends in September.

<DataTable data={type_yearly} rows=10>
  <Column id=year title="Year" />
  <Column id=alfalfa title="Alfalfa" fmt='$#,##0' />
  <Column id=brome title="Brome grass" fmt='$#,##0' />
  <Column id=bluestem title="Bluestem grass" fmt='$#,##0' />
  <Column id=straw title="Wheat straw" fmt='$#,##0' />
</DataTable>

## Price by package

The same hay sells in different bales, and the package changes the price. Pick a hay type to see its four most traded packages. Ground hay is chopped in a tub grinder before it is sold, so it is only reported for alfalfa. Packages with trades in fewer than 150 weeks are left out because their lines would be mostly gaps.

<Dropdown name=pkg_type defaultValue="Alfalfa" title="Hay type">
  <DropdownOption value="Alfalfa" />
  <DropdownOption value="Bluestem Grass" />
  <DropdownOption value="Brome Grass" />
</Dropdown>

<Dropdown name=pkg_quality defaultValue="All" title="Quality">
  <DropdownOption value="All" valueLabel="All qualities" />
  <DropdownOption value="Fair/Good" />
  <DropdownOption value="Good" />
</Dropdown>

Choosing one quality makes the packages comparable, because a package that is mostly sold at a higher grade will otherwise look more expensive for that reason alone. Fair/Good and Good are the two grades that most packages have in most weeks.

<DateRange
  name=pkg_range
  data={pkg_weeks}
  dates=week
  title="Date range"
  presetRanges={['Last 6 Months', 'Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

<KMLineChart
  data={pkg_lines}
  x=week
  y=price
  series=package
  title="Price by package, $ per ton"
  yFmt='$#,##0'
  seriesColors={{
    'Large Round': '#2f7d3c',
    'Large Square 3x4': '#e8843e',
    'Large Square 4x4': '#3f8fc4',
    'Ground': '#8f3d56',
    'Small Square': '#8f3d56'
  }}
  chartAreaHeight={240}
/>

## Price by quality

USDA grades hay by feeding value, which is mostly protein for alfalfa. The grades used here, from lowest to highest, are Fair, Fair/Good, Good, Good/Premium, Premium, Premium/Supreme and Supreme. To keep the lines from having many gaps, they are grouped into three: **Fair to Fair/Good**, **Good to Good/Premium**, and **Premium to Supreme**. Each point is a month, because the top grades are not traded every week.

This section is alfalfa only, since the grass hays are almost all graded Good.

<Dropdown name=qual_package defaultValue="Large Square 3x4" title="Package">
  <DropdownOption value="Large Square 3x4" />
  <DropdownOption value="Large Square 4x4" />
</Dropdown>

<DateRange
  name=qual_range
  data={qual_months}
  dates=month
  title="Date range"
  presetRanges={['Last 12 Months', 'Year to Date', 'Last Year', 'All Time']}
  defaultValue="All Time"
/>

<KMLineChart
  data={qual_lines}
  x=month
  y=price
  series=quality_group
  title="Alfalfa price by quality, $ per ton (monthly)"
  yFmt='$#,##0'
  seriesColors={{
    'Premium to Supreme': '#2f7d3c',
    'Good to Good/Premium': '#e8843e',
    'Fair to Fair/Good': '#3f8fc4'
  }}
  chartAreaHeight={240}
  connectGroup="hay_quality"
/>

<KMLineChart
  data={qual_premium}
  x=month
  y=premium
  title="Premium to Supreme over Fair to Fair/Good, $ per ton"
  yFmt='$#,##0'
  colorPalette={['#2f7d3c']}
  chartAreaHeight={150}
  connectGroup="hay_quality"
/>

### Year by year

<DataTable data={qual_yearly} rows=10>
  <Column id=year title="Year" />
  <Column id=top title="Premium to Supreme" fmt='$#,##0' />
  <Column id=mid title="Good to Good/Premium" fmt='$#,##0' />
  <Column id=low title="Fair to Fair/Good" fmt='$#,##0' />
  <Column id=premium title="Premium over Fair" fmt='$#,##0' />
</DataTable>

<!-- Queries: kept at the bottom so the page layout reads top to bottom. -->

```sql hay_base
-- One row per hay sale line, for the four hay types on this page. Only real trades with tons sold.
-- Pellets are left out. The straw report calls its bales "Round" and "Large Square"; they are
-- renamed so they line up with the hay packages.
select
  cast(report_begin_date as date) as week,
  case
    when commodity = 'Straw' and class = 'Wheat' then 'Wheat Straw'
    when commodity = 'Hay' and class in ('Alfalfa', 'Brome Grass', 'Bluestem Grass') then class
  end as hay_type,
  case
    when commodity = 'Straw' and package = 'Round' then 'Large Round'
    when commodity = 'Straw' and package = 'Large Square' then 'Large Square 3x4'
    else package
  end as package,
  quality,
  quantity,
  wtd_avg_price
from supabase_ag_pipeline.raw_mmn_2885_details
where price_unit = 'Per Ton'
  and sale_type in ('Trade', 'Contract (Trade)')
  and quantity > 0
  and package not like 'Pellets%'
```

```sql type_weekly
select
  week,
  hay_type,
  sum(wtd_avg_price * quantity) / sum(quantity) as price,
  sum(quantity) as tons
from ${hay_base}
where hay_type is not null
  and package = '${inputs.type_package.value}'
group by 1, 2
```

```sql type_latest
-- One row with each type's latest price and its change from the previous report.
with ranked as (
  select
    hay_type,
    week,
    price,
    price / lag(price) over (partition by hay_type order by week) - 1 as change,
    row_number() over (partition by hay_type order by week desc) as rn
  from ${type_weekly}
)
select
  max(week) as week,
  max(case when hay_type = 'Alfalfa' then price end) as alfalfa,
  max(case when hay_type = 'Alfalfa' then change end) as alfalfa_change,
  max(case when hay_type = 'Brome Grass' then price end) as brome,
  max(case when hay_type = 'Brome Grass' then change end) as brome_change,
  max(case when hay_type = 'Bluestem Grass' then price end) as bluestem,
  max(case when hay_type = 'Bluestem Grass' then change end) as bluestem_change,
  max(case when hay_type = 'Wheat Straw' then price end) as straw,
  max(case when hay_type = 'Wheat Straw' then change end) as straw_change
from ranked
where rn = 1
```

```sql type_weeks
select distinct week from ${type_weekly}
```

```sql type_lines
select week, hay_type, price
from ${type_weekly}
where week between '${inputs.type_range.start}' and '${inputs.type_range.end}'
order by week
```

```sql type_yearly
select
  cast(year(week) as varchar) as year,
  sum(case when hay_type = 'Alfalfa' then price * tons end)
    / sum(case when hay_type = 'Alfalfa' then tons end) as alfalfa,
  sum(case when hay_type = 'Brome Grass' then price * tons end)
    / sum(case when hay_type = 'Brome Grass' then tons end) as brome,
  sum(case when hay_type = 'Bluestem Grass' then price * tons end)
    / sum(case when hay_type = 'Bluestem Grass' then tons end) as bluestem,
  sum(case when hay_type = 'Wheat Straw' then price * tons end)
    / sum(case when hay_type = 'Wheat Straw' then tons end) as straw
from ${type_weekly}
group by 1
order by 1
```

```sql pkg_weekly
-- The four most traded packages for the chosen hay type and quality, among packages with trades
-- in at least 150 weeks.
with picked as (
  select week, package, quantity, wtd_avg_price
  from ${hay_base}
  where hay_type = '${inputs.pkg_type.value}'
    and ('${inputs.pkg_quality.value}' = 'All' or quality = '${inputs.pkg_quality.value}')
),
kept as (
  select package
  from picked
  group by 1
  having count(distinct week) >= 150
  order by sum(quantity) desc
  limit 4
)
select
  week,
  package,
  sum(wtd_avg_price * quantity) / sum(quantity) as price
from picked
where package in (select package from kept)
group by 1, 2
```

```sql pkg_weeks
select distinct week from ${pkg_weekly}
```

```sql pkg_lines
select week, package, price
from ${pkg_weekly}
where week between '${inputs.pkg_range.start}' and '${inputs.pkg_range.end}'
order by week
```

```sql qual_monthly
-- Alfalfa in the chosen package, grouped into three quality bands, one point per month.
select
  cast(date_trunc('month', week) as date) as month,
  case
    when quality in ('Fair', 'Fair/Good') then 'Fair to Fair/Good'
    when quality in ('Good', 'Good/Premium') then 'Good to Good/Premium'
    when quality in ('Premium', 'Premium/Supreme', 'Supreme') then 'Premium to Supreme'
  end as quality_group,
  sum(wtd_avg_price * quantity) / sum(quantity) as price,
  sum(quantity) as tons
from ${hay_base}
where hay_type = 'Alfalfa'
  and package = '${inputs.qual_package.value}'
  and quality in ('Fair', 'Fair/Good', 'Good', 'Good/Premium', 'Premium', 'Premium/Supreme', 'Supreme')
group by 1, 2
```

```sql qual_months
select distinct month from ${qual_monthly}
```

```sql qual_lines
select month, quality_group, price
from ${qual_monthly}
where month between '${inputs.qual_range.start}' and '${inputs.qual_range.end}'
order by month
```

```sql qual_premium
select
  month,
  max(case when quality_group = 'Premium to Supreme' then price end)
    - max(case when quality_group = 'Fair to Fair/Good' then price end) as premium
from ${qual_monthly}
where month between '${inputs.qual_range.start}' and '${inputs.qual_range.end}'
group by 1
having count(distinct quality_group) >= 2
  and max(case when quality_group = 'Premium to Supreme' then price end) is not null
  and max(case when quality_group = 'Fair to Fair/Good' then price end) is not null
order by 1
```

```sql qual_yearly
select
  cast(year(month) as varchar) as year,
  sum(case when quality_group = 'Premium to Supreme' then price * tons end)
    / sum(case when quality_group = 'Premium to Supreme' then tons end) as top,
  sum(case when quality_group = 'Good to Good/Premium' then price * tons end)
    / sum(case when quality_group = 'Good to Good/Premium' then tons end) as mid,
  sum(case when quality_group = 'Fair to Fair/Good' then price * tons end)
    / sum(case when quality_group = 'Fair to Fair/Good' then tons end) as low,
  sum(case when quality_group = 'Premium to Supreme' then price * tons end)
    / sum(case when quality_group = 'Premium to Supreme' then tons end)
  - sum(case when quality_group = 'Fair to Fair/Good' then price * tons end)
    / sum(case when quality_group = 'Fair to Fair/Good' then tons end) as premium
from ${qual_monthly}
group by 1
order by 1
```
