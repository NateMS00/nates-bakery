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
}: {
  tone: keyof typeof tones;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-center gap-x-sm rounded-md border-l-4 px-base py-md type-body-sm text-ink", tones[tone], className)}>
      <p>{children}</p>
      {action}
    </div>
  );
}
