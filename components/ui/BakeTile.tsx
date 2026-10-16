import Link from "next/link";
import { Picture } from "./Picture";
import { PictureChip } from "./PictureChip";
import { StarGlyph } from "./Star";
import { cx } from "./cx";

/**
 * SKIN bake-tile: a bake in the Bakes diary, the same printed-card frame as
 * recipe-tile (1px ink edge at rounded.tile, an ink rule under the picture) — a
 * square photo with a date picture-chip in its top-left corner, the recipe
 * title in bold body-sm, and one meta line (that bake's stars in cobalt, then
 * "2nd bake" or the scale when it isn't 1×). One link to the bake's entry in
 * its Log sheet.
 */
export function BakeTile({
  href,
  picture,
  day,
  weekday,
  title,
  rating,
  bakeLabel,
  disabled,
}: {
  href: string;
  picture: string | null;
  /** "15" */
  day: string;
  /** "Thu" */
  weekday: string;
  title: string;
  rating: number | null;
  /** "2nd bake", or the scale ("1.5×"); null for a first bake at 1×, nothing to say. */
  bakeLabel: string | null;
  disabled?: boolean;
}) {
  const name = [title, `${weekday} ${day}`, rating !== null ? `rated ${rating} out of 5` : "not rated", bakeLabel].filter(Boolean).join(", ");
  return (
    <Link
      href={disabled ? "#" : href}
      aria-disabled={disabled || undefined}
      aria-label={name}
      className={cx(
        "group flex flex-col overflow-hidden rounded-tile border border-outline bg-surface-card text-ink transition-transform duration-(--motion-fast) ease-skin focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring",
        disabled ? "pointer-events-none text-disabled" : "active:scale-[0.98]",
      )}
    >
      <Picture src={picture} aspectRatio="1 / 1" rounded="none" className="w-full border-b border-outline">
        <PictureChip className="absolute top-sm left-sm flex flex-col items-center leading-none">
          <span>{day}</span>
          <span className="font-normal">{weekday}</span>
        </PictureChip>
      </Picture>
      <div className="px-md pt-sm pb-md">
        <p className={cx("type-body-sm font-bold text-current", !disabled && "group-hover:underline")}>{title}</p>
        {(rating !== null || bakeLabel) && (
          // flex-wrap, not a fixed one line — same rule as recipe-tile: never wrap a
          // piece's own text mid-phrase, fall back to a new line instead.
          <p className={cx("mt-xs flex flex-wrap items-center gap-x-xs gap-y-[2px] type-caption", disabled ? "text-disabled" : "text-muted")}>
            {rating !== null && (
              <span className="inline-flex shrink-0 gap-[1px]">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarGlyph key={n} filled={n <= rating} className="size-[13px]" />
                ))}
              </span>
            )}
            {bakeLabel && <span className="whitespace-nowrap">{bakeLabel}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
