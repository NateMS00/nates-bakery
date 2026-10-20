import Link from "next/link";
import { AzulejoFill } from "./AzulejoFill";
import { StarGlyph } from "./Star";
import { cx } from "./cx";

/**
 * SKIN `card`, for a bake without a photo in the Bakes diary (BONES-bakes.md): a
 * 52px `azulejo-fill` square stands in for the missing photo, framed in ink like
 * recipe-tile's own placeholder, so the grid never fills with empty frames (SKIN
 * azulejo-fill). Full width, one line from tablet up, two on mobile so the note
 * preview and stars don't crowd the title. One link to the bake's entry.
 */
export function BakeRow({
  href,
  recipeTitle,
  date,
  note,
  rating,
}: {
  href: string;
  recipeTitle: string;
  /** "2 Oct" */
  date: string;
  note: string | null;
  rating: number | null;
}) {
  const stars = rating !== null && (
    <span className="inline-flex shrink-0 gap-[1px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarGlyph key={n} filled={n <= rating} className="size-[13px]" />
      ))}
    </span>
  );
  const name = [`${recipeTitle}, ${date}`, note, rating !== null ? `rated ${rating} out of 5` : "not rated"].filter(Boolean).join(", ");
  return (
    <Link
      href={href}
      aria-label={name}
      className="group flex items-center gap-base rounded-tile border border-outline bg-surface-card p-base text-ink transition-transform duration-(--motion-fast) ease-skin focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring active:scale-[0.98]"
    >
      <AzulejoFill className="size-[52px] shrink-0 rounded-md border border-outline" />
      <div className="min-w-0 flex-1">
        <p className={cx("truncate type-body-sm font-bold text-current tablet:hidden", "group-hover:underline")}>
          {recipeTitle} <span aria-hidden="true">·</span> {date}
        </p>
        {(note || rating !== null) && (
          <div className="mt-[2px] flex items-center justify-between gap-sm tablet:hidden">
            {note ? <p className="truncate type-caption text-muted">{note}</p> : <span />}
            {stars}
          </div>
        )}
        <p className={cx("hidden truncate type-body-sm text-current tablet:block", "group-hover:underline")}>
          <span className="font-bold">
            {recipeTitle} <span aria-hidden="true">·</span> {date}
          </span>
          {note && (
            <span className="type-caption text-muted">
              {" "}
              <span aria-hidden="true">·</span> {note}
            </span>
          )}
        </p>
      </div>
      <span className="hidden shrink-0 tablet:inline-flex">{stars}</span>
    </Link>
  );
}
