import { ChevronLeft, Heart, Pencil, Share } from "lucide-react";
import { Picture } from "./Picture";
import { PictureButton } from "./PictureButton";

/**
 * SKIN cover-picture: the Recipe page's large picture — 4:3, full bleed on
 * mobile (edge to edge, square corners, starting under the status bar), rounded
 * and inside the content column from tablet up, capped at 56% of the viewport
 * height. Back, Favorite, Share and Edit float over its top corners as
 * picture-buttons. No cover → no cover area at all (the caller's job).
 */
export function CoverPicture({ src, favorite }: { src: string | null; favorite: boolean }) {
  return (
    <Picture src={src} aspectRatio="4 / 3" rounded="lg" className="max-h-[56vh] w-full max-tablet:rounded-none">
      <div className="absolute inset-x-sm top-sm flex items-start justify-between">
        <PictureButton label="Back to Library">
          <ChevronLeft aria-hidden="true" strokeWidth={2.2} />
        </PictureButton>
        <div className="flex gap-sm">
          <PictureButton label="Favorite" aria-pressed={favorite} className={favorite ? "text-primary" : undefined}>
            <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} strokeWidth={1.8} />
          </PictureButton>
          <PictureButton label="Share">
            <Share aria-hidden="true" strokeWidth={1.8} />
          </PictureButton>
          <PictureButton label="Edit">
            <Pencil aria-hidden="true" strokeWidth={1.8} />
          </PictureButton>
        </div>
      </div>
    </Picture>
  );
}
