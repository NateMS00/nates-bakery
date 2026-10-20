import { sortDiary, type DiaryEntry } from "./bakeDiary";
import { getRecipes } from "./recipes";

export type { DiaryEntry } from "./bakeDiary";

/**
 * Every bake across every recipe, newest first, for `/bakes` (BONES-bakes.md). Each
 * recipe's own `bakeLog` is already newest-first (Recipe.bakeLog), so the oldest
 * entry (last in the array) is ordinal 1.
 */
export async function getBakeDiary(): Promise<DiaryEntry[]> {
  const recipes = await getRecipes();
  const entries = recipes.flatMap((recipe) =>
    recipe.bakeLog.map((entry, i) => ({
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      entry,
      ordinal: recipe.bakeLog.length - i,
    })),
  );
  return sortDiary(entries);
}
