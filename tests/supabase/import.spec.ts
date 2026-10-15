import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OTHER, OWNER, open, type DB } from "./db";

// 0002_import.sql in PGlite (./db.ts): the import key, the import functions the server
// calls for the Shortcut, drafts, and the thumbnail bucket's policies.
// Run: npx playwright test --config playwright.supabase.config.ts

const REEL = "https://www.instagram.com/reel/Dc3kS3GRdEE/";
const CAPTION = "Galletas con chispas 🍪\n2 ½ tazas de harina\n1 barra de mantequilla";
const CONTENT = { title: "Chocolate chip cookies", ingredients: [], steps: [] };

test.describe.configure({ mode: "serial" });

let t: DB;
let key: string;

test.beforeAll(async () => {
  t = await open();
});

type Answer = { status: string; draftId?: string; caption?: string; creatorHandle?: string | null; recipeId?: string; title?: string };
const begin = async (k: string, url: string, again = false) =>
  (await t.q<{ r: Answer }>("select public.import_begin($1, $2, $3) r", [k, url, again]))[0].r;
const call = async (fn: string, args: unknown[]) =>
  (await t.q<{ r: unknown }>(`select public.${fn}(${args.map((_, i) => `$${i + 1}`).join(", ")}) r`, args))[0].r;

test("the import key: shown once, stored as a hash, replaced on revoke", async () => {
  await t.as("anon");
  expect(await t.fails("select public.create_import_key()")).toMatch(/permission denied/);

  await t.as("authenticated", OWNER);
  [{ k: key }] = await t.q<{ k: string }>("select public.create_import_key() k");
  expect(key).toMatch(/^nbk_[A-Za-z0-9_-]{43}$/);
  // The owner sees when it was made, never the hash.
  expect(await t.q("select owner_id from public.import_keys")).toEqual([{ owner_id: OWNER }]);
  expect(await t.fails("select key_hash from public.import_keys")).toMatch(/permission denied/);
  expect(await t.fails("insert into public.import_keys (owner_id, key_hash) values ($1, '\\x00')", [OWNER])).toMatch(/permission denied/);

  await t.as("postgres");
  const [{ hex }] = await t.q<{ hex: string }>("select encode(key_hash, 'hex') hex from public.import_keys");
  expect(hex).toHaveLength(64);
  expect(hex).not.toContain(Buffer.from(key).toString("hex")); // not the key itself

  // Another account can't see the owner's key.
  await t.as("authenticated", OTHER);
  expect(await t.q("select owner_id from public.import_keys")).toEqual([]);

  // Revoke and create a new one: the old key stops at once.
  await t.as("authenticated", OWNER);
  const old = key;
  [{ k: key }] = await t.q<{ k: string }>("select public.create_import_key() k");
  expect(key).not.toBe(old);
  await t.as("anon");
  expect(await begin(old, REEL)).toEqual({ status: "bad-key" });
  expect((await begin(key, "https://www.instagram.com/reel/AnyOther01/")).status).toBe("fetch");
  await t.as("postgres");
  await t.q("delete from public.drafts");
  await t.q("delete from public.import_fetches");
});

test("wrong or malformed keys get nothing", async () => {
  await t.as("anon");
  for (const bad of ["", "nbk_short", `nbk_${"A".repeat(43)}`, key.slice(0, -1) + (key.endsWith("A") ? "B" : "A"), null]) {
    expect(await begin(bad as string, REEL)).toEqual({ status: "bad-key" });
    expect(await call("import_get_caption", [bad, "00000000-0000-0000-0000-000000000001"])).toEqual({ status: "bad-key" });
  }
  expect(await t.fails("select public.import_key_owner($1)", [key])).toMatch(/permission denied/);
  await t.as("postgres");
  expect((await t.q<{ n: number }>("select count(*)::int n from public.drafts"))[0].n).toBe(0);
});

