# BONES: `/r/:shareToken` (Shared Recipe)

> **Source**: SKELETON.md v1.3.2, `/r/:shareToken`
> **Primary Action**: Watch the original reel → external link (credit to the creator)
> **Primary Device**: mobile, because friends open the link from a message on their phone
> **Shell**: BONES-shell.md, Share variant
> **Version**: 1.2.0 · **Updated**: 2026-10-16

This page reuses the Scale, Ingredients, and Steps layouts from BONES-recipes-detail.md. Only the differences are described here.

---

## 1. STRUCTURE

```text
MAIN
├── HERO: AZULEJO_FIELD + RECORD_CARD
│   ├── recipe     RECIPE_TITLE             H1
│   ├── shared by  Nate's kitchen           (voice italic)
│   ├── from       @CREATOR
│   ├── kind       CATEGORY
│   ├── rating     STARS (read-only, row hidden when unrated)
│   ├── yield      YIELD · TOTAL_TIME
│   └── WATCH_THE_ORIGINAL_REEL (button-primary, in the card)
├── SCALE                                   H2
├── INGREDIENTS                             H2
│   ├── GROUP_HEADING                       H3
│   └── INGREDIENT_ROW × n
└── STEPS                                   H2
    ├── GROUP_HEADING                       H3
    └── STEP × n
```

**First viewport (mobile)**: a short azulejo field with the record card overlapping it (recipe, shared by, from, kind, rating, yield) and Watch the original reel at the end of the card; the Scale choices are a short scroll below.

---

## 2. SECTIONS

