"use client";

import { ChevronDown, Clock, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { readAlertsState, TimerAlertsSheet } from "@/components/shell/TimerAlertsSheet";
import { SkipLink } from "@/components/shell/SkipLink";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Notice } from "@/components/ui/Notice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/components/ui/cx";
import { TABLET_UP, useMediaQuery } from "@/components/ui/useMediaQuery";
import { groupItems } from "@/components/recipe/IngredientList";
import { formatTimeChip } from "@/lib/data/editor";
import type { Ingredient, Recipe, Step, TimeMark } from "@/lib/data/types";
import { formatGrams, formatScale, parseScale } from "@/lib/format";
import { splitStepText } from "@/lib/time-marks";
import { BakeClock } from "./BakeClock";
import { BakeProgress, type ProgressGroup } from "./BakeProgress";
import { StepStack, type StackItem } from "./StepStack";
import { FinishedTimerInfo, TimerBanner, TimerPills } from "./TimerViews";
import { useTimers, type Timer } from "./useTimers";
import { useWakeLock } from "./useWakeLock";

// /recipes/:recipeId/bake (Bake Mode), BONES-recipes-bake.md, in the Focus shell on
// SKIN's dark bake-stage (both themes). The step lives in ?step=; timers run across
// steps and survive a refresh; Step nav is pinned to the bottom on every device.

const FOR_THIS_STEP_LIMIT = 8;
const SHORT_VIEWPORT = "(max-height: 739px)";
const mounted = () => true;
const noop = () => () => {};

/** Per-bake browser state (ingredient checks, dismissed notice): cleared on Finish or Exit. */
function useSessionSet(key: string) {
  const [set, setSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage once on mount
      setSet(new Set(JSON.parse(window.sessionStorage.getItem(key) ?? "[]") as string[]));
    } catch {
      /* no storage: start empty */
    }
  }, [key]);
  const update = useCallback(
    (next: Set<string>) => {
      setSet(next);
      try {
        if (next.size) window.sessionStorage.setItem(key, JSON.stringify([...next]));
        else window.sessionStorage.removeItem(key);
      } catch {
        /* no storage */
      }
    },
    [key],
  );
  return [set, update] as const;
}

const CARD_DISMISSED = "backery.timerAlertsCard.dismissed";

/** The step's first words, up to about 24 characters, cut at a word (BONES: until the
 * editor offers a step name field). Used by the step stack and the timer-alert banner. */
// Small words a cut name shouldn't dangle on ("Whisk the egg, milk and" reads as
// unfinished); dropping them still leaves something readable ("Whisk the egg, milk…").
const SMALL_WORDS = new Set(["and", "or", "the", "a", "for", "with", "of", "to", "into", "at"]);

function shortStepName(text: string, limit = 24): string {
  const t = text.trim();
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  const words = (lastSpace > 8 ? cut.slice(0, lastSpace) : cut).trim().split(" ");
  while (words.length > 1 && SMALL_WORDS.has(words[words.length - 1].toLowerCase())) words.pop();
  return `${words.join(" ")}…`;
}