test("a whole import: fetch, caption, recipe, ready", async () => {
  await t.as("anon");
  expect(await begin(key, "https://instagram.com/reel/x")).toEqual({ status: "invalid" });

  const first = await begin(key, REEL);
  expect(first.status).toBe("fetch");
  const draftId = first.draftId!;
  expect(await call("import_set_caption", [key, draftId, CAPTION, "chef.ana", "https://scontent.cdninstagram.com/v/t51/thumb.jpg"])).toBe(true);
  // Caption already stored: no second fetch, no new draft.
  expect(await call("import_set_caption", [key, draftId, "other", null, null])).toBe(false);

  // Shared again while Apple Intelligence reads it: the stored caption, no Apify call.
  expect(await begin(key, REEL)).toEqual({ status: "caption", draftId, caption: CAPTION, creatorHandle: "chef.ana" });

  // The owner sees it under Drafts, but can't move it through its states.
  await t.as("authenticated", OWNER);
  const [draft] = await t.q("select status, caption, creator_handle, thumbnail_url, content from public.drafts where id = $1", [draftId]);
  expect(draft).toEqual({ status: "reading", caption: CAPTION, creator_handle: "chef.ana", thumbnail_url: "https://scontent.cdninstagram.com/v/t51/thumb.jpg", content: null });
  expect(await t.fails("update public.drafts set status = 'ready' where id = $1", [draftId])).toMatch(/permission denied/);
  expect(await t.fails("insert into public.drafts (owner_id, reel_url) values ($1, $2)", [OWNER, REEL])).toMatch(/permission denied/);

  await t.as("anon");
  expect(await call("import_finish", [key, draftId, "Chocolate chip cookies", "Spanish", JSON.stringify(CONTENT)])).toBe(true);
  expect(await call("import_unfinished", [key, draftId])).toBe(false); // ready drafts stay ready
  expect(await call("import_drop", [key, draftId])).toBe(false);
  expect(await begin(key, REEL)).toEqual({ status: "ready", draftId });

  await t.as("authenticated", OWNER);
  const [ready] = await t.q("select status, title, caption_language, content from public.drafts where id = $1", [draftId]);
  expect(ready).toEqual({ status: "ready", title: "Chocolate chip cookies", caption_language: "Spanish", content: CONTENT });
  // Autosave: the owner edits the content and title.
  expect(await t.q("update public.drafts set title = 'Cookies', content = '{\"title\":\"Cookies\"}' where id = $1 returning id", [draftId])).toHaveLength(1);
  // Discard.
  expect(await t.q("delete from public.drafts where id = $1 returning id", [draftId])).toHaveLength(1);
});

test("couldn't finish, then Retry reuses the caption", async () => {
  await t.as("anon");
  const { draftId } = await begin(key, "https://www.instagram.com/reel/Retry0001/");
  await call("import_set_caption", [key, draftId, CAPTION, null, "javascript:alert(1)"]);
  expect(await call("import_unfinished", [key, draftId])).toBe(true);
  expect(await call("import_get_caption", [key, draftId])).toEqual({ status: "caption", draftId, caption: CAPTION, creatorHandle: null, reelUrl: "https://www.instagram.com/reel/Retry0001/" });
  await t.as("postgres");
  const [row] = await t.q("select status, thumbnail_url from public.drafts where id = $1", [draftId]);
  expect(row).toEqual({ status: "reading", thumbnail_url: null }); // only https image links are kept

  await t.as("anon");
  expect(await call("import_get_caption", [key, "00000000-0000-0000-0000-000000000001"])).toEqual({ status: "gone" });
  expect(await call("import_drop", [key, draftId])).toBe(true);
  expect(await call("import_get_caption", [key, draftId])).toEqual({ status: "gone" });
});

