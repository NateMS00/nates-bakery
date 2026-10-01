# SKELETON: Nate’s Bakery

> **Product Goal**: Turn a baking reel into a gram-precise recipe that Nathan can bake from and refine with every bake.
> **Product Type**: Personal web app (React, mobile-first), single owner with read-only recipe sharing
> **Primary Persona**: Nathan, a home baker on iPhone who finds recipes in Instagram reels, weighs everything on a scale, and wants to remember what he changed last time
> **Version**: 1.3.3 · **Updated**: 2026-10-01

---

## 1. ROLES & ACCESS

| Role | Who | Default landing |
|---|---|---|
| Guest | Unauthenticated visitor | `/login` |
| Owner | Nathan, the only account | `/recipes` |
| Friend | Someone Nathan sent a share link to; no account | `/r/:shareToken` |

**Access levels**: `public` (anyone), `guest-only` (signed-in owner redirects to `/recipes`), `owner` (requires the owner session), `share-token` (public, gated by a valid share token).

---

## 2. SITEMAP

```text
/
├── /login
├── /forgot-password
├── /reset-password
├── /recipes
│   ├── /recipes/new
│   └── /recipes/:recipeId
│       ├── /recipes/:recipeId/edit
│       ├── /recipes/:recipeId/bake
│       └── /recipes/:recipeId/log
├── /import
│   └── /import/:draftId
├── /r/:shareToken
├── /r/expired
├── /privacy
└── (system) not-found, error
```

---

## 3. ROUTE MAP

### Root

- `/` - **Root redirect**
  - Goal: Send the owner to `/recipes` and everyone else to `/login`. Has no content of its own.
  - Access: public

### Auth

Default access: guest-only; a signed-in owner → `/recipes`.

- `/login` - **Sign In**
  - Goal: Let the owner sign in and continue to the page they asked for (`?next=`).
- `/forgot-password` - **Forgot Password**
  - Goal: Send a reset link to the owner's email.
- `/reset-password` - **Reset Password**
  - Goal: Set a new password from an emailed link.
  - Params: `?token=` is a single-use reset token; expired or invalid → `/forgot-password` with a notice
  - Entry: password reset email only

### App

Default access: owner; signed-out → `/login?next=` plus the requested path (including its query, so a shared `?url=` survives sign-in).

- `/recipes` - **Library**
  - Goal: Find a saved recipe fast (by name, category, baked status, favorite, or rating) and pick up unfinished imports.
  - Params: `?q=` search text; `?category=` one category slug (`bread`, `cake`…); `?status=baked` or `?status=not-baked`; `?favorite=1`; `?rating=` minimum rating 1–5. All combine; invalid values are ignored.
- `/import` - **Import**
  - Goal: Turn a reel link into a recipe draft in as few taps as possible.
  - Params: `?url=` prefills the link and starts the import automatically
  - Entry: also the iOS Shortcut in Instagram's share menu, which opens `/import?url=<reel link>`
- `/import/:draftId` - **Review Import**
  - Goal: Check what the extraction guessed, fix it, and save it as a recipe.
  - Params: `:draftId` identifies an unsaved import; unknown or already-saved ID → not-found
- `/recipes/new` - **New Recipe**
  - Goal: Enter a recipe by hand when there is no reel or the import failed.
  - Params: `?source=` prefills the source link after a failed import
- `/recipes/:recipeId` - **Recipe**
  - Goal: Show the recipe in grams at the chosen scale, with its source credit, rating, and latest bake; start a bake or mark one as done.
  - Params: `:recipeId` identifies a saved recipe; unknown → not-found. `?scale=` is the batch multiplier (default 1).
- `/recipes/:recipeId/edit` - **Edit Recipe**
  - Goal: Correct amounts, steps, or details, including confirming Estimated amounts.
- `/recipes/:recipeId/bake` - **Bake Mode**
  - Goal: Follow the recipe step by step from a distance, with timers, without losing your place.
  - Params: `?scale=` carried from Recipe; `?step=` is the current step (default 1), so a refresh keeps your place
