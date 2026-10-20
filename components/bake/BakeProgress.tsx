import { cx } from "@/components/ui/cx";

// SKIN bake-progress: one 6px pill segment per step, grouped by component group, each
// group's width proportional to its step count, with the group name under it. Purely
// visual (hidden from screen readers; the header counter and step eyebrow carry
// position); recipes without groups show one unnamed row.

export interface ProgressGroup {
  name: string | null;
  count: number;
}

export function BakeProgress({ groups, current }: { groups: ProgressGroup[]; current: number }) {
  let index = -1;
  return (
    <div aria-hidden="true" className="flex gap-sm">
      {groups.map((group, gi) => {
        const start = index + 1;
        const segments = Array.from({ length: group.count }, () => ++index);
        const hasCurrent = current >= start && current < start + group.count;
        return (
          <div key={gi} style={{ flexGrow: group.count, flexBasis: 0 }} className="flex min-w-0 flex-col gap-xs">
            <div className="flex gap-[4px]">
              {segments.map((seg) => (
                <span
                  key={seg}
                  className={cx(
                    "h-bake-progress min-w-[4px] flex-1 rounded-full",
                    seg < current ? "bg-on-stage" : seg === current ? "bg-ochre" : "bg-stage-track",
                  )}
                />
              ))}
            </div>
            {group.name && <span className={cx("block truncate type-label-mono", hasCurrent ? "text-on-stage" : "text-on-stage-muted")}>{group.name}</span>}
          </div>
        );
      })}
    </div>
  );
}