test("the automatic retry-once: the first bad reply retries, the second gives up", async () => {
  await t.as("anon");
  const { draftId } = await begin(key, "https://www.instagram.com/reel/Retry0002/");
  await call("import_set_caption", [key, draftId, CAPTION, "chef.ana", null]);

  // First malformed reply: retry, same caption, draft stays "reading".
  expect(await call("import_mark_retry", [key, draftId])).toBe(true);
  await t.as("postgres");
  expect(await t.q("select status, retried from public.drafts where id = $1", [draftId])).toEqual([{ status: "reading", retried: true }]);

  // Second malformed reply: no more retries; the caller marks it unfinished.
  await t.as("anon");
  expect(await call("import_mark_retry", [key, draftId])).toBe(false);
  expect(await call("import_unfinished", [key, draftId])).toBe(true);

  // A wrong key or an unknown draft never retries.
  expect(await call("import_mark_retry", ["nbk_wrong", draftId])).toBe(false);
  expect(await call("import_mark_retry", [key, "00000000-0000-0000-0000-000000000001"])).toBe(false);

  await t.as("authenticated", OWNER);
  expect(await t.fails("update public.drafts set retried = false where id = $1", [draftId])).toMatch(/permission denied/);
});

test("a failed fetch is dropped, and a stuck one is cleaned up", async () => {
  await t.as("anon");
  const { draftId } = await begin(key, "https://www.instagram.com/p/Private01/");
  expect(await call("import_drop", [key, draftId])).toBe(true);

  const stuck = await begin(key, "https://www.instagram.com/reel/Stuck0001/");
  await t.as("postgres");
  await t.q("update public.drafts set created_at = now() - interval '4 minutes' where id = $1", [stuck.draftId]);
  await t.as("anon");
  const next = await begin(key, "https://www.instagram.com/reel/Stuck0001/");
  expect(next.status).toBe("fetch");
  expect(next.draftId).not.toBe(stuck.draftId);
  await t.as("postgres");
  expect(await t.q("select id from public.drafts where id = $1", [stuck.draftId])).toEqual([]);
  await t.q("delete from public.drafts");
});

test("expire_stale_drafts: a draft stuck reading for 10+ minutes becomes Couldn't finish", async () => {
  await t.as("anon");
  const { draftId } = await begin(key, "https://www.instagram.com/reel/Stale0001/");
  await call("import_set_caption", [key, draftId, CAPTION, null, null]);

  // Not stale yet: calling it does nothing.
  await t.as("authenticated", OWNER);
  await t.q("select public.expire_stale_drafts()");
  expect(await t.q("select status from public.drafts where id = $1", [draftId])).toEqual([{ status: "reading" }]);

  // updated_at (drafts_touch_updated_at), not created_at: a draft retried just under
  // the line isn't wrongly expired. The touch trigger overwrites updated_at on any
  // ordinary update, so disable it just for this backdating.
  await t.as("postgres");
  await t.q("alter table public.drafts disable trigger drafts_touch_updated_at");
  await t.q("update public.drafts set updated_at = now() - interval '11 minutes' where id = $1", [draftId]);
  await t.q("alter table public.drafts enable trigger drafts_touch_updated_at");
  // Scoped to the caller's own drafts: another signed-in account's call is a no-op here.
  await t.as("authenticated", OTHER);
  await t.q("select public.expire_stale_drafts()");
  await t.as("postgres");
  expect(await t.q("select status from public.drafts where id = $1", [draftId])).toEqual([{ status: "reading" }]);

  await t.as("authenticated", OWNER);
  await t.q("select public.expire_stale_drafts()");
  expect(await t.q("select status from public.drafts where id = $1", [draftId])).toEqual([{ status: "unfinished" }]);

  await t.as("postgres");
  await t.q("delete from public.drafts");
});

