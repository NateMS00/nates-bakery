"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { cx } from "@/components/ui/cx";
import { signOut } from "@/lib/auth/actions";
import { TimerAlertsSheet } from "./TimerAlertsSheet";

// BONES-shell 1.7.0: a small dropdown anchored to the account button on every
// device, with Bakes (phones only — tablet and up has it in the header already),
// Timer alerts, Sign out, and Privacy in that order. Dismissed by choosing an
// item, Esc, or tapping outside. SKIN menu + menu-item.

const itemClass =
  "flex min-h-touch-min w-full items-center px-base text-left type-body-md text-ink hover:bg-surface-sunken active:bg-primary-wash active:text-primary focus-visible:outline-offset-[-3px]";

/** Bakes is `tablet:hidden` (present in the DOM, not at that breakpoint) — excluded here so focus never lands on a menu item that CSS has hidden. */
function visibleItems(menu: HTMLDivElement | null): HTMLElement[] {
  return Array.from(menu?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []).filter((el) => el.offsetParent !== null);
}

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    visibleItems(menu.current)[0]?.focus();
    function onPointerDown(e: PointerEvent) {
      if (!menu.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    const items = visibleItems(menu.current);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (index + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      items[e.key === "Home" ? 0 : items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      close(false);
    }
  }

  return (
    <div className="relative">
      <IconButton
        ref={button}
        label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? "account-menu" : undefined}
        onClick={() => setOpen((v) => !v)}
        className={open ? "bg-primary-wash text-primary" : undefined}
      >
        <User aria-hidden="true" strokeWidth={1.8} />
      </IconButton>
      {open && (
        <div
          ref={menu}
          id="account-menu"
          role="menu"
          aria-label="Account"
          onKeyDown={onKeyDown}
          className="absolute top-full right-0 z-30 mt-xs min-w-[200px] rounded-lg border border-hairline bg-surface-card py-xs shadow-float"
        >
          <Link href="/bakes" role="menuitem" className={cx(itemClass, "tablet:hidden")} onClick={() => setOpen(false)}>
            Bakes
          </Link>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              setAlertsOpen(true);
            }}
          >
            Timer alerts
          </button>
          <form action={signOut}>
            <button type="submit" role="menuitem" className={itemClass}>
              Sign out
            </button>
          </form>
          <Link href="/privacy" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            Privacy
          </Link>
        </div>
      )}
      <TimerAlertsSheet open={alertsOpen} onClose={() => setAlertsOpen(false)} returnFocus={button} />
    </div>
  );
}
