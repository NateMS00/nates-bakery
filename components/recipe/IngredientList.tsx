"use client";

import { useState } from "react";
import { GroupHeading } from "@/components/ui/SectionHeading";
import { ConvertedMarker, EstimatedMarker } from "@/components/ui/Marker";
import { formatGrams } from "@/lib/format";
import type { Group, Ingredient } from "@/lib/data/types";

// BONES Ingredients: one row per ingredient, grams on a shared right edge,
// markers under the name, then the ingredient's note (never on shared pages), group
// headings in the recipe's order. No limit.

export function groupItems<T extends { groupId: string | null }>(groups: Group[], items: T[]) {
  if (groups.length === 0) return [{ group: null, items }];
  const ungrouped = items.filter((i) => !groups.some((g) => g.id === i.groupId));
  return [
    ...(ungrouped.length ? [{ group: null, items: ungrouped }] : []),
    ...groups.map((group) => ({ group, items: items.filter((i) => i.groupId === group.id) })).filter((b) => b.items.length),
  ];
}

/**
 * `shared`: a friend's view (BONES-r-detail): only the Estimated marker, read as
 * "Estimated amount"; Converted and its "was 1 cup" reveal aren't shown.
 */
export function IngredientList({
  groups,
  ingredients,
  scale,
  shared = false,
}: {
  groups: Group[];
  ingredients: Ingredient[];
  scale: number;
  shared?: boolean;
}) {
  return (
    <>
      {groupItems(groups, ingredients).map(({ group, items }) => (
        <div key={group?.id ?? "ungrouped"}>
          {group && <GroupHeading>{group.name}</GroupHeading>}
          <ul role="list" className={group ? undefined : "mt-sm"}>
            {items.map((ingredient) => (
              <IngredientRow key={ingredient.id} ingredient={ingredient} scale={scale} shared={shared} />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function IngredientRow({ ingredient, scale, shared }: { ingredient: Ingredient; scale: number; shared: boolean }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const originalId = `original-${ingredient.id}`;
  const hasMarker = ingredient.status === "estimated" || (ingredient.status === "converted" && !shared);

  return (
    <li className="grid grid-cols-[1fr_auto] items-baseline gap-x-base border-b border-hairline py-md">
      <span className="line-clamp-2 type-body-md text-ink">{ingredient.name}</span>
      {ingredient.grams === null ? (
        <span className="text-right type-body-md text-muted">to taste</span>
      ) : (
        <span className="text-right whitespace-nowrap">
          <span className="type-amount text-ink">{formatGrams(ingredient.grams * scale)}</span>
          <span className="ml-[3px] type-body-md text-muted">g</span>
        </span>
      )}
      {hasMarker && (
        <div className="col-span-2 mt-xs flex flex-wrap items-center gap-x-sm type-caption text-muted">
          {ingredient.status === "estimated" && <EstimatedMarker spoken={shared ? "amount" : undefined} />}
          {ingredient.status === "converted" && !shared && (
            <>
              <ConvertedMarker expanded={showOriginal} onToggle={() => setShowOriginal((v) => !v)} controls={originalId} />
              <span id={originalId} hidden={!showOriginal}>
                was {ingredient.original}
              </span>
            </>
          )}
        </div>
      )}
      {ingredient.note && !shared && (
        <p className="col-span-2 mt-xs type-body-sm text-muted">
          <span className="sr-only">Note: </span>
          {ingredient.note}
        </p>
      )}
    </li>
  );
}
