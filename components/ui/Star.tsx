// The rating star glyph (from design-reference), drawn at the size its component sets.
// `tone`: "ink" (default) for every porcelain surface; "celebration" for the one place
// stars sit on the celebration screen's solid cobalt instead — fixed colors, not
// currentColor, since a star's own fill/stroke is never meant to inherit arbitrary text
// color, only switch between these two known surfaces.
export function StarGlyph({ filled, preview, tone = "ink", className }: { filled: boolean; preview?: boolean; tone?: "ink" | "celebration"; className?: string }) {
  const classes =
    tone === "celebration"
      ? filled
        ? "fill-on-celebration stroke-on-celebration"
        : "fill-transparent stroke-on-celebration/55"
      : filled
        ? "fill-primary stroke-primary"
        : preview
          ? "fill-primary/55 stroke-primary"
          : "fill-transparent stroke-border";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" strokeLinejoin="round" strokeWidth={1.5} className={classes} />
    </svg>
  );
}
