import { AzulejoFill } from "@/components/ui/AzulejoFill";
import type { Recipe } from "@/lib/data/types";
import { HeroTopRow } from "./HeroTopRow";
import { RecordCard } from "./RecordCard";

/**
 * SKIN split-hero, no cover (desktop, 1280px and up): a recipe with no photo
 * collapses the two-column split into the same plain top row as split-hero
 * (BONES-recipes-detail 1.7.1: no buttons float on the pattern on desktop,
 * unlike mobile/tablet's azulejo field), then one full-width azulejo field at
 * half the usual height (there's no staged photo to give it the full height
 * for), with the record card and both actions centred on it. The field bleeds
 * to the window's right edge like split-hero's own azulejo half, for the same
 * reason — BONES gives this case one line without diagramming it, so the bleed
 * here is a consistency reading rather than a literal spec.
 */
export function NoCoverHero({
  recipe,
  scale,
  favorite,
  onFavoriteChange,
  onShare,
  bakeHref,
  logHref,
}: {
  recipe: Recipe;
  scale: number;
  favorite: boolean;
  onFavoriteChange: (next: boolean) => void;
  onShare: () => void;
  bakeHref: string;
  logHref: string;
}) {
  return (
    <div>
      <HeroTopRow recipeId={recipe.id} favorite={favorite} onFavoriteChange={onFavoriteChange} onShare={onShare} className="py-lg" />
      <div className="relative mr-[calc(50%_-_50vw)] flex h-[min(calc((100svh_-_64px)/2),380px)] items-center justify-center">
        <AzulejoFill className="absolute inset-0" />
        <RecordCard recipe={recipe} scale={scale} bakeHref={bakeHref} logHref={logHref} actions className="relative z-10 w-full max-w-[min(400px,80%)]" />
      </div>
    </div>
  );
}
