import type { Metadata } from "next";
import { ImportView } from "@/components/import/ImportView";
import { getImportKeyCreatedAt } from "@/lib/data/actions";
import { FAIL_MESSAGES, type FailReason, type LandingState, type SetupReason } from "@/lib/data/import";
import { getRecipes } from "@/lib/data/recipes";

export const metadata: Metadata = { title: "Import from a reel" };

const SETUP_REASONS: SetupReason[] = ["no-key", "bad-key"];
const FAIL_REASONS = Object.keys(FAIL_MESSAGES) as FailReason[];

type Params = { url?: string; error?: string; recipeId?: string; title?: string };

/**
 * The Shortcut's redirect back here (docs/shortcut-guide.md): ?error=private|deleted|
 * no-recipe|unavailable|limit&url=… for a failed import, or ?error=already&recipeId=
 * …&title=…&url=… for one already saved. Setup reasons (no-key, bad-key) are handled
 * separately, since they open Set up the Shortcut instead of the status area.
 */
function landingFrom(params: Params): LandingState | null {
  if (params.error === "already" && params.recipeId && params.title && params.url) {
    return { kind: "already", recipeId: params.recipeId, title: params.title, url: params.url };
  }
  const reason = FAIL_REASONS.find((r) => r === params.error);
  return reason && params.url ? { kind: "failed", reason, url: params.url } : null;
}

export default async function ImportPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const url = params.url ?? "";
  const setupReason = SETUP_REASONS.find((r) => r === params.error) ?? null;
  const landing = landingFrom(params);
  // BONES: Set up the Shortcut stays open until the first import succeeds.
  const [importedBefore, importKeyCreatedAt] = await Promise.all([getRecipes().then((rs) => rs.some((r) => r.source)), getImportKeyCreatedAt()]);
  return <ImportView key={url} initialUrl={url} landing={landing} importedBefore={importedBefore} setupReason={setupReason} importKeyCreatedAt={importKeyCreatedAt} />;
}
