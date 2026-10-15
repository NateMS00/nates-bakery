-- Read-only check after 0003_retry.sql: run in the SQL editor; every row should say ok = true.
with checks(check_name, result, expected) as (
  select 'drafts.retried exists, not null, defaults false',
    (select count(*)::text from information_schema.columns
     where table_schema = 'public' and table_name = 'drafts' and column_name = 'retried'
       and is_nullable = 'NO' and column_default = 'false'),
    '1'
  union all
  select 'import_mark_retry is SECURITY DEFINER with search_path ""',
    (prosecdef and array_to_string(proconfig, ',') = 'search_path=""')::text, 'true'
  from pg_proc where oid = 'public.import_mark_retry(text,uuid)'::regprocedure
  union all
  select 'anon can run import_mark_retry', has_function_privilege('anon', 'public.import_mark_retry(text,uuid)', 'execute')::text, 'true'
  union all
  select 'signed-in users can run import_mark_retry', has_function_privilege('authenticated', 'public.import_mark_retry(text,uuid)', 'execute')::text, 'true'
  union all
  select 'signed-in users can change a draft''s retried flag', has_column_privilege('authenticated', 'public.drafts', 'retried', 'update')::text, 'false'
  union all
  select 'import_retry no longer exists', (to_regprocedure('public.import_retry(text,uuid)') is null)::text, 'true'
  union all
  select 'import_get_caption is SECURITY DEFINER with search_path ""',
    (prosecdef and array_to_string(proconfig, ',') = 'search_path=""')::text, 'true'
  from pg_proc where oid = 'public.import_get_caption(text,uuid)'::regprocedure
  union all
  select 'anon can run import_get_caption', has_function_privilege('anon', 'public.import_get_caption(text,uuid)', 'execute')::text, 'true'
  union all
  select 'signed-in users can run import_get_caption', has_function_privilege('authenticated', 'public.import_get_caption(text,uuid)', 'execute')::text, 'true'
)
select check_name, result, expected, result = expected as ok from checks;
