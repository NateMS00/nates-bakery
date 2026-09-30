import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "./cx";

// SKIN text-link: cobalt, 1px underline at 3px offset, in the surrounding text's size.

export const textLinkClass =
  "rounded-sm text-primary underline decoration-1 underline-offset-3 hover:decoration-2 active:text-primary-active focus-visible:outline-offset-2";

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cx(textLinkClass, className)} {...props} />;
}

export function ExternalLink({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={cx(textLinkClass, className)} {...props}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
