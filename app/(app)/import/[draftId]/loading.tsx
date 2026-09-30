import { EditorSkeleton } from "@/components/editor/EditorSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES Loading: source row, 3 check items, the Details fields, 6 ingredient rows, 4 steps.
export default function Loading() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading draft
      </p>
      <h1 className="type-display-md text-ink desktop:type-display-lg">Review import</h1>
      <Skeleton className="mt-xs h-base w-2xl" />
      <div className="mt-lg tablet:grid tablet:grid-cols-8 tablet:gap-x-(--gutter) desktop:mt-xl desktop:grid-cols-12">
        <div className="flex flex-col gap-lg tablet:col-span-3 desktop:col-span-4">
          <div className="flex items-center gap-md">
            <Skeleton className="aspect-[9/16] w-[calc(var(--spacing-2xl)+var(--spacing-sm))] rounded-md" />
            <Skeleton className="h-base w-1/2" />
          </div>
          <div className="flex flex-col gap-sm">
            <Skeleton className="h-lg w-1/2" />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-touch-min w-full" />
            ))}
          </div>
        </div>
        <div className="mt-lg tablet:col-span-5 tablet:mt-0 desktop:col-span-8">
          <EditorSkeleton />
        </div>
      </div>
    </div>
  );
}
