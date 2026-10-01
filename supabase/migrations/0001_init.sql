-- Backery, phase 1: one owner's recipes, bakes, and share links (Supabase Postgres).
--
-- Security model
-- - Every table has row-level security. Only signed-in users (role `authenticated`)
--   have table access, and only to rows of recipes they own (recipes.owner_id).
-- - Anonymous visitors (role `anon`) have no table access at all. Their only path is
--   public.shared_recipe(token), which returns exactly what /r/:shareToken shows.
-- - Sign-ups are turned off in the dashboard; the one owner account is created there.
--
-- Run once, as the database owner (the dashboard's SQL editor does), in one transaction.

begin;

create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  category text not null check (category in ('bread', 'viennoiserie', 'quick-bread', 'cake', 'cookie-bar', 'pie-tart', 'pastry', 'dessert', 'other')),
  yield_quantity integer not null check (yield_quantity >= 1),
  yield_unit text not null check (char_length(yield_unit) between 1 and 60),
  yield_unit_plural text not null check (char_length(yield_unit_plural) between 1 and 60),
  total_time_minutes integer not null default 0 check (total_time_minutes between 0 and 100000),
  -- Imported recipes keep the creator credit and reel link; both or neither.
  source_creator_handle text check (char_length(source_creator_handle) <= 100),
  source_reel_url text check (char_length(source_reel_url) <= 500),
  rating smallint check (rating between 1 and 5),
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipes_source_complete check ((source_creator_handle is null) = (source_reel_url is null))
);

create index recipes_owner_id_idx on public.recipes (owner_id);

-- Parts of a recipe. Their ids come from the editor (short text ids, unique within a
-- recipe), so they stay stable across edits; position keeps the owner's order.

create table public.ingredient_groups (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  position integer not null,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  primary key (recipe_id, id)
);

create table public.step_groups (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  position integer not null,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  primary key (recipe_id, id)
);

create table public.ingredients (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  group_id text,
  position integer not null,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  -- Grams at 1×; none only for "to taste" (SKELETON 1.3.1).
  grams numeric check (grams >= 0 and grams < 1000000),
  status text not null check (status in ('confirmed', 'estimated', 'converted', 'to-taste')),
  -- The stated amount before conversion ("1¼ cups"); private, never shared.
  original text check (char_length(original) <= 100),
  primary key (recipe_id, id),
  foreign key (recipe_id, group_id) references public.ingredient_groups (recipe_id, id) on delete set null (group_id),
  constraint ingredients_to_taste_has_no_grams check ((status = 'to-taste') = (grams is null))
);

create table public.steps (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  group_id text,
  position integer not null,
  text text not null check (char_length(btrim(text)) between 1 and 5000),
  -- Detected times: [{ "text": "25 minutes", "minutes": 25 }, …]; each is a Bake Mode timer.
  time_marks jsonb not null default '[]' check (jsonb_typeof(time_marks) = 'array'),
  primary key (recipe_id, id),
  foreign key (recipe_id, group_id) references public.step_groups (recipe_id, id) on delete set null (group_id)
);

