import { DRAFTS, LIBRARY_RECIPES } from "./fixtures-library";
import { RECIPES } from "./fixtures";
import type { Draft, Recipe } from "./types";

// Fixture-backed data access.
// - BACKERY_FIXTURE_DELAY_MS simulates latency, so Loading states can be seen.
// - BACKERY_FIXTURE_SET=empty | only-drafts switches to the Library's empty cases.

async function simulatedLatency() {
  const ms = Number(process.env.BACKERY_FIXTURE_DELAY_MS ?? 0);
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}

const fixtureSet = () => process.env.BACKERY_FIXTURE_SET ?? "full";

function allRecipes(): Recipe[] {
  return fixtureSet() === "full" ? [...RECIPES, ...LIBRARY_RECIPES] : [];
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  await simulatedLatency();
  return allRecipes().find((r) => r.id === id) ?? null;
}

export async function getRecipes(): Promise<Recipe[]> {
  await simulatedLatency();
  return allRecipes();
}

export async function getDrafts(): Promise<Draft[]> {
  await simulatedLatency();
  return fixtureSet() === "empty" ? [] : DRAFTS;
}
