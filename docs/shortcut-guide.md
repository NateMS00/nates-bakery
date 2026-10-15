# The Nate's Bakery import Shortcut

How to build the real Shortcut for SKELETON FLOW-01, on the iPhone (and the Mac, if
its Shortcuts app runs the same actions — see SKELETON's open assumption on that).
`docs/shortcut-prompt.txt` is the Use Model prompt one of these actions needs; this
file is everything around it. Nothing here is runnable code — it's a build guide for
the Shortcuts app.

**Name the Shortcut exactly** `Nate’s Bakery` **with the curly apostrophe (U+2019,
not a straight `'`)** — it's what Instagram's share sheet shows, what `/import` names
in its run-shortcut link, and what step 4 below tells you to tap. Copy it from this
file into the Shortcuts app's rename field rather than typing it, so the apostrophe
comes through as the right character.

## Actions, in order

1. **Receive input**: Instagram's share sheet (a reel or post URL) — the Shortcut's
   entry point — or a URL passed in when `/import` runs the same Shortcut on this
   device (SKELETON FLOW-01 entry). "Import again" and "Couldn't finish" → Retry use
   the same hand-off with the same reel link, but add `#again` to the end of it
   (`…/reel/Ckouign99/#again`) so step 2 knows to pass `again: true`. **Strip the
   `#again` suffix before using the link as the URL in step 2's body** — Instagram
   doesn't understand it.
2. **Get Contents of URL** (POST, JSON body `{"url": <the link, without #again>,
   "importKey": <the device's import key>, "again": <true if the input had #again,
   otherwise omit it>}`) to `/api/import/start`.
   - Response is one of:
     - `{"status": "started", "draftId": ..., "caption": ...}` — continue to step 3.
     - `{"status": "invalid"}` — the link wasn't a reel or post; open `/import`.
     - `{"status": "already", "recipeId": ..., "title": ...}` — open
       `/import?error=already&recipeId=<recipeId>&title=<title>&url=<the original link>`.
     - `{"status": "ready", "draftId": ...}` — a draft for this reel is already fully
       read (this happens on "Import again"/Retry when Apple Intelligence already
       produced a recipe for it). Skip straight to step 6's `{"status":"ready"}`
       handling: open `/import/<draftId>`. Don't run Use Model again.
     - `{"status": "limit"}` — 30 fetches already used in the last 24 hours; open
       `/import?error=limit&url=<the original link>`.
     - `{"status": "failed", "reason": "private" | "deleted" | "no-recipe" |
       "unavailable"}` — open `/import?error=<reason>&url=<the original link>`.
     - `{"status": "key-invalid"}` — open `/import?error=bad-key`.
   - No import key stored on the device at all → skip this whole call and open
     `/import?error=no-key` directly (SKELETON: "Shortcut not set up, or no import key
     on the device").
3. **Text**: build the Use Model input by joining `docs/shortcut-prompt.txt`
   (pasted in as one Text action) with the `caption` from step 2.
4. **Use Model** (Apple Intelligence, Private Cloud Compute): input is the Text from
   step 3. This produces **Rich Text**, not plain text — Shortcuts' own output type
   for a model reply.
5. **Get Text from Input**, set to plain text, on the Use Model result. **Do this
   before step 6 even when the reply looks like plain JSON already** — this is the
   step round 1 skipped by hand (saving with TextEdit instead), which is what
   produced the RTF-wrapped fixtures in `tests/fixtures/captions/*.json`. Skipping
   it in the real Shortcut would mean the server receives
   `{\rtf1\ansi...\{"language"...` instead of JSON, every single time, not just on
   the rare bad reply this guide's retry step is for.
6. **Get Contents of URL** (POST, JSON body `{"draftId": ..., "importKey": ...,
   "reply": <the plain text from step 5>}`) to `/api/import/finish`.
   - If the server can't parse `reply` as the shape `docs/shortcut-prompt.txt` asks
     for, it responds `{"status": "retry"}` and this is the **first** such reply
     for this draft: go back to step 4 and run Use Model again on the same caption
     (still held in this run's variables — no new call to step 2), then repeat step
     5 and this step once. It does not loop — a second `{"status": "retry"}` for the
     same draft is actually `{"status": "failed"}`, because the server counts the
     retry per draft (SKELETON 1.4.5).
   - `{"status": "ready"}` → open `/import/<draftId>` (FLOW-01 step 4's end).
   - `{"status": "no-recipe"}` → the caption had no recipe in it (the reel points to
     a website, or the recipe is only spoken); the draft is gone. Open
     `/import?error=no-recipe&url=<the original link>`, not `/import/<draftId>`.
   - `{"status": "failed"}` → open `/import/<draftId>` anyway; the page itself shows
     "Couldn't finish" with Retry and Discard (FLOW-01's alternate path), since the
     draft already exists.

## Why the retry is server-side, not in the Shortcut

The Shortcut only ever retries once, by going back to step 4 a single time when
told to. It never decides on its own to retry, and never retries more than once —
the server is what counts attempts per draft, so a Shortcut that's interrupted and
rerun by the owner can't accidentally exceed one retry.

## Built

`/api/import/start` and `/api/import/finish` (app/api/import/) are live against
whichever backend is active — real Apify and Supabase in production, a stand-in
caption and in-memory drafts under `BACKERY_BACKEND=fixtures`. Playwright simulates
the Shortcut's own calls by POSTing to these routes directly
(tests/visual/import.spec.ts), so the whole round trip is covered without a real
device. Build the actual Shortcut in the Shortcuts app whenever you're ready; nothing
here needs to change first.
