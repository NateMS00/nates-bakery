"use client";

import { Heart } from "lucide-react";
import { IconButton } from "./IconButton";
import { cx } from "./cx";

/** SKIN favorite-toggle: outline ink heart when off, filled cobalt when on. */
export function FavoriteToggle({ pressed, onChange }: { pressed: boolean; onChange: (next: boolean) => void }) {
  return (
    <IconButton label="Favorite" aria-pressed={pressed} onClick={() => onChange(!pressed)} className={cx(pressed && "text-primary")}>
      <Heart aria-hidden="true" fill={pressed ? "currentColor" : "none"} strokeWidth={1.8} />
    </IconButton>
  );
}
