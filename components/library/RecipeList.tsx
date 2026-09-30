"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StarDisplay } from "@/components/ui/StarDisplay";
import { categoryLabel } from "@/lib/data/categories";
import type { Recipe } from "@/lib/data/types";
import { formatBakeDate } from "@/lib/format";

// BONES Recipes: 30 items, then Show more loads the next 30 below. Desktop one row
// per recipe (title 5 cols, category 2, rating 2, last baked 2, favorite 1); mobile a
// card (category, title, then rating, favorite, last baked). SKIN recipe-item: the
// whole item is one link.

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

function RecipeItem({ recipe }: { recipe: Recipe }) {
  const lastBaked = recipe.bakeLog[0]?.date;
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="grid gap-y-xs rounded-lg border border-hairline bg-surface-card p-base text-ink transition-colors duration-(--motion-fast) ease-skin hover:border-primary active:border-primary active:bg-primary-wash focus-visible:outline-offset-2 tablet:grid-cols-12 tablet:items-center tablet:gap-x-(--gutter)"
    >
      <span className="type-label text-primary tablet:order-2 tablet:col-span-2">{categoryLabel(recipe.category)}</span>
      <span className="line-clamp-2 type-heading tablet:order-1 tablet:col-span-5">{recipe.title}</span>
      <span className="flex items-center gap-md tablet:contents">
        <span className="tablet:order-3 tablet:col-span-2">
          <StarDisplay rating={recipe.rating} />
        </span>
        <span className="tablet:order-5 tablet:col-span-1 tablet:justify-self-end">
          {recipe.favorite && (
            <>
              <Heart aria-hidden="true" className="size-icon-sm text-primary" fill="currentColor" strokeWidth={1.8} />
              <span className="sr-only">Favorite</span>
            </>
          )}
        </span>
        <span className="ml-auto type-caption text-muted tablet:order-4 tablet:col-span-2 tablet:ml-0">
          {lastBaked ? `Baked ${formatBakeDate(lastBaked)}` : "Not baked yet"}
        </span>
      </span>
    </Link>
  );
}
