import { cookies } from "next/headers";
import { DRAFTS, LIBRARY_RECIPES, importedContent } from "@/lib/data/fixtures-library";
import { IMPORT_MS } from "@/lib/data/import";
import { RECIPES } from "@/lib/data/fixtures";
import type { Draft, Recipe } from "@/lib/data/types";

// The fixtures backend's store: fixture data held in server memory (development and
// Playwright only; see lib/backend/index.ts). Writes change it until the server restarts.
// - BACKERY_FIXTURE_DELAY_MS simulates latency, so Loading states can be seen.
// - BACKERY_FIXTURE_SET=empty | only-drafts switches to the Library's empty cases.
// - The backery_stub_fail_loads=1 cookie makes every load fail (the Error page).
// - The backery_fixture_ns cookie gives a browser its own copy of the fixtures, so
//   parallel Playwright tests can't see each other's writes.

export const FIXTURE_NS_COOKIE = "backery_fixture_ns";

export interface Db {
  recipes: Recipe[];
  drafts: Draft[];
}

const store = globalThis as typeof globalThis & { __backeryDb?: Map<string, Db> };
store.__backeryDb ??= new Map();

function seed(): Db {
  const set = process.env.BACKERY_FIXTURE_SET ?? "full";
  return structuredClone({
    recipes: set === "full" ? [...RECIPES, ...LIBRARY_RECIPES] : [],
    drafts: set === "empty" ? [] : DRAFTS,
  });
}

// STUB fault injection: with this cookie set, every data load fails, so the Error page
// can be seen and tested before there's a real server to fail.
const FAIL_LOADS_COOKIE = "backery_stub_fail_loads";

export async function db(): Promise<Db> {
  const jar = await cookies();
  if (jar.get(FAIL_LOADS_COOKIE)?.value === "1") throw new Error("Simulated load failure (backery_stub_fail_loads)");
  const ns = jar.get(FIXTURE_NS_COOKIE)?.value ?? "default";
  let found = store.__backeryDb!.get(ns);
  if (!found) {
    found = seed();
    store.__backeryDb!.set(ns, found);
  }
  completeImports(found);
  return found;
}

/** STUB import service: a started import is ready IMPORT_MS after it began. */
function completeImports(data: Db) {
  for (const d of data.drafts) {
    if (d.status === "importing" && d.startedAt && Date.now() - d.startedAt >= IMPORT_MS) {
      d.status = "ready";
      d.content = importedContent(d.reelUrl);
      d.title = d.content.title;
      d.caption = "Kouign-amann, the butteriest pastry in Brittany. Laminated dough, lots of sugar, caramelised edges.";
    }
  }
}

export async function simulatedLatency() {
  const ms = Number(process.env.BACKERY_FIXTURE_DELAY_MS ?? 0);
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}
