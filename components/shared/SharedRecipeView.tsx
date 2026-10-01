"use client";

import { ExternalLink as ExternalIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { IngredientList } from "@/components/recipe/IngredientList";
import { ScaleControl } from "@/components/recipe/ScaleControl";
import { StepList } from "@/components/recipe/StepList";
import { buttonClass } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarDisplay } from "@/components/ui/StarDisplay";
import { categoryLabel } from "@/lib/data/categories";
import type { SharedRecipe } from "@/lib/data/types";
import { formatDuration, formatYield, parseScale } from "@/lib/format";

// /r/:shareToken (Shared Recipe), BONES-r-detail.md: the Recipe page read-only for a
// friend. Header (category, title, "Shared by Nate", rating, creator, yield and
// time, Watch the original reel), then Scale, Ingredients, and Steps in the Recipe
// page's columns. No back link, favorite, share, edit, or bake log. The friend's
// scale lives only in their URL.

export function SharedRecipeView({ recipe }: { recipe: SharedRecipe }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { scale } = parseScale(searchParams.get("scale") ?? undefined);

  function setScale(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 1) params.delete("scale");
    else params.set("scale", String(next));
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  const time = recipe.totalTimeMinutes > 0 ? formatDuration(recipe.totalTimeMinutes) : null;

  return (
    <>
      {/* Header (SKELETON section 1): title block 9 cols and the reel link 3 cols on desktop */}
      <div className="tablet:grid tablet:grid-cols-8 tablet:items-center tablet:gap-x-(--gutter) desktop:grid-cols-12">
        <div className="tablet:col-span-5 desktop:col-span-9">
          <p className="type-label text-primary">{categoryLabel(recipe.category)}</p>
          <h1 className="mt-xs type-display-md text-ink desktop:type-display-lg">{recipe.title}</h1>
          <p className="mt-sm flex flex-wrap items-center gap-x-sm type-body-sm text-muted">
            <span>Shared by {recipe.sharedBy}</span>
            {recipe.rating !== null && (
              <>
                <span aria-hidden="true">·</span>
                <StarDisplay rating={recipe.rating} />
              </>
            )}
          </p>
          <p className="mt-xs flex flex-col type-body-sm text-body tablet:flex-row tablet:flex-wrap tablet:gap-x-sm">
            {recipe.source && (
              <>
                <span className="text-muted">@{recipe.source.creatorHandle}</span>
                <span aria-hidden="true" className="text-muted max-tablet:hidden">
                  ·
                </span>
              </>
            )}
            <span>
              {formatYield(recipe.yield, scale)}
              {time && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="sr-only">, total time </span>
                  {time}
                </>
              )}
            </span>
          </p>
        </div>
        {/* Primary action: credit to the creator. Hidden for a recipe entered by hand. */}
        {recipe.source && (
          <a
            href={recipe.source.reelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("primary", "mt-base w-full tablet:col-span-3 tablet:mt-0 tablet:justify-self-end desktop:w-auto")}
          >
            Watch the original reel
            <ExternalIcon aria-hidden="true" className="size-icon-sm" strokeWidth={2} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>

      <div className="mt-lg tablet:grid tablet:grid-cols-8 tablet:items-start tablet:gap-x-(--gutter) desktop:mt-xl desktop:grid-cols-12">
        {/* Left column: Scale + Ingredients, sticky beside Steps from tablet up */}
        <div className="tablet:sticky tablet:top-base tablet:col-span-4 desktop:col-span-4">
          <section aria-labelledby="scale-heading">
            <SectionHeading id="scale-heading">Scale</SectionHeading>
            <ScaleControl scale={scale} onChange={setScale} />
          </section>
          <section aria-labelledby="ingredients-heading" className="mt-lg desktop:mt-xl">
            <SectionHeading id="ingredients-heading">Ingredients</SectionHeading>
            <IngredientList groups={recipe.ingredientGroups} ingredients={recipe.ingredients} scale={scale} shared />
          </section>
        </div>
        <section aria-labelledby="steps-heading" className="mt-lg tablet:col-span-4 tablet:mt-0 desktop:col-span-8">
          <SectionHeading id="steps-heading">Steps</SectionHeading>
          <StepList groups={recipe.stepGroups} steps={recipe.steps} />
        </section>
      </div>
    </>
  );
}
