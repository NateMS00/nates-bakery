import type { ComponentProps } from "react";
import { cx } from "./cx";

/** SKIN card: the glazed tile, framed in ink. Not interactive. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-tile border border-outline bg-surface-card p-base text-ink", className)} {...props} />;
}
