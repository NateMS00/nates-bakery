# BONES: `/recipes/:recipeId/bake` (Bake Mode)

> **Source**: SKELETON.md v1.5.0, `/recipes/:recipeId/bake`
> **Primary Action**: Next step (Finish on the last screen → the Log sheet, `/recipes/:recipeId/log?new=1`)
> **Primary Device**: mobile, because the iPhone sits propped on the counter and is read from about an arm's length away, often touched with floury hands; a propped-up iPad (tablet) is the second case
> **Shell**: BONES-shell.md, Focus variant, on the dark stage (SKIN `bake-stage`) in both themes
> **Version**: 1.5.1 · **Updated**: 2026-10-19

---

## 1. STRUCTURE

The whole route is SKIN's `bake-stage`: ink-navy background edge to edge, cream text, ochre for the one loud thing, an ochre focus ring, in light and dark mode alike. One idea per screen: each step has one hero, either the giant outlined step number or, when the step has a timer, the big clock.

```text
HEADER (Focus variant, on the stage)
├── EXIT (X) → /recipes/:recipeId?scale=
├── RECIPE_TITLE (one line, voice italic)
├── SCALE_BADGE · STEP_COUNTER ("3 / 7")
├── TIMER_PILLS (running timers from steps you've left; at most 2, then +n)
└── BAKE_PROGRESS (segments by group)
MAIN
├── STEP_STACK (finished steps as strips; the last 3, or 2)
├── CURRENT_STEP
│   ├── HERO: STEP_NUMBER "03" (outlined, decorative)  ─ or ─  BAKE_CLOCK (step with a timer)
│   ├── STEP_EYEBROW "filling · step 3 · first rise"   H1
│   ├── STEP_TEXT with TIMER_CHIP × n inline ("◷ 1 h 30")
│   └── STEP_INGREDIENTS "For this step" (scaled grams)
├── ALL_INGREDIENTS                         H2
│   └── CHECKLIST_ROW × n (by group)
└── STEP_NAV (sticky): BACK · NEXT STEP / FINISH AND LOG
```

