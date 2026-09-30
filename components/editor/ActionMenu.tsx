"use client";

import { ChevronLeft, MoreVertical } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { IconButton } from "@/components/ui/IconButton";
import { Popover } from "@/components/ui/Popover";
import { cx } from "@/components/ui/cx";
import { TABLET_UP, useMediaQuery } from "@/components/ui/useMediaQuery";

// BONES Row menu: on mobile a bottom sheet listing the actions; on desktop a small
// menu anchored to the button. "Move to group" opens a second list of groups in
// place. Dismissed by choosing, Esc, or tapping outside. SKIN menu + menu-item.

export interface MenuAction {
  label: string;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  /** Opens a second list instead of acting (Move to group). */
  submenu?: { title: string; items: MenuAction[] };
}

const itemClass =
  "flex min-h-touch-min w-full items-center gap-sm px-base text-left type-body-md text-ink hover:bg-surface-sunken active:bg-primary-wash active:text-primary focus-visible:outline-offset-[-3px] disabled:cursor-not-allowed disabled:text-disabled disabled:hover:bg-transparent";

export function ActionMenu({ label, title, items }: { label: string; title: string; items: MenuAction[] }) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<MenuAction["submenu"] | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const desktop = useMediaQuery(TABLET_UP);
  const shown = sub?.items ?? items;

  function close() {
    setOpen(false);
    setSub(null);
  }

  function choose(action: MenuAction) {
    if (action.submenu) {
      setSub(action.submenu);
      return;
    }
    close();
    button.current?.focus();
    action.onSelect?.();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const els = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[role=menuitem]:not(:disabled)"));
    const i = els.indexOf(document.activeElement as HTMLElement);
    els[(i + (e.key === "ArrowDown" ? 1 : -1) + els.length) % els.length]?.focus();
  }

  const list = (
    <div onKeyDown={onKeyDown} className={desktop ? "py-xs" : "-mx-base"}>
      {sub && (
        <button type="button" role="menuitem" className={cx(itemClass, "text-primary")} onClick={() => setSub(null)}>
          <ChevronLeft aria-hidden="true" className="size-icon-sm" /> {sub.title}
        </button>
      )}
      {shown.map((action) => (
        <button
          key={action.label}
          type="button"
          role="menuitem"
          disabled={action.disabled}
          onClick={() => choose(action)}
          className={cx(itemClass, action.destructive && "text-error")}
        >
          {action.label}
          {action.submenu && <span aria-hidden="true" className="ml-auto text-muted">›</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative shrink-0">
      <IconButton ref={button} label={label} aria-haspopup={desktop ? "menu" : "dialog"} aria-expanded={open} onClick={() => (open ? close() : setOpen(true))}>
        <MoreVertical aria-hidden="true" strokeWidth={1.8} />
      </IconButton>
      {desktop ? (
        <Popover open={open} onClose={close} anchor={button} role="menu" label={title} align="end" className="min-w-[200px]">
          {list}
        </Popover>
      ) : (
        <Dialog open={open} onClose={close} title={title} modalColumns={4} returnFocus={button}>
          <div role="menu" aria-label={title}>
            {list}
          </div>
        </Dialog>
      )}
    </div>
  );
}
