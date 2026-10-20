import Link from "next/link";
import { Picture } from "./Picture";
import { StarGlyph } from "./Star";
import { cx } from "./cx";

/**
 * SKIN bake-row (since October 2026, BONES-bakes 1.2.0): every bake in the Bakes
 * diary, photo or not — a square lead (72px, 88px from tablet up) that's the bake
 * photo when there is one, otherwise a date block (the day in Fraunces 700 over
 * the weekday in `label-mono`, ink on porcelain); the recipe title; a muted meta
 * line (the date first when the lead is a photo, then stars and "2nd bake" or the
 * scale); and, when there's a note, one line of it in the `voice` italic. One link
 * to the bake. Replaces the 1.1.0 bake-tile grid: no azulejo squares, no lonely
 * tiles when most bakes have no photo yet.
 */
export function BakeRow({
  href,
  picture,
  day,
  weekday,
  title,
  date,
  fullDate,
  rating,
  bakeLabel,
  bakeLabelSpoken,
  note,
}: {
  href: string;
  picture: string | null;
  /** "28" — the date block's day, shown only without a photo. */
  day: string;
  /** "Sat" — the date block's weekday; displayed lowercase (label-mono is always lowercase). */
  weekday: string;
  title: string;
  /** "Sat 26 Sep" — the accessible date and, when there's a photo, the meta line's own date. */
  date: string;
  /** "Saturday 26 September" — the accessible name's full date. */
  fullDate: string;
  rating: number | null;
  /** "2nd bake", or the scale ("1.5×"); null when there's nothing to say. */
  bakeLabel: string | null;
  /** "second bake", "1.5× scale"… for the accessible name; null to match `bakeLabel`. */
  bakeLabelSpoken: string | null;
  note: string | null;
}) {
  const hasPhoto = Boolean(picture);
  const stars = rating !== null && (
    <span className="inline-flex shrink-0 gap-[1px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarGlyph key={n} filled={n <= rating} className="size-[13px]" />
      ))}
    </span>
  );
  const meta: React.ReactNode[] = [];
  if (hasPhoto) meta.push(date);
  if (stars) meta.push(stars);
  if (bakeLabel) meta.push(bakeLabel);

  const name = [
    title,
    fullDate,
    rating !== null ? `${rating} ${rating === 1 ? "star" : "stars"}` : "not rated",
    bakeLabelSpoken,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={href}
      aria-label={name}
      className="group flex items-center gap-md rounded-tile border border-outline bg-surface-card p-sm text-ink transition-transform duration-(--motion-fast) ease-skin focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring active:scale-[0.99]"
    >
      {hasPhoto ? (
        <Picture src={picture} aspectRatio="1 / 1" rounded="md" className="size-[72px] shrink-0 border border-outline tablet:size-[88px]" />
      ) : (
        <div aria-hidden="true" className="flex size-[72px] shrink-0 flex-col items-center justify-center rounded-md border border-outline bg-canvas tablet:size-[88px]">
          <span className="type-heading font-bold text-ink">{day}</span>
          <span className="type-label-mono text-muted">{weekday.toLowerCase()}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={cx("truncate type-tile-title text-current", "group-hover:underline")}>{title}</p>
        {meta.length > 0 && (
          <p className="mt-xs flex flex-wrap items-center gap-x-xs gap-y-[2px] type-caption text-muted">
            {meta.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-x-xs">
                {i > 0 && <span aria-hidden="true">·</span>}
                {m}
              </span>
            ))}
          </p>
        )}
        {note && <p className="mt-xs truncate type-voice text-body">{note}</p>}
      </div>
    </Link>
  );
}
