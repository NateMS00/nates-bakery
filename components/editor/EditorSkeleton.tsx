import { Skeleton } from "@/components/ui/Skeleton";

/** The Recipe Editor's placeholders: Details fields, 6 ingredient rows, 4 steps. */
export function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-base">
      <Skeleton className="h-lg w-1/3" />
      <div className="grid gap-base tablet:grid-cols-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={i === 0 ? "h-control-height tablet:col-span-2" : "h-control-height"} />
        ))}
      </div>
      <Skeleton className="mt-lg h-lg w-1/3" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex gap-sm">
          <Skeleton className="h-control-height flex-1" />
          <Skeleton className="h-control-height w-[calc(var(--spacing-3xl)*2)]" />
        </div>
      ))}
      <Skeleton className="mt-lg h-lg w-1/4" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-[96px] w-full" />
      ))}
    </div>
  );
}
