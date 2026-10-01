import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SharedRecipeView } from "@/components/shared/SharedRecipeView";
import { getSharedRecipe } from "@/lib/data/recipes";
import { parseScale } from "@/lib/format";

type Props = {
  params: Promise<{ shareToken: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getSharedRecipe((await params).shareToken);
  return { title: recipe?.title ?? "Link unavailable" };
}

export default async function SharedRecipePage({ params, searchParams }: Props) {
  const { shareToken } = await params;
  const recipe = await getSharedRecipe(shareToken);
  // Revoked, unknown, or its recipe deleted: one page that doesn't say which.
  if (!recipe) redirect("/r/expired");

  // BONES Invalid scale: render at 1× and correct the URL, no error shown.
  if (!parseScale((await searchParams).scale).valid) redirect(`/r/${encodeURIComponent(shareToken)}`);

  return <SharedRecipeView recipe={recipe} />;
}
