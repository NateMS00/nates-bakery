import { CATEGORIES } from "@/lib/data/categories";
import { newId, type EditorIngredient, type EditorState, type EditorStep } from "@/lib/data/editor";
import type { Category, Group } from "@/lib/data/types";
import type { ExtractedIngredient, ExtractedRecipe } from "./extract";
import { toGrams, type ImportedAmount } from "./grams";

// lib/import/extract.ts's recipe → the Recipe Editor's form state (SKELETON FLOW-01
// step 4, BONES-import-detail's Recipe Editor), so Review Import opens the same way
// a hand-filled draft would. Grams are computed here, by the app's own table — never
// by the model (SKELETON: "Decided").

const CATEGORY_SLUGS = new Set<Category>(CATEGORIES.map((c) => c.slug));

function toCategory(raw: string | null): { category: Category | ""; suggested: boolean } {
  const slug = raw?.toLowerCase().trim();
  if (slug && CATEGORY_SLUGS.has(slug as Category)) return { category: slug as Category, suggested: true };
  return { category: "", suggested: false };
}

function toEditorIngredient(item: ExtractedIngredient, groupId: string | null, onUnknown: (name: string) => void): EditorIngredient {
  const amount: ImportedAmount = { name: item.name, amount: item.amount, parts: item.parts };
  const conversion = toGrams(amount);
  const base = { id: newId("i"), groupId, name: item.name, note: item.note ?? undefined };
  switch (conversion.status) {
    case "confirmed":
      return { ...base, amount: String(conversion.grams), toTaste: false, status: "confirmed" };
    case "converted":
    case "estimated":
      return { ...base, amount: String(conversion.grams), toTaste: false, status: conversion.status, original: conversion.original };
    case "to-taste":
      return { ...base, amount: "", toTaste: true, status: "confirmed" };
    case "missing":
      if (conversion.unknown) onUnknown(item.name);
      return { ...base, amount: "", toTaste: false, status: "confirmed", original: conversion.original };
  }
}

/** Builds a Group per named section; items whose group has no name stay ungrouped (groupId: null). */
function groupId(name: string | null, prefix: string, groups: Group[]): string | null {
  if (!name) return null;
  const id = newId(prefix);
  groups.push({ id, name });
  return id;
}

export interface ToEditorStateResult {
  state: EditorState;
  /** Ingredient or unit names the grams table doesn't know, so it can grow (SKELETON). */
  unknownNames: string[];
}

export function toEditorState(recipe: ExtractedRecipe, source: { reelUrl: string; creatorHandle?: string }): ToEditorStateResult {
  const unknownNames: string[] = [];
  const ingredientGroups: Group[] = [];
  const ingredients: EditorIngredient[] = [];
  for (const g of recipe.ingredientGroups) {
    const gid = groupId(g.name, "ig", ingredientGroups);
    for (const item of g.items) ingredients.push(toEditorIngredient(item, gid, (name) => unknownNames.push(name)));
  }

  const nameToId = new Map(ingredients.map((i) => [i.name.trim().toLowerCase(), i.id] as const));

  const stepGroups: Group[] = [];
  const steps: EditorStep[] = [];
  for (const g of recipe.stepGroups) {
    const gid = groupId(g.name, "sg", stepGroups);
    for (const step of g.items) {
      const ingredientIds = step.uses.map((u) => nameToId.get(u.trim().toLowerCase())).filter((id): id is string => Boolean(id));
      steps.push({ id: newId("s"), groupId: gid, text: step.text, ingredientIds });
    }
  }

  const { category, suggested } = toCategory(recipe.category);

  const state: EditorState = {
    title: recipe.title ?? "",
    category,
    categorySuggested: suggested,
    yieldQuantity: recipe.yield ? String(recipe.yield.quantity) : "",
    yieldUnit: recipe.yield ? (recipe.yield.quantity === 1 ? recipe.yield.unit : recipe.yield.unitPlural) : "",
    hours: recipe.totalTime?.hours ? String(recipe.totalTime.hours) : "",
    minutes: recipe.totalTime?.minutes ? String(recipe.totalTime.minutes) : "",
    sourceUrl: source.reelUrl,
    creatorHandle: source.creatorHandle,
    ingredientGroups,
    stepGroups,
    ingredients,
    steps,
  };
  return { state, unknownNames };
}