- `/recipes/:recipeId/log` - **Bake Log**
  - Goal: Record what changed and how each bake turned out, so the next bake is better.
  - Params: `?new=1` opens the new entry form; `?edit=<entryId>` opens that entry's form (an unknown id opens the log and drops the param, no error)

### Share

Default access: share-token; revoked, unknown, or deleted-recipe token → `/r/expired`.

- `/r/:shareToken` - **Shared Recipe**
  - Goal: Let a friend read and scale one recipe without an account.
  - Params: `:shareToken` is a revocable token for one recipe; `?scale=` works as on Recipe
  - Entry: a link Nathan sends
- `/r/expired` - **Link Unavailable**
  - Goal: Tell the friend the link no longer works, without revealing whether the recipe exists.
  - Access: public

### System

Default access: public.

- `/privacy` - **Privacy**
  - Goal: State what the app stores (owner email, recipes, source links, notification subscription) and what share links expose.
- not-found - **Not Found**
  - Goal: Handle unknown routes and unknown `:recipeId` or `:draftId` values; links to `/recipes` when signed in, otherwise `/login`.
- error - **Error**
  - Goal: Recover from unexpected failures, with a retry and a link back.

---

## 4. NAVIGATION

- **Primary** (owner): `/recipes`, `/import`
- **Utility** (owner): account menu with Timer alerts (opens the Timer alerts sheet), Sign out (ends the session → `/login`), and `/privacy`
- **Footer**: `/privacy`
- **Contextual**:
  - Library → recipe (`/recipes/:recipeId`) and draft (`/import/:draftId`)  - Recipe → Bake Mode (keeping `?scale=`), Bake Log, Edit, Share dialog, and the original reel (external)
  - Bake Mode → Exit returns to Recipe (keeping `?scale=`); Finish → `/recipes/:recipeId/log?new=1`
  - Import error → New Recipe (`/recipes/new?source=`)
  - Shared Recipe → the original reel (external) only; no links into the owner area
- Bake Mode is a focused route: primary and utility navigation are not available there.

---

## 5. KEY USER FLOWS

### FLOW-01: Reel to saved recipe
- **Role**: Owner
- **Entry**: An Instagram reel on iPhone, shared through the iOS Shortcut, or a link pasted on `/import`
- **Success**: The recipe is saved in grams with its source credit; owner lands on `/recipes/:recipeId`

1. Owner shares the reel to the Shortcut → `/import?url=<reel link>`.
2. System confirms the session and starts the import automatically.
3. System reads the caption, on-screen text, and audio; extracts title, yield, ingredients, and steps; converts volume amounts to grams → `/import/:draftId`.
4. Owner reviews the items marked **Estimated** (the reel never gave the amount) or **Converted** (given in volume, converted to grams), and fills in any **Missing** amounts.
5. Owner saves → `/recipes/:recipeId`.

**Alternate paths**
- Signed out at step 2 → `/login?next=/import?url=<reel link>`; after sign-in the import starts.
- Pasted link is not an Instagram reel or post at step 1 → inline error on `/import`; nothing is imported.
- Reel is private, deleted, or has no recipe at step 3 → error on `/import` with "Enter it manually" → `/recipes/new?source=<reel link>`.
- Reel was already imported at step 2 → notice on `/import` linking the existing `/recipes/:recipeId`, with the option to import again.
- Owner leaves during step 3 → the import finishes in the background and the draft appears under Drafts on `/recipes`.
- Owner leaves `/import/:draftId` without saving → the draft stays under Drafts on `/recipes`.
- Owner discards the draft at step 4 → draft deleted → `/recipes`.
- Any ingredient still Missing at step 5 → save is blocked until it has an amount or is marked "to taste".

### FLOW-02: Bake and log it
- **Role**: Owner
- **Entry**: `/recipes/:recipeId`
- **Success**: A bake log entry is saved with the scale used; owner lands on `/recipes/:recipeId/log`

