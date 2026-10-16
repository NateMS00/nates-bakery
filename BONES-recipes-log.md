# BONES: `/recipes/:recipeId/log` (Bake Log)

> **Source**: SKELETON.md v1.5.0, `/recipes/:recipeId/log`
> **Primary Action**: Log a bake → `?new=1`
> **Primary Device**: mobile, because bakes are logged on the iPhone right after finishing in Bake Mode, while the result is on the counter
> **Shell**: BONES-shell.md, App variant (no tab bar)

This file also defines the **Log sheet**, the one form for logging or editing a bake, opened from this page, from the Recipe page (Log bake), from Bake Mode's Finish, and from the Bakes diary.
> **Version**: 1.4.0 · **Updated**: 2026-10-16

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
│   │   ├── STARS (when rated)
│   │   ├── PHOTO (when added) + COVER mark
│   │   ├── HOW_IT_TURNED_OUT
│   │   ├── WHAT_CHANGED
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
- **Content**: back link with the recipe title ("< Brown butter cookies", truncated at one line) → `/recipes/:recipeId`; "Bake *log.*" in `display-md` (44px on desktop); "5 bakes" (hidden when empty); Log a bake → `?new=1`
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
- **Layout**: one SKIN `record-card` per entry, stacked with a medium gap, on both devices; the entry menu sits at the end of the card's first row
- **Content**: record rows with `label-mono` labels: `baked` the date ("Sat 26 Sep", the entry heading), `scale` (row hidden at 1×), `rating` that bake's cobalt stars (row hidden when unrated); then the bake photo when there is one, full width of the card at 4:3 with an ink rule above and below, and a "Cover" `picture-chip` on it when it is the recipe's cover; then "How it turned out" and "What changed" as labeled rows whose text is set in the voice italic, as quoted words; the bake photo when there is one, full width of the column at 4:3, with a "Cover" `picture-chip` on it when it is the recipe's cover; then "How it turned out" and "What changed", each with its label and full text (no truncation on this page; notes are expected to stay under about 100 words); when both are empty, one line "No notes" with an "Add notes" link that opens that entry's form directly (`?edit=<entryId>`); entry menu: Edit, Delete. 20 entries, then Show more loads the next 20 below
- **Behavior**: a newly saved entry appears at the top and briefly draws attention with a cobalt wash that fades over about 2.4 s (no animation under reduced motion), and focus moves to its heading, after the After-save moment (section 3) has closed

