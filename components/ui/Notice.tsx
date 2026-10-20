import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

// SKIN notice-info / notice-warning / notice-error (since October 2026): a full 1px
// border in the semantic colour at rounded.tile, with a small leading icon so the
// kind never depends on colour alone — the border-l-4 accent it replaces was the
// one one-sided edge left in a system of full outlines.

const tones = {
  info: { classes: "bg-info-wash border-primary", icon: Info, iconClass: "text-primary" },
  warning: { classes: "bg-warning-wash border-warning", icon: AlertTriangle, iconClass: "text-warning" },
  error: { classes: "bg-error-wash border-error", icon: AlertCircle, iconClass: "text-error" },
};

export function Notice({
  tone,
  children,
  action,
  className,
  stage = false,
}: {
  tone: keyof typeof tones;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  /** SKIN bake-stage: a lighter navy fill, an on-stage-muted border and cream text,
   * same for every tone — the tinted washes read as porcelain-page artifacts on the
   * dark stage. */
  stage?: boolean;
}) {
  const { icon: Icon, iconClass } = tones[tone];
  return (
    <div
      className={cx(
        "flex flex-wrap items-start gap-x-sm gap-y-md rounded-tile border px-base py-md type-body-sm",
        stage ? "border-on-stage-muted bg-on-stage/10 text-on-stage" : cx(tones[tone].classes, "text-ink"),
        className,
      )}
    >
      <Icon aria-hidden="true" className={cx("size-icon-sm mt-[2px] shrink-0", stage ? "text-on-stage" : iconClass)} />
      <p className="flex-1">{children}</p>
      {action}
    </div>
  );
}
