# BONES: `/import/:draftId` (Review Import)

> **Source**: SKELETON.md v1.5.0, `/import/:draftId`, and the Recipe editor template
> **Primary Action**: Save recipe → `/recipes/:recipeId`
> **Primary Device**: mobile, because imports start from Instagram's share menu on the iPhone and the review happens right after, on the same phone
> **Shell**: BONES-shell.md, App variant
> **Version**: 1.5.0 · **Updated**: 2026-10-15

This file also defines the **Recipe Editor** section used by `/recipes/new` and `/recipes/:recipeId/edit`. Their BONES files reference it instead of redrawing it.

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_HEADER
│   ├── PAGE_TITLE "Review import"          H1
│   ├── DRAFT_STATUS ("Draft saved")
│   └── DISCARD
├── SOURCE                                  H2, visually hidden
│   └── SOURCE_CARD
│       ├── REEL (9:16, play badge → reel)
│       ├── CREATOR_HANDLE
│       ├── CAPTION_PREVIEW (2 lines) → Read more
│       └── WATCH_REEL (external)
│   ├── CUT_OFF_NOTICE (when Instagram cut the caption)
│   └── ORIGINAL_CAPTION (expanded by Read more; "Translated from Spanish")
├── NEEDS_YOUR_CHECK                        H2 "Check 6 amounts"
│   ├── MISSING rows (need an amount)
│   ├── CHECK_ROW × n (estimated, converted; max 5, then Show n more)
│   └── THESE_LOOK_RIGHT
├── RECIPE_EDITOR                           H2
│   ├── DETAILS                             H3
│   ├── INGREDIENTS                         H3
│   │   └── GROUP (fieldset, legend = group name) × n
│   │       ├── INGREDIENT_ROW × n
│   │       └── ADD_INGREDIENT
│   ├── ADD_INGREDIENT_GROUP
│   ├── STEPS                               H3
│   │   └── GROUP (fieldset) × n
│   │       ├── STEP_ROW × n
│   │       └── ADD_STEP
│   └── ADD_STEP_GROUP
└── SAVE_BAR (sticky, mobile)
```

**First viewport (mobile)**: page title with Discard, the source card, the check list heading and its first rows, and the sticky Save bar showing what still blocks saving.

---

## 2. SECTIONS

### Page header (added; see Assumptions)
- **Layout**: desktop full width: title and draft status 8 cols, Discard and Save recipe 4 cols right-aligned; mobile title on the left, Discard on the right of the same row, draft status under the title
- **Content**: "Review import"; draft status "Draft saved" or "Saving…"; Discard as a text button (`button-text`), not a bordered one, because it's an escape hatch and shouldn't compete with the title or Save; it opens the Discard confirmation; on desktop, Save recipe is here as the most prominent action, and repeated at the end of the sticky left column (see Needs Your Check)
- **Behavior**: draft status updates as edits autosave

```text
DESKTOP
+---------------------------------------------------+-------------------+
| REVIEW IMPORT                                     | DISCARD [SAVE]    |
| DRAFT SAVED                                       |                   |
+---------------------------------------------------+-------------------+
```

```text
MOBILE
+--------------------------------------+
| REVIEW IMPORT              DISCARD   |
| DRAFT SAVED                          |
+--------------------------------------+
```

### Source (SKELETON section 1)
- **Layout**: desktop left column (4 cols), top; mobile full width. One `source-card` (SKIN): the reel as a 64px-wide 9:16 frame on the left with a round play badge on it, and on the right the creator handle (bold), the first 2 lines of the original caption, and Watch reel
- **Content**: reel frame (the thumbnail; the frame and its play badge together are one link to the reel, labeled "Watch @creator's reel", opening in a new tab); creator handle; caption preview (2 lines of the original caption, in its own language); "Watch reel" text link. Below the card: when the caption looks cut off (Instagram's length limit), a one-line notice: "Instagram cut this caption off. Check the reel for the rest."; then "Read more" (a button), which expands the full Original caption under the card with its label "Original caption" plus "· Translated from Spanish" (or the language it was in) when the recipe was translated, and becomes "Show less"
- **Behavior**: the caption starts collapsed every time the page opens. Read more exposes its expanded state to screen readers; expanding doesn't move focus. On desktop, while the caption is expanded, the left column stops being sticky and scrolls with the page, so no part of it is cut off

```text
DESKTOP (left column)
+-------------------------------+
| +---------------------------+ |
| | +---+ @CREATOR            | |
| | |(▶)| FIRST TWO LINES OF  | |
| | |   | THE CAPTION...      | |
| | +---+ WATCH REEL          | |
| +---------------------------+ |
| READ MORE                     |
+-------------------------------+
```

```text
MOBILE
+--------------------------------------+
| +----------------------------------+ |
| | +---+ @CREATOR                   | |
| | |(▶)| FIRST TWO LINES OF THE     | |
| | |   | CAPTION, AS WRITTEN...     | |
| | +---+ WATCH REEL                 | |
| +----------------------------------+ |
| READ MORE                            |
+--------------------------------------+
```

### Needs Your Check (SKELETON section 2)
- **Layout**: desktop left column (4 cols) under Source, sticky while the editor scrolls, so it works as a checklist next to the form, and ends with Save recipe (`button-primary`, full column width) so saving stays in view however long the form is; mobile full width under Source, with no Save here (mobile has the Save bar)
- **Content**: heading "Check 6 amounts" (the count of what's still open); one muted line under it, "Tap a row to fix it."; then rows in this order:
  - **Missing** (no amount in the caption, or an ingredient or unit the grams table doesn't know): a `check-row` with the `marker-missing` tag ("! Missing") in place of the check control, the name, "was ½ cup" when an original was kept, and "— g" (the "—" hidden from screen readers, which hear "no amount"); tapping it jumps to the amount field. These must get an amount or "To taste" to save
  - **Estimated** (from a count or a package at a typical weight, "50 g from 1 egg") and **Converted** (from a volume, "360 g from 3 cups"): a `check-row` each: a round check control that confirms that amount in place, the name with "from 3 cups" in muted caption under it, the grams on the right, and a chevron; tapping anywhere but the check control jumps to the field. An Estimated row also shows a small "~ Est." tag after the name, so the two kinds stay apart without colour
  - at most 5 rows on mobile, then "Show n more" expands in place; desktop shows all
  - **These look right** (`button-secondary`, full width, with a double-check icon) after the rows, shown while any Estimated or Converted row is unchecked: confirms all of them at once. It never touches Missing rows
- **Behavior**: a confirmed row turns into a filled olive check and stays in place (screen readers hear "Confirmed"), so the list doesn't jump under your thumb, and the heading count drops; rows leave the list when the page next opens. Missing rows leave as soon as they get an amount or To taste. Every change is announced politely ("Flour confirmed. 5 left"). These look right is announced as "4 amounts confirmed"

```text
DESKTOP (left column, sticky)
+-------------------------------+
| CHECK 6 AMOUNTS               |
| Tap a row to fix it.          |
| [! MISSING] BUTTER    — g   > |
| (✓) FLOUR           360 g   > |
|     from 3 cups               |
| ( ) EGGS ~EST.      150 g   > |
|     from 3 eggs               |
| [ ✓✓ THESE LOOK RIGHT       ] |
| [        SAVE RECIPE        ] |
+-------------------------------+
```

```text
MOBILE
+--------------------------------------+
| CHECK 6 AMOUNTS                      |
| Tap a row to fix it.                 |
| [! MISSING] BUTTER          — g    > |
| ( ) FLOUR                 360 g    > |
|     from 3 cups                      |
| ( ) BAKING POWDER          12 g    > |
|     from 1 tbsp                      |
| SHOW 3 MORE                          |
| [       ✓✓ THESE LOOK RIGHT        ] |
+--------------------------------------+
```

### Recipe Editor (SKELETON section 3; shared template)
- **Layout**: desktop right column (8 cols), a single form column; mobile full width. Three subsections in order: Details, Ingredients, Steps
- **Content**: see the subsections below
- **Behavior**: every change autosaves to the draft (on `/import/:draftId`) or marks the page as having unsaved changes (on New and Edit)

#### Details
- **Layout**: desktop two fields per row where they're short (Category beside Yield, Total time beside Source link), Title full width; mobile one field per row
- **Content**: Title (required); Category (required, single choice from SKELETON's list, preselected by the extraction and marked "Suggested" until changed or confirmed); Yield (a number and what it counts: "24", "cookies"); Total time (hours and minutes); Source link (prefilled, editable)

```text
DESKTOP (editor column)
+---------------------------------------+
| TITLE                                 |
| [CATEGORY v SUGGESTED] [YIELD][UNIT ] |
| [TOTAL TIME h  min   ] [SOURCE LINK ] |
+---------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| [TITLE                             ] |
| [CATEGORY v              SUGGESTED ] |
| [YIELD   ] [UNIT                   ] |
| [TOTAL TIME   h     min            ] |
| [SOURCE LINK                       ] |
+--------------------------------------+
```

#### Ingredients
- **Layout**: each group is a bordered block with its name as the legend and a group menu at its end. Desktop: one row per ingredient on fixed columns so the grams line up down the whole group: name (flexes), amount (fixed width), row menu; the "from 3 cups" line or the Missing tag with To taste sits under the row, aligned with the name. Mobile: name, amount, and row menu on the first line (name flexes, amount fixed at about 96px); the name field wraps to a second line inside itself when the name is long (it grows with its content as many lines as the name needs, never truncates and never scrolls inside itself), so the full name is always readable; a second line only when the ingredient needs it (the muted "from" line, or Missing with To taste), so clean and confirmed ingredients take one line
- **Empty rows**: a new or empty row shows placeholders, "Ingredient" in the name and "—" in the amount (never "0", which reads as an entered value), so it doesn't read as two blank boxes; Missing amounts show the same "—", matching Needs Your Check; each field keeps its precise screen-reader name ("Caster sugar, grams") instead of a visible label per row
- **Content**: name (text, in English); amount (number with a fixed "g" suffix) or "To taste" (a toggle that replaces the amount); for an unconfirmed Estimated or Converted row, one muted line under it with the marker glyph and the original amount as written, in its own language ("= from ½ taza", "~ from 1 egg"), and no Confirm button here (confirming happens in Needs Your Check); a Missing row keeps its "! Missing" tag and the To taste toggle on that line, plus "was 1 barra" when an original was kept. Once confirmed, the line goes; the original stays available on the Recipe page's Converted marker; an optional **note** for a creator's remark about that ingredient ("Creator: 100 g makes it less sweet"), shown as a muted line under the row and editable from the row menu (Add note / Edit note), also shown under the ingredient on the Recipe page; row menu: Move up, Move down, Move to group, Add or Edit note, Delete; "Add ingredient" at the end of each group; "Add ingredient group" after the last group. A recipe with no groups shows one unnamed block and "Add ingredient group" turns the existing rows into the first group
- **Behavior**: reordering uses the row menu (and drag on desktop as a shortcut); a deleted row offers Undo; no limit on rows or groups

```text
DESKTOP (editor column)
+---------------------------------------+
| INGREDIENTS                           |
| +- CRUST ---------------------- [...] |
| | [NAME       ][000 g]            [:] |
| |   ~ from 1 egg                      |
| | [NAME       ][000 g]            [:] |
| |   = from 1 cup                      |
| | [NAME       ][000 g]            [:] |
| | + ADD INGREDIENT                    |
| +-------------------------------------+
| + ADD INGREDIENT GROUP                |
+---------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| INGREDIENTS                          |
| +- CRUST --------------------- [...] |
| | [NAME              ][000 g]  [:]   |
| | [NAME              ][000 g]  [:]   |
| |   ~ from 1 egg                     |
| | [NAME              ][ — g ]  [:]   |
| |   ! MISSING  [TO TASTE]            |
| | + ADD INGREDIENT                   |
| +------------------------------------+
| + ADD INGREDIENT GROUP               |
+--------------------------------------+
```

#### Steps
- **Layout**: same group blocks as Ingredients; desktop one row per step: number 1 of 8 cols, text 6, row menu 1; mobile number and row menu on the first line, text full width below
- **Content**: step number (continuous across groups; none in the Tips group); step text (multi-line, grows with content); detected times shown under the text as read-only chips ("25 min"), so the owner can see which times will become timers in Bake Mode; "Uses:" followed by the linked ingredient names (at most 2 lines, then "+n"), or "No ingredients" when none, with an Edit control that opens the Ingredients used picker; row menu: Move up, Move down, Move to group, Delete; "Add step" at the end of each group; "Add step group" after the last group, offering the ingredient group names plus Assembly, Baking, and Finishing, and Tips when the recipe has none. **Tips group**: always the last block, whatever order the import gave; its rows have no number, no detected-time chips and no "Uses:" line, since a tip isn't something you do at a point in the bake; Move to group can move a row into or out of Tips, which is how a misplaced tip or step is fixed
- **Behavior**: detected times update as the text changes; reordering and Undo as in Ingredients
- **No steps in the caption**: when the import found no steps, the Steps subsection shows one line in place of the first group, "The caption has no steps. Watch the reel, or add them here.", with Watch reel and Add step; it isn't a save blocker

```text
DESKTOP (editor column)
+---------------------------------------+
| STEPS                                 |
| +- CRUST ---------------------- [...] |
| | 1 [STEP TEXT ................ ] [:] |
| |   [25 MIN]                          |
| |   USES: FLOUR, BUTTER, SALT  [EDIT] |
| | + ADD STEP                          |
| +-------------------------------------+
| + ADD STEP GROUP                      |
+---------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| STEPS                                |
| +- CRUST --------------------- [...] |
| | 1                              [:] |
| | [STEP TEXT .....................]  |
| | [25 MIN]                           |
| | USES: FLOUR, BUTTER, SALT   [EDIT] |
| | + ADD STEP                         |
| +------------------------------------+
| + ADD STEP GROUP                     |
+--------------------------------------+
```

### Save bar (primary action, mobile only)
- **Layout**: mobile only; pinned to the bottom edge above the home indicator area; hidden while the on-screen keyboard is open, so it never covers the field being typed in; the page reserves space at its end. On desktop, Save recipe lives in the Page header
- **Content**: a status line above the button that counts everything blocking the save, using the same number and wording as the error summary ("3 things to fix", or "Ready to save" when nothing blocks it); "Save recipe"
- **Behavior**: see Save blocked in States

```text
MOBILE
+--------------------------------------+
| 3 things to fix                      |
|          [ SAVE RECIPE ]             |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Draft not yet loaded | Placeholders in final proportions: source row, 3 check items, the Details fields, 6 ingredient rows, 4 steps |
| Nothing flagged | No Missing, Estimated, or Converted items, or all confirmed | Needs Your Check reduces to one line with an olive check, "All amounts checked" |
| Couldn't finish | The Shortcut stopped after the caption arrived but before the recipe was read (Apple Intelligence off or unavailable, the phone went offline) | A notice at the top of Needs Your Check: "This import didn't finish reading the recipe." with Retry (runs the Shortcut again for this draft) and, below it, the editor empty except for the source link, so the recipe can be typed in while reading the original caption |
| Retrying | Retry tapped | Replaces the notice: a spinner, "Retrying in the Shortcut", "Reading the recipe, converting to grams.", and "Didn't start? Try again" (re-opens the Shortcut, same tap, no new attempt started). Stays on this page the whole time — no navigation to the Library — and polls for the result; the editor fills in with the new recipe on success, or the Couldn't finish notice returns on a second failure. Both without a reload |
| Save blocked | Save recipe pressed with any Missing amount, an empty title, or no category | Save stays enabled (a disabled button hides the reason). Pressing it shows an error summary at the top of Needs Your Check listing each problem as a link, moves focus to that summary, and marks each field in error. On mobile, the page scrolls to the summary |
| Saving | Save recipe pressed with no blockers | Save shows a busy state and ignores repeat presses; on success → `/recipes/:recipeId` |
| Save failed | Network or server error on save | A one-line error with Retry above the Save bar (mobile) or under the Page header (desktop); every edit stays in the draft |
| Not found | Unknown or already-saved `:draftId` | System not-found page (SKELETON) |
| Discard confirmation | Discard in Page header | Follows the Destructive confirmations rule in BONES-shell. Mobile: bottom sheet sized to its content; desktop: centered modal, 4 cols wide. Order: header row with "Discard this import?" and a close X; "The draft and its extracted recipe will be deleted."; Discard (`button-destructive`, full width); Keep reviewing (`button-secondary`, full width, last, at the bottom where the thumb rests). Discard → `/recipes`. Dismissed by Keep reviewing, the close X, Esc, backdrop tap, or swipe down. Focus starts on Keep reviewing and returns to Discard on close |
| Row menu | Row menu button on an ingredient or step | Mobile: bottom sheet listing Move up, Move down, Move to group, Delete; desktop: a small menu anchored to the button. Move to group opens a second list of existing groups. Dismissed by choosing, Esc, or tapping outside |
| Ingredients used picker | Edit on a step's "Uses:" line | Mobile: bottom sheet, about three quarters of the viewport; desktop: a panel anchored under the Edit control, 4 cols wide. Order: "Ingredients for step n"; every ingredient in the recipe as a checkbox, under its group heading, with the step's own group listed first; Done. Changes apply as boxes are checked; Done, Esc, backdrop tap, or swipe down close it. Focus returns to Edit |
| Group picker | Add ingredient group or Add step group | Mobile: bottom sheet, about half the viewport, with a name field on top and SKELETON's suggested group names below, grouped by bake type; desktop: a combobox under the button with the same suggestions. Choosing a suggestion or entering a new name adds the group at the end |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A page header with the H1 "Review import", Discard, and draft status (not a SKELETON section; added for the single H1 and to hold Discard and the desktop Save).
- **Assumed**: Source shows a reel thumbnail with a Watch reel link instead of an embedded player. Embedding Instagram needs its embed script and often fails for reels; a link is reliable. Comparing against the video means leaving the app briefly.
- **Assumed**: Edits autosave to the draft, so leaving and coming back loses nothing (SKELETON says leaving keeps the draft; autosave makes that include the edits).
- **Assumed**: Save stays enabled and explains what blocks it, rather than being disabled, so the reason is always reachable, including by screen reader.
- **Assumed**: Needs Your Check is sticky beside the editor on desktop and works as a jump list on both devices.
- **Decided** (2026-10-15, Nathan): Confirming moves out of the editor rows into one checklist (Needs Your Check), with a check per row and "These look right" for all of them. The old pattern repeated a marker chip, an outlined Confirm button and a "was" line on every converted ingredient, which he disliked. This reverses the earlier "no Confirm all" assumption: the list itself makes every amount visible before the bulk confirm, so it's still looked at once.
- **Assumed**: Missing items are never included in "These look right", because they have no number to confirm.
- **Assumed**: Reordering by row menu, with drag as a desktop-only shortcut, because drag alone isn't usable by keyboard or screen reader.
- **Assumed**: Undo after deleting a row or step.
- **Assumed**: Detected times shown as chips under each step, so wrong detections are visible before Bake Mode.
- **Assumed**: The mobile Save bar hides while the keyboard is open.
- **Assumed**: The browser's Back button isn't caught by the leave check. Review Import autosaves, so nothing is lost there; on New and Edit it can lose work, so it's on the backlog.
- **Assumed**: Ingredient links on each step are proposed by the importer and not flagged in Needs Your Check; a wrong link only affects Bake Mode's "For this step" and is easy to fix, so it doesn't block saving.
- **Assumed**: Source shows the original caption only (SKELETON 1.4.0: the import doesn't read audio). It is kept with the draft only and not shown on the saved Recipe page.
- **Assumed**: The caption stays in its own language even though the recipe is translated, so a translation can be checked against what the creator wrote.
- **Assumed**: Collapsed to 3 lines so it doesn't push Needs Your Check out of the first mobile viewport.
- **Assumed**: An ingredient the caption gives no amount for ("caramel sauce", "cocoa powder for dusting") arrives as Missing with the "—" placeholder, never with an invented amount; "To taste" resolves it in one tap.
- **Decided** (2026-10-13): An ingredient or unit the grams table doesn't know arrives as Missing with its original amount kept ("Add grams · was ½ cup"), never with a guessed density. Not "— g from ½ cup", which screen readers read as "dash g".
- **Decided** (2026-10-13): Packages whose size varies by country (a stick or barra of butter, a can, a packet) are Estimated, not Converted.
- **Assumed**: Ingredient notes are short and optional; they hold what the creator said about one ingredient. Tips about the whole recipe go in the Tips step group (SKELETON 1.4.4).
- **Decided** (2026-10-15, Nathan, visual upgrade round): Source becomes a card: the reel is a small 9:16 frame with a play badge, read as a reference to open rather than as the recipe's picture, with the handle and caption preview beside it. The recipe's own picture is handled by the cover (a bake photo, later).
- **Decided** (2026-10-15): Retry stays on this page instead of going to the Library. Reported live, iPhone only, Mac not: the Shortcut never opened. The old code set location.href to the Shortcut's shortcuts:// link and immediately navigated to the Library in the same tick — the likely cause, by code comparison with /import (which never navigates away and is confirmed working on the iPhone): on iOS the client-side navigation can cancel the hand-off before Safari finishes it, a race desktop Safari tolerates. Staying put and polling (the Retrying state) removes the race either way, confirmed or not.
- **Open**: Highlight the part of the caption an item came from when you tap a check item ("125 g from 1 cup" → the words "1 cup flour")? Useful for checking, but it depends on the extraction returning positions; not drawn.

---

## CHANGE LOG

- 1.5.0 (2026-10-15): Visual upgrade round: Source as a card (reel frame with play badge, handle, 2-line caption preview); Needs Your Check becomes a checklist ("Check 6 amounts") with a check per Estimated and Converted row and "These look right" for all; editor rows lose the marker chip and Confirm button, keeping one muted "from 3 cups" line until confirmed (SKELETON 1.5.0).
- 1.4.4 (2026-10-15): Retry (Couldn't finish) stays on this page and polls instead of navigating to the Library — the iPhone never opened the Shortcut on Retry, a same-tick navigation racing the shortcuts:// hand-off by most likely cause. New Retrying state.
- 1.4.3 (2026-10-15): Open note: the Source picture is to be redesigned in the visual upgrade round.
- 1.4.2 (2026-10-14): Tips step group in the editor: last, unnumbered, no time chips or Uses line; rows move in and out with Move to group (SKELETON 1.4.4).
- 1.4.1 (2026-10-13): Unknown ingredients or units arrive as Missing with the original kept ("Add grams · was ½ cup"); "—" hidden from screen readers; packages such as butter sticks are Estimated (SKELETON 1.4.1).
- 1.4.0 (2026-10-13): Source shows the original caption (labeled when translated) instead of the caption-and-audio transcript, with a cut-off notice; Estimated now means converted from a count at a typical weight; ingredient notes; no-steps line; Couldn't finish state (SKELETON 1.4.0).
- 1.3.2 (2026-09-30): No line cap on ingredient names on mobile; the field grows as needed (build review).
- 1.3.1 (2026-09-30): Ingredient names wrap to 2 lines on mobile instead of truncating; "—" as the amount placeholder; Confirm and To taste aligned to the right edge of the status area on desktop.
- 1.3.0 (2026-09-30): After the first build review: fixed ingredient columns on desktop so grams align; one-line ingredient rows on mobile unless there's something to check; placeholders on empty rows; Save repeated at the end of the sticky left column on desktop; Discard as a text button; Save bar status matches the error summary; Discard confirmation follows the new destructive-confirmation rule.
- 1.2.0 (2026-09-29): Added "Uses:" ingredient links on each step and the Ingredients used picker (SKELETON 1.3.0).
- 1.1.0 (2026-09-29): Added the collapsible transcript (caption and spoken audio) to Source (SKELETON 1.2.1).
- 1.0.0 (2026-09-29): Initial wireframe, including the shared Recipe Editor section.