1. Owner sets the scale on `/recipes/:recipeId` (`?scale=1.5`).
2. Owner starts baking → `/recipes/:recipeId/bake?scale=1.5&step=1`.
3. Owner moves through the steps and taps detected times ("bake 25 minutes") to start timers.
4. Owner finishes the last step → `/recipes/:recipeId/log?new=1`, with the date and scale prefilled.
5. Owner optionally writes what changed and how it turned out, and saves → `/recipes/:recipeId/log`. The recipe now counts as Baked.
6. System offers to set or update the recipe's rating; owner rates or skips.

**Alternate paths**
- Owner baked without the app → "Mark as baked" on `/recipes/:recipeId` saves an entry with today's date and the current scale, no notes; the recipe counts as Baked, the rating prompt appears if the recipe is unrated, and an Undo is offered. Notes can be added later on `/recipes/:recipeId/log`.
- Recipe still has Estimated amounts at step 2 → notice at the start of Bake Mode; baking can continue.
- Owner exits Bake Mode with a timer running → confirmation; confirming stops the timers → `/recipes/:recipeId`.
- Owner skips the log at step 4 → form dismissed → `/recipes/:recipeId`.
- Owner logs a bake without Bake Mode → New entry on `/recipes/:recipeId/log`, same as steps 4–5.

### FLOW-03: Share a recipe with a friend
- **Role**: Owner → Friend
- **Entry**: `/recipes/:recipeId`
- **Success**: The friend reads the recipe on `/r/:shareToken`

1. Owner opens the Share dialog on `/recipes/:recipeId`.
2. System creates the recipe's share link (or shows the existing one); owner copies it.
3. Friend opens the link → `/r/:shareToken`, read-only, and can change the scale.

**Alternate paths**
- Owner revokes the link in the Share dialog → the friend lands on `/r/expired`; sharing again creates a new link.
- Owner deletes the recipe → its link leads to `/r/expired`.

### FLOW-04: Sign in and recover access
- **Role**: Guest → Owner
- **Entry**: Any owner route while signed out
- **Success**: Owner lands on the requested path, or `/recipes`

1. Guest opens an owner route → `/login?next=<path>`.
2. Guest signs in → the `next` path, or `/recipes`.

**Alternate paths**
- Wrong email or password at step 2 → inline error on `/login`.
- Forgotten password → `/forgot-password` → reset email → `/reset-password?token=` → `/login` with a "password updated" notice.
- Expired or used reset token → `/forgot-password` with a notice.

### FLOW-05: Turn on timer alerts
- **Role**: Owner
- **Entry**: The Timer alerts card in Bake Mode, or Timer alerts in the account menu
- **Success**: Timers alert on the iPhone even when it's locked or another app is open

1. Owner opens Timer alerts → the Timer alerts sheet.
2. If Nate’s Bakery isn't running from the Home Screen, the sheet shows how to add it (Share → Add to Home Screen) and to open Nate’s Bakery from the new icon.
3. Owner opens Nate’s Bakery from the Home Screen and returns to Timer alerts → "Turn on alerts".
4. System asks for notification permission; owner allows it.
5. From then on, every timer started in Bake Mode also schedules an alert for its end time.

**Alternate paths**
- Owner denies permission at step 4 → the sheet explains how to allow it later in the phone's settings; timers still alert while Bake Mode is on screen.
- Owner dismisses the Bake Mode card → it doesn't show again; Timer alerts stays in the account menu.
- A timer is paused or cleared → its scheduled alert is cancelled or moved.

---

## 6. PAGE SPECIFICATIONS

