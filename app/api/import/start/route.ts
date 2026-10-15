import { NextResponse, type NextRequest } from "next/server";
import { backendName, dataBackend } from "@/lib/backend";
import type { CaptionFetcher } from "@/lib/import/server";
import { handleStartImport } from "@/lib/import/server";

// docs/shortcut-guide.md step 2: the Shortcut's start-import call. POST
// {url, importKey, again?} → one of StartImportResponse's shapes (lib/data/import.ts).
// No session: the Shortcut authenticates with the owner's import key, in the body.

async function pickFetchCaption(): Promise<CaptionFetcher> {
  if (backendName() === "fixtures") return (await import("@/lib/backend/fixtures/data")).fixturesFetchCaption;
  return (await import("@/lib/import/apify")).fetchReel;
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).url !== "string" || typeof (body as Record<string, unknown>).importKey !== "string") {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }
  const { url, importKey, again } = body as { url: string; importKey: string; again?: unknown };
  const backend = await dataBackend();
  const fetchCaption = await pickFetchCaption();
  const result = await handleStartImport(backend, fetchCaption, { url, importKey, again: again === true });
  return NextResponse.json(result);
}
