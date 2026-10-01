-- Read-only check after 0001_init.sql: run in the SQL editor; every row should say ok = true.
with t(name) as (
  values ('recipes'), ('ingredient_groups'), ('step_groups'), ('ingredients'), ('steps'), ('step_ingredients'), ('bakes'), ('share_links')
),
checks(check_name, result, expected) as (
  select 'table ' || t.name || ' exists, RLS on', coalesce(c.relrowsecurity::text, 'missing'), 'true'
  from t left join pg_class c on c.relname = t.name and c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
  union all
  select 'tables in public without RLS', coalesce((select string_agg(relname, ', ') from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r', 'p') and not relrowsecurity), 'none'), 'none'
  union all
  select 'policies in public', (select count(*) from pg_policies where schemaname = 'public')::text, '11'
  union all
  select 'shared_recipe is SECURITY DEFINER', prosecdef::text, 'true' from pg_proc where oid = 'public.shared_recipe(text)'::regprocedure
  union all
  select 'shared_recipe is STABLE', (provolatile = 's')::text, 'true' from pg_proc where oid = 'public.shared_recipe(text)'::regprocedure
  union all
  select 'shared_recipe search_path', array_to_string(proconfig, ','), 'search_path=""' from pg_proc where oid = 'public.shared_recipe(text)'::regprocedure
  union all
  select 'save_recipe runs as the caller', (not prosecdef)::text, 'true' from pg_proc where oid = 'public.save_recipe(uuid,jsonb)'::regprocedure
  union all
  select 'anon can run shared_recipe', has_function_privilege('anon', 'public.shared_recipe(text)', 'execute')::text, 'true'
  union all
  select 'anon can run save_recipe', has_function_privilege('anon', 'public.save_recipe(uuid,jsonb)', 'execute')::text, 'false'
  union all
  select 'signed-in users can run save_recipe', has_function_privilege('authenticated', 'public.save_recipe(uuid,jsonb)', 'execute')::text, 'true'
  union all
  select 'anon has any access to the 8 tables', (select bool_or(has_table_privilege('anon', 'public.' || name, p)) from t, unnest(array['select', 'insert', 'update', 'delete']) as p)::text, 'false'
  union all
  select 'signed-in users can read and write the 8 tables', (select bool_and(has_table_privilege('authenticated', 'public.' || name, p)) from t, unnest(array['select', 'insert', 'update', 'delete']) as p)::text, 'true'
)
select check_name, result, expected, result = expected as ok from checks;
