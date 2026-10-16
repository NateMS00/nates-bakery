-- Read-only check after 0005_bake_photos_ratings.sql: run in the SQL editor; every row should say ok = true.
with checks(check_name, result, expected) as (
  select 'bakes.rating exists (smallint)', (atttypid = 'smallint'::regtype)::text, 'true'
  from pg_attribute where attrelid = 'public.bakes'::regclass and attname = 'rating' and not attisdropped
  union all
  select 'bakes.photo_path exists (text)', (atttypid = 'text'::regtype)::text, 'true'
  from pg_attribute where attrelid = 'public.bakes'::regclass and attname = 'photo_path' and not attisdropped
  union all
  select 'recipes.cover_bake_id exists (uuid)', (atttypid = 'uuid'::regtype)::text, 'true'
  from pg_attribute where attrelid = 'public.recipes'::regclass and attname = 'cover_bake_id' and not attisdropped
  union all
  select 'bakes(id, recipe_id) unique constraint exists', count(*)::text, '1'
  from pg_constraint where conrelid = 'public.bakes'::regclass and conname = 'bakes_id_recipe_id_key' and contype = 'u'
  union all
  select 'recipes_cover_bake_fkey is a composite FK to bakes(id, recipe_id)',
    (select array_agg(attname order by a.attnum) from pg_attribute a
      where a.attrelid = 'public.bakes'::regclass and a.attnum = any (confkey))::text,
    '{id,recipe_id}'
  from pg_constraint where conname = 'recipes_cover_bake_fkey' and contype = 'f'
  union all
  select 'recipes_cover_bake_fkey only ON DELETE SET NULLs cover_bake_id (not id)',
    (select array_agg(attname order by a.attnum) from pg_attribute a
      where a.attrelid = 'public.recipes'::regclass and a.attnum = any (confdelsetcols))::text,
    '{cover_bake_id}'
  from pg_constraint where conname = 'recipes_cover_bake_fkey' and contype = 'f'
  union all
  select 'no cover_bake_id points outside its own recipe (enforced by the FK; sanity check)',
    (select count(*)::text from public.recipes r join public.bakes b on b.id = r.cover_bake_id where b.recipe_id <> r.id),
    '0'
  union all
  select 'recipe_rating runs as the caller (not SECURITY DEFINER)', (not prosecdef)::text, 'true'
  from pg_proc where oid = 'public.recipe_rating(public.recipes)'::regprocedure
  union all
  select 'recipe_rating is STABLE', (provolatile = 's')::text, 'true'
  from pg_proc where oid = 'public.recipe_rating(public.recipes)'::regprocedure
  union all
  select 'recipe_rating search_path', array_to_string(proconfig, ','), 'search_path=""'
  from pg_proc where oid = 'public.recipe_rating(public.recipes)'::regprocedure
  union all
  select 'signed-in users can run recipe_rating', has_function_privilege('authenticated', 'public.recipe_rating(public.recipes)', 'execute')::text, 'true'
  union all
  select 'anonymous visitors cannot run recipe_rating', has_function_privilege('anon', 'public.recipe_rating(public.recipes)', 'execute')::text, 'false'
  union all
  select 'shared_recipe is still SECURITY DEFINER', prosecdef::text, 'true' from pg_proc where oid = 'public.shared_recipe(text)'::regprocedure
  union all
  select 'shared_recipe search_path', array_to_string(proconfig, ','), 'search_path=""' from pg_proc where oid = 'public.shared_recipe(text)'::regprocedure
  union all
  select 'shared_recipe source text never mentions cover or photo', (pg_get_functiondef('public.shared_recipe(text)'::regprocedure) !~* 'cover|photo')::text, 'true'
  union all
  select 'rated, baked recipes whose latest bake is missing the copied rating', (
      select count(*)::text from public.recipes r
      where r.rating is not null
        and exists (select 1 from public.bakes b where b.recipe_id = r.id)
        and (
          select b.rating from public.bakes b where b.recipe_id = r.id
          order by b.baked_on desc, b.created_at desc limit 1
        ) is null
    ), '0'
  union all
  select 'recipes.rating column still exists and nullable (additive migration, not dropped)',
    (atttypid = 'smallint'::regtype and not attnotnull)::text, 'true'
  from pg_attribute where attrelid = 'public.recipes'::regclass and attname = 'rating' and not attisdropped
  union all
  select 'bake-photos bucket is private', (select (not public)::text from storage.buckets where id = 'bake-photos'), 'true'
  union all
  select 'bake-photos bucket is jpeg-only, 5 MB limit', (select (allowed_mime_types = array['image/jpeg'] and file_size_limit = 5242880)::text from storage.buckets where id = 'bake-photos'), 'true'
  union all
  select 'bake-photos policies on storage.objects', (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like '%own bake photos')::text, '4'
)
select check_name, result, expected, result = expected as ok from checks;
