import { AzulejoFill } from "@/components/ui/AzulejoFill";
import { HeroControls } from "@/components/ui/HeroControls";
import type { Recipe } from "@/lib/data/types";
import { RecordCard } from "./RecordCard";

/**
 * SKIN split-hero, no cover (desktop, 1280px and up): a recipe with no photo
 * collapses the two-column split into one full-width azulejo field, half the
 * usual height (there's no staged photo to give it the full height for), with the
 * record card and both actions centred on it. The same floating picture-button
 * controls as the mobile/tablet azulejo field (HeroControls) sit on its corners,
 * since there's no separate top row here the way split-hero's left column has one
 * — BONES-recipes-detail 1.7.0 gives this case one line ("one full-width
 * half-height field... with the card centred on it") without diagramming it, so
 * this is a faithful reading rather than a literal spec.
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
    <div className="relative flex h-[min(calc((100svh_-_64px)/2),380px)] items-center justify-center">
      <AzulejoFill className="absolute inset-0" />
      <HeroControls recipeId={recipe.id} favorite={favorite} onFavoriteChange={onFavoriteChange} onShare={onShare} />
      <RecordCard recipe={recipe} scale={scale} bakeHref={bakeHref} logHref={logHref} actions className="relative z-10 w-full max-w-[min(400px,80%)]" />
    </div>
  );
}
