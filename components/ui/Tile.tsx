import { cx } from "./cx";

// The azulejo motif (SKIN Layout). Always decorative, never behind text.

/** tile-mark: one 18px tile before every H2. */
export function TileMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cx("inline-block size-tile-mark shrink-0 text-primary tile-mask", className)} />;
}

/** tile-band: a 24px strip between two 1px cobalt rules, full window width. */
export function TileBand({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cx("box-content h-tile-band border-y border-primary bg-canvas text-primary", className)}>
      <div className="size-full tile-band-mask" />
    </div>
  );
}

/**
 * tile-panel: a bordered field of the motif for illustration slots (empty states,
 * 3:2 by default) — pass `aspectRatio` to match the frame it sits in instead of the
 * default. A missing or absent picture (SKIN recipe-picture) is `azulejo-fill`
 * instead, unbordered at its own 56px repeat — Picture's own built-in error state.
 */
export function TilePanel({ className, aspectRatio = "3 / 2" }: { className?: string; aspectRatio?: string }) {
  return (
    <div aria-hidden="true" style={{ aspectRatio }} className={cx("rounded-lg border border-primary bg-primary-wash text-primary", className)}>
      <div className="size-full rounded-lg tile-panel-mask" />
    </div>
  );
}
