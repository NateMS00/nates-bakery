import { cx } from "./cx";

/**
 * SKIN azulejo-fill: the motif as a full field, no frame, cobalt on cobalt wash at
 * a 56px repeat — the recipe-picture's own missing/broken-photo fallback (built
 * into Picture, for a fixed-aspect frame) drawn here instead at whatever size the
 * caller gives it: split-hero's backdrop, and the Hero when a recipe has no cover
 * at all. Always decorative.
 */
export function AzulejoFill({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cx("bg-primary-wash text-primary", className)}>
      <div className="size-full azulejo-mask" />
    </div>
  );
}
