"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { BakeLogEntry, Draft, Recipe } from "./types";

// In-memory client store for owner edits (favorite, rating, bake log, share link)
// until there is a backend. Seeded per recipe from the server-rendered fixture;
// changes last until the page is reloaded.

const recipes = new Map<string, Recipe>();
const drafts = new Map<string, Draft>();
const listeners = new Set<() => void>();
let version = 0;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  version++;
  listeners.forEach((l) => l());
}

const getVersion = () => version;
const getServerVersion = () => 0;

/** A list of recipes with this session's edits applied (favorite, rating, bakes). */
export function useRecipes(initial: Recipe[]): Recipe[] {
  const v = useSyncExternalStore(subscribe, getVersion, getServerVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- v marks store changes
  return useMemo(() => initial.map((r) => recipes.get(r.id) ?? r), [initial, v]);
}

/** Drafts with this session's changes applied. */
export function useDrafts(initial: Draft[]): Draft[] {
  const v = useSyncExternalStore(subscribe, getVersion, getServerVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- v marks store changes
  return useMemo(() => initial.map((d) => drafts.get(d.id) ?? d), [initial, v]);
}

// STUB: stands in for the background import (SKELETON FLOW-01) until the import
// service exists: an Importing draft becomes Ready to review a few seconds after
// the Library first shows it, without a page reload.
const SIMULATED_IMPORT_MS = 8000;
const simulated = new Set<string>();
export function simulateImports(initial: Draft[]) {
  for (const d of initial) {
    if (d.status !== "importing" || simulated.has(d.id)) continue;
    simulated.add(d.id);
    window.setTimeout(() => {
      drafts.set(d.id, { ...d, status: "ready", title: "Kouign-amann" });
      emit();
    }, SIMULATED_IMPORT_MS);
  }
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
