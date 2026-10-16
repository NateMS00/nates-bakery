"use client";

import { useEffect, useRef, useState } from "react";
import { TilePanel } from "./Tile";
import { cx } from "./cx";

/**
 * SKIN recipe-picture (visual round): the frame each new tile asks for — 4:5 in
 * recipe-tile, 4:3 in cover-picture, 1:1 in bake-tile — rounded-lg, no border (on
 * porcelain even pale covers separate on their own), cropped from a focal point
 * (centre by default; focal-point choice is a later round). While it loads, the
 * frame is surface-sunken; with no src, or a failed load, it becomes a small
 * tile-panel instead of a bare placeholder, so a recipe without a photo still
 * looks deliberate. Decorative: empty alt text, since the title beside or with it
 * already names the recipe.
 *
 * This is the visual-round replacement for ./RecipePicture.tsx (rounded-sm,
 * hairline border, tile-mark placeholder), which stays wired into the screens that
 * haven't had their Stage C turn yet — used only by the new tile components until
 * they do.
 */

type Status = "loading" | "loaded" | "error";

const ROUNDED = { lg: "rounded-lg", md: "rounded-md" } as const;

export function Picture({
  src,
  aspectRatio,
  rounded = "lg",
  className,
  children,
}: {
  src: string | null;
  aspectRatio: string;
  /** rounded.lg (the default, every tile) or rounded.md (source-card's 64px reel frame). An explicit prop, not left to className, since two conflicting rounded-* classes don't have a reliable winner. */
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
      {status !== "loaded" && (
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <TilePanel className="h-[55%] w-[65%] max-w-[120px]" />
        </div>
      )}
      {children}
    </div>
  );
}
