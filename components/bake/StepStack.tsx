"use client";

import { useState } from "react";
import { cx } from "@/components/ui/cx";

// SKIN step-stack + step-strip: finished steps as cream strips on the stage, "02
// Knead ✓", 44px tall, 4px apart. The last 3 (2 compact) show; older ones collapse
// into "+n more done". A step whose timer still runs shows "◷ running" instead.
// Tapping a strip goes back to that step.

export interface StackItem {
  number: number;
  name: string;
  running: boolean;
}

export function StepStack({ items, compact, onSelect }: { items: StackItem[]; compact: boolean; onSelect: (n: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  const maxVisible = compact ? 2 : 3;
  const visible = expanded ? items : items.slice(-maxVisible);
  const hidden = items.length - visible.length;
  return (
    <div className="flex flex-col gap-xs">
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="min-h-touch-min rounded-sm py-xs text-left type-label-mono text-on-stage-muted hover:text-on-stage focus-visible:outline-offset-2"
        >
          +{hidden} more done
        </button>
      )}
      {visible.map((item) => (
        <button
          key={item.number}
          type="button"
          onClick={() => onSelect(item.number)}
          aria-label={`Back to step ${item.number}, ${item.name}, ${item.running ? "running" : "done"}`}
          data-touch-min="44"
          className={cx(
            "flex min-h-step-strip items-center gap-sm rounded-md bg-on-stage px-md text-stage",
            "transition-transform duration-(--motion-fast) ease-skin hover:underline active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2",
          )}
        >
          <span aria-hidden="true" className="shrink-0 type-amount tabular-nums">
            {String(item.number).padStart(2, "0")}
          </span>
          <span aria-hidden="true" className="min-w-0 flex-1 truncate text-left type-tab">
            {item.name}
          </span>
          <span aria-hidden="true" className="shrink-0 type-tab">
            {item.running ? "◷ running" : "✓"}
          </span>
        </button>
      ))}
    </div>
  );
}
