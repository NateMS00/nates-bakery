# BONES: `/recipes/:recipeId` (Recipe)

> **Source**: SKELETON.md v1.2.0, `/recipes/:recipeId`
> **Primary Action**: Start baking → `/recipes/:recipeId/bake?scale=`
> **Primary Device**: mobile, because the persona reads recipes on an iPhone in the kitchen, often from arm's length with busy hands
> **Shell**: BONES-shell.md, App variant
> **Version**: 1.4.1 · **Updated**: 2026-10-13

---

## 1. STRUCTURE

```text
MAIN
├── HEADER
│   ├── BACK_TO_LIBRARY
│   ├── ACTIONS (Favorite, Share, Edit)
│   ├── CATEGORY (label above the title)
│   ├── RECIPE_TITLE                        H1
│   ├── RATING (1–5, editable)
│   ├── SOURCE_CREDIT (creator, reel link)
│   └── YIELD · TOTAL_TIME
├── ESTIMATES_NOTICE (state: Has estimates)
├── SCALE                                   H2
│   └── SCALE_PRESETS + CUSTOM
├── INGREDIENTS                             H2
│   ├── GROUP_HEADING                       H3 (when grouped)
│   └── INGREDIENT_ROW × n
├── STEPS                                   H2
│   ├── GROUP_HEADING                       H3 (when grouped)
│   └── STEP × n
├── LATEST_BAKE                             H2
│   ├── BAKE_SUMMARY
│   ├── MARK_AS_BAKED
│   └── SEE_ALL_BAKES
└── START_BAKING_BAR (sticky, mobile)
```

**First viewport (mobile)**: back link, Favorite, Share and Edit, category, title, rating, source credit, yield and total time, the estimates notice when present, the Scale presets, and the sticky Start baking bar at the bottom edge. The first ingredient rows show on taller phones; on the smallest supported phone, Ingredients may start just below the fold.

---

## 2. SECTIONS

### Header (SKELETON section 1)
- **Layout**: desktop full width (12 cols): title block 8 cols, actions 4 cols right-aligned in a single row (Favorite, Share, Edit, then Start baking as the largest action), vertically aligned with the title so no empty column hangs below them; mobile single column, with Favorite, Share, and Edit as compact icon buttons on the back-link row
- **Content**: "Library" back link → `/recipes`; Favorite toggle (on or off, labeled for screen readers as "Favorite" with its pressed state); Share (opens Share dialog); Edit → `/recipes/:recipeId/edit`; category as a short label on its own line above the title (plain text, not a link; the title stays the H1); title (wraps, never truncates; expected under 60 characters); rating as 5 stars, each a separate target, with "Not rated" text when empty; source credit "@creator · Watch reel" opening the reel in a new tab (hidden for manual recipes without a source); yield at the current scale ("Makes 36 cookies") and total time
- **Behavior**: yield updates when the scale changes. Tapping a star sets the rating in place; tapping the current rating again clears it. Favorite toggles in place. Neither navigates

```text
DESKTOP
+-----------------------------------------------+-----------------------+
| < LIBRARY                                     |                       |
| CATEGORY                                      |                       |
| RECIPE_TITLE                                  |[F][S][E][START BAKING]|
| [*][*][*][*][ ]                               |                       |
| @CREATOR · WATCH_REEL                         |                       |
| YIELD · TOTAL_TIME                            |                       |
+-----------------------------------------------+-----------------------+
```

```text
MOBILE
+--------------------------------------+
| < LIBRARY        [FAV][SHARE][EDIT]  |
| CATEGORY                             |
| RECIPE_TITLE                         |
| [*][*][*][*][ ]                      |
| @CREATOR · WATCH_REEL                |
| YIELD · TOTAL_TIME                   |
+--------------------------------------+
```

### Scale (SKELETON section 2)
- **Layout**: desktop in the left column (4 of 12 cols; 4 of 8 on tablet) above Ingredients; mobile full width, one row. Every preset keeps SKIN's 48px minimum width; the column must never be narrower than the five presets need
- **Content**: presets ½×, 1×, 1.5×, 2×, and Custom; Custom reveals a number field in the same row (0.25× to 10×); the active value is marked
- **Behavior**: changing the value updates `?scale=` in place (no navigation), every amount, the yield, and the Start baking label

```text
DESKTOP (inside left column)
+-------------------------------+
| SCALE                         |
| [½×][1×][1.5×][2×][CUSTOM]    |
+-------------------------------+
```

```text
MOBILE
+--------------------------------------+
| SCALE                                |
| [½×] [1×] [1.5×] [2×] [CUSTOM]       |
+--------------------------------------+
```

