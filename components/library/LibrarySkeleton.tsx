import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES Loading: Search and Filters render; Recipes shows 6 placeholder items in
// final proportions; Drafts stay hidden until loaded. Search and Filters are drawn as
// placeholders in their final shape, because their options come from the data.

export function LibrarySkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Loading recipes
      </p>
      <div className="flex items-center justify-between gap-lg">
        <h1 className="type-display-md text-ink desktop:type-display-lg">Library</h1>
        <div
          data-action-bar
          className="fixed inset-x-0 bottom-0 z-20 bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:bg-transparent tablet:p-0 tablet:shadow-none"
        >
          <ButtonLink href="/import" variant="primary" className="w-full tablet:w-auto">
            Import from a reel
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
        {[3.5, 5, 2, 2.75].map((w, i) => (
          <div key={i} className="flex flex-col gap-xs">
            <Skeleton className="h-md w-2xl" />
            <Skeleton className="h-control-height rounded-md" style={{ width: `calc(var(--spacing-3xl) * ${w})` }} />
          </div>
        ))}
      </div>
      <Skeleton className="mt-lg h-lg w-1/4 desktop:mt-xl" />
      <Skeleton className="mt-sm h-md w-xl" />
      <ul className="mt-sm flex flex-col gap-sm">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="grid gap-y-sm rounded-lg border border-hairline bg-surface-card p-base tablet:grid-cols-12 tablet:items-center tablet:gap-x-(--gutter)">
            <Skeleton className="h-md w-2xl tablet:order-2 tablet:col-span-2" />
            <Skeleton className={`h-lg tablet:order-1 tablet:col-span-5 ${i % 2 ? "w-3/5" : "w-4/5"}`} />
            <Skeleton className="h-base w-1/3 tablet:order-3 tablet:col-span-2 tablet:w-3/4" />
          </li>
        ))}
      </ul>
    </div>
  );
}
