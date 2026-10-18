# BONES: `/recipes/:recipeId` (Recipe)

> **Source**: SKELETON.md v1.5.0, `/recipes/:recipeId`
> **Primary Action**: Start baking → `/recipes/:recipeId/bake?scale=`
> **Primary Device**: mobile, because the persona reads recipes on an iPhone in the kitchen, often from arm's length with busy hands
> **Shell**: BONES-shell.md, App variant (no tab bar; on mobile and tablet the cover or the azulejo field replaces the header)
> **Version**: 1.7.1 · **Updated**: 2026-10-17

---

## 1. STRUCTURE

```text
MAIN
├── HERO
│   ├── mobile / tablet: COVER (or AZULEJO_FIELD) + RECORD_CARD overlapping its bottom edge
│   │   └── on the cover: BACK, FAVORITE, SHARE, EDIT (picture buttons)
│   └── desktop: SPLIT_HERO
│       ├── left: TOP_ROW (BACK · FAVORITE, SHARE, EDIT) + STAGED_PHOTO + PHOTO_SWITCH
│       └── right: AZULEJO_FIELD + RECORD_CARD (with START BAKING · LOG BAKE)
│   RECORD_CARD
│   ├── recipe   RECIPE_TITLE                  H1
│   ├── from     @CREATOR · Watch reel        (voice italic)
│   ├── kind     CATEGORY
│   ├── rating   STARS (read-only: latest rated bake)
│   ├── baked    4 times · last 28 Sep
│   └── yield    12 rolls · 3 h 40
├── SECTION_TABS (sticky): Ingredients · Steps · Bakes
├── ESTIMATES_NOTICE (state: Has estimates)
├── INGREDIENTS                             H2, with SCALE (choice radios) on its heading line
│   ├── GROUP_HEADING                       H3 (when grouped)
│   └── INGREDIENT_ROW × n
├── STEPS                                   H2
│   ├── LAST_NOTE (latest bake's "What changed", when there is one)
│   ├── GROUP_HEADING                       H3 (when grouped)
│   └── STEP × n
├── BAKES                                   H2
│   ├── BAKE_ENTRY × up to 3
│   └── SEE_ALL_BAKES
└── ACTION_BAR (sticky, mobile and tablet): LOG BAKE · START BAKING
```

**First viewport (mobile)**: the cover (about 290px tall on a 390px phone) with Back, Favorite, Share and Edit on it, and the record card overlapping its bottom edge by 32px, showing recipe, from, rating and baked (kind and yield may fall just below the fold on a 667px-tall phone), plus the sticky action bar. **First viewport (desktop)**: the whole split hero, capped at one screen (760px at most), with everything about the recipe and both actions in the record card; ingredients and steps start after a 120px pause.

---

## 2. SECTIONS