### Ingredients (SKELETON section 3)
- **Layout**: desktop left column (4 of 12 cols; 4 of 8 on tablet), sticky while Steps scroll past it, so amounts stay visible while reading steps; mobile full width
- **Content**: one row per ingredient: name on the left (wraps to at most 2 lines, then truncates), scaled amount in grams on the right (aligned on a shared right edge so numbers line up); an Estimated or Converted marker under the name; tapping a Converted marker reveals the original stated amount ("was 1 cup") on the line under it. An ingredient note (a creator's remark kept from the import, or one added in the editor) shows as one muted line under the ingredient, always visible. When the recipe has component groups (Crust, Filling, Frosting…), each group gets a heading and a medium gap before it, in the recipe's order. No limit on rows or groups: everything shows
- **Behavior**: amounts under 10 g show one decimal only when it isn't zero ("3.5 g", but "8 g", never "8.0 g"); "to taste" ingredients show that text instead of an amount

```text
DESKTOP (left column)
+-------------------------------+
| INGREDIENTS                   |
| GROUP_NAME                    |
| INGREDIENT_NAME        000 g  |
| INGREDIENT_NAME        000 g  |
|   [CONVERTED] was 1 cup       |
| INGREDIENT_NAME         00 g  |
|   [ESTIMATED]                 |
+-------------------------------+
```

```text
MOBILE
+--------------------------------------+
| INGREDIENTS                          |
| GROUP_NAME                           |
| INGREDIENT_NAME               000 g  |
| INGREDIENT_NAME               000 g  |
|   [CONVERTED]                        |
| INGREDIENT_NAME                00 g  |
|   [ESTIMATED]                        |
+--------------------------------------+
```

### Steps (SKELETON section 4)
- **Layout**: desktop right column (8 of 12 cols; 4 of 8 on tablet, about 340px at 768, still a comfortable reading width); mobile full width below Ingredients
- **Content**: numbered steps in order, full text, no truncation; times detected in the text ("25 minutes") are marked inline but are not interactive here (they become timers in Bake Mode). When the recipe has step groups (Crust, Filling, Assembly, Baking…), each gets a heading; numbering continues across groups (1–12, not 1–4 per group), so "step 7" means one thing everywhere, including Bake Mode's `?step=`
- **Behavior**: none

```text
DESKTOP (right column, beside Scale + Ingredients)
+-------------------------------+---------------------------------------+
| SCALE                         | STEPS                                 |
| INGREDIENTS                   | GROUP_NAME                            |
|  (sticky)                     | 1  STEP_TEXT ...................      |
|                               | 2  STEP_TEXT ... [25 MIN] .......     |
|                               | GROUP_NAME                            |
|                               | 3  STEP_TEXT ...................      |
+-------------------------------+---------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| STEPS                                |
| GROUP_NAME                           |
| 1  STEP_TEXT .....................   |
| 2  STEP_TEXT ... [25 MIN] ........   |
| GROUP_NAME                           |
| 3  STEP_TEXT .....................   |
+--------------------------------------+
```

### Latest Bake (SKELETON section 5)
- **Layout**: desktop right column (8 cols) below Steps; mobile full width at the end of the page
- **Content**: most recent log entry: date and scale used; "What changed" (at most 2 lines, then truncates) and "How it turned out" (at most 2 lines, then truncates), each hidden when empty, replaced by an "Add notes" link → `/recipes/:recipeId/log` when both are empty; "Mark as baked" as a secondary action; "See all bakes (n)" → `/recipes/:recipeId/log`
- **Behavior**: Mark as baked saves an entry in place (today, current scale). The section updates to show it, with a one-line confirmation "Marked as baked today" and Undo, which stays until the next action or 10 seconds. If the recipe is unrated, the Rating prompt follows

```text
DESKTOP (right column)
+---------------------------------------+
| LATEST BAKE                           |
| DATE · SCALE_USED                     |
| WHAT_CHANGED (2 lines max)            |
| HOW_IT_TURNED_OUT (2 lines max)       |
| [MARK AS BAKED]     SEE_ALL_BAKES (n) |
+---------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| LATEST BAKE                          |
| DATE · SCALE_USED                    |
| WHAT_CHANGED                         |
| HOW_IT_TURNED_OUT                    |
| [MARK AS BAKED]                      |
| SEE_ALL_BAKES (n)                    |
+--------------------------------------+
```

### Start baking bar (primary action, mobile only)
- **Layout**: mobile only; pinned to the bottom edge, full width, above the device's home indicator area; the page reserves space at its end so the bar never covers the last content. On desktop the action lives in the Header
- **Content**: "Start baking" plus the current scale when it isn't 1× ("Start baking · 1.5×")
- **Behavior**: always visible on mobile; goes to `/recipes/:recipeId/bake?scale=`

```text
MOBILE
+--------------------------------------+
|    [ START BAKING · 1.5× ]           |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Recipe data not yet loaded | Placeholders in final proportions: title block, scale row, 8 ingredient rows, 4 steps; Start baking bar shown disabled |
| Has estimates | Any ingredient is still Estimated | A one-line notice between Header and Scale: "3 amounts are estimates. Confirm them" → `/recipes/:recipeId/edit`; full width on both devices |
| Never baked | Bake log is empty | Latest Bake reduces to one line "Not baked yet" and Mark as baked; See all bakes is hidden |
| Just marked | Mark as baked succeeded | Confirmation line with Undo at the top of Latest Bake; Undo deletes the entry and restores the previous state |
| Rating prompt | After Mark as baked, only when the recipe is unrated | Mobile: bottom sheet sized to its content; desktop: centered modal, 4 cols wide, sized to its content. Order: a header row with "How was it?" and a close X; 5 large stars (the prompt size from SKIN.md), centered; Skip directly below the stars, centered. Choosing a star saves and closes; Skip closes. Dismissed also by the close X, Esc, backdrop tap, or swipe down on mobile. Focus starts on the first star and returns to Mark as baked on close |
| Invalid scale | `?scale=` missing, not a number, or outside 0.25–10 | Page renders at 1× and the URL is corrected; no error shown |
| Not found | Unknown `:recipeId` | System not-found page (SKELETON) |
| Share dialog | Share in Header | Mobile: bottom sheet sized to its content (up to 90% of the viewport); desktop: centered modal, 5 cols wide, sized to its content. Order: a header row with the title "Share recipe" and a close X (icon button) at its end; link field (read-only) with Copy; note "Friends can read and scale it. Your bake log stays private."; Revoke link. With no link yet, a "Create link" action replaces the field. Revoke asks for confirmation inside the sheet before acting. After Copy, a short "Link copied" confirmation appears inside the dialog. No empty space below the last element. Dismissed by the close X, Esc, tapping the backdrop, or swiping down on mobile. Focus is trapped inside and returns to Share on close |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A "Library" back link in the Header (not in SKELETON's Contextual navigation; added because on mobile the logo alone doesn't read as "back").
- **Assumed**: The category label is not a link to the filtered Library; SKELETON defines no such contextual link, and the back link already returns to Library.
- **Assumed**: Step numbers continue across groups, so Bake Mode's `?step=` stays a single sequence.
- **Assumed**: Mark as baked lives in Latest Bake, not next to Start baking, so it never competes with the primary action. The trade-off: on a long recipe it's at the end of the page.
- **Assumed**: The Rating prompt appears after Mark as baked only when the recipe is unrated; a rated recipe is changed directly in the Header. (Bake Mode's finish flow prompts from the log page instead, per SKELETON.)
- **Assumed**: An Undo confirmation for Mark as baked (not in SKELETON), because a one-tap action that changes Baked status needs a way back.
- **Assumed**: Each star is its own touch target at least SKIN.md's minimum size, so a rating can be set accurately on a phone.
- **Assumed**: Scale presets ½×, 1×, 1.5×, 2× plus Custom, limited to 0.25× to 10×.
- **Assumed**: Grams rounded to whole numbers, with one decimal under 10 g (yeast, salt, baking soda, where a gram matters), shown only when it isn't zero: "3.5 g", "8 g".
- **Assumed**: The original stated amount for Converted items is revealed on tap, not always visible, to keep rows short on a phone.
- **Assumed**: Ingredients stick beside Steps on desktop and tablet. Tablet splits its 8 columns 4 and 4, not 3 and 5: at 3 columns (about 255px at 768) the Scale presets overflowed and "1×" fell under 48px (accessibility audit). Stacking everything on tablet was rejected, because a propped-up iPad is exactly when grams should sit beside the step.
- **Assumed**: Start baking moves from a sticky bottom bar (mobile) to the Header (desktop). DOM order puts it in the Header on both; on mobile it is visually pinned to the bottom.
- **Assumed**: A "Link copied" confirmation inside the Share dialog (not in SKELETON).
- **Open**: Scaling by pan size or servings (SKELETON open question). If added, Scale grows a second mode; the current row is drawn to allow it.
- **Open**: A recipe photo (reel thumbnail) in the Header. Not drawn; adding it would push Scale out of the first mobile viewport, so the photo would need to be small or skipped on mobile.

---

## CHANGE LOG

- 1.4.1 (2026-10-13): Ingredient notes show as a muted line under the ingredient (SKELETON 1.4.0).
- 1.4.0 (2026-09-30): Tablet split is 4 + 4 columns (Scale and Ingredients / Steps), after the accessibility audit found the Scale control overflowing at 3 columns.
- 1.3.0 (2026-09-30): After the first build review: overlays sized to their content with a close X in the header; large stars in the Rating prompt; no trailing ".0" on amounts.
- 1.2.1 (2026-09-29): Desktop header actions in one row beside the title (Favorite, Share, Edit, Start baking), after the visual review.
- 1.2.0 (2026-09-29): Added the category label to the Header (SKELETON 1.2.0).
- 1.1.0 (2026-09-29): Added Favorite, Rating, Mark as baked with Undo, Rating prompt, and component group headings for ingredients and steps (SKELETON 1.1.0).
- 1.0.0 (2026-09-29): Initial wireframe.
