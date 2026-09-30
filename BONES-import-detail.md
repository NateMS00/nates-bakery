# BONES: `/import/:draftId` (Review Import)

> **Source**: SKELETON.md v1.3.0, `/import/:draftId`, and the Recipe editor template
> **Primary Action**: Save recipe → `/recipes/:recipeId`
> **Primary Device**: mobile, because imports start from Instagram's share menu on the iPhone and the review happens right after, on the same phone
> **Shell**: BONES-shell.md, App variant
> **Version**: 1.3.1 · **Updated**: 2026-09-30

This file also defines the **Recipe Editor** section used by `/recipes/new` and `/recipes/:recipeId/edit`. Their BONES files reference it instead of redrawing it.

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_HEADER
│   ├── PAGE_TITLE "Review import"          H1
│   ├── DRAFT_STATUS ("Draft saved")
│   └── DISCARD
├── SOURCE                                  H2
│   ├── REEL_THUMBNAIL
│   ├── CREATOR_HANDLE
│   ├── WATCH_REEL (external)
│   └── TRANSCRIPT (collapsed, Read more)
├── NEEDS_YOUR_CHECK                        H2
│   ├── CHECK_SUMMARY (missing · estimated · converted)
│   └── CHECK_ITEM × n (max 5, then Show all)
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

**First viewport (mobile)**: page title with Discard, Source as one compact row with the collapsed transcript (3 lines), the Needs Your Check summary and its first items, and the sticky Save bar showing what still blocks saving.

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
- **Layout**: desktop left column (4 cols), top; mobile one compact row: small portrait thumbnail on the left, text on the right
- **Content**: reel thumbnail (portrait, 9:16); creator handle; "Watch reel" opening the original in a new tab; Transcript: what the reel says, in two labeled parts, Caption (the post text) then Spoken (the audio transcript), each hidden when the reel has none; collapsed to its first 3 lines, then "Read more" expands the full text in place and becomes "Show less"
- **Behavior**: the transcript starts collapsed every time the page opens. Read more is a real button with its expanded state exposed to screen readers; expanding doesn't move focus. On desktop, while the transcript is expanded, the left column stops being sticky and scrolls with the page, so no part of it is cut off

```text
DESKTOP (left column)
+-------------------------------+
| SOURCE                        |
| +------+                      |
| |THUMB | @CREATOR             |
| |      | WATCH_REEL           |
| +------+                      |
| TRANSCRIPT                    |
| CAPTION: FIRST LINES OF THE   |
| CAPTION TEXT ... SPOKEN: THE  |
| FIRST WORDS OF THE AUDIO...   |
| READ MORE                     |
+-------------------------------+
```

```text
MOBILE
+--------------------------------------+
| SOURCE                               |
| [THUMB] @CREATOR · WATCH_REEL        |
| TRANSCRIPT                           |
| CAPTION: FIRST LINES OF THE CAPTION  |
| TEXT ... SPOKEN: THE FIRST WORDS OF  |
| THE AUDIO TRANSCRIPT ...             |
| READ MORE                            |
+--------------------------------------+
```

### Needs Your Check (SKELETON section 2)
- **Layout**: desktop left column (4 cols) under Source, sticky while the editor scrolls, so it works as a to-do list next to the form, and ends with Save recipe (`button-primary`, full column width) so saving stays in view however long the form is; mobile full width under Source, with no Save here (mobile has the Save bar)
- **Content**: a summary line "2 missing · 3 estimated · 1 converted"; then items in this order: Missing (must be fixed to save), Estimated (should be confirmed), Converted (check the conversion); each item shows the ingredient name, its current value ("— g", "120 g", "125 g from 1 cup"), and its type; each item jumps to that field in the editor and moves focus into it; at most 5 items on mobile, then "Show all (n)" expands in place; desktop shows all
- **Behavior**: items leave the list as soon as they are resolved (amount entered, Confirm pressed) and the summary updates; the change is announced to screen readers

```text
DESKTOP (left column, sticky)
+-------------------------------+
| NEEDS YOUR CHECK              |
| 2 MISSING · 3 EST. · 1 CONV.  |
| ! BUTTER          — g         |
| ! SALT            — g         |
| ~ SUGAR         120 g         |
| ~ CREAM         200 g         |
| = FLOUR  125 g from 1 cup     |
| [        SAVE RECIPE        ] |
+-------------------------------+
```

```text
MOBILE
+--------------------------------------+
| NEEDS YOUR CHECK                     |
| 2 missing · 3 estimated · 1 conv.    |
| ! BUTTER                      — g    |
| ! SALT                        — g    |
| ~ SUGAR                     120 g    |
| SHOW ALL (6)                         |
+--------------------------------------+
```

