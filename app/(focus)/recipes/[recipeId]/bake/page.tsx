import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BakeView } from "@/components/bake/BakeView";
import { getRecipe } from "@/lib/data/recipes";

type Props = { params: Promise<{ recipeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipe((await params).recipeId);
  return { title: recipe ? `Baking ${recipe.title}` : "Recipe not found" };
}

export default async function BakePage({ params }: Props) {
  const recipe = await getRecipe((await params).recipeId);
  if (!recipe || recipe.steps.length === 0) notFound();
  return <BakeView key={recipe.id} recipe={recipe} />;
}
