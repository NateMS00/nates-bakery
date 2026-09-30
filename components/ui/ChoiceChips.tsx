"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx";

// SKIN choice-chip: single-choice options drawn as wrapping tiles, 48px tall; the
// selected chip fills cobalt. A radio group for assistive technology, with one tab
// stop and arrow keys that move and select, as radios do.

export interface ChoiceChipOption {
  value: string;
  label: ReactNode;
  /** Read instead of `label` when the label has symbols (e.g. "4★ and up"). */
  spoken?: string;
  count?: number;
}

export function ChoiceChips({
  label,
  labelId,
  options,
  value,
  onChange,
}: {
  label: string;
  labelId: string;
  options: ChoiceChipOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  // Moving and tapping both select, so the tab stop is always the selected chip.
  const tabStop = Math.max(0, options.findIndex((o) => o.value === value));

  function onKeyDown(e: KeyboardEvent, index: number) {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (move === undefined) return;
    e.preventDefault();
    const next = (index + move + options.length) % options.length;
    buttons.current[next]?.focus();
    onChange(options[next].value);
  }

  return (
    <div className="flex flex-col gap-xs">
      <span id={labelId} className="type-label text-muted">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-sm">
        {options.map((option, i) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={option.spoken ? `${option.spoken}${option.count !== undefined ? `, ${option.count}` : ""}` : undefined}
              tabIndex={i === tabStop ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cx(
                "inline-flex min-h-touch-min items-center gap-sm rounded-md border px-base type-body-sm font-bold transition-colors duration-(--motion-fast) ease-skin focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface-disabled disabled:text-disabled",
                checked
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border bg-surface-card text-ink hover:border-ink hover:bg-surface-sunken",
              )}
            >
              {option.label}
              {option.count !== undefined && (
                <span className={cx("font-normal tabular-nums", checked ? "text-on-primary" : "text-muted")}>{option.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
