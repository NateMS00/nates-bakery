import { Play } from "lucide-react";
import { Picture } from "./Picture";
import { ExternalLink, tallHitArea } from "./TextLink";
import { cx } from "./cx";

/**
 * SKIN source-card: the reel on Review Import — a 64px-wide 9:16 frame with a
 * play badge, the frame and badge together one link to the reel (the badge is
 * decorative here, not a second nested control), the creator handle, a 2-line
 * caption preview, and a separate "Watch reel" text link. Reads as a reference to
 * open, not as the recipe's own picture.
 */
export function SourceCard({
  reelImage,
  reelUrl,
  handle,
  captionPreview,
}: {
  reelImage: string | null;
  reelUrl: string;
  handle: string;
  captionPreview: string;
}) {
  return (
    <div className="flex gap-md rounded-lg border border-hairline bg-surface-card p-md">
      <a
        href={reelUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch @${handle}'s reel (opens in a new tab)`}
        className="block w-[64px] shrink-0 rounded-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <Picture src={reelImage} aspectRatio="9 / 16" rounded="md" className="w-full">
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span className="inline-grid size-[40px] place-items-center rounded-full border border-hairline bg-surface-card text-ink">
              <Play aria-hidden="true" className="size-icon-sm" strokeWidth={1.8} />
            </span>
          </span>
        </Picture>
      </a>
      <div className="min-w-0 flex-1">
        <p className="type-body-sm font-bold text-ink">@{handle}</p>
        <p className="mt-xs line-clamp-2 type-body-sm text-body">{captionPreview}</p>
        <ExternalLink href={reelUrl} className={cx("mt-xs inline-flex items-center", tallHitArea)}>
          Watch reel
        </ExternalLink>
      </div>
    </div>
  );
}