On a clock step the order inside Current Step is eyebrow, step text, then the clock (the text says what you're timing before the clock takes the screen); on any other step it is number, eyebrow, text.

**First viewport (mobile)**: the stage header with any timer pills and the progress segments, the step stack, then either the outlined number with the eyebrow and the full step text, or the eyebrow, the step text and the whole clock with its controls; and the sticky Back and Next step bar. "For this step" may sit just below the fold on a clock step.

---

## 2. SECTIONS

### Focus header (from BONES-shell.md, Focus variant)
- **Layout**: one row on both devices: Exit (a cream outlined round `icon-button`) at the start, the recipe title in the middle in SKIN's `voice` italic, scale and step counter at the end in `label-mono`; under it the timer pills when any run, then the bake progress, full width. Sticky on phones (with the pills, so running timers and position are always in view); not sticky on desktop
- **Content**: Exit (labeled "Exit bake mode") → `/recipes/:recipeId?scale=`, through the confirmation when timers are running; recipe title truncated at one line; scale ("1.5×", hidden at 1×); "3 / 7" (read as "Step 3 of 7")
- **Behavior**: none

```text
MOBILE (stage)
+--------------------------------------+
| (X)     Pão de Deus        1.5× · 3/7 |
| (◔ KNEAD 06:12             [PAUSE])  |
| ▬▬ ▬▬ ▬▬ ▭▭ ▭▭                        |
+--------------------------------------+
```

### Bake progress (SKELETON section 1)
- **Layout**: full width under the header row and pills; one 6px pill segment per numbered step, grouped by component group with a small gap between groups, each group's width proportional to its number of steps; group names under their segments in `label-mono`. Recipes without groups: one run of segments, no names
- **Content**: SKIN `bake-progress` on the stage: finished steps cream, the current step ochre, upcoming steps the stage track (3.2:1). The Tips screen counts as one extra segment in a final group named "tips"
- **Behavior**: purely a picture of position, hidden from screen readers (the counter and the step heading already say it); tapping a segment does nothing, so it can't be hit by accident with a floury knuckle (the step stack is where you jump back). No animation under reduced motion

### Step stack (added; see Assumptions)
- **Layout**: under the progress, full width of the step column; SKIN `step-stack` of `step-strip`s, 44px tall, 4px apart. The last 3 finished steps show (2 on a clock step and on screens under 740px tall); older ones collapse into one line "+4 more done" in `label-mono`, which expands the stack in place. Hidden on step 1
- **Content**: each strip: the number ("02") in mono, the step's short name, and at its end a check, or "◷ running" when that step's timer is still running. The short name is the step's first few words (up to about 24 characters, cut at a word) unless the editor gives the step a name; when cut, it ends with "…" and never on a dangling small word (and, or, the, a, for, with, of, to, into, at): "Whisk the egg, milk…", not "Whisk the egg, milk and"
- **Behavior**: on every step change the page scrolls back to the top before focus moves to the step heading (focus without scrolling), so the stack is always in view under the header and pills, never scrolled away beneath them. Tapping a strip goes back to that step (writes `?step=`, focus to its heading). When you move forward, the step you finished shrinks into a new strip at the bottom of the stack while the next step rises into place (SKIN `{motion.step}`); under reduced motion the content just swaps with a short fade. Each strip is a button named "Back to step 2, Knead, done"

```text
MOBILE (step stack)
+--------------------------------------+
| +4 MORE DONE                         |
| [01  WARM THE MILK               ✓ ] |
| [02  KNEAD               ◷ RUNNING ] |
+--------------------------------------+
```

### Current Step (SKELETON section 2)
- **Layout**: desktop and tablet left column (8 of 12 cols; 5 of 8 on tablet), with the step stack above it; mobile full width. Generous space around the hero (SKIN: one idea per screen)
- **Content, step without a timer**: the step number, two digits ("03"), in SKIN `bake-step-number` (Fraunces 900, outlined, about 104px on phones, 120px from tablet up), decorative and hidden from screen readers; under it the eyebrow, the page's H1, in `label-mono` lowercase: "filling · step 3 · first rise" ("step 3" plus the short name when the recipe has no groups); then the full step text in SKIN `step-text` (Atkinson, 24px on phones, 28px from tablet up), cream, never truncated. (A step without a timer has no detected times, so it has no chips.)
- **Content, step with a timer**: the eyebrow, then the step text at 20px (so the clock fits), then SKIN `bake-clock` centred: a 264px ring (320px from tablet up), ochre arc on the stage track, the remaining time as large solid digits ("10:00"), the state under them ("ready", "running", "paused", "done") and, while running, "Keep this screen open"; under the ring −1 min, Start (Pause / Resume once running) and +1 min. The clock is set from the step's first detected time; that time's chip in the text shows the same duration, and tapping it moves focus to the clock's Start (or Resume). Under the ring the adjust buttons read "−1" and "+1" (cream outlined pills, named "Remove one minute" and "Add one minute"). A paused clock counts as idle for the one-loud-button rule: Resume is ochre and Next step secondary. Any further time in the same step stays a chip that starts its own timer (shown as a pill)
- **For this step**: the ingredients the step uses, with scaled grams in the mono face, ruled in cream, at most 8 rows (then "and n more", which scrolls to All Ingredients). Hidden for steps with no linked ingredients
- **Behavior**: moving to another step replaces this section's content, writes `?step=`, and moves focus to the step heading. On touch devices, swiping left or right also moves between steps; Step nav's buttons are always there as the reliable way. While a clock step's timer is idle, its Start is the screen's one ochre button and Next step is drawn as a secondary (cream outlined) button; once the clock runs, Next step is ochre again

```text
MOBILE (step without a timer)
+--------------------------------------+
|  ___   ____                          |
| | 0 | |  3 |   (outlined, 104px)     |
|  ‾‾‾   ‾‾‾‾                          |
| filling · step 3 · first rise        |
| STEP TEXT, LARGE, CREAM, WRAPPING    |
| OVER SEVERAL LINES, REST [◷ 10 MIN]. |
| FOR THIS STEP                        |
| INGREDIENT_NAME               000 g  |
+--------------------------------------+
```

```text
MOBILE (step with a timer)
+--------------------------------------+
| dough · step 2 · knead               |
| Add flour, eggs and salt. Knead      |
| until the dough windowpanes.         |
|            .-~~~~~-.                 |
|          /  10:00    \               |
|         |    ready    |   (ring)     |
|          \           /               |
|            '-.___.-'                 |
|      [−1]  (  START  )  [+1]         |
+--------------------------------------+
```

```text
DESKTOP (stage)
+----------------------------------------------+-----------------------+
| [01 WARM THE MILK ✓]                         | (◔ KNEAD 06:12 PAUSE) |
| [02 KNEAD   ◷ RUNNING]                       |                       |
|                                              | ALL INGREDIENTS       |
|  03  (outlined, 120px)                       | DOUGH                 |
|  filling · step 3 · first rise               | [x] FLOUR      500 g  |
|  STEP TEXT, LARGE ..... [◷ 1 H 30] ....      | [ ] MILK       250 g  |
|  FOR THIS STEP                               |                       |
+----------------------------------------------+-----------------------+
```

### Timers (SKELETON section 3)
- **Layout**: a running timer lives in one of two places. On its own step, it is that step's `bake-clock`. Once you move to another step while it runs, it becomes a SKIN `timer-pill` pinned under the header row (phones) or at the top of the right column (desktop and tablet): an ochre pill with a 32px mini ring, the step's short name, the time remaining and Pause. At most 2 pills show, sorted by time remaining, soonest first; then "+n". Tapping a pill (anywhere but its Pause) or "+n" opens the Timers sheet, listing every timer with Go to step, Pause or Resume, and Clear, so Clear is always reachable. Going back to the step brings its clock back. Reference: Pestle keeps running timers in a bar at the top while you cook
- **Behavior**: timers run across steps and survive a refresh (kept as end times, not counters). Remaining time is not announced every second; the clock speaks at 1 minute left and when done, and start, pause and clear are announced. When a timer ends: if its clock is on screen, the clock shows its done state (ring solid ochre, "Done"), the chime plays and the phone vibrates where supported; otherwise its pill becomes the Timer finished banner (section 3). Nothing flashes

### All Ingredients (SKELETON section 4)
- **Layout**: desktop and tablet right column under the timer pills, scrolling with the page; mobile full width below Current Step, collapsed to its heading "All ingredients (14)" except on step 1, where it opens by default for weighing everything out
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
- **Layout**: pinned to the bottom edge on every device, full width of the content area, above the home indicator on phones, on the stage; Back takes about a third (a cream outlined pill), Next step about two thirds (the ochre pill); both 64px tall (SKIN `touch-bake`); the page reserves space so nothing is covered
- **Content**: Back (hidden on step 1); Next step, which becomes "Finish and log" on the last screen (the Tips screen when the recipe has tips, otherwise the last step). On a clock step whose timer hasn't started, Next step is drawn as the secondary button (Start is the ochre one)
- **Behavior**: Next step and Back write `?step=`; Finish and log → `/recipes/:recipeId/log?new=1`, which opens the Log sheet (BONES-recipes-log.md) with today and the scale prefilled and focus on the stars; after Save, the After-save moment (celebration or toast) and then the Recipe page. If any timer is still running when Finish and log is pressed (a last "cool 30 minutes" is common), it first asks "Stop timers and finish?" using the Destructive confirmations rule in BONES-shell; the safe action is Keep baking

```text
MOBILE
+--------------------------------------+
| ( BACK  ) (      NEXT STEP         ) |
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
| Timer finished | A timer reaches zero while its clock isn't on screen | Its pill becomes SKIN `timer-alert` across the top of the viewport, above everything: "Step 2 is done" as the heading and the step's short name under it ("Knead the dough…"), with Go to step and Dismiss; it stays until dismissed, plays the chime, vibrates where supported, and is announced immediately to screen readers. Several finished timers stack, newest first. When the clock is on screen, the clock's done state is the alert instead (section 2) |
| Exit confirmation | Exit pressed with a timer running | Mobile: bottom sheet, about a third of the viewport; desktop: centered modal, 4 cols wide. "Stop timers and leave?", Leave (stops timers → `/recipes/:recipeId?scale=`) and Keep baking. Focus starts on Keep baking and returns to Exit |
| Timer alerts card | Timer alerts are off, the card hasn't been dismissed, and a timer has just been started | A one-line card at the top of Current Step: "Get alerts when your phone is locked", "Set up" (opens the Timer alerts sheet from BONES-shell.md), and Dismiss. It appears the first time a timer starts in a bake, when locked-phone alerts actually matter, not on step 1, so step 1 opens with at most one notice |
| Finish with timers | Finish pressed while a timer runs | "Stop timers and finish?" confirmation (BONES-shell Destructive confirmations): "Your running timers will stop."; Stop and finish (destructive); Keep baking (safe, last). Stop and finish → `/recipes/:recipeId/log?new=1` |
| Timer alerts sheet | Set up on the card | As defined in BONES-shell.md |
| Screen awake | Always, while this route is open | No layout change; the screen is kept from dimming or locking (Screen Wake Lock). A running clock always reads "Keep this screen open" under its state, because until locked-phone alerts exist (Timer alerts sheet, or a native wrap) a web app can't reliably ring once the phone locks. If the device refuses the wake lock, a one-line notice at the top of Current Step: "Your screen may lock. Timers still run when you come back." |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: Creator tips get one screen at the end rather than a line on each step, because most are about the end (cooling, resting, serving) and Bake Mode shows one thing at a time. Their times never become timers.
- **Assumed**: The step eyebrow ("filling · step 3 · first rise") is the page's H1 and changes with each step; the giant outlined number above it is decorative, so screen readers hear the eyebrow once, not the number twice. The recipe title is in the focus header.
- **Decided** (2026-10-16, Nathan, personality round): Bake Mode becomes a dark stage in both themes, with one hero per step: the giant outlined step number, or the big clock on a step with a timer (reference: Bucks Sauce's one idea per screen and outlined numerals). Finished steps stack as strips above the current one, like Bucks' stacking cards, and tapping one goes back. A timer you leave running shrinks into an ochre pill under the header.
- **Decided** (2026-10-16): Every step with a timer gets the clock, whatever its length: one rule, no judgement about which timers matter (the import can't make that call). The clock uses the step's first time; any further time stays a chip.
- **Assumed**: The step text stays in Atkinson Hyperlegible on the stage (the wireframe mock showed Fraunces): it's the one thing read from a metre away mid-task (SKIN Typography principles). The personality comes from the number and the clock.
- **Assumed**: Step strips are 44px, below SKIN's 48px minimum, so three fit on a phone; 44px still meets WCAG 2.5.5.
- **Assumed**: A step's short name for the strips is its first words (about 24 characters, cut at a word) until the editor offers a step name field.
- **Assumed**: "For this step" lists the ingredients linked to the step in the editor (BONES-import-detail.md, "Uses:"); it is hidden for steps with no linked ingredients.
- **Assumed**: Step nav is sticky on every device, including desktop, because it's the main control in this mode.
- **Assumed**: Swipe to change steps as a touch shortcut, with the buttons as the reliable way.
- **Decided** (2026-10-15, Nathan): A progress picture by component group, because recipes run 5 to 12 steps and numbered dots stop working past about 6 (design-system stepper guidance); grouping says where you are in the bake ("still on the filling"), which a plain bar doesn't. "3 of 7" and the H1 carry the position for screen readers.
- **Decided** (2026-10-15): Timer buttons move into the step text as chips where the time is written (Crouton and Pestle both start timers from the highlighted time), and running timers move to the top on phones (now as pills, 1.5.0). Live Activities on the Lock Screen would be the native upgrade if the app is wrapped (Apple's guidance fits tasks with a defined end, like a bake timer).
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

- 1.5.1 (2026-10-19): From the Stage 4b build and review: the timer-chip sentence moves to clock steps (a step without a timer has none); a chip on a clock step focuses the clock; −1/+1 as labeled pills; a paused clock counts as idle (Resume is ochre); pills open the Timers sheet (with Go to step and Clear); step changes scroll to the top so the stack stays visible; short names never end on a dangling word; the finished-timer banner reads "Step 2 is done" with the short name under it.
- 1.5.0 (2026-10-16): Personality round: the dark stage in both themes; one hero per step (outlined step number, or the big clock on a step with a timer, with −1/+1 and Start); finished steps stack as tappable strips; running timers you leave become ochre pills under the header (the timers strip and desktop panel are gone); progress segments cream, ochre and track; eyebrow in lowercase mono with the step's short name; "Finish and log"; Previous renamed Back; "Keep this screen open" on running clocks.
- 1.4.0 (2026-10-15): Visual upgrade round: bake progress segmented by component group under the header; Exit as an X; timers become inline chips in the step text; the mobile timers strip moves under the header (sticky); Finish opens the Log sheet (SKELETON 1.5.0).
- 1.3.0 (2026-10-14): A Tips screen after the last step (`?step=tips`), unnumbered, with no timers; Finish moves to it (SKELETON 1.4.4).
- 1.2.1 (2026-09-30): Timers sorted by time remaining, soonest first (recorded from the build).
- 1.2.0 (2026-09-30): After the first build review: one step eyebrow line ("FILLING · STEP 3") as the H1; compact two-line timers in the mobile strip; started timer buttons show a live "Running · 29:12" status; Timer alerts card appears when the first timer starts; Finish asks before stopping running timers.
- 1.1.0 (2026-09-29): Added the Timer alerts card and sheet; "For this step" now reads the editor's ingredient links (SKELETON 1.3.0).
- 1.0.0 (2026-09-29): Initial wireframe.
