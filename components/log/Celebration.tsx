"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { focusFor } from "@/components/system/InputModality";
import type { FocusTarget } from "@/components/ui/Dialog";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { StarGlyph } from "@/components/ui/Star";
import { TilePanel } from "@/components/ui/Tile";
import type { Milestone } from "@/lib/data/bakeLog";
import { formatBakeDate, todayIso } from "@/lib/format";

function titleFor(milestone: Milestone): { lead: string; accent: string } {
  switch (milestone.kind) {
    case "first":
      return { lead: "First bake,", accent: "in the book." };
    case "best":
      return { lead: "Your best", accent: "one yet." };
    case "nth":
      return { lead: `Bake no. ${milestone.n}`, accent: "in the book." };
  }
}

/**
 * SKIN celebration: the whole screen, deep cobalt in both themes, for a
 * milestone save (BONES-recipes-log.md). Built on the same native-<dialog>
 * mechanics as Dialog.tsx (showModal, Esc via onCancel, backdrop click), but its
 * own much simpler full-bleed layout — no title bar, no close X; Done, Esc, or a
 * tap outside the content closes it. Reduced motion drops the fade-in through
 * the same global rule as every other animation (globals.css), so there's
 * nothing extra to branch on here.
 */
export function Celebration({
  open,
  milestone,
  recipeTitle,
  rating,
  date,
  onClose,
  returnFocus,
}: {
  open: boolean;
  milestone: Milestone | null;
  recipeTitle: string;
  rating: number | null;
  date: string;
  onClose: () => void;
  returnFocus?: FocusTarget;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  // Content renders only in the browser, same reason as Dialog.tsx: a closed
  // <dialog> shows nothing server-side, and "today" can't mismatch on hydration.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !hydrated) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      focusFor(titleRef.current);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, hydrated]);

  function handleClose() {
    const target = (typeof returnFocus === "function" ? returnFocus() : returnFocus?.current) ?? opener.current;
    if (target?.isConnected) focusFor(target);
    if (open) onClose();
  }

  const { lead, accent } = milestone ? titleFor(milestone) : { lead: "", accent: "" };
  const dateLabel = date === todayIso() ? "today" : formatBakeDate(date);

  return (
    <dialog
      ref={ref}
      aria-label={milestone ? `${lead} ${accent}` : undefined}
      onClose={handleClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-celebration text-on-celebration open:flex open:flex-col open:items-center open:justify-center animate-[fade-in_var(--motion-celebrate)_var(--ease-skin)] backdrop:bg-celebration"
    >
      {open && hydrated && milestone && (
        <div className="flex max-w-[calc(var(--col)*4+var(--gutter)*3)] flex-col items-center gap-base px-base text-center">
          {/* "a tile panel until it exists" (BONES-recipes-log.md) — Nathan's own celebration
              illustration, not yet supplied; its porcelain coloring is a known mismatch
              against this cobalt screen until then, per that same placeholder note. */}
          <TilePanel aspectRatio="1 / 1" className="w-[160px]" />
          <DisplayTitle ref={titleRef} tabIndex={-1} lead={lead} accent={accent} className="mt-base text-on-celebration" />
          <p className="type-body-md">
            {recipeTitle}
            {rating !== null && (
              <>
                {" "}
                <span aria-hidden="true">·</span>{" "}
                <span className="inline-flex items-center gap-[1px] align-middle">
                  <span className="sr-only">Rated {rating} out of 5</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <StarGlyph key={n} filled={n <= rating} tone="celebration" className="size-[15px]" />
                  ))}
                </span>
              </>
            )}{" "}
            <span aria-hidden="true">·</span> {dateLabel}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-base inline-flex min-h-touch-min items-center justify-center rounded-full bg-on-celebration px-lg type-button text-celebration enabled:hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring"
          >
            Done
          </button>
        </div>
      )}
    </dialog>
  );
}
