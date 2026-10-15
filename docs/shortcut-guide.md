# The Nate's Bakery import Shortcut

How to build the real Shortcut for SKELETON FLOW-01, on the iPhone (and the Mac, if
its Shortcuts app runs the same actions — see SKELETON's open assumption on that).
`docs/shortcut-prompt.txt` is the Use Model prompt one action below needs; this file
is everything around it — every action in order, the exact name to give the Shortcut,
where the prompt goes, and how to test each piece before wiring it all together.
Nothing here is runnable code: build it by hand in the Shortcuts app.

`/api/import/start` and `/api/import/finish` (`app/api/import/`) are live against
whichever backend is active — real Apify and Supabase in production,
`BACKERY_BACKEND=fixtures` for local testing. Nothing on the server needs to change
before building this.

## 1. Name and Share Sheet setup

Create a new, empty Shortcut. Open its Details (ⓘ):

- **Rename it to** `Nate’s Bakery` **— with the curly apostrophe (U+2019), not a
  straight `'`.** Copy that heading's text and paste it into the rename field rather
  than typing it, so the character comes through exactly. This is the name Instagram's
  share sheet will show, what `/import` names in its run-shortcut link, and what step
  4 of Set up the Shortcut tells you to tap.
- **Use as Quick Action → Share Sheet**: on. **Accepted types**: URLs, Safari web
  pages, Text (Instagram's share sheet and `/import`'s hand-off can each present the
  link slightly differently; accepting all three means the Shortcut shows up either
  way).

## 2. The import key (paste it in, don't try to make the Shortcut ask for it)

One action near the top of the Shortcut, before anything else:

- **Text**: paste the import key here. Get one from `/import` → Set up the Shortcut →
  Create import key → Copy (the key is shown once; this is where you paste it). Name
  this action's output **Import Key** (tap the action, then the output chip, to rename
  the variable) so later steps can reference it by name.
- If you ever revoke and create a new one, come back to this one Text action and
  replace its content — that's the only place the key lives in the Shortcut.

(BONES-import's "the Shortcut asks for it the first time it runs" describes what the
*owner* experiences, not a specific Shortcuts mechanic — Shortcuts has no reliable
built-in way to ask once and remember an answer across separate runs without writing
a file to iCloud Drive and reading it back every time, which is more moving parts than
a key you'll only ever paste in twice: once now, once if you revoke it. A plain Text
action is simpler and just as correct.)

## 3. Actions, in order

1. **Receive input**: `Shortcut Input` — automatic, from the Share Sheet types above,
   or from the URL/text `/import` hands off via `shortcuts://run-shortcut`.
2. **Replace Text**: Find `#again`, Replace with (leave empty), In `Shortcut Input`.
   Rename the output **Reel URL**. "Import again" and "Couldn't finish" → Retry hand
   off the same reel link with `#again` appended
   (`…/reel/Ckouign99/#again`) so the Shortcut can tell the server to retry; Instagram
   itself never sends a link shaped that way, and `Replace Text` leaves an ordinary
   link completely unchanged when there's nothing to strip.
3. **If** `Shortcut Input` **contains** `#again`:
   - **Text**: `true`. Rename the output **Again**.
   **Otherwise**:
   - **Text**: `false`. Rename the output **Again**.
   **End If**
