"use client";

import { Cake, Import, LibraryBig, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { TabBar } from "@/components/ui/TabBar";

/** The four top-level pages (BONES-shell 1.7.0) and the tab bar's icon for each. */
export const TOP_LEVEL = {
  "/recipes": { label: "Library", icon: <LibraryBig aria-hidden="true" strokeWidth={1.8} /> },
  "/import": { label: "Import", icon: <Import aria-hidden="true" strokeWidth={1.8} /> },
  "/bakes": { label: "Bakes", icon: <Cake aria-hidden="true" strokeWidth={1.8} /> },
  "/account": { label: "Account", icon: <User aria-hidden="true" strokeWidth={1.8} /> },
} as const;

/**
 * BONES-shell 1.7.0: the Home Screen tab bar. Rendered by ShellFooter.tsx, which
 * decides when (installed mode, a top-level page). `data-tab-bar` (globals.css)
 * reserves the page's bottom space and hides it while the keyboard is open, same
 * as a page's own sticky action. `showImport`: drops the Import tab while the
 * feature is off (lib/features.ts), same as AppHeader's Import link — otherwise
 * it would point at a 404.
 */
export function BottomNav({ showImport }: { showImport: boolean }) {
  const pathname = usePathname();
  return (
    <div data-tab-bar>
      <TabBar
        items={Object.entries(TOP_LEVEL)
          .filter(([href]) => showImport || href !== "/import")
          .map(([href, item]) => ({ href, ...item, current: href === pathname }))}
      />
    </div>
  );
}
