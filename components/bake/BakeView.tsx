"use client";

import { ChevronDown, ChevronLeft, Timer as TimerIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { readAlertsState, TimerAlertsSheet } from "@/components/shell/TimerAlertsSheet";
import { SkipLink } from "@/components/shell/SkipLink";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Notice } from "@/components/ui/Notice";
import { GroupHeading } from "@/components/ui/SectionHeading";
import { TileMark } from "@/components/ui/Tile";
import { cx } from "@/components/ui/cx";
import { TABLET_UP, useMediaQuery } from "@/components/ui/useMediaQuery";
import { groupItems } from "@/components/recipe/IngredientList";
import { formatTimeChip } from "@/lib/data/editor";
import type { Ingredient, Recipe } from "@/lib/data/types";
import { formatGrams, formatScale, parseScale } from "@/lib/format";
import { splitStepText } from "@/lib/time-marks";
import { TimerBanner, TimersPanel, TimerStrip } from "./TimerViews";
import { useTimers } from "./useTimers";
import { useWakeLock } from "./useWakeLock";

// /recipes/:recipeId/bake (Bake Mode), BONES-recipes-bake.md, in the Focus shell
// (no navigation, no footer). The step lives in ?step=; timers run across steps and
// survive a refresh; Step nav is pinned to the bottom on every device.

const FOR_THIS_STEP_LIMIT = 8;
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

