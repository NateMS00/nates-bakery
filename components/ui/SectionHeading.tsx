import type { ReactNode } from "react";
import { TileMark } from "./Tile";
import { cx } from "./cx";

/** An H2 section title in `heading`, stamped with a tile-mark (SKIN). */
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
    <h2 ref={ref} tabIndex={tabIndex} id={id} className={cx("flex items-center gap-sm type-heading text-ink", className)}>
      <TileMark />
      {children}
    </h2>
  );
}

/** SKIN group-heading: component group names (Crust, Filling) as H3. */
export function GroupHeading({ children }: { children: ReactNode }) {
  return <h3 className="mt-lg border-b border-hairline pb-xs type-subheading text-primary first:mt-base">{children}</h3>;
}
