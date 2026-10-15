"use client";

import { useEffect, useRef, useState } from "react";
import { TileMark } from "./Tile";
import { cx } from "./cx";

// SKIN recipe-picture: the reel thumbnail as a recipe's picture, 3:4 cropped from the
// center, rounded-sm, with a 1px hairline edge so a pale cover doesn't melt into the
// canvas. While it loads, and when there's none, the frame shows surface-sunken with
// one small tile-mark centered, the same in both themes. Decorative: empty alt text,
// since the title beside or with it already names the recipe.

type Status = "loading" | "loaded" | "error";

export function RecipePicture({ src, className }: { src: string | null; className: string }) {
  const [state, setState] = useState<{ src: string | null; status: Status }>({ src, status: src ? "loading" : "error" });
  // A different recipe (or a retried copy) can reuse this component for a new src;
  // reset during render rather than in an effect, to avoid an extra render pass.
  if (state.src !== src) setState({ src, status: src ? "loading" : "error" });
  const status = state.status;

  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A cached image can finish loading (or fail) before React attaches onLoad/
    // onError on mount, which would otherwise leave the placeholder showing forever.
    const el = img.current;
    if (!el || !el.complete) return;
    setState((s) => (s.src === src ? { src, status: el.naturalWidth > 0 ? "loaded" : "error" } : s));
  }, [src]);

  return (
    <div data-testid="recipe-picture" data-status={status} className={cx("relative shrink-0 overflow-hidden rounded-sm border border-hairline bg-surface-sunken", className)}>
      {src && status !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element -- a decorative local SVG/photo with its own placeholder-while-loading state; next/image's optimizer doesn't handle SVG without extra config this doesn't need yet.
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
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center text-border">
          <TileMark />
        </div>
      )}
    </div>
  );
}
