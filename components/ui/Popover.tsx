"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cx } from "./cx";

// An anchored panel for desktop (a menu, the Ingredients used picker, the group
// picker): positioned under its trigger inside a `relative` wrapper. Focus moves in
// on open; Esc, a tap outside, or focus leaving closes it; focus returns to the
// trigger. SKIN menu surface: glazed card, hairline edge, elevation float.

export function Popover({
  open,
  onClose,
  anchor,
  children,
  className,
  role = "dialog",
  label,
  labelledBy,
  align = "start",
}: {
  open: boolean;
  onClose: (returnFocus: boolean) => void;
  anchor: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
  role?: "dialog" | "menu";
  label?: string;
  labelledBy?: string;
  align?: "start" | "end";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = ref.current;
    panel?.scrollIntoView({ block: "nearest" }); // a tall panel near the bottom stays fully visible
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>("button, input, [href], [tabindex='0']"))?.focus();
    function onPointerDown(e: PointerEvent) {
      if (!panel?.contains(e.target as Node) && !anchor.current?.contains(e.target as Node)) onClose(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, anchor, onClose]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      role={role}
      aria-label={label}
      aria-labelledby={labelledBy}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          onClose(true);
          anchor.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node) && e.relatedTarget !== anchor.current && e.relatedTarget) onClose(false);
      }}
      className={cx(
        "absolute top-full z-30 mt-xs rounded-lg border border-hairline bg-surface-card text-ink shadow-float",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
