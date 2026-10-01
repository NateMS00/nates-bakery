import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BakeLogView } from "@/components/log/BakeLogView";
import { getRecipe } from "@/lib/data/recipes";

type Props = { params: Promise<{ recipeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipe((await params).recipeId);
  return { title: recipe ? `Bake log, ${recipe.title}` : "Recipe not found" };
}

export default async function BakeLogPage({ params }: Props) {
  const recipe = await getRecipe((await params).recipeId);
  if (!recipe) notFound();
  return <BakeLogView initial={recipe} />;
}
