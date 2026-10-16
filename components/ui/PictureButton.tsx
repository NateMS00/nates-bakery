import { forwardRef, type ComponentProps } from "react";
import { cx } from "./cx";

/**
 * SKIN picture-button: a round 40px control that floats on a photo — Back,
 * Favorite, Share and Edit on a cover; the play badge on a reel — with a solid
 * glazed-card fill and hairline edge, so its contrast never depends on the photo
 * underneath. The one round shape in the system besides chips and toggles. A
 * centered pseudo-element extends the 40px visible size to a 48px hit area.
 * Always needs an accessible name (`label`).
 */
type PictureButtonProps = ComponentProps<"button"> & { label: string };

export const PictureButton = forwardRef<HTMLButtonElement, PictureButtonProps>(function PictureButton(
  { label, className, type = "button", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cx(
        "relative inline-grid size-[40px] shrink-0 place-items-center rounded-full border border-hairline bg-surface-card text-ink transition-colors duration-(--motion-fast) ease-skin before:absolute before:-inset-xs before:content-[''] hover:bg-surface-sunken active:bg-primary-wash active:text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:text-disabled [&_svg]:size-icon-sm",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
