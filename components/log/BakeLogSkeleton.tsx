import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES Loading: the Page header renders (the recipe title isn't known yet, so the
// back link is a placeholder), and Entries shows 3 placeholder entries in final
// proportions. Log a bake shows disabled.

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
          <h1 className="type-display-md text-ink desktop:type-display-lg">Bake log</h1>
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
            <Card>
              <Skeleton className="h-lg w-1/3" />
              <Skeleton className="mt-base h-md w-2xl" />
              <Skeleton className="mt-sm h-base w-full" />
              <Skeleton className="mt-xs h-base w-3/4" />
              {i < 2 && (
                <>
                  <Skeleton className="mt-base h-md w-3xl" />
                  <Skeleton className="mt-sm h-base w-5/6" />
                </>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
