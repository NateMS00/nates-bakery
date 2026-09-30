# BONES: `/recipes` (Library)

> **Source**: SKELETON.md v1.2.0, `/recipes`
> **Primary Action**: Import from a reel → `/import`
> **Primary Device**: mobile, because the persona opens the library on an iPhone, usually right after saving a reel or when choosing what to bake in the kitchen
> **Shell**: BONES-shell.md, App variant
> **Version**: 1.0.0 · **Updated**: 2026-09-29

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_HEADER
│   ├── PAGE_TITLE "Library"                H1
│   └── IMPORT_FROM_A_REEL (desktop; sticky bar on mobile)
├── SEARCH
│   └── SEARCH_FIELD
├── FILTERS
│   ├── FILTER_CONTROLS (desktop) / FILTERS_BUTTON (mobile)
│   └── ACTIVE_FILTER_CHIPS + CLEAR_FILTERS
├── DRAFTS                                  H2
│   └── DRAFT_ROW × n (max 3, then Show all drafts)
├── RECIPES                                 H2
│   ├── RESULT_COUNT
│   ├── RECIPE_ITEM × n (30, then Show more)
│   └── SHOW_MORE
└── IMPORT_BAR (sticky, mobile)
```

**First viewport (mobile)**: page title, search field with the Filters button, active filter chips when any, Drafts when present, the first 3 to 4 recipes, and the sticky Import from a reel bar at the bottom edge.

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
- **Content**: search field labeled "Search recipes or ingredients", with a clear control once it has text
- **Behavior**: results update as you type (after a short pause) and write `?q=`; the field keeps its value on refresh from the URL

```text
DESKTOP
+-----------------------------------------------------+-----------------+
| [SEARCH RECIPES OR INGREDIENTS                  x]  |                 |
+-----------------------------------------------------+-----------------+
```

```text
MOBILE
+--------------------------------------+
| [SEARCH RECIPES...    x] [FILTERS 2] |
+--------------------------------------+
```

### Filters (SKELETON section 2)
- **Layout**: desktop one row under Search, full width: Category (dropdown), Status (three-part segmented control: All, Baked, Not baked yet), Favorites (toggle), Rating (dropdown), then Clear filters at the end; mobile a Filters button beside Search showing the number of active filters, which opens the Filters sheet; below the search row, the active filters as removable chips that wrap to a second line if needed (no horizontal scroll), followed by Clear filters
- **Content**: Category lists only categories that have recipes, each with its count; Status All, Baked, Not baked yet; Favorites on or off; Rating: Any, 3★ and up, 4★ and up, 5★. Chips read like "Cake ×", "Favorites ×", "4★ and up ×". No chips and no Clear filters when nothing is active
- **Behavior**: on desktop each control applies immediately and writes its query param; on mobile, changes apply when the sheet's "Show n recipes" is pressed; removing a chip applies immediately on both

```text
DESKTOP
+-----------------------------------------------------------------------+
| [SEARCH RECIPES OR INGREDIENTS              ]                         |
| [CATEGORY v] [ALL|BAKED|NOT BAKED YET] [FAVORITES] [RATING v]  CLEAR  |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| [SEARCH RECIPES...     ] [FILTERS 2] |
| [CAKE x] [FAVORITES x]   CLEAR ALL   |
+--------------------------------------+
```

### Drafts (SKELETON section 3)
- **Layout**: desktop full width, one row per draft; mobile one row per draft, full width
- **Content**: each row shows the extracted title (or "@creator's reel" until a title exists), the creator handle, and its status: "Importing…" (not a link yet) or "Ready to review" (links to `/import/:draftId`); at most 3 rows, then "Show all drafts (n)" expands the rest in place; titles truncate at one line
- **Behavior**: hidden when there are no drafts or when any search or filter is active (SKELETON). An Importing row turns into Ready to review when the import finishes, without a page reload

```text
DESKTOP
+-----------------------------------------------------------------------+
| DRAFTS                                                                |
| DRAFT_TITLE                        @CREATOR           READY TO REVIEW |
| @CREATOR'S REEL                    @CREATOR           IMPORTING...    |
| SHOW ALL DRAFTS (n)                                                   |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| DRAFTS                               |
| DRAFT_TITLE                          |
| @CREATOR · READY TO REVIEW           |
| @CREATOR'S REEL                      |
| @CREATOR · IMPORTING...              |
+--------------------------------------+
```

### Recipes (SKELETON section 4)
- **Layout**: desktop full width, one row per recipe: title 5 cols, category 2, rating 2, last baked 2, favorite mark 1; mobile one card per recipe, full width: category label on the first line, title on the second, rating, favorite mark, and last-baked status on the third
- **Content**: a result count above the list ("24 recipes", or "3 of 24 recipes" when searching or filtering); each item links to `/recipes/:recipeId`; title wraps to at most 2 lines, then truncates; rating as small stars or "Not rated"; favorite as a mark only (not a toggle here); "Baked 12 Sep" or "Not baked yet"; order is most recently baked or added first; 30 items, then "Show more" loads the next 30 below
- **Behavior**: the whole row or card is one link; nothing inside it is separately interactive

```text
DESKTOP
+-----------------------------------------------------------------------+
| 24 RECIPES                                                            |
+---------------------------+------------+------------+------------+----+
| RECIPE_TITLE              | CATEGORY   | ★★★★☆      | BAKED DATE | ♥  |
| RECIPE_TITLE              | CATEGORY   | NOT RATED  | NOT BAKED  |    |
+---------------------------+------------+------------+------------+----+
| SHOW MORE                                                             |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| 24 RECIPES                           |
| CATEGORY                             |
| RECIPE_TITLE                         |
| ★★★★☆  ♥          BAKED 12 SEP       |
+--------------------------------------+
| CATEGORY                             |
| RECIPE_TITLE                         |
| NOT RATED           NOT BAKED YET    |
+--------------------------------------+
| SHOW MORE                            |
+--------------------------------------+
```

### Import bar (primary action, mobile only)
- **Layout**: mobile only; pinned to the bottom edge, full width, above the home indicator area; the page reserves space at its end so the bar never covers Show more. On desktop the action lives in the Page header
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
| Loading | Recipes not yet loaded | Search and Filters render; Recipes shows 6 placeholder items in final proportions; Drafts hidden until loaded |
| Empty | No recipes and no drafts | Search, Filters, Drafts, and Recipes hide. The first viewport shows "Library", a short line "Save your first recipe from a reel", Import from a reel (the sticky bar on mobile, a centered button on desktop), and a "Set up Share from Instagram" link → `/import` (its Share from Instagram section) |
| Only drafts | No saved recipes, at least one draft | Search and Filters hide; Drafts shows; Recipes reduces to one line "No saved recipes yet" |
| No results | Search or filters match nothing | Result count reads "0 of 24 recipes"; the list is replaced by "Nothing matches" plus Clear search (when `?q=` is set) and Clear filters (when any filter is set) |
| Filters sheet | Filters button (mobile only) | Bottom sheet, about three quarters of the viewport. Order: title "Filters" with Close; Category as a single-choice list with counts; Status as a three-part segmented control; Favorites toggle; Rating as a single-choice list; footer pinned to the bottom of the sheet with Clear and "Show n recipes" (n updates live). Dismissed by Close, Esc, backdrop tap, or swipe down, which discard unapplied changes. Focus is trapped inside and returns to the Filters button on close |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A page header with the H1 "Library" (not a SKELETON section; added so the page has one H1 and a place for the primary action on desktop).
- **Assumed**: The primary action is repeated from the shell's Import link. The shell link is navigation; the page action is the one that is visually dominant and sticky on mobile, matching the Recipe page's pattern.
- **Assumed**: On mobile, filters live in a sheet behind one button, with active filters shown as chips, because four filter controls don't fit a phone's width without horizontal scrolling. Chips wrap instead of scrolling, matching the rule for tabs.
- **Assumed**: The mobile sheet applies changes on "Show n recipes", while desktop applies each change immediately, because on a phone every change would otherwise rerender the list hidden behind the sheet.
- **Assumed**: Rating filter choices are Any, 3★ and up, 4★ and up, and 5★; the URL still accepts any value from 1 to 5.
- **Assumed**: Drafts that are still importing appear as "Importing…" rows (SKELETON only lists drafts once finished), so the owner can see an import is on its way after leaving `/import`.
- **Assumed**: Drafts show at most 3 rows, then expand in place, since SKELETON defines no drafts route.
- **Assumed**: A result count above the list (not in SKELETON), announced to screen readers when it changes, so filtering has audible feedback.
- **Assumed**: 30 recipes, then Show more, instead of infinite scroll, so the footer stays reachable and position survives going back.
- **Assumed**: The favorite mark in the list is read-only, so scrolling with a thumb can't toggle it by accident; favoriting happens on the Recipe page.
- **Assumed**: The desktop list is rows, not a card grid, because there are no photos yet and text rows scan faster.
- **Open**: Recipe photos (SKELETON open question). If added, mobile cards gain a small thumbnail on the left and the desktop list could become a grid; the current layout leaves room for a thumbnail column.
- **Open**: A sort control (for example, by rating or A–Z). SKELETON fixes the order to most recently baked or added; a sort control would add a query param and a control in Filters.

---

## CHANGE LOG

- 1.0.0 (2026-09-29): Initial wireframe.
