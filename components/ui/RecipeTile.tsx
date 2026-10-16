import { Heart } from "lucide-react";
import Link from "next/link";
import { Picture } from "./Picture";
import { StarGlyph } from "./Star";
import { cx } from "./cx";

/**
 * SKIN recipe-tile: a recipe in the Library's photo grid (4:5 picture, category,
 * title, one meta line). The whole tile is one link, named explicitly (as
 * RecipeList.tsx's cardName already does) because the meta line's pieces — stars,
 * favorite, baked date — don't read in a sensible order from their visual layout
 * alone. "Not rated" and "Not baked yet" are never printed: the meta line is
 * omitted entirely when there's nothing to say.
 */
export function RecipeTile({
  href,
  picture,
  category,
  title,
  rating,
  favorite,
  bakedLabel,
  disabled,
}: {
  href: string;
  picture: string | null;
  category: string;
  title: string;
  rating: number | null;
  favorite: boolean;
  bakedLabel: string | null;
  disabled?: boolean;
}) {
  const hasMeta = rating !== null || favorite || Boolean(bakedLabel);
  const name = [title, category, rating !== null && `rated ${rating} out of 5`, favorite && "favorite", bakedLabel].filter(Boolean).join(", ");
  return (
    <Link
      href={disabled ? "#" : href}
      aria-disabled={disabled || undefined}
      aria-label={name}
      className={cx(
        "group flex flex-col gap-sm rounded-lg text-ink transition-transform duration-(--motion-fast) ease-skin focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring",
        disabled ? "pointer-events-none text-disabled" : "active:scale-[0.98]",
      )}
    >
      <Picture src={picture} aspectRatio="4 / 5" className="w-full" />
      <div>
        <p className={cx("type-label", disabled ? "text-disabled" : "text-primary")}>{category}</p>
        <p className={cx("type-tile-title mt-[2px] line-clamp-2 text-current", !disabled && "group-hover:underline group-hover:underline-offset-[3px]")}>{title}</p>
        {hasMeta && (
          <p className={cx("mt-xs flex items-center gap-xs type-caption", disabled ? "text-disabled" : "text-muted")}>
            {rating !== null && (
              <span className="inline-flex gap-[1px]">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarGlyph key={n} filled={n <= rating && !disabled} className="size-[13px]" />
                ))}
              </span>
            )}
            {favorite && <Heart aria-hidden="true" className={cx("size-[13px]", !disabled && "text-primary")} fill="currentColor" strokeWidth={0} />}
            {bakedLabel && <span>{bakedLabel}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
