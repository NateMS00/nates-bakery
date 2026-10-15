# BONES: `/recipes/:recipeId` (Recipe)

> **Source**: SKELETON.md v1.5.0, `/recipes/:recipeId`
> **Primary Action**: Start baking → `/recipes/:recipeId/bake?scale=`
> **Primary Device**: mobile, because the persona reads recipes on an iPhone in the kitchen, often from arm's length with busy hands
> **Shell**: BONES-shell.md, App variant (no tab bar; with a cover, the cover replaces the header)
> **Version**: 1.6.0 · **Updated**: 2026-10-15

---

## 1. STRUCTURE

```text
MAIN
├── HEADER
│   ├── COVER (full bleed on mobile, when there is one)
│   │   └── on it: BACK, FAVORITE, SHARE, EDIT (picture buttons)
│   ├── CATEGORY (label above the title)
│   ├── RECIPE_TITLE                        H1
│   ├── SOURCE_CREDIT · YIELD · TOTAL_TIME
│   └── RATING (read-only: latest rated bake) · BAKE_STATUS
├── SECTION_TABS (sticky): Ingredients · Steps · Bakes
├── ESTIMATES_NOTICE (state: Has estimates)
├── SCALE                                   H2, visually hidden label "Scale"
│   └── SCALE_PRESETS + CUSTOM
├── INGREDIENTS                             H2
│   ├── GROUP_HEADING                       H3 (when grouped)
│   └── INGREDIENT_ROW × n
├── STEPS                                   H2
│   ├── GROUP_HEADING                       H3 (when grouped)
│   └── STEP × n
├── BAKES                                   H2
│   ├── BAKE_ENTRY × up to 3
│   └── SEE_ALL_BAKES
└── ACTION_BAR (sticky, mobile): LOG BAKE · START BAKING
```

**First viewport (mobile)**: the cover (about 290px tall on a 390px phone) with Back, Favorite, Share and Edit on it, the category, title, credit line and rating, and the sticky action bar. The section tabs and Scale are a short scroll away; once the cover scrolls off, the section tabs stick to the top. Without a cover, the page starts with a back row and the Scale presets are in the first viewport, as before.

---

## 2. SECTIONS

### Header (SKELETON section 1)
- **Layout**: mobile: the cover full bleed at the very top (SKIN `cover-picture`, 4:3, edge to edge, under the status bar), with Back on its top-left corner and Favorite, Share, Edit on its top-right corner as `picture-button`s; below it, the text block full width. Tablet and desktop: the cover inside the content column, rounded, 8 of 12 cols (5 of 8 on tablet), with the text block in the remaining 4 cols beside it (3 on tablet) and Back, Favorite, Share, Edit and Start baking as normal buttons above the text, in one row. No cover: a back row ("‹ Library" with Favorite, Share, Edit at its end), then the text block, as on desktop today
- **Content**: Back (on the cover: an arrow labeled "Back to Library"; elsewhere "‹ Library") → `/recipes`; Favorite toggle (pressed state exposed); Share (opens Share dialog); Edit → `/recipes/:recipeId/edit`; category label above the title; title as the H1 (wraps, never truncates); one muted credit line "@creator · Watch reel · Makes 36 cookies · 1 h 20 min" (wraps as needed; Watch reel opens the reel in a new tab; parts hide when missing); the rating as small stars in amarelo, read-only, from the latest rated bake, followed by "Baked 13 Oct" or "Not baked yet"; with no rated bake, only the bake status shows (no empty star row)
- **Picture**: the cover is the recipe's cover (SKELETON 1.5.0): a bake photo set as cover, else the reel thumbnail. Decorative (empty alt), since the title names the recipe. Space reserved before it loads. When the reel cover is a person rather than the bake, the fix is a bake photo set as cover (Log sheet), not a smaller picture
- **Behavior**: yield updates when the scale changes. Favorite toggles in place. The stars are not a control: a bake's rating is set in the Log sheet. Tapping the rating scrolls to Bakes

```text
DESKTOP
+-----------------------------------------------+-----------------------+
| +-------------------------------------------+ | < LIBRARY             |
| |                                           | | [F][S][E]             |
| |                COVER 4:3                  | | CATEGORY              |
| |                                           | | RECIPE_TITLE          |
| |                                           | | @CREATOR · REEL ·     |
| +-------------------------------------------+ | YIELD · TIME          |
|                                               | ★★★★☆ · BAKED 13 OCT  |
|                                               | [   START BAKING    ] |
+-----------------------------------------------+-----------------------+
```

```text
MOBILE (with cover)
+--------------------------------------+
|(<)                       (♥)(⇪)(✎)  |
|                                      |
|              COVER 4:3               |
|                                      |
+--------------------------------------+
| CATEGORY                             |
| RECIPE_TITLE                         |
| @CREATOR · WATCH REEL · YIELD · TIME |
| ★★★★☆ · BAKED 13 OCT                 |
+--------------------------------------+
```

