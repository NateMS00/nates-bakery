# BONES: `/recipes/:recipeId/log` (Bake Log)

> **Source**: SKELETON.md v1.3.2, `/recipes/:recipeId/log`
> **Primary Action**: Log a bake → `?new=1`
> **Primary Device**: mobile, because bakes are logged on the iPhone right after finishing in Bake Mode, while the result is on the counter
> **Shell**: BONES-shell.md, App variant
> **Version**: 1.1.0 · **Updated**: 2026-09-30

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_HEADER
│   ├── BACK_TO_RECIPE ("< Recipe title")
│   ├── PAGE_TITLE "Bake log"               H1
│   ├── BAKE_COUNT ("5 bakes")
│   └── LOG_A_BAKE (desktop; sticky bar on mobile)
├── ENTRIES
│   ├── ENTRY × n (newest first)
│   │   ├── DATE · SCALE                    H2
│   │   ├── WHAT_CHANGED
│   │   ├── HOW_IT_TURNED_OUT
│   │   └── ENTRY_MENU (Edit, Delete)
│   └── SHOW_MORE
└── LOG_BAR (sticky, mobile)
```

**First viewport (mobile)**: back link, "Bake log" with the bake count, the first one or two entries, and the sticky Log a bake bar.

---

## 2. SECTIONS

All sections sit in one centered reading column: desktop 8 of 12 cols, mobile full width.

### Page header (added; see Assumptions)
- **Layout**: desktop back link on its own line, then title and count on the left (6 of 8 cols) and Log a bake on the right (2 cols); mobile back link, title, and count stacked, with the primary action in the sticky bar
- **Content**: back link with the recipe title ("< Brown butter cookies", truncated at one line) → `/recipes/:recipeId`; "Bake log"; "5 bakes" (hidden when empty); Log a bake → `?new=1`
- **Behavior**: none

```text
DESKTOP (centered column)
+-----------------------------------------------------+
| < RECIPE_TITLE                                      |
| BAKE LOG                              [LOG A BAKE]  |
| 5 BAKES                                             |
+-----------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| < RECIPE_TITLE                       |
| BAKE LOG                             |
| 5 BAKES                              |
+--------------------------------------+
```

### Entries (SKELETON section 1)
- **Layout**: one block per entry, stacked with a medium gap, on both devices; the entry menu sits at the end of the entry's first line
- **Content**: first line: date ("Sat 26 Sep") and scale used ("1.5×", hidden at 1×) as the entry heading; then "What changed" and "How it turned out", each with its label and full text (no truncation on this page; notes are expected to stay under about 100 words); when both are empty, one line "No notes" with an "Add notes" link that opens that entry's form directly (`?edit=<entryId>`); entry menu: Edit, Delete. 20 entries, then Show more loads the next 20 below
- **Behavior**: a newly saved entry appears at the top and briefly draws attention with a cobalt wash that fades over about 2.4 s (no animation under reduced motion), and focus moves to its heading. The highlight is never the only feedback: "Bake saved" is announced politely to screen readers

```text
DESKTOP (centered column)
+-----------------------------------------------------+
| SAT 26 SEP · 1.5×                              [:]  |
| WHAT CHANGED                                        |
| FULL_TEXT .......................................   |
| HOW IT TURNED OUT                                   |
| FULL_TEXT .......................................   |
+-----------------------------------------------------+
| TUE 15 SEP                                     [:]  |
| NO NOTES · ADD NOTES                                |
+-----------------------------------------------------+
| SHOW MORE                                           |
+-----------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| SAT 26 SEP · 1.5×               [:]  |
| WHAT CHANGED                         |
| FULL_TEXT ....................       |
| HOW IT TURNED OUT                    |
| FULL_TEXT ....................       |
+--------------------------------------+
| TUE 15 SEP                      [:]  |
| NO NOTES · ADD NOTES                 |
+--------------------------------------+
```

### Log bar (primary action, mobile only)
- **Layout**: mobile only; pinned to the bottom edge above the home indicator area; the page reserves space at its end. On desktop the action lives in the Page header
- **Content**: "Log a bake"
- **Behavior**: always visible on mobile; opens the entry form (`?new=1`)

```text
MOBILE
+--------------------------------------+
|           [ LOG A BAKE ]             |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Entries not yet loaded | Page header renders; Entries shows 3 placeholder entries in final proportions |
| Empty | No entries | Entries reduces to "No bakes logged yet" and one sentence on why ("Note what you change each time, and the next bake gets better"); Log a bake stays the primary action |
| Not found | Unknown `:recipeId` | System not-found page (SKELETON) |
| Entry form | `?new=1` (new), or `?edit=<entryId>` from Edit in an entry menu or Add notes | Mobile: full-screen sheet, because two text fields and the keyboard don't fit a partial sheet; desktop: centered modal, 6 cols wide. Order: title ("Log a bake" or "Edit bake") with a close X; Date (defaults to today; required; can't be later than today in the owner's local time, so an evening bake in Cali isn't rejected as "tomorrow" by a UTC clock); Scale (a number with a visible "×" suffix that screen readers skip, decimal keypad on phones, prefilled from Bake Mode or 1×); What changed (multi-line); How it turned out (multi-line); Save and Cancel, pinned to the bottom of the sheet on mobile. Closing removes `?new=1` or `?edit=` from the URL (replacing the history entry, not adding one); an unknown entry id opens the log without the form and drops the param, no error. Focus starts on What changed, for new entries and edits (date and scale are usually right, and notes are what you come back to change), and returns to what opened the form |
| Discard changes | Cancel, Esc, close X, or backdrop tap on the entry form after any change (typed text, or a changed date or scale) | A confirmation inside the form following the Destructive confirmations rule (BONES-shell): "Discard this entry?", Discard first, Keep editing last and focused; with no changes the form just closes |
| Delete confirmation | Delete in an entry menu | Mobile: bottom sheet, about a third of the viewport; desktop: centered modal, 4 cols wide. "Delete this bake?"; when it's the only entry, a second line: "The recipe will show as Not baked yet."; Delete (destructive) first, Cancel last, following the Destructive confirmations rule (BONES-shell). Focus starts on Cancel |
| Rating prompt | A new entry was saved (SKELETON FLOW-02 step 6) | Same layout as the Rating prompt in BONES-recipes-detail.md, except that it opens after every new entry and shows the current rating when there is one, so it can be kept or changed. Title "How was this bake?" |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A page header with a back link named after the recipe, the H1 "Bake log", and a bake count (SKELETON's stack has only Entries).
- **Assumed**: Each entry's date is an H2, so screen reader users can jump between bakes.
- **Assumed**: Notes show in full on this page (they are truncated only in the Recipe page's Latest Bake).
- **Assumed**: The entry form is full-screen on mobile.
- **Assumed**: Focus starts on What changed in both new and edited entries.
- **Assumed**: Editing an entry has its own URL (`?edit=<entryId>`, SKELETON 1.3.2), so Add notes is one tap and edit links survive a refresh.
- **Assumed**: A Discard changes confirmation for the entry form (not in SKELETON), so a half-written note, or a changed date or scale, isn't lost by an accidental tap outside.
- **Assumed**: Future dates are rejected; a bake can't be logged before it happens.
- **Assumed**: 20 entries, then Show more.
- **Open**: Photos on log entries (SKELETON open question). If added, each entry gets a photo row under its notes and the form gets an Add photo control.

---

## CHANGE LOG

- 1.1.0 (2026-09-30): After the first build review: `?edit=<entryId>` for one-tap Add notes and Edit; Discard check covers date and scale changes; edit focus on What changed; no future dates (local date); highlight timing plus a "Bake saved" announcement; scale field details; confirmations follow BONES-shell's Destructive rule.
- 1.0.0 (2026-09-29): Initial wireframe.