export function BakeView({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const isClient = useSyncExternalStore(noop, mounted, () => false);
  const tabletUp = useMediaQuery(TABLET_UP);
  const shortViewport = useMediaQuery(SHORT_VIEWPORT);

  // ?scale= and ?step=: invalid values open the nearest valid step and correct the URL.
  // Tips (SKELETON 1.4.4, BONES-recipes-bake 1.3.0) is a screen of its own, after the
  // last numbered step, reached with ?step=tips; it doesn't count in the numbering.
  const tipsGroupId = recipe.stepGroups.find((g) => g.name === "Tips")?.id;
  const numberedSteps = useMemo(() => recipe.steps.filter((s) => s.groupId !== tipsGroupId), [recipe.steps, tipsGroupId]);
  const tipSteps = useMemo(() => recipe.steps.filter((s) => s.groupId === tipsGroupId), [recipe.steps, tipsGroupId]);
  const tipsAvailable = tipSteps.length > 0;
  const { scale, valid: scaleValid } = parseScale(params.get("scale") ?? undefined);
  const total = numberedSteps.length;
  const totalScreens = total + (tipsAvailable ? 1 : 0);
  const stepParam = useCallback((n: number) => (tipsAvailable && n === totalScreens ? "tips" : String(n)), [tipsAvailable, totalScreens]);
  const rawStep = params.get("step");
  const onTips = tipsAvailable && rawStep === "tips";
  const wanted = Math.round(Number(rawStep));
  const stepNumber = onTips ? totalScreens : Number.isFinite(wanted) && rawStep !== null && rawStep.trim() !== "" ? Math.min(Math.max(wanted, 1), total) : 1;
  const step = onTips ? undefined : numberedSteps[stepNumber - 1];
  const last = stepNumber === totalScreens;
  const hasTimer = Boolean(step && step.timeMarks.length > 0);

  const writeUrl = useCallback(
    (n: number) => {
      const next = new URLSearchParams();
      if (scale !== 1) next.set("scale", String(scale));
      next.set("step", stepParam(n));
      window.history.replaceState(null, "", `${pathname}?${next}`);
    },
    [pathname, scale, stepParam],
  );
  useEffect(() => {
    if (stepParam(stepNumber) !== rawStep || !scaleValid) writeUrl(stepNumber);
  }, [stepNumber, rawStep, scaleValid, writeUrl, stepParam]);

  // Moving to another step scrolls back to the top (so the step stack stays visible
  // under the sticky header and pills, instead of scrolling away beneath them), then
  // moves focus to the heading without scrolling again, so screen readers read it.
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (moved.current) {
      window.scrollTo(0, 0);
      heading.current?.focus({ preventScroll: true });
    }
    moved.current = false;
  }, [stepNumber]);
  function goTo(n: number) {
    if (n < 1 || n > totalScreens || n === stepNumber) return;
    moved.current = true;
    writeUrl(n);
  }

  // Swipe left or right on touch screens; the buttons stay the reliable way.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(stepNumber + (dx < 0 ? 1 : -1));
  };

  const { timers, now, start, pause, resume, clear, clearAll, adjust, announcement } = useTimers(recipe.id);
  const { refused: screenMayLock } = useWakeLock();
  const [checks, setChecks] = useSessionSet(`backery.checks.${recipe.id}`);
  const [dismissed, setDismissed] = useSessionSet(`backery.bake.${recipe.id}`);

  // Timer alerts card: while alerts are off and it hasn't been dismissed for good, once a
  // timer has started. Notifications themselves are STUBBED.
  const [cardDismissed, setCardDismissed] = useState(false);
  const alertsOff = isClient && readAlertsState() !== "alerts-on";
  const cardHidden = cardDismissed || (isClient && window.localStorage.getItem(CARD_DISMISSED) === "1");
  const showAlertsCard = alertsOff && !cardHidden && timers.length > 0;
  const [sheetOpen, setSheetOpen] = useState(false);
  const setUp = useRef<HTMLButtonElement>(null);

  const estimates = recipe.ingredients.some((i) => i.status === "estimated");
  const showEstimates = estimates && stepNumber === 1 && isClient && !dismissed.has("estimates");

  const byId = useMemo(() => new Map(recipe.ingredients.map((i) => [i.id, i])), [recipe.ingredients]);
  const forThisStep = step ? step.ingredientIds.map((id) => byId.get(id)).filter((i): i is Ingredient => Boolean(i)) : [];
  const groupName = (groupId: string | null) => recipe.stepGroups.find((g) => g.id === groupId)?.name;
  // Timer labels break only at the dots: "Step 2 · Dough · 6 min" never splits "6 min".
  // Tips never start timers, so `label` is only ever read when `step` exists.
  const label = step ? `Step ${stepNumber}${groupName(step.groupId) ? ` · ${groupName(step.groupId)}` : ""}` : "";

  // The hero clock is always the step's first detected time; further marks are chips
  // that start their own timer, shown as a pill once started.
  const heroSource = hasTimer ? `${step!.id}:0` : null;
  const heroTimer = heroSource ? timers.find((t) => t.source === heroSource) : undefined;
  const clockStartId = `clock-start-${step?.id ?? "none"}`;
  // Next step is the stage's primary (ochre) button except while the clock is idle or
  // paused, when Start/Resume take that slot instead (BONES: "while idle, Start is the
  // ochre button... once it runs, Next step is primary again"; paused follows the
  // same rule as idle — not spelled out in BONES, inferred for consistency).
  const clockControlIsPrimary = hasTimer && Boolean(heroTimer) && !heroTimer!.finishedAt && heroTimer!.endsAt !== null;
  const nextStepIsPrimary = !hasTimer || clockControlIsPrimary || Boolean(heroTimer?.finishedAt);

  // All ingredients: collapsed on mobile except on step 1; always open from tablet up.
  const [allOpenChoice, setAllOpenChoice] = useState<boolean | null>(null);
  const allOpen = tabletUp || (allOpenChoice ?? stepNumber === 1);
  const allHeading = useRef<HTMLButtonElement | HTMLHeadingElement>(null);

  // Exit and Finish: timers stop and this bake's checks clear.
  const [exitOpen, setExitOpen] = useState(false);
  const exitLink = useRef<HTMLAnchorElement>(null);
  const recipeHref = `/recipes/${recipe.id}${scale !== 1 ? `?scale=${scale}` : ""}`;
  const active = timers.some((t) => !t.finishedAt);
  function endBake() {
    clearAll();
    setChecks(new Set());
    setDismissed(new Set());
  }
  // Finish: straight to the log, or first "Stop timers and finish?" while a timer runs.
  const [finishOpen, setFinishOpen] = useState(false);
  const finishButton = useRef<HTMLButtonElement>(null);
  function finish() {
    endBake();
    router.push(`/recipes/${recipe.id}/log?new=1&scale=${scale}`);
  }

  // The pinned bottom bar (Step nav): the page reserves its height.
  const bar = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Bake progress (SKELETON section 1): one segment per numbered step, grouped by
  // component group in recipe order; Tips is one extra segment in a final "tips" group.
  const progressGroups = useMemo<ProgressGroup[]>(() => {
    const groups: ProgressGroup[] = [];
    let openGroupId: string | null | undefined;
    for (const s of numberedSteps) {
      if (s.groupId !== openGroupId || groups.length === 0) {
        groups.push({ name: s.groupId ? (groupName(s.groupId) ?? null) : null, count: 0 });
        openGroupId = s.groupId;
      }
      groups[groups.length - 1].count++;
    }
    if (tipsAvailable) groups.push({ name: "tips", count: 1 });
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- groupName reads recipe.stepGroups, stable with recipe
  }, [numberedSteps, tipsAvailable, recipe.stepGroups]);

  // Step stack: every step before the current one, newest last; "running" follows any
  // of that step's timers, not just the hero.
  const finishedCount = onTips ? total : stepNumber - 1;
  const stackItems = useMemo<StackItem[]>(
    () =>
      numberedSteps.slice(0, finishedCount).map((s, i) => ({
        number: i + 1,
        name: shortStepName(s.text),
        running: timers.some((t) => t.source.startsWith(`${s.id}:`) && !t.finishedAt),
      })),
    [numberedSteps, finishedCount, timers],
  );

  function describeTimer(t: Timer): FinishedTimerInfo | null {
    const stepId = t.source.slice(0, t.source.lastIndexOf(":"));
    const idx = numberedSteps.findIndex((s) => s.id === stepId);
    if (idx === -1) return null;
    return { stepNumber: idx + 1, name: shortStepName(numberedSteps[idx].text) };
  }
  function goToTimerStep(info: FinishedTimerInfo, timerId: string) {
    goTo(info.stepNumber);
    clear(timerId);
  }
  // The clock already on screen shows its own done state; the banner is for every
  // other finished timer (including this step's hero once you've left it).
  // The current step's own hero timer is shown by its clock — idle, running, paused,
  // or (while still on screen) done — never also as a pill or a finished-timer banner.
  const otherTimers = timers.filter((t) => t.source !== heroSource);

  return (
    <>
      <SkipLink />
      {/* [overflow-anchor:none]: a notice (estimates, timer alerts) can appear above
          the step stack without warning (e.g. the first timer starting), and Chrome's
          scroll anchoring would otherwise nudge the page down to compensate, hiding
          the stack under the sticky header. */}
      <div className="bake-stage min-h-dvh bg-stage text-on-stage [overflow-anchor:none]">
        {/* Focus header (BONES-shell Focus variant): sticky on phones (with the pills
            and progress, so running timers and position stay in view); static on desktop. */}
        <header className="sticky top-0 z-20 bg-stage pt-[env(safe-area-inset-top)] tablet:static tablet:pt-0">
          <div className="mx-auto flex max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] flex-col gap-sm px-(--gutter) py-sm">
            <div className="flex min-h-touch-min items-center gap-sm">
              <Link
                ref={exitLink}
                href={recipeHref}
                aria-label="Exit bake mode"
                onClick={(e) => {
                  if (!active) {
                    endBake();
                    return;
                  }
                  e.preventDefault();
                  setExitOpen(true);
                }}
                className="inline-grid size-touch-min shrink-0 place-items-center rounded-full border border-on-stage text-on-stage transition-colors duration-(--motion-fast) ease-skin hover:bg-on-stage/10 active:bg-on-stage/15 focus-visible:outline-offset-2"
              >
                <X aria-hidden="true" className="size-icon" />
              </Link>
              <p className="min-w-0 flex-1 truncate text-center type-voice text-on-stage">{recipe.title}</p>
              <p className="shrink-0 type-label-mono text-on-stage-muted tabular-nums">
                {scale !== 1 && (
                  <>
                    <span className="text-on-stage">{formatScale(scale)}</span> <span aria-hidden="true">·</span>{" "}
                  </>
                )}
                <span className="tablet:hidden" aria-hidden="true">
                  {onTips ? "tips" : `${stepNumber}/${total}`}
                </span>
                <span className="max-tablet:sr-only">{onTips ? "Tips" : `Step ${stepNumber} of ${total}`}</span>
              </p>
            </div>
            <div className="tablet:hidden empty:hidden">
              <TimerPills timers={otherTimers} now={now} onPause={pause} onResume={resume} onClear={clear} />
            </div>
            <BakeProgress groups={progressGroups} current={stepNumber - 1} />
          </div>
        </header>

        <main id="main" tabIndex={-1} style={{ paddingBottom: barHeight }} className="mx-auto max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] px-(--gutter) pt-lg outline-none tablet:pt-xl">
          <div className="tablet:grid tablet:grid-cols-8 tablet:items-start tablet:gap-x-(--gutter) desktop:grid-cols-12">
            {/* Step stack, then Current Step */}
            <section aria-labelledby="step-heading" onPointerDown={onPointerDown} onPointerUp={onPointerUp} className="tablet:col-span-5 desktop:col-span-8">
              <StepStack items={stackItems} compact={hasTimer || shortViewport} onSelect={goTo} />

              <div className={cx("flex flex-col gap-sm empty:hidden", stackItems.length > 0 && "mt-lg")}>
                {showEstimates && (
                  <Notice
                    stage
                    tone="warning"
                    action={
                      <Button
                        variant="stage-text"
                        onClick={() => setDismissed(new Set([...dismissed, "estimates"]))}
                        aria-label="Dismiss estimates notice"
                        className="-my-md -ml-sm"
                      >
                        Dismiss
                      </Button>
                    }
                  >
                    Some amounts are estimates.
                  </Notice>
                )}
                {showAlertsCard && (
                  <Notice
                    stage
                    tone="info"
                    action={
                      <span className="-my-md flex">
                        <Button ref={setUp} variant="stage-text" aria-haspopup="dialog" onClick={() => setSheetOpen(true)} className="-ml-sm">
                          Set up
                        </Button>
                        <Button
                          variant="stage-text"
                          aria-label="Dismiss timer alerts notice"
                          onClick={() => {
                            setCardDismissed(true);
                            try {
                              window.localStorage.setItem(CARD_DISMISSED, "1");
                            } catch {
                              /* no storage: hidden until reload */
                            }
                          }}
                        >
                          Dismiss
                        </Button>
                      </span>
                    }
                  >
                    Get alerts when your phone is locked.
                  </Notice>
                )}
                {screenMayLock && (
                  <Notice stage tone="info">
                    Your screen may lock. Timers still run when you come back.
                  </Notice>
                )}
              </div>

              <div key={stepNumber} className={cx("animate-[step-rise_var(--motion-step)_var(--ease-skin)]", (stackItems.length > 0 || showEstimates || showAlertsCard || screenMayLock) && "mt-lg")}>
                {!onTips && !hasTimer && <BakeStepNumber n={stepNumber} />}
                <h1 ref={heading} id="step-heading" tabIndex={-1} className="type-label-mono text-[15px] text-on-stage-muted outline-none">
                  {onTips ? "Tips" : <>{groupName(step!.groupId) && `${groupName(step!.groupId)} · `}Step {stepNumber}</>}
                </h1>
                {onTips ? (
                  // BONES-recipes-bake 1.3.0: every tip, plain, at step-text size; no timers, no "For this step".
                  <ul role="list" className="mt-sm flex flex-col gap-base">
                    {tipSteps.map((t) => (
                      <li key={t.id} className="type-step-text text-on-stage tablet:text-[28px]">
                        {t.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <StepText step={step!} timers={timers} startId={clockStartId} label={label} onStartExtra={start} />
                )}
                {!onTips && hasTimer && (
                  <div className="mt-xl flex justify-center">
                    <BakeClock
                      startId={clockStartId}
                      defaultMinutes={step!.timeMarks[0].minutes}
                      timer={heroTimer}
                      now={now}
                      onStart={(minutes) => start(heroSource!, step!.timeMarks.length > 1 ? `${label} · ${formatTimeChip(minutes)}` : label, minutes)}
                      onPause={() => pause(heroTimer!.id)}
                      onResume={() => resume(heroTimer!.id)}
                      onAdjust={(deltaMs) => heroTimer && adjust(heroTimer.id, deltaMs)}
                    />
                  </div>
                )}

                {forThisStep.length > 0 && (
                  <div className="mt-lg">
                    <p className="type-label-mono text-on-stage-muted">for this step</p>
                    <ul role="list" className="mt-xs">
                      {forThisStep.slice(0, FOR_THIS_STEP_LIMIT).map((i) => (
                        <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-base border-b border-on-stage/30 py-md">
                          <span className="type-body-lg text-on-stage">{i.name}</span>
                          <Grams ingredient={i} scale={scale} large />
                        </li>
                      ))}
                    </ul>
                    {forThisStep.length > FOR_THIS_STEP_LIMIT && (
                      <Button
                        variant="stage-text"
                        className="-ml-sm"
                        onClick={() => {
                          setAllOpenChoice(true);
                          requestAnimationFrame(() => {
                            allHeading.current?.scrollIntoView({ block: "start" });
                            allHeading.current?.focus();
                          });
                        }}
                      >
                        and {forThisStep.length - FOR_THIS_STEP_LIMIT} more
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Right column from tablet up: timer pills above All ingredients */}
            <div className="mt-xl flex flex-col gap-xl tablet:col-span-3 tablet:mt-0 desktop:col-span-4">
              <div className="max-tablet:hidden empty:hidden">
                <TimerPills timers={otherTimers} now={now} onPause={pause} onResume={resume} onClear={clear} />
              </div>
              <section aria-labelledby="all-heading">
                {tabletUp ? (
                  <SectionHeading id="all-heading" ref={allHeading as React.RefObject<HTMLHeadingElement>} tabIndex={-1} className="text-on-stage! outline-none">
                    All ingredients
                  </SectionHeading>
                ) : (
                  <h2 id="all-heading" className="type-heading text-on-stage">
                    <button
                      ref={allHeading as React.RefObject<HTMLButtonElement>}
                      type="button"
                      aria-expanded={allOpen}
                      aria-controls="all-ingredients"
                      onClick={() => setAllOpenChoice(!allOpen)}
                      className="flex min-h-touch-min w-full items-center gap-sm rounded-sm text-left focus-visible:outline-offset-2"
                    >
                      All ingredients ({recipe.ingredients.length})
                      <ChevronDown aria-hidden="true" className={cx("ml-auto size-icon text-ochre transition-transform duration-(--motion-base) ease-skin", allOpen && "rotate-180")} />
                    </button>
                  </h2>
                )}
                {allOpen && (
                  <div id="all-ingredients">
                    {groupItems(recipe.ingredientGroups, recipe.ingredients).map(({ group, items }) => (
                      <div key={group?.id ?? "all"}>
                        {group && <h3 className="mt-lg border-b border-on-stage/30 pb-xs type-subheading text-on-stage first:mt-base">{group.name}</h3>}
                        <ul role="list" className={group ? undefined : "mt-sm"}>
                          {items.map((i) => {
                            const done = checks.has(i.id);
                            return (
                              <li key={i.id} className="border-b border-on-stage/30">
                                <Checkbox
                                  stage
                                  checked={done}
                                  onChange={(on) => {
                                    const next = new Set(checks);
                                    if (on) next.add(i.id);
                                    else next.delete(i.id);
                                    setChecks(next);
                                  }}
                                >
                                  <span className="flex items-baseline justify-between gap-base">
                                    <span className={cx(done && "text-on-stage-muted line-through decoration-1")}>{i.name}</span>
                                    <Grams ingredient={i} scale={scale} />
                                  </span>
                                </Checkbox>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>

        {/* Pinned bottom: Step nav (primary action) */}
        <div ref={bar} className="pin-bottom z-20 bg-stage shadow-bar">
          <nav aria-label="Steps" className="mx-auto grid max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] grid-cols-3 gap-sm px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))]">
            {stepNumber > 1 && (
              <Button variant="stage-secondary" onClick={() => goTo(stepNumber - 1)} className="min-h-touch-bake!">
                Back
              </Button>
            )}
            {last ? (
              <Button
                ref={finishButton}
                variant={nextStepIsPrimary ? "primary" : "stage-secondary"}
                aria-haspopup={active ? "dialog" : undefined}
                onClick={() => {
                  if (active) setFinishOpen(true);
                  else finish();
                }}
                // Its variant flips with the clock's state (see BakeClock's Start/
                // Pause/Resume button for why the color transition is off here).
                className={cx("min-h-touch-bake! transition-none!", stepNumber > 1 ? "col-span-2" : "col-span-3")}
              >
                Finish and log
              </Button>
            ) : (
              <Button
                variant={nextStepIsPrimary ? "primary" : "stage-secondary"}
                onClick={() => goTo(stepNumber + 1)}
                className={cx("min-h-touch-bake! transition-none!", stepNumber > 1 ? "col-span-2" : "col-span-3")}
              >
                {tipsAvailable && stepNumber === total ? "Next: Tips" : "Next step"}
              </Button>
            )}
          </nav>
        </div>

        <TimerBanner timers={otherTimers} describe={describeTimer} onDismiss={clear} onGoToStep={goToTimerStep} />
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>

      <TimerAlertsSheet open={sheetOpen} onClose={() => setSheetOpen(false)} returnFocus={setUp} />
      <ConfirmDialog
        open={finishOpen}
        onClose={() => setFinishOpen(false)}
        returnFocus={finishButton}
        title="Stop timers and finish?"
        body="Your running timers will stop."
        confirm="Stop and finish"
        cancel="Keep baking"
        onConfirm={async () => {
          setFinishOpen(false);
          finish();
        }}
      />
      <ConfirmDialog
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        returnFocus={exitLink}
        title="Stop timers and leave?"
        body="Your timers will stop."
        confirm="Leave"
        cancel="Keep baking"
        onConfirm={async () => {
          endBake();
          setExitOpen(false);
          router.push(recipeHref);
        }}
      />
    </>
  );
}

/** SKIN bake-step-number: the current step's number, outline only, decorative. */
function BakeStepNumber({ n }: { n: number }) {
  return (
    <p aria-hidden="true" className="type-bake-number text-transparent [-webkit-text-stroke:var(--spacing-outline-text)_var(--color-on-stage)]">
      {String(n).padStart(2, "0")}
    </p>
  );
}

/** A detected time, inline in the step text (SKIN timer-chip): the hero mark (index 0)
 * jumps focus to the clock's Start/Resume; any other mark starts its own timer, or, once
 * running, shows as a muted, non-interactive chip (its pill carries the live time). */
function StepText({
  step,
  timers,
  startId,
  label,
  onStartExtra,
}: {
  step: Step;
  timers: Timer[];
  startId: string;
  label: string;
  onStartExtra: (source: string, label: string, minutes: number) => void;
}) {
  const markIndex = useMemo(() => new Map(step.timeMarks.map((m, i) => [m, i] as const)), [step.timeMarks]);
  const parts = splitStepText(step.text, step.timeMarks);
  return (
    <p className="mt-sm type-step-text text-on-stage tablet:text-[28px]">
      {parts.map((part, i) => {
        if (part.kind === "text") return part.text;
        const idx = markIndex.get(part.mark) ?? 0;
        const source = `${step.id}:${idx}`;
        if (idx === 0) {
          return (
            <TimerChip
              key={i}
              mark={part.mark}
              ariaLabel={`Go to timer, ${formatTimeChip(part.mark.minutes)}`}
              onClick={() => {
                const el = document.getElementById(startId);
                el?.focus();
                el?.scrollIntoView({ block: "center" });
              }}
            />
          );
        }
        const live = timers.find((t) => t.source === source && !t.finishedAt);
        if (live) return <TimerChip key={i} mark={part.mark} muted />;
        return (
          <TimerChip
            key={i}
            mark={part.mark}
            ariaLabel={`Start ${formatTimeChip(part.mark.minutes)} timer`}
            onClick={() => onStartExtra(source, step.timeMarks.length > 1 ? `${label} · ${formatTimeChip(part.mark.minutes)}` : label, part.mark.minutes)}
          />
        );
      })}
    </p>
  );
}

function TimerChip({ mark, ariaLabel, muted = false, onClick }: { mark: TimeMark; ariaLabel?: string; muted?: boolean; onClick?: () => void }) {
  const label = formatTimeChip(mark.minutes);
  const classes = cx(
    "mx-[2px] inline-flex min-h-[32px] items-center gap-xs rounded-full px-md align-middle type-amount text-[15px] whitespace-nowrap",
    muted ? "bg-stage-track text-on-stage-muted" : "bg-ochre text-on-ochre",
  );
  if (muted) {
    return (
      <span className={classes}>
        <Clock aria-hidden="true" className="size-[14px]" />
        {label}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cx(
        classes,
        "relative before:absolute before:-top-sm before:-bottom-sm before:inset-x-0 before:content-['']",
        "focus-visible:outline-3 focus-visible:outline-offset-2",
      )}
    >
      <Clock aria-hidden="true" className="size-[14px]" />
      {label}
    </button>
  );
}

function Grams({ ingredient, scale, large = false }: { ingredient: Ingredient; scale: number; large?: boolean }): ReactNode {
  if (ingredient.grams === null) return <span className="text-right type-body-md text-on-stage-muted">to taste</span>;
  return (
    <span className="text-right whitespace-nowrap">
      <span className={cx(large ? "type-amount-lg" : "type-amount", "text-on-stage")}>{formatGrams(ingredient.grams * scale)}</span>
      <span className="ml-[3px] type-body-md text-on-stage-muted">g</span>
    </span>
  );
}
