"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TileBand } from "@/components/ui/Tile";
import { cx } from "@/components/ui/cx";
import { AccountMenu } from "./AccountMenu";
import { useInstalled } from "./useInstalled";

// BONES-shell 1.7.0 App variant header: wordmark (→ /recipes), Library, Import
// and Bakes, then the account menu — always at tablet and up. On mobile the
// wordmark is Library, so Library itself doesn't repeat as a link. Installed on
// a phone (Home Screen, no Safari toolbar), the tab bar covers Import, Bakes and
// the account menu, so only the logo and tile band remain. Scrolls with the
// page. SKIN app-header + tile-band + nav-link.

const navLinkClass =
  "inline-flex min-h-touch-min items-center border-b-3 border-transparent px-sm tablet:px-md type-button text-body transition-colors duration-(--motion-fast) ease-skin hover:border-hairline hover:text-ink focus-visible:outline-offset-2 aria-[current=page]:border-primary aria-[current=page]:text-primary";

/** `showImport`: the Import link, only while the Import feature is on (lib/features.ts). */
export function AppHeader({ showImport }: { showImport: boolean }) {
  const pathname = usePathname();
  const installed = useInstalled();
  const current = (href: string) => (pathname === href ? "page" : undefined);
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
        <div className={cx("flex items-center gap-xs tablet:gap-sm", installed && "max-tablet:hidden")}>
          <nav aria-label="Primary" className="flex items-center gap-xs">
            <Link href="/recipes" aria-current={current("/recipes")} className={cx(navLinkClass, "max-tablet:hidden")}>
              Library
            </Link>
            {showImport && (
              <Link href="/import" aria-current={current("/import")} className={navLinkClass}>
                Import
              </Link>
            )}
            <Link href="/bakes" aria-current={current("/bakes")} className={cx(navLinkClass, "max-tablet:hidden")}>
              Bakes
            </Link>
          </nav>
          <AccountMenu />
        </div>
      </div>
      <TileBand />
    </header>
  );
}
