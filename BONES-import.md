# BONES: `/import` (Import)

> **Source**: SKELETON.md v1.4.0, `/import`, FLOW-01
> **Primary Action**: Import → hands the link to the Nate’s Bakery Shortcut, which opens `/import/:draftId` when done
> **Primary Device**: mobile, because most imports start from Instagram's share menu on the iPhone; the Shortcut does the import itself, so this page mostly handles pasted links, setup, and errors
> **Shell**: BONES-shell.md, App variant
> **Version**: 1.1.1 · **Updated**: 2026-10-13

---

## 1. STRUCTURE

```text
MAIN
├── PAGE_TITLE "Import from a reel"         H1
├── REEL_LINK
│   ├── LINK_FIELD + PASTE
│   ├── IMPORT
│   └── STATUS_AREA (processing, errors, already imported)
├── SET_UP_THE_SHORTCUT                     H2
│   ├── SETUP_STEPS × 4
│   ├── GET_THE_SHORTCUT (external)
│   └── IMPORT_KEY (Create / Copy / Revoke)
└── MANUAL_ENTRY
    └── ENTER_BY_HAND → /recipes/new
```

**First viewport (mobile)**: page title, the link field with Paste, the Import button, and the status area. When the Shortcut sends you here (setup missing, an error, or a duplicate), the status area or the setup section is what you land on.

---

## 2. SECTIONS

All sections sit in one centered column: desktop 8 of 12 cols, mobile full width. The page is short, so the primary action is part of the flow, not a sticky bar.

