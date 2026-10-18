import { AzulejoFill } from "./AzulejoFill";
import { HeroControls } from "./HeroControls";

/**
 * The Recipe page Hero when a recipe has no cover (mobile and tablet): a 200px
 * azulejo field stands in for the cover picture, carrying the same floating
 * controls and the same `data-replaces-header` mobile treatment as CoverPicture,
 * so a recipe without a photo still looks deliberate rather than broken.
 */
export function HeroField({
  recipeId,
  favorite,
  onFavoriteChange,
  onShare,
}: {
  recipeId: string;
  favorite: boolean;
  onFavoriteChange: (next: boolean) => void;
  onShare: () => void;
}) {
  return (
    <div className="relative h-[200px] w-full">
      <AzulejoFill className="size-full" />
      <HeroControls recipeId={recipeId} favorite={favorite} onFavoriteChange={onFavoriteChange} onShare={onShare} />
    </div>
  );
}
