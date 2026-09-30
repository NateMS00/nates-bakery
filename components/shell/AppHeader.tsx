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
  "inline-flex min-h-touch-min items-center border-b-3 border-transparent px-md type-button text-body transition-colors duration-(--motion-fast) ease-skin hover:border-hairline hover:text-ink focus-visible:outline-offset-2 aria-[current=page]:border-primary aria-[current=page]:text-primary";

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header>
      <div className="mx-auto flex min-h-3xl max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] items-center gap-sm px-(--gutter)">
        <Link
          href="/recipes"
          className="mr-auto inline-flex min-h-touch-min items-center rounded-sm type-wordmark text-primary focus-visible:outline-offset-2"
        >
          Backery
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-xs">
          <Link href="/recipes" aria-current={pathname === "/recipes" ? "page" : undefined} className={cx(navLinkClass, "max-tablet:hidden")}>
            Library
          </Link>
          <Link href="/import" aria-current={pathname === "/import" ? "page" : undefined} className={navLinkClass}>
            Import
          </Link>
        </nav>
        <AccountMenu />
      </div>
      <TileBand />
    </header>
  );
}
