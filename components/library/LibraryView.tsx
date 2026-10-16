"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChipFilter } from "@/components/ui/ChipFilter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { TilePanel } from "@/components/ui/Tile";
import { useInstalled } from "@/components/shell/useInstalled";
import { categoryLabel } from "@/lib/data/categories";
import {
  NO_FILTERS,
  activeFilterCount,
  categoryCounts,
  matches,
  parseLibraryQuery,
  ratingLabel,
  sortRecipes,
  writeFilters,
  type LibraryFilters,
} from "@/lib/data/library";
import { pollImports, useDrafts } from "@/lib/data/store";
import type { Draft, Recipe } from "@/lib/data/types";
import { DraftsSection } from "./DraftsSection";
import { FilterRow } from "./FilterControls";
import { FiltersSheet } from "./FiltersSheet";
import { RecipeList } from "./RecipeList";
import { SearchField } from "./SearchField";

// /recipes (Library), BONES-recipes.md. Sections in SKELETON order: Search, Filters,
// Drafts, Recipes, with a page header for the H1 and the primary action (Import from a
// reel), which is the sticky action-bar on mobile. Query state lives in the URL.
// With the Import feature off (lib/features.ts), the primary action is New recipe,
// there are no drafts, and nothing mentions reels.

export function LibraryView({
  recipes,
  drafts: initialDrafts,
  importEnabled,
}: {
  recipes: Recipe[];
  drafts: Draft[];
  importEnabled: boolean;
}) {
  const drafts = useDrafts(initialDrafts);
  const installed = useInstalled();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = parseLibraryQuery(searchParams);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [searchKey, setSearchKey] = useState(0);
  const filtersButton = useRef<HTMLButtonElement>(null);
  const initiallyImporting = useMemo(() => new Set(initialDrafts.filter((d) => d.status === "importing").map((d) => d.id)), [initialDrafts]);

  useEffect(() => pollImports(initialDrafts), [initialDrafts]);

  const sorted = useMemo(() => sortRecipes(recipes), [recipes]);
  const results = sorted.filter((r) => matches(r, query));
  const categories = categoryCounts(recipes);
  const filterCount = activeFilterCount(query);
  const searching = query.q !== "" || filterCount > 0;

  function replace(params: URLSearchParams) {
    const q = params.toString();
    window.history.replaceState(null, "", q ? `${pathname}?${q}` : pathname);
  }
  const setFilters = (f: LibraryFilters) => replace(writeFilters(new URLSearchParams(searchParams.toString()), f));
  const setSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    replace(params);
  };
  function clearSearch() {
    setSearch("");
    setSearchKey((k) => k + 1);
  }

  const isEmpty = recipes.length === 0 && drafts.length === 0;
  const onlyDrafts = recipes.length === 0 && drafts.length > 0;

  return (
    <>
      {/* Page header: H1 and, except in Empty, the primary action */}
      <div className="flex items-center justify-between gap-lg">
        <h1 className="type-display-md text-ink desktop:type-display-lg">Library</h1>
        {!isEmpty && <PrimaryAction importEnabled={importEnabled} installed={installed} />}
      </div>

      {isEmpty ? (
        <EmptyState importEnabled={importEnabled} />
      ) : (
        <>
          {!onlyDrafts && (
            <>
              {/* Search, with the Filters button beside it on mobile */}
              <div className="mt-base desktop:max-w-[calc(var(--col)*8+var(--gutter)*7)]">
                <SearchField
                  key={searchKey}
                  initial={query.q}
                  onSearch={setSearch}
                  trailing={
                    <Button
                      ref={filtersButton}
                      variant="secondary"
                      aria-haspopup="dialog"
                      onClick={() => {
                        setSheetKey((k) => k + 1);
                        setSheetOpen(true);
                      }}
                      className="px-base tablet:hidden"
                    >
                      <SlidersHorizontal aria-hidden="true" />
                      Filters
                      {filterCount > 0 && (
                        <span className="grid min-w-lg place-items-center rounded-full bg-primary px-xs type-caption font-bold text-on-primary">
                          {filterCount}
                          <span className="sr-only"> active</span>
                        </span>
                      )}
                    </Button>
                  }
                />
              </div>

              {/* Filters: one row from tablet up; active chips + Clear filters on mobile */}
              <div className="mt-base max-tablet:hidden">
                <FilterRow filters={query} categories={categories} onChange={setFilters} onClear={() => setFilters(NO_FILTERS)} active={filterCount > 0} />
              </div>
              {filterCount > 0 && (
                <div className="mt-sm flex flex-wrap items-center gap-x-sm gap-y-md tablet:hidden">
                  {query.category && <ChipFilter label={categoryLabel(query.category)} onRemove={() => setFilters({ ...query, category: null })} />}
                  {query.status !== "all" && (
                    <ChipFilter label={query.status === "baked" ? "Baked" : "Not baked yet"} onRemove={() => setFilters({ ...query, status: "all" })} />
                  )}
                  {query.favorite && <ChipFilter label="Favorites" onRemove={() => setFilters({ ...query, favorite: false })} />}
                  {query.rating && (
                    <ChipFilter label={ratingLabel(query.rating).label} spoken={ratingLabel(query.rating).spoken} onRemove={() => setFilters({ ...query, rating: null })} />
                  )}
                  <Button variant="text" onClick={() => setFilters(NO_FILTERS)}>
                    Clear filters
                  </Button>
                </div>
              )}
              <FiltersSheet
                key={sheetKey}
                open={sheetOpen}
                applied={query}
                categories={categories}
                countFor={(f) => sorted.filter((r) => matches(r, { ...f, q: query.q })).length}
                onApply={(f) => {
                  setFilters(f);
                  setSheetOpen(false);
                }}
                onClose={() => setSheetOpen(false)}
                returnFocus={filtersButton}
              />
            </>
          )}

          {/* Drafts: hidden while searching or filtering (SKELETON). initialDrafts, not
              the live-filtered count, so discarding down to zero doesn't unmount the
              section out from under its own "Draft discarded · Undo" notice. */}
          {initialDrafts.length > 0 && !searching && <DraftsSection drafts={drafts} initiallyImporting={initiallyImporting} />}

          <section aria-labelledby="recipes-heading" className="mt-lg desktop:mt-xl">
            <SectionHeading id="recipes-heading" tabIndex={-1} className="outline-none">
              Recipes
            </SectionHeading>
            {onlyDrafts ? (
              <p className="mt-sm type-body-md text-muted">No saved recipes yet</p>
            ) : (
              <>
                <p aria-live="polite" className="mt-sm type-label text-muted">
                  {!searching
                    ? `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"}`
                    : results.length === 0
                      ? `No matches out of ${recipes.length} recipes`
                      : `${results.length} of ${recipes.length} recipes`}
                </p>
                {results.length > 0 ? (
                  <RecipeList key={searchParams.toString()} recipes={results} />
                ) : (
                  <div className="mt-sm rounded-lg border border-hairline bg-surface-card p-base">
                    <p className="type-body-md text-ink">Nothing matches</p>
                    <div className="mt-xs flex flex-wrap gap-x-base">
                      {query.q && (
                        <Button variant="text" onClick={clearSearch} className="-ml-sm">
                          Clear search
                        </Button>
                      )}
                      {filterCount > 0 && (
                        <Button variant="text" onClick={() => setFilters(NO_FILTERS)} className={query.q ? undefined : "-ml-sm"}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </>
  );
}

/**
 * Primary action: the sticky action-bar on mobile, in the page header from tablet
 * up. Import from a reel, or New recipe while the Import feature is off.
 * Installed (BONES-shell 1.7.0): dropped on mobile, since the tab bar's Import
 * tab is the same action; tablet and desktop keep it in the header either way.
 */
function PrimaryAction({ importEnabled, installed, centered = false }: { importEnabled: boolean; installed: boolean; centered?: boolean }) {
  return (
    <div
      data-action-bar
      className={
        "z-20 max-tablet:pin-bottom bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:z-auto tablet:bg-transparent tablet:p-0 tablet:shadow-none" +
        (centered ? " tablet:mt-lg" : "") +
        (installed ? " max-tablet:hidden" : "")
      }
    >
      <ButtonLink href={importEnabled ? "/import" : "/recipes/new"} variant="primary" className="w-full tablet:w-auto">
        {importEnabled ? "Import from a reel" : "New recipe"}
      </ButtonLink>
    </div>
  );
}

/** BONES Empty: no recipes and no drafts. */
function EmptyState({ importEnabled }: { importEnabled: boolean }) {
  const installed = useInstalled();
  return (
    <div className="mx-auto mt-lg flex flex-col items-center text-center tablet:max-w-[calc(var(--col)*4+var(--gutter)*3)] desktop:mt-xl">
      <TilePanel className="w-full max-w-[calc(var(--spacing-3xl)*4)]" />
      <p className="mt-lg type-body-lg text-ink">{importEnabled ? "Save your first recipe from a reel" : "Add your first recipe"}</p>
      <PrimaryAction importEnabled={importEnabled} installed={installed} centered />
      {importEnabled && (
        <TextLink href="/import#set-up-the-shortcut" className="mt-sm inline-flex min-h-touch-min items-center type-body-md">
          Set up the Shortcut
        </TextLink>
      )}
    </div>
  );
}
