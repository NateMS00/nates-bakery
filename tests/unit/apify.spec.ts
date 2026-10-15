import { expect, test } from "@playwright/test";
import { fetchReel } from "@/lib/import/apify";

// lib/import/apify.ts: the server's real caption fetch, run-sync against Apify's
// official Instagram scraper. Fakes the HTTP response so these never spend real
// Apify credit. Run: npx playwright test --config playwright.unit.config.ts

test.beforeEach(() => {
  process.env.APIFY_TOKEN = "test-token";
});

test.afterEach(() => {
  delete process.env.APIFY_TOKEN;
  // @ts-expect-error restoring the un-mocked global
  delete global.fetch;
});

function fakeFetch(status: number, body: unknown) {
  global.fetch = (async () =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    }) as Response) as typeof fetch;
}

test("fetchReel: a successful reel returns its caption, creator handle, and thumbnail", async () => {
  fakeFetch(200, [{ caption: "Torta tres leches 🍰", ownerUsername: "mfr_rdgz", displayUrl: "https://instagram.fna/thumb.jpg" }]);
  const result = await fetchReel("https://www.instagram.com/reel/DVeTim4jtSQ/");
  expect(result).toEqual({ caption: "Torta tres leches 🍰", creatorHandle: "mfr_rdgz", thumbnailUrl: "https://instagram.fna/thumb.jpg" });
});

test("fetchReel: a private or deleted reel throws Apify's own error", async () => {
  fakeFetch(200, [{ error: "no_items", errorDescription: "This account is private." }]);
  await expect(fetchReel("https://www.instagram.com/reel/Cprivate42/")).rejects.toThrow(/no_items.*This account is private\./);
});

test("fetchReel: out of credit (or any failed run) throws with Apify's status", async () => {
  fakeFetch(402, { error: { type: "usage-hard-limit-exceeded", message: "Monthly usage hard limit exceeded." } });
  await expect(fetchReel("https://www.instagram.com/reel/DVeTim4jtSQ/")).rejects.toThrow(/Apify returned 402/);
});
