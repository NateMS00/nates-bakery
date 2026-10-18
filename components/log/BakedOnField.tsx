import { forwardRef } from "react";
import { cx } from "@/components/ui/cx";
import { formatBakeDate, todayIso } from "@/lib/format";

/**
 * SKIN input, "Baked on": a native `<input type="date">` (never display:none —
 * the same reason as ChoiceRadio's radios: a real control is what makes the
 * whole box the target, and keeps the OS's own date picker), with a styled
 * label on top showing "Today" instead of today's own date, or the formatted
 * date otherwise — the native input's own rendered text can't be overridden
 * directly, so it sits invisible under this one instead.
 */
export const BakedOnField = forwardRef<HTMLInputElement, { id: string; value: string; error?: string; onChange: (value: string) => void }>(
  function BakedOnField({ id, value, error, onChange }, ref) {
    const errorId = `${id}-error`;
    const display = !value ? "" : value === todayIso() ? "Today" : formatBakeDate(value);
    return (
      <div className="flex flex-col gap-xs">
        <label htmlFor={id} className="type-label text-muted">
          Baked on
        </label>
        <div
          className={cx(
            "relative flex min-h-control-height items-center rounded-md border border-border bg-surface-card px-base text-ink transition-colors duration-(--motion-fast) ease-skin",
            "has-[:hover]:border-ink has-[:focus-visible]:border-primary has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-focus-ring",
            error && "border-2 border-error!",
          )}
        >
          <span aria-hidden="true" className="type-body-md">
            {display}
          </span>
          <input
            suppressHydrationWarning
            ref={ref}
            type="date"
            id={id}
            max={todayIso()}
            value={value}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </div>
        {error && (
          <p id={errorId} className="type-body-sm text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
