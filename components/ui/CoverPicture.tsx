import { HeroControls } from "./HeroControls";
import { Picture } from "./Picture";

/**
 * SKIN cover-picture: the Recipe page's large picture — 4:3, full bleed on
 * mobile (edge to edge, square corners, starting under the status bar), rounded
 * and inside the content column from tablet up, capped at 56% of the viewport
 * height. Back and Edit navigate (real links styled as picture-buttons);
 * Favorite and Share are real buttons. No cover → no cover area at all (the
 * caller's job). On mobile this replaces the app header (globals.css's
 * data-replaces-header), so the floating controls clear the status bar/notch
 * themselves (env(safe-area-inset-top), via the shared --safe-area-top).
 */
export function CoverPicture({
  src,
  recipeId,
  favorite,
  onFavoriteChange,
  onShare,
}: {
  src: string | null;
  recipeId: string;
  favorite: boolean;
  onFavoriteChange: (next: boolean) => void;
  onShare: () => void;
}) {
  return (
    <Picture src={src} aspectRatio="4 / 3" rounded="lg" className="max-h-[56vh] w-full max-tablet:rounded-none">
      <HeroControls recipeId={recipeId} favorite={favorite} onFavoriteChange={onFavoriteChange} onShare={onShare} />
    </Picture>
  );
}
