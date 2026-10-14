-- Read-only check after 0002_import.sql: run in the SQL editor; every row should say ok = true.
-- (0001_verify.sql's policy count, 11, is from before this migration; it's 15 now.)
with t(name) as (
  values ('drafts'), ('import_keys'), ('import_fetches')
),
fns(sig) as (
  values ('public.import_begin(text,text,boolean)'), ('public.import_retry(text,uuid)'), ('public.import_set_caption(text,uuid,text,text,text)'),
    ('public.import_drop(text,uuid)'), ('public.import_finish(text,uuid,text,text,jsonb)'), ('public.import_unfinished(text,uuid)')
),
checks(check_name, result, expected) as (
  select 'table ' || t.name || ' exists, RLS on', coalesce(c.relrowsecurity::text, 'missing'), 'true'
  from t left join pg_class c on c.relname = t.name and c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
  union all
  select 'tables in public without RLS', coalesce((select string_agg(relname, ', ') from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r', 'p') and not relrowsecurity), 'none'), 'none'
  union all
  select 'policies in public', (select count(*) from pg_policies where schemaname = 'public')::text, '15'
  union all
  select 'thumbnail policies on storage.objects', (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like '%own thumbnails')::text, '4'
  union all
  select 'recipe-thumbnails bucket is private', (select (not public)::text from storage.buckets where id = 'recipe-thumbnails'), 'true'
  union all
  select 'ingredients.note exists', (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'ingredients' and column_name = 'note')::text, '1'
  union all
  select 'recipes.source_thumbnail_path exists', (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'recipes' and column_name = 'source_thumbnail_path')::text, '1'
  union all
  select 'save_recipe runs as the caller', (not prosecdef)::text, 'true' from pg_proc where oid = 'public.save_recipe(uuid,jsonb)'::regprocedure
  union all
  select 'import functions are SECURITY DEFINER with search_path ""', (select bool_and(prosecdef and array_to_string(proconfig, ',') = 'search_path=""') from fns join pg_proc p on p.oid = fns.sig::regprocedure)::text, 'true'
  union all
  select 'anon can run the import functions', (select bool_and(has_function_privilege('anon', sig, 'execute')) from fns)::text, 'true'
  union all
  select 'anon can run import_key_owner', has_function_privilege('anon', 'public.import_key_owner(text)', 'execute')::text, 'false'
  union all
  select 'signed-in users can run import_key_owner', has_function_privilege('authenticated', 'public.import_key_owner(text)', 'execute')::text, 'false'
  union all
  select 'anon can run create_import_key', has_function_privilege('anon', 'public.create_import_key()', 'execute')::text, 'false'
  union all
  select 'signed-in users can run create_import_key', has_function_privilege('authenticated', 'public.create_import_key()', 'execute')::text, 'true'
  union all
  select 'anon has any access to the 3 tables', (select bool_or(has_table_privilege('anon', 'public.' || name, p)) from t, unnest(array['select', 'insert', 'update', 'delete']) as p)::text, 'false'
  union all
  select 'signed-in users can read the key hash', has_column_privilege('authenticated', 'public.import_keys', 'key_hash', 'select')::text, 'false'
  union all
  select 'signed-in users can change a draft''s status', has_column_privilege('authenticated', 'public.drafts', 'status', 'update')::text, 'false'
  union all
  select 'signed-in users can add drafts', has_table_privilege('authenticated', 'public.drafts', 'insert')::text, 'false'
  union all
  select 'signed-in users can touch import_fetches', (select bool_or(has_table_privilege('authenticated', 'public.import_fetches', p)) from unnest(array['select', 'insert', 'update', 'delete']) as p)::text, 'false'
)
select check_name, result, expected, result = expected as ok from checks;
