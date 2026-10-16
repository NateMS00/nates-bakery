import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./cx";

export interface TabBarItemConfig {
  href: string;
  label: string;
  icon: ReactNode;
  current?: boolean;
}

/**
 * SKIN tab-bar + tab-bar-item: the installed app's bottom navigation (Home
 * Screen mode only, BONES-shell) — four equal items, icon over a 13px label.
 * The current tab is cobalt and bold with `aria-current="page"`; others are
 * muted. Hidden on detail and task screens, which keep their own sticky action
 * (the caller's job).
 */
export function TabBar({ items, className }: { items: TabBarItemConfig[]; className?: string }) {
  return (
    // The 56px row and the safe-area padding are on separate elements on purpose:
    // put pb-[...] on the same element as h-tab-bar and the padding eats into the
    // fixed height instead of adding below it — on an iPhone (34px of it) that
    // leaves the items about 22px tall, not 56. pin-bottom (SKIN "pinned to the
    // bottom"): without it this sits in normal document flow and scrolls away
    // with the page instead of staying put; `data-tab-bar`'s body padding (its
    // sibling CSS rule) reserves the matching space so it never covers content.
    <nav aria-label="Main" className={cx("z-20 pin-bottom border-t border-outline bg-canvas pb-[var(--safe-area-bottom)]", className)}>
      <div className="flex h-tab-bar">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.current ? "page" : undefined}
            className={cx(
              "flex min-w-touch-min flex-1 flex-col items-center justify-center gap-[2px] text-muted transition-colors duration-(--motion-fast) ease-skin hover:text-ink focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring [&_svg]:size-icon",
              item.current && "font-bold text-primary",
            )}
          >
            {item.icon}
            <span className="type-caption text-[13px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