export function BakeView({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const isClient = useSyncExternalStore(noop, mounted, () => false);
  const tabletUp = useMediaQuery(TABLET_UP);

  // ?scale= and ?step=: invalid values open the nearest valid step and correct the URL.
  const { scale, valid: scaleValid } = parseScale(params.get("scale") ?? undefined);
  const total = recipe.steps.length;
  const rawStep = params.get("step");
  const wanted = Math.round(Number(rawStep));
  const stepNumber = Number.isFinite(wanted) && rawStep !== null && rawStep.trim() !== "" ? Math.min(Math.max(wanted, 1), total) : 1;
  const step = recipe.steps[stepNumber - 1];
  const last = stepNumber === total;

  const writeUrl = useCallback(
    (n: number) => {
      const next = new URLSearchParams();
      if (scale !== 1) next.set("scale", String(scale));
      next.set("step", String(n));
      window.history.replaceState(null, "", `${pathname}?${next}`);
    },
    [pathname, scale],
  );
  useEffect(() => {
    if (String(stepNumber) !== rawStep || !scaleValid) writeUrl(stepNumber);
  }, [stepNumber, rawStep, scaleValid, writeUrl]);

  // Moving to another step moves focus to its heading, so screen readers read it.
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = false;
  }, [stepNumber]);
  function goTo(n: number) {
    if (n < 1 || n > total || n === stepNumber) return;
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

  const { timers, now, start, pause, resume, clear, clearAll, announcement } = useTimers(recipe.id);
  const { refused: screenMayLock } = useWakeLock();
  const [checks, setChecks] = useSessionSet(`backery.checks.${recipe.id}`);
  const [dismissed, setDismissed] = useSessionSet(`backery.bake.${recipe.id}`);

  // Timer alerts card: while alerts are off and it hasn't been dismissed for good; on
  // step 1 and whenever a timer starts. Notifications themselves are STUBBED.
  const [cardDismissed, setCardDismissed] = useState(false);
  const [startedHere, setStartedHere] = useState(false);
  const alertsOff = isClient && readAlertsState() !== "alerts-on";
  const cardHidden = cardDismissed || (isClient && window.localStorage.getItem(CARD_DISMISSED) === "1");
  const showAlertsCard = alertsOff && !cardHidden && (stepNumber === 1 || startedHere);
  const [sheetOpen, setSheetOpen] = useState(false);
  const setUp = useRef<HTMLButtonElement>(null);

  const estimates = recipe.ingredients.some((i) => i.status === "estimated");
  const showEstimates = estimates && stepNumber === 1 && isClient && !dismissed.has("estimates");

  const byId = useMemo(() => new Map(recipe.ingredients.map((i) => [i.id, i])), [recipe.ingredients]);
  const forThisStep = step.ingredientIds.map((id) => byId.get(id)).filter((i): i is Ingredient => Boolean(i));
  const groupName = (groupId: string | null) => recipe.stepGroups.find((g) => g.id === groupId)?.name;
  // Timer labels break only at the dots: "Step 2 · Dough · 6 min" never splits "6 min".
  const label = `Step\u00a0${stepNumber}${groupName(step.groupId) ? ` · ${groupName(step.groupId)}` : ""}`;

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

  // The pinned bottom bar (timer strip + Step nav): the page reserves its height.
  const bar = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SkipLink />
      {/* Focus header (BONES-shell Focus variant) */}
      <header>
        <div className="mx-auto flex min-h-3xl max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] items-center gap-sm px-(--gutter)">
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
            className="inline-flex min-h-touch-min shrink-0 items-center gap-xs rounded-sm type-button text-primary underline-offset-3 hover:underline focus-visible:underline focus-visible:outline-offset-2"
          >
            <ChevronLeft aria-hidden="true" className="size-icon-sm" strokeWidth={2.4} />
            Exit
          </Link>
          <p className="min-w-0 flex-1 truncate text-center type-body-md font-bold text-ink">{recipe.title}</p>
          <p className="shrink-0 type-body-sm text-muted tabular-nums">
            {scale !== 1 && (
              <>
                <span className="text-ink">{formatScale(scale)}</span> <span aria-hidden="true">·</span>{" "}
              </>
            )}
            <span className="tablet:hidden" aria-hidden="true">
              {stepNumber}/{total}
            </span>
            <span className="max-tablet:sr-only">
              Step {stepNumber} of {total}
            </span>
          </p>
        </div>
      </header>

      <main id="main" tabIndex={-1} style={{ paddingBottom: barHeight }} className="mx-auto max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] px-(--gutter) pt-lg outline-none tablet:pt-xl">
        <div className="tablet:grid tablet:grid-cols-8 tablet:items-start tablet:gap-x-(--gutter) desktop:grid-cols-12">
          {/* Current Step */}
          <section aria-labelledby="step-heading" onPointerDown={onPointerDown} onPointerUp={onPointerUp} className="tablet:col-span-5 desktop:col-span-8">
            <div className="flex flex-col gap-sm empty:hidden">
              {showEstimates && (
                <Notice
                  tone="warning"
                  action={
                    <Button variant="text" onClick={() => setDismissed(new Set([...dismissed, "estimates"]))} className="-my-md -ml-sm">
                      Dismiss
                    </Button>
                  }
                >
                  Some amounts are estimates.
                </Notice>
              )}
              {showAlertsCard && (
                <Notice
                  tone="info"
                  action={
                    <span className="-my-md flex">
                      <Button ref={setUp} variant="text" aria-haspopup="dialog" onClick={() => setSheetOpen(true)} className="-ml-sm">
                        Set up
                      </Button>
                      <Button
                        variant="text"
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
              {screenMayLock && <Notice tone="info">Your screen may lock. Timers still run when you come back.</Notice>}
            </div>

            <div className={cx((showEstimates || showAlertsCard || screenMayLock) && "mt-lg")}>
              {groupName(step.groupId) && <p className="type-label text-primary">{groupName(step.groupId)}</p>}
              <h1 ref={heading} id="step-heading" tabIndex={-1} className="mt-xs type-amount-lg font-bold text-primary outline-none">
                Step {stepNumber}
              </h1>
              <p className="mt-sm type-step-text text-ink tablet:text-[28px]">
                {splitStepText(step.text, step.timeMarks).map((part, i) =>
                  part.kind === "time" ? (
                    <span key={i} className="font-bold whitespace-nowrap text-primary underline decoration-dotted decoration-2 underline-offset-4">
                      {part.text}
                    </span>
                  ) : (
                    part.text
                  ),
                )}
              </p>

              {forThisStep.length > 0 && (
                <div className="mt-lg">
                  <p className="type-label text-muted">For this step</p>
                  <ul role="list" className="mt-xs">
                    {forThisStep.slice(0, FOR_THIS_STEP_LIMIT).map((i) => (
                      <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-base border-b border-hairline py-md">
                        <span className="type-body-lg text-ink">{i.name}</span>
                        <Grams ingredient={i} scale={scale} large />
                      </li>
                    ))}
                  </ul>
                  {forThisStep.length > FOR_THIS_STEP_LIMIT && (
                    <Button
                      variant="text"
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

              {step.timeMarks.length > 0 && (
                <div className="mt-lg flex flex-col gap-sm tablet:flex-row tablet:flex-wrap">
                  {step.timeMarks.map((mark, i) => {
                    const source = `${step.id}:${i}`;
                    const running = timers.some((t) => t.source === source && !t.finishedAt);
                    return (
                      <Button
                        key={source}
                        variant="secondary"
                        disabled={running}
                        onClick={() => {
                          // Several times in one step: the duration tells their timers apart.
                          start(source, step.timeMarks.length > 1 ? `${label} · ${formatTimeChip(mark.minutes).replace(/ /g, "\u00a0")}` : label, mark.minutes);
                          setStartedHere(true);
                        }}
                        className="w-full tablet:w-auto"
                      >
                        <TimerIcon aria-hidden="true" />
                        {running ? `${formatTimeChip(mark.minutes)} timer running` : `Start ${formatTimeChip(mark.minutes)} timer`}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Right column from tablet up: Timers above All ingredients */}
          <div className="mt-xl flex flex-col gap-xl tablet:col-span-3 tablet:mt-0 desktop:col-span-4">
            <div className="max-tablet:hidden empty:hidden">
              <TimersPanel timers={timers} now={now} onPause={pause} onResume={resume} onClear={clear} />
            </div>
            <section aria-labelledby="all-heading">
              {tabletUp ? (
                <h2 id="all-heading" ref={allHeading as React.RefObject<HTMLHeadingElement>} tabIndex={-1} className="flex items-center gap-sm type-heading text-ink outline-none">
                  <TileMark />
                  All ingredients
                </h2>
              ) : (
                <h2 id="all-heading" className="type-heading text-ink">
                  <button
                    ref={allHeading as React.RefObject<HTMLButtonElement>}
                    type="button"
                    aria-expanded={allOpen}
                    aria-controls="all-ingredients"
                    onClick={() => setAllOpenChoice(!allOpen)}
                    className="flex min-h-touch-min w-full items-center gap-sm rounded-sm text-left focus-visible:outline-offset-2"
                  >
                    <TileMark />
                    All ingredients ({recipe.ingredients.length})
                    <ChevronDown aria-hidden="true" className={cx("ml-auto size-icon text-primary transition-transform duration-(--motion-base) ease-skin", allOpen && "rotate-180")} />
                  </button>
                </h2>
              )}
              {allOpen && (
                <div id="all-ingredients">
                  {groupItems(recipe.ingredientGroups, recipe.ingredients).map(({ group, items }) => (
                    <div key={group?.id ?? "all"}>
                      {group && <GroupHeading>{group.name}</GroupHeading>}
                      <ul role="list" className={group ? undefined : "mt-sm"}>
                        {items.map((i) => {
                          const done = checks.has(i.id);
                          return (
                            <li key={i.id} className="border-b border-hairline">
                              <Checkbox
                                checked={done}
                                onChange={(on) => {
                                  const next = new Set(checks);
                                  if (on) next.add(i.id);
                                  else next.delete(i.id);
                                  setChecks(next);
                                }}
                              >
                                <span className="flex items-baseline justify-between gap-base">
                                  <span className={cx(done && "text-muted line-through decoration-1")}>{i.name}</span>
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

      {/* Pinned bottom: the mobile timer strip, then Step nav (primary action) */}
      <div ref={bar} className="fixed inset-x-0 bottom-0 z-20 bg-canvas shadow-bar">
        <div className="tablet:hidden">
          <TimerStrip timers={timers} now={now} onPause={pause} onResume={resume} onClear={clear} />
        </div>
        <nav aria-label="Steps" className="mx-auto grid max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] grid-cols-3 gap-sm px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))]">
          {stepNumber > 1 && (
            <Button variant="secondary" onClick={() => goTo(stepNumber - 1)} className="min-h-touch-bake!">
              Previous
            </Button>
          )}
          {last ? (
            <Button
              variant="primary"
              onClick={() => {
                endBake();
                router.push(`/recipes/${recipe.id}/log?new=1&scale=${scale}`);
              }}
              className={cx("min-h-touch-bake!", stepNumber > 1 ? "col-span-2" : "col-span-3")}
            >
              Finish
            </Button>
          ) : (
            <Button variant="primary" onClick={() => goTo(stepNumber + 1)} className={cx("min-h-touch-bake!", stepNumber > 1 ? "col-span-2" : "col-span-3")}>
              Next step
            </Button>
          )}
        </nav>
      </div>

      <TimerBanner timers={timers} onDismiss={clear} />
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <TimerAlertsSheet open={sheetOpen} onClose={() => setSheetOpen(false)} returnFocus={setUp} />
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

function Grams({ ingredient, scale, large = false }: { ingredient: Ingredient; scale: number; large?: boolean }): ReactNode {
  if (ingredient.grams === null) return <span className="text-right type-body-md text-muted">to taste</span>;
  return (
    <span className="text-right whitespace-nowrap">
      <span className={cx(large ? "type-amount-lg" : "type-amount", "text-ink")}>{formatGrams(ingredient.grams * scale)}</span>
      <span className="ml-[3px] type-body-md text-muted">g</span>
    </span>
  );
}
