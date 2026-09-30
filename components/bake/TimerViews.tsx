"use client";

import { Pause, Play, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/components/ui/cx";
import { formatRemaining, remainingMs, type Timer } from "./useTimers";

// Timers (SKELETON section 2): a panel in the right column from tablet up, and on
// mobile a compact strip pinned above Step nav (2 rows, then "+n more" expands it
// upward). SKIN timer-row, and timer-row-done once it reaches zero.

type Actions = { onPause: (id: string) => void; onResume: (id: string) => void; onClear: (id: string) => void };

function Controls({ timer, onPause, onResume, onClear }: { timer: Timer } & Actions) {
  const done = Boolean(timer.finishedAt);
  const paused = !done && timer.endsAt === null;
  return (
    <div className="flex shrink-0 items-center">
      {!done &&
        (paused ? (
          <IconButton label={`Resume timer, ${timer.label}`} onClick={() => onResume(timer.id)}>
            <Play aria-hidden="true" strokeWidth={1.8} />
          </IconButton>
        ) : (
          <IconButton label={`Pause timer, ${timer.label}`} onClick={() => onPause(timer.id)}>
            <Pause aria-hidden="true" strokeWidth={1.8} />
          </IconButton>
        ))}
      <IconButton label={`${done ? "Dismiss" : "Clear"} timer, ${timer.label}`} onClick={() => onClear(timer.id)}>
        <X aria-hidden="true" strokeWidth={1.8} />
      </IconButton>
    </div>
  );
}

function Time({ timer, now, compact = false }: { timer: Timer; now: number; compact?: boolean }) {
  const done = Boolean(timer.finishedAt);
  const paused = !done && timer.endsAt === null;
  return (
    // SKIN timer-row: the timer size (34px), or timeSizeCompact (28px) in the mobile strip.
    <span className={cx("type-timer", compact && "text-[28px]", done ? "text-warning" : "text-ink")}>
      {formatRemaining(remainingMs(timer, now))}
      {paused && <span className="ml-sm type-caption text-muted">Paused</span>}
    </span>
  );
}

/** Tablet and desktop: the right-column Timers section. */
export function TimersPanel({ timers, now, ...actions }: { timers: Timer[]; now: number } & Actions) {
  if (!timers.length) return null;
  return (
    <section aria-labelledby="timers-heading">
      <SectionHeading id="timers-heading">Timers</SectionHeading>
      <ul role="list" className="mt-sm flex flex-col gap-sm">
        {timers.map((t) => (
          <li
            key={t.id}
            className={cx("rounded-lg border px-base py-md", t.finishedAt ? "border-warning bg-warning-wash" : "border-hairline bg-surface-card")}
          >
            <p className="type-caption text-muted">{t.label}</p>
            <div className="mt-xs flex items-center justify-between gap-sm">
              <Time timer={t} now={now} />
              <Controls timer={t} {...actions} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const STRIP_ROWS = 2;

/** Mobile: the strip pinned just above Step nav, so running timers stay visible on every step. */
export function TimerStrip({ timers, now, ...actions }: { timers: Timer[]; now: number } & Actions) {
  const [expanded, setExpanded] = useState(false);
  if (!timers.length) return null;
  const shown = expanded ? timers : timers.slice(0, STRIP_ROWS);
  return (
    <section aria-label="Timers" className="border-b border-hairline px-(--gutter)">
      <ul role="list">
        {shown.map((t) => (
          // Two short lines: the label (one truncated line), then the time with Pause and Clear.
          <li key={t.id} className={cx("-mx-sm rounded-md px-sm pt-xs", t.finishedAt !== null && "bg-warning-wash")}>
            <p className="truncate type-caption text-muted">{t.label}</p>
            <div className="-mr-sm flex items-center justify-between gap-sm">
              <Time timer={t} now={now} compact />
              <Controls timer={t} {...actions} />
            </div>
          </li>
        ))}
      </ul>
      {timers.length > STRIP_ROWS && (
        <Button variant="text" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)} className="-ml-sm">
          {expanded ? "Show fewer" : `+${timers.length - STRIP_ROWS} more`}
        </Button>
      )}
    </section>
  );
}

/**
 * SKIN timer-alert: the finished-timer banner across the top of the viewport, above
 * everything, until dismissed; several stack, newest first. Announced immediately.
 */
export function TimerBanner({ timers, onDismiss }: { timers: Timer[]; onDismiss: (id: string) => void }) {
  const done = timers.filter((t) => t.finishedAt).sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));
  return (
    <div role="alert" aria-live="assertive" className="fixed inset-x-0 top-0 z-50 flex flex-col">
      {done.map((t) => (
        <div
          key={t.id}
          className="flex flex-wrap items-center justify-between gap-x-base gap-y-sm border-b-4 border-crust bg-primary px-(--gutter) py-base text-on-primary shadow-float first:pt-[calc(var(--spacing-base)+env(safe-area-inset-top))]"
        >
          <p className="type-heading">{t.label} timer is done</p>
          <Button
            variant="secondary"
            onClick={() => onDismiss(t.id)}
            className="border-on-primary! bg-transparent! text-on-primary! hover:bg-primary-active! active:bg-primary-active!"
          >
            Dismiss
          </Button>
        </div>
      ))}
    </div>
  );
}
