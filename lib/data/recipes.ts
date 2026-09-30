import { RECIPES } from "./fixtures";
import type { Recipe } from "./types";

// Fixture-backed data access. BACKERY_FIXTURE_DELAY_MS simulates latency in
// development so the Loading state can be seen and screenshotted.

async function simulatedLatency() {
  const ms = Number(process.env.BACKERY_FIXTURE_DELAY_MS ?? 0);
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  await simulatedLatency();
  return RECIPES.find((r) => r.id === id) ?? null;
}
