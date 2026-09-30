"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { BakeLogEntry, Draft, Recipe } from "./types";

// In-memory client store for owner edits (favorite, rating, bake log, share link)
// until there is a backend. Kept as patches over the server's recipe, so content
// saved on the server (an edit) always shows; patches last until a reload.

type Patch = Partial<Pick<Recipe, "favorite" | "rating" | "bakeLog" | "shareLink">>;
const patches = new Map<string, Patch>();
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
  return useMemo(() => initial.map(patched), [initial, v]);
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
    () => patched(initial),
    () => initial,
  );
}

// Patched objects are cached per server object, so snapshots stay stable.
const cache = new WeakMap<Recipe, { patch: Patch; value: Recipe }>();
function patched(r: Recipe): Recipe {
  const patch = patches.get(r.id);
  if (!patch) return r;
  const hit = cache.get(r);
  if (hit && hit.patch === patch) return hit.value;
  const value = { ...r, ...patch };
  cache.set(r, { patch, value });
  return value;
}

function update(initial: Recipe, change: (r: Recipe) => Patch) {
  patches.set(initial.id, { ...patches.get(initial.id), ...change(patched(initial)) });
  emit();
}

export function recipeActions(initial: Recipe) {
  return {
    setFavorite: (favorite: boolean) => update(initial, () => ({ favorite })),
    setRating: (rating: number | null) => update(initial, () => ({ rating })),
    /** Adds a log entry and returns it (with its new id), so it can be undone. */
    addBake: (fields: Omit<BakeLogEntry, "id">): BakeLogEntry => {
      const entry = { id: crypto.randomUUID(), ...fields };
      update(initial, (r) => ({ bakeLog: [entry, ...r.bakeLog] }));
      return entry;
    },
    removeBake: (entryId: string) =>
      update(initial, (r) => ({ bakeLog: r.bakeLog.filter((e) => e.id !== entryId) })),
    createShareLink: () =>
      update(initial, () => ({ shareLink: { token: randomToken(), createdAt: new Date().toISOString() } })),
    revokeShareLink: () => update(initial, () => ({ shareLink: null })),
  };
}

function randomToken() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
