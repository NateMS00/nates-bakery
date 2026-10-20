import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

// SKIN button-primary, button-secondary, button-destructive, button-text,
// each with its hover, active, focus, and disabled states.

export type ButtonVariant = "primary" | "secondary" | "destructive" | "text" | "stage-secondary";

const base =
  "inline-flex min-h-touch-min items-center justify-center gap-sm text-center transition-[background-color,color,border-color,transform] duration-(--motion-fast) ease-skin disabled:cursor-not-allowed aria-disabled:cursor-not-allowed [&_svg]:size-icon-sm [&_svg]:shrink-0";

// enabled:hover / enabled:active, not bare hover/active: a button disabled right under
// the pointer (e.g. Import, mid-click) must show the grey disabled look, not a hover
// tint bleeding through because the cursor never moved.
const variants: Record<ButtonVariant, string> = {
  // Ochre pill with an ink edge: the one primary action per screen (SKIN October 2026 —
  // ochre replaced cobalt as the primary fill; the edge, not the fill, is what meets the
  // 3:1 non-text contrast rule, since ochre-on-porcelain alone is only 1.9:1).
  primary:
    "type-button rounded-full border border-outline bg-ochre px-lg text-on-ochre enabled:hover:bg-ochre-active enabled:active:translate-y-px enabled:active:bg-ochre-active focus-visible:outline-offset-3 disabled:border-hairline disabled:bg-surface-disabled disabled:text-disabled disabled:translate-y-0 aria-disabled:border-hairline aria-disabled:bg-surface-disabled aria-disabled:text-disabled",
  // An outlined ink pill, no fill: every other action.
  secondary:
    "type-button rounded-full border border-outline bg-transparent px-lg text-ink enabled:hover:bg-surface-sunken enabled:active:translate-y-px enabled:active:bg-surface-sunken focus-visible:outline-offset-3 disabled:border-hairline disabled:bg-surface-disabled disabled:text-disabled disabled:translate-y-0",
  // SKIN bake-stage: "secondary buttons on the stage are cream outlined pills" —
  // on-stage is cream in both themes, so this variant doesn't need a dark-mode pair.
  "stage-secondary":
    "type-button rounded-full border border-on-stage bg-transparent px-lg text-on-stage enabled:hover:bg-on-stage/10 enabled:active:translate-y-px enabled:active:bg-on-stage/15 focus-visible:outline-offset-3 disabled:border-stage-track disabled:text-stage-track disabled:translate-y-0",
  destructive:
    "type-button rounded-full bg-error px-lg text-on-primary enabled:hover:underline enabled:active:translate-y-px focus-visible:outline-offset-3 disabled:bg-surface-disabled disabled:text-disabled disabled:no-underline",
  // Sentence case in the reading face, not uppercase mono: it often sits inside or right
  // after a sentence ("1 amount is an estimate. Confirm it"), where the pill treatment
  // reads as a shout and as a separate button rather than a continuation of the line.
  text:
    "type-body-md font-bold rounded-sm px-sm text-primary underline-offset-3 enabled:hover:underline enabled:active:text-primary-active enabled:active:underline focus-visible:outline-offset-2 disabled:text-disabled disabled:no-underline",
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