4. **If** `Import Key` **has any value**:
   *(it always will, once you've done step 2 above — this just guards against running
   the Shortcut before it's set up)*
   - **Get Contents of URL**: `https://nates-bakery.vercel.app/api/import/start`,
     Method **POST**, Headers `Content-Type: application/json`, Request Body **JSON**:
     `url` = `Reel URL`, `importKey` = `Import Key`, `again` = `Again`. **Set `again`'s
     field type to Boolean, not Text** — the server checks it with `=== true`, which a
     JSON string `"true"` fails silently. Rename the output **Start Response**.
   - **Get Dictionary Value**: `status`, from `Start Response`. Rename **Start Status**.
   - **If** `Start Status` is `started`: continue to step 5.
   - **If** `Start Status` is `invalid`: **Open URLs**
     `https://nates-bakery.vercel.app/import`.
   - **If** `Start Status` is `already`: **Get Dictionary Value** `recipeId` and
     `title` from `Start Response`, then **Open URLs**
     `https://nates-bakery.vercel.app/import?error=already&recipeId=<recipeId>&title=<title>&url=<Reel URL>`
     (use **URL Encode** on `title` and `Reel URL` before building this — titles and
     links can contain spaces and symbols).
   - **If** `Start Status` is `ready`: **Get Dictionary Value** `draftId` from
     `Start Response`, then **Open URLs**
     `https://nates-bakery.vercel.app/import/<draftId>`. Stop here — don't run Use
     Model again; the recipe's already been read.
   - **If** `Start Status` is `limit`: **Open URLs**
     `https://nates-bakery.vercel.app/import?error=limit&url=<Reel URL>`.
   - **If** `Start Status` is `failed`: **Get Dictionary Value** `reason` from
     `Start Response`, then **Open URLs**
     `https://nates-bakery.vercel.app/import?error=<reason>&url=<Reel URL>`.
   - **If** `Start Status` is `key-invalid`: **Open URLs**
     `https://nates-bakery.vercel.app/import?error=bad-key`.
   **Otherwise** *(no import key pasted in yet)*:
   - **Open URLs**: `https://nates-bakery.vercel.app/import?error=no-key`.
   **End If**
5. **Text**: paste the full contents of `docs/shortcut-prompt.txt` here, then put the
   cursor at the end and insert the `caption` value from `Start Response` (**Get
   Dictionary Value** `caption`, then drag that variable in) right after it, in one
   continuous block of text. This Text action's output is the full Use Model input —
   the prompt's instructions followed immediately by the reel's caption.
6. **Use Model**: Input = the Text action from step 5. (Apple Intelligence, Private
   Cloud Compute — a Siri/Apple Intelligence Shortcuts action, separate from plain
   "Dictate Text" or "Ask for Input".) This produces **Rich Text**, not plain text.
7. **Get Text from Input**, Input = the Use Model result, set to **Plain Text**. **Do
   this even when the reply already looks like plain JSON.** Skipping it was round 1's
   actual bug (saving with TextEdit instead of this action), and it produces
   `{\rtf1\ansi...\{"language"...` on the server every single time, not just on the
   rare bad reply step 8 below is for.
8. **Get Contents of URL**: `https://nates-bakery.vercel.app/api/import/finish`,
   Method **POST**, Headers `Content-Type: application/json`, Request Body **JSON**:
   `draftId` = the `draftId` from `Start Response` (step 4), `importKey` = `Import
   Key`, `reply` = the plain text from step 7. Rename the output **Finish Response**.
9. **Get Dictionary Value**: `status`, from `Finish Response`. Rename **Finish
   Status**.
   - **If** `Finish Status` is `retry` **and this is the first retry for this run**
     *(a Shortcuts variable set to `false` before step 6 and to `true` right after
     this branch runs once — check it here so a second `retry` doesn't loop)*: go
     back to step 6 and run Use Model again on the same Text from step 5, then repeat
     steps 7–9 once more.
   - **If** `Finish Status` is `ready` **or** `no-recipe` **or** `failed` (including a
     second `retry`, which the server already treats as `failed`): **Get Dictionary
     Value** `draftId` from `Start Response`, then:
     - `ready` → **Open URLs** `https://nates-bakery.vercel.app/import/<draftId>`.
     - `no-recipe` → **Open URLs**
       `https://nates-bakery.vercel.app/import?error=no-recipe&url=<Reel URL>` (the
       draft is already gone server-side; don't open `/import/<draftId>`).
     - `failed` → **Open URLs** `https://nates-bakery.vercel.app/import/<draftId>`
       anyway — the page itself shows "Couldn't finish" with Retry and Discard, since
       the draft still exists.

## Why the retry is server-side, not in the Shortcut

The Shortcut only ever retries once, by going back to step 6 a single time when
told to. It never decides on its own to retry, and never retries more than once —
the server is what counts attempts per draft, so a Shortcut that's interrupted and
rerun by the owner can't accidentally exceed one retry.

## One thing to expect while testing: the page itself is still off

`/api/import/start` and `/api/import/finish` work right now, regardless of
`BACKERY_FEATURE_IMPORT` — they're not gated by it, only the browsable pages are
(`/import`, `/import/:draftId`). So every `Open URLs` action above will land on "Page
not found" until that flag goes on in production (item 13, not yet). That's expected,
not a bug in the Shortcut: the import itself — the Apify fetch, Apple Intelligence
reading it, the draft landing in the database — genuinely happens either way. Confirm
it worked by reading `Finish Status` in the Shortcut's own run result (Shortcuts shows
every variable when a run finishes), or by checking the `drafts` table in Supabase's
dashboard, until the flag is on and the page itself is reachable.

## Testing

Build and test in this order — each piece on its own before wiring the next, so a
failure points at one specific action instead of the whole chain.

1. **The prompt, alone.** `docs/shortcut-prompt.txt` only needs a Use Model action
   fed a caption; it doesn't need the network calls around it yet. This is exactly how
   round 1 and round 2 of the prompt were tested earlier (a separate "Recipe test"
   Shortcut, Use Model only): run it from the Shortcuts app with one of the captions in
   `tests/fixtures/captions/*.txt` pasted in, or from the terminal with
   `shortcuts run "Recipe test"` if you rebuild that same minimal version. Check the
   reply is valid JSON shaped like `docs/shortcut-prompt.txt` asks for.
2. **One `Get Contents of URL` action at a time**, before wiring the full chain. Build
   just through step 4 (the start-import call), then run the Shortcut by hand with a
   real reel link pasted as its input and look at the `Start Response` variable in the
   run's result — Shortcuts shows every variable's value when a run finishes, so you
   can confirm `status: "started"` and a real `caption` came back before adding
   anything after it.
3. **A deliberately wrong import key** (edit the Text action from section 2 to a few
   garbage characters, run it, then paste the real key back): `Start Status` should
   read `key-invalid` (the page it opens will 404 until the flag's on, per above —
   that's fine, the variable is the real signal for now).
4. **A reel you've already saved as a recipe**: `Start Status` should read `already`,
   with `recipeId` and `title` in `Start Response` matching that recipe.
5. **The full chain, end to end**: share a real reel from Instagram to the Shortcut
   (or run it with a reel link pasted in). `Finish Status` should read `ready`, and the
   `drafts` table in Supabase's dashboard should show that reel's row with
   `status = 'ready'` and a filled-in `content`. Once `BACKERY_FEATURE_IMPORT` is on
   (item 13), this is the run that lands on `/import/<draftId>` with the recipe read,
   grouped, and converted to grams.
6. **A second run of the same reel, right after**: exercises the "already read, skip
   Use Model" path — `Start Status` should read `ready` this time (not `started`), and
   the Shortcut should finish noticeably faster, since it never reaches step 5.
7. Before trusting it day to day, deliberately watch `/recipes` → Drafts for a reel
   whose caption is unusually long or oddly formatted, since those are the replies
   most likely to trip the retry path (step 9's first branch) — confirm the draft
   still arrives "Ready to review" after one retry, not "Couldn't finish".
