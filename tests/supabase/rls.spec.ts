import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The migrations, run in PGlite (Postgres in Node, no server) on top of a stand-in for
// what Supabase provides: the auth schema with auth.uid() read from the request's JWT
// subject, the anon and authenticated roles, and Supabase's default privileges (new
// tables and functions in public open to both roles). Then the owner, another
// signed-in account, and an anonymous visitor each try what they may and may not do.
// Run: npx playwright test --config playwright.supabase.config.ts

type DB = Awaited<ReturnType<typeof open>>;

const OWNER = "00000000-0000-0000-0000-00000000000a";
const OTHER = "00000000-0000-0000-0000-00000000000b";

const migrations = () => {
  const dir = join(process.cwd(), "supabase", "migrations");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(dir, f), "utf8"));
};

async function open() {
  const { PGlite } = await import("@electric-sql/pglite");
  const { pgcrypto } = await import("@electric-sql/pglite/contrib/pgcrypto");
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create schema extensions;
    create role anon nologin; create role authenticated nologin;
    grant usage on schema public, auth, extensions to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
    grant all on schema public to anon, authenticated;
  `);
  for (const sql of migrations()) await db.exec(sql);
  await db.exec(`insert into auth.users values ('${OWNER}'), ('${OTHER}')`);
  const as = async (role: "anon" | "authenticated" | "postgres", sub: string | null = null) =>
    db.exec(`reset role; select set_config('request.jwt.claim.sub', '${sub ?? ""}', false);${role === "postgres" ? "" : ` set role ${role};`}`);
  const q = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows;
  const fails = async (sql: string, params: unknown[] = []) => {
    try {
      await db.query(sql, params);
      return "";
    } catch (e) {
      return (e as Error).message;
    }
  };
  return { db, as, q, fails };
}

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
    { id: "i-yolks", groupId: "g-custard", name: "Egg yolks", grams: 108, status: "estimated" },
    { id: "i-cinnamon", groupId: null, name: "Cinnamon stick", grams: null, status: "to-taste" },
  ],
  steps: [
    { id: "s-1", groupId: "sg-pastry", text: "Mix and rest for 15 min.", timeMarks: [{ text: "15 min", minutes: 15, extra: "dropped" }], ingredientIds: ["i-flour"] },
    { id: "s-2", groupId: null, text: "Bake for 12 minutes.", timeMarks: [], ingredientIds: [] },
  ],
};

const TABLES = ["recipes", "ingredient_groups", "step_groups", "ingredients", "steps", "step_ingredients", "bakes", "share_links"];

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
  expect(rows.map((r) => r.relname).sort()).toEqual([...TABLES].sort());
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
  for (const secret of ["1¼", "Hotter oven", "favorite", OWNER, recipeId, "created"]) expect(json, secret).not.toContain(secret);

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
