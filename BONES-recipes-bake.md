# BONES: `/recipes/:recipeId/bake` (Bake Mode)

> **Source**: SKELETON.md v1.3.0, `/recipes/:recipeId/bake`
> **Primary Action**: Next step (Finish on the last step → `/recipes/:recipeId/log?new=1`)
> **Primary Device**: mobile, because the iPhone sits propped on the counter and is read from about an arm's length away, often touched with floury hands; a propped-up iPad (tablet) is the second case
> **Shell**: BONES-shell.md, Focus variant
> **Version**: 1.1.0 · **Updated**: 2026-09-29

---

## 1. STRUCTURE

```text
HEADER (Focus variant)
├── EXIT → /recipes/:recipeId?scale=
├── RECIPE_TITLE (one line)
└── SCALE_BADGE · STEP_COUNTER ("Step 3 of 12")
MAIN
├── CURRENT_STEP
│   ├── GROUP_NAME ("Filling")
│   ├── STEP_HEADING "Step 3"               H1
│   ├── STEP_TEXT
│   ├── STEP_INGREDIENTS (scaled grams)
│   └── TIMER_BUTTON × n ("Start 25 min")
├── TIMERS                                  H2 (only when a timer exists)
│   └── TIMER × n
├── ALL_INGREDIENTS                         H2
│   └── CHECKLIST_ROW × n (by group)
└── STEP_NAV (sticky): PREVIOUS · NEXT STEP / FINISH
```

**First viewport (mobile)**: the focus header, the group name and step heading, the full step text, that step's ingredients, its timer buttons, the running-timers strip when there is one, and the sticky Previous and Next step bar.

---

## 2. SECTIONS

### Focus header (from BONES-shell.md, Focus variant)
- **Layout**: one row on both devices: Exit at the start, recipe title in the middle, scale and step counter at the end; not sticky
- **Content**: Exit (labeled "Exit bake mode" for screen readers) → `/recipes/:recipeId?scale=`, through the confirmation when timers are running; recipe title truncated at one line; scale ("1.5×", hidden at 1×); "Step 3 of 12"
- **Behavior**: none

```text
DESKTOP
+-----------------------------------------------------------------------+
| < EXIT        RECIPE_TITLE                          1.5× · STEP 3/12  |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| < EXIT  RECIPE_TITLE...  1.5× · 3/12 |
+--------------------------------------+
```

