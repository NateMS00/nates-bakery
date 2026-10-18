import { AzulejoFill } from "@/components/ui/AzulejoFill";
import type { Recipe } from "@/lib/data/types";
import { HeroTopRow } from "./HeroTopRow";
import { RecordCard } from "./RecordCard";
import { StagedPhoto } from "./StagedPhoto";

/**
 * SKIN split-hero: the Recipe page's first screen on desktop (1280px and up, with
 * a cover) — two equal halves, at most one viewport tall (capped at 760px), with
 * an ink rule between them. Left: a top row (Back, then Favorite/Share/Edit), the
 * bake photo staged like a framed print with its photo switch underneath. Right:
 * azulejo-fill edge to edge with the record card (and both actions) centred on
 * it. The app header stays above this, unaffected (BONES).
 */
export function SplitHero({
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
    // mr-[calc(50%-50vw)]: the azulejo half bleeds to the window's right edge
    // (BONES 1.7.1) — this classic "break out one side only" trick cancels
    // exactly the empty margin main's own centered max-width leaves on the
    // right, without touching the left edge, which stays at the content
    // column's own left edge.
    <div className="grid h-[min(calc(100svh_-_64px),760px)] grid-cols-2 divide-x divide-outline mr-[calc(50%_-_50vw)]">
      <div className="flex flex-col px-xl py-lg">
        <HeroTopRow recipeId={recipe.id} favorite={favorite} onFavoriteChange={onFavoriteChange} onShare={onShare} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <StagedPhoto recipe={recipe} />
        </div>
      </div>
      <div className="relative flex items-center justify-center">
        <AzulejoFill className="absolute inset-0" />
        <RecordCard recipe={recipe} scale={scale} bakeHref={bakeHref} logHref={logHref} actions className="relative z-10 w-full max-w-[min(400px,80%)]" />
      </div>
    </div>
  );
}
