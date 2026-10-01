import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES Loading: placeholders in final proportions (title block, scale row,
// 8 ingredient rows, 4 steps); Start baking shown disabled.

export function RecipeSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading recipe</p>
      <div className="grid grid-cols-[1fr_auto] gap-x-lg [grid-template-areas:'back_actions''title_title'] tablet:[grid-template-areas:'back_.''title_actions']">
        <Skeleton className="h-base w-3xl self-center [grid-area:back]" />
        <div className="flex h-touch-min items-center gap-xs self-center [grid-area:actions]">
          <Skeleton className="size-icon" />
          <Skeleton className="ml-lg size-icon" />
          <Skeleton className="ml-lg size-icon" />
          <div
            data-action-bar
            className="fixed inset-x-0 bottom-0 z-20 bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:ml-sm tablet:bg-transparent tablet:p-0 tablet:shadow-none"
          >
            <Button variant="primary" disabled className="w-full tablet:w-auto">
              Start baking
            </Button>
          </div>
        </div>
        <div className="[grid-area:title]">
          <Skeleton className="mt-sm h-md w-2xl" />
          <Skeleton className="mt-sm h-[34px] w-4/5 desktop:h-[44px]" />
          <Skeleton className="mt-base h-lg w-[calc(var(--spacing-touch-min)*5)]" />
          <Skeleton className="mt-base h-base w-1/2" />
          <Skeleton className="mt-sm h-base w-2/5" />
        </div>
      </div>

      <RecipeBodySkeleton />
    </div>
  );
}

/** Scale row, 8 ingredient rows, and 4 steps in the Recipe page's columns (also the shared page). */
export function RecipeBodySkeleton() {
  return (
    <div className="mt-lg tablet:grid tablet:grid-cols-8 tablet:gap-x-(--gutter) desktop:mt-xl desktop:grid-cols-12">
      <div className="tablet:col-span-3 desktop:col-span-4">
        <Skeleton className="h-lg w-1/3" />
        <Skeleton className="mt-sm h-touch-min w-full rounded-md" />
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
      <div className="mt-lg tablet:col-span-5 tablet:mt-0 desktop:col-span-8">
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
