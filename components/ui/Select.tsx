import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

// SKIN select: like input, with a cobalt chevron at the end; visible label above.

export function Select({
  id,
  label,
  className,
  wrapperClassName,
  error,
  children,
  ...props
}: ComponentProps<"select"> & { id: string; label: ReactNode; wrapperClassName?: string; error?: string }) {
  const errorId = `${id}-error`;
  return (
    <div className={cx("flex flex-col gap-xs", wrapperClassName)}>
      <label htmlFor={id} className="type-label text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cx(
            "min-h-control-height w-full appearance-none rounded-md border border-border bg-surface-card pr-2xl pl-base type-body-md text-ink transition-colors duration-(--motion-fast) ease-skin hover:border-ink focus-visible:border-primary focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface-disabled disabled:text-disabled",
            error && "border-2 border-error hover:border-error",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-md size-icon-sm -translate-y-1/2 text-primary" strokeWidth={2.2} />
      </div>
      {error && (
        <p id={errorId} className="type-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
