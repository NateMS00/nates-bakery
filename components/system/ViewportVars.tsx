"use client";

import { useEffect } from "react";

// The visible area as CSS variables on <html>, for everything pinned to the bottom
// (the `pin-bottom` utility, sheets, the full-screen log form). iOS Safari's toolbar and
// the on-screen keyboard cover part of the layout viewport, so `bottom: 0` or 100vh
// can sit behind them; the visual viewport is what's actually on screen.
// --vv-top / --vv-height: the visual viewport's offset and height in px.
// data-keyboard-open: the keyboard takes a big share of the screen (mobile bars hide).
export function ViewportVars() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--vv-top", `${vv.offsetTop}px`);
        root.style.setProperty("--vv-height", `${vv.height}px`);
        root.toggleAttribute("data-keyboard-open", window.innerHeight - vv.height > 150);
      });
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return null;
}
