import { Pencil, Share } from "lucide-react";
import Link from "next/link";
import { BackLink } from "@/components/ui/BackLink";
import { FavoriteToggle } from "@/components/ui/FavoriteToggle";
import { IconButton, iconButtonClass } from "@/components/ui/IconButton";
import { cx } from "@/components/ui/cx";

/**
 * The desktop Hero's plain top row (Back, then Favorite/Share/Edit as icon-
 * buttons) — split-hero's left column, and, above the field instead of floating
 * on it, the no-cover hero (BONES-recipes-detail 1.7.1: no buttons on the
 * pattern on desktop).
 */
export function HeroTopRow({
  recipeId,
  favorite,
  onFavoriteChange,
  onShare,
  className,
}: {
  recipeId: string;
  favorite: boolean;
  onFavoriteChange: (next: boolean) => void;
  onShare: () => void;
  className?: string;
}) {
  return (
    <div className={cx("flex items-center gap-xs", className)}>
      <BackLink href="/recipes">Library</BackLink>
      <div className="ml-auto flex items-center gap-xs">
        <FavoriteToggle pressed={favorite} onChange={onFavoriteChange} />
        <IconButton label="Share" aria-haspopup="dialog" onClick={onShare}>
          <Share aria-hidden="true" strokeWidth={1.8} />
        </IconButton>
        <Link href={`/recipes/${recipeId}/edit`} aria-label="Edit" className={iconButtonClass}>
          <Pencil aria-hidden="true" strokeWidth={1.8} />
        </Link>
      </div>
    </div>
  );
}
