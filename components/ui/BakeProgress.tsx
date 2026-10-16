import { Check } from "lucide-react";
import { cx } from "./cx";

export interface BakeProgressGroup {
  name: string;
  steps: number;
}

/**
 * SKIN bake-progress: Bake Mode's position, segmented by component group — done
 * and current steps cobalt, upcoming grout with a border edge (3:1 non-text
 * contrast). The current group's name is cobalt and bold, finished groups
 * muted with a check, upcoming muted. Purely a picture of position, hidden from
 * screen readers: the step counter and the step eyebrow heading already say it.
 * Recipes without groups show one row of segments with no labels.
 */
export function BakeProgress({ groups, current, className }: { groups: BakeProgressGroup[]; current: number; className?: string }) {
  const starts = groups.reduce<number[]>((acc, g, i) => [...acc, i === 0 ? 0 : acc[i - 1] + groups[i - 1].steps], []);
  return (
    <div aria-hidden="true" className={cx("flex gap-sm", className)}>
      {groups.map((group, gi) => {
        const start = starts[gi];
        const finished = start + group.steps <= current;
        const isCurrentGroup = current >= start && current < start + group.steps;
        return (
          <div key={gi} className="flex-1">
            <div className="flex gap-[3px]">
              {Array.from({ length: group.steps }, (_, i) => (
                <span key={i} className={cx("h-bake-progress flex-1 rounded-full", start + i <= current ? "bg-primary" : "border border-border bg-surface-sunken")} />
              ))}
            </div>
            {groups.length > 1 && (
              <p className={cx("mt-xs truncate type-caption", isCurrentGroup ? "font-bold text-primary" : "text-muted")}>
                {finished && <Check aria-hidden="true" className="mr-[2px] inline size-[11px] align-[-1px]" strokeWidth={3} />}
                {group.name}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
