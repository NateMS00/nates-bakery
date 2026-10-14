-- Nate's Bakery, reel import (SKELETON 1.4.0): ingredient notes, drafts, the import
-- key, and the thumbnail bucket.
--
-- Security model (added to 0001's)
-- - The Shortcut has no session. It sends the owner's import key, and the server
--   passes it to the import_* functions below, which are SECURITY DEFINER and do
--   nothing without a valid key. The app still never uses the service-role key.
-- - Only the key's SHA-256 hash is stored. The key is 32 random bytes, so a fast hash
--   is enough (nothing to guess, unlike a password). The owner can read only when the
--   key was created, never the hash.
-- - Drafts are the owner's only (row-level security). They're created and moved
--   through their states only by the import functions; the owner reads them, edits
--   their content (autosave), and deletes them.
-- - At most 30 caption fetches per owner in 24 hours, so a leaked key can't use up
--   the Apify credit.
-- - Thumbnails are copied into a private Storage bucket when a recipe is saved, in a
--   folder named after the owner's id; only the owner can read or write it.
--
-- Run once after 0001, as the database owner (the dashboard's SQL editor does), in
-- one transaction. Then run supabase/checks/0002_verify.sql.

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- Ingredient notes, and originals kept for Estimated amounts too
-- ─────────────────────────────────────────────────────────────────────────────
-- note: a creator's remark about one ingredient ("Creator: 100 g makes it less
-- sweet"), or the owner's own. Not shown on shared pages: shared_recipe doesn't read it.
-- original: the amount as written ("was ½ taza", "was 1 egg"), now kept for
-- Estimated as well as Converted.

alter table public.ingredients
  add column note text check (char_length(note) between 1 and 300);

-- The saved reel thumbnail: a path in the recipe-thumbnails bucket, or null.
alter table public.recipes
  add column source_thumbnail_path text check (char_length(source_thumbnail_path) between 1 and 300);

-- save_recipe as in 0001, plus: note; original for estimated too; the thumbnail
-- path in source.thumbnailPath, kept on edit while the reel link stays the same.
create or replace function public.save_recipe(p_id uuid, p_content jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_id is null then
    insert into public.recipes (title, category, yield_quantity, yield_unit, yield_unit_plural, total_time_minutes, source_creator_handle, source_reel_url, source_thumbnail_path)
    values (
      btrim(p_content ->> 'title'),
      p_content ->> 'category',
      (p_content -> 'yield' ->> 'quantity')::integer,
      p_content -> 'yield' ->> 'unit',
      p_content -> 'yield' ->> 'unitPlural',
      coalesce((p_content ->> 'totalTimeMinutes')::integer, 0),
      p_content -> 'source' ->> 'creatorHandle',
      p_content -> 'source' ->> 'reelUrl',
      p_content -> 'source' ->> 'thumbnailPath'
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
      source_reel_url = p_content -> 'source' ->> 'reelUrl',
      -- The editor doesn't carry the path: keep it while the reel link is unchanged.
      source_thumbnail_path = case
        when (p_content -> 'source' ->> 'reelUrl') is distinct from source_reel_url then p_content -> 'source' ->> 'thumbnailPath'
        else coalesce(p_content -> 'source' ->> 'thumbnailPath', source_thumbnail_path)
      end
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

  insert into public.ingredients (recipe_id, id, group_id, position, name, grams, status, original, note)
  select v_id, i ->> 'id', i ->> 'groupId', o::integer, btrim(i ->> 'name'), (i ->> 'grams')::numeric, i ->> 'status',
    case when i ->> 'status' in ('converted', 'estimated') then i ->> 'original' end,
    nullif(btrim(i ->> 'note'), '')
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
-- Drafts
-- ─────────────────────────────────────────────────────────────────────────────
-- status: fetching (Apify is getting the caption) → reading (caption stored; the
-- Shortcut's Apple Intelligence is reading it) → ready (the recipe arrived). unfinished:
-- the recipe that came back couldn't be used. The app also shows a reading draft
-- older than 3 minutes as Couldn't finish (the Shortcut stopped). A failed fetch or a
-- caption with no recipe deletes the draft; saving it as a recipe does too.

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  -- Normalized by the app: https://www.instagram.com/reel/<id>/ or /p/<id>/.
  reel_url text not null check (reel_url ~ '^https://www\.instagram\.com/(reel|p)/[A-Za-z0-9_-]{1,64}/$'),
  status text not null default 'fetching' check (status in ('fetching', 'reading', 'unfinished', 'ready')),
  -- Exactly as the creator wrote it (Instagram allows 2,200 characters).
  caption text check (char_length(caption) <= 5000),
  -- The caption's language in English ("Spanish"), from the recipe reading.
  caption_language text check (char_length(caption_language) between 1 and 60),
  creator_handle text check (char_length(creator_handle) between 1 and 100),
  -- Instagram's image link (it expires after a few days); copied to Storage on save.
  thumbnail_url text check (char_length(thumbnail_url) <= 2000 and thumbnail_url like 'https://%'),
  title text check (char_length(title) <= 200),
  -- The editor's content, autosaved by Review Import. Ready drafts only.
  content jsonb check (content is null or jsonb_typeof(content) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status = 'fetching' or caption is not null),
  check (status <> 'ready' or content is not null)
);
create index drafts_owner_reel on public.drafts (owner_id, reel_url);

create trigger drafts_touch_updated_at
before update on public.drafts
for each row execute function public.touch_updated_at();

alter table public.drafts enable row level security;
revoke all on table public.drafts from anon, authenticated;
-- The owner reads, autosaves the content (and the title shown in the Library), and
-- discards. No inserts and no state changes: only the import functions do those.
grant select, delete on table public.drafts to authenticated;
grant update (title, content) on table public.drafts to authenticated;

create policy "Owner reads own drafts" on public.drafts
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owner edits own drafts" on public.drafts
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owner deletes own drafts" on public.drafts
  for delete to authenticated using (owner_id = (select auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- The import key, and the caption-fetch log for the daily limit
-- ─────────────────────────────────────────────────────────────────────────────

create table public.import_keys (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  key_hash bytea not null unique check (octet_length(key_hash) = 32),
  created_at timestamptz not null default now()
);

alter table public.import_keys enable row level security;
revoke all on table public.import_keys from anon, authenticated;
-- Only whether a key exists and when it was made ("Import key created 13 Oct").
grant select (owner_id, created_at) on table public.import_keys to authenticated;

create policy "Owner reads own import key date" on public.import_keys
  for select to authenticated using (owner_id = (select auth.uid()));

-- One row per Apify call, for the 30-in-24-hours limit. Only the functions use it.
create table public.import_fetches (
  owner_id uuid not null references auth.users (id) on delete cascade,
  fetched_at timestamptz not null default now()
);
create index import_fetches_owner_time on public.import_fetches (owner_id, fetched_at);

alter table public.import_fetches enable row level security;
revoke all on table public.import_fetches from anon, authenticated;

-- create_import_key: makes the signed-in owner's key, replacing any earlier one (so
-- the old key stops working at once), and returns it. The only time it's ever seen.
create function public.create_import_key()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_key text;
begin
  if v_owner is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  -- nbk_ + 32 random bytes as base64url, 43 characters.
  v_key := 'nbk_' || translate(rtrim(encode(extensions.gen_random_bytes(32), 'base64'), '='), '+/', '-_');
  insert into public.import_keys (owner_id, key_hash)
  values (v_owner, extensions.digest(v_key, 'sha256'))
  on conflict (owner_id) do update set key_hash = excluded.key_hash, created_at = now();
  return v_key;
end;
$$;

revoke all on function public.create_import_key() from public, anon;
grant execute on function public.create_import_key() to authenticated;

-- import_key_owner: the owner a key belongs to, or null. Internal.
create function public.import_key_owner(p_key text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select k.owner_id from public.import_keys k
  where p_key ~ '^nbk_[A-Za-z0-9_-]{43}$'
    and k.key_hash = extensions.digest(p_key, 'sha256')
$$;

revoke all on function public.import_key_owner(text) from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- The import functions, called by the server for the Shortcut with its key
-- ─────────────────────────────────────────────────────────────────────────────
-- None of them return anything for a wrong key except {"status": "bad-key"} or false.

-- import_begin: step 2 of FLOW-01, before any Apify call. Answers, as JSON:
--   bad-key | invalid (not a normalized reel link) | limit (30 fetches in 24 hours)
--   already { recipeId, title }: a saved recipe has this reel (skipped by p_again)
--   ready { draftId }: a draft of this reel is ready to review
--   caption { draftId, caption, creatorHandle }: a draft already has its caption (no
--     Apify call needed; the Shortcut reads it again)
--   fetch { draftId }: a new draft; the server fetches the caption now
create function public.import_begin(p_key text, p_url text, p_again boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.import_key_owner(p_key);
  v_recipe record;
  v_draft record;
  v_id uuid;
begin
  if v_owner is null then
    return jsonb_build_object('status', 'bad-key');
  end if;
  if p_url is null or p_url !~ '^https://www\.instagram\.com/(reel|p)/[A-Za-z0-9_-]{1,64}/$' then
    return jsonb_build_object('status', 'invalid');
  end if;

  -- A fetch that never finished (the request died): drop it.
  delete from public.drafts
  where owner_id = v_owner and status = 'fetching' and created_at < now() - interval '3 minutes';

  if not coalesce(p_again, false) then
    select r.id, r.title into v_recipe from public.recipes r
    where r.owner_id = v_owner and r.source_reel_url = p_url
    order by r.created_at desc limit 1;
    if found then
      return jsonb_build_object('status', 'already', 'recipeId', v_recipe.id, 'title', v_recipe.title);
    end if;
  end if;

  select d.id, d.status, d.caption, d.creator_handle into v_draft from public.drafts d
  where d.owner_id = v_owner and d.reel_url = p_url and d.status <> 'fetching'
  order by d.created_at desc limit 1;
  if found and v_draft.status = 'ready' then
    return jsonb_build_object('status', 'ready', 'draftId', v_draft.id);
  elsif found then
    update public.drafts set status = 'reading' where id = v_draft.id;
    return jsonb_build_object('status', 'caption', 'draftId', v_draft.id, 'caption', v_draft.caption, 'creatorHandle', v_draft.creator_handle);
  end if;

  delete from public.import_fetches where owner_id = v_owner and fetched_at < now() - interval '24 hours';
  if (select count(*) from public.import_fetches where owner_id = v_owner) >= 30 then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.import_fetches (owner_id) values (v_owner);
  insert into public.drafts (owner_id, reel_url) values (v_owner, p_url) returning id into v_id;
  return jsonb_build_object('status', 'fetch', 'draftId', v_id);
end;
$$;

-- import_retry: Retry on a draft that couldn't finish. The stored caption, without
-- another Apify call. Answers bad-key | gone | ready { draftId } | caption { … }.
create function public.import_retry(p_key text, p_draft uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.import_key_owner(p_key);
  v_draft record;
begin
  if v_owner is null then
    return jsonb_build_object('status', 'bad-key');
  end if;
  select d.id, d.status, d.caption, d.creator_handle into v_draft from public.drafts d
  where d.id = p_draft and d.owner_id = v_owner and d.status <> 'fetching';
  if not found then
    return jsonb_build_object('status', 'gone');
  elsif v_draft.status = 'ready' then
    return jsonb_build_object('status', 'ready', 'draftId', v_draft.id);
  end if;
  update public.drafts set status = 'reading' where id = v_draft.id;
  return jsonb_build_object('status', 'caption', 'draftId', v_draft.id, 'caption', v_draft.caption, 'creatorHandle', v_draft.creator_handle);
end;
$$;

-- import_set_caption: Apify answered; the draft moves to reading.
create function public.import_set_caption(p_key text, p_draft uuid, p_caption text, p_creator_handle text, p_thumbnail_url text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.import_key_owner(p_key);
begin
  if v_owner is null or p_caption is null then
    return false;
  end if;
  update public.drafts set
    status = 'reading',
    caption = p_caption,
    creator_handle = nullif(btrim(p_creator_handle), ''),
    thumbnail_url = case when p_thumbnail_url like 'https://%' and char_length(p_thumbnail_url) <= 2000 then p_thumbnail_url end
  where id = p_draft and owner_id = v_owner and status = 'fetching';
  return found;
end;
$$;

-- import_drop: the fetch failed (private, deleted, Apify down) or the caption has no
-- recipe. Ready drafts are never dropped this way.
create function public.import_drop(p_key text, p_draft uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.import_key_owner(p_key);
begin
  if v_owner is null then
    return false;
  end if;
  delete from public.drafts where id = p_draft and owner_id = v_owner and status <> 'ready';
  return found;
end;
$$;

-- import_finish: the recipe arrived, converted to grams by the server; the draft is
-- ready to review.
create function public.import_finish(p_key text, p_draft uuid, p_title text, p_language text, p_content jsonb)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.import_key_owner(p_key);
begin
  if v_owner is null or p_content is null or jsonb_typeof(p_content) <> 'object' then
    return false;
  end if;
  update public.drafts set
    status = 'ready',
    title = left(nullif(btrim(p_title), ''), 200),
    caption_language = left(nullif(btrim(p_language), ''), 60),
    content = p_content
  where id = p_draft and owner_id = v_owner and status in ('reading', 'unfinished');
  return found;
end;
$$;

-- import_unfinished: what came back couldn't be used; Review Import shows
-- Couldn't finish, with the caption, Retry, and Discard.
create function public.import_unfinished(p_key text, p_draft uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.import_key_owner(p_key);
begin
  if v_owner is null then
    return false;
  end if;
  update public.drafts set status = 'unfinished'
  where id = p_draft and owner_id = v_owner and status = 'reading';
  return found;
end;
$$;

-- The server calls these with the public key and no session (role anon).
revoke all on function
  public.import_begin(text, text, boolean), public.import_retry(text, uuid),
  public.import_set_caption(text, uuid, text, text, text), public.import_drop(text, uuid),
  public.import_finish(text, uuid, text, text, jsonb), public.import_unfinished(text, uuid)
from public;
grant execute on function
  public.import_begin(text, text, boolean), public.import_retry(text, uuid),
  public.import_set_caption(text, uuid, text, text, text), public.import_drop(text, uuid),
  public.import_finish(text, uuid, text, text, jsonb), public.import_unfinished(text, uuid)
to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Thumbnails: a private Storage bucket, one folder per owner
-- ─────────────────────────────────────────────────────────────────────────────
-- Saving an imported recipe copies the reel's image to <owner id>/<file> here, as the
-- signed-in owner. Images only, at most 2 MB.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-thumbnails', 'recipe-thumbnails', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Owner reads own thumbnails" on storage.objects
  for select to authenticated
  using (bucket_id = 'recipe-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owner adds own thumbnails" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recipe-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owner replaces own thumbnails" on storage.objects
  for update to authenticated
  using (bucket_id = 'recipe-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'recipe-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owner deletes own thumbnails" on storage.objects
  for delete to authenticated
  using (bucket_id = 'recipe-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