### Hero (SKELETON section 1)
- **Layout**: shared pages never show photos (they live in private storage; see Open), so the azulejo field is always the hero, which makes the page look deliberate rather than bare (SKIN `azulejo-fill` + `record-card`, as on the Recipe page without a cover). Desktop and tablet: a full-width field, about half a viewport tall, with the record card centred on it (at most 400px wide); mobile: a 200px field with the card overlapping its bottom edge by 32px, inset by the gutter. A 120px pause (48px on mobile) before Scale
- **Content** (a description list): `recipe` the title, the H1 (wraps, never truncates) · `shared by` "Nate's kitchen" in the voice italic · `from` "@creator" (row hidden for hand-entered recipes) · `kind` the category · `rating` cobalt stars, read-only, labeled "Rated 4 out of 5" (row hidden when unrated; the latest rated bake's rating, SKELETON 1.5.0; friends never see the bakes) · `yield` yield at the current scale and total time. At the end of the card: Watch the original reel (`button-primary`, the ochre pill, full width of the card), opening the reel in a new tab. No back link, favorite, share, or edit
- **Behavior**: yield updates with the scale

```text
DESKTOP
+-----------------------------------------------------------------------+
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚  +-------------------------------+  ▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚  | recipe            PÃO DE DEUS |  ▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚  | shared by      Nate's kitchen |  ▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚  | from               @CREATOR   |  ▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚  | rating                 ★★★★☆  |  ▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚  | yield       12 ROLLS · 3 H 40 |  ▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚  | (  WATCH THE ORIGINAL REEL  ) |  ▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚  +-------------------------------+  ▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚|
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
|▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞|
|▚▞▚ +------------------------------+▞▚|
+----| recipe          PÃO DE DEUS  |--+
     | shared by    Nate's kitchen  |
     | from             @CREATOR    |
     | rating               ★★★★☆   |
     | yield     12 ROLLS · 3 H 40  |
     | ( WATCH THE ORIGINAL REEL )  |
     +------------------------------+
```

### Scale (SKELETON section 2)
- **Layout and content**: as in BONES-recipes-detail.md: `choice-radio`s on the Ingredients heading line (½×, 1×, 1.5×, 2×, Custom; writes `?scale=`)
- **Behavior**: the friend's scale lives only in their URL; it never changes Nathan's recipe

### Ingredients (SKELETON section 3)
- **Layout and content**: as in BONES-recipes-detail.md, with one difference: only the Estimated marker shows (labeled "Estimated amount"), so the friend knows which amounts are guesses; the Converted marker and its "was 1 cup" reveal are not shown; ingredient notes are not shown either (they can hold the owner's own remarks)
- **Behavior**: sticky beside Steps on desktop and tablet, as on the Recipe page, with the same column split: 4 of 12 on desktop and 4 of 8 on tablet (Steps takes the other 8 or 4), so the Scale presets never overflow

### Steps (SKELETON section 4)
- **Layout and content**: as in BONES-recipes-detail.md: numbered continuously across groups, full text, detected times marked but not interactive; the Tips group shows last and unnumbered, as there. Tips are the creator's, so friends see them

```text
DESKTOP (below the Header)
+-------------------------------+---------------------------------------+
| SCALE                         | STEPS                                 |
| INGREDIENTS                   | GROUP_NAME                            |
|  (sticky)                     | 1  STEP_TEXT ...................      |
|                               | 2  STEP_TEXT ...................      |
+-------------------------------+---------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| SCALE                                |
| [½×] [1×] [1.5×] [2×] [CUSTOM]       |
| INGREDIENTS                          |
| GROUP_NAME                           |
| INGREDIENT_NAME               000 g  |
|   [ESTIMATED]                        |
| STEPS                                |
| 1  STEP_TEXT .....................   |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Recipe not yet loaded | The azulejo field renders at once with the record card's outline and 5 row placeholders; then scale row, 8 ingredient rows, 4 steps |
| No source | The recipe was entered by hand, with no reel | The `from` row and Watch the original reel hide; the card ends with yield |
| Invalid scale | `?scale=` missing, not a number, or outside 0.25–10 | Renders at 1× and corrects the URL, as on the Recipe page |
| Link revoked or unknown | Token revoked, unknown, or its recipe deleted | Goes to `/r/expired` (SKELETON) |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Decided** (2026-10-16, personality round): The shared page is the one screen people outside the app see, so it gets the same record card as the Recipe page, on the azulejo field (shared pages never show photos). "Shared by Nate" becomes the row "shared by · Nate's kitchen".
- **Assumed**: Watch the original reel sits in the record card, not in a sticky bar. It is SKELETON's primary action, but a friend's real job here is reading, so it shouldn't follow them down the page.
- **Assumed**: The Converted marker is hidden from friends; a conversion is a confident value, and SKELETON only asks for Estimated markers here.
- **Assumed**: No back link or navigation into the owner area (SKELETON: Shared Recipe links only to the original reel).
- **Open**: Bake Mode for friends (SKELETON open question). If added, a "Start baking" action joins the Header and Bake Mode runs without the log step.

- **Open** (2026-10-13): The recipe picture on shared pages. Not shown for now: pictures live in private storage that only the owner can read, and opening them to friends needs its own secure path (a short-lived link made by the server per share). Worth adding once import works.

---

## CHANGE LOG

- 1.2.0 (2026-10-16): Personality round: the Header becomes the Hero, a record card (recipe, shared by, from, kind, rating, yield, and Watch the original reel) on the azulejo field; scale as choice radios.
- 1.1.5 (2026-10-15): The rating shown is the latest rated bake's (SKELETON 1.5.0); styling follows the new SKIN (porcelain canvas, no tile marks before headings).
- 1.1.4 (2026-10-14): Shared pages show the Tips group, last and unnumbered (SKELETON 1.4.4).
- 1.1.3 (2026-10-13): The recipe picture isn't shown on shared pages for now (open question).
- 1.1.2 (2026-10-13): Ingredient notes aren't shown on shared pages.
- 1.1.1 (2026-10-01): App renamed to Nate’s Bakery; "Shared by Nate".
- 1.1.0 (2026-09-30): Tablet split is 4 + 4 columns, matching BONES-recipes-detail 1.4.0 (accessibility audit).
- 1.0.0 (2026-09-29): Initial wireframe.
