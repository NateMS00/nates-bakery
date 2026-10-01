"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as server from "./actions";
import { sortLog } from "./bakeLog";
import type { BakeLogEntry, Recipe } from "./types";

// The owner's edits on the Recipe page and Bake Log (favorite, rating, bakes, share
// link): applied here at once so the page responds immediately, saved through the
// server actions, then the route refreshes so every page reads the same data.

export function useOwnerRecipe(initial: Recipe) {
  const router = useRouter();
  const [recipe, setRecipe] = useState(initial);
  const [base, setBase] = useState(initial);
  // A refreshed server recipe replaces the local copy.
  if (base !== initial) {
    setBase(initial);
    setRecipe(initial);
  }

  const actions = useMemo(() => {
    const id = initial.id;
    const patch = (change: (r: Recipe) => Partial<Recipe>) => setRecipe((r) => ({ ...r, ...change(r) }));
    const done = () => router.refresh();
    return {
      setFavorite: async (favorite: boolean) => {
        patch(() => ({ favorite }));
        await server.setFavorite(id, favorite);
        done();
      },
      setRating: async (rating: number | null) => {
        patch(() => ({ rating }));
        await server.setRating(id, rating);
        done();
      },
      /** Saves a new entry and returns it (with its id), or null if the recipe is gone. */
      addBake: async (fields: server.BakeFields): Promise<BakeLogEntry | null> => {
        const entry = await server.addBake(id, fields);
        if (entry) patch((r) => ({ bakeLog: sortLog([entry, ...r.bakeLog]) }));
        done();
        return entry;
      },
      updateBake: async (entryId: string, fields: server.BakeFields): Promise<boolean> => {
        const ok = await server.updateBake(id, entryId, fields);
        if (ok) patch((r) => ({ bakeLog: sortLog(r.bakeLog.map((e) => (e.id === entryId ? { id: entryId, ...fields } : e))) }));
        done();
        return ok;
      },
      removeBake: async (entryId: string) => {
        patch((r) => ({ bakeLog: r.bakeLog.filter((e) => e.id !== entryId) }));
        await server.deleteBake(id, entryId);
        done();
      },
      createShareLink: async () => {
        const shareLink = await server.createShareLink(id);
        patch(() => ({ shareLink }));
        done();
      },
      revokeShareLink: async () => {
        patch(() => ({ shareLink: null }));
        await server.revokeShareLink(id);
        done();
      },
    };
  }, [initial.id, router]);

  return { recipe, actions };
}
