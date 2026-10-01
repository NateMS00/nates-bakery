import { cookies } from "next/headers";
import { DRAFTS, LIBRARY_RECIPES, importedContent } from "./fixtures-library";
import { IMPORT_MS } from "./import";
import { RECIPES } from "./fixtures";
import { OWNER_NAME } from "@/lib/auth/stub";
import type { Draft, Recipe, SharedRecipe } from "./types";

// Fixture data held in server memory, standing in for the database until the
// backend is chosen. Writes (saving an import, editing a recipe) change it until
// the server restarts.
// - BACKERY_FIXTURE_DELAY_MS simulates latency, so Loading states can be seen.
// - BACKERY_FIXTURE_SET=empty | only-drafts switches to the Library's empty cases.
// - The backery_stub_fail_loads=1 cookie makes every load fail (the Error page).
// - The backery_fixture_ns cookie gives a browser its own copy of the fixtures, so
//   parallel Playwright tests can't see each other's writes.

export const FIXTURE_NS_COOKIE = "backery_fixture_ns";

interface Db {
  recipes: Recipe[];
  drafts: Draft[];
}

const store = globalThis as typeof globalThis & { __backeryDb?: Map<string, Db> };
store.__backeryDb ??= new Map();

function seed(): Db {
  const set = process.env.BACKERY_FIXTURE_SET ?? "full";
  return structuredClone({
    recipes: set === "full" ? [...RECIPES, ...LIBRARY_RECIPES] : [],
    drafts: set === "empty" ? [] : DRAFTS,
  });
}

// STUB fault injection: with this cookie set, every data load fails, so the Error page
// can be seen and tested before there's a real server to fail.
const FAIL_LOADS_COOKIE = "backery_stub_fail_loads";

export async function db(): Promise<Db> {
  const jar = await cookies();
  if (jar.get(FAIL_LOADS_COOKIE)?.value === "1") throw new Error("Simulated load failure (backery_stub_fail_loads)");
  const ns = jar.get(FIXTURE_NS_COOKIE)?.value ?? "default";
  let found = store.__backeryDb!.get(ns);
  if (!found) {
    found = seed();
    store.__backeryDb!.set(ns, found);
  }
  completeImports(found);
  return found;
}

/** STUB import service: a started import is ready IMPORT_MS after it began. */
function completeImports(data: Db) {
  for (const d of data.drafts) {
    if (d.status === "importing" && d.startedAt && Date.now() - d.startedAt >= IMPORT_MS) {
      d.status = "ready";
      d.content = importedContent(d.reelUrl);
      d.title = d.content.title;
      d.transcript = {
        caption: "Kouign-amann, the butteriest pastry in Brittany. Laminated dough, lots of sugar, caramelised edges.",
        spoken: "Laminate the dough with the butter, sprinkle sugar on every fold, roll it up, and bake until the sugar turns to caramel, about twenty-five minutes.",
      };
    }
  }
}

async function simulatedLatency() {
  const ms = Number(process.env.BACKERY_FIXTURE_DELAY_MS ?? 0);
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  await simulatedLatency();
  return (await db()).recipes.find((r) => r.id === id) ?? null;
}

/**
 * The recipe behind a share link, stripped of private fields, or null when the token
 * is unknown or revoked, or its recipe was deleted (all of them → /r/expired).
 */
export async function getSharedRecipe(token: string): Promise<SharedRecipe | null> {
  await simulatedLatency();
  const recipe = (await db()).recipes.find((r) => r.shareLink?.token === token);
  if (!recipe) return null;
  const { title, category, yield: makes, totalTimeMinutes, source, ingredientGroups, stepGroups, ingredients, steps, rating } = recipe;
  return { title, category, yield: makes, totalTimeMinutes, source, ingredientGroups, stepGroups, ingredients, steps, rating, sharedBy: OWNER_NAME };
}

export async function getRecipes(): Promise<Recipe[]> {
  await simulatedLatency();
  return (await db()).recipes;
}

export async function getDrafts(): Promise<Draft[]> {
  await simulatedLatency();
  return (await db()).drafts;
}

export async function getDraft(id: string): Promise<Draft | null> {
  await simulatedLatency();
  return (await db()).drafts.find((d) => d.id === id) ?? null;
}
