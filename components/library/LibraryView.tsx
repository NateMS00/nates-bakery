"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChipFilter } from "@/components/ui/ChipFilter";
import { TextLink } from "@/components/ui/TextLink";
import { TilePanel } from "@/components/ui/Tile";
import { ViewTabs } from "@/components/ui/ViewTab";
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
  writeView,
  type LibraryFilters,
  type View,
} from "@/lib/data/library";
import { pollImports, useDrafts } from "@/lib/data/store";
import type { Draft, Recipe } from "@/lib/data/types";
import { DraftsSection } from "./DraftsSection";
import { FilterRow } from "./FilterControls";
import { FiltersSheet } from "./FiltersSheet";
import { RecipeList } from "./RecipeList";
import { SearchField } from "./SearchField";

// /recipes (Library), BONES-recipes.md 1.5.0. Sections in SKELETON order: Search,
// Filters, Views (Recipes · Favorites · Drafts), then the active view's panel, with
// a page header for the H1 and the primary action (Import from a reel), which is the
// sticky action-bar on mobile. Query state lives in the URL. With the Import feature
// off (lib/features.ts), the primary action is New recipe, there are no drafts, and
// nothing mentions reels.

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
  const viewTabs = useRef<HTMLDivElement>(null);
  const initiallyImporting = useMemo(() => new Set(initialDrafts.filter((d) => d.status === "importing").map((d) => d.id)), [initialDrafts]);

  useEffect(() => pollImports(initialDrafts), [initialDrafts]);

  const isEmpty = recipes.length === 0 && drafts.length === 0;
  const onlyDrafts = recipes.length === 0 && drafts.length > 0;
  const view: View = query.view ?? (onlyDrafts ? "drafts" : "recipes");

  function replace(params: URLSearchParams) {
    const q = params.toString();
    window.history.replaceState(null, "", q ? `${pathname}?${q}` : pathname);
  }
  const setFilters = (f: LibraryFilters) => replace(writeFilters(new URLSearchParams(searchParams.toString()), f));
  const setView = (v: View) => replace(writeView(new URLSearchParams(searchParams.toString()), v));
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

  // BONES: an old ?favorite=1 link opens Favorites (parseLibraryQuery already reads
  // it) and rewrites the URL to ?view=favorites — once, on arrival, never again.
  useEffect(() => {
    if (searchParams.get("favorite") === "1") replace(writeView(new URLSearchParams(searchParams.toString()), "favorites"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time cleanup of the URL this page was opened with, not a reaction to later changes
  }, []);

  const sorted = useMemo(() => sortRecipes(recipes), [recipes]);
  const base = view === "favorites" ? sorted.filter((r) => r.favorite) : sorted;
  const results = view === "drafts" ? [] : base.filter((r) => matches(r, { ...query, view }));
  const categories = categoryCounts(recipes);
  const filterCount = activeFilterCount(query);
  const searching = query.q !== "" || filterCount > 0;

  /** The Drafts tab hides once it's empty; focus moves to the Recipes tab (BONES). */
  function onLastDraftDiscarded() {
    setView("recipes");
    requestAnimationFrame(() => viewTabs.current?.querySelector<HTMLElement>("[role=tab]")?.focus());
  }

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
          {view !== "drafts" && (
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
                countFor={(f) => base.filter((r) => matches(r, { ...f, q: query.q, view })).length}
                onApply={(f) => {
                  setFilters(f);
                  setSheetOpen(false);
                }}
                onClose={() => setSheetOpen(false)}
                returnFocus={filtersButton}
              />
            </>
          )}

          <div ref={viewTabs} className="mt-base">
            <ViewTabs
              label="Library views"
              value={view}
              onChange={(v) => setView(v as View)}
              options={[
                { value: "recipes", label: "Recipes" },
                { value: "favorites", label: "Favorites" },
                ...(drafts.length > 0 ? [{ value: "drafts", label: "Drafts", count: drafts.length }] : []),
              ]}
            />
          </div>

          {view === "drafts" ? (
            <div className="mt-lg desktop:mt-xl">
              <DraftsSection drafts={drafts} initiallyImporting={initiallyImporting} onLastDiscarded={onLastDraftDiscarded} />
            </div>
          ) : (
            <section aria-labelledby="recipes-heading" className="mt-lg desktop:mt-xl">
              <h2 id="recipes-heading" className="sr-only">
                {view === "favorites" ? "Favorites" : "Recipes"}
              </h2>
              {base.length === 0 ? (
                <p className="mt-sm type-body-md text-muted">
                  {view === "favorites" ? "Tap the heart on a recipe to keep it here." : "No saved recipes yet"}
                </p>
              ) : (
                <>
                  <p aria-live="polite" className="mt-sm type-label text-muted">
                    {!searching
                      ? `${base.length} ${base.length === 1 ? "recipe" : "recipes"}`
                      : results.length === 0
                        ? `No matches out of ${base.length} recipes`
                        : `${results.length} of ${base.length} recipes`}
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
          )}
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
        "z-20 max-tablet:pin-bottom bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+var(--safe-area-bottom))] shadow-bar tablet:static tablet:z-auto tablet:bg-transparent tablet:p-0 tablet:shadow-none" +
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
