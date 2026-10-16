import { cx } from "./cx";

export interface SectionTabOption {
  href: string;
  label: string;
}

/**
 * SKIN section-tabs + section-tab: anchor tabs on the Recipe page (Ingredients,
 * Steps, Bakes) — a 3px cobalt bar under the current one, sticky under the top
 * of the screen once the cover scrolls away (the caller's job to position).
 * Jump links to sections of one long page, marking the section in view; they
 * never hide content. Built as links with `aria-current="location"`, not a tab
 * panel.
 */
export function SectionTabs({ options, current, className }: { options: SectionTabOption[]; current: string; className?: string }) {
  return (
    <nav aria-label="Sections" className={cx("flex gap-lg border-b border-hairline bg-canvas", className)}>
      {options.map((option) => {
        const isCurrent = option.href === current;
        return (
          <a
            key={option.href}
            href={option.href}
            aria-current={isCurrent ? "location" : undefined}
            className={cx(
              "flex min-h-touch-min items-center border-b-[3px] type-button transition-colors duration-(--motion-fast) ease-skin focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring",
              isCurrent ? "border-primary text-primary" : "border-transparent text-body hover:text-ink",
            )}
          >
            {option.label}
          </a>
        );
      })}
    </nav>
  );
}
