import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ComponentProps } from "react";
import { cx } from "./cx";

// SKIN back-link: bold cobalt with a chevron, no underline at rest; underline on
// hover, active, and focus; 48px target.
export function BackLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cx(
        "inline-flex min-h-touch-min items-center gap-xs rounded-sm type-button text-primary underline-offset-3 hover:underline focus-visible:underline focus-visible:outline-offset-2 active:text-primary-active active:underline",
        className,
      )}
      {...props}
    >
      <ChevronLeft aria-hidden="true" className="size-icon-sm shrink-0" strokeWidth={2.4} />
      {children}
    </Link>
  );
}