### Section tabs (SKELETON section 2)
- **Layout**: full width under the Header on mobile; across the full content width on tablet and desktop. Sticks to the top of the screen once the Header has scrolled away (SKIN `section-tabs`)
- **Content**: Ingredients, Steps, Bakes ("Bakes 3" with the count when there are any)
- **Behavior**: jump links to the sections of this one page, never hiding anything; the tab of the section in view is marked current as you scroll. On tablet and desktop, where Ingredients and Steps sit side by side, the tabs show Ingredients and Steps as one item, "Recipe", plus Bakes

```text
MOBILE (sticky after the cover)
+--------------------------------------+
| INGREDIENTS    STEPS    BAKES 3      |
| ===========                          |
+--------------------------------------+
```

### Scale (SKELETON section 3)
- **Layout**: desktop in the left column (4 of 12 cols; 4 of 8 on tablet) above Ingredients; mobile full width, one row, directly under the section tabs, with no visible heading (the presets explain themselves; the group keeps the accessible name "Scale"). Every preset keeps SKIN's 48px minimum width; the column must never be narrower than the five presets need
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

### Ingredients (SKELETON section 4)
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

### Steps (SKELETON section 5)
- **Layout**: desktop right column (8 of 12 cols; 4 of 8 on tablet, about 340px at 768, still a comfortable reading width); mobile full width below Ingredients
- **Content**: numbered steps in order, full text, no truncation; times detected in the text ("25 minutes") are marked inline but are not interactive here (they become timers in Bake Mode). When the recipe has step groups (Crust, Filling, Assembly, Baking…), each gets a heading; numbering continues across groups (1–12, not 1–4 per group), so "step 7" means one thing everywhere, including Bake Mode's `?step=`. The exception is the **Tips** group (creator tips about the whole recipe, SKELETON 1.4.4): always last, headed "Tips", its items a plain unnumbered list in body text, with no time marks; they don't count in the step numbering
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

### Bakes (SKELETON section 6)
- **Layout**: desktop right column (8 cols) below Steps; mobile full width at the end of the page
- **Content**: the latest 3 bakes of this recipe, newest first; each: the bake photo as a small square (64px) when there is one, the date and scale ("Tue 13 Oct · 1.5×"), that bake's stars (or nothing when unrated), and "How it turned out" (2 lines, then truncates; "What changed" appears only on the Bake Log page). Each entry opens it in the Log sheet (`/recipes/:recipeId/log?edit=<entryId>`). "See all bakes (n)" → `/recipes/:recipeId/log`. Logging a bake is the Log bake button in the action bar, not a button here
- **Behavior**: a bake saved from the Log sheet appears at the top of the list when the sheet closes, with "Bake saved" announced politely

```text
MOBILE
+--------------------------------------+
| BAKES                                |
| [IMG] TUE 13 OCT · 1.5×      ★★★★★   |
|       CUSTARD SET PERFECTLY...       |
| [IMG] FRI 2 OCT              ★★★☆☆   |
|       A LITTLE LOOSE IN THE ...      |
| SEE ALL BAKES (5)                    |
+--------------------------------------+
```

### Action bar (mobile only)
- **Layout**: mobile only; pinned to the bottom edge, full width, above the home indicator area; Log bake (`button-secondary`, sized to its label) at the start and Start baking (`button-primary`) taking the rest of the row; the page reserves space at its end so the bar never covers the last content. On tablet and desktop, Start baking lives in the Header and Log bake heads the Bakes section
- **Content**: "Log bake"; "Start baking" plus the current scale when it isn't 1× ("Start baking · 1.5×")
- **Behavior**: always visible on mobile; Log bake opens the Log sheet over this page (`/recipes/:recipeId/log?new=1`, with today and the current scale; closing returns here); Start baking → `/recipes/:recipeId/bake?scale=`

