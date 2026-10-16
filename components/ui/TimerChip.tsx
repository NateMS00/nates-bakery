import { Play } from "lucide-react";

/**
 * SKIN timer-chip: a detected time inside Bake Mode's step text ("rest for ▶ 10
 * min") — an inline outlined button with a play icon, never wrapping across
 * lines. Tapping starts the timer; it then becomes a live, non-interactive
 * status ("Running · 9:42") in the same place — never a disabled control, so it
 * never looks broken.
 */
export function TimerChip({ label, running, remaining, onStart }: { label: string; running: boolean; remaining?: string; onStart?: () => void }) {
  if (running) {
    return (
      <span className="inline-flex min-h-[36px] items-center whitespace-nowrap rounded-md border-[1.5px] border-primary bg-primary px-sm type-button text-on-primary">
        Running · {remaining}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onStart}
      className="relative inline-flex min-h-[36px] items-center gap-xs whitespace-nowrap rounded-md border-[1.5px] border-primary px-sm type-button text-primary transition-colors duration-(--motion-fast) ease-skin before:absolute before:-inset-y-[6px] before:content-[''] hover:bg-primary-wash active:bg-primary active:text-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      <Play aria-hidden="true" className="size-icon-sm" strokeWidth={1.8} fill="currentColor" />
      {label}
    </button>
  );
}
