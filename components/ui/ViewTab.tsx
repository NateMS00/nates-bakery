import { cx } from "./cx";

export interface ViewTabOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * SKIN view-tab: the Library's Recipes / Favorites / Drafts switcher, drawn as a
 * row of choice-radios ("(●) Recipes  ( ) Favorites  ( ) Drafts 5") — but it is a
 * tab list, not a radio group: `role="tablist"`/`role="tab"`/`aria-selected`,
 * not a real radio input, because switching views swaps a panel below, which is
 * what a tab does. The glyph only echoes what `aria-selected` already says, so
 * it's `aria-hidden`.
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
    <div role="tablist" aria-label={label} className={cx("flex flex-wrap gap-x-md gap-y-0 tablet:gap-x-lg tablet:gap-y-sm", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className="group flex min-h-touch-min items-center gap-sm whitespace-nowrap rounded-sm transition-colors duration-(--motion-fast) ease-skin focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <span aria-hidden="true" className={cx("type-amount", selected ? "text-primary" : "text-muted")}>
              {selected ? "(●)" : "( )"}
            </span>
            <span className={cx("type-tab", selected ? "text-ink" : "text-muted group-hover:text-ink")}>
              {option.label}
              {option.count !== undefined && <span className="type-label-mono ml-xs text-muted">{option.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
