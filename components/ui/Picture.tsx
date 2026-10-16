"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "./cx";

/**
 * SKIN recipe-picture: the frame each tile asks for — 4:5 in recipe-tile, 4:3 in
 * cover-picture, 1:1 in bake-tile. Its own edge comes from the component around
 * it (the tile's ink frame, or its own 1px ink outline at rounded.tile when it
 * stands alone), so this component itself stays unbordered; `rounded` just
 * picks the corner radius for a frame with no outer card to clip it, and "none"
 * leaves it square for a frame already clipped by an outer card's own rounding
 * (recipe-tile, bake-tile). Cropped from a focal point (centre by default;
 * focal-point choice is a later round). While it loads, the frame is plain
 * surface-sunken; with no src, or a failed load, SKIN `azulejo-fill` takes the
 * frame edge to edge (cobalt on cobalt wash, no border — unlike `tile-panel`,
 * its empty-state cousin), so a recipe without a photo still looks deliberate
 * rather than broken. Decorative: empty alt text, since the title beside or
 * with it already names the recipe.
 */

type Status = "loading" | "loaded" | "error";

const ROUNDED = { none: "rounded-none", md: "rounded-md", lg: "rounded-lg" } as const;

export function Picture({
  src,
  aspectRatio,
  rounded = "lg",
  className,
  children,
}: {
  src: string | null;
  aspectRatio: string;
  /** rounded.lg (the default, a frame with no outer card), rounded.md (source-card's
   * 64px reel frame), or "none" when an outer card already clips the corners (recipe-
   * tile, bake-tile). An explicit prop, not left to className, since two conflicting
   * rounded-* classes don't have a reliable winner. */
  rounded?: keyof typeof ROUNDED;
  className?: string;
  /** Overlays (a picture-chip's corner date, picture-button controls), absolutely positioned by the caller. */
  children?: React.ReactNode;
}) {
  const [state, setState] = useState<{ src: string | null; status: Status }>({ src, status: src ? "loading" : "error" });
  // A different recipe (or bake) can reuse this component for a new src; reset
  // during render rather than in an effect, to avoid an extra render pass.
  if (state.src !== src) setState({ src, status: src ? "loading" : "error" });
  const status = state.status;

  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A cached image can finish loading (or fail) before onLoad/onError attach.
    const el = img.current;
    if (!el || !el.complete) return;
    setState((s) => (s.src === src ? { src, status: el.naturalWidth > 0 ? "loaded" : "error" } : s));
  }, [src]);

  return (
    <div data-testid="picture" data-status={status} style={{ aspectRatio }} className={cx("relative shrink-0 overflow-hidden bg-surface-sunken", ROUNDED[rounded], className)}>
      {src && status !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element -- a decorative local asset or signed Storage URL with its own placeholder-while-loading state.
        <img
          ref={img}
          src={src}
          alt=""
          loading="lazy"
          onLoad={() => setState({ src, status: "loaded" })}
          onError={() => setState({ src, status: "error" })}
          className={cx("size-full object-cover object-center", status !== "loaded" && "opacity-0")}
        />
      )}
      {status === "error" && (
        <div aria-hidden="true" className="absolute inset-0 bg-primary-wash text-primary">
          <div className="size-full tile-panel-mask" />
        </div>
      )}
      {children}
    </div>
  );
}
