import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";

// SKIN input (and amount-input when `amount`): visible label above, 48px tall,
// border edge that meets 3:1, error state linked with aria-describedby.

type TextFieldProps = ComponentProps<"input"> & {
  id: string;
  label: ReactNode;
  error?: string;
  suffix?: string;
  amount?: boolean;
  wrapperClassName?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, error, suffix, amount = false, className, wrapperClassName, ...props },
  ref,
) {
  const errorId = `${id}-error`;
  return (
    <div className={cx("flex flex-col gap-xs", wrapperClassName)}>
      <label htmlFor={id} className="type-label text-muted">
        {label}
      </label>
      <div
        className={cx(
          "flex min-h-control-height items-center rounded-md border border-border bg-surface-card text-ink transition-colors duration-(--motion-fast) ease-skin",
          "hover:border-ink focus-within:border-primary focus-within:outline-3 focus-within:outline-offset-1 focus-within:outline-focus-ring",
          amount ? "px-md" : "px-base",
          error && "border-2 border-error! hover:border-error",
          error && amount && "bg-error-wash",
          props.disabled && "border-hairline bg-surface-disabled text-disabled",
        )}
      >
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cx(
            "min-w-0 flex-1 self-stretch bg-transparent outline-none placeholder:text-muted disabled:cursor-not-allowed",
            amount ? "type-amount text-right" : "type-body-md",
            className,
          )}
          {...props}
        />
        {suffix && <span className="ml-[3px] type-body-md text-muted">{suffix}</span>}
      </div>
      {error && (
        <p id={errorId} className="type-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
});
