import type { Metadata } from "next";
import { ImportView } from "@/components/import/ImportView";
import { getImportKeyCreatedAt } from "@/lib/data/actions";
import type { SetupReason } from "@/lib/data/import";
import { getRecipes } from "@/lib/data/recipes";

export const metadata: Metadata = { title: "Import from a reel" };

const SETUP_REASONS: SetupReason[] = ["no-key", "bad-key"];

// SKELETON: ?url= prefills the link and starts the import (the iOS Shortcut opens
// this); ?error=no-key|bad-key opens Set up the Shortcut (BONES-import "Setup needed").
export default async function ImportPage({ searchParams }: { searchParams: Promise<{ url?: string; error?: string }> }) {
  const params = await searchParams;
  const url = params.url ?? "";
  const setupReason = SETUP_REASONS.find((r) => r === params.error) ?? null;
  // BONES: Set up the Shortcut stays open until the first import succeeds.
  const [importedBefore, importKeyCreatedAt] = await Promise.all([getRecipes().then((rs) => rs.some((r) => r.source)), getImportKeyCreatedAt()]);
  return <ImportView key={url} initialUrl={url} importedBefore={importedBefore} setupReason={setupReason} importKeyCreatedAt={importKeyCreatedAt} />;
}