-- Which ingredients a step uses (Bake Mode's "For this step"). Owner-only; not shared.
create table public.step_ingredients (
  recipe_id uuid not null,
  step_id text not null,
  ingredient_id text not null,
  primary key (recipe_id, step_id, ingredient_id),
  foreign key (recipe_id, step_id) references public.steps (recipe_id, id) on delete cascade,
  foreign key (recipe_id, ingredient_id) references public.ingredients (recipe_id, id) on delete cascade
);

-- The bake log. Never shared.
create table public.bakes (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  baked_on date not null,
  scale numeric not null check (scale between 0.25 and 10),
  what_changed text check (char_length(what_changed) <= 5000),
  how_it_turned_out text check (char_length(how_it_turned_out) <= 5000),
  created_at timestamptz not null default now()
);

create index bakes_recipe_id_idx on public.bakes (recipe_id, baked_on desc, created_at desc);

-- One revocable link per recipe. Revoking deletes the row; sharing again makes a new
-- token. 18 random bytes, base64url: 24 characters, 144 bits.
create table public.share_links (
  recipe_id uuid primary key references public.recipes (id) on delete cascade,
  token text not null unique default translate(encode(extensions.gen_random_bytes(18), 'base64'), '+/', '-_'),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at
-- ─────────────────────────────────────────────────────────────────────────────

create function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger recipes_touch_updated_at
before update on public.recipes
for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-level security: only the owner, only signed in
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.recipes enable row level security;
alter table public.ingredient_groups enable row level security;
alter table public.step_groups enable row level security;
alter table public.ingredients enable row level security;
alter table public.steps enable row level security;
alter table public.step_ingredients enable row level security;
alter table public.bakes enable row level security;
alter table public.share_links enable row level security;

-- Anonymous visitors get nothing from the tables (no policies either, so even a grant
-- added later by mistake would return no rows). Signed-in users keep Supabase's
-- default grants, filtered by the policies below.
revoke all on table
  public.recipes, public.ingredient_groups, public.step_groups, public.ingredients,
  public.steps, public.step_ingredients, public.bakes, public.share_links
from anon;

create policy "Owner reads own recipes" on public.recipes
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owner adds own recipes" on public.recipes
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owner changes own recipes" on public.recipes
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owner deletes own recipes" on public.recipes
  for delete to authenticated using (owner_id = (select auth.uid()));

-- Everything else belongs to a recipe: allowed when that recipe is the user's own.
-- (The subquery on recipes is itself filtered by the policies above.)
create policy "Owner manages own ingredient groups" on public.ingredient_groups
  for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())));
create policy "Owner manages own step groups" on public.step_groups
  for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())));
create policy "Owner manages own ingredients" on public.ingredients
  for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())));
create policy "Owner manages own steps" on public.steps
  for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())));
create policy "Owner manages own step ingredients" on public.step_ingredients
  for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())));
create policy "Owner manages own bakes" on public.bakes
  for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())));
create policy "Owner manages own share links" on public.share_links
  for all to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.owner_id = (select auth.uid())));

-- ─────────────────────────────────────────────────────────────────────────────
-- save_recipe: the editor's Save, all or nothing
-- ─────────────────────────────────────────────────────────────────────────────
-- Writes a recipe and all its parts in one transaction: inserts when p_id is null,
-- otherwise replaces the content of the user's recipe p_id (rating, favorite, bakes,
-- and share link are untouched). Runs as the caller, so row-level security applies:
-- it can only ever write the caller's own recipes. Returns the recipe id.
-- p_content is the app's recipe content: { title, category, yield { quantity, unit,
-- unitPlural }, totalTimeMinutes, source { creatorHandle, reelUrl } | null,
-- ingredientGroups [{ id, name }], stepGroups [{ id, name }], ingredients [{ id,
-- groupId, name, grams, status, original }], steps [{ id, groupId, text, timeMarks
-- [{ text, minutes }], ingredientIds [] }] }.