```text
MOBILE
+--------------------------------------+
| [LOG BAKE] [  START BAKING · 1.5×  ] |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Recipe data not yet loaded | Placeholders in final proportions: a grout cover area (only if the recipe is known to have a cover), title block, scale row, 8 ingredient rows, 4 steps; action bar shown disabled |
| Has estimates | Any ingredient is still Estimated | A one-line notice between Header and Scale: "3 amounts are estimates. Confirm them" → `/recipes/:recipeId/edit`; full width on both devices |
| Never baked | Bake log is empty | Bakes reduces to one line "Not baked yet"; See all bakes is hidden; the section tab reads "Bakes" without a count |
| No cover | Recipe has no cover picture | No cover area: a back row with Favorite, Share and Edit, then the text block; the first viewport reaches the Scale presets |
| Log sheet | Log bake | As defined in BONES-recipes-log.md (Log sheet), opened over this page |
| Invalid scale | `?scale=` missing, not a number, or outside 0.25–10 | Page renders at 1× and the URL is corrected; no error shown |
| Not found | Unknown `:recipeId` | System not-found page (SKELETON) |
| Share dialog | Share in Header | Mobile: bottom sheet sized to its content (up to 90% of the viewport); desktop: centered modal, 5 cols wide, sized to its content. Order: a header row with the title "Share recipe" and a close X (icon button) at its end; link field (read-only) with Copy; note "Friends can read and scale it. Your bake log stays private."; Revoke link. With no link yet, a "Create link" action replaces the field. Revoke asks for confirmation inside the sheet before acting. After Copy, a short "Link copied" confirmation appears inside the dialog. No empty space below the last element. Dismissed by the close X, Esc, tapping the backdrop, or swiping down on mobile. Focus is trapped inside and returns to Share on close |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A "Library" back link in the Header (not in SKELETON's Contextual navigation; added because on mobile the logo alone doesn't read as "back").
- **Assumed**: The category label is not a link to the filtered Library; SKELETON defines no such contextual link, and the back link already returns to Library.
- **Assumed**: Step numbers continue across groups, so Bake Mode's `?step=` stays a single sequence. Tips are outside the sequence, so a tip never becomes "step 13".
- **Decided** (2026-10-15, Nathan): Log bake sits beside Start baking in the action bar as a secondary button, replacing Mark as baked at the end of the page; it opens the Log sheet, where rating, notes and a photo are entered together. No Undo is needed any more: nothing is saved until Save in the sheet.
- **Decided** (2026-10-15, Nathan): The rating shown here is read-only, the latest rated bake's (SKELETON 1.5.0); there is no Rating prompt on this page.
- **Assumed**: Scale presets ½×, 1×, 1.5×, 2× plus Custom, limited to 0.25× to 10×.
- **Assumed**: Grams rounded to whole numbers, with one decimal under 10 g (yeast, salt, baking soda, where a gram matters), shown only when it isn't zero: "3.5 g", "8 g".
- **Assumed**: The original stated amount for Converted items is revealed on tap, not always visible, to keep rows short on a phone.
- **Assumed**: Ingredients stick beside Steps on desktop and tablet. Tablet splits its 8 columns 4 and 4, not 3 and 5: at 3 columns (about 255px at 768) the Scale presets overflowed and "1×" fell under 48px (accessibility audit). Stacking everything on tablet was rejected, because a propped-up iPad is exactly when grams should sit beside the step.
- **Assumed**: Start baking moves from a sticky bottom bar (mobile) to the Header (desktop). DOM order puts it in the Header on both; on mobile it is visually pinned to the bottom.
- **Assumed**: A "Link copied" confirmation inside the Share dialog (not in SKELETON).
- **Open**: Scaling by pan size or servings (SKELETON open question). If added, Scale grows a second mode; the current row is drawn to allow it.
- **Decided** (2026-10-15, Nathan, visual upgrade round): The picture becomes a full-bleed 4:3 cover at the top on mobile, with the page's controls floating on it, instead of a 96×128 thumbnail beside the title, which he didn't like. The trade-off accepted: the Scale presets move one short scroll below the first viewport, and the sticky section tabs make the rest of the page one tap away. Reference: Osta's recipe page structure (not its styling).
- **Assumed**: Hand-entered recipes without a cover show no cover area and no placeholder; the page starts with the back row.
- **Assumed**: Section tabs scroll instead of switching panels, so ingredients and steps are never hidden from each other.
- **Open**: Choosing the cover's focal point, and removing a reel cover without adding a bake photo. Not drawn yet.

---

## CHANGE LOG

- 1.6.0 (2026-10-15): Visual upgrade round: full-bleed 4:3 cover with picture buttons (mobile), cover beside the text on desktop; one credit line; read-only rating from the latest rated bake; sticky section tabs (Ingredients, Steps, Bakes); Scale without a visible heading; Latest Bake becomes Bakes (up to 3 entries with photo and stars); Log bake beside Start baking opens the Log sheet; Mark as baked, its Undo and the Rating prompt removed (SKELETON 1.5.0).
- 1.5.2 (2026-10-15): Open note: the Header picture is to be redesigned in the visual upgrade round.
- 1.5.1 (2026-10-14): Tips group: last, unnumbered, no time marks (SKELETON 1.4.4).
- 1.5.0 (2026-10-13): Recipe picture in the Header, beside the title block (96×128 mobile, 144×192 desktop); none for recipes without one (SKELETON 1.4.2).
- 1.4.1 (2026-10-13): Ingredient notes show as a muted line under the ingredient (SKELETON 1.4.0).
- 1.4.0 (2026-09-30): Tablet split is 4 + 4 columns (Scale and Ingredients / Steps), after the accessibility audit found the Scale control overflowing at 3 columns.
- 1.3.0 (2026-09-30): After the first build review: overlays sized to their content with a close X in the header; large stars in the Rating prompt; no trailing ".0" on amounts.
- 1.2.1 (2026-09-29): Desktop header actions in one row beside the title (Favorite, Share, Edit, Start baking), after the visual review.
- 1.2.0 (2026-09-29): Added the category label to the Header (SKELETON 1.2.0).
- 1.1.0 (2026-09-29): Added Favorite, Rating, Mark as baked with Undo, Rating prompt, and component group headings for ingredients and steps (SKELETON 1.1.0).
- 1.0.0 (2026-09-29): Initial wireframe.
