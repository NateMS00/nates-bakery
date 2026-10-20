"use client";

import { Pause, Play, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { IconButton } from "@/components/ui/IconButton";
import { formatRemaining, remainingMs, type Timer } from "./useTimers";

// Timers (BONES-recipes-bake.md section "Timers"): a running timer you've left its
// step lives as a SKIN timer-pill — under the header on phones, at the top of the
// right column from tablet up (same component, different spot). At most 2 show,
// soonest first, then "+n" opens a sheet with every timer. A finished timer isn't a
// pill any more: it becomes the timer-alert banner until dismissed.

/** Soonest to finish first, so the timers about to go off are always visible. */
export function byRemaining(timers: Timer[], now: number): Timer[] {
  return [...timers].sort((a, b) => remainingMs(a, now) - remainingMs(b, now) || a.id.localeCompare(b.id));
}

type Actions = { onPause: (id: string) => void; onResume: (id: string) => void; onClear: (id: string) => void };

function MiniRing({ fraction }: { fraction: number }) {
  const r = 13;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-[32px] shrink-0 -rotate-90">
      <circle cx="16" cy="16" r={r} fill="none" stroke="var(--color-on-ochre)" strokeOpacity="0.3" strokeWidth="3" />
      <circle
        cx="16"
        cy="16"
        r={r}
        fill="none"
        stroke="var(--color-on-ochre)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - fraction)}
      />
    </svg>
  );
}

const pillIconButton = "rounded-full text-on-ochre! hover:bg-on-ochre/10! active:bg-on-ochre/15! focus-visible:outline-offset-1";

function Pill({
  timer,
  now,
  onPause,
  onResume,
  onOpenSheet,
}: { timer: Timer; now: number; onOpenSheet: () => void } & Pick<Actions, "onPause" | "onResume">) {
  const paused = timer.endsAt === null;
  const fraction = timer.durationMs > 0 ? Math.max(0, Math.min(1, remainingMs(timer, now) / timer.durationMs)) : 0;
  return (
    <div className="flex min-h-touch-min items-center gap-sm rounded-full bg-ochre py-xs pr-xs pl-sm text-on-ochre">
      {/* The pill itself opens the full Timers list (Clear lives there), so even a
          single timer — with no "+n" overflow button — has a way to cancel it. */}
      <button
        type="button"
        onClick={onOpenSheet}
        aria-label={`Timer details, ${timer.label}`}
        className="flex min-w-0 flex-1 items-center gap-sm rounded-full text-left focus-visible:outline-3 focus-visible:outline-offset-2"
      >
        <MiniRing fraction={fraction} />
        <span className="min-w-0 flex-1 truncate type-body-sm">
          {timer.label}
          {paused && <span className="ml-xs type-caption">Paused</span>}
        </span>
        <span className="shrink-0 type-amount tabular-nums">{formatRemaining(remainingMs(timer, now))}</span>
      </button>
      {paused ? (
        <IconButton label={`Resume timer, ${timer.label}`} onClick={() => onResume(timer.id)} className={pillIconButton}>
          <Play aria-hidden="true" strokeWidth={1.8} />
        </IconButton>
      ) : (
        <IconButton label={`Pause timer, ${timer.label}`} onClick={() => onPause(timer.id)} className={pillIconButton}>
          <Pause aria-hidden="true" strokeWidth={1.8} />
        </IconButton>
      )}
    </div>
  );
}

const MAX_PILLS = 2;

/** The timer-pill list: active (not finished) timers, soonest first, "+n" opens every one. */
export function TimerPills({ timers, now, ...actions }: { timers: Timer[]; now: number } & Actions) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = timers.filter((t) => !t.finishedAt);
  if (active.length === 0) return null;
  const sorted = byRemaining(active, now);
  const shown = sorted.slice(0, MAX_PILLS);
  const hidden = sorted.length - shown.length;
  return (
    <div className="flex flex-col gap-sm">
      {shown.map((t) => (
        <Pill key={t.id} timer={t} now={now} onPause={actions.onPause} onResume={actions.onResume} onOpenSheet={() => setSheetOpen(true)} />
      ))}
      {hidden > 0 && (
        <Button variant="stage-secondary" onClick={() => setSheetOpen(true)} className="self-start">
          +{hidden}
        </Button>
      )}
      <Dialog open={sheetOpen} onClose={() => setSheetOpen(false)} title="Timers" modalColumns={4}>
        <ul role="list" className="flex flex-col gap-sm">
          {sorted.map((t) => {
            const paused = t.endsAt === null;
            return (
              <li key={t.id} className="flex items-center gap-sm rounded-lg border border-hairline bg-surface-card px-base py-md">
                <div className="min-w-0 flex-1">
                  <p className="truncate type-caption text-muted">{t.label}</p>
                  <p className="type-amount-lg tabular-nums text-ink">{formatRemaining(remainingMs(t, now))}</p>
                </div>
                {paused ? (
                  <IconButton label={`Resume timer, ${t.label}`} onClick={() => actions.onResume(t.id)}>
                    <Play aria-hidden="true" strokeWidth={1.8} />
                  </IconButton>
                ) : (
                  <IconButton label={`Pause timer, ${t.label}`} onClick={() => actions.onPause(t.id)}>
                    <Pause aria-hidden="true" strokeWidth={1.8} />
                  </IconButton>
                )}
                <IconButton label={`Clear timer, ${t.label}`} onClick={() => actions.onClear(t.id)}>
                  <X aria-hidden="true" strokeWidth={1.8} />
                </IconButton>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </div>
  );
}

export interface FinishedTimerInfo {
  stepNumber: number;
  name: string;
}

/**
 * SKIN timer-alert: the finished-timer banner across the top of the viewport, above
 * everything, until dismissed; several stack, newest first. Announced immediately.
 */
export function TimerBanner({
  timers,
  describe,
  onDismiss,
  onGoToStep,
}: {
  timers: Timer[];
  describe: (t: Timer) => FinishedTimerInfo | null;
  onDismiss: (id: string) => void;
  onGoToStep: (info: FinishedTimerInfo, timerId: string) => void;
}) {
  const done = timers.filter((t) => t.finishedAt).sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));
  const onStage = "border-on-primary! bg-transparent! text-on-primary! hover:bg-primary-active! active:bg-primary-active!";
  return (
    <div role="alert" aria-live="assertive" className="fixed inset-x-0 top-0 z-50 flex flex-col">
      {done.map((t) => {
        const info = describe(t);
        return (
          <div
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-x-base gap-y-sm border-b-4 border-ochre bg-primary px-(--gutter) py-base text-on-primary shadow-float first:pt-[calc(var(--spacing-base)+env(safe-area-inset-top))]"
          >
            <div>
              <p className="type-heading">{info ? `Step ${info.stepNumber} is done` : `${t.label} is done`}</p>
              {info && <p className="type-body-sm">{info.name}</p>}
            </div>
            <div className="flex gap-sm">
              {info && (
                <Button variant="secondary" onClick={() => onGoToStep(info, t.id)} className={onStage}>
                  Go to step
                </Button>
              )}
              <Button variant="secondary" onClick={() => onDismiss(t.id)} className={onStage}>
                Dismiss
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
