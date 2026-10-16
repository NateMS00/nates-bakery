"use client";

import { useSyncExternalStore } from "react";
import { isStandalone } from "@/lib/standalone";

/**
 * false on the server and until the client subscribes (the common case, Safari) —
 * `display-mode` can't be read on the server. The shell (BONES-shell 1.7.0) reads
 * this to choose the installed tab bar or Safari's top bar. Same
 * useSyncExternalStore shape as useMediaQuery.ts, extended with the iOS Safari
 * `navigator.standalone` fallback isStandalone() already checks.
 */
export function useInstalled(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia("(display-mode: standalone)");
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    isStandalone,
    () => false,
  );
}
