"use client";

import { forwardRef, useRef, useState, type KeyboardEvent } from "react";
import { StarGlyph } from "./Star";
import { cx } from "./cx";

// SKIN star-rating: five stars, each its own 48px target and radio option. Arrow
// keys move and select, as radios do; pressing the current rating clears it.

export const StarRating = forwardRef<HTMLDivElement, {
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
  showUnrated?: boolean;
  /** 40px (the Log sheet's star field) instead of the default 22px. */
  large?: boolean;
  /** Marks the current rating (or the first star, unrated) data-autofocus, for a
   * Dialog that should open with focus here (the Log sheet, for a new bake). */
  autoFocus?: boolean;
  className?: string;
}>(function StarRating({ value, onChange, label = "Rating", showUnrated = false, large = false, autoFocus = false, className }, ref) {
  const [hover, setHover] = useState<number | null>(null);
  const [popped, setPopped] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex = focused ?? (value ? value - 1 : 0);

  function choose(n: number) {
    setPopped(n);
    window.setTimeout(() => setPopped(null), 120); // motion.fast
    onChange(n === value ? null : n);
  }

  function onKeyDown(e: KeyboardEvent, index: number) {
    const move = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (move === undefined) return;
    e.preventDefault();
    const next = (index + move + 5) % 5;
    setFocused(next);
    buttons.current[next]?.focus();
    onChange(next + 1);
  }

  return (
    <div className={cx("flex flex-wrap items-center", className)}>
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        className={cx("flex", !large && "-ml-[calc((var(--spacing-touch-min)-22px)/2)]")}
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n, i) => (
          <button
            key={n}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`Rate ${n} out of 5`}
            tabIndex={i === focusIndex ? 0 : -1}
            data-autofocus={autoFocus && i === focusIndex ? true : undefined}
            onClick={() => choose(n)}
            onKeyDown={(e) => onKeyDown(e, i)}
            onMouseEnter={() => setHover(n)}
            className="grid size-touch-min place-items-center rounded-sm focus-visible:outline-offset-1"
          >
            <StarGlyph
              filled={hover === null && value !== null && n <= value}
              preview={hover !== null && n <= hover}
              className={cx(large ? "size-[40px]" : "size-[22px]", "transition-transform duration-(--motion-fast) ease-skin", popped === n && "scale-[1.08]")}
            />
          </button>
        ))}
      </div>
      {showUnrated && value === null && <span className="type-caption text-muted">Not rated</span>}
    </div>
  );
});
