import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// public.shared_recipe(token) is SECURITY DEFINER: it reads past row-level security,
// so it alone decides what a friend can see. These tests pin its fields to exactly
// what /r/:shareToken shows, so a later change can't leak more without failing here.
// Run: npx playwright test --config playwright.supabase.config.ts

/** Every key the function may return, at each level of the JSON. */
const SHAPE = {
  top: ["title", "category", "yield", "totalTimeMinutes", "source", "rating", "ingredientGroups", "stepGroups", "ingredients", "steps"],
  yield: ["quantity", "unit", "unitPlural"],
  source: ["creatorHandle", "reelUrl"],
  group: ["id", "name"],
  ingredient: ["id", "groupId", "name", "grams", "status"],
  step: ["id", "groupId", "text", "timeMarks"],
  timeMark: ["text", "minutes"],
};
const ALL_KEYS = new Set(Object.values(SHAPE).flat());

/** The body of the latest definition of public.shared_recipe across the migrations. */
function sharedRecipeSource(): string {
  const dir = join(process.cwd(), "supabase", "migrations");
  let latest = "";
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    const sql = readFileSync(join(dir, file), "utf8");
    const re = /create\s+(?:or\s+replace\s+)?function\s+public\.shared_recipe\b[\s\S]*?\$\$([\s\S]*?)\$\$/gi;
    for (const match of sql.matchAll(re)) latest = match[1];
  }
  return latest;
}

test("static: shared_recipe returns only the allowed fields", () => {
  const body = sharedRecipeSource();
  expect(body, "public.shared_recipe is defined in supabase/migrations").not.toBe("");
  // JSON keys are the string literals followed by a comma inside jsonb_build_object(…).
  const keys = new Set([...body.matchAll(/'([A-Za-z]+)'\s*,/g)].map((m) => m[1]));
  expect([...keys].sort()).toEqual([...ALL_KEYS].sort());
  // Nothing private is read, even if a key were renamed to hide it.
  for (const column of ["owner_id", "favorite", "original", "created_at", "updated_at", "public.bakes", "step_ingredients", "what_changed", "how_it_turned_out"]) {
    expect(body, `shared_recipe must not read ${column}`).not.toContain(column);
  }
  expect(body).not.toMatch(/'id',\s*r\.id/); // the recipe's own id
});

test("static: shared_recipe is SECURITY DEFINER, STABLE, with a fixed search_path, executable only by anon and authenticated", () => {
  const sql = readdirSync(join(process.cwd(), "supabase", "migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(process.cwd(), "supabase", "migrations", f), "utf8"))
    .join("\n");
  const header = sql.match(/create\s+(?:or\s+replace\s+)?function\s+public\.shared_recipe\(p_token text\)([\s\S]*?)as \$\$/i)?.[1] ?? "";
  expect(header).toMatch(/\bstable\b/i);
  expect(header).toMatch(/\bsecurity definer\b/i);
  expect(header).toMatch(/set search_path = ''/i);
  expect(sql).toMatch(/revoke all on function public\.shared_recipe\(text\) from public;/i);
  expect(sql).toMatch(/grant execute on function public\.shared_recipe\(text\) to anon, authenticated;/i);
});

// ── Live: against the Supabase project, as an anonymous visitor ──
// Needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (the public key);
// BACKERY_TEST_SHARE_TOKEN (a real shared recipe's token) for the shape check.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const headers = { apikey: key ?? "", Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

test.describe("live", () => {
  test.skip(!url || !key, "set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to run");

  test("anonymous visitors can't read any table", async () => {
    for (const table of ["recipes", "ingredient_groups", "step_groups", "ingredients", "steps", "step_ingredients", "bakes", "share_links"]) {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
      const body = await res.text();
      // Permission denied (no grant), never rows.
      expect(res.ok, `${table}: ${res.status} ${body}`).toBe(false);
    }
  });

  test("anonymous visitors can't call save_recipe", async () => {
    const res = await fetch(`${url}/rest/v1/rpc/save_recipe`, { method: "POST", headers, body: JSON.stringify({ p_id: null, p_content: {} }) });
    expect(res.ok).toBe(false);
  });

  test("an unknown token returns nothing", async () => {
    const res = await fetch(`${url}/rest/v1/rpc/shared_recipe`, { method: "POST", headers, body: JSON.stringify({ p_token: "unknown-token-0000000000" }) });
    expect(res.ok).toBe(true);
    expect(await res.json()).toBeNull();
  });

  test("a shared recipe has exactly the allowed fields at every level", async () => {
    const token = process.env.BACKERY_TEST_SHARE_TOKEN;
    test.skip(!token, "set BACKERY_TEST_SHARE_TOKEN to a real share link's token");
    const res = await fetch(`${url}/rest/v1/rpc/shared_recipe`, { method: "POST", headers, body: JSON.stringify({ p_token: token }) });
    expect(res.ok).toBe(true);
    const r = await res.json();
    const keysOf = (o: object) => Object.keys(o).sort();
    expect(keysOf(r)).toEqual([...SHAPE.top].sort());
    expect(keysOf(r.yield)).toEqual([...SHAPE.yield].sort());
    if (r.source !== null) expect(keysOf(r.source)).toEqual([...SHAPE.source].sort());
    for (const g of [...r.ingredientGroups, ...r.stepGroups]) expect(keysOf(g)).toEqual([...SHAPE.group].sort());
    for (const i of r.ingredients) {
      expect(keysOf(i)).toEqual([...SHAPE.ingredient].sort());
      expect(i.status).not.toBe("converted");
    }
    for (const s of r.steps) {
      expect(keysOf(s)).toEqual([...SHAPE.step].sort());
      for (const m of s.timeMarks) expect(keysOf(m)).toEqual([...SHAPE.timeMark].sort());
    }
  });
});

// ── Live: the database's own catalog ──
// Every table in public must have row-level security on, so a later migration can't
// add an unprotected table. The public key can't read the catalog (by design), so this
// connects directly: BACKERY_TEST_DATABASE_URL is the connection string from the
// Supabase dashboard (Connect → Session pooler). It holds the database password: keep
// it in .env.local, never in the repo.

test.describe("live catalog", () => {
  const databaseUrl = process.env.BACKERY_TEST_DATABASE_URL;
  test.skip(!databaseUrl, "set BACKERY_TEST_DATABASE_URL to run");

  test("every table in public has row-level security on", async () => {
    const { default: postgres } = await import("postgres");
    const sql = postgres(databaseUrl!, { ssl: "require", max: 1, idle_timeout: 5 });
    try {
      const rows = await sql<{ relname: string; relrowsecurity: boolean }[]>`
        select c.relname, c.relrowsecurity
        from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind in ('r', 'p')
        order by 1`;
      expect(rows.length, "tables in public").toBeGreaterThan(0);
      expect(rows.filter((r) => !r.relrowsecurity).map((r) => r.relname), "tables without RLS").toEqual([]);
    } finally {
      await sql.end();
    }
  });
});
