"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import { Popover } from "@/components/ui/Popover";
import { TABLET_UP, useMediaQuery } from "@/components/ui/useMediaQuery";
import type { EditorState, EditorStep } from "@/lib/data/editor";
import type { RefObject } from "react";
import { blocks } from "./ops";

// BONES Ingredients used picker: "Ingredients for step n"; every ingredient as a
// checkbox under its group heading, the step's own group first; Done. Changes apply
// as boxes are checked. Mobile: bottom sheet, about three quarters of the viewport
// (a BONES-shell exception: a scrolling list with a pinned footer); desktop: a panel
// under the Edit control, 4 cols wide. Focus returns to Edit.

export function IngredientsUsedPicker({
  open,
  onClose,
  anchor,
  state,
  step,
  number,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLButtonElement | null>;
  state: EditorState;
  step: EditorStep;
  number: number;
  onToggle: (ingredientId: string, used: boolean) => void;
}) {
  const desktop = useMediaQuery(TABLET_UP);
  const title = `Ingredients for step ${number}`;
  const titleId = `picker-${step.id}`;
  const stepGroupName = state.stepGroups.find((g) => g.id === step.groupId)?.name.toLowerCase();
  const sections = blocks(state.ingredientGroups, state.ingredients.filter((i) => i.name.trim()))
    .filter((b) => b.rows.length)
    .sort((a, b) => Number(b.group?.name.toLowerCase() === stepGroupName) - Number(a.group?.name.toLowerCase() === stepGroupName));

  const list = (
    <div className="flex flex-col gap-sm">
      {sections.map(({ group, rows }) => (
        <fieldset key={group?.id ?? "all"}>
          {group && <legend className="type-subheading text-primary">{group.name}</legend>}
          {!group && state.ingredientGroups.length > 0 && <legend className="type-label text-muted">Other ingredients</legend>}
          <div className="mt-xs flex flex-col">
            {rows.map((ingredient) => (
              <Checkbox key={ingredient.id} checked={step.ingredientIds.includes(ingredient.id)} onChange={(used) => onToggle(ingredient.id, used)}>
                {ingredient.name}
              </Checkbox>
            ))}
          </div>
        </fieldset>
      ))}
      {sections.length === 0 && <p className="type-body-md text-muted">Add ingredients first.</p>}
    </div>
  );

  if (desktop) {
    return (
      <Popover open={open} onClose={onClose} anchor={anchor} labelledBy={titleId} align="end" className="flex max-h-[min(70vh,calc(var(--spacing-3xl)*9))] w-[calc(var(--col)*4+var(--gutter)*3)] flex-col">
        <h4 id={titleId} className="px-base pt-base type-heading text-ink">
          {title}
        </h4>
        <div className="min-h-0 flex-1 overflow-y-auto px-base py-sm">{list}</div>
        <div className="flex justify-end border-t border-hairline px-base py-sm">
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              anchor.current?.focus();
            }}
          >
            Done
          </Button>
        </div>
      </Popover>
    );
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      modalColumns={4}
      sheetHeight="three-quarters"
      returnFocus={anchor}
      footer={
        <Button variant="secondary" onClick={onClose} className="w-full">
          Done
        </Button>
      }
    >
      {list}
    </Dialog>
  );
}