create function public.save_recipe(p_id uuid, p_content jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_id is null then
    insert into public.recipes (title, category, yield_quantity, yield_unit, yield_unit_plural, total_time_minutes, source_creator_handle, source_reel_url)
    values (
      btrim(p_content ->> 'title'),
      p_content ->> 'category',
      (p_content -> 'yield' ->> 'quantity')::integer,
      p_content -> 'yield' ->> 'unit',
      p_content -> 'yield' ->> 'unitPlural',
      coalesce((p_content ->> 'totalTimeMinutes')::integer, 0),
      p_content -> 'source' ->> 'creatorHandle',
      p_content -> 'source' ->> 'reelUrl'
    )
    returning id into v_id;
  else
    update public.recipes set
      title = btrim(p_content ->> 'title'),
      category = p_content ->> 'category',
      yield_quantity = (p_content -> 'yield' ->> 'quantity')::integer,
      yield_unit = p_content -> 'yield' ->> 'unit',
      yield_unit_plural = p_content -> 'yield' ->> 'unitPlural',
      total_time_minutes = coalesce((p_content ->> 'totalTimeMinutes')::integer, 0),
      source_creator_handle = p_content -> 'source' ->> 'creatorHandle',
      source_reel_url = p_content -> 'source' ->> 'reelUrl'
    where id = p_id
    returning id into v_id;
    if v_id is null then
      raise exception 'recipe not found' using errcode = 'P0002';
    end if;
    -- Replace the parts (step_ingredients go with their steps and ingredients).
    delete from public.steps where recipe_id = v_id;
    delete from public.ingredients where recipe_id = v_id;
    delete from public.step_groups where recipe_id = v_id;
    delete from public.ingredient_groups where recipe_id = v_id;
  end if;

  insert into public.ingredient_groups (recipe_id, id, position, name)
  select v_id, g ->> 'id', o::integer, btrim(g ->> 'name')
  from jsonb_array_elements(coalesce(p_content -> 'ingredientGroups', '[]')) with ordinality as t (g, o);

  insert into public.step_groups (recipe_id, id, position, name)
  select v_id, g ->> 'id', o::integer, btrim(g ->> 'name')
  from jsonb_array_elements(coalesce(p_content -> 'stepGroups', '[]')) with ordinality as t (g, o);

  insert into public.ingredients (recipe_id, id, group_id, position, name, grams, status, original)
  select v_id, i ->> 'id', i ->> 'groupId', o::integer, btrim(i ->> 'name'), (i ->> 'grams')::numeric, i ->> 'status',
    case when i ->> 'status' = 'converted' then i ->> 'original' end
  from jsonb_array_elements(coalesce(p_content -> 'ingredients', '[]')) with ordinality as t (i, o);

  insert into public.steps (recipe_id, id, group_id, position, text, time_marks)
  select v_id, s ->> 'id', s ->> 'groupId', o::integer, btrim(s ->> 'text'),
    coalesce((
      select jsonb_agg(jsonb_build_object('text', m ->> 'text', 'minutes', (m ->> 'minutes')::numeric) order by mo)
      from jsonb_array_elements(coalesce(s -> 'timeMarks', '[]')) with ordinality as tm (m, mo)
    ), '[]')
  from jsonb_array_elements(coalesce(p_content -> 'steps', '[]')) with ordinality as t (s, o);

  insert into public.step_ingredients (recipe_id, step_id, ingredient_id)
  select distinct v_id, s ->> 'id', ingredient_id
  from jsonb_array_elements(coalesce(p_content -> 'steps', '[]')) as t (s),
    jsonb_array_elements_text(coalesce(s -> 'ingredientIds', '[]')) as u (ingredient_id);

  return v_id;
end;
$$;

revoke all on function public.save_recipe(uuid, jsonb) from public, anon;
grant execute on function public.save_recipe(uuid, jsonb) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- shared_recipe: the only thing an anonymous visitor can read
-- ─────────────────────────────────────────────────────────────────────────────
-- Returns exactly what /r/:shareToken shows, or null for an unknown or revoked token
-- (the page then goes to /r/expired). SECURITY DEFINER, so it reads past row-level
-- security, which is why every field is named here explicitly:
--   title, category, yield { quantity, unit, unitPlural }, totalTimeMinutes,
--   source { creatorHandle, reelUrl } | null, rating,
--   ingredientGroups [{ id, name }], stepGroups [{ id, name }],
--   ingredients [{ id, groupId, name, grams, status }],
--   steps [{ id, groupId, text, timeMarks [{ text, minutes }] }]
-- Never returned: the recipe id, owner, favorite, dates, bakes and notes, the share
-- link itself, converted amounts' originals ("was 1 cup"), or which ingredients each
-- step uses. "converted" is reported as "confirmed" (the friend sees only Estimated).
-- tests/supabase/shared-recipe.spec.ts holds this list; a change here must change it too.

create function public.shared_recipe(p_token text)
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
    'rating', r.rating,
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

-- The trigger function is internal.
revoke all on function public.touch_updated_at() from public, anon, authenticated;

commit;
