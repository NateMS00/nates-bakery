import type { Metadata } from "next";
import { RecipeFormPage } from "@/components/editor/RecipeFormPage";
import { emptyEditor } from "@/lib/data/editor";

export const metadata: Metadata = { title: "New recipe" };

// SKELETON: ?source= prefills the source link after a failed import.
export default async function NewRecipePage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const source = (await searchParams).source ?? "";
  return <RecipeFormPage mode="new" initial={emptyEditor(source)} />;
}
