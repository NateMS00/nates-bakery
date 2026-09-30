import type { Metadata } from "next";
import { connection } from "next/server";
import { LibraryView } from "@/components/library/LibraryView";
import { getDrafts, getRecipes } from "@/lib/data/recipes";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage() {
  await connection(); // fixtures are read per request (stands in for the backend)
  const [recipes, drafts] = await Promise.all([getRecipes(), getDrafts()]);
  return <LibraryView recipes={recipes} drafts={drafts} />;
}
