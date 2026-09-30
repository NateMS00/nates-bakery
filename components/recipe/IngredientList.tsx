"use client";

import { useState } from "react";
import { GroupHeading } from "@/components/ui/SectionHeading";
import { ConvertedMarker, EstimatedMarker } from "@/components/ui/Marker";
import { formatGrams } from "@/lib/format";
import type { Group, Ingredient } from "@/lib/data/types";

// BONES Ingredients: one row per ingredient, grams on a shared right edge,
// markers under the name, group headings in the recipe's order. No limit.

export function groupItems<T extends { groupId: string | null }>(groups: Group[], items: T[]) {
  if (groups.length === 0) return [{ group: null, items }];
  const ungrouped = items.filter((i) => !groups.some((g) => g.id === i.groupId));
  return [
    ...(ungrouped.length ? [{ group: null, items: ungrouped }] : []),
    ...groups.map((group) => ({ group, items: items.filter((i) => i.groupId === group.id) })).filter((b) => b.items.length),
  ];
}

export function IngredientList({ groups, ingredients, scale }: { groups: Group[]; ingredients: Ingredient[]; scale: number }) {
  return (
    <>
      {groupItems(groups, ingredients).map(({ group, items }) => (
        <div key={group?.id ?? "ungrouped"}>
          {group && <GroupHeading>{group.name}</GroupHeading>}
          <ul role="list" className={group ? undefined : "mt-sm"}>
            {items.map((ingredient) => (
              <IngredientRow key={ingredient.id} ingredient={ingredient} scale={scale} />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function IngredientRow({ ingredient, scale }: { ingredient: Ingredient; scale: number }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const originalId = `original-${ingredient.id}`;
  const hasMarker = ingredient.status === "estimated" || ingredient.status === "converted";

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
          {ingredient.status === "estimated" && <EstimatedMarker />}
          {ingredient.status === "converted" && (
            <>
              <ConvertedMarker expanded={showOriginal} onToggle={() => setShowOriginal((v) => !v)} controls={originalId} />
              <span id={originalId} hidden={!showOriginal}>
                was {ingredient.original}
              </span>
            </>
          )}
        </div>
      )}
    </li>
  );
}
