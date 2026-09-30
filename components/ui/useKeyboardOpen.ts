"use client";

import { useSyncExternalStore } from "react";

// True while the on-screen keyboard is open on a phone: the visual viewport shrinks
// well below the layout viewport. BONES: the mobile Save bar hides meanwhile.
export function useKeyboardOpen(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const vv = window.visualViewport;
      vv?.addEventListener("resize", onChange);
      return () => vv?.removeEventListener("resize", onChange);
    },
    () => (window.visualViewport ? window.innerHeight - window.visualViewport.height > 150 : false),
    () => false,
  );
}
