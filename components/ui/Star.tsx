// The rating star glyph (from design-reference), drawn at the size its component sets.
export function StarGlyph({ filled, preview, className }: { filled: boolean; preview?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
        strokeLinejoin="round"
        strokeWidth={1.5}
        className={
          filled
            ? "fill-primary stroke-primary"
            : preview
              ? "fill-primary/55 stroke-primary"
              : "fill-transparent stroke-border"
        }
      />
    </svg>
  );
}
