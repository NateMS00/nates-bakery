"use client";

import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { RATING_OPTIONS, ratingLabel, type LibraryFilters, type Status } from "@/lib/data/library";
import type { Category } from "@/lib/data/types";

// The filter values shared by the desktop row and the mobile sheet.

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "all", label: "All" },
  { value: "baked", label: "Baked" },
  { value: "not-baked", label: "Not baked yet" },
];

export type CategoryCount = { slug: Category; label: string; count: number };

/** Desktop and tablet: one row under Search; each control applies immediately. */
export function FilterRow({
  filters,
  categories,
  onChange,
  onClear,
  active,
}: {
  filters: LibraryFilters;
  categories: CategoryCount[];
  onChange: (next: LibraryFilters) => void;
  onClear: () => void;
  active: boolean;
}) {
  const ratingOptions = filters.rating && !RATING_OPTIONS.some((o) => o.value === filters.rating) ? [ratingLabel(filters.rating), ...RATING_OPTIONS] : RATING_OPTIONS;
  return (
    <div className="flex flex-wrap items-end gap-x-lg gap-y-base">
      <Select
        id="filter-category"
        label="Category"
        value={filters.category ?? ""}
        onChange={(e) => onChange({ ...filters, category: (e.target.value || null) as Category | null })}
        wrapperClassName="w-[calc(var(--spacing-3xl)*3.5)]"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.label} ({c.count})
          </option>
        ))}
      </Select>
      <div className="flex flex-col gap-xs">
        <span id="filter-status-label" className="type-label text-muted">
          Status
        </span>
        <Segmented
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(v) => onChange({ ...filters, status: v as Status })}
        />
      </div>
      <Toggle label="Favorites" checked={filters.favorite} onChange={(favorite) => onChange({ ...filters, favorite })} />
      <Select
        id="filter-rating"
        label="Rating"
        value={filters.rating ?? ""}
        onChange={(e) => onChange({ ...filters, rating: e.target.value ? Number(e.target.value) : null })}
        wrapperClassName="w-[calc(var(--spacing-3xl)*2.75)]"
      >
        <option value="">Any</option>
        {ratingOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      {active && (
        <Button variant="text" onClick={onClear} className="ml-auto">
          Clear filters
        </Button>
      )}
    </div>
  );
}
