# BONES: `/r/:shareToken` (Shared Recipe)

> **Source**: SKELETON.md v1.3.2, `/r/:shareToken`
> **Primary Action**: Watch the original reel → external link (credit to the creator)
> **Primary Device**: mobile, because friends open the link from a message on their phone
> **Shell**: BONES-shell.md, Share variant
> **Version**: 1.1.2 · **Updated**: 2026-10-13

This page reuses the Scale, Ingredients, and Steps layouts from BONES-recipes-detail.md. Only the differences are described here.

---

## 1. STRUCTURE

```text
MAIN
├── HEADER
│   ├── CATEGORY
│   ├── RECIPE_TITLE                        H1
│   ├── SHARED_BY ("Shared by Nate")
│   ├── RATING (read-only, hidden when unrated)
│   ├── SOURCE_CREDIT (@creator)
│   ├── YIELD · TOTAL_TIME
│   └── WATCH_THE_ORIGINAL_REEL
├── SCALE                                   H2
├── INGREDIENTS                             H2
│   ├── GROUP_HEADING                       H3
│   └── INGREDIENT_ROW × n
└── STEPS                                   H2
    ├── GROUP_HEADING                       H3
    └── STEP × n
```

**First viewport (mobile)**: category, title, "Shared by Nate", rating, creator, yield and time, Watch the original reel, and the Scale presets.

---

## 2. SECTIONS

### Header (SKELETON section 1)
- **Layout**: desktop full width: title block 9 cols, Watch the original reel 3 cols right-aligned; mobile single column, with Watch the original reel full width at the end of the header
- **Content**: category label; title (wraps, never truncates); "Shared by Nate"; rating as stars, read-only, labeled "Rated 4 out of 5" for screen readers, hidden when unrated; "@creator"; yield at the current scale and total time; Watch the original reel, opening the reel in a new tab. No back link, favorite, share, or edit
- **Behavior**: yield updates with the scale

```text
DESKTOP
+----------------------------------------------------+------------------+
| CATEGORY                                           |                  |
| RECIPE_TITLE                                       | [WATCH THE       |
| SHARED BY NATHAN · ★★★★☆                           |  ORIGINAL REEL]  |
| @CREATOR · YIELD · TOTAL_TIME                      |                  |
+----------------------------------------------------+------------------+
```

```text
MOBILE
+--------------------------------------+
| CATEGORY                             |
| RECIPE_TITLE                         |
| SHARED BY NATHAN · ★★★★☆             |
| @CREATOR                             |
| YIELD · TOTAL_TIME                   |
| [   WATCH THE ORIGINAL REEL   ]      |
+--------------------------------------+
```

### Scale (SKELETON section 2)
- **Layout and content**: as in BONES-recipes-detail.md (presets ½×, 1×, 1.5×, 2×, Custom; writes `?scale=`)
- **Behavior**: the friend's scale lives only in their URL; it never changes Nathan's recipe

### Ingredients (SKELETON section 3)
- **Layout and content**: as in BONES-recipes-detail.md, with one difference: only the Estimated marker shows (labeled "Estimated amount"), so the friend knows which amounts are guesses; the Converted marker and its "was 1 cup" reveal are not shown; ingredient notes are not shown either (they can hold the owner's own remarks)
- **Behavior**: sticky beside Steps on desktop and tablet, as on the Recipe page, with the same column split: 4 of 12 on desktop and 4 of 8 on tablet (Steps takes the other 8 or 4), so the Scale presets never overflow

### Steps (SKELETON section 4)
- **Layout and content**: as in BONES-recipes-detail.md: numbered continuously across groups, full text, detected times marked but not interactive

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
| Loading | Recipe not yet loaded | Placeholders in final proportions: header block, scale row, 8 ingredient rows, 4 steps |
| No source | The recipe was entered by hand, with no reel | Watch the original reel and the creator line hide; the header ends with yield and time |
| Invalid scale | `?scale=` missing, not a number, or outside 0.25–10 | Renders at 1× and corrects the URL, as on the Recipe page |
| Link revoked or unknown | Token revoked, unknown, or its recipe deleted | Goes to `/r/expired` (SKELETON) |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: Watch the original reel sits in the Header, not in a sticky bar. It is SKELETON's primary action, but a friend's real job here is reading, so it shouldn't follow them down the page.
- **Assumed**: The Converted marker is hidden from friends; a conversion is a confident value, and SKELETON only asks for Estimated markers here.
- **Assumed**: No back link or navigation into the owner area (SKELETON: Shared Recipe links only to the original reel).
- **Open**: Bake Mode for friends (SKELETON open question). If added, a "Start baking" action joins the Header and Bake Mode runs without the log step.

---

## CHANGE LOG

- 1.1.2 (2026-10-13): Ingredient notes aren't shown on shared pages.
- 1.1.1 (2026-10-01): App renamed to Nate’s Bakery; "Shared by Nate".
- 1.1.0 (2026-09-30): Tablet split is 4 + 4 columns, matching BONES-recipes-detail 1.4.0 (accessibility audit).
- 1.0.0 (2026-09-29): Initial wireframe.
