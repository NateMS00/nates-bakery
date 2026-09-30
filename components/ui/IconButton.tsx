import { forwardRef, type ComponentProps } from "react";
import { cx } from "./cx";

// SKIN icon-button: 48px square, 24px ink icon, always an accessible name.

export const iconButtonClass =
  "inline-grid size-touch-min shrink-0 place-items-center rounded-md text-ink transition-colors duration-(--motion-fast) ease-skin hover:bg-surface-sunken active:bg-primary-wash active:text-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-disabled disabled:hover:bg-transparent [&_svg]:size-icon";

type IconButtonProps = ComponentProps<"button"> & { label: string };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, type = "button", children, ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} className={cx(iconButtonClass, className)} {...props}>
      {children}
    </button>
  );
});
