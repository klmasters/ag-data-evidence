# Kansas Weekly Cattle Auction Summary

```sql mmn_1895_preview
select
    report_id,
    report_begin_date,
    commodity,
    class,
    avg_weight,
    avg_price,
    head_count
from supabase_ag_pipeline.raw_mmn_1895
order by report_begin_date desc
limit 100
```

<DataTable data={mmn_1895_preview} rows=20/>