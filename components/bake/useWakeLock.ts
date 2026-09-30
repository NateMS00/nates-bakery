"use client";

import { useEffect, useState } from "react";

// SKELETON: the screen stays awake while Bake Mode is open. Re-requested when the page
// comes back into view (browsers release the lock when it's hidden). If the device
// refuses or can't, `refused` shows BONES's one-line notice.

type Sentinel = { release: () => Promise<void>; addEventListener?: (type: "release", fn: () => void) => void };
type WakeLockApi = { request: (type: "screen") => Promise<Sentinel> };

export function useWakeLock(): { refused: boolean } {
  const [refused, setRefused] = useState(false);

  useEffect(() => {
    const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock;
    let sentinel: Sentinel | null = null;
    let cancelled = false;

    async function acquire() {
      if (!api) {
        setRefused(true);
        return;
      }
      try {
        sentinel = await api.request("screen");
        if (cancelled) void sentinel.release();
        else setRefused(false);
      } catch {
        setRefused(true);
      }
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release();
    };
  }, []);

  return { refused };
}
