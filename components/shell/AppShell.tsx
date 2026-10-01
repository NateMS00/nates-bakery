import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { SiteFooter } from "./SiteFooter";
import { SkipLink } from "./SkipLink";

/**
 * BONES-shell App variant: skip link, header with nav, main, footer. On a page shorter
 * than the screen, main grows so the footer sits at the bottom (BONES-system).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <AppHeader />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] flex-1 px-(--gutter) pt-lg outline-none tablet:pt-xl"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
