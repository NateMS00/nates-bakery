import type { ReactNode } from "react";

/** The Sign In pages' single centered column: full width on mobile, 5 columns from tablet up. */
export function AuthColumn({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full tablet:w-[calc(var(--col)*5+var(--gutter)*4)]">
      <h1 className="type-display-md text-ink">{title}</h1>
      {intro && <p className="mt-sm type-body-md text-body">{intro}</p>}
      {children}
    </div>
  );
}
