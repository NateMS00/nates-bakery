import { cookies } from "next/headers";
import { DRAFTS, LIBRARY_RECIPES } from "./fixtures-library";
import { RECIPES } from "./fixtures";
import type { Draft, Recipe } from "./types";

// Fixture data held in server memory, standing in for the database until the
// backend is chosen. Writes (saving an import, editing a recipe) change it until
// the server restarts.
// - BACKERY_FIXTURE_DELAY_MS simulates latency, so Loading states can be seen.
// - BACKERY_FIXTURE_SET=empty | only-drafts switches to the Library's empty cases.
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

export async function db(): Promise<Db> {
  const ns = (await cookies()).get(FIXTURE_NS_COOKIE)?.value ?? "default";
  let found = store.__backeryDb!.get(ns);
  if (!found) {
    found = seed();
    store.__backeryDb!.set(ns, found);
  }
  return found;
}

async function simulatedLatency() {
  const ms = Number(process.env.BACKERY_FIXTURE_DELAY_MS ?? 0);
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  await simulatedLatency();
  return (await db()).recipes.find((r) => r.id === id) ?? null;
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
