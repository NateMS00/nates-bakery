-- Read-only check after 0004_stale_drafts.sql: run in the SQL editor; every row should say ok = true.
with checks(check_name, result, expected) as (
  select 'expire_stale_drafts is SECURITY DEFINER with search_path ""',
    (prosecdef and array_to_string(proconfig, ',') = 'search_path=""')::text, 'true'
  from pg_proc where oid = 'public.expire_stale_drafts()'::regprocedure
  union all
  select 'signed-in users can run expire_stale_drafts', has_function_privilege('authenticated', 'public.expire_stale_drafts()', 'execute')::text, 'true'
  union all
  select 'anonymous visitors cannot run expire_stale_drafts', has_function_privilege('anon', 'public.expire_stale_drafts()', 'execute')::text, 'false'
)
select check_name, result, expected, result = expected as ok from checks;
