-- Nate's Bakery, stale drafts turn into "Couldn't finish" (BONES-recipes.md 1.4.0): a
-- draft stuck "fetching" or "reading" for more than 10 minutes means the Shortcut
-- never finished (closed, crashed, lost its network) — without this, such a draft
-- shows "Importing..." in the Library forever, with no way to open or clear it.
--
-- Run once after 0003, as the database owner (the dashboard's SQL editor does), in
-- one transaction. Then run supabase/checks/0004_verify.sql.

-- Owner-session callable: the owner's browser never has the import key, so this can't
-- reuse the import_* functions (those are key-gated, called only by the Shortcut).
-- Called from getDrafts/getDraft (lib/backend/supabase/data.ts) before reading, so the
-- Library and a direct /import/:draftId open both see the up-to-date status.
create function public.expire_stale_drafts()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  -- updated_at, not created_at: drafts_touch_updated_at (0002) bumps it on every
  -- state change, including import_get_caption's retry path (status back to
  -- 'reading') — so a draft retried 9 minutes in isn't wrongly expired a minute later.
  update public.drafts
  set status = 'unfinished'
  where owner_id = auth.uid()
    and status in ('fetching', 'reading')
    and updated_at < now() - interval '10 minutes';
end;
$$;

revoke all on function public.expire_stale_drafts() from public, anon;
grant execute on function public.expire_stale_drafts() to authenticated;
