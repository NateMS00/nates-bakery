"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TileBand } from "@/components/ui/Tile";
import { cx } from "@/components/ui/cx";
import { AccountMenu } from "./AccountMenu";

// BONES-shell App variant header: wordmark (→ /recipes), Library and Import,
// then the account menu. Scrolls with the page. On mobile the wordmark is Library,
// so only Import shows as a link. SKIN app-header + tile-band + nav-link.

const navLinkClass =
  "inline-flex min-h-touch-min items-center border-b-3 border-transparent px-sm tablet:px-md type-button text-body transition-colors duration-(--motion-fast) ease-skin hover:border-hairline hover:text-ink focus-visible:outline-offset-2 aria-[current=page]:border-primary aria-[current=page]:text-primary";

/** `showImport`: the Import link, only while the Import feature is on (lib/features.ts). */
export function AppHeader({ showImport }: { showImport: boolean }) {
  const pathname = usePathname();
  return (
    <header>
      {/* "Nate’s Bakery" stays on one line down to 320px: below tablet the gaps and the
          Import link's side padding tighten (still 48px targets). */}
      <div className="mx-auto flex min-h-3xl max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] items-center gap-xs px-(--gutter) tablet:gap-sm">
        <Link
          href="/recipes"
          className="mr-auto inline-flex min-h-touch-min shrink-0 items-center rounded-sm whitespace-nowrap type-wordmark text-primary focus-visible:outline-offset-2"
        >
          Nate’s Bakery
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-xs">
          <Link href="/recipes" aria-current={pathname === "/recipes" ? "page" : undefined} className={cx(navLinkClass, "max-tablet:hidden")}>
            Library
          </Link>
          {showImport && (
            <Link href="/import" aria-current={pathname === "/import" ? "page" : undefined} className={navLinkClass}>
              Import
            </Link>
          )}
        </nav>
        <AccountMenu />
      </div>
      <TileBand />
    </header>
  );
}