### `/recipes` (Library)
- **Primary Action**: Import from a reel → `/import`
- **Section Stack** (order = priority):
  1. `Search`: search by recipe title and ingredient (`?q=`).
  2. `Filters`: Category (`?category=`), Status (All, Baked, Not baked yet: `?status=`), Favorites (`?favorite=1`), and minimum rating (`?rating=`); shows which filters are active and a Clear filters action. Categories with no recipes are not offered.
  3. `Drafts`: unsaved imports, each linking to `/import/:draftId`; shown only when drafts exist and no filter is active.
  4. `Recipes`: every recipe matching search and filters, most recently baked or added first; each shows its category, favorite mark, rating (or unrated), and last-baked date (or "Not baked yet").
- **States**: Empty (no recipes) → the page reduces to a prompt to import the first reel, with how to set up the Shortcut. No results (search or filters match nothing) → message plus Clear search and Clear filters actions.

### `/import` (Import)
- **Primary Action**: Import → `/import/:draftId`
- **Section Stack**:
  1. `Reel Link`: the link field, prefilled from `?url=`, and the Import action.
  2. `Share from Instagram`: one-time setup for the iOS Shortcut, and how to use it.
  3. `Manual Entry`: a link to `/recipes/new` for recipes without a reel.
- **States**: Processing (import running; leaving is safe). Invalid link, Import failed (private, deleted, or no recipe found), Already imported, as in FLOW-01.

### `/import/:draftId` (Review Import)
- **Primary Action**: Save recipe → `/recipes/:recipeId`
- **Section Stack**:
  1. `Source`: the reel, creator handle, link to the original, and the reel's transcript (caption and spoken audio) for checking guesses without leaving the app.
  2. `Needs Your Check`: every Missing, Estimated, and Converted item, each jumping to its field.
  3. `Recipe Editor`: title, category (suggested by the extraction), yield, ingredients (grams, with the original stated amount kept for Converted items), and steps, with ingredients and steps sorted into component groups by the extraction.
- **Overlays**: Discard draft confirmation → `/recipes`.
- **States**: Save blocked while any ingredient is Missing. Nothing flagged → `Needs Your Check` reduces to one line.

### Recipe editor template (`/recipes/new`, `/recipes/:recipeId/edit`)
- **Primary Action**: Save → `/recipes/:recipeId`
- **Section Stack**:
  1. `Details`: title, category (required, one per recipe), yield, total time, source link (prefilled from `?source=` on New).
  2. `Ingredients`: name, amount in grams, and the Estimated or Converted marker until the owner confirms it; optionally sorted into component groups.
  3. `Steps`: ordered steps; times written in a step ("25 minutes") are detected for Bake Mode; each step lists the ingredients it uses (proposed by the importer, editable), which Bake Mode shows with that step; optionally sorted into the same component groups plus Assembly and Baking.
- **Overlays**: Delete recipe confirmation (Edit only) → `/recipes`; also ends the recipe's share link.
- **States**: Unsaved changes on leave → confirmation.
- **Categories**: a fixed list, one per recipe, used by the Library filter.
  - Bread (`bread`): lean and sourdough loaves, flatbreads, pizza dough
  - Viennoiserie (`viennoiserie`): croissants, brioche, pain au chocolat, enriched and laminated doughs
  - Quick bread (`quick-bread`): muffins, scones, banana bread, biscuits
  - Cake (`cake`): layer cakes, loaf cakes, cupcakes, cheesecakes
  - Cookie & bar (`cookie-bar`): cookies, brownies, blondies, shortbread
  - Pie & tart (`pie-tart`): sweet and savory pies, tarts, galettes, quiche
  - Pastry (`pastry`): choux, puff pastry, danishes, strudel
  - Dessert (`dessert`): mousses, custards, meringues, no-bake desserts
  - Other (`other`): anything that fits none of the above
- **Component groups**: a group is a named part of a bake. The editor suggests the common names below and accepts any other name; the importer uses the same list. A recipe with one component has no groups.
  - Breads and doughs: Preferment (poolish, biga), Starter (levain), Soaker, Dough, Butter block (for laminated doughs), Egg wash, Topping
  - Cakes: Batter, Sponge, Soaking syrup, Filling, Frosting, Buttercream, Ganache, Glaze, Decoration
  - Pies and tarts: Crust, Base (crumb base), Filling, Streusel, Topping
  - Creams and extras: Pastry cream, Custard, Curd, Meringue, Caramel, Icing
  - Steps only: Assembly, Baking, Finishing

