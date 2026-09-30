import type { CSSProperties } from "react";
import { cx } from "./cx";

/** SKIN skeleton: grout blocks with a slow shimmer, still under reduced motion. */
export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={cx("rounded-sm bg-surface-sunken animate-[skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:animate-none", className)}
    />
  );
}
