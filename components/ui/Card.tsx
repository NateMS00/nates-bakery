import type { ComponentProps } from "react";
import { cx } from "./cx";

/** SKIN card: the glazed tile. Not interactive. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-lg border border-hairline bg-surface-card p-base text-ink", className)} {...props} />;
}
