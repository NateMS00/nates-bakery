// SKELETON 1.4.0 / 1.4.1: the server's real caption fetch. Calls Apify's official
// Instagram scraper (apify/instagram-scraper) with the owner's own APIFY_TOKEN, kept
// in server settings and never sent to the device. Returns the reel's caption,
// creator handle, and a thumbnail image URL; audio and video are never downloaded
// (resultsType: "reels" with no transcript or video-download add-ons requested).
const ACTOR = "apify~instagram-scraper";

export type FetchedReel = {
  caption: string | null;
  creatorHandle: string | null;
  thumbnailUrl: string | null;
};

export async function fetchReel(url: string): Promise<FetchedReel> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not set");

  const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?resultsType=reels`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ directUrls: [url], resultsLimit: 1 }),
  });
  if (!res.ok) throw new Error(`Apify returned ${res.status}: ${await res.text()}`);

  const items = (await res.json()) as Array<Record<string, unknown>>;
  const item = items[0];
  if (!item) throw new Error("Apify returned no result for this reel");
  if (typeof item.error === "string") throw new Error(`Apify: ${item.error}${item.errorDescription ? ` — ${item.errorDescription}` : ""}`);

  return {
    caption: typeof item.caption === "string" ? item.caption : null,
    creatorHandle: typeof item.ownerUsername === "string" ? item.ownerUsername : null,
    thumbnailUrl: typeof item.displayUrl === "string" ? item.displayUrl : null,
  };
}
