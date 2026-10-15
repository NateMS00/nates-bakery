-- Nate's Bakery, the automatic retry-once (SKELETON 1.4.5): when Apple Intelligence's
-- reply doesn't parse, the finish-import route gets one retry per draft before the
-- draft reaches "Couldn't finish". drafts has no record of a retry having already
-- happened, so this adds one.
--
-- Run once after 0002, as the database owner (the dashboard's SQL editor does), in
-- one transaction. Then run supabase/checks/0003_verify.sql.

alter table public.drafts add column retried boolean not null default false;

-- import_mark_retry: true the first time a draft's reply fails to parse (go run Apple
-- Intelligence again on the same caption); false every time after (the caller then
-- calls import_unfinished). Atomic, so two retries racing can't both succeed.
create function public.import_mark_retry(p_key text, p_draft uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner uuid := public.import_key_owner(p_key);
  v_marked boolean;
begin
  if v_owner is null then
    return false;
  end if;
  update public.drafts set retried = true
  where id = p_draft and owner_id = v_owner and status = 'reading' and retried = false
  returning true into v_marked;
  return coalesce(v_marked, false);
end;
$$;

revoke all on function public.import_mark_retry(text, uuid) from public;
grant execute on function public.import_mark_retry(text, uuid) to anon, authenticated;

-- import_retry (0002) also backs the finish-import route's caption lookup (it needs
-- the reel's URL too, to build the recipe's source once the reply parses), so this
-- adds reelUrl to its answer. Same signature, same behavior otherwise.
create or replace function public.import_retry(p_key text, p_draft uuid)
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
  select d.id, d.status, d.caption, d.creator_handle, d.reel_url into v_draft from public.drafts d
  where d.id = p_draft and d.owner_id = v_owner and d.status <> 'fetching';
  if not found then
    return jsonb_build_object('status', 'gone');
  elsif v_draft.status = 'ready' then
    return jsonb_build_object('status', 'ready', 'draftId', v_draft.id);
  end if;
  update public.drafts set status = 'reading' where id = v_draft.id;
  return jsonb_build_object('status', 'caption', 'draftId', v_draft.id, 'caption', v_draft.caption, 'creatorHandle', v_draft.creator_handle, 'reelUrl', v_draft.reel_url);
end;
$$;
