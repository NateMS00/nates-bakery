import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES-recipes.md 1.5.0 Loading: Search, Filters and the view tabs render; the grid
// shows 4 placeholder tiles (grout frames and two text bars) in final proportions;
// the Drafts tab appears once loaded (its count isn't known yet). Search and Filters
// are drawn as placeholders in their final shape, because their options come from
// the data.

export function LibrarySkeleton({ importEnabled }: { importEnabled: boolean }) {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Loading recipes
      </p>
      <div className="flex items-center justify-between gap-lg">
        <h1 className="type-display-md text-ink desktop:type-display-lg">Library</h1>
        <div
          data-action-bar
          className="z-20 max-tablet:pin-bottom bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+var(--safe-area-bottom))] shadow-bar tablet:static tablet:bg-transparent tablet:p-0 tablet:shadow-none"
        >
          <ButtonLink href={importEnabled ? "/import" : "/recipes/new"} variant="primary" className="w-full tablet:w-auto">
            {importEnabled ? "Import from a reel" : "New recipe"}
          </ButtonLink>
        </div>
      </div>
      <div className="mt-base flex flex-col gap-xs desktop:max-w-[calc(var(--col)*8+var(--gutter)*7)]">
        <Skeleton className="h-md w-1/2 tablet:w-1/4" />
        <div className="flex gap-sm">
          <Skeleton className="h-control-height flex-1 rounded-md" />
          <Skeleton className="h-control-height w-[calc(var(--spacing-3xl)*1.75)] rounded-md tablet:hidden" />
        </div>
      </div>
      <div className="mt-base flex flex-wrap items-end gap-lg max-tablet:hidden">
        {[3.5, 5, 2.75].map((w, i) => (
          <div key={i} className="flex flex-col gap-xs">
            <Skeleton className="h-md w-2xl" />
            <Skeleton className="h-control-height rounded-md" style={{ width: `calc(var(--spacing-3xl) * ${w})` }} />
          </div>
        ))}
      </div>
      {/* View tabs: Recipes and Favorites only — Drafts' count isn't known yet. */}
      <div role="tablist" aria-label="Library views" className="mt-base flex gap-sm">
        <span className="inline-flex h-10 items-center rounded-md bg-primary px-md type-button text-[15px] text-on-primary">Recipes</span>
        <span className="inline-flex h-10 items-center rounded-md bg-surface-sunken px-md type-button text-[15px] text-body">Favorites</span>
      </div>
      <ul className="mt-lg grid grid-cols-2 gap-x-md gap-y-base desktop:mt-xl tablet:grid-cols-3 desktop:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="flex flex-col gap-sm">
            <Skeleton className="aspect-[4/5] w-full rounded-lg" />
            <div className="flex flex-col gap-xs">
              <Skeleton className="h-md w-2/5" />
              <Skeleton className={`h-lg ${i % 2 ? "w-3/5" : "w-4/5"}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
