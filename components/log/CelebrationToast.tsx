"use client";

import { useEffect } from "react";
import { cx } from "@/components/ui/cx";
import { tallHitArea } from "@/components/ui/TextLink";

/**
 * SKIN celebration-toast: "Bake saved · Undo", cobalt, 6 seconds, announced
 * politely (BONES-recipes-log.md, "after save: everyday"). Fixed to the bottom,
 * above the Log a bake action bar on mobile (clearing the same reserved height
 * globals.css gives it) — on desktop, where Log a bake lives in the page header
 * instead, it just sits near the bottom of the viewport.
 */
export function CelebrationToast({ open, onUndo, onDismiss, className }: { open: boolean; onUndo: () => void; onDismiss: () => void; className?: string }) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(t);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      role="status"
      className={cx(
        "fixed inset-x-0 z-20 mx-auto flex w-fit items-center gap-x-sm rounded-full bg-celebration px-base py-sm type-body-sm text-on-celebration shadow-float animate-[fade-in_var(--motion-base)_var(--ease-skin)]",
        "bottom-[calc(var(--spacing-touch-min)+2*var(--spacing-md)+env(safe-area-inset-bottom)+var(--spacing-sm))] desktop:bottom-lg",
        className,
      )}
    >
      <span>Bake saved</span>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={onUndo}
        className={cx(
          "rounded-sm type-body-sm font-bold text-on-celebration underline underline-offset-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          tallHitArea,
        )}
      >
        Undo
      </button>
    </div>
  );
}
