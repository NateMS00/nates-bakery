"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StarDisplay } from "@/components/ui/StarDisplay";
import { categoryLabel } from "@/lib/data/categories";
import type { Recipe } from "@/lib/data/types";
import { formatBakeDate } from "@/lib/format";

// BONES Recipes: 30 items, then Show more loads the next 30 below. Desktop (1280 and
// up): one row per recipe (title 5 cols, category 2, rating 2, last baked 2, favorite
// 1). Mobile and tablet: a card (category, title, then rating, favorite, last baked),
// since the row's 12 columns are too narrow at 768. SKIN recipe-item: the whole item
// is one link.

const PAGE = 30;

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [shown, setShown] = useState(PAGE);
  const list = useRef<HTMLUListElement>(null);

  function showMore() {
    const firstNew = shown;
    setShown(shown + PAGE);
    requestAnimationFrame(() => list.current?.children[firstNew]?.querySelector("a")?.focus());
  }

  return (
    <>
      <ul ref={list} role="list" className="mt-sm flex flex-col gap-sm">
        {recipes.slice(0, shown).map((recipe) => (
          <li key={recipe.id}>
            <RecipeItem recipe={recipe} />
          </li>
        ))}
      </ul>
      {recipes.length > shown && (
        <Button variant="text" onClick={showMore} className="mt-sm -ml-sm">
          Show more
        </Button>
      )}
    </>
  );
}

/**
 * The card's name, title first, so a screen reader's links list sorts by recipe; the
 * visible title still starts it (WCAG 2.5.3). The rest follows the card's content.
 */
function cardName(recipe: Recipe, baked: string) {
  const rating = recipe.rating === null ? "not rated" : `rated ${recipe.rating} out of 5`;
  return [recipe.title, categoryLabel(recipe.category), rating, recipe.favorite && "favorite", baked].filter(Boolean).join(", ");
}

function RecipeItem({ recipe }: { recipe: Recipe }) {
  const lastBaked = recipe.bakeLog[0]?.date;
  const baked = lastBaked ? `Baked ${formatBakeDate(lastBaked)}` : "Not baked yet";
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      aria-label={cardName(recipe, baked)}
      className="grid gap-y-xs rounded-lg border border-hairline bg-surface-card p-base text-ink transition-colors duration-(--motion-fast) ease-skin hover:border-primary active:border-primary active:bg-primary-wash focus-visible:outline-offset-2 desktop:grid-cols-12 desktop:items-center desktop:gap-x-(--gutter)"
    >
      <span className="type-label text-primary desktop:order-2 desktop:col-span-2">{categoryLabel(recipe.category)}</span>
      <span className="line-clamp-2 type-heading desktop:order-1 desktop:col-span-5">{recipe.title}</span>
      <span className="flex items-center gap-md desktop:contents">
        <span className="desktop:order-3 desktop:col-span-2">
          <StarDisplay rating={recipe.rating} />
        </span>
        <span className="desktop:order-5 desktop:col-span-1 desktop:justify-self-end">
          {recipe.favorite && (
            <>
              <Heart aria-hidden="true" className="size-icon-sm text-primary" fill="currentColor" strokeWidth={1.8} />
              <span className="sr-only">Favorite</span>
            </>
          )}
        </span>
        <span className="ml-auto type-caption text-muted desktop:order-4 desktop:col-span-2 desktop:ml-0">
          {baked}
        </span>
      </span>
    </Link>
  );
}
