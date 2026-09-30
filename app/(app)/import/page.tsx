import type { Metadata } from "next";
import { ImportView } from "@/components/import/ImportView";
import { getRecipes } from "@/lib/data/recipes";

export const metadata: Metadata = { title: "Import from a reel" };

// SKELETON: ?url= prefills the link and starts the import (the iOS Shortcut opens this).
export default async function ImportPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const url = (await searchParams).url ?? "";
  // BONES: Share from Instagram stays open until the first import succeeds.
  const importedBefore = (await getRecipes()).some((r) => r.source);
  return <ImportView key={url} initialUrl={url} importedBefore={importedBefore} />;
}
