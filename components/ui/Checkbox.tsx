import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

// SKIN checkbox: a 24px box with a 1.5px border edge and rounded-sm, inside a 48px
// hit area that includes its label; checked fills cobalt with an on-primary tick.

export function Checkbox({
  checked,
  onChange,
  children,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("group relative flex min-h-touch-min cursor-pointer items-center gap-md type-body-md text-ink", className)}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer absolute size-[24px] opacity-0" />
      <span
        aria-hidden="true"
        className={cx(
          "grid size-[24px] shrink-0 place-items-center rounded-sm border-[1.5px] transition-colors duration-(--motion-fast) ease-skin peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring",
          checked ? "border-primary bg-primary text-on-primary" : "border-border bg-surface-card group-hover:border-ink",
        )}
      >
        {checked && <Check className="size-icon-sm" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
