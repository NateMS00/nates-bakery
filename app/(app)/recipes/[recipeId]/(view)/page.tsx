import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RecipeView } from "@/components/recipe/RecipeView";
import { getRecipe } from "@/lib/data/recipes";
import { parseScale } from "@/lib/format";

type Props = {
  params: Promise<{ recipeId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipe((await params).recipeId);
  return { title: recipe?.title ?? "Recipe not found" };
}

export default async function RecipePage({ params, searchParams }: Props) {
  const { recipeId } = await params;
  const recipe = await getRecipe(recipeId);
  if (!recipe) notFound();

  // BONES Invalid scale: render at 1× and correct the URL, no error shown.
  if (!parseScale((await searchParams).scale).valid) redirect(`/recipes/${recipe.id}`);

  return <RecipeView initial={recipe} />;
}
