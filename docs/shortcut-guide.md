# The Nate's Bakery import Shortcut

How to build the real Shortcut for SKELETON FLOW-01, on the iPhone (and the Mac, if
its Shortcuts app runs the same actions — see SKELETON's open assumption on that).
`docs/shortcut-prompt.txt` is the Use Model prompt one of these actions needs; this
file is everything around it. Nothing here is runnable code — it's a build guide for
the Shortcuts app.

## Actions, in order

1. **Receive input**: Instagram's share sheet (a reel or post URL) — the Shortcut's
   entry point — or a URL passed in when `/import` runs the same Shortcut on this
   device (SKELETON FLOW-01 entry).
2. **Get Contents of URL** (POST, JSON body `{"url": <the link>, "importKey": <the
   device's import key>}`) to the server's start-import endpoint.
   - Response is one of: `{"status": "started", "draftId": ..., "caption": ...}`,
     `{"status": "invalid"}`, `{"status": "already", "recipeId": ...}`,
     `{"status": "failed", "reason": "private" | "deleted" | "no-recipe"}`, or
     `{"status": "key-invalid"}`. Each maps to one of FLOW-01's alternate paths —
     branch on `status` and open the right URL (`/import`, `/import?setup=1`, the
     existing recipe, or do nothing and show the reason).
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
6. **Get Contents of URL** (POST, JSON body `{"draftId": ..., "reply": <the plain
   text from step 5>}`) to the server's finish-import endpoint.
   - If the server can't parse `reply` as the shape `docs/shortcut-prompt.txt` asks
     for, it responds `{"status": "retry"}` and this is the **first** such reply
     for this draft: go back to step 4 and run Use Model again on the same caption,
     then repeat step 5 and this step once. It does not loop — a second
     `{"status": "retry"}` for the same draft is actually `{"status": "failed"}`,
     because the server counts the retry per draft (SKELETON 1.4.5).
   - `{"status": "ready"}` → open `/import/:draftId` (FLOW-01 step 4's end).
   - `{"status": "failed"}` → open `/import/:draftId` anyway; the page itself shows
     "Couldn't finish" with Retry and Discard (FLOW-01's alternate path), since the
     draft already exists.

## Why the retry is server-side, not in the Shortcut

The Shortcut only ever retries once, by going back to step 4 a single time when
told to. It never decides on its own to retry, and never retries more than once —
the server is what counts attempts per draft, so a Shortcut that's interrupted and
rerun by the owner can't accidentally exceed one retry.

## Not yet wired up

The start- and finish-import endpoints above don't exist yet (PROGRESS.md: Import
is stubbed on fixtures). Build this Shortcut once they're live; until then,
`docs/shortcut-prompt.txt` is tested directly via `shortcuts run` against the
"Recipe test" Shortcut (Use Model only, no server calls), not this full flow.
