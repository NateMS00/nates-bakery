import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewImport } from "@/components/import/ReviewImport";
import { getDraft } from "@/lib/data/recipes";

export const metadata: Metadata = { title: "Review import" };

export default async function ReviewImportPage({ params }: { params: Promise<{ draftId: string }> }) {
  const draft = await getDraft((await params).draftId);
  // SKELETON: unknown or already-saved draft → not-found. A draft still importing has
  // nothing to review yet, so it's treated the same until the import service exists.
  // "failed" ("Couldn't finish") is reviewable too, with an empty editor.
  if (!draft || (draft.status !== "ready" && draft.status !== "failed")) notFound();
  return <ReviewImport key={draft.id} draft={draft} />;
}