### Hero (SKELETON section 1)
- **Layout, desktop (1280px and up)**: SKIN `split-hero`, two equal halves with an ink rule between them; the right half's azulejo field bleeds to the right edge of the window (the left half keeps the content column's left edge), at most one viewport tall (capped at 760px). Left half: a top row with "‹ Library" at its start and Favorite, Share, Edit (`icon-button`s) at its end; under it, the photo staged like a framed print (glazed-card mat, ink frame, at most 72% of the half's width, centred); under the photo, the photo switch. Right half: `azulejo-fill` edge to edge with the record card centred on it (at most 400px wide). The app header stays above the hero on desktop
- **Layout, mobile and tablet (under 1280px)**: the cover full bleed at the very top (SKIN `cover-picture`, 4:3, under the status bar on mobile; inside the content column, capped at 56% of the viewport height, on tablet), with Back on its top-left corner and Favorite, Share, Edit on its top-right as `picture-button`s; the record card overlaps the cover's bottom edge by 32px, inset by the page gutter (on tablet too, where the cover sits inside the content column). Start baking and Log bake live in the action bar, not in the card
- **No cover (any size)**: the azulejo field takes the cover's place. Desktop: the same top row as the split hero ("‹ Library" at its start, Favorite, Share, Edit as `icon-button`s at its end) above one full-width field at half the split hero's height, with the card centred on it; no buttons float on the pattern on desktop. Mobile and tablet: a 200px-tall field with Back, Favorite, Share, Edit on it as `picture-button`s and the card overlapping its bottom edge. A recipe without a photo looks deliberate, not empty
- **Record card content** (SKIN `record-card`, a description list): `recipe` the title (the page's H1, Fraunces, wraps, never truncates) · `from` "@creator · Watch reel" in the voice italic (Watch reel opens the reel in a new tab; a hand-entered recipe shows its source text, or the row is hidden) · `kind` the category · `rating` cobalt stars, read-only, from the latest rated bake (row hidden when nothing is rated) · `baked` "4 times · last 28 Sep" or "Not yet" · `yield` "12 rolls · 3 h 40" (parts hide when missing). Desktop adds the two actions at the bottom of the card: Start baking (`button-primary`, with the scale when it isn't 1×) and Log bake (`button-secondary`), side by side
- **Photo switch** (desktop, SKIN `choice-radio`): "(●) Latest bake  ( ) Cover  ( ) Last 4". Shown only when there are at least two distinct photos; options that would show the same photo are left out. Last 4 turns the frame into a 2×2 contact sheet of the four newest bake photos. The choice is a view preference, not saved. Under it, nothing else
- **Picture**: the cover is the recipe's cover (SKELETON 1.5.0): a bake photo set as cover, else the reel thumbnail. Decorative (empty alt), since the title names the recipe. Space reserved before it loads
- **Behavior**: yield updates when the scale changes. Favorite toggles in place. The stars are not a control: a bake's rating is set in the Log sheet. Tapping the rating row scrolls to Bakes

```text
DESKTOP (split hero, first viewport)
+-----------------------------------+-----------------------------------+
| < LIBRARY             [♥][⇪][✎]  |▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
|                                   |▚▞▚ +---------------------------+▞▚|
|      +---------------------+      |▚▞▚ | recipe        PÃO DE DEUS | ▞▚|
|      |  +---------------+  |      |▚▞▚ | from   Avó Lurdes, via reel| ▞▚|
|      |  |  BAKE PHOTO   |  |      |▚▞▚ | kind                 BREAD | ▞▚|
|      |  |   (staged)    |  |      |▚▞▚ | rating               ★★★★☆ | ▞▚|
|      |  +---------------+  |      |▚▞▚ | baked     4 times · 28 SEP | ▞▚|
|      +---------------------+      |▚▞▚ | yield    12 ROLLS · 3 H 40 | ▞▚|
|                                   |▚▞▚ | (START BAKING) (LOG BAKE) | ▞▚|
|  (●) LATEST BAKE ( ) COVER ( ) LAST 4 |▚ +---------------------------+▞▚|
+-----------------------------------+-----------------------------------+
                        ... 120px pause ...
```

```text
MOBILE (with cover)
+--------------------------------------+
|(<)                       (♥)(⇪)(✎)  |
|                                      |
|              COVER 4:3               |
|  +--------------------------------+  |
+--|--------------------------------|--+
   | recipe           PÃO DE DEUS   |
   | from   Avó Lurdes, via reel    |
   | rating                ★★★★☆    |
   | baked     4 times · last 28 Sep|
   | yield       12 rolls · 3 h 40  |
   +--------------------------------+
```

### Section tabs (SKELETON section 2)
- **Layout**: full width under the Hero on mobile; across the full content width on tablet and desktop. Sticks to the top of the screen once the Hero has scrolled away (SKIN `section-tabs`: mono labels, ink rule under the row, cobalt bar under the current tab)
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
- **Layout**: one row directly under the H2 "Ingredients" on every device (the four-column desktop column is too narrow to share the heading line). SKIN `choice-radio`s in a fieldset with the accessible name "Scale", with the compact gap; each choice keeps a 48px target; when the row doesn't fit, it wraps with no extra row gap (never scrolls, never shrinks)
- **Content**: "( ) ½×  (●) 1×  ( ) 1.5×  ( ) 2×  ( ) Custom"; Custom reveals a number field in the same row (0.25× to 10×)
- **Behavior**: changing the value updates `?scale=` in place (no navigation), every amount, the yield in the record card, and the Start baking label

```text
DESKTOP (left column)
+---------------------------------------------+
| INGREDIENTS     ( ) ½× (●) 1× ( ) 2× ( ) …  |
+---------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| INGREDIENTS                          |
| ( ) ½×  (●) 1×  ( ) 1.5×  ( ) 2×     |
| ( ) CUSTOM                           |
+--------------------------------------+
```

### Ingredients (SKELETON section 4)
- **Layout**: desktop left column (4 of 12 cols; 4 of 8 on tablet), sticky while Steps scroll past it, so amounts stay visible while reading steps; mobile full width. The 120px pause (SKIN `{spacing.section-lg}`; 48px on mobile) sits between the hero and the section tabs; after the tabs (and the estimates notice, when shown) content follows at the normal section gap (`{spacing.xl}` desktop, `{spacing.lg}` mobile). The tabs' ink rule spans the content column, aligned with its edges. Rows ruled in ink (SKIN `ingredient-row`)
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
- **Content**: when the latest bake has a "What changed" note, it opens the section as one quoted line in the voice italic, muted: "Last time: 5 min less in the oven, tops browned fast." (links to that bake). Then numbered steps in order, full text, no truncation; times detected in the text ("25 minutes") are marked inline but are not interactive here (they become timers in Bake Mode). When the recipe has step groups (Crust, Filling, Assembly, Baking…), each gets a heading; numbering continues across groups (1–12, not 1–4 per group), so "step 7" means one thing everywhere, including Bake Mode's `?step=`. The exception is the **Tips** group (creator tips about the whole recipe, SKELETON 1.4.4): always last, headed "Tips", its items a plain unnumbered list in body text, with no time marks; they don't count in the step numbering
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
- **Behavior**: a bake saved from the Log sheet appears at the top of the list when the sheet closes; the save itself is confirmed by the celebration screen or toast (BONES-recipes-log.md)

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
- **Layout**: mobile and tablet; pinned to the bottom edge, full width, above the home indicator area; Log bake (`button-secondary`, an outlined pill sized to its label) at the start and Start baking (`button-primary`, the ochre pill) taking the rest of the row; the page reserves space at its end so the bar never covers the last content. On desktop both actions live in the record card
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
| Loading | Recipe data not yet loaded | Placeholders in final proportions: a grout cover area (always reserved, because the loading screen can't know yet whether the recipe has a cover; most imported recipes do, so this is the smaller jump) with the record card's outline and 5 row placeholders over its edge; on desktop the split hero with a grout frame on the left and the azulejo field on the right; 8 ingredient rows, 4 steps; action bar shown disabled |
| Has estimates | Any ingredient is still Estimated | A one-line notice between the section tabs and Ingredients: "3 amounts are estimates. Confirm them" → `/recipes/:recipeId/edit`; full width on both devices |
| Never baked | Bake log is empty | Bakes reduces to one line "Not baked yet"; See all bakes is hidden; the section tab reads "Bakes" without a count |
| No cover | Recipe has no cover picture | The azulejo field takes the cover's place (desktop: one full-width field, no split; mobile: 200px tall), with the picture buttons on it and the record card overlapping its edge |
| Log sheet | Log bake | As defined in BONES-recipes-log.md (Log sheet), opened over this page |
| Invalid scale | `?scale=` missing, not a number, or outside 0.25–10 | Page renders at 1× and the URL is corrected; no error shown |
| Not found | Unknown `:recipeId` | System not-found page (SKELETON) |
| Share dialog | Share in the Hero | Mobile: bottom sheet sized to its content (up to 90% of the viewport); desktop: centered modal, 5 cols wide, sized to its content. Order: a header row with the title "Share recipe" and a close X (icon button) at its end; link field (read-only) with Copy; note "Friends can read and scale it. Your bake log stays private."; Revoke link. With no link yet, a "Create link" action replaces the field. Revoke asks for confirmation inside the sheet before acting. After Copy, a short "Link copied" confirmation appears inside the dialog. No empty space below the last element. Dismissed by the close X, Esc, tapping the backdrop, or swiping down on mobile. Focus is trapped inside and returns to Share on close |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A "Library" back link in the Hero (not in SKELETON's Contextual navigation; added because on mobile the logo alone doesn't read as "back").
- **Assumed**: The category label is not a link to the filtered Library; SKELETON defines no such contextual link, and the back link already returns to Library.
- **Assumed**: Step numbers continue across groups, so Bake Mode's `?step=` stays a single sequence. Tips are outside the sequence, so a tip never becomes "step 13".
- **Decided** (2026-10-15, Nathan): Log bake sits beside Start baking in the action bar as a secondary button, replacing Mark as baked at the end of the page; it opens the Log sheet, where rating, notes and a photo are entered together. No Undo is needed any more: nothing is saved until Save in the sheet.
- **Decided** (2026-10-15, Nathan): The rating shown here is read-only, the latest rated bake's (SKELETON 1.5.0); there is no Rating prompt on this page.
- **Assumed**: Scale presets ½×, 1×, 1.5×, 2× plus Custom, limited to 0.25× to 10×.
- **Assumed**: Grams rounded to whole numbers, with one decimal under 10 g (yeast, salt, baking soda, where a gram matters), shown only when it isn't zero: "3.5 g", "8 g".
- **Assumed**: The original stated amount for Converted items is revealed on tap, not always visible, to keep rows short on a phone.
- **Assumed**: Ingredients stick beside Steps on desktop and tablet. Tablet splits its 8 columns 4 and 4, not 3 and 5: at 3 columns (about 255px at 768) the Scale presets overflowed and "1×" fell under 48px (accessibility audit). Stacking everything on tablet was rejected, because a propped-up iPad is exactly when grams should sit beside the step.
- **Assumed**: Start baking moves from a sticky bottom bar (mobile and tablet) to the record card (desktop). DOM order puts it in the record card on both; on mobile it is visually pinned to the bottom.
- **Assumed**: A "Link copied" confirmation inside the Share dialog (not in SKELETON).
- **Open**: Scaling by pan size or servings (SKELETON open question). If added, Scale grows a second mode; the current row is drawn to allow it.
- **Decided** (2026-10-15, Nathan, visual upgrade round): The picture becomes a full-bleed 4:3 cover at the top on mobile, with the page's controls floating on it, instead of a 96×128 thumbnail beside the title, which he didn't like. The trade-off accepted: the Scale presets move one short scroll below the first viewport, and the sticky section tabs make the rest of the page one tap away. Reference: Osta's recipe page structure (not its styling).
- **Decided** (2026-10-16, Nathan, personality round): The recipe reads as a record card (references: Object & Archive's catalogue card). Desktop uses a split hero: the photo staged as a framed print on the left, the azulejo field with the record card on the right, one screen tall at most. This resolves the "cover too big on desktop" problem: the photo is still big, but everything about the recipe and both actions share the first screen with it. Mobile keeps the full-bleed cover, with the card overlapping it.
- **Decided** (2026-10-16): A recipe without a cover shows the azulejo field instead of nothing (replaces the back-row-only start).
- **Assumed**: The photo switch is a view preference, not saved, and only appears with two or more distinct photos.
- **Assumed**: The latest bake's "What changed" note opens the Steps section, because it is exactly what you need to remember before starting.
- **Assumed**: Section tabs scroll instead of switching panels, so ingredients and steps are never hidden from each other.
- **Open**: Choosing the cover's focal point, and removing a reel cover without adding a bake photo. Not drawn yet.

---

## CHANGE LOG

- 1.7.1 (2026-10-17): From the Stage 3 review: desktop no-cover hero keeps the split hero's top row (no buttons on the pattern); the split hero's azulejo half bleeds to the window's right edge; the card overlaps the cover on tablet too; scale always on its own row under the heading, compact gap, no extra row gap when wrapping; the 120px pause moves before the section tabs; the tabs' rule aligns with the content column; the record card's title row is stacked (SKIN).
- 1.7.0 (2026-10-16): Personality round (SKIN October 2026): the Header becomes the Hero with a record card (recipe, from, kind, rating, baked, yield); desktop split hero (staged photo with a photo switch, azulejo field with the card and both actions), capped at one screen; mobile cover with the card overlapping; azulejo field for recipes without a cover; scale as choice radios on the Ingredients heading line; the latest "What changed" note opens Steps; 120px pause before the content on desktop; action bar on tablet too.
- 1.6.1 (2026-10-16): From the build: the loading cover area is always reserved; the desktop prose now matches the diagram (Start baking full width under the rating line).

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
