import { StarGlyph } from "./Star";

/** SKIN star-display: read-only 16px stars, or "Not rated". */
export function StarDisplay({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="type-caption text-muted">Not rated</span>;
  return (
    <span role="img" aria-label={`Rated ${rating} out of 5`} className="inline-flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarGlyph key={n} filled={n <= rating} className="size-[16px]" />
      ))}
    </span>
  );
}
