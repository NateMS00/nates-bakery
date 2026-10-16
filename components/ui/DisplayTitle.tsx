import { cx } from "./cx";

/**
 * SKIN display-title: a top-level page title in display-xl, where the last word
 * switches to Fraunces italic ("Your *recipes.*"). The accent word is still real
 * text in the H1, so screen readers read the title plainly — no asterisks, and
 * the accessible name is `lead` + `accent` exactly as written. One per page.
 */
export function DisplayTitle({ lead, accent, className }: { lead: string; accent: string; className?: string }) {
  return (
    <h1 className={cx("type-display-xl text-ink", className)}>
      {lead} <span className="italic font-[family-name:var(--font-fraunces-italic)]">{accent}</span>
    </h1>
  );
}
