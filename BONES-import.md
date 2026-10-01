# BONES: `/import` (Import)

> **Source**: SKELETON.md v1.2.1, `/import`
> **Primary Action**: Import → `/import/:draftId`
> **Primary Device**: mobile, because most imports arrive from Instagram's share menu on the iPhone through the Shortcut (`?url=`)
> **Shell**: BONES-shell.md, App variant
> **Version**: 1.0.2 · **Updated**: 2026-10-01

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_TITLE "Import from a reel"         H1
├── REEL_LINK
│   ├── LINK_FIELD + PASTE
│   ├── IMPORT
│   └── STATUS_AREA (processing, errors, already imported)
├── SHARE_FROM_INSTAGRAM                    H2
│   ├── SETUP_STEPS × 3
│   └── GET_THE_SHORTCUT (external)
└── MANUAL_ENTRY
    └── ENTER_BY_HAND → /recipes/new
```

**First viewport (mobile)**: page title, the link field with Paste, the Import button, and the status area. When arriving with `?url=`, the processing status fills that space instead.

---

## 2. SECTIONS

All sections sit in one centered column: desktop 8 of 12 cols, mobile full width. The page is short, so the primary action is part of the flow, not a sticky bar.

### Reel Link (SKELETON section 1)
- **Layout**: desktop the field and Paste take 6 of the 8 cols, Import 2 cols on the same row; mobile the field with Paste inside its end on one row, Import full width below
- **Content**: field labeled "Reel link", placeholder showing the expected form ("instagram.com/reel/…"); Paste reads the clipboard into the field (shown only where the browser allows it); Import; below them, the status area, empty until something happens
- **Behavior**: with `?url=` the field is prefilled and the import starts on load; Import with an empty field shows the field error instead of starting; while processing, the field and Import are locked

```text
DESKTOP (centered column)
+-----------------------------------------------------+
| IMPORT FROM A REEL                                  |
| [REEL LINK                          PASTE] [IMPORT] |
| STATUS_AREA                                         |
+-----------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| IMPORT FROM A REEL                   |
| [REEL LINK                    PASTE] |
| [            IMPORT                ] |
| STATUS_AREA                          |
+--------------------------------------+
```

### Share from Instagram (SKELETON section 2)
- **Layout**: full width of the column on both devices; a numbered list of 3 steps; open by default until the first import succeeds, then collapsed to a plain disclosure: "How to share from Instagram" in body text with a chevron, no tile-mark and not heading-sized, since it's a one-time task and shouldn't weigh like a section. Expanding it in place turns it back into the "Share from Instagram" section with its heading
- **Content**: 1. "Get the Shortcut" (opens the Shortcut's install link, external); 2. "In Instagram, tap Share on a reel, then Nate’s Bakery"; 3. "The reel opens here and imports on its own." Each step at most 12 words
- **Behavior**: none beyond expand and collapse

```text
DESKTOP (centered column)
+------------------------------------------------------+
| SHARE FROM INSTAGRAM                                 |
| 1  GET THE SHORTCUT  ↗                               |
| 2  IN INSTAGRAM, TAP SHARE ...                       |
| 3  THE REEL OPENS HERE ...                           |
+------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| SHARE FROM INSTAGRAM                 |
| 1  GET THE SHORTCUT  ↗               |
| 2  IN INSTAGRAM, TAP SHARE ...       |
| 3  THE REEL OPENS HERE ...           |
+--------------------------------------+
```

### Manual Entry (SKELETON section 3)
- **Layout**: one line at the end of the column on both devices
- **Content**: "No reel? Enter a recipe by hand" linking to `/recipes/new`
- **Behavior**: none

```text
DESKTOP (centered column)
+------------------------------------------------------+
| NO REEL? ENTER A RECIPE BY HAND                      |
+------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| NO REEL? ENTER A RECIPE BY HAND      |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

All states render in the Reel Link status area, directly under Import, so the first viewport always shows them.

| Name | Trigger | Layout change |
|---|---|---|
| Processing | Import pressed, or `?url=` on load | Field and Import lock. The status area shows the stages in order, each marked done or in progress: "Reading the caption", "Listening to the audio", "Converting to grams"; then the line "You can leave: it will wait in your Library under Drafts" and a "Go to Library" link → `/recipes`. When finished, the page moves to `/import/:draftId` on its own. Stage changes are announced politely to screen readers |
| Invalid link | The text isn't an Instagram reel or post link | Error text under the field, field marked in error, focus stays in the field; nothing else changes |
| Import failed | Reel is private, deleted, or has no recipe | The status area shows the reason in one sentence and two actions: "Enter it manually" → `/recipes/new?source=<reel link>` (the more prominent one) and "Try another link", which clears the field and unlocks it |
| Already imported | The reel matches a saved recipe | The status area shows "You already saved this reel as <recipe title>" with a link to `/recipes/:recipeId`, and "Import again" as a secondary action that starts Processing |
| Signed out | Opened without a session | Handled by the App area guard: `/login?next=/import?url=<reel link>` (SKELETON FLOW-01) |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: The H1 "Import from a reel" (SKELETON's section stack has no title element).
- **Assumed**: A Paste button inside the field where the browser supports reading the clipboard, saving the long-press on iPhone.
- **Assumed**: Processing shows named stages instead of a bare spinner, because the import takes several seconds and the stages tell you it's working.
- **Assumed**: The page moves to Review Import on its own when processing finishes, if you're still on it.
- **Assumed**: Share from Instagram collapses after the first successful import, since setup is a one-time task.
- **Assumed**: "Enter it manually" is the stronger action after a failed import, because the failure usually means the reel can't be read, not that the link was wrong.
- **Open**: A Cancel control during processing. SKELETON doesn't define one; the import would still be charged, so it only saves a draft from appearing. Not drawn.

---

## CHANGE LOG

- 1.0.2 (2026-10-01): App renamed to Nate’s Bakery.
- 1.0.1 (2026-09-30): Collapsed "How to share from Instagram" is a plain disclosure, not a heading (build review).
- 1.0.0 (2026-09-29): Initial wireframe.
