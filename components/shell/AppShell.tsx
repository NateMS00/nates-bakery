import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { SiteFooter } from "./SiteFooter";
import { SkipLink } from "./SkipLink";

/** BONES-shell App variant: skip link, header with nav, main, footer. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <AppHeader />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] px-(--gutter) pt-base outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
