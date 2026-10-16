import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * SKIN picture-chip: a small solid label on a photo's corner — glazed-card fill,
 * ink bold caption, never translucent — so its contrast never depends on the
 * photo underneath (the same rule as picture-button). Used for a bake-tile's date.
 */
export function PictureChip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("rounded-md bg-surface-card px-sm py-xs type-caption font-bold text-ink", className)}>{children}</span>;
}
