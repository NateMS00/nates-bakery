"use client";

import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { ChoiceChips } from "@/components/ui/ChoiceChips";
import { Dialog } from "@/components/ui/Dialog";
import { Segmented } from "@/components/ui/Segmented";
import { Toggle } from "@/components/ui/Toggle";
import { NO_FILTERS, RATING_OPTIONS, type LibraryFilters, type Status } from "@/lib/data/library";
import type { Category } from "@/lib/data/types";
import { STATUS_OPTIONS, type CategoryCount } from "./FilterControls";

// BONES Filters sheet (mobile): sized to its content with a footer pinned to its
// bottom. Category and Rating as wrapping choice chips, Status segmented, Favorites
// toggle; footer with Clear and "Show n recipes" (n updates live). All four filters
// fit on 390 × 844; if not, the body scrolls above the footer. Changes apply only on
// Show; the close X, Esc, backdrop, or swipe discard them. Remount (key) per open.

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
      <div className="flex flex-col gap-base pt-xs">
        <ChoiceChips
          label="Category"
          labelId="sheet-category"
          value={draft.category ?? ""}
          onChange={(v) => setDraft({ ...draft, category: (v || null) as Category | null })}
          options={[{ value: "", label: "All" }, ...categories.map((c) => ({ value: c.slug, label: c.label, count: c.count }))]}
        />
        <div className="flex flex-col gap-xs">
          <span className="type-label text-muted">Status</span>
          <Segmented label="Status" value={draft.status} options={STATUS_OPTIONS} onChange={(v) => setDraft({ ...draft, status: v as Status })} />
        </div>
        <Toggle label="Favorites" checked={draft.favorite} onChange={(favorite) => setDraft({ ...draft, favorite })} />
        <ChoiceChips
          label="Rating"
          labelId="sheet-rating"
          value={draft.rating ? String(draft.rating) : ""}
          onChange={(v) => setDraft({ ...draft, rating: v ? Number(v) : null })}
          options={[{ value: "", label: "Any" }, ...RATING_OPTIONS.map((o) => ({ value: String(o.value), label: o.label, spoken: o.spoken }))]}
        />
      </div>
    </Dialog>
  );
}
