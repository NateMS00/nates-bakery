"use client";

import { useState } from "react";
import { ChoiceRadio } from "@/components/ui/ChoiceRadio";
import { Picture } from "@/components/ui/Picture";
import type { Recipe } from "@/lib/data/types";

type View = "latest" | "cover" | "last4";

/**
 * Computes the photo switch's options (SKIN split-hero): "Latest bake", "Cover",
 * "Last 4", kept only when each would show something the others don't — an option
 * whose one photo is identical to an earlier one in this list is dropped, and
 * "Last 4" needs at least two bake photos to be a contact sheet worth having. The
 * whole switch disappears below two options: a recipe's cover is always available
 * here (split-hero only renders with one), so there's nothing to choose between a
 * single photo and itself.
 */
function photoOptions(recipe: Recipe) {
  const latestPhoto = recipe.bakeLog[0]?.photo ?? null;
  const bakePhotos = recipe.bakeLog.map((b) => b.photo).filter((p): p is string => Boolean(p));
  const seen = new Set<string>();
  const options: { value: View; label: string }[] = [];
  if (latestPhoto && !seen.has(latestPhoto)) {
    seen.add(latestPhoto);
    options.push({ value: "latest", label: "Latest bake" });
  }
  if (recipe.cover && !seen.has(recipe.cover)) {
    seen.add(recipe.cover);
    options.push({ value: "cover", label: "Cover" });
  }
  if (bakePhotos.length >= 2) options.push({ value: "last4", label: "Last 4" });
  return options;
}

export function StagedPhoto({ recipe }: { recipe: Recipe }) {
  const options = photoOptions(recipe);
  const [view, setView] = useState<View>(options[0]?.value ?? "cover");
  const last4 = recipe.bakeLog
    .map((b) => b.photo)
    .filter((p): p is string => Boolean(p))
    .slice(0, 4);

  return (
    <div className="w-full max-w-[72%]">
      <div className="rounded-tile border border-outline bg-surface-card p-md">
        {view === "last4" ? (
          <div className="grid grid-cols-2 gap-xs">
            {last4.map((src, i) => (
              <Picture key={i} src={src} aspectRatio="1 / 1" rounded="none" className="w-full" />
            ))}
          </div>
        ) : (
          <Picture src={view === "latest" ? (recipe.bakeLog[0].photo ?? null) : recipe.cover} aspectRatio="4 / 3" rounded="none" className="w-full" />
        )}
      </div>
      {options.length >= 2 && (
        <ChoiceRadio legend="Photo" name="photo-view" options={options} value={view} onChange={(v) => setView(v as View)} className="mt-base justify-center" />
      )}
    </div>
  );
}
