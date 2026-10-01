"use client";

import { useEffect } from "react";

// The last kind of input, as html[data-input="pointer" | "keyboard"], so focus rings
// show for keyboard use only. Focus itself still moves exactly as BONES-shell asks
// (sheets, returns, new entries); after a tap or click the ring is hidden (globals.css),
// and Tab or the arrow keys bring it back. Typing in a field doesn't switch to keyboard:
// a phone's on-screen keyboard sends key events too.

const NAVIGATION_KEYS = new Set(["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", "Escape"]);

export function InputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const pointer = () => root.setAttribute("data-input", "pointer");
    const key = (e: KeyboardEvent) => {
      if (NAVIGATION_KEYS.has(e.key)) root.setAttribute("data-input", "keyboard");
    };
    window.addEventListener("pointerdown", pointer, true);
    window.addEventListener("keydown", key, true);
    return () => {
      window.removeEventListener("pointerdown", pointer, true);
      window.removeEventListener("keydown", key, true);
    };
  }, []);
  return null;
}

/**
 * Moves focus; after a tap or click it asks the browser not to draw the ring
 * (`focusVisible: false`, where supported; the CSS rule covers the rest).
 */
export function focusFor(el: HTMLElement | null | undefined) {
  if (!el) return;
  const input = document.documentElement.getAttribute("data-input");
  el.focus(input === "pointer" ? ({ focusVisible: false } as FocusOptions) : undefined);
}
