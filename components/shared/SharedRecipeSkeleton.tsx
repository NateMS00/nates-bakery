import { RecipeBodySkeleton } from "@/components/recipe/RecipeSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

// BONES-r-detail Loading: placeholders in final proportions: the header block (with
// Watch the original reel), then the scale row, 8 ingredient rows, and 4 steps.

export function SharedRecipeSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading recipe
      </p>
      <div className="tablet:grid tablet:grid-cols-8 tablet:items-center tablet:gap-x-(--gutter) desktop:grid-cols-12">
        <div className="tablet:col-span-5 desktop:col-span-9">
          <Skeleton className="h-md w-2xl" />
          <Skeleton className="mt-sm h-[34px] w-4/5 desktop:h-[44px]" />
          <Skeleton className="mt-base h-base w-1/2" />
          <Skeleton className="mt-sm h-base w-2/5" />
        </div>
        <Skeleton className="mt-base h-touch-min w-full rounded-md tablet:col-span-3 tablet:mt-0" />
      </div>
      <RecipeBodySkeleton />
    </div>
  );
}
