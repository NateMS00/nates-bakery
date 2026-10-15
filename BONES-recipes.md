# BONES: `/recipes` (Library)

> **Source**: SKELETON.md v1.5.0, `/recipes`
> **Primary Action**: Import from a reel → `/import`
> **Primary Device**: mobile, because the persona opens the library on an iPhone, usually right after saving a reel or when choosing what to bake in the kitchen
> **Shell**: BONES-shell.md, App variant
> **Version**: 1.5.0 · **Updated**: 2026-10-15

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_HEADER
│   ├── PAGE_TITLE "Library"                H1
│   └── IMPORT_FROM_A_REEL (desktop; sticky bar on mobile in Safari)
├── SEARCH
│   └── SEARCH_FIELD + FILTERS_BUTTON (mobile)
├── FILTERS
│   ├── FILTER_CONTROLS (desktop) / FILTERS_BUTTON (mobile)
│   └── ACTIVE_FILTER_CHIPS + CLEAR_FILTERS
├── VIEWS (tab list: Recipes · Favorites · Drafts n)
├── RECIPES (tab panel)                     H2, visually hidden
│   ├── RESULT_COUNT
│   ├── RECIPE_TILE × n in a grid (30, then Show more)
│   └── SHOW_MORE
├── DRAFTS (tab panel, Drafts view)         H2, visually hidden
│   └── DRAFT_ROW × n, each with DISCARD
└── IMPORT_BAR (sticky, mobile, Safari only)
```

**First viewport (mobile)**: page title, search field with the Filters button, active filter chips when any, the view tabs, and the first two rows of the grid (four recipes, pictures fully visible on a 390 × 844 screen), then the sticky Import from a reel bar in Safari or the tab bar when installed.

---

## 2. SECTIONS

### Page header (added; see Assumptions)
- **Layout**: desktop full width: title 8 cols, Import from a reel 4 cols right-aligned; mobile title only, with the primary action in the sticky bar
- **Content**: "Library"; Import from a reel → `/import`
- **Behavior**: none

```text
DESKTOP
+---------------------------------------------------+-------------------+
| LIBRARY                                           |[IMPORT FROM REEL] |
+---------------------------------------------------+-------------------+
```

```text
MOBILE
+--------------------------------------+
| LIBRARY                              |
+--------------------------------------+
```

### Search (SKELETON section 1)
- **Layout**: desktop 8 cols, on the same row as the start of Filters; mobile one row shared with the Filters button: search field takes the remaining width, Filters button at the end
- **Content**: search field with the visible label "Search" and the placeholder "Recipe or ingredient", and a clear control once it has text
- **Behavior**: results update as you type (after a short pause) and write `?q=`; the field keeps its value on refresh from the URL

```text
DESKTOP
+-----------------------------------------------------+-----------------+
| SEARCH                                              |                 |
| [RECIPE OR INGREDIENT                           x]  |                 |
+-----------------------------------------------------+-----------------+
```

```text
MOBILE
+--------------------------------------+
| SEARCH                               |
| [RECIPE OR INGR...    x] [FILTERS 2] |
+--------------------------------------+
```

### Filters (SKELETON section 2)
- **Layout**: desktop one row under Search, full width: Category (dropdown), Status (three-part segmented control: All, Baked, Not baked yet), Rating (dropdown), then Clear filters at the end (Favorites moved to the view tabs); mobile a Filters button beside Search showing the number of active filters, which opens the Filters sheet; below the search row, the active filters as removable chips that wrap to a second line if needed (no horizontal scroll), followed by Clear filters
- **Content**: Category lists only categories that have recipes, each with its count; Status All, Baked, Not baked yet; Rating (the latest rated bake's stars): Any, 3★ and up, 4★ and up, 5★. Chips read like "Cake ×", "4★ and up ×". No chips and no Clear filters when nothing is active
- **Behavior**: on desktop each control applies immediately and writes its query param; on mobile, changes apply when the sheet's "Show n recipes" is pressed; removing a chip applies immediately on both

```text
DESKTOP
+-----------------------------------------------------------------------+
| SEARCH                                                                |
| [RECIPE OR INGREDIENT                       ]                         |
| [CATEGORY v] [ALL|BAKED|NOT BAKED YET] [RATING v]              CLEAR  |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| SEARCH                               |
| [RECIPE OR INGR...     ] [FILTERS 2] |
| [CAKE x] [4★ AND UP x]   CLEAR ALL   |
+--------------------------------------+
```

### Views (SKELETON section 3)
- **Layout**: one row of `view-tab`s under Filters on both devices, left-aligned, never scrolling: Recipes, Favorites, Drafts. Drafts carries its count ("Drafts 5") and is hidden when there are no drafts
- **Content**: Recipes (default), Favorites (recipes marked favorite), Drafts (unsaved imports)
- **Behavior**: a tab list; choosing a tab writes `?view=` (replacing the history entry) and swaps the panel below without a reload. Search and filters apply to Recipes and Favorites; on Drafts, the search row and filters hide, since drafts have no category or rating yet, and come back with their values when you switch back. Arrow keys move between tabs (standard tab list keyboard pattern)

```text
DESKTOP
+-----------------------------------------------------------------------+
| [RECIPES] [FAVORITES] [DRAFTS 5]                                      |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| [RECIPES] [FAVORITES] [DRAFTS 5]     |
+--------------------------------------+
```

### Drafts view (SKELETON section 4, Drafts)
- **Layout**: desktop the centered reading column (8 of 12 cols), one row per draft; mobile one row per draft, full width
- **Content**: each row shows the extracted title (or "@creator's reel" until a title exists), the creator handle, and its status: "Importing…" (not a link yet), "Ready to review" (links to `/import/:draftId`), or "Couldn't finish" (links to `/import/:draftId`, where Retry and Discard are; the status reads as text, not only as a color or icon); every row, in any status, ends with a Discard icon button (trash, `icon-button`, 48px target, outside the row's link, labeled for screen readers "Discard draft: <title>"); all drafts show, newest first (no Show all: the view exists for them); titles truncate at one line
- **Behavior**: An Importing row turns into Ready to review or Couldn't finish when the import ends, without a page reload, and the Drafts tab count updates. The page checks for changes while a row is importing, but screen readers only hear when a row's status changes, never on each check. A row still Importing after 10 minutes turns into Couldn't finish, so a stuck import never looks alive. Discard removes the row at once (no confirmation dialog) and shows "Draft discarded" with Undo, which stays until the next action or 10 seconds; Undo puts the row back where it was. Focus moves to the next draft row, or to the Recipes tab when it was the last draft (the Drafts tab then hides and the view returns to Recipes). Discarding deletes the draft and its copied thumbnail, the same as Discard on `/import/:draftId`

```text
MOBILE
+--------------------------------------+
| DRAFT_TITLE                    [DEL] |
| @CREATOR · READY TO REVIEW           |
| @CREATOR'S REEL                [DEL] |
| @CREATOR · IMPORTING...              |
+--------------------------------------+
```

### Recipes (SKELETON section 4; Recipes and Favorites views)
- **Layout**: a photo grid of `recipe-tile`s: 2 columns on mobile, 3 on tablet, 4 on desktop, `{spacing.md}` between columns and `{spacing.base}` between rows. Every tile has the same picture frame (4:5), so rows line up whatever the titles
- **Content**: a result count above the grid ("24 recipes", or "3 of 24 recipes" when searching or filtering); each tile links to `/recipes/:recipeId` and shows, top to bottom: the picture, the category label, the title (2 lines, then truncates), and one meta line only when there is something to say: the recipe's stars (its latest rated bake), a cobalt heart when favorite, and "Baked 13 Oct". "Not rated" and "Not baked yet" aren't printed; the Status filter covers them. Order is most recently baked or added first; 30 tiles, then "Show more" loads the next 30 below
- **Picture**: the recipe's cover (SKIN `recipe-picture`): a bake photo chosen as cover, else the reel thumbnail, cropped to 4:5 from its focal point (centre by default). At about 170px wide on a 390px phone, the bake is readable, which the old 60×80 thumbnail was not. No picture → a small azulejo tile panel in the same frame, so the grid stays even. Decorative (empty alt text), because the title in the same link names the recipe. Space reserved before it loads; pictures below the first screen load as you scroll
- **Behavior**: the whole tile is one link; nothing inside it is separately interactive

```text
DESKTOP (4 columns)
+-----------------------------------------------------------------------+
| 24 RECIPES                                                            |
| +-------------+ +-------------+ +-------------+ +-------------+       |
| |             | |             | |             | |  ~ TILE ~   |       |
| |     PIC     | |     PIC     | |     PIC     | |  ~ PANEL ~  |       |
| |             | |             | |             | |             |       |
| +-------------+ +-------------+ +-------------+ +-------------+       |
| CATEGORY        CATEGORY        CATEGORY        CATEGORY              |
| RECIPE_TITLE    RECIPE_TITLE    RECIPE_TITLE    RECIPE_TITLE          |
| ★★★★☆ ♥ · BAKED                                 ★★★★☆ · BAKED         |
| SHOW MORE                                                             |
+-----------------------------------------------------------------------+
```

```text
MOBILE (2 columns)
+--------------------------------------+
| 24 RECIPES                           |
| +---------------+ +---------------+  |
| |               | |               |  |
| |      PIC      | |      PIC      |  |
| |               | |               |  |
| +---------------+ +---------------+  |
| CATEGORY          CATEGORY           |
| RECIPE_TITLE      RECIPE_TITLE       |
| ★★★★☆ · 13 OCT                       |
+--------------------------------------+
```

### Import bar (primary action, mobile only)
- **Layout**: mobile in Safari only; pinned to the bottom edge, full width, above the home indicator area; the page reserves space at its end so the bar never covers Show more. In the installed app the Import tab replaces it (BONES-shell). On desktop the action lives in the Page header
- **Content**: "Import from a reel"
- **Behavior**: always visible on mobile; goes to `/import`

```text
MOBILE
+--------------------------------------+
|       [ IMPORT FROM A REEL ]         |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Recipes not yet loaded | Search, Filters and the view tabs render; the grid shows 4 placeholder tiles (grout frames and two text bars) in final proportions; the Drafts tab appears once loaded |
| Empty | No recipes and no drafts | Search, Filters, the view tabs, and the grid hide. A tile panel illustrates the page. The first viewport shows "Library", a short line "Save your first recipe from a reel", Import from a reel (the sticky bar on mobile, a centered button on desktop), and a "Set up the Shortcut" link → `/import` (its Set up the Shortcut section) |
| Only drafts | No saved recipes, at least one draft | Search and Filters hide; the page opens on the Drafts view; the Recipes tab shows one line "No saved recipes yet" |
| No favorites | Favorites view, none marked | One line: "Tap the heart on a recipe to keep it here." |
| `?favorite=1` | Old links | Opens the Favorites view and rewrites the URL to `?view=favorites` |
| No results | Search or filters match nothing | Result count reads "No matches out of 24 recipes" (words, not a 0); the list is replaced by "Nothing matches" plus Clear search (when `?q=` is set) and Clear filters (when any filter is set) |
| Filters sheet | Filters button (mobile only) | Bottom sheet sized to its content, with a footer pinned to its bottom. Order: a header row with "Filters" and a close X; Category as wrapping single-choice chips ("All" first, then each category with its count: "Cake 6"); Status as a three-part segmented control; Rating as wrapping single-choice chips (Any, 3★ and up, 4★ and up, 5★); footer with Clear and "Show n recipes" (n updates live). All three filters fit on one 390 × 844 screen without scrolling; if they ever don't, the body scrolls above the pinned footer. Dismissed by the close X, Esc, backdrop tap, or swipe down, which discard unapplied changes. Focus is trapped inside and returns to the Filters button on close |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A page header with the H1 "Library" (not a SKELETON section; added so the page has one H1 and a place for the primary action on desktop).
- **Assumed**: The primary action is repeated from the shell's Import link. The shell link is navigation; the page action is the one that is visually dominant and sticky on mobile, matching the Recipe page's pattern.
- **Assumed**: On mobile, filters live in a sheet behind one button, with active filters shown as chips, because four filter controls don't fit a phone's width without horizontal scrolling. Chips wrap instead of scrolling, matching the rule for tabs.
- **Assumed**: The mobile sheet applies changes on "Show n recipes", while desktop applies each change immediately, because on a phone every change would otherwise rerender the list hidden behind the sheet.
- **Assumed**: Rating filter choices are Any, 3★ and up, 4★ and up, and 5★; the URL still accepts any value from 1 to 5.
- **Decided** (2026-10-15, Nathan): The Library is a 2-column photo grid on phones (3 on tablet, 4 on desktop) instead of a list with 60×80 thumbnails, which were too small to see the bake. Cropping the reel cover is fine. This replaces the earlier assumption that rows scan faster: with bake photos as covers, the picture is now the fastest thing to scan.
- **Decided** (2026-10-15, Nathan): Favorites and Drafts are views (tabs) rather than a filter toggle and a section above the recipes; drafts no longer push recipes down the page. Mela's All / Favorites / Want to Cook lists were the reference.
- **Assumed**: Tiles print no "Not rated" or "Not baked yet"; a tile that has neither just ends at its title.
- **Assumed**: Drafts that are still importing appear as "Importing…" rows (SKELETON only lists drafts once finished), so the owner can see an import is on its way after leaving `/import`.
- **Assumed**: Tablet uses the desktop filter row, which wraps to two lines.
- **Assumed**: Category and Rating in the mobile Filters sheet are wrapping chips, not radio lists, so all four filters are visible at once instead of the sheet opening on a long category list.
- **Assumed**: The search label is the short "Search", with the detail in the placeholder; the label stays visible (SKIN: never placeholder-only).
- **Assumed**: A result count above the list (not in SKELETON), announced to screen readers when it changes, so filtering has audible feedback.
- **Assumed**: 30 recipes, then Show more, instead of infinite scroll, so the footer stays reachable and position survives going back.
- **Assumed**: The favorite mark in the list is read-only, so scrolling with a thumb can't toggle it by accident; favoriting happens on the Recipe page.
- **Assumed** (2026-10-15, Nathan): Drafts can be discarded from the Library without opening them, because an unfinished or broken draft may not open at all. A visible button, not a swipe gesture, so it works with a keyboard and screen readers; Undo instead of a confirmation dialog, so clearing several drafts stays quick and a mistake stays recoverable.
- **Assumed**: Draft rows stay text only; their picture shows once you open the draft (Review Import's Source).
- **Open**: A sort control (for example, by rating or A–Z). SKELETON fixes the order to most recently baked or added; a sort control would add a query param and a control in Filters.

---

## CHANGE LOG

- 1.5.0 (2026-10-15): Visual upgrade round: photo grid of recipe tiles (2/3/4 columns) with 4:5 pictures and a tile panel when there's none; Recipes · Favorites · Drafts view tabs replace the Favorites toggle and the Drafts section; tiles show rating and baked date only when they exist; no Import bar in the installed app (SKELETON 1.5.0).
- 1.3.0 (2026-10-13): Recipe pictures: a 60×80 picture on the left of mobile and tablet cards, a 36×48 picture at the start of desktop rows, a placeholder when there's none (SKELETON 1.4.2).
- 1.4.0 (2026-10-15): Discard on every draft row, with Undo; Importing turns into Couldn't finish after 10 minutes.
- 1.2.0 (2026-10-13): Draft rows gain "Couldn't finish"; status changes announced only when they happen; empty state links to Set up the Shortcut (SKELETON 1.4.1).
- 1.1.1 (2026-09-30): Recorded tablet behavior from the build: recipe cards under 1280px, rows from 1280px; desktop filter row wraps on tablet.
- 1.1.0 (2026-09-30): After the first build review: 2 drafts on mobile, Filters sheet with wrapping chips and a close X, "Search" label, no-results count in words.
- 1.0.0 (2026-09-29): Initial wireframe.