test("already saved, unless importing again", async () => {
  await t.as("authenticated", OWNER);
  const saved = {
    title: "Kouign-amann",
    category: "viennoiserie",
    yield: { quantity: 8, unit: "pastry", unitPlural: "pastries" },
    totalTimeMinutes: 0,
    source: { creatorHandle: "chef.ana", reelUrl: REEL },
    ingredientGroups: [],
    stepGroups: [],
    ingredients: [],
    steps: [],
  };
  const [{ id }] = await t.q<{ id: string }>("select public.save_recipe(null, $1::jsonb) id", [JSON.stringify(saved)]);
  await t.as("anon");
  expect(await begin(key, REEL)).toEqual({ status: "already", recipeId: id, title: "Kouign-amann" });
  expect((await begin(key, REEL, true)).status).toBe("fetch");
  // Another account's key never sees the owner's recipes.
  await t.as("authenticated", OTHER);
  const [{ k: otherKey }] = await t.q<{ k: string }>("select public.create_import_key() k");
  await t.as("anon");
  expect((await begin(otherKey, REEL)).status).toBe("fetch");
  await t.as("postgres");
  await t.q("delete from public.drafts");
  await t.q("delete from public.recipes");
});

test("at most 30 caption fetches in 24 hours", async () => {
  await t.as("postgres");
  await t.q("delete from public.import_fetches");
  await t.q("insert into public.import_fetches (owner_id, fetched_at) select $1, now() - interval '25 hours' from generate_series(1, 5)", [OWNER]);
  await t.as("anon");
  for (let i = 0; i < 30; i++) expect((await begin(key, `https://www.instagram.com/reel/Limit${String(i).padStart(4, "0")}/`)).status).toBe("fetch");
  expect(await begin(key, "https://www.instagram.com/reel/Limit0030/")).toEqual({ status: "limit" });
  // Drafts that already have their caption don't count: no Apify call.
  await t.as("postgres");
  const [{ id }] = await t.q<{ id: string }>("select id from public.drafts where reel_url = 'https://www.instagram.com/reel/Limit0000/'");
  await t.as("anon");
  await call("import_set_caption", [key, id, CAPTION, null, null]);
  expect((await begin(key, "https://www.instagram.com/reel/Limit0000/")).status).toBe("caption");
  await t.as("postgres");
  expect((await t.q<{ n: number }>("select count(*)::int n from public.import_fetches"))[0].n).toBe(30); // older ones pruned
  await t.q("delete from public.drafts");
});

test("drafts and the import tables are private", async () => {
  await t.as("anon");
  const { draftId } = await begin(key, "https://www.instagram.com/reel/Private02/");
  for (const table of ["drafts", "import_keys", "import_fetches"]) expect(await t.fails(`select * from public.${table}`), table).toMatch(/permission denied/);
  await t.as("authenticated", OTHER);
  expect(await t.q("select id from public.drafts")).toEqual([]);
  expect(await t.q("delete from public.drafts where id = $1 returning id", [draftId])).toEqual([]);
  expect(await t.fails("select * from public.import_fetches")).toMatch(/permission denied/);
  // Another account's key can't touch the owner's draft.
  const [{ k: otherKey }] = await t.q<{ k: string }>("select public.create_import_key() k");
  await t.as("anon");
  expect(await call("import_set_caption", [otherKey, draftId, "x", null, null])).toBe(false);
  expect(await call("import_drop", [otherKey, draftId])).toBe(false);
  expect(await call("import_get_caption", [otherKey, draftId])).toEqual({ status: "gone" });
});

