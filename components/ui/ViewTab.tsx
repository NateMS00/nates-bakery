import { cx } from "./cx";

export interface ViewTabOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * SKIN view-tab: the Library's Recipes / Favorites / Drafts switcher — short
 * grout-fill tiles, the selected one cobalt with on-primary text, an optional
 * count. Built as a tab list (`role="tablist"`, `aria-selected`), not filters.
 * 40px tall in a 48px hit area (a centered pseudo-element, as SKIN's segmented
 * control already does).
 */
export function ViewTabs({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: ViewTabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cx("flex gap-sm", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              "relative inline-flex min-h-10 items-center gap-xs whitespace-nowrap rounded-md px-md type-button text-[15px] transition-colors duration-(--motion-fast) ease-skin after:absolute after:inset-x-0 after:-inset-y-xs after:content-[''] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              selected ? "bg-primary text-on-primary" : "bg-surface-sunken text-body hover:bg-hairline hover:text-ink",
            )}
          >
            {option.label}
            {option.count !== undefined && <span className="type-caption">{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
