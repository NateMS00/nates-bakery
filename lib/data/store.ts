"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Draft } from "./types";

// Client-side state for the Library's drafts: the simulated import (STUB) turns an
// Importing draft into Ready to review without a reload. Recipe data (favorite,
// rating, bakes, share links) lives on the server; see lib/data/actions.ts.

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
