# BONES: `/recipes/:recipeId/bake` (Bake Mode)

> **Source**: SKELETON.md v1.5.0, `/recipes/:recipeId/bake`
> **Primary Action**: Next step (Finish on the last screen → the Log sheet, `/recipes/:recipeId/log?new=1`)
> **Primary Device**: mobile, because the iPhone sits propped on the counter and is read from about an arm's length away, often touched with floury hands; a propped-up iPad (tablet) is the second case
> **Shell**: BONES-shell.md, Focus variant
> **Version**: 1.4.0 · **Updated**: 2026-10-15

---

## 1. STRUCTURE

```text
HEADER (Focus variant)
├── EXIT (X) → /recipes/:recipeId?scale=
├── RECIPE_TITLE (one line)
├── SCALE_BADGE · STEP_COUNTER ("3 of 7")
└── BAKE_PROGRESS (segments by group)
MAIN
├── TIMERS (pinned under the header on phones)  H2, visually hidden
│   └── TIMER × n
├── CURRENT_STEP
│   ├── STEP_EYEBROW "FILLING · STEP 3"   H1
│   ├── STEP_TEXT with TIMER_CHIP × n inline ("▶ 25 min")
│   └── STEP_INGREDIENTS "For this step" (scaled grams)
├── ALL_INGREDIENTS                         H2
│   └── CHECKLIST_ROW × n (by group)
└── STEP_NAV (sticky): PREVIOUS · NEXT STEP / FINISH
```

**First viewport (mobile)**: the focus header with the progress segments, the running-timers strip when there is one, the Has estimates notice on step 1 when it applies, the step eyebrow (group and step number), the full step text with its timer chips, that step's ingredients, and the sticky Previous and Next step bar.

---

## 2. SECTIONS

### Focus header (from BONES-shell.md, Focus variant)
- **Layout**: one row on both devices: Exit (an X `icon-button`) at the start, recipe title in the middle, scale and step counter at the end; under it, full width, the bake progress; not sticky on desktop, sticky on phones together with the timers strip, so position and timers are always in view
- **Content**: Exit (labeled "Exit bake mode") → `/recipes/:recipeId?scale=`, through the confirmation when timers are running; recipe title truncated at one line; scale ("1.5×", hidden at 1×); "3 of 7" (read as "Step 3 of 7")
- **Behavior**: none

```text
DESKTOP
+-----------------------------------------------------------------------+
| [X]           RECIPE_TITLE                                1.5× · 3/7  |
| ■■ ■□□ □□                                                             |
| ✓ BASE  CHEESE CREAM  BAKING                                          |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| [X]  RECIPE_TITLE...      1.5× · 3/7 |
| ■■    ■□□      □□                    |
| ✓BASE CHEESE CREAM BAKING            |
+--------------------------------------+
```

### Bake progress (SKELETON section 1)
- **Layout**: full width under the focus header row; one segment per numbered step, grouped by component group with a small gap between groups, each group's width proportional to its number of steps; group names under their segments. Recipes without groups: one run of segments, no names
- **Content**: SKIN `bake-progress`: done steps cobalt, the current step cobalt, upcoming steps grout with a border edge; the current group's name cobalt and bold, finished groups muted with a check, upcoming muted. The Tips screen counts as one extra segment in a final group named "Tips"
- **Behavior**: purely a picture of position, hidden from screen readers (the counter and the step heading already say it); tapping a segment does nothing, so it can't be hit by accident with a floury knuckle. Moves with Next step and Previous; no animation under reduced motion

### Current Step (SKELETON section 2)
- **Layout**: desktop and tablet left column (8 of 12 cols; 5 of 8 on tablet); mobile full width. The step text is the largest text on the page, readable from arm's length
- **Content**: one eyebrow line that is the page's H1, "FILLING · STEP 3" ("STEP 3" alone when the recipe has no groups), set in SKIN's `step-eyebrow`, small and in the reading face so the step text stays the dominant element; the full step text (no truncation), with every detected time turned into a `timer-chip` right where it's written ("rest for ▶ 10 min"), labeled "Start 10 minute timer"; once started, the chip becomes a live status in the same place, not a disabled control: "Running · 9:42" with the remaining time in the timer face (it never looks greyed out, which would read as broken), and it can't start a second copy; "For this step": the ingredients the step uses, with scaled grams, at most 8 rows (then "and n more", which scrolls to All Ingredients)
- **Behavior**: moving to another step replaces this section's content, writes `?step=`, and moves focus to the step heading, so screen readers read the new step. On touch devices, swiping left or right also moves between steps; the buttons in Step nav are always there as the reliable way

