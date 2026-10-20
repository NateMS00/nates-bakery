import type { ReactNode } from "react";
import { cx } from "./cx";

// SKIN notice-info / notice-warning / notice-error: wash, 4px accent, ink body-sm.

const tones = {
  info: "bg-info-wash border-primary",
  warning: "bg-warning-wash border-warning",
  error: "bg-error-wash border-error",
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
  /** SKIN bake-stage: the tinted washes read as porcelain-page artifacts on the dark
   * stage, so this swaps in a plain cream-on-stage treatment, same for every tone. */
  stage?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-sm gap-y-md rounded-md border-l-4 px-base py-md type-body-sm",
        stage ? "border-on-stage/40 bg-on-stage/10 text-on-stage" : cx(tones[tone], "text-ink"),
        className,
      )}
    >
      <p>{children}</p>
      {action}
    </div>
  );
}
