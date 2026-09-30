"use client";

import { useSyncExternalStore } from "react";

/** Matches a media query on the client; false on the server (mobile first). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const TABLET_UP = "(min-width: 768px)";
