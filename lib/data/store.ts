"use client";

import { useMemo, useSyncExternalStore } from "react";
import { discardDraft, getDraftStatus } from "./actions";
import type { Draft } from "./types";

// Client-side state for the Library's drafts: a still-importing draft is polled until
// it resolves, and Discard removes a row at once with Undo, both without a page
// reload (BONES-recipes.md). Recipe data (favorite, rating, bakes, share links) lives
// on the server; see lib/data/actions.ts.

const drafts = new Map<string, Draft>();
const hidden = new Set<string>();
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

/** Drafts with this session's changes applied, minus any pending Discard. */
export function useDrafts(initial: Draft[]): Draft[] {
  const v = useSyncExternalStore(subscribe, getVersion, getServerVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- v marks store changes
  return useMemo(() => initial.map((d) => drafts.get(d.id) ?? d).filter((d) => !hidden.has(d.id)), [initial, v]);
}

// An Importing draft is checked every POLL_MS until it's Ready to review or Couldn't
// finish. Keeps running across DraftsSection remounts (the Library hides Drafts while
// searching) since this store is module-level, not component state.
const POLL_MS = 3000;
const polling = new Set<string>();
export function pollImports(initial: Draft[]) {
  for (const d of initial) {
    if (d.status !== "importing" || polling.has(d.id)) continue;
    polling.add(d.id);
    const tick = async () => {
      const found = await getDraftStatus(d.id);
      if (!found) {
        polling.delete(d.id); // discarded elsewhere
        return;
      }
      if (found.status === "importing") {
        window.setTimeout(tick, POLL_MS);
        return;
      }
      drafts.set(d.id, { ...d, status: found.status, title: found.title });
      polling.delete(d.id);
      emit();
    };
    window.setTimeout(tick, POLL_MS);
  }
}

// Discard (BONES-recipes.md 1.4.0): the row disappears at once; the actual delete is
// deferred until Undo's window closes, so Undo never has to resurrect a row the server
// has already deleted. "Stays until the next action or 10 seconds": a second discard
// while one is already pending commits the first rather than losing it.
const UNDO_MS = 10_000;
let pendingDiscard: { id: string; timer: number } | null = null;

export function usePendingDiscard(): string | null {
  const v = useSyncExternalStore(subscribe, getVersion, getServerVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- v marks store changes
  return useMemo(() => pendingDiscard?.id ?? null, [v]);
}

export function discardDraftOptimistic(draftId: string) {
  commitPendingDiscard();
  hidden.add(draftId);
  const timer = window.setTimeout(commitPendingDiscard, UNDO_MS);
  pendingDiscard = { id: draftId, timer };
  emit();
}

export function commitPendingDiscard() {
  if (!pendingDiscard) return;
  window.clearTimeout(pendingDiscard.timer);
  discardDraft(pendingDiscard.id);
  pendingDiscard = null;
}

export function undoDiscard(draftId: string) {
  if (pendingDiscard?.id !== draftId) return;
  window.clearTimeout(pendingDiscard.timer);
  pendingDiscard = null;
  hidden.delete(draftId);
  emit();
}
