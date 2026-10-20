"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/components/ui/cx";
import { formatRemaining, remainingMs, type Timer } from "./useTimers";

// SKIN bake-clock: the hero of a step with a timer. A 264px ring (320px from tablet
// up), ochre arc on the stage track, remaining time in timer-xl, the state under it,
// −1 min / Start (Pause / Resume) / +1 min below. role="timer"; doesn't announce
// every second (useTimers speaks at 1 minute left and when done).

const R = 127; // of a 264 viewBox; the ring scales with the element, the stroke doesn't
const CIRCUMFERENCE = 2 * Math.PI * R;
const TICK_ANGLES = [0, 90, 180, 270];

function tickPoint(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: 132 + radius * Math.cos(rad), y: 132 + radius * Math.sin(rad) };
}

export function BakeClock({
  startId,
  defaultMinutes,
  timer,
  now,
  onStart,
  onPause,
  onResume,
  onAdjust,
}: {
  /** DOM id for the Start/Resume button, so a timer-chip elsewhere can focus it. */
  startId: string;
  defaultMinutes: number;
  timer: Timer | undefined;
  now: number;
  onStart: (minutes: number) => void;
  onPause: () => void;
  onResume: () => void;
  onAdjust: (deltaMs: number) => void;
}) {
  const [plannedMinutes, setPlannedMinutes] = useState(defaultMinutes);
  const done = Boolean(timer?.finishedAt);
  const paused = Boolean(timer) && !done && timer!.endsAt === null;
  const running = Boolean(timer) && !done && !paused;
  const state = done ? "done" : running ? "running" : paused ? "paused" : "ready";

  const totalMs = timer ? timer.durationMs : plannedMinutes * 60_000;
  const remaining = timer ? remainingMs(timer, now) : totalMs;
  const fraction = totalMs > 0 ? Math.max(0, Math.min(1, remaining / totalMs)) : 0;

  const id = useId();

  return (
    <div className="flex flex-col items-center">
      <div role="timer" aria-labelledby={`${id}-time ${id}-state`} className="relative size-bake-clock tablet:size-bake-clock-lg">
        <svg viewBox="0 0 264 264" aria-hidden="true" className="size-full -rotate-90">
          <circle cx="132" cy="132" r={R} fill="none" stroke="var(--color-stage-track)" strokeWidth="10" />
          {TICK_ANGLES.map((deg) => {
            const outer = tickPoint(deg, R + 2);
            const inner = tickPoint(deg, R - 7);
            return <line key={deg} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="var(--color-on-stage-muted)" strokeWidth="2" />;
          })}
          <circle
            cx="132"
            cy="132"
            r={R}
            fill="none"
            stroke="var(--color-ochre)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={done ? 0 : CIRCUMFERENCE * (1 - fraction)}
            className={timer ? "transition-[stroke-dashoffset] duration-(--motion-base) ease-skin" : undefined}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-xs px-base text-center">
          {/* An h:mm:ss duration (an hour or more) is too wide for the ring at the
              full timer-xl size, so it steps down a size to still fit. */}
          <p id={`${id}-time`} className={cx("tabular-nums text-on-stage", remaining >= 3_600_000 ? "type-timer-xl text-[38px]! tablet:text-[46px]!" : "type-timer-xl")}>
            {formatRemaining(remaining)}
          </p>
          <p id={`${id}-state`} className="type-label-mono text-on-stage-muted">
            {state}
          </p>
          {running && <p className="type-caption text-on-stage-muted">Keep this screen open</p>}
        </div>
      </div>
      <div className="mt-lg flex items-center gap-lg">
        <Button
          type="button"
          variant="stage-secondary"
          aria-label="Remove one minute"
          onClick={() => (timer ? onAdjust(-60_000) : setPlannedMinutes((m) => Math.max(1, m - 1)))}
          disabled={done}
        >
          −1
        </Button>
        {!done && (
          <Button
            id={startId}
            type="button"
            variant={running ? "stage-secondary" : "primary"}
            onClick={running ? onPause : paused ? onResume : () => onStart(plannedMinutes)}
            // This button's variant itself flips (ochre fill ↔ cream outline) as the
            // clock's state changes, not just its hover/active state; transitioning
            // color/background/border here crossfades through a muddy, low-contrast
            // mid-tone, so this one swap is instant instead.
            className="min-w-[132px] transition-none!"
          >
            {running ? "Pause" : paused ? "Resume" : "Start"}
          </Button>
        )}
        <Button
          type="button"
          variant="stage-secondary"
          aria-label="Add one minute"
          onClick={() => (timer ? onAdjust(60_000) : setPlannedMinutes((m) => m + 1))}
          disabled={done}
        >
          +1
        </Button>
      </div>
    </div>
  );
}
