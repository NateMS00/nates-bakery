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
    <nav aria-label="Main" className={cx("flex h-tab-bar border-t border-hairline bg-canvas pb-[env(safe-area-inset-bottom)]", className)}>
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
    </nav>
  );
}
