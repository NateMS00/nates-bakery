# BONES: `/bakes` (Bakes)

> **Source**: SKELETON.md v1.5.0, `/bakes`
> **Primary Action**: none; a reading page (bakes are logged from a recipe)
> **Primary Device**: mobile, because the persona looks back at bakes on the iPhone, often when deciding what to bake next or remembering what went wrong last time
> **Shell**: BONES-shell.md, App variant (the Bakes tab in the installed app)
> **Version**: 1.1.0 · **Updated**: 2026-10-16

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_HEADER
│   ├── PAGE_TITLE "Your bakes."            H1 (display title)
│   └── SUMMARY ("7 bakes this year · 5 recipes")
├── MONTH × n (newest first)                H2 "October"
│   ├── MONTH_COUNT ("3 bakes")
│   ├── BAKE_TILE × n (bakes with a photo, grid)
│   └── BAKE_ROW × n (bakes without a photo, full width)
└── SHOW_MORE (older months)
```

**First viewport (mobile)**: title and summary, the current month's heading, and its first two photo tiles with their titles and stars, or the first rows when there are no photos.

---

## 2. SECTIONS

### Page header
- **Layout**: desktop the content column, title on the left; mobile full width
- **Content**: SKIN `display-title` "Your *bakes.*" ("bakes." in Fraunces italic; the tab and page title stay "Bakes"); summary in muted text: "7 bakes this year · 5 recipes" (bakes logged in the current calendar year, and how many different recipes they cover); hidden when empty
- **Behavior**: none

```text
MOBILE
+--------------------------------------+
| YOUR                                 |
| *BAKES.*                             |
| 7 BAKES THIS YEAR · 5 RECIPES        |
+--------------------------------------+
```

### Diary (SKELETON section 2)
- **Layout**: months stacked, newest first, `{spacing.2xl}` apart (`{spacing.section}` on desktop), each with its name as an H2 in Fraunces at `display-md` (34px, 44px on desktop) on the left and its count in `label-mono` on the right, over an ink rule, like the chapters of a diary. Within a month, in date order (newest first): bakes with a photo as `bake-tile`s in a grid, 2 columns on mobile, 3 on tablet, 4 on desktop; bakes without a photo as full-width `card` rows. Tiles and rows keep date order between them: a run of photo bakes forms a grid block, a bake without a photo breaks it with a row, then the grid resumes. Months older than the current year show the year ("September 2025")
- **Content**: **bake tile**: the bake photo, square, with a date `picture-chip` in its top-left corner ("15" over "Thu"); the recipe title in bold (2 lines, then truncates); one meta line: that bake's stars in cobalt (none when unrated), then "2nd bake" (its number among that recipe's bakes, from the second on) or the scale when it isn't 1×. **bake row**: a 52px `azulejo-fill` square in place of a photo, framed in ink, the recipe title with the date ("Pastel de nata · 2 Oct"), one line of the bake's note (How it turned out, else What changed; truncated), and its stars. 40 bakes, then Show more loads older ones below
- **Behavior**: each tile or row is one link to that bake in its Log sheet (`/recipes/:recipeId/log?edit=<entryId>`), where it can be read in full, edited, or the recipe opened. The tile's accessible name reads the whole bake: "Pastel de nata, Thursday 15 October, 5 stars, second bake"

```text
MOBILE
+--------------------------------------+
| OCTOBER                      3 BAKES |
| ------------------------------------ |
| +---------------+ +---------------+  |
| |[15]           | |[13]           |  |
| |     PHOTO     | |     PHOTO     |  |
| |               | |               |  |
| +---------------+ +---------------+  |
| RECIPE_TITLE      RECIPE_TITLE       |
| ★★★★★ · 2ND BAKE  ★★★★☆ · 1.5×       |
| +----------------------------------+ |
| |[TILE] RECIPE · 2 OCT             | |
| |       NOTE PREVIEW...      ★★★☆☆ | |
| +----------------------------------+ |
| SEPTEMBER                    4 BAKES |
+--------------------------------------+
```

```text
DESKTOP (4 columns)
+-----------------------------------------------------------------------+
| OCTOBER                                                       3 BAKES |
| +-----------+ +-----------+                                           |
| |[15] PHOTO | |[13] PHOTO |                                           |
| +-----------+ +-----------+                                           |
| TITLE         TITLE                                                   |
| ★★★★★         ★★★★☆ · 1.5×                                            |
| [TILE] RECIPE · 2 OCT · NOTE PREVIEW...                       ★★★☆☆   |
+-----------------------------------------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Bakes not yet loaded | Title renders; one month heading and 4 placeholder tiles in final proportions |
| Empty | No bakes logged yet | Summary hides; Nathan's empty-Bakes illustration (a tile panel until it exists), "Nothing out of the oven *yet.*" in `display-md`, one sentence ("Log a bake from any recipe and it shows up here, with its photo and how it went."), and a "Go to Library" link → `/recipes` |
| Log sheet | A tile or row | The bake opens in the Log sheet (BONES-recipes-log.md) over this page; closing returns here at the same scroll position |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Decided** (2026-10-15, Nathan): A general bake history across recipes, framed as a diary (reference: Letterboxd's diary, where each entry is the date you did it, with an optional rating and note; scrolling back shows patterns you'd otherwise miss).
- **Assumed**: Grouped by month, not by week: Nathan bakes about once a month, so a week grouping would be mostly empty.
- **Assumed**: Bakes without a photo are rows, not tiles with an empty frame, so the grid shows only real photos.
- **Assumed**: "2nd bake" connects bakes of the same recipe, so per-bake ratings read as progress (3 stars, then 5).
- **Assumed**: No filters or search here yet; the Library filters recipes, and the diary is short. Revisit when it passes a year of bakes.
- **Assumed**: No primary action: logging happens from a recipe, where the scale and recipe are known. An "add a bake" here would first need a recipe picker.
- **Open**: A yearly recap (most baked recipe, best rated bake). Fun for the portfolio; not in this round.

---

## CHANGE LOG

- 1.1.0 (2026-10-16): Month headings as big Fraunces chapter titles with more space between months; bake rows use the azulejo square; empty state copy and illustration.
- 1.0.1 (2026-10-16): Personality round: display title "Your *bakes.*"; tiles and rows follow SKIN October 2026 (ink frames, cobalt stars).
- 1.0.0 (2026-10-15): Initial wireframe (SKELETON 1.5.0).
