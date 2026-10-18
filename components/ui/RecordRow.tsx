import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * SKIN record-row: a `label-mono` label closed by an ink rule, used inside any
 * `dl` built like a catalogue record (the Recipe page's record-card, a Bake Log
 * entry). `stacked` (titleLayout) puts the label above a left-aligned, full-width
 * value instead of label-left/value-right — for a value too long to share the
 * row (a recipe's title; a bake's full notes).
 */
export function RecordRow({ label, stacked = false, className, children }: { label: string; stacked?: boolean; className?: string; children: ReactNode }) {
  if (stacked) {
    return (
      <div className={cx("flex flex-col gap-xs border-b border-outline py-sm", className)}>
        <dt className="type-label-mono text-muted">{label}</dt>
        <dd className="text-left text-ink">{children}</dd>
      </div>
    );
  }
  return (
    <div className={cx("flex items-baseline justify-between gap-base border-b border-outline py-sm", className)}>
      <dt className="type-label-mono shrink-0 text-muted">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