### Reel Link (SKELETON section 1)
- **Layout**: desktop the field and Paste take 6 of the 8 cols, Import 2 cols on the same row; mobile the field with Paste inside its end on one row, Import full width below
- **Content**: field labeled "Reel link", placeholder showing the expected form ("instagram.com/reel/…"); Paste reads the clipboard into the field (shown only where the browser allows it); Import; one line under the button: "Runs the Nate’s Bakery Shortcut on this device"; below them, the status area, empty until something happens
- **Behavior**: with `?url=` the field is prefilled but nothing starts on its own. Import checks the link, then opens the Shortcut with it (the Shortcuts app's run-shortcut link); the page shows Handed to the Shortcut. Import with an empty field shows the field error instead of starting

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

### Set up the Shortcut (SKELETON section 2)
- **Layout**: full width of the column on both devices; a numbered list of 4 steps; open by default until the first import succeeds, then collapsed to a plain disclosure: "Set up the Shortcut" in body text with a chevron, no tile-mark and not heading-sized, since it's a one-time task and shouldn't weigh like a section. Expanding it in place turns it back into the section with its heading. When the Shortcut sends you here because setup is missing or the key failed, the section opens expanded and takes focus
- **Content**: 1. "Get the Shortcut" (opens the Shortcut's install link, external). 2. "Turn on Apple Intelligence" (Settings → Apple Intelligence & Siri), with one line on why: it reads the recipe on your device, free. 3. "Add your import key": Create import key shows the key once, with Copy; the Shortcut asks for it the first time it runs. When a key exists: "Import key created 13 Oct", Revoke and create a new one (follows the Destructive confirmations rule: "The Shortcut stops working until you paste the new key."). 4. "In Instagram, tap Share on a reel, then Nate’s Bakery." Each step at most 12 words, apart from the key controls
- **Behavior**: the key is never shown again after it's copied or the page is left; only its creation date is

```text
DESKTOP (centered column)
+------------------------------------------------------+
| SET UP THE SHORTCUT                                  |
| 1  GET THE SHORTCUT  ↗                               |
| 2  TURN ON APPLE INTELLIGENCE                        |
| 3  ADD YOUR IMPORT KEY   [CREATE IMPORT KEY]         |
| 4  IN INSTAGRAM, TAP SHARE ...                       |
+------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| SET UP THE SHORTCUT                  |
| 1  GET THE SHORTCUT  ↗               |
| 2  TURN ON APPLE INTELLIGENCE        |
| 3  ADD YOUR IMPORT KEY               |
|    [      CREATE IMPORT KEY      ]   |
| 4  IN INSTAGRAM, TAP SHARE ...       |
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
| Handed to the Shortcut | Import pressed with a valid link | The status area says "Importing in the Shortcut" and lists its stages: "Getting the caption", "Reading the recipe", "Converting to grams". The Shortcut shows its own progress and opens the draft when done. The line "You can leave: it will wait in your Library under Drafts" and a "Go to Library" link → `/recipes`. If the page is still open when the draft is ready, a link "Open the draft" appears. Announced politely to screen readers |
| Invalid link | The text isn't an Instagram reel or post link | Error text under the field, field marked in error, focus stays in the field; nothing else changes |
| Import failed | Reel is private or deleted, or the caption service is unavailable (Shortcut opens `/import?error=…&url=`) | The status area shows the reason in one sentence ("Couldn't reach this reel. It may be private or deleted, or the import service is down.") and two actions: "Enter it manually" → `/recipes/new?source=<reel link>` (the more prominent one) and "Try another link", which clears the field |
| No recipe in this caption | The caption has no ingredients (the recipe is on a website, or only spoken) | "This reel's caption doesn't include the recipe." with Watch the reel (external), "Enter it manually" (more prominent) and "Try another link" |
| Setup needed | The Shortcut found no import key, or the key was revoked | The Set up the Shortcut section opens expanded and takes focus, with one line on top: "Add your import key to the Shortcut to start importing." (or "Your import key no longer works. Create a new one.") |
| Already imported | The reel matches a saved recipe | The status area shows "You already saved this reel as <recipe title>" with a link to `/recipes/:recipeId`, and "Import again" as a secondary action that runs the Shortcut again with the link (the same hand-off as Import), creating a new draft |
| Signed out | Opened without a session | Handled by the App area guard: `/login?next=/import?url=<reel link>` (SKELETON FLOW-01) |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: The H1 "Import from a reel" (SKELETON's section stack has no title element).
- **Assumed**: A Paste button inside the field where the browser supports reading the clipboard, saving the long-press on iPhone.
- **Assumed**: The import runs inside the Shortcut (it needs Apple Intelligence, which only the Shortcut can reach), so this page hands links to it instead of importing itself. The stage names are the same everywhere: "Getting the caption", "Reading the recipe", "Converting to grams".
- **Assumed**: The import key is created and revoked here, on the page where setup happens, rather than in the account menu.
- **Assumed**: Set up the Shortcut collapses after the first successful import, since setup is a one-time task.
- **Open**: Whether the Mac's Shortcuts app can run the same Shortcut (Apple Intelligence's "Use Model" action). If it can't, Import on the Mac explains that importing runs on the iPhone and points to manual entry.
- **Assumed**: "Enter it manually" is the stronger action after a failed import, because the failure usually means the reel can't be read, not that the link was wrong.
- **Assumed**: No Cancel control here: the Shortcut runs on its own and can be stopped there; a half-finished import leaves a draft with Retry and Discard (SKELETON FLOW-01).

---

## CHANGE LOG

- 1.1.1 (2026-10-13): "Import again" runs the Shortcut again instead of starting Processing.
- 1.1.0 (2026-10-13): Import runs in the Nate’s Bakery Shortcut (caption via the app, recipe read by Apple Intelligence); Import hands pasted links to the Shortcut; setup gains Apple Intelligence and the import key; new states No recipe in this caption and Setup needed; audio stage removed (SKELETON 1.4.0).
- 1.0.2 (2026-10-01): App renamed to Nate’s Bakery.
- 1.0.1 (2026-09-30): Collapsed "How to share from Instagram" is a plain disclosure, not a heading (build review).
- 1.0.0 (2026-09-29): Initial wireframe.
