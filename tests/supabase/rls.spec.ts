import { expect, test } from "@playwright/test";
import { OTHER, OWNER, open, type DB } from "./db";

// The migrations in PGlite (./db.ts). The owner, another signed-in account, and an
// anonymous visitor each try what they may and may not do with recipes.
// Run: npx playwright test --config playwright.supabase.config.ts

const CONTENT = {
  title: "Pastéis de nata",
  category: "pastry",
  yield: { quantity: 12, unit: "tart", unitPlural: "tarts" },
  totalTimeMinutes: 210,
  source: { creatorHandle: "forno.da.rita", reelUrl: "https://www.instagram.com/reel/C9nataRita01/" },
  ingredientGroups: [
    { id: "g-pastry", name: "Pastry" },
    { id: "g-custard", name: "Custard" },
  ],
  stepGroups: [{ id: "sg-pastry", name: "Pastry" }],
  ingredients: [
    { id: "i-flour", groupId: "g-pastry", name: "Plain flour", grams: 250, status: "confirmed" },
    { id: "i-sugar", groupId: "g-custard", name: "Caster sugar", grams: 250, status: "converted", original: "1¼ cups" },
    { id: "i-yolks", groupId: "g-custard", name: "Egg yolks", grams: 108, status: "estimated", original: "6 gemas", note: "Creator: use the freshest eggs" },
    { id: "i-cinnamon", groupId: null, name: "Cinnamon stick", grams: null, status: "to-taste" },
  ],
  steps: [
    { id: "s-1", groupId: "sg-pastry", text: "Mix and rest for 15 min.", timeMarks: [{ text: "15 min", minutes: 15, extra: "dropped" }], ingredientIds: ["i-flour"] },
    { id: "s-2", groupId: null, text: "Bake for 12 minutes.", timeMarks: [], ingredientIds: [] },
  ],
};

const TABLES = ["recipes", "ingredient_groups", "step_groups", "ingredients", "steps", "step_ingredients", "bakes", "share_links"];
/** 0002's import tables, checked in import.spec.ts. */
const IMPORT_TABLES = ["drafts", "import_keys", "import_fetches"];

test.describe.configure({ mode: "serial" });

let t: DB;
let recipeId: string;
let token: string;

test.beforeAll(async () => {
  t = await open();
});

test("every table in public has row-level security on", async () => {
  await t.as("postgres");
  const rows = await t.q<{ relname: string; relrowsecurity: boolean }>(
    "select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind in ('r', 'p') order by 1",
  );
  expect(rows.map((r) => r.relname).sort()).toEqual([...TABLES, ...IMPORT_TABLES].sort());
  expect(rows.filter((r) => !r.relrowsecurity).map((r) => r.relname), "tables without RLS").toEqual([]);
});

test("owner: save, edit, rate, bake, share", async () => {
  await t.as("authenticated", OWNER);
  [{ save_recipe: recipeId }] = await t.q<{ save_recipe: string }>("select public.save_recipe(null, $1::jsonb)", [JSON.stringify(CONTENT)]);
  expect(recipeId).toBeTruthy();
  const [parts] = await t.q<{ ing: number; st: number; si: number; tm: unknown }>(
    "select (select count(*) from public.ingredients where recipe_id=$1)::int ing, (select count(*) from public.steps where recipe_id=$1)::int st, (select count(*) from public.step_ingredients where recipe_id=$1)::int si, (select time_marks from public.steps where recipe_id=$1 and id='s-1') tm",
    [recipeId],
  );
  expect(parts).toEqual({ ing: 4, st: 2, si: 1, tm: [{ text: "15 min", minutes: 15 }] }); // time marks keep only text and minutes
  // Originals are kept for Converted and Estimated amounts; notes are kept as written.
  const kept = await t.q("select id, original, note from public.ingredients where recipe_id = $1 order by position", [recipeId]);
  expect(kept).toEqual([
    { id: "i-flour", original: null, note: null },
    { id: "i-sugar", original: "1¼ cups", note: null },
    { id: "i-yolks", original: "6 gemas", note: "Creator: use the freshest eggs" },
    { id: "i-cinnamon", original: null, note: null },
  ]);

  await t.q("update public.recipes set rating = 4, favorite = true where id = $1", [recipeId]);
  await t.q("insert into public.bakes (recipe_id, baked_on, scale, what_changed) values ($1, '2026-09-26', 1.5, 'Hotter oven')", [recipeId]);
  [{ token }] = await t.q<{ token: string }>("insert into public.share_links (recipe_id) values ($1) returning token", [recipeId]);
  expect(token).toMatch(/^[A-Za-z0-9_-]{24}$/);

  // Edit: the content is replaced; rating, favorite, bakes, and share link stay.
  const edited = { ...CONTENT, title: "Pastéis de nata (v2)", ingredients: CONTENT.ingredients.slice(0, 3), steps: [CONTENT.steps[0]] };
  await t.q("select public.save_recipe($1, $2::jsonb)", [recipeId, JSON.stringify(edited)]);
  const [after] = await t.q(
    "select r.title, r.rating, r.favorite, (select count(*) from public.ingredients where recipe_id=r.id)::int ing, (select count(*) from public.bakes where recipe_id=r.id)::int bakes, (select count(*) from public.share_links where recipe_id=r.id)::int links from public.recipes r where id=$1",
    [recipeId],
  );
  expect(after).toEqual({ title: "Pastéis de nata (v2)", rating: 4, favorite: true, ing: 3, bakes: 1, links: 1 });
});

