import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES Loading: the Focus header and Step nav render; Current Step shows placeholders
// for the heading, 4 lines of text, and 2 ingredient rows.
export default function Loading() {
  return (
    <div aria-busy="true">
      <header>
        <div className="mx-auto flex min-h-3xl max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] items-center gap-sm px-(--gutter)">
          <Skeleton className="h-base w-2xl" />
          <Skeleton className="mx-auto h-base w-1/3" />
          <Skeleton className="h-base w-xl" />
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] px-(--gutter) pt-lg tablet:pt-xl">
        <p role="status" className="sr-only">
          Loading recipe
        </p>
        <div className="tablet:grid tablet:grid-cols-8 tablet:gap-x-(--gutter) desktop:grid-cols-12">
          <div className="flex flex-col gap-sm tablet:col-span-5 desktop:col-span-8">
            <Skeleton className="h-lg w-1/4" />
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className={i === 3 ? "h-lg w-1/2" : "h-lg w-full"} />
            ))}
            <Skeleton className="mt-lg h-base w-1/4" />
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-touch-min w-full" />
            ))}
          </div>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 bg-canvas shadow-bar">
        <div className="mx-auto grid max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] grid-cols-3 gap-sm px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))]">
          <Button variant="primary" disabled className="col-span-3 min-h-touch-bake">
            Next step
          </Button>
        </div>
      </div>
    </div>
  );
}
