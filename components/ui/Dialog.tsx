"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject, type PointerEvent } from "react";
import { TileBand } from "./Tile";
import { cx } from "./cx";

// SKIN sheet (mobile) and modal (tablet and up), on a native <dialog>:
// showModal() makes the page inert (focus stays inside) and Esc closes it.
// Also closes on backdrop tap and, on mobile, a swipe down. Focus returns to
// whatever opened it.

const heights = {
  third: "min-h-[33dvh]",
  half: "min-h-[50dvh]",
  "two-thirds": "min-h-[66dvh]",
};

const widths = {
  4: "tablet:w-[calc(var(--col)*4+var(--gutter)*3)]",
  5: "tablet:w-[calc(var(--col)*5+var(--gutter)*4)]",
};

export function Dialog({
  open,
  onClose,
  title,
  titleClassName,
  sheetHeight,
  modalColumns,
  initialFocus,
  returnFocus,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  titleClassName?: string;
  sheetHeight: keyof typeof heights;
  modalColumns: keyof typeof widths;
  initialFocus?: RefObject<HTMLElement | null>;
  /** Where focus goes on close; defaults to the element focused when it opened. */
  returnFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      (initialFocus?.current ?? dialog.querySelector<HTMLElement>("[data-autofocus]"))?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  function handleClose() {
    document.documentElement.style.overflow = "";
    if (ref.current) ref.current.style.transform = "";
    const target = returnFocus?.current ?? opener.current;
    if (target?.isConnected) target.focus();
    if (open) onClose();
  }

  function onPointerDown(e: PointerEvent) {
    if (window.matchMedia("(min-width: 768px)").matches) return;
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
        "fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90dvh] w-full max-w-full overflow-y-auto rounded-t-lg bg-surface-card text-ink shadow-float backdrop:bg-scrim",
        "animate-[sheet-up_var(--motion-sheet)_var(--ease-skin)] backdrop:animate-[fade-in_var(--motion-sheet)_var(--ease-skin)]",
        "tablet:inset-0 tablet:m-auto tablet:h-fit tablet:min-h-0 tablet:rounded-lg tablet:animate-[modal-in_var(--motion-sheet)_var(--ease-skin)]",
        heights[sheetHeight],
        widths[modalColumns],
      )}
    >
      {open && (
        <div className="flex min-h-[inherit] flex-col">
          <div
            className="touch-none tablet:hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <TileBand />
            <div aria-hidden="true" className="mx-auto mt-sm h-xs w-2xl rounded-full bg-border" />
          </div>
          <div className="flex flex-1 flex-col px-base pt-base pb-[calc(var(--spacing-lg)+env(safe-area-inset-bottom))] tablet:p-xl">
            <h2 id={titleId} className={cx("type-heading text-ink", titleClassName)}>
              {title}
            </h2>
            {children}
          </div>
        </div>
      )}
    </dialog>
  );
}