### Current Step (SKELETON section 1)
- **Layout**: desktop and tablet left column (8 of 12 cols; 5 of 8 on tablet); mobile full width. The step text is the largest text on the page, readable from arm's length
- **Content**: group name as a small label (hidden when the recipe has no groups); "Step 3" as the heading; the full step text (no truncation); "For this step": the ingredients the step uses, with scaled grams, at most 8 rows (then "and n more", which scrolls to All Ingredients); one button per detected time, "Start 25 min timer" (a started time shows "Running" and can't be started twice at once)
- **Behavior**: moving to another step replaces this section's content, writes `?step=`, and moves focus to the step heading, so screen readers read the new step. On touch devices, swiping left or right also moves between steps; the buttons in Step nav are always there as the reliable way

```text
DESKTOP (left column)
+----------------------------------------------------+
| FILLING                                            |
| STEP 3                                             |
| STEP TEXT, LARGE, WRAPPING OVER SEVERAL LINES      |
| ................................................   |
| FOR THIS STEP                                      |
| INGREDIENT_NAME                             000 g  |
| INGREDIENT_NAME                              00 g  |
| [START 25 MIN TIMER]                               |
+----------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| FILLING                              |
| STEP 3                               |
| STEP TEXT, LARGE, WRAPPING OVER      |
| SEVERAL LINES ...................    |
| FOR THIS STEP                        |
| INGREDIENT_NAME               000 g  |
| INGREDIENT_NAME                00 g  |
| [      START 25 MIN TIMER      ]     |
+--------------------------------------+
```

### Timers (SKELETON section 2)
- **Layout**: desktop and tablet right column (4 of 12 cols; 3 of 8 on tablet), above All Ingredients; mobile a compact strip pinned just above Step nav, so running timers stay visible on every step
- **Content**: one row per timer: label (step number and group, "Step 3 · Filling"), time remaining (the largest element of the row), Pause or Resume, Clear; on mobile at most 2 rows in the strip, then "+n more", which expands the strip upward to show all
- **Behavior**: hidden when no timer exists. Timers run across steps and survive a refresh (they are kept as end times, not counters). Remaining time is not announced every second; only start, pause, and finish are announced

```text
DESKTOP (right column)
+-------------------------------+
| TIMERS                        |
| STEP 3 · FILLING              |
| 12:40        [PAUSE] [CLEAR]  |
| STEP 5 · BAKING               |
| 24:05        [PAUSE] [CLEAR]  |
+-------------------------------+
```

```text
MOBILE (strip above Step nav)
+--------------------------------------+
| STEP 3 · FILLING  12:40  [II] [x]    |
| STEP 5 · BAKING   24:05  [II] [x]    |
+--------------------------------------+
```

### All Ingredients (SKELETON section 3)
- **Layout**: desktop and tablet right column under Timers, scrolling with the page; mobile full width below Current Step, collapsed to its heading "All ingredients (14)" except on step 1, where it opens by default for weighing everything out
- **Content**: every ingredient with scaled grams, under group headings, each row a checkbox; checked rows stay in place and are marked done; no limit on rows
- **Behavior**: checks last for this bake only and clear on Finish or Exit; checking doesn't move anything

```text
DESKTOP (right column)
+-------------------------------+
| ALL INGREDIENTS               |
| CRUST                         |
| [x] INGREDIENT_NAME    000 g  |
| [ ] INGREDIENT_NAME     00 g  |
| FILLING                       |
| [ ] INGREDIENT_NAME    000 g  |
+-------------------------------+
```

```text
MOBILE
+--------------------------------------+
| ALL INGREDIENTS (14)             [v] |
| CRUST                                |
| [x] INGREDIENT_NAME           000 g  |
| [ ] INGREDIENT_NAME            00 g  |
+--------------------------------------+
```

### Step nav (primary action)
- **Layout**: pinned to the bottom edge on every device, full width of the content area, above the home indicator on phones; Previous takes about a third, Next step about two thirds; the page reserves space so nothing is covered
- **Content**: Previous (hidden on step 1); Next step, which becomes Finish on the last step
- **Behavior**: Next step and Previous write `?step=`; Finish → `/recipes/:recipeId/log?new=1` with date and scale prefilled. Both targets are large enough to hit with a knuckle (SKIN.md's minimum or more)

```text
DESKTOP
+-----------------------------------------------------------------------+
| [   PREVIOUS   ]        [            NEXT STEP                ]       |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| [PREVIOUS ] [      NEXT STEP       ] |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| Loading | Recipe not yet loaded | Focus header and Step nav render; Current Step shows placeholders for heading, 4 lines of text, and 2 ingredient rows |
| Has estimates | Recipe has Estimated amounts; shown on step 1 only | One-line notice at the top of Current Step: "Some amounts are estimates", dismissible; baking continues (SKELETON FLOW-02) |
| Last step | `?step=` is the last step | Next step becomes Finish |
| Invalid step | `?step=` missing, not a number, or out of range | Opens the nearest valid step and corrects the URL; no error shown |
| Timer finished | A timer reaches zero | A banner across the top of the viewport, above everything, on every device: "Step 3 · Filling timer is done" with Dismiss; it stays until dismissed, plays a sound, and is announced immediately to screen readers. Several finished timers stack in the banner, newest first. The timer row shows 00:00 until dismissed |
| Exit confirmation | Exit pressed with a timer running | Mobile: bottom sheet, about a third of the viewport; desktop: centered modal, 4 cols wide. "Stop timers and leave?", Leave (stops timers → `/recipes/:recipeId?scale=`) and Keep baking. Focus starts on Keep baking and returns to Exit |
| Timer alerts card | Timer alerts are off and the card hasn't been dismissed | A one-line card at the top of Current Step, below the Has estimates notice when both show: "Get alerts when your phone is locked", "Set up" (opens the Timer alerts sheet from BONES-shell.md), and Dismiss. Shown on step 1 and whenever a timer is started while alerts are off |
| Timer alerts sheet | Set up on the card | As defined in BONES-shell.md |
| Screen awake | Always, while this route is open | No layout change; the screen is kept from dimming or locking. If the device refuses, a one-line notice at the top of Current Step: "Your screen may lock. Timers still run when you come back." |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: The step heading is the page's H1 and changes with each step, because it's what the page is about at any moment; the recipe title is in the focus header.
- **Assumed**: "For this step" lists the ingredients linked to the step in the editor (BONES-import-detail.md, "Uses:"); it is hidden for steps with no linked ingredients.
- **Assumed**: Step nav is sticky on every device, including desktop, because it's the main control in this mode.
- **Assumed**: Swipe to change steps as a touch shortcut, with the buttons as the reliable way.
- **Assumed**: Timers survive a refresh and keep running between steps.
- **Assumed**: While Bake Mode is on screen, a finished timer shows the banner and plays a sound. When the phone is locked or another app is in front, the alert comes as a notification, but only once timer alerts are on (SKELETON FLOW-05); until then, keeping the screen awake is the safeguard.
- **Assumed**: The Timer alerts card shows on step 1 and again when a timer starts, because those are the moments it matters; dismissing it hides it for good.
- **Assumed**: All Ingredients opens by default only on step 1, for weighing everything before starting (mise en place).
- **Assumed**: Ingredient checks are temporary, for this bake only.
- **Open**: Friends' Bake Mode on shared recipes (SKELETON open question). This layout would work for them without the log step.

---

## CHANGE LOG

- 1.1.0 (2026-09-29): Added the Timer alerts card and sheet; "For this step" now reads the editor's ingredient links (SKELETON 1.3.0).
- 1.0.0 (2026-09-29): Initial wireframe.
