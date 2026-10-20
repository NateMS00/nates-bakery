import { Skeleton } from "@/components/ui/Skeleton";

// BONES-bakes.md 1.2.0 Loading: title renders; one month heading and 5
// placeholder rows in final proportions. The summary waits for the count.

export function BakesSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
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
        <ul className="mt-base flex flex-col gap-sm">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex items-center gap-md rounded-tile border border-outline p-sm">
              <Skeleton className="size-[72px] shrink-0 rounded-md tablet:size-[88px]" />
              <div className="flex flex-1 flex-col gap-xs">
                <Skeleton className={`h-md ${i % 2 ? "w-2/5" : "w-3/5"}`} />
                <Skeleton className="h-sm w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