### `/recipes/:recipeId` (Recipe)
- **Primary Action**: Start baking → `/recipes/:recipeId/bake?scale=`
- **Section Stack**:
  1. `Header`: category, title, favorite toggle, rating (1–5, set or changed in place, can be cleared), yield at the current scale, total time, and source credit (creator handle, link to the reel).
  2. `Scale`: the batch multiplier (`?scale=`); every amount updates.
  3. `Ingredients`: scaled grams, with Estimated and Converted markers, under component group headings when the recipe has them.
  4. `Steps`: numbered steps, under component group headings when the recipe has them.
  5. `Latest Bake`: the most recent log entry (date, scale, notes if any), a "Mark as baked" action, and a link to `/recipes/:recipeId/log`.
- **Overlays**: Share dialog (create or copy the link, revoke it). Rating prompt after Mark as baked.
- **States**: Has estimates → a notice pointing to Edit. Never baked → `Latest Bake` becomes a prompt to bake it, with Mark as baked.

### `/recipes/:recipeId/bake` (Bake Mode)
- **Primary Action**: Next step (Finish on the last step → `/recipes/:recipeId/log?new=1`)
- **Section Stack**:
  1. `Current Step`: the step text (`?step=`), with the scaled ingredients that step uses.
  2. `Timers`: timers started from detected times, running together; each can be paused or cleared.
  3. `All Ingredients`: the full scaled list as a checklist for weighing before starting.
- **Overlays**: Exit with running timers confirmation. Timer alerts sheet (FLOW-05).
- **States**: Timer finished → an alert that holds until dismissed. Has estimates → notice on step 1. Timer alerts off → a dismissible card offering FLOW-05, until alerts are on or the card is dismissed. The screen stays awake while this route is open.

### `/recipes/:recipeId/log` (Bake Log)
- **Primary Action**: Log a bake → `?new=1`
- **Section Stack**:
  1. `Entries`: every bake, newest first: date, scale used, and, when written, what changed and how it turned out.
- **Overlays**: New or edit entry form (`?new=1` for new, `?edit=<entryId>` to edit; only the date is required, and it can't be later than today in the owner's local time); Delete entry confirmation (deleting the last entry makes the recipe Not baked yet again); Rating prompt after a new entry is saved.
- **States**: Empty → a prompt to log the first bake.

### `/r/:shareToken` (Shared Recipe)
- **Primary Action**: Watch the original reel → external link (credit to the creator)
- **Section Stack**:
  1. `Header`: category, title, "Shared by Nate", Nathan's rating (read-only, hidden when unrated), source credit.
  2. `Scale`: the batch multiplier (`?scale=`).
  3. `Ingredients`: scaled grams under component groups, with Estimated markers so the friend knows which amounts are guesses.
  4. `Steps`: numbered steps under component groups.
- **States**: None beyond `/r/expired`. The bake log, favorite, edit, and share are never shown.

### `/login` (Sign In)
- **Primary Action**: Sign in → `?next=` path or `/recipes`
- **Section Stack**:
  1. `Sign In Form`: email, password, link to `/forgot-password`.
- **States**: Password updated notice (after a reset). There is no sign-up link.

---

