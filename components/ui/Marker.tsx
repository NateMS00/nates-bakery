"use client";

// SKIN markers: always text plus glyph, never colour alone.

const markerBase = "inline-flex items-center gap-xs rounded-sm px-sm py-xs type-label";

export function EstimatedMarker() {
  return (
    <span className={`${markerBase} bg-warning-wash text-warning`}>
      <span aria-hidden="true">~</span> Estimated
    </span>
  );
}

/** On the Recipe page it is a button that reveals the original amount. ::before extends the hit area to 48px. */
export function ConvertedMarker({ expanded, onToggle, controls }: { expanded: boolean; onToggle: () => void; controls: string }) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className={`${markerBase} relative bg-info-wash text-primary before:absolute before:inset-x-0 before:-inset-y-md before:content-[''] hover:underline active:bg-primary active:text-on-primary focus-visible:outline-offset-2 disabled:bg-surface-disabled disabled:text-disabled`}
    >
      <span aria-hidden="true">=</span> Converted
    </button>
  );
}
