"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Segmented } from "@/components/ui/Segmented";
import { Toggle } from "@/components/ui/Toggle";
import { NO_FILTERS, RATING_OPTIONS, type LibraryFilters, type Status } from "@/lib/data/library";
import type { Category } from "@/lib/data/types";
import { STATUS_OPTIONS, type CategoryCount } from "./FilterControls";

// BONES Filters sheet (mobile): about three quarters of the viewport, with Category
// and Rating as single-choice lists, Status segmented, Favorites toggle, and a footer
// pinned to the bottom with Clear and "Show n recipes" (n updates live). Changes apply
// only on Show; Close, Esc, backdrop, or swipe discard them. Remount (key) per open.

export function FiltersSheet({
  open,
  applied,
  categories,
  countFor,
  onApply,
  onClose,
  returnFocus,
}: {
  open: boolean;
  applied: LibraryFilters;
  categories: CategoryCount[];
  countFor: (filters: LibraryFilters) => number;
  onApply: (filters: LibraryFilters) => void;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const [draft, setDraft] = useState(applied);
  const n = countFor(draft);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Filters"
      modalColumns={5}
      sheetHeight="three-quarters"
      returnFocus={returnFocus}
      footer={
        <div className="flex items-center justify-between gap-base">
          <Button variant="text" onClick={() => setDraft(NO_FILTERS)} className="-ml-sm">
            Clear
          </Button>
          <Button variant="primary" onClick={() => onApply(draft)} className="flex-1">
            Show {n} {n === 1 ? "recipe" : "recipes"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-lg pt-sm">
        <ChoiceList legend="Category">
          <Choice name="category" checked={draft.category === null} onChange={() => setDraft({ ...draft, category: null })}>
            All categories
          </Choice>
          {categories.map((c) => (
            <Choice
              key={c.slug}
              name="category"
              checked={draft.category === c.slug}
              onChange={() => setDraft({ ...draft, category: c.slug as Category })}
              count={c.count}
            >
              {c.label}
            </Choice>
          ))}
        </ChoiceList>

        <div className="flex flex-col gap-xs">
          <span className="type-label text-muted">Status</span>
          <Segmented label="Status" value={draft.status} options={STATUS_OPTIONS} onChange={(v) => setDraft({ ...draft, status: v as Status })} />
        </div>

        <Toggle label="Favorites" checked={draft.favorite} onChange={(favorite) => setDraft({ ...draft, favorite })} />

        <ChoiceList legend="Rating">
          <Choice name="rating" checked={draft.rating === null} onChange={() => setDraft({ ...draft, rating: null })}>
            Any
          </Choice>
          {RATING_OPTIONS.map((o) => (
            <Choice key={o.value} name="rating" checked={draft.rating === o.value} onChange={() => setDraft({ ...draft, rating: o.value })}>
              <span aria-hidden="true">{o.label}</span>
              <span className="sr-only">{o.spoken}</span>
            </Choice>
          ))}
        </ChoiceList>
      </div>
    </Dialog>
  );
}

function ChoiceList({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="type-label text-muted">{legend}</legend>
      <div className="mt-xs flex flex-col">{children}</div>
    </fieldset>
  );
}

/** A single-choice row. SKIN has no radio component; drawn from checkbox tokens (24px, border edge, cobalt when chosen). */
function Choice({
  name,
  checked,
  onChange,
  count,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
  children: ReactNode;
}) {
  return (
    <label className="flex min-h-touch-min cursor-pointer items-center gap-md border-b border-hairline type-body-md text-ink last:border-b-0">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-[24px] shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-border bg-surface-card transition-[border] duration-(--motion-fast) ease-skin hover:border-ink checked:border-[7px] checked:border-primary checked:hover:border-primary focus-visible:outline-offset-2"
      />
      <span className="flex-1">{children}</span>
      {count !== undefined && <span className="type-body-sm text-muted tabular-nums">{count}</span>}
    </label>
  );
}
