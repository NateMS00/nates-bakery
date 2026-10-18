import { Pencil, Share } from "lucide-react";
import Link from "next/link";
import { AzulejoFill } from "@/components/ui/AzulejoFill";
import { BackLink } from "@/components/ui/BackLink";
import { FavoriteToggle } from "@/components/ui/FavoriteToggle";
import { IconButton, iconButtonClass } from "@/components/ui/IconButton";
import type { Recipe } from "@/lib/data/types";
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
    <div className="grid h-[min(calc(100svh_-_64px),760px)] grid-cols-2 divide-x divide-outline">
      <div className="flex flex-col px-xl py-lg">
        <div className="flex items-center gap-xs">
          <BackLink href="/recipes">Library</BackLink>
          <div className="ml-auto flex items-center gap-xs">
            <FavoriteToggle pressed={favorite} onChange={onFavoriteChange} />
            <IconButton label="Share" aria-haspopup="dialog" onClick={onShare}>
              <Share aria-hidden="true" strokeWidth={1.8} />
            </IconButton>
            <Link href={`/recipes/${recipe.id}/edit`} aria-label="Edit" className={iconButtonClass}>
              <Pencil aria-hidden="true" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
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
