import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeFormPage } from "@/components/editor/RecipeFormPage";
import { fromRecipe } from "@/lib/data/editor";
import { getRecipe } from "@/lib/data/recipes";

type Props = { params: Promise<{ recipeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipe((await params).recipeId);
  return { title: recipe ? `Edit ${recipe.title}` : "Recipe not found" };
}

export default async function EditRecipePage({ params }: Props) {
  const recipe = await getRecipe((await params).recipeId);
  if (!recipe) notFound();
  return <RecipeFormPage key={recipe.id} mode="edit" initial={fromRecipe(recipe)} recipeId={recipe.id} recipeTitle={recipe.title} />;
}
