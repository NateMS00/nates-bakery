import { NextResponse, type NextRequest } from "next/server";
import { dataBackend } from "@/lib/backend";
import { handleFinishImport } from "@/lib/import/server";

// docs/shortcut-guide.md step 6: the Shortcut's finish-import call, after Use Model.
// POST {draftId, importKey, reply} → one of FinishImportResponse's shapes
// (lib/data/import.ts). No session, same as start-import.

// Always HTTP 200 with the status in the body, even for a malformed request — see
// start/route.ts.
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as Record<string, unknown>).draftId !== "string" ||
    typeof (body as Record<string, unknown>).importKey !== "string" ||
    typeof (body as Record<string, unknown>).reply !== "string"
  ) {
    return NextResponse.json({ status: "failed" });
  }
  const { draftId, importKey, reply } = body as { draftId: string; importKey: string; reply: string };
  const backend = await dataBackend();
  const result = await handleFinishImport(backend, { draftId, importKey, reply });
  return NextResponse.json(result);
}
