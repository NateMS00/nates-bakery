import { cx } from "./cx";

/**
 * SKIN display-title: a top-level page title in display-xl, where the last word
 * switches to Fraunces italic ("Your *recipes.*"). The accent word is still real
 * text in the H1, so screen readers read the title plainly — no asterisks, and
 * the accessible name is `lead` + `accent` exactly as written. One per page. No
 * hardcoded text color: every current use sits on the page's own ink-on-body
 * color already, and the celebration screen needs its own (on-celebration,
 * cream) — a caller passes its own `text-*` class rather than fighting a
 * same-specificity default.
 */
export function DisplayTitle({
  lead,
  accent,
  className,
  ref,
  tabIndex,
}: {
  lead: string;
  accent: string;
  className?: string;
  ref?: React.Ref<HTMLHeadingElement>;
  tabIndex?: number;
}) {
  return (
    <h1 ref={ref} tabIndex={tabIndex} className={cx("type-display-xl", className)}>
      {lead} <span className="italic font-[family-name:var(--font-fraunces-italic)]">{accent}</span>
    </h1>
  );
}