(`!` Missing, `~` Estimated, `=` Converted stand for the markers; their look comes from SKIN.md.)

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
- **Layout**: each group is a bordered block with its name as the legend and a group menu at its end. Desktop: one row per ingredient on fixed columns so the grams line up down the whole group: name (flexes), amount (fixed width), a status area of fixed width reserved for the marker plus Confirm or the To taste toggle (left empty when the row has nothing to check), row menu; every row uses the same columns whether or not it has a marker. Mobile: name, amount, and row menu on the first line (name flexes, amount fixed at about 96px); the name field wraps to a second line inside itself when the name is long (it grows with its content, up to 2 lines, and never truncates), so the full name is always readable; a second line of controls only when the ingredient needs it (marker with Confirm, or marker with To taste), so clean ingredients take one line. On desktop, inside the fixed status area, Confirm and the To taste toggle sit at its right edge, so they line up down the group whatever the marker's width
- **Empty rows**: a new or empty row shows placeholders, "Ingredient" in the name and "—" in the amount (never "0", which reads as an entered value), so it doesn't read as two blank boxes; Missing amounts show the same "—", matching Needs Your Check; each field keeps its precise screen-reader name ("Caster sugar, grams") instead of a visible label per row
- **Content**: name (text); amount (number with a fixed "g" suffix) or "To taste" (a toggle that replaces the amount); marker Missing, Estimated, or Converted; Confirm (for Estimated and Converted, removes the marker without changing the value); for Converted, the original stated amount ("was 1 cup") on a line under the row, always visible here; row menu: Move up, Move down, Move to group, Delete; "Add ingredient" at the end of each group; "Add ingredient group" after the last group. A recipe with no groups shows one unnamed block and "Add ingredient group" turns the existing rows into the first group
- **Behavior**: reordering uses the row menu (and drag on desktop as a shortcut); a deleted row offers Undo; no limit on rows or groups

```text
DESKTOP (editor column)
+---------------------------------------+
| INGREDIENTS                           |
| +- CRUST ---------------------- [...] |
| | [NAME       ][000 g] ~EST [OK]  [:] |
| | [NAME       ][000 g] =CNV [OK]  [:] |
| |   was 1 cup                         |
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
| |   ~ ESTIMATED  [CONFIRM]           |
| | [NAME              ][ — g ]  [:]   |
| |   ! MISSING  [TO TASTE]            |
| | + ADD INGREDIENT                   |
| +------------------------------------+
| + ADD INGREDIENT GROUP               |
+--------------------------------------+
```

#### Steps
- **Layout**: same group blocks as Ingredients; desktop one row per step: number 1 of 8 cols, text 6, row menu 1; mobile number and row menu on the first line, text full width below
- **Content**: step number (continuous across groups); step text (multi-line, grows with content); detected times shown under the text as read-only chips ("25 min"), so the owner can see which times will become timers in Bake Mode; "Uses:" followed by the linked ingredient names (at most 2 lines, then "+n"), or "No ingredients" when none, with an Edit control that opens the Ingredients used picker; row menu: Move up, Move down, Move to group, Delete; "Add step" at the end of each group; "Add step group" after the last group, offering the ingredient group names plus Assembly, Baking, and Finishing
- **Behavior**: detected times update as the text changes; reordering and Undo as in Ingredients

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
| Nothing flagged | No Missing, Estimated, or Converted items | Needs Your Check reduces to one line "Everything checked" |
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
- **Assumed**: A Confirm action per Estimated and Converted item (SKELETON says markers stay "until the owner confirms"; this is the confirming control).
- **Assumed**: No "Confirm all" bulk action, so every guessed amount gets looked at once. Revisit if reviews feel slow.
- **Assumed**: Reordering by row menu, with drag as a desktop-only shortcut, because drag alone isn't usable by keyboard or screen reader.
- **Assumed**: Undo after deleting a row or step.
- **Assumed**: Detected times shown as chips under each step, so wrong detections are visible before Bake Mode.
- **Assumed**: The mobile Save bar hides while the keyboard is open.
- **Assumed**: The browser's Back button isn't caught by the leave check. Review Import autosaves, so nothing is lost there; on New and Edit it can lose work, so it's on the backlog.
- **Assumed**: Ingredient links on each step are proposed by the importer and not flagged in Needs Your Check; a wrong link only affects Bake Mode's "For this step" and is easy to fix, so it doesn't block saving.
- **Assumed**: The transcript shows the caption and the spoken audio as two labeled parts, because reels put recipes in either place. It is kept with the draft only and not shown on the saved Recipe page.
- **Assumed**: Collapsed to 3 lines so it doesn't push Needs Your Check out of the first mobile viewport.
- **Open**: Highlight the part of the transcript an item came from when you tap a check item ("125 g from 1 cup" → the words "one cup of flour")? Useful for checking guesses, but it depends on the extraction returning positions; not drawn.

---

## CHANGE LOG

- 1.3.1 (2026-09-30): Ingredient names wrap to 2 lines on mobile instead of truncating; "—" as the amount placeholder; Confirm and To taste aligned to the right edge of the status area on desktop.
- 1.3.0 (2026-09-30): After the first build review: fixed ingredient columns on desktop so grams align; one-line ingredient rows on mobile unless there's something to check; placeholders on empty rows; Save repeated at the end of the sticky left column on desktop; Discard as a text button; Save bar status matches the error summary; Discard confirmation follows the new destructive-confirmation rule.
- 1.2.0 (2026-09-29): Added "Uses:" ingredient links on each step and the Ingredients used picker (SKELETON 1.3.0).
- 1.1.0 (2026-09-29): Added the collapsible transcript (caption and spoken audio) to Source (SKELETON 1.2.1).
- 1.0.0 (2026-09-29): Initial wireframe, including the shared Recipe Editor section.