test("the thumbnail path is saved and kept while the reel stays the same", async () => {
  await t.as("authenticated", OWNER);
  const base = {
    title: "Brownies",
    category: "cookie-bar",
    yield: { quantity: 16, unit: "brownie", unitPlural: "brownies" },
    totalTimeMinutes: 0,
    ingredientGroups: [],
    stepGroups: [],
    ingredients: [],
    steps: [],
  };
  const path = `${OWNER}/brownies.jpg`;
  const [{ id }] = await t.q<{ id: string }>("select public.save_recipe(null, $1::jsonb) id", [
    JSON.stringify({ ...base, source: { creatorHandle: "chef.ana", reelUrl: REEL, thumbnailPath: path } }),
  ]);
  const thumb = async () => (await t.q<{ p: string | null }>("select source_thumbnail_path p from public.recipes where id = $1", [id]))[0].p;
  expect(await thumb()).toBe(path);
  await t.q("select public.save_recipe($1, $2::jsonb)", [id, JSON.stringify({ ...base, title: "Fudgy brownies", source: { creatorHandle: "chef.ana", reelUrl: REEL } })]);
  expect(await thumb()).toBe(path); // the editor doesn't carry it
  await t.q("select public.save_recipe($1, $2::jsonb)", [id, JSON.stringify({ ...base, source: { creatorHandle: "x", reelUrl: "https://www.instagram.com/reel/Other0001/" } })]);
  expect(await thumb()).toBeNull(); // another reel: not its picture
  await t.q("select public.save_recipe($1, $2::jsonb)", [id, JSON.stringify({ ...base, source: null })]);
  expect(await thumb()).toBeNull();
});

test("the thumbnail bucket is private, one folder per owner", async () => {
  await t.as("postgres");
  expect(await t.q("select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'recipe-thumbnails'")).toEqual([
    { public: false, file_size_limit: 2097152, allowed_mime_types: ["image/jpeg", "image/png", "image/webp"] },
  ]);

  await t.as("authenticated", OWNER);
  expect(await t.q("insert into storage.objects (bucket_id, name) values ('recipe-thumbnails', $1) returning name", [`${OWNER}/a.jpg`])).toHaveLength(1);
  expect(await t.fails("insert into storage.objects (bucket_id, name) values ('recipe-thumbnails', $1)", [`${OTHER}/a.jpg`])).toMatch(/row-level security/);
  expect(await t.fails("insert into storage.objects (bucket_id, name) values ('recipe-thumbnails', 'a.jpg')")).toMatch(/row-level security/);

  await t.as("authenticated", OTHER);
  expect(await t.q("select name from storage.objects")).toEqual([]);
  expect(await t.q("delete from storage.objects returning name")).toEqual([]);
  await t.as("anon");
  expect(await t.q("select name from storage.objects")).toEqual([]);
  expect(await t.fails("insert into storage.objects (bucket_id, name) values ('recipe-thumbnails', $1)", [`${OWNER}/b.jpg`])).toMatch(/row-level security/);

  await t.as("authenticated", OWNER);
  expect(await t.q("select name from storage.objects")).toEqual([{ name: `${OWNER}/a.jpg` }]);
  expect(await t.q("delete from storage.objects returning name")).toEqual([{ name: `${OWNER}/a.jpg` }]);
});

test("supabase/checks/0002_verify.sql: every row ok", async () => {
  // A snapshot of the schema right after 0002, before 0003 renamed import_retry —
  // its own isolated database, since the shared one above is fully current.
  const t2 = await open({ upTo: "0002" });
  await t2.as("postgres");
  const rows = await t2.q<{ check_name: string; result: string; expected: string; ok: boolean }>(
    readFileSync(join(process.cwd(), "supabase", "checks", "0002_verify.sql"), "utf8"),
  );
  expect(rows).toHaveLength(21);
  expect(rows.filter((r) => !r.ok)).toEqual([]);
});

test("supabase/checks/0003_verify.sql: every row ok", async () => {
  await t.as("postgres");
  const rows = await t.q<{ check_name: string; result: string; expected: string; ok: boolean }>(
    readFileSync(join(process.cwd(), "supabase", "checks", "0003_verify.sql"), "utf8"),
  );
  expect(rows).toHaveLength(9);
  expect(rows.filter((r) => !r.ok)).toEqual([]);
});

test("supabase/checks/0004_verify.sql: every row ok", async () => {
  await t.as("postgres");
  const rows = await t.q<{ check_name: string; result: string; expected: string; ok: boolean }>(
    readFileSync(join(process.cwd(), "supabase", "checks", "0004_verify.sql"), "utf8"),
  );
  expect(rows).toHaveLength(3);
  expect(rows.filter((r) => !r.ok)).toEqual([]);
});
