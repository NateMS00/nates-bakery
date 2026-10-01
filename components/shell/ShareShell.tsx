import type { ReactNode } from "react";
import { TileBand } from "@/components/ui/Tile";
import { SiteFooter } from "./SiteFooter";
import { SkipLink } from "./SkipLink";

// BONES-shell Share variant, for friends without an account: the wordmark only, not a
// link (nothing on shared pages leads into the owner area); no navigation, no account
// menu; the header scrolls with the page. Footer: Privacy. Landmarks: skip link,
// header, main, footer; no nav.

export function ShareShell({ children }: { children: ReactNode }) {
  return (
    // A column as tall as the screen, so /r/expired can center its message between
    // header and footer.
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <header>
        <div className="mx-auto flex min-h-3xl max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] items-center px-(--gutter)">
          <span className="type-wordmark text-primary">Backery</span>
        </div>
        <TileBand />
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] flex-1 flex-col px-(--gutter) pt-lg outline-none tablet:pt-xl"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
