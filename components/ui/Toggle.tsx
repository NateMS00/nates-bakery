"use client";

import { cx } from "./cx";

// SKIN toggle: 52×32 pill track with a round thumb inside a 48px hit area,
// always with a visible text label. Announced as a switch.

export function Toggle({
  label,
  spoken,
  checked,
  onChange,
  className,
}: {
  label: string;
  /** A fuller accessible name that starts with the visible label ("To taste, Fine salt"). */
  spoken?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={spoken}
      onClick={() => onChange(!checked)}
      className={cx(
        "group inline-flex min-h-touch-min items-center gap-md rounded-md type-body-md text-ink focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-disabled",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "relative inline-block h-[32px] w-[52px] shrink-0 rounded-full border transition-colors duration-(--motion-fast) ease-skin",
          checked ? "border-primary bg-primary" : "border-border bg-surface-sunken group-hover:border-ink",
          "group-disabled:border-hairline group-disabled:bg-surface-disabled",
        )}
      >
        <span
          className={cx(
            "absolute top-1/2 left-[3px] size-[24px] -translate-y-1/2 rounded-full border transition-transform duration-(--motion-fast) ease-skin",
            checked ? "translate-x-[20px] border-on-primary bg-on-primary" : "border-border bg-surface-card",
          )}
        />
      </span>
      {label}
    </button>
  );
}
