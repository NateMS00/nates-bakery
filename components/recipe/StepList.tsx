import { GroupHeading } from "@/components/ui/SectionHeading";
import { splitStepText } from "@/lib/time-marks";
import type { Group, Step } from "@/lib/data/types";
import { groupItems } from "./IngredientList";

// BONES Steps: numbered, full text, numbering continues across groups. Detected
// times are marked inline (SKIN time-mark: bold, body colour, nothing link-like)
// because they aren't interactive here. The Tips group (BONES-recipes-detail 1.5.1,
// BONES-r-detail 1.1.4) is the exception: always last, a plain unnumbered list in
// body text, with no time marks, and doesn't count in the numbering.

export function StepList({ groups, steps }: { groups: Group[]; steps: Step[] }) {
  const tipsGroupId = groups.find((g) => g.name === "Tips")?.id;
  const numberOf = new Map<string, number>();
  {
    let n = 0;
    for (const s of steps) if (s.groupId !== tipsGroupId) numberOf.set(s.id, ++n);
  }
  return (
    <>
      {groupItems(groups, steps).map(({ group, items }) => {
        const isTips = group?.id === tipsGroupId;
        const ListTag = isTips ? "ul" : "ol";
        return (
          <div key={group?.id ?? "ungrouped"}>
            {group && <GroupHeading>{group.name}</GroupHeading>}
            <ListTag role="list" start={isTips ? undefined : numberOf.get(items[0].id)} className={group ? undefined : "mt-sm"}>
              {items.map((step) => (
                <li
                  key={step.id}
                  className={isTips ? "py-md type-body-md text-ink" : "grid grid-cols-[minmax(2ch,auto)_1fr] items-baseline gap-x-md py-md"}
                >
                  {!isTips && <span className="type-amount font-bold text-primary">{numberOf.get(step.id)}</span>}
                  {isTips ? (
                    step.text
                  ) : (
                    <p className="type-body-lg text-ink">
                      {splitStepText(step.text, step.timeMarks).map((part, i) =>
                        part.kind === "time" ? (
                          <span key={i} className="font-bold whitespace-nowrap text-ink">
                            {part.text}
                          </span>
                        ) : (
                          part.text
                        ),
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ListTag>
          </div>
        );
      })}
    </>
  );
}