## 7. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: React single-page web app, used in the browser and shareable by link (Nathan's choice).
- **Assumed**: An iOS Shortcut in Instagram's share menu opens `/import?url=`, because a Safari web app can't be a share target on iOS.
- **Assumed**: One owner account created outside the app, email and password; no public sign-up (option A).
- **Assumed**: The import runs on a server behind the owner login, so only Nathan can spend extraction costs.
- **Assumed**: Grams are the canonical unit. Volume amounts convert by ingredient density and are marked Converted with the original kept; amounts the reel never gave are marked Estimated until confirmed.
- **Assumed**: Imports auto-start from `?url=`, run in the background, and persist as drafts until saved or discarded.
- **Assumed**: Scaling is a multiplier kept in the URL and carried into Bake Mode and the log entry.
- **Assumed**: One revocable share link per recipe. Friends can read and scale but never see the bake log.
- **Assumed**: A bake log entry holds date, scale used, what changed, and how it turned out; only the date is required, so marking a bake takes one tap.
- **Assumed**: Baked is derived, not stored: a recipe is Baked when its log has at least one entry. There is no separate "done" checkbox, so status and log can't disagree (discussed with Nathan).
- **Assumed**: One rating per recipe (1–5), not per bake; the app offers to update it after each bake.
- **Assumed**: Favorite is separate from rating (a go-to recipe isn't always the top-rated one) and is private: friends see the rating, not the favorite.
- **Assumed**: The rating filter means "this many stars or more"; unrated recipes only appear when no rating filter is set.
- **Assumed**: Timer alerts on a locked iPhone use web notifications, which iOS only allows for web apps opened from the Home Screen. Because the page is paused when the phone locks, the server schedules each alert from the timer's end time; timers are therefore saved on the server, not only on the device.
- **Assumed**: Each step links to the ingredients it uses; the importer proposes the links and the owner can change them in the editor.
- **Assumed**: Ingredient groups and step groups are separate lists that often share names ("Crust" in both; "Baking" only in steps). Each ingredient and each step belongs to at most one group of its own list; "Add step group" offers the recipe's ingredient group names first, then Assembly, Baking, and Finishing.
- **Assumed**: Yield is stored as a quantity plus a unit in singular and plural ("1 loaf", "2 loaves"). When scaled, counts round to whole numbers and read "about" when rounding changed the value ("about 16 tarts" at 1.3×).
- **Assumed**: A step can contain several detected times ("bake 25 minutes, then rest 10 minutes"); each becomes its own timer in Bake Mode.
- **Assumed**: "To taste" is an amount state, not a marker; it never blocks saving and is never flagged in Needs Your Check.
- **Assumed**: Component groups use a suggested list covering breads, cakes, pies and tarts, and creams, but accept any name.
- **Assumed**: Every imported recipe keeps the creator handle and reel link, including on shared pages.
- **Open**: Scale by pan size or servings, not just a multiplier? This would change the Scale section.
- **Open**: Photos on recipes (reel thumbnail) or on bake log entries?
- **Assumed**: One category per recipe from a fixed list of nine, required on save and suggested by the importer; the Library filter picks one category at a time.
- **Open**: Custom categories, or more than one category per recipe? The fixed list keeps filters clean; revisit if many recipes land in Other.
- **Open**: Should friends get Bake Mode on shared recipes?
- **Open**: Moving to friend accounts later (option B) would add sign-up and a library per person.

---

## CHANGE LOG

- 1.3.3 (2026-10-01): App renamed to Nate’s Bakery; shared pages read "Shared by Nate".
- 1.3.2 (2026-09-30): Bake Log gains `?edit=<entryId>` so Add notes and Edit open the entry form in one tap; log dates can't be in the future (owner's local date).
- 1.3.1 (2026-09-29): Recorded data decisions from the build kickoff: separate ingredient and step groups, structured yield with rounding, several timers per step, "to taste" as an amount state.
- 1.3.0 (2026-09-29): Added FLOW-05 Turn on timer alerts (Home Screen web app + notifications), Timer alerts in the account menu, and ingredients linked to each step.
- 1.2.1 (2026-09-29): Review Import's Source now includes the reel transcript.
- 1.2.0 (2026-09-29): Added recipe categories and the Library category filter.
- 1.1.0 (2026-09-29): Added Library filters (status, favorites, rating), recipe favorite and rating, Mark as baked, optional log notes, and component groups for ingredients and steps.
- 1.0.0 (2026-09-29): Initial skeleton.
