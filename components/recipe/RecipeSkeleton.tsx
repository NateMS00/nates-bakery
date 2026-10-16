import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES Loading: placeholders in final proportions (a cover area, title block, section
// tabs, scale row, 8 ingredient rows, 4 steps); action bar shown disabled. BONES says
// the cover placeholder shows "only if the recipe is known to have a cover" — loading.tsx
// is a pure Suspense fallback with no data yet (no recipeId-specific knowledge is
// possible before the page component resolves), so this always reserves the cover's
// space: a brief, self-correcting over-reservation for a cover-less recipe beats a
// layout jump when one does load in.

export function RecipeSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading recipe</p>
      {/* Skeleton's own rounded-sm is close enough here — a same-specificity rounded-*
          override via className isn't a reliable win (established elsewhere this round). */}
      <Skeleton className="-mx-(--gutter) -mt-lg aspect-[4/3] w-[calc(100%+2*var(--gutter))] tablet:mx-0 tablet:mt-0 tablet:aspect-auto tablet:h-[280px] tablet:w-full" />
      <div className="mt-base">
        <Skeleton className="h-md w-2xl" />
        <Skeleton className="mt-sm h-[34px] w-4/5 desktop:h-[44px]" />
        <Skeleton className="mt-base h-base w-3/4" />
        <Skeleton className="mt-sm h-base w-2/5" />
        {/* The wrapper is hidden, not the button itself: a trailing `hidden` can't
            reliably beat Button's own unconditional inline-flex (established this round). */}
        <div className="mt-base hidden tablet:block">
          <Button variant="primary" disabled>
            Start baking
          </Button>
        </div>
      </div>
      <Skeleton className="mt-lg h-touch-min w-full desktop:mt-xl" />
      <RecipeBodySkeleton />
      <div
        data-action-bar
        className="z-20 flex max-tablet:pin-bottom gap-sm bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:hidden"
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
