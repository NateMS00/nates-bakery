import { ChevronLeft, Heart, Pencil, Share } from "lucide-react";
import Link from "next/link";
import { PictureButton, pictureButtonClass } from "./PictureButton";

/**
 * The Recipe page Hero's floating controls (Back, Favorite, Share, Edit) as
 * `picture-button`s over the top corners of whatever sits under them — a cover
 * photo (CoverPicture) or, with no cover, the azulejo field. Back and Edit
 * navigate (real links styled as picture-buttons); Favorite and Share are real
 * buttons. Padded by `--safe-area-top` so they clear the status bar/notch when
 * they're the first thing on the page (mobile, `data-replaces-header`).
 */
export function HeroControls({
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
  );
}
