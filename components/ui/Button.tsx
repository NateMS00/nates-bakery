import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

// SKIN button-primary, button-secondary, button-destructive, button-text,
// each with its hover, active, focus, and disabled states.

export type ButtonVariant = "primary" | "secondary" | "destructive" | "text";

const base =
  "inline-flex min-h-touch-min items-center justify-center gap-sm type-button text-center transition-[background-color,color,border-color,transform] duration-(--motion-fast) ease-skin disabled:cursor-not-allowed aria-disabled:cursor-not-allowed [&_svg]:size-icon-sm [&_svg]:shrink-0";

// enabled:hover / enabled:active, not bare hover/active: a button disabled right under
// the pointer (e.g. Import, mid-click) must show the grey disabled look, not a hover
// tint bleeding through because the cursor never moved.
const variants: Record<ButtonVariant, string> = {
  primary:
    "rounded-md bg-primary px-lg text-on-primary enabled:hover:bg-primary-active enabled:active:translate-y-px enabled:active:bg-primary-active focus-visible:outline-offset-3 disabled:border disabled:border-hairline disabled:bg-surface-disabled disabled:text-disabled disabled:translate-y-0 aria-disabled:border aria-disabled:border-hairline aria-disabled:bg-surface-disabled aria-disabled:text-disabled",
  secondary:
    "rounded-md border-[1.5px] border-primary bg-surface-card px-lg text-primary enabled:hover:bg-primary-wash enabled:active:translate-y-px enabled:active:border-primary-active enabled:active:bg-primary-wash focus-visible:outline-offset-3 disabled:border-hairline disabled:bg-surface-disabled disabled:text-disabled disabled:translate-y-0",
  destructive:
    "rounded-md bg-error px-lg text-on-primary enabled:hover:underline enabled:active:translate-y-px focus-visible:outline-offset-3 disabled:bg-surface-disabled disabled:text-disabled disabled:no-underline",
  text:
    "rounded-sm px-sm text-primary underline-offset-3 enabled:hover:underline enabled:active:text-primary-active enabled:active:underline focus-visible:outline-offset-2 disabled:text-disabled disabled:no-underline",
};

export function buttonClass(variant: ButtonVariant, className?: string) {
  return cx(base, variants[variant], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; children: ReactNode };

export function Button({ variant = "secondary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; children: ReactNode };

export function ButtonLink({ variant = "secondary", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
