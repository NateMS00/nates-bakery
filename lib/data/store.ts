"use client";

import { useSyncExternalStore } from "react";
import type { BakeLogEntry, Recipe } from "./types";

// In-memory client store for owner edits (favorite, rating, bake log, share link)
// until there is a backend. Seeded per recipe from the server-rendered fixture;
// changes last until the page is reloaded.

const recipes = new Map<string, Recipe>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

export function useRecipe(initial: Recipe): Recipe {
  return useSyncExternalStore(
    subscribe,
    () => recipes.get(initial.id) ?? initial,
    () => initial,
  );
}

function update(initial: Recipe, change: (r: Recipe) => Recipe) {
  const current = recipes.get(initial.id) ?? initial;
  recipes.set(initial.id, change(current));
  emit();
}

export function recipeActions(initial: Recipe) {
  return {
    setFavorite: (favorite: boolean) => update(initial, (r) => ({ ...r, favorite })),
    setRating: (rating: number | null) => update(initial, (r) => ({ ...r, rating })),
    /** Adds a log entry and returns it (with its new id), so it can be undone. */
    addBake: (fields: Omit<BakeLogEntry, "id">): BakeLogEntry => {
      const entry = { id: crypto.randomUUID(), ...fields };
      update(initial, (r) => ({ ...r, bakeLog: [entry, ...r.bakeLog] }));
      return entry;
    },
    removeBake: (entryId: string) =>
      update(initial, (r) => ({ ...r, bakeLog: r.bakeLog.filter((e) => e.id !== entryId) })),
    createShareLink: () =>
      update(initial, (r) => ({
        ...r,
        shareLink: { token: randomToken(), createdAt: new Date().toISOString() },
      })),
    revokeShareLink: () => update(initial, (r) => ({ ...r, shareLink: null })),
  };
}

function randomToken() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
