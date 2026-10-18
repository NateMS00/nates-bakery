import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES Loading: the Page header renders (the recipe title isn't known yet, so the
// back link is a placeholder), and Entries shows 3 placeholder entries in final
// proportions. Log a bake shows disabled. The loading state can't know yet whether
// the log is empty, so it always shows the non-empty header — the smaller jump,
// since most recipes with any traffic here have at least one bake.

export function BakeLogSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
      <p role="status" className="sr-only">
        Loading bakes
      </p>
      <div className="flex h-touch-min items-center">
        <Skeleton className="h-base w-[calc(var(--spacing-3xl)*3)]" />
      </div>
      <div className="mt-xs flex items-start justify-between gap-lg">
        <div>
          <h1 className="type-display-xl">
            Bake <span className="italic font-[family-name:var(--font-fraunces-italic)]">log.</span>
          </h1>
          <Skeleton className="mt-sm h-base w-2xl" />
        </div>
        <div
          data-action-bar
          className="z-20 max-tablet:pin-bottom bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:z-auto tablet:shrink-0 tablet:bg-transparent tablet:p-0 tablet:shadow-none"
        >
          <Button variant="primary" disabled className="w-full tablet:w-auto">
            Log a bake
          </Button>
        </div>
      </div>
      <ul role="list" className="mt-lg flex flex-col gap-md desktop:mt-xl">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <div className="rounded-tile border border-outline bg-canvas p-base">
              <div className="flex items-center justify-between gap-sm border-b border-outline py-sm">
                <Skeleton className="h-base w-3xl" />
                <Skeleton className="size-touch-min rounded-md" />
              </div>
              {i === 0 && (
                <>
                  <div className="border-b border-outline py-sm">
                    <Skeleton className="h-base w-[70px]" />
                  </div>
                  {/* Skeleton's own rounded-sm is close enough here (established elsewhere this round). */}
                  <Skeleton className="my-sm aspect-[4/3] w-full" />
                </>
              )}
              {i < 2 && (
                <>
                  <div className="border-b border-outline py-sm">
                    <Skeleton className="h-sm w-3xl" />
                    <Skeleton className="mt-xs h-base w-full" />
                    <Skeleton className="mt-[2px] h-base w-3/4" />
                  </div>
                  <div className="py-sm">
                    <Skeleton className="h-sm w-3xl" />
                    <Skeleton className="mt-xs h-base w-5/6" />
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
