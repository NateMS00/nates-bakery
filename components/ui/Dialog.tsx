"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode, type RefObject, type PointerEvent } from "react";
import { IconButton } from "./IconButton";
import { TileBand } from "./Tile";
import { cx } from "./cx";

// SKIN sheet (mobile) and modal (tablet and up), on a native <dialog>:
// showModal() makes the page inert (focus stays inside) and Esc closes it.
// BONES-shell Overlay sizing: fits its content up to 90% of the viewport, then the
// body scrolls; a header row holds the title and a close X. The exceptions in
// BONES-shell (a scrolling list with a pinned footer) pass `sheetHeight` and `footer`.
// Also closes on backdrop tap and, on mobile, a swipe down. Focus returns to
// whatever opened it.

/** Where focus goes on close: an element ref, or a function that finds it at that moment. */
export type FocusTarget = RefObject<HTMLElement | null> | (() => HTMLElement | null);

const widths = {
  4: "tablet:w-[calc(var(--col)*4+var(--gutter)*3)]",
  5: "tablet:w-[calc(var(--col)*5+var(--gutter)*4)]",
  6: "tablet:w-[calc(var(--col)*6+var(--gutter)*5)]",
};

export function Dialog({
  open,
  onClose,
  title,
  modalColumns,
  sheetHeight,
  footer,
  initialFocus,
  returnFocus,
  onAfterClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  modalColumns: keyof typeof widths;
  /**
   * Fixed mobile height, only for BONES-shell's exceptions: "three-quarters" for a list
   * with a pinned footer, "full" for a full-screen form (Bake Log's entry form).
   */
  sheetHeight?: "three-quarters" | "full";
  /** Pinned to the bottom of the sheet, outside the scrolling body. */
  footer?: ReactNode;
  initialFocus?: RefObject<HTMLElement | null>;
  /** Where focus goes on close; defaults to the element focused when it opened. */
  returnFocus?: FocusTarget;
  /** Runs once the dialog has fully closed and focus has returned (to chain another overlay). */
  onAfterClose?: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);
  const titleId = useId();
  // Content renders only in the browser: a closed <dialog> shows nothing on the server,
  // and client-only values (today's local date in a form) can't mismatch on hydration.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const dialog = ref.current;
    // Wait for the content (see `hydrated`), so focus can land inside.
    if (!dialog || !hydrated) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      (initialFocus?.current ?? dialog.querySelector<HTMLElement>("[data-autofocus]"))?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus, hydrated]);

  // When the keyboard opens (or a field takes focus), keep the focused field in view
  // inside the sheet's scrolling body, above the pinned footer.
  useEffect(() => {
    const dialog = ref.current;
    const vv = window.visualViewport;
    if (!open || !dialog) return;
    const reveal = () =>
      requestAnimationFrame(() => {
        const field = document.activeElement;
        if (field instanceof HTMLElement && dialog.contains(field) && field.matches("input, textarea, select")) {
          field.scrollIntoView({ block: "nearest" });
        }
      });
    dialog.addEventListener("focusin", reveal);
    vv?.addEventListener("resize", reveal);
    return () => {
      dialog.removeEventListener("focusin", reveal);
      vv?.removeEventListener("resize", reveal);
    };
  }, [open]);

  function handleClose() {
    document.documentElement.style.overflow = "";
    if (ref.current) ref.current.style.transform = "";
    const target = (typeof returnFocus === "function" ? returnFocus() : returnFocus?.current) ?? opener.current;
    if (target?.isConnected) target.focus();
    if (open) onClose();
    onAfterClose?.();
  }

  function onPointerDown(e: PointerEvent) {
    if (sheetHeight === "full" || window.matchMedia("(min-width: 768px)").matches) return;
    drag.current = { startY: e.clientY, dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent) {
    if (!drag.current || !ref.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.startY);
    ref.current.style.transform = `translateY(${drag.current.dy}px)`;
  }
  function onPointerUp() {
    if (!drag.current || !ref.current) return;
    const { dy } = drag.current;
    drag.current = null;
    if (dy > 80) onClose();
    else ref.current.style.transform = "";
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={handleClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cx(
        // Mobile: pinned to the bottom of the visible area (see `pin-bottom` in globals.css),
        // at most 90% of it. Tablet up: a centered modal, at most 90% of the dynamic viewport.
        "fixed m-0 h-fit w-full max-w-full overflow-hidden rounded-t-lg bg-surface-card text-ink shadow-float backdrop:bg-scrim open:flex open:flex-col",
        "max-tablet:pin-bottom tablet:max-h-[90dvh]",
        sheetHeight !== "full" && "max-tablet:max-h-[calc(var(--vv-height)*0.9)]",
        "animate-[sheet-up_var(--motion-sheet)_var(--ease-skin)] backdrop:animate-[fade-in_var(--motion-sheet)_var(--ease-skin)]",
        "tablet:inset-0 tablet:m-auto tablet:rounded-lg tablet:animate-[modal-in_var(--motion-sheet)_var(--ease-skin)]",
        widths[modalColumns],
        sheetHeight === "three-quarters" && "max-tablet:h-[calc(var(--vv-height)*0.75)]",
        // The whole visible area: above the keyboard while it's open, so Save and Cancel sit just over it.
        sheetHeight === "full" && "max-tablet:h-(--vv-height) max-tablet:max-h-(--vv-height) max-tablet:rounded-none",
      )}
    >
      {open && hydrated && (
        <>
          <div
            className="shrink-0 touch-none tablet:hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <TileBand />
            {/* A full-screen form has no grab handle: it closes through Cancel or the X. */}
            {sheetHeight !== "full" && <div aria-hidden="true" className="mx-auto mt-sm h-xs w-2xl rounded-full bg-border" />}
          </div>
          <div className="flex shrink-0 items-start gap-sm pt-sm pr-sm pl-base tablet:pt-lg tablet:pr-lg tablet:pl-xl">
            <h2 id={titleId} className="flex-1 pt-sm type-heading text-ink">
              {title}
            </h2>
            <IconButton label="Close" onClick={onClose}>
              <X aria-hidden="true" strokeWidth={1.8} />
            </IconButton>
          </div>
          <div
            className={cx(
              "min-h-0 flex-1 overflow-y-auto px-base tablet:px-xl",
              footer ? "pb-base" : "pb-[calc(var(--spacing-lg)+env(safe-area-inset-bottom))] tablet:pb-xl",
            )}
          >
            {children}
          </div>
          {footer && (
            <div className="shrink-0 border-t border-hairline px-base pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] tablet:px-xl tablet:pb-lg">
              {footer}
            </div>
          )}
        </>
      )}
    </dialog>
  );
}
