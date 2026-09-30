"use client";

import { cx } from "./cx";

// SKIN segmented + segmented-item: grout track, the selected item is one blue tile.
// Items are 40px tall; ::after extends each hit area to the track's 48px.

export interface SegmentedOption {
  value: string;
  label: string;
  ariaLabel?: string;
}

export function Segmented({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: SegmentedOption[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cx("flex gap-xs rounded-md border border-border bg-surface-sunken p-xs", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
          className="relative min-h-10 flex-1 rounded-sm px-md whitespace-nowrap type-button text-body transition-colors duration-(--motion-fast) ease-skin after:absolute after:inset-x-0 after:-inset-y-xs after:content-[''] hover:bg-surface-card hover:text-ink focus-visible:outline-offset-1 aria-pressed:bg-primary aria-pressed:text-on-primary disabled:cursor-not-allowed disabled:text-disabled"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
