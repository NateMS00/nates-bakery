# BONES: `/bakes` (Bakes)

> **Source**: SKELETON.md v1.5.0, `/bakes`
> **Primary Action**: none; a reading page (bakes are logged from a recipe)
> **Primary Device**: mobile, because the persona looks back at bakes on the iPhone, often when deciding what to bake next or remembering what went wrong last time
> **Shell**: BONES-shell.md, App variant (the Bakes tab in the installed app)
> **Version**: 1.2.0 · **Updated**: 2026-10-20

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_HEADER
│   ├── PAGE_TITLE "Your bakes."            H1 (display title)
│   └── SUMMARY ("7 bakes this year · 5 recipes")
├── MONTH × n (newest first)                H2 "October"
│   ├── MONTH_COUNT ("3 bakes")
│   └── BAKE_ROW × n (every bake, newest first)
└── SHOW_MORE (older months)
```

**First viewport (mobile)**: title and summary, the current month's heading, and its first four or five rows.

---

## 2. SECTIONS

### Page header
- **Layout**: desktop 8 of 12 cols from the content column's left edge (the same reading column as the Bake log); mobile full width
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
- **Layout**: one reading column, 8 of 12 cols on desktop from the content column's left edge, full width on mobile. Months stacked, newest first, `{spacing.2xl}` apart (`{spacing.section}` on desktop), each with its name as an H2 in Fraunces at `display-md` (34px, 44px on desktop) on the left and its count in `label-mono` on the right, over an ink rule, like the chapters of a diary. Months older than the current year show the year ("September 2025"). Within a month, every bake is one SKIN `bake-row`, newest first, `{spacing.sm}` apart: there is no photo grid, so the page never shows lonely tiles or gaps, and chronology is never broken
- **Content**: each **bake row**, left to right: a square lead (72px on mobile, 88px from tablet up) that is **the bake photo** when there is one, otherwise **the date block**: the day number in Fraunces 700 ("28") over the weekday in `label-mono` ("sat"), ink on porcelain inside the row's frame, so the date is the visual anchor and photos stand out because they are the exception; then the recipe title in bold `tile-title` (one line, truncates); one meta line in muted caption: when the lead is a photo, the date first ("Sat 28 Sep · "), then that bake's cobalt stars (none when unrated) and "2nd bake" (its number among that recipe's bakes, from the second on) or the scale when it isn't 1×; and, when the bake has a note, one line of it in the voice italic (How it turned out, else What changed; truncated). 40 bakes, then Show more loads older ones below. No azulejo squares: the motif stays for real brand moments
- **Behavior**: each row is one link to that bake in its Log sheet (`/recipes/:recipeId/log?edit=<entryId>`), where it can be read in full, edited, or the recipe opened. Its accessible name reads the whole bake: "Pastéis de nata, Saturday 26 September, 4 stars, third bake"; the date block and photo are decorative inside it

```text
MOBILE
+--------------------------------------+
| SEPTEMBER                   15 BAKES |
| ------------------------------------ |
| +----+ FUDGY BROWNIES                |
| | 28 | ★★★★★                         |
| | sat| "Fudgier than last time…"     |
| +----+                               |
| +----+ PASTÉIS DE NATA               |
| |PHOTO| SAT 26 SEP · ★★★★☆ · 3RD BAKE|
| +----+ "Blistered tops and crisp…"   |
| +----+ COUNTRY SOURDOUGH             |
| | 27 | ★★★★★                         |
| | sun|                               |
| +----+                               |
+--------------------------------------+
```

```text
DESKTOP (8 of 12 cols)
+-----------------------------------------------------+
| September                                  15 BAKES |
| --------------------------------------------------- |
| +------+ FUDGY BROWNIES                             |
| |  28  | ★★★★★ · "Fudgier than last time…"          |
| | sat  |                                            |
| +------+                                            |
| +------+ PASTÉIS DE NATA                            |
| |PHOTO | SAT 26 SEP · ★★★★☆ · 3RD BAKE              |
| +------+ "Blistered tops and crisp layers…"         |
+-----------------------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Bakes not yet loaded | Title renders; one month heading and 5 placeholder rows in final proportions |
| Empty | No bakes logged yet | Summary hides; Nathan's empty-Bakes illustration (a tile panel until it exists), "Nothing out of the oven *yet.*" in `display-md`, one sentence ("Log a bake from any recipe and it shows up here, with its photo and how it went."), and a "Go to Library" link → `/recipes` |
| Log sheet | A row | The bake opens in the Log sheet (BONES-recipes-log.md) over this page; closing returns here at the same scroll position |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Decided** (2026-10-15, Nathan): A general bake history across recipes, framed as a diary (reference: Letterboxd's diary, where each entry is the date you did it, with an optional rating and note; scrolling back shows patterns you'd otherwise miss).
- **Assumed**: Grouped by month, not by week: Nathan bakes about once a month, so a week grouping would be mostly empty.
- **Decided** (2026-10-20, Nathan, after the Stage 4d build): Every bake is a row, Letterboxd-diary style. The 1.1.0 mix of a photo grid broken by rows left lonely tiles with empty columns on desktop and a wall of identical azulejo squares, because most bakes have no photo (photos only started in October). A photo now shows as the row's lead square; without one, the date block is the anchor.
- **Assumed**: "2nd bake" connects bakes of the same recipe, so per-bake ratings read as progress (3 stars, then 5).
- **Assumed**: No filters or search here yet; the Library filters recipes, and the diary is short. Revisit when it passes a year of bakes.
- **Assumed**: No primary action: logging happens from a recipe, where the scale and recipe are known. An "add a bake" here would first need a recipe picker.
- **Open**: A yearly recap (most baked recipe, best rated bake). Fun for the portfolio; not in this round.

---

## CHANGE LOG

- 1.2.0 (2026-10-20): Every bake is a row (photo or date block as the lead square), in an 8-column reading column on desktop; no photo grid and no azulejo squares; loading shows placeholder rows.
- 1.1.0 (2026-10-16): Month headings as big Fraunces chapter titles with more space between months; bake rows use the azulejo square; empty state copy and illustration.
- 1.0.1 (2026-10-16): Personality round: display title "Your *bakes.*"; tiles and rows follow SKIN October 2026 (ink frames, cobalt stars).
- 1.0.0 (2026-10-15): Initial wireframe (SKELETON 1.5.0).
