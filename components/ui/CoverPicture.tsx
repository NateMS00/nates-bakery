import { ChevronLeft, Heart, Pencil, Share } from "lucide-react";
import Link from "next/link";
import { Picture } from "./Picture";
import { PictureButton, pictureButtonClass } from "./PictureButton";

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
      <div className="absolute inset-x-sm top-[max(var(--spacing-sm),var(--safe-area-top))] flex items-start justify-between">
        <Link href="/recipes" aria-label="Back to Library" className={pictureButtonClass}>
          <ChevronLeft aria-hidden="true" strokeWidth={2.2} />
        </Link>
        <div className="flex gap-sm">
          <PictureButton
            label="Favorite"
            aria-pressed={favorite}
            onClick={() => onFavoriteChange(!favorite)}
            className={favorite ? "text-primary" : undefined}
          >
            <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} strokeWidth={1.8} />
          </PictureButton>
          <PictureButton label="Share" aria-haspopup="dialog" onClick={onShare}>
            <Share aria-hidden="true" strokeWidth={1.8} />
          </PictureButton>
          <Link href={`/recipes/${recipeId}/edit`} aria-label="Edit" className={pictureButtonClass}>
            <Pencil aria-hidden="true" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </Picture>
  );
}
