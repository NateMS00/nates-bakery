import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ComponentProps } from "react";
import { cx } from "./cx";

// SKIN back-link: bold cobalt with a chevron, no underline at rest; underline on
// hover, active, and focus; 48px target. Uppercase mono (`page`, the default) when
// it names a page ("‹ Library"); mono sentence case (`title`) when it carries a
// recipe title ("‹ Pastéis de nata") — a long title in tracked capitals gets far
// wider and truncates early.
export function BackLink({
  variant = "page",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: "page" | "title" }) {
  return (
    <Link
      className={cx(
        "inline-flex min-h-touch-min items-center gap-xs rounded-sm text-primary underline-offset-3 hover:underline focus-visible:underline focus-visible:outline-offset-2 active:text-primary-active active:underline",
        variant === "title" ? "type-tab" : "type-button",
        className,
      )}
      {...props}
    >
      <ChevronLeft aria-hidden="true" className="size-icon-sm shrink-0" strokeWidth={2.4} />
      {children}
    </Link>
  );
}
