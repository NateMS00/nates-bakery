import { expect, test } from "@playwright/test";
import { expireStaleImports } from "@/lib/backend/fixtures/data";
import type { Draft } from "@/lib/data/types";

// BONES-recipes.md 1.4.0: a draft stuck "importing" for more than 10 minutes turns
// into "failed" ("Couldn't finish"), mirroring expire_stale_drafts
// (supabase/migrations/0004_stale_drafts.sql). Run: npx playwright test --config playwright.unit.config.ts

const draft = (overrides: Partial<Draft>): Draft => ({
  id: "d-x",
  status: "importing",
  title: null,
  creatorHandle: "someone",
  reelUrl: "https://www.instagram.com/reel/Cx/",
  createdAt: new Date().toISOString(),
  ...overrides,
});

test("expireStaleImports: a draft importing for over 10 minutes becomes failed", () => {
  const stale = draft({ startedAt: Date.now() - 11 * 60 * 1000 });
  const drafts = [stale];
  expireStaleImports(drafts);
  expect(drafts[0].status).toBe("failed");
});

test("expireStaleImports: a draft within the 10-minute window stays importing", () => {
  const fresh = draft({ startedAt: Date.now() - 9 * 60 * 1000 });
  const drafts = [fresh];
  expireStaleImports(drafts);
  expect(drafts[0].status).toBe("importing");
});

test("expireStaleImports: falls back to createdAt when startedAt is unset", () => {
  const oldCreated = draft({ createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString() });
  const drafts = [oldCreated];
  expireStaleImports(drafts);
  expect(drafts[0].status).toBe("failed");
});

test("expireStaleImports: ready and failed drafts are left alone", () => {
  const ready = draft({ status: "ready", createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() });
  const failed = draft({ status: "failed", createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() });
  const drafts = [ready, failed];
  expireStaleImports(drafts);
  expect(drafts.map((d) => d.status)).toEqual(["ready", "failed"]);
});
