import { GroupHeading } from "@/components/ui/SectionHeading";
import { splitStepText } from "@/lib/time-marks";
import type { Group, Step } from "@/lib/data/types";
import { groupItems } from "./IngredientList";

// BONES Steps: numbered, full text, numbering continues across groups.
// Detected times are marked inline (SKIN time-mark) but aren't interactive here.

export function StepList({ groups, steps }: { groups: Group[]; steps: Step[] }) {
  const numberOf = new Map(steps.map((s, i) => [s.id, i + 1]));
  return (
    <>
      {groupItems(groups, steps).map(({ group, items }) => (
        <div key={group?.id ?? "ungrouped"}>
          {group && <GroupHeading>{group.name}</GroupHeading>}
          <ol role="list" start={numberOf.get(items[0].id)} className={group ? undefined : "mt-sm"}>
            {items.map((step) => (
              <li key={step.id} className="grid grid-cols-[minmax(2ch,auto)_1fr] items-baseline gap-x-md py-md">
                <span className="type-amount font-bold text-primary">{numberOf.get(step.id)}</span>
                <p className="type-body-lg text-ink">
                  {splitStepText(step.text, step.timeMarks).map((part, i) =>
                    part.kind === "time" ? (
                      <span key={i} className="font-bold whitespace-nowrap text-primary underline decoration-dotted decoration-2 underline-offset-4">
                        {part.text}
                      </span>
                    ) : (
                      part.text
                    ),
                  )}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </>
  );
}