```text
DESKTOP (left column)
+----------------------------------------------------+
| FILLING · STEP 3                                   |
| STEP TEXT, LARGE, WRAPPING OVER SEVERAL LINES      |
| ... AND REST FOR [▶ 10 MIN] ....................   |
| FOR THIS STEP                                      |
| INGREDIENT_NAME                             000 g  |
| INGREDIENT_NAME                              00 g  |
+----------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| FILLING · STEP 3                     |
| STEP TEXT, LARGE, WRAPPING OVER      |
| SEVERAL LINES, REST [▶ 10 MIN].      |
| FOR THIS STEP                        |
| INGREDIENT_NAME               000 g  |
| INGREDIENT_NAME                00 g  |
+--------------------------------------+
```

### Timers (SKELETON section 3)
- **Layout**: desktop and tablet right column (4 of 12 cols; 3 of 8 on tablet), above All Ingredients; mobile a compact strip pinned under the focus header (sticky with it), so running timers stay visible on every step and the bottom of the screen stays for Step nav. Reference: Pestle keeps running timers in the bar at the top while you cook
- **Content**: one row per timer: label (step number and group, "Step 3 · Filling", plus the duration when two timers come from the same step), time remaining, Pause or Resume, Clear. Desktop and tablet: label above, time in SKIN's `timer` size beside the controls. Mobile strip: each timer is two short lines, the label on one line (truncated, never wrapped) and below it the time at the strip's smaller size with Pause and Clear, so two timers never take more than about a sixth of the screen; at most 2 timers in the strip, then "+n more", which expands the strip upward to show all
- **Behavior**: hidden when no timer exists. Timers are sorted by time remaining, soonest first, in both the mobile strip and the desktop panel, so the next one to finish is always on top (paused timers sort by their remaining time too). Timers run across steps and survive a refresh (they are kept as end times, not counters). Remaining time is not announced every second; only start, pause, and finish are announced

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
MOBILE (strip under the focus header)
+--------------------------------------+
| STEP 3 · FILLING                     |
| 12:40                    [II] [x]    |
| STEP 5 · BAKING                      |
| 24:05                    [II] [x]    |
+--------------------------------------+
```

### All Ingredients (SKELETON section 4)
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
- **Content**: Previous (hidden on step 1); Next step, which becomes Finish on the last screen (the Tips screen when the recipe has tips, otherwise the last step)
- **Behavior**: Next step and Previous write `?step=`; Finish → `/recipes/:recipeId/log?new=1`, which opens the Log sheet (BONES-recipes-log.md) with today and the scale prefilled and focus on the stars. If any timer is still running when Finish is pressed (a last "cool 30 minutes" is common), Finish first asks "Stop timers and finish?" using the Destructive confirmations rule in BONES-shell; the safe action is Keep baking. Both targets are large enough to hit with a knuckle (SKIN.md's minimum or more)

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
| Last step | `?step=` is the last step | Next step becomes Finish, or "Next: Tips" when the recipe has tips |
| Tips | `?step=tips`, after the last numbered step, only when the recipe has a Tips group | One screen with every tip: eyebrow "TIPS" as the H1 (no step number), the tips as a plain list at step-text size, no "For this step" and no timer buttons ("let it cool overnight" isn't a timer). The focus header's progress reads "Tips" instead of "12/12". Running timers stay in their strip. Next step becomes Finish |
| Invalid step | `?step=` missing, not a number, or out of range | Opens the nearest valid step and corrects the URL; no error shown |
| Timer finished | A timer reaches zero | A banner across the top of the viewport, above everything, on every device: "Step 3 · Filling timer is done" with Dismiss; it stays until dismissed, plays a sound, and is announced immediately to screen readers. Several finished timers stack in the banner, newest first. The timer row shows 00:00 until dismissed |
| Exit confirmation | Exit pressed with a timer running | Mobile: bottom sheet, about a third of the viewport; desktop: centered modal, 4 cols wide. "Stop timers and leave?", Leave (stops timers → `/recipes/:recipeId?scale=`) and Keep baking. Focus starts on Keep baking and returns to Exit |
| Timer alerts card | Timer alerts are off, the card hasn't been dismissed, and a timer has just been started | A one-line card at the top of Current Step: "Get alerts when your phone is locked", "Set up" (opens the Timer alerts sheet from BONES-shell.md), and Dismiss. It appears the first time a timer starts in a bake, when locked-phone alerts actually matter, not on step 1, so step 1 opens with at most one notice |
| Finish with timers | Finish pressed while a timer runs | "Stop timers and finish?" confirmation (BONES-shell Destructive confirmations): "Your running timers will stop."; Stop and finish (destructive); Keep baking (safe, last). Stop and finish → `/recipes/:recipeId/log?new=1` |
| Timer alerts sheet | Set up on the card | As defined in BONES-shell.md |
| Screen awake | Always, while this route is open | No layout change; the screen is kept from dimming or locking. If the device refuses, a one-line notice at the top of Current Step: "Your screen may lock. Timers still run when you come back." |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: Creator tips get one screen at the end rather than a line on each step, because most are about the end (cooling, resting, serving) and Bake Mode shows one thing at a time. Their times never become timers.
- **Assumed**: The step eyebrow ("FILLING · STEP 3") is the page's H1 and changes with each step, because it's what the page is about at any moment; it's visually small on purpose so the step text dominates. The recipe title is in the focus header.
- **Assumed**: "For this step" lists the ingredients linked to the step in the editor (BONES-import-detail.md, "Uses:"); it is hidden for steps with no linked ingredients.
- **Assumed**: Step nav is sticky on every device, including desktop, because it's the main control in this mode.
- **Assumed**: Swipe to change steps as a touch shortcut, with the buttons as the reliable way.
- **Decided** (2026-10-15, Nathan): A progress picture by component group, because recipes run 5 to 12 steps and numbered dots stop working past about 6 (design-system stepper guidance); grouping says where you are in the bake ("still on the filling"), which a plain bar doesn't. "3 of 7" and the H1 carry the position for screen readers.
- **Decided** (2026-10-15): Timer buttons move into the step text as chips where the time is written (Crouton and Pestle both start timers from the highlighted time), and the running-timers strip moves to the top on phones. Live Activities on the Lock Screen would be the native upgrade if the app is wrapped (Apple's guidance fits tasks with a defined end, like a bake timer).
- **Assumed**: Timers survive a refresh and keep running between steps.
- **Assumed**: While Bake Mode is on screen, a finished timer shows the banner and plays a sound. When the phone is locked or another app is in front, the alert comes as a notification, but only once timer alerts are on (SKELETON FLOW-05); until then, keeping the screen awake is the safeguard.
- **Assumed**: The Timer alerts card appears when the first timer of a bake starts, the moment it matters; dismissing it hides it for good.
- **Assumed**: Moving between steps replaces the URL rather than adding browser history, so Back leaves Bake Mode instead of stepping back.
- **Open**: Remember the last step per recipe, so re-entering Bake Mode offers "Continue from step 4" (backlog).
- **Assumed**: All Ingredients opens by default only on step 1, for weighing everything before starting (mise en place).
- **Assumed**: Ingredient checks are temporary, for this bake only.
- **Open**: Friends' Bake Mode on shared recipes (SKELETON open question). This layout would work for them without the log step.

---

## CHANGE LOG

- 1.4.0 (2026-10-15): Visual upgrade round: bake progress segmented by component group under the header; Exit as an X; timers become inline chips in the step text; the mobile timers strip moves under the header (sticky); Finish opens the Log sheet (SKELETON 1.5.0).
- 1.3.0 (2026-10-14): A Tips screen after the last step (`?step=tips`), unnumbered, with no timers; Finish moves to it (SKELETON 1.4.4).
- 1.2.1 (2026-09-30): Timers sorted by time remaining, soonest first (recorded from the build).
- 1.2.0 (2026-09-30): After the first build review: one step eyebrow line ("FILLING · STEP 3") as the H1; compact two-line timers in the mobile strip; started timer buttons show a live "Running · 29:12" status; Timer alerts card appears when the first timer starts; Finish asks before stopping running timers.
- 1.1.0 (2026-09-29): Added the Timer alerts card and sheet; "For this step" now reads the editor's ingredient links (SKELETON 1.3.0).
- 1.0.0 (2026-09-29): Initial wireframe.
