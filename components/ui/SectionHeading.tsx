import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * An H2 section title in `heading`. No tile-mark (SKIN, since the visual round:
 * repeated on every section it stopped meaning anything — section titles stand on
 * type alone now). TileMark itself is kept for two places only: a picture
 * placeholder while it loads, and before an empty state's heading.
 */
export function SectionHeading({
  id,
  children,
  className,
  ref,
  tabIndex,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  ref?: React.Ref<HTMLHeadingElement>;
  tabIndex?: number;
}) {
  return (
    <h2 ref={ref} tabIndex={tabIndex} id={id} className={cx("type-heading text-ink", className)}>
      {children}
    </h2>
  );
}

/** SKIN group-heading: component group names (Crust, Filling) as H3. */
export function GroupHeading({ children }: { children: ReactNode }) {
  return <h3 className="mt-lg border-b border-hairline pb-xs type-subheading text-primary first:mt-base">{children}</h3>;
}
