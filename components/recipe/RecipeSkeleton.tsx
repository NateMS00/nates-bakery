import { AzulejoFill } from "@/components/ui/AzulejoFill";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cx } from "@/components/ui/cx";

// BONES Loading: a grout cover area (always reserved — loading.tsx is a pure
// Suspense fallback with no data yet, so a cover-less recipe briefly over-reserves
// rather than jumping once it loads in) with the record card's outline and 5 row
// placeholders over its edge; on desktop the split hero with a grout frame on the
// left and the azulejo field (real, not a placeholder — it's not data-dependent)
// on the right, the record card's skeleton centred on it; 8 ingredient rows, 4
// steps; action bar shown disabled.

export function RecipeSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading recipe</p>
      <div className="desktop:hidden">
        {/* Skeleton's own rounded-sm is close enough here — a same-specificity rounded-*
            override via className isn't a reliable win (established elsewhere this round). */}
        <Skeleton className="-mx-(--gutter) -mt-lg aspect-[4/3] w-[calc(100%+2*var(--gutter))] tablet:mx-0 tablet:mt-0 tablet:aspect-auto tablet:h-[200px]" />
        <RecordCardSkeleton className="relative z-10 mx-(--gutter) -mt-xl tablet:mx-0" />
      </div>
      <div className="hidden h-[min(calc(100svh_-_64px),760px)] desktop:grid desktop:grid-cols-2 desktop:divide-x desktop:divide-outline">
        <div className="p-xl">
          <Skeleton className="mx-auto h-full max-w-[72%] rounded-tile" />
        </div>
        <div className="relative flex items-center justify-center">
          <AzulejoFill className="absolute inset-0" />
          <RecordCardSkeleton actions className="relative z-10 w-full max-w-[min(400px,80%)]" />
        </div>
      </div>
      <Skeleton className="mt-lg h-touch-min w-full desktop:mt-xl" />
      <RecipeBodySkeleton />
      <div
        data-action-bar
        data-action-bar-tablet
        className="z-20 flex pin-bottom gap-sm bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar desktop:hidden"
      >
        <Button variant="secondary" disabled>
          Log bake
        </Button>
        <Button variant="primary" disabled className="flex-1">
          Start baking
        </Button>
      </div>
    </div>
  );
}

/** The record-card's own loading placeholder: its outline and 5 row placeholders (recipe, from, kind, rating, baked). */
function RecordCardSkeleton({ actions = false, className }: { actions?: boolean; className?: string }) {
  return (
    <div className={cx("rounded-tile border border-outline bg-canvas p-base", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-base border-b border-outline py-sm">
          <Skeleton className="h-sm w-2xl" />
          <Skeleton className={i === 0 ? "h-base w-4xl" : "h-sm w-3xl"} />
        </div>
      ))}
      {actions && (
        <div className="mt-base flex gap-sm">
          <Button variant="primary" disabled className="flex-1">
            Start baking
          </Button>
          <Button variant="secondary" disabled className="flex-1">
            Log bake
          </Button>
        </div>
      )}
    </div>
  );
}

/** Scale row, 8 ingredient rows, and 4 steps in the Recipe page's columns (also the shared page). */
export function RecipeBodySkeleton() {
  return (
    <div className="mt-base tablet:grid tablet:grid-cols-8 tablet:gap-x-(--gutter) desktop:grid-cols-12">
      <div className="tablet:col-span-4 desktop:col-span-4">
        <Skeleton className="h-touch-min w-full rounded-md" />
        <Skeleton className="mt-lg h-lg w-1/2 desktop:mt-xl" />
        <ul className="mt-sm">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="flex items-center justify-between border-b border-hairline py-md">
              <Skeleton className={i % 3 === 0 ? "h-base w-3/5" : "h-base w-2/5"} />
              <Skeleton className="h-base w-xl" />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-lg tablet:col-span-4 tablet:mt-0 desktop:col-span-8">
        <Skeleton className="h-lg w-1/4" />
        <ul className="mt-sm">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex gap-md py-md">
              <Skeleton className="h-base w-base" />
              <div className="flex flex-1 flex-col gap-sm">
                <Skeleton className="h-base w-full" />
                <Skeleton className={i % 2 ? "h-base w-1/2" : "h-base w-3/4"} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
