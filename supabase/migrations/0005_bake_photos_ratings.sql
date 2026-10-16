-- Backery, visual upgrade round, migration 1 of N: ratings and photos move from the
-- recipe to each bake (SKELETON 1.5.0, Nathan 2026-10-15).
--
-- Additive only, on purpose: this runs against the production database while main
-- still deploys the pre-round app, which reads recipes.rating directly, and Vercel
-- previews of the visual-round branch share that same database. So this migration
-- only adds columns, functions, and a bucket, and copies data forward — it never
-- drops, renames, or empties anything main's code still touches. recipes.rating is
-- *not* cleared here; see the note above the UPDATE below. A later cleanup migration,
-- once the round has fully shipped and main has moved on, nulls it for good.
--
-- Run once, as the database owner (the dashboard's SQL editor does), in one transaction.

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- bakes: a rating and a photo per entry
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.bakes
  add column rating smallint check (rating between 1 and 5),
  -- A path in the bake-photos bucket below (owner-id/uuid.jpg), not a usable URL —
  -- resolved to a signed URL in lib/backend/supabase/data.ts, same as recipe_thumbnails.
  add column photo_path text check (char_length(photo_path) <= 300);

-- ─────────────────────────────────────────────────────────────────────────────
-- recipes: a cover that must be one of the recipe's own bakes
-- ─────────────────────────────────────────────────────────────────────────────
-- The composite FK (cover_bake_id, id) → bakes(id, recipe_id) enforces that the
-- referenced bake actually belongs to this recipe: Postgres only accepts the pair
-- when bakes.id = cover_bake_id *and* bakes.recipe_id = recipes.id.
--
-- "on delete set null (cover_bake_id)" is Postgres 15's column-scoped SET NULL: it
-- clears only cover_bake_id when the referenced bake is deleted. The plain
-- (unscoped) ON DELETE SET NULL would try to null *every* column in the FK,
-- including recipes.id — the primary key, never nullable — and error. Supabase
-- runs Postgres 15+ today; if this statement fails with "column "id" is in a
-- primary key" or similar on an older instance, that's the tell.

alter table public.bakes add constraint bakes_id_recipe_id_key unique (id, recipe_id);

alter table public.recipes add column cover_bake_id uuid;
alter table public.recipes add constraint recipes_cover_bake_fkey
  foreign key (cover_bake_id, id) references public.bakes (id, recipe_id)
  on delete set null (cover_bake_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- recipe_rating: the one place the "displayed rating" rule lives (Nathan,
-- 2026-10-15) — the latest bake with a rating, else the recipe's own legacy
-- rating column. A PostgREST computed column (its one argument is the recipes
-- row type), so it reads like an ordinary column in a select list.
--
-- getRecipe/getRecipes select it aliased back to "rating" (lib/backend/supabase/
-- map.ts's RECIPE_SELECT); the Library's rating filter rides along, since it just
-- reads the "rating" field those return. shared_recipe() below calls it directly.
-- Nothing else should recompute this rule.
-- ─────────────────────────────────────────────────────────────────────────────

create function public.recipe_rating(r public.recipes)
returns smallint
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (select b.rating from public.bakes b
      where b.recipe_id = r.id and b.rating is not null
      order by b.baked_on desc, b.created_at desc
      limit 1),
    r.rating
  );
$$;

revoke all on function public.recipe_rating(public.recipes) from public, anon;
grant execute on function public.recipe_rating(public.recipes) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- shared_recipe(): 'rating' now comes from recipe_rating() instead of r.rating
-- directly, so a shared page shows the same derived value the owner sees. Still
-- excludes the cover and every bake photo entirely (unchanged — this function
-- never selected either, and friends must keep seeing neither, SKELETON 1.5.0).
-- Every other field is identical to 0001_init.sql's version.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.shared_recipe(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'title', r.title,
    'category', r.category,
    'yield', jsonb_build_object('quantity', r.yield_quantity, 'unit', r.yield_unit, 'unitPlural', r.yield_unit_plural),
    'totalTimeMinutes', r.total_time_minutes,
    'source', case when r.source_reel_url is null then null
      else jsonb_build_object('creatorHandle', r.source_creator_handle, 'reelUrl', r.source_reel_url) end,
    'rating', public.recipe_rating(r),
    'ingredientGroups', coalesce((
      select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name) order by g.position)
      from public.ingredient_groups g where g.recipe_id = r.id), '[]'),
    'stepGroups', coalesce((
      select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name) order by g.position)
      from public.step_groups g where g.recipe_id = r.id), '[]'),
    'ingredients', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'groupId', i.group_id, 'name', i.name, 'grams', i.grams,
        'status', case when i.status = 'converted' then 'confirmed' else i.status end
      ) order by i.position)
      from public.ingredients i where i.recipe_id = r.id), '[]'),
    'steps', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'groupId', s.group_id, 'text', s.text,
        'timeMarks', coalesce((
          select jsonb_agg(jsonb_build_object('text', m ->> 'text', 'minutes', (m ->> 'minutes')::numeric) order by mo)
          from jsonb_array_elements(s.time_marks) with ordinality as tm (m, mo)), '[]')
      ) order by s.position)
      from public.steps s where s.recipe_id = r.id), '[]')
  )
  from public.share_links l
  join public.recipes r on r.id = l.recipe_id
  where p_token is not null
    and char_length(p_token) between 16 and 64
    and l.token = p_token
$$;

revoke all on function public.shared_recipe(text) from public;
grant execute on function public.shared_recipe(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- One-time move: copy each recipe's rating onto its latest bake (moving from
-- per-recipe to per-bake ratings, SKELETON 1.5.0's Decided note). Additive:
-- recipes.rating is left exactly as it is, not cleared. That's safe either way —
-- once a recipe has a rated bake, recipe_rating() above always prefers it over
-- the legacy column, so the leftover value there is simply never read again for
-- that recipe. A recipe that's rated but has no bakes at all is untouched, so it
-- keeps that rating as its displayed one until its first rated bake, per spec.
-- ─────────────────────────────────────────────────────────────────────────────

with latest as (
  select distinct on (b.recipe_id) b.id, b.recipe_id
  from public.bakes b
  order by b.recipe_id, b.baked_on desc, b.created_at desc
)
update public.bakes b
set rating = r.rating
from latest, public.recipes r
where b.id = latest.id
  and r.id = latest.recipe_id
  and r.rating is not null
  and b.rating is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage: bake photos, one folder per owner, same pattern as recipe-thumbnails
-- (0002_import.sql). Always a device-resized JPEG by the time it's uploaded
-- (long edge about 1600px, Stage C's Log sheet) — 5 MB is generous headroom over
-- that, and jpeg-only matches the resize step exactly (it also drops HEIC and any
-- location data, and corrects orientation before upload).
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bake-photos', 'bake-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "Owner reads own bake photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'bake-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owner adds own bake photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'bake-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owner replaces own bake photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'bake-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'bake-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owner deletes own bake photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'bake-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
