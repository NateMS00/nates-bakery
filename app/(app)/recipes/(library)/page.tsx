import type { Metadata } from "next";
import { connection } from "next/server";
import { LibraryView } from "@/components/library/LibraryView";
import { getDrafts, getRecipes } from "@/lib/data/recipes";
import { importEnabled } from "@/lib/features";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage() {
  await connection(); // fixtures are read per request (stands in for the backend)
  // Drafts only exist with the Import feature (lib/features.ts).
  const withImport = importEnabled();
  const [recipes, drafts] = await Promise.all([getRecipes(), withImport ? getDrafts() : []]);
  return <LibraryView recipes={recipes} drafts={drafts} importEnabled={withImport} />;
}