```text
DESKTOP (centered column)
+-----------------------------------------------------+
| SAT 26 SEP · 1.5×                   ★★★★☆      [:]  |
| +-----------------------------------------------+   |
| |                 PHOTO 4:3        [COVER]      |   |
| +-----------------------------------------------+   |
| HOW IT TURNED OUT                                   |
| FULL_TEXT .......................................   |
| WHAT CHANGED                                        |
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
| SAT 26 SEP · 1.5×      ★★★★☆    [:]  |
| +----------------------------------+ |
| |          PHOTO 4:3      [COVER]  | |
| +----------------------------------+ |
| HOW IT TURNED OUT                    |
| FULL_TEXT ....................       |
| WHAT CHANGED                         |
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
| Empty | No entries | Nathan's empty-Bakes illustration (a tile panel until it exists), "Not baked *yet.*" in `display-md`, and one sentence: "Note what you change each time, and the next bake gets better." Log a bake stays the primary action |
| Not found | Unknown `:recipeId` | System not-found page (SKELETON) |
| Log sheet | `?new=1` (new), or `?edit=<entryId>` from Edit in an entry menu, Add notes, a bake in Recipe's Bakes section, or a bake in the Bakes diary | **Mobile**: a bottom sheet with the tile band on its top edge, opening at its content height (most of the screen), and growing to full height while the keyboard is open, with Save pinned just above the keyboard (SKIN Mobile Browser Viewport); **desktop**: centered modal, 6 cols wide. Order: header row with "Log this bake" (or "Edit bake") and a close X; one row of two compact controls, "Baked on" (shows "Today", or the date; opens the date picker; can't be later than today in the owner's local time) and the scale ("1×", a number with a visible "×" suffix that screen readers skip, decimal keypad, prefilled from Bake Mode or the Recipe page); the five stars at the prompt size (SKIN `star-rating`, 40px), centered, optional, pressing the current one clears it; "How it turned out" (multi-line); "What changed" (multi-line); a photo slot: "Add a photo" with "Can become the recipe's cover", which offers the camera or the photo library (the phone's own picker); once a photo is added it shows as a 4:3 preview with Replace and Remove, and a "Use as recipe cover" toggle under it (on by default for a recipe whose cover is still the reel thumbnail, off otherwise); Save (`button-primary`, full width), and under it one muted line "Only the date is required." There is no Cancel button: the close X cancels. Closing removes `?new=1` or `?edit=` from the URL (replacing the history entry); an unknown entry id opens the log without the sheet and drops the param, no error. Focus starts on the first star for a new bake (rating is the quickest thing to give) and on "How it turned out" when editing; it returns to what opened the sheet. Save with nothing but the date is the one-tap "I baked it" path |
| Discard changes | Esc, close X, backdrop tap or swipe down on the Log sheet after any change (stars, typed text, a photo, or a changed date or scale) | A confirmation inside the form following the Destructive confirmations rule (BONES-shell): "Discard this entry?", Discard first, Keep editing last and focused; with no changes the form just closes |
| Delete confirmation | Delete in an entry menu | Mobile: bottom sheet, about a third of the viewport; desktop: centered modal, 4 cols wide. "Delete this bake?"; when it's the only entry, a second line: "The recipe will show as Not baked yet."; when its photo is the cover: "Its photo is the recipe's cover; the reel picture comes back."; Delete (destructive) first, Cancel last, following the Destructive confirmations rule (BONES-shell). Focus starts on Cancel |
| After save: milestone | Save of a **new** bake that is a milestone: the recipe's first bake; a rating higher than every earlier bake of this recipe (a first-ever rating doesn't count, it would make every first rating a "best"); or every 5th bake (5, 10, 15…). One per save, in that priority: first, then best, then 5th | The sheet closes and SKIN `celebration` takes the whole screen (deep cobalt in both themes, announced as a dialog). Center: Nathan's celebration illustration (a tile panel until it exists), then a `display-title`: "First bake, *in the book.*" / "Your best *one yet.*" / "Bake no. 5 *in the book.*"; one line under it with the recipe, the stars and the date ("Pão de Deus · ★★★★★ · today"); one cream pill, "Done". Focus starts on the title. Done, Esc or a tap outside the content closes it and returns to where the sheet was opened (from Bake Mode's Finish: the Recipe page). Under reduced motion it simply appears |
| After save: everyday | Save of a new bake that isn't a milestone | The sheet closes and SKIN `celebration-toast` appears at the bottom, above the action bar: "Bake saved · Undo", 6 seconds, announced politely. Undo deletes the entry just created (and its photo) and announces "Bake removed". Edits to an existing bake show no toast; the sheet just closes |
| Photo uploading | Save pressed while the photo is still uploading | Save shows a busy state with "Uploading photo…"; the entry is saved when the upload ends. If the upload fails, the entry saves without the photo and the sheet stays open with "Photo didn't upload. Try again" and a Retry |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A page header with a back link named after the recipe, the H1 "Bake log", and a bake count (SKELETON's stack has only Entries).
- **Assumed**: Each entry's date is an H2, so screen reader users can jump between bakes.
- **Assumed**: Notes show in full on this page (they are truncated only in the Recipe page's Latest Bake).
- **Decided** (2026-10-15, Nathan): One Log sheet holds everything about a bake: date, scale, stars, notes, photo. Marking a bake no longer shows only the stars and sends you to Edit for the notes (references: Letterboxd's diary entry, where the review is optional and can come later; Day One's photo entries).
- **Decided** (2026-10-15, Nathan): Stars belong to the bake (SKELETON 1.5.0); there is no separate Rating prompt after saving.
- **Assumed**: "How it turned out" comes before "What changed": right after a bake, the result is what's on your mind; what to change follows from it.
- **Assumed**: The sheet grows to full height only while the keyboard is open, so on its own it reads as a light sheet, but typing never fights the keyboard (the reason the old form was full screen).
- **Assumed**: Focus starts on the first star for a new bake and on How it turned out when editing.
- **Assumed**: "Use as recipe cover" is on by default only while the recipe still shows its reel thumbnail, so the first bake photo fixes a bad reel cover without an extra tap, and later photos don't silently replace a chosen cover.
- **Assumed**: Editing an entry has its own URL (`?edit=<entryId>`, SKELETON 1.3.2), so Add notes is one tap and edit links survive a refresh.
- **Assumed**: A Discard changes confirmation for the entry form (not in SKELETON), so a half-written note, or a changed date or scale, isn't lost by an accidental tap outside.
- **Assumed**: Future dates are rejected; a bake can't be logged before it happens.
- **Assumed**: 20 entries, then Show more.
- **Assumed**: One photo per bake; more would turn the log into a gallery.
- **Decided** (2026-10-16, Nathan, personality round): Saving a bake gets a moment. Full-screen celebration only for milestones (first bake, best rating, every 5th), so it stays special by bake no. 30; a small cobalt toast the rest of the time (reference: Vibe's and Bucks Sauce's celebratory tone, kept to one moment). The illustration is Nathan's, still to come.
- **Assumed**: A first-ever rating is not a "best"; a best needs an earlier rated bake to beat.
- **Assumed**: Undo on the toast, because a new bake saved by mistake (wrong recipe) is the likeliest error right after Save.

---

## CHANGE LOG

- 1.4.0 (2026-10-16): Personality round: "Bake *log.*" title; each entry as a record card (baked, scale, rating, photo, notes in the voice italic); empty state with illustration.
- 1.3.0 (2026-10-16): Personality round: after saving a new bake, a full-screen celebration for milestones (first bake, best rating, every 5th) or a "Bake saved · Undo" toast otherwise; the entry highlight follows once that closes. Visuals follow SKIN October 2026 (cobalt stars, ochre Save, ink outlines).
- 1.2.0 (2026-10-15): Visual upgrade round: the entry form becomes the Log sheet (shared by Recipe, Bake Mode, Bakes): Baked on and scale as compact controls, stars per bake, How it turned out before What changed, one photo with "Use as recipe cover", Save only (close X cancels); entries show their stars and photo; the Rating prompt is removed (SKELETON 1.5.0).
- 1.1.0 (2026-09-30): After the first build review: `?edit=<entryId>` for one-tap Add notes and Edit; Discard check covers date and scale changes; edit focus on What changed; no future dates (local date); highlight timing plus a "Bake saved" announcement; scale field details; confirmations follow BONES-shell's Destructive rule.
- 1.0.0 (2026-09-29): Initial wireframe.
