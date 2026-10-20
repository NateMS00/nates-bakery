import { Skeleton } from "@/components/ui/Skeleton";

// BONES-bakes.md Loading: title renders; one month heading and 4 placeholder tiles
// in final proportions. The summary ("N bakes this year") waits for the count.

export function BakesSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Loading bakes
      </p>
      <h1 className="type-display-md text-ink desktop:type-display-lg">
        Your <span className="italic font-[family-name:var(--font-fraunces-italic)]">bakes.</span>
      </h1>
      <div className="mt-lg desktop:mt-xl">
        <div className="flex items-baseline justify-between gap-base border-b border-primary pb-sm">
          <Skeleton className="h-2xl w-[9ch]" />
          <Skeleton className="h-md w-3xl" />
        </div>
        <ul className="mt-base grid grid-cols-2 gap-x-md gap-y-base tablet:grid-cols-3 desktop:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex flex-col gap-sm">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex flex-col gap-xs">
                <Skeleton className="h-md w-3/5" />
                <Skeleton className={`h-sm ${i % 2 ? "w-2/5" : "w-1/2"}`} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