test("the database rejects inconsistent recipes", async () => {
  await t.as("authenticated", OWNER);
  const noGrams = { ...CONTENT, ingredients: [{ id: "x", groupId: null, name: "Salt", grams: null, status: "confirmed" }] };
  expect(await t.fails("select public.save_recipe(null, $1::jsonb)", [JSON.stringify(noGrams)])).not.toBe("");
  const unknownGroup = { ...CONTENT, ingredients: [{ id: "x", groupId: "nope", name: "Salt", grams: 1, status: "confirmed" }] };
  expect(await t.fails("select public.save_recipe(null, $1::jsonb)", [JSON.stringify(unknownGroup)])).not.toBe("");
});

test("another signed-in account can't see or touch the owner's recipes", async () => {
  await t.as("authenticated", OTHER);
  for (const table of TABLES) expect(await t.q(`select * from public.${table}`), table).toEqual([]);
  expect(await t.q("update public.recipes set title = 'hacked' where id = $1 returning id", [recipeId])).toEqual([]);
  expect(await t.q("delete from public.recipes where id = $1 returning id", [recipeId])).toEqual([]);
  expect(await t.fails("select public.save_recipe($1, $2::jsonb)", [recipeId, JSON.stringify(CONTENT)])).toMatch(/recipe not found/);
  expect(await t.fails("insert into public.bakes (recipe_id, baked_on, scale) values ($1, '2026-10-01', 1)", [recipeId])).not.toBe("");
  expect(await t.fails("insert into public.share_links (recipe_id) values ($1)", [recipeId])).not.toBe("");
  expect(
    await t.fails("insert into public.recipes (owner_id, title, category, yield_quantity, yield_unit, yield_unit_plural) values ($1, 'x', 'cake', 1, 'cake', 'cakes')", [OWNER]),
  ).not.toBe("");
});

test("anonymous visitors can read no table and call only shared_recipe", async () => {
  await t.as("anon");
  for (const table of TABLES) expect(await t.fails(`select * from public.${table}`), table).toMatch(/permission denied/);
  expect(await t.fails("select public.save_recipe(null, '{}'::jsonb)")).toMatch(/permission denied/);
  expect(await t.fails("select public.touch_updated_at()")).not.toBe("");
});

test("shared_recipe returns exactly what /r/ shows", async () => {
  await t.as("anon");
  const [{ shared_recipe: r }] = await t.q<{ shared_recipe: Record<string, unknown> & { ingredients: Record<string, unknown>[]; steps: Record<string, unknown>[] } }>(
    "select public.shared_recipe($1)",
    [token],
  );
  const keys = (o: object) => Object.keys(o).sort();
  expect(keys(r)).toEqual(["category", "ingredientGroups", "ingredients", "rating", "source", "stepGroups", "steps", "title", "totalTimeMinutes", "yield"]);
  for (const i of r.ingredients) expect(keys(i)).toEqual(["grams", "groupId", "id", "name", "status"]);
  expect(r.ingredients.find((i) => i.id === "i-sugar")?.status).toBe("confirmed"); // converted, without "was 1¼ cups"
  for (const s of r.steps) expect(keys(s)).toEqual(["groupId", "id", "text", "timeMarks"]);
  const json = JSON.stringify(r);
  for (const secret of ["1¼", "6 gemas", "freshest", "Hotter oven", "favorite", OWNER, recipeId, "created"]) expect(json, secret).not.toContain(secret);

  expect((await t.q("select public.shared_recipe('unknown-token-0000000000') r"))[0].r).toBeNull();
  expect((await t.q("select public.shared_recipe('x') r"))[0].r).toBeNull();
  expect((await t.q("select public.shared_recipe(null) r"))[0].r).toBeNull();
});

test("revoking or deleting ends the link", async () => {
  await t.as("authenticated", OWNER);
  await t.q("delete from public.share_links where recipe_id = $1", [recipeId]);
  await t.as("anon");
  expect((await t.q("select public.shared_recipe($1) r", [token]))[0].r).toBeNull();

  await t.as("authenticated", OWNER);
  const [{ token: again }] = await t.q<{ token: string }>("insert into public.share_links (recipe_id) values ($1) returning token", [recipeId]);
  expect(again).not.toBe(token); // sharing again makes a new token
  await t.q("delete from public.recipes where id = $1", [recipeId]);
  await t.as("postgres");
  for (const table of TABLES) expect((await t.q<{ n: number }>(`select count(*)::int n from public.${table}`))[0].n, table).toBe(0);
});

test("deleting a recipe whose cover_bake_id is set: the bakes cascade and the cover's ON DELETE SET NULL fire in the same statement, cleanly", async () => {
  await t.as("authenticated", OWNER);
  const [{ save_recipe: id }] = await t.q<{ save_recipe: string }>("select public.save_recipe(null, $1::jsonb)", [JSON.stringify(CONTENT)]);
  const [{ id: coverBakeId }] = await t.q<{ id: string }>("insert into public.bakes (recipe_id, baked_on, scale) values ($1, '2026-10-01', 1) returning id", [id]);
  await t.q("insert into public.bakes (recipe_id, baked_on, scale) values ($1, '2026-09-01', 1)", [id]); // a second bake, not the cover
  await t.q("update public.recipes set cover_bake_id = $1 where id = $2", [coverBakeId, id]);

  // The delete itself must not error: recipes.cover_bake_id's ON DELETE SET NULL
  // would otherwise try to update the very recipe row the outer DELETE is removing.
  expect(await t.fails("delete from public.recipes where id = $1", [id])).toBe("");

  await t.as("postgres");
  expect(await t.q("select id from public.recipes where id = $1", [id])).toEqual([]);
  expect(await t.q("select id from public.bakes where recipe_id = $1", [id])).toEqual([]); // both bakes cascaded
});
