import { NextResponse, type NextRequest } from "next/server";
import { dataBackend } from "@/lib/backend";
import { handleFinishImport } from "@/lib/import/server";

// docs/shortcut-guide.md step 6: the Shortcut's finish-import call, after Use Model.
// POST {draftId, importKey, reply} → one of FinishImportResponse's shapes
// (lib/data/import.ts). No session, same as start-import.

// Always HTTP 200 with the status in the body, even for a malformed request — see
// start/route.ts.
export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const body: unknown = await request.json().catch(() => null);
  const rawDraftId = body && typeof body === "object" ? (body as Record<string, unknown>).draftId : undefined;
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as Record<string, unknown>).draftId !== "string" ||
    typeof (body as Record<string, unknown>).importKey !== "string" ||
    typeof (body as Record<string, unknown>).reply !== "string"
  ) {
    // draftId may still be usable even if another field in the body is wrong.
    const open = typeof rawDraftId === "string" ? new URL(`/import/${rawDraftId}`, origin).toString() : new URL("/import", origin).toString();
    return NextResponse.json({ status: "failed", open });
  }
  const { draftId, importKey, reply } = body as { draftId: string; importKey: string; reply: string };
  const backend = await dataBackend();
  const result = await handleFinishImport(backend, origin, { draftId, importKey, reply });
  return NextResponse.json(result);
}
