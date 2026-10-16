import type { ReactNode } from "react";
import { importEnabled } from "@/lib/features";
import { AppHeader } from "./AppHeader";
import { ShellFooter } from "./ShellFooter";
import { SkipLink } from "./SkipLink";

/**
 * BONES-shell App variant: skip link, header with nav, main, then ShellFooter —
 * the Privacy footer, or (installed mode, a top-level page) the tab bar instead
 * (BONES-shell 1.7.0). On a page shorter than the screen, main grows so the
 * footer sits at the bottom (BONES-system).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const showImport = importEnabled();
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <AppHeader showImport={showImport} />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] flex-1 px-(--gutter) pt-lg outline-none tablet:pt-xl"
      >
        {children}
      </main>
      <ShellFooter showImport={showImport} />
    </div>
  );
}
