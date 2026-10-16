"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { RecipeTile } from "@/components/ui/RecipeTile";
import { categoryLabel } from "@/lib/data/categories";
import type { Recipe } from "@/lib/data/types";
import { formatBakeDate } from "@/lib/format";

// BONES-recipes.md 1.5.0 Recipes: a photo grid of recipe-tiles, 2 columns on mobile,
// 3 on tablet, 4 on desktop, {spacing.md} between columns and {spacing.base} between
// rows. 30 items, then Show more loads the next 30 below.

const PAGE = 30;

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [shown, setShown] = useState(PAGE);
  const grid = useRef<HTMLUListElement>(null);

  function showMore() {
    const firstNew = shown;
    setShown(shown + PAGE);
    requestAnimationFrame(() => grid.current?.children[firstNew]?.querySelector("a")?.focus());
  }

  return (
    <>
      <ul ref={grid} role="list" className="mt-sm grid grid-cols-2 gap-x-md gap-y-base tablet:grid-cols-3 desktop:grid-cols-4">
        {recipes.slice(0, shown).map((recipe) => {
          const lastBaked = recipe.bakeLog[0]?.date;
          return (
            <li key={recipe.id}>
              <RecipeTile
                href={`/recipes/${recipe.id}`}
                picture={recipe.cover}
                category={categoryLabel(recipe.category)}
                title={recipe.title}
                rating={recipe.rating}
                favorite={recipe.favorite}
                bakedLabel={lastBaked ? `Baked ${formatBakeDate(lastBaked)}` : null}
              />
            </li>
          );
        })}
      </ul>
      {recipes.length > shown && (
        <Button variant="text" onClick={showMore} className="mt-sm -ml-sm">
          Show more
        </Button>
      )}
    </>
  );
}
