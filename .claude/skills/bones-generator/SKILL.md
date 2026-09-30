---
name: bones-generator
description: Creates or updates BONES-[page].md, a low-fidelity structural wireframe for one route defined in SKELETON.md (section order, column spans and proportions, what fits in the first viewport, content density, desktop and mobile layouts, and how states and overlays change the page), plus a shared BONES-shell.md for header, navigation, and footer. Use whenever the user wants a wireframe, page layout, component placement, above-the-fold plan, or responsive behavior for a page, or asks for a BONES file, even if they just say "lay out the pricing page" or "how should /dashboard be arranged". Not for sitemaps or routes (SKELETON.md), visual design such as colors, type, or spacing tokens (SKIN.md), or component code.
---

# Bones Generator

Produce `BONES-[page].md`: the layout for one route, precise enough that a designer or an agent can draw it in grayscale without guessing where things go, how big they are, or what happens on a phone.

## Where BONES fits

Each spec file owns one layer. SKELETON.md decides which pages exist, what each page contains, and in what priority. BONES decides where those contents sit and how much space they get. SKIN.md decides how they look. Keep the layers apart because agents read all three together, and when two files describe the same thing they drift and the agent has to guess which one wins.

In practice:

- **SKELETON.md is the source of truth for content.** Use its section names verbatim and in its order, its primary action, its states, and its overlays. If the layout needs a section SKELETON doesn't have, add it and flag it under Assumptions, so the owner of SKELETON.md can accept or reject it. Link only to routes SKELETON.md defines. The same holds inside sections: every data field, control, badge, and message you draw must trace to SKELETON.md. If the layout needs one that isn't there (a sub-rating, a timestamp, a confirmation toast), decide it, draw it, and list it under Assumptions, because builders read every drawn detail as a requirement and the SKELETON.md owner needs to see what was added.
- **BONES owns arrangement, not appearance.** Column spans, proportions, order, alignment, stacking, sticky or scrolling behavior, and relative spacing (small, medium, large) belong here. Colors, fonts, type sizes, radius, shadows, and motion style belong in SKIN.md. Write layout in plain terms ("stack, medium gap"), not CSS or framework classes (`flex`, `space-y-4`, `col-span-2`), because the implementing agent picks the framework.
- **Measurements come from SKIN.md when it exists.** Take breakpoints, container width, and grid columns from it. When it doesn't exist, assume conventional values, state them once in the shell file, and record them as assumptions. Express everything else as column spans or fractions, never pixels.
- **State each fact once.** Header, navigation, and footer live in `BONES-shell.md`, and each page file references the shell instead of redrawing it. SKELETON.md already states each page's goal and each section's purpose, so a BONES file cites them rather than rewriting them.

## Workflow

### 1. Read the source

Read SKELETON.md: the route's Route Map entry (goal, access, params), its page spec (primary action, section stack, overlays, states), the Navigation section, and the persona. Read SKIN.md if present, and any existing BONES files.

If there is no SKELETON.md, ask the user for the page's sections and primary action in one question, or infer them from the conversation and record them as assumptions.

### 2. Check for existing files

If `BONES-shell.md` exists, reference it. If it doesn't, create it along with the page file, covering only the shell variant this page uses (public site or signed-in app). If the page file exists, update it in place, keep section names stable, bump the version (major for removed or reordered sections, minor for additions, patch for wording), and add a Change Log entry.

Name page files from the route: drop parameters, join the remaining segments with hyphens, and add `-detail` when the route ends in a parameter. `/` is `BONES-home.md`, `/work` is `BONES-work.md`, `/listings/:listingId` is `BONES-listings-detail.md`, `/app/locations/:locationId/schedule` is `BONES-app-locations-schedule.md`.

### 3. Decide device and priority

Pick the primary device from SKELETON.md's persona and product context, not from habit: a page people use on a phone at work is mobile-first even inside a desktop product. Design the primary device first, then the other.

Decide what must be visible in the first viewport on the primary device. The primary action always is, and it is the most prominent action on the page. Most layout mistakes are priority mistakes: a hero that pushes the page's actual job below the fold, or a secondary tool given the widest column.

### 4. Write the file

Follow the template. Every section gets a desktop and a mobile layout, each with its own diagram, because the designer draws from the diagrams and a phone layout described only in words gets guessed.

Decide rather than defer. When a layout detail is unspecified (exact widths, how a control behaves in a given state, what a picker looks like on a phone), pick the conventional answer, draw it, and record it as an assumption. A designer can build from a flagged decision and change it later; they can't build from an open question. Keep Open Questions for choices that would change the page's structure, and say what you drew in the meantime. "Stacks vertically" is enough for simple content, but dense components (tables, week grids, calendars, multi-column comparisons) need an explicit mobile form, such as a day view, a card list, or a horizontally scrolling region with a pinned first column, because a squeezed desktop grid is unusable on a phone.

For every repeating or text-heavy element, set density limits: how many items show before pagination or "show more", maximum words for headings and summaries, what truncates, and what happens when there is nothing to show. Use real labels from SKELETON.md, not lorem ipsum, so the wireframe tests whether the content actually fits.

Give every SKELETON state and overlay a layout. Loading placeholders keep the final layout's proportions so content doesn't jump when it arrives. For overlays, say what kind (modal, bottom sheet, side panel), how much of the viewport it takes on each device, and how it is dismissed.

Keep the structure accessible by construction: one H1 per page, landmarks (header, nav, main, footer) in the shell, and a DOM order that matches the reading order on the primary device. If the visual order changes at another breakpoint, say so.

Draw diagrams in ` ```text ` fences, at most 80 characters wide for desktop and 40 for mobile, with element names that match the text and box widths that roughly match the stated spans.

### 5. Validate, then report

Check before handing back:

- Every section in SKELETON.md's section stack for this route appears, with the same name and order. Any added section is flagged under Assumptions.
- The primary action is in the first viewport on the primary device and is the most prominent action.
- Every section has a desktop and a mobile layout, and every dense component has an explicit mobile form.
- Every SKELETON state and overlay has a layout.
- Every link or action points to a route in SKELETON.md, an in-page state, or a query parameter SKELETON.md defines.
- Every field, control, badge, and message traces to SKELETON.md or is flagged under Assumptions.
- Every repeating or text-heavy element has density limits.
- Diagrams show the same elements and roughly the same proportions as the text.
- No colors, fonts, type sizes, radius, shadows, motion styles, pixel values outside the shell's breakpoints, or CSS and framework class names.

Then tell the user which files you wrote, what fills the first viewport on the primary device, and the open questions that most affect the layout.

## Page template

Placeholders appear in `<angle brackets>`. Replace every one of them.

````markdown
# BONES: `<route>` (<Page Name>)

> **Source**: SKELETON.md v<version>, `<route>`
> **Primary Action**: <from the page spec> → `<route, state, or param>`
> **Primary Device**: <mobile | desktop>, because <reason from SKELETON.md>
> **Shell**: BONES-shell.md, <public | app> variant
> **Version**: 1.0.0 · **Updated**: <YYYY-MM-DD>

---

## 1. STRUCTURE

```text
MAIN
├── <SECTION_NAME>                     H1
│   ├── <ELEMENT>
│   └── <ELEMENT>
└── <SECTION_NAME>                     H2
```

**First viewport (<primary device>)**: <what is visible without scrolling>

---

## 2. SECTIONS

### <Section Name> (SKELETON section <n>)
- **Layout**: desktop <model and column spans on the shell grid>; mobile <model>
- **Content**: <elements in reading order, with density limits>
- **Behavior**: <sticky, collapse, scroll, pagination; only what affects layout>

```text
DESKTOP
+----------------------------------+----------------+
| <ELEMENT>                        | <ELEMENT>      |
+----------------------------------+----------------+
```

```text
MOBILE
+--------------------+
| <ELEMENT>          |
+--------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| <State> | <condition from SKELETON.md> | <what hides, collapses, or replaces what> |
| <Overlay> | <trigger and route or param> | <type, share of viewport per device, content order, dismiss> |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: <inference> (<basis>)
- **Open**: <question whose answer would change the layout>

---

## CHANGE LOG

- 1.0.0 (<YYYY-MM-DD>): Initial wireframe.
````

## Shell template

````markdown
# BONES: Shell

> **Source**: SKELETON.md v<version>, Navigation
> **Breakpoints**: <from SKIN.md, or assumed: mobile under 768, tablet 768 to 1279, desktop 1280 and up>
> **Grid**: <columns per breakpoint and content max width, from SKIN.md or assumed>
> **Version**: 1.0.0 · **Updated**: <YYYY-MM-DD>

## <Public | App> variant
- **Header**: <primary and utility navigation items in order, from SKELETON.md; behavior on scroll>
- **Mobile navigation**: <menu, tab bar, or bottom bar, and which items go where>
- **Footer**: <groups in order>

```text
DESKTOP
+---------------------------------------------------------------+
| <LOGO>   <NAV_ITEM> <NAV_ITEM> <NAV_ITEM>        <UTILITY>    |
+---------------------------------------------------------------+
```

```text
MOBILE
+--------------------------+
| <LOGO>          <MENU>   |
+--------------------------+
```
````

## Example (excerpt)

One section and the states of an invoice list for a small invoicing app, showing the expected detail. Don't carry its layout into unrelated pages.

````markdown
# BONES: `/app/invoices` (Invoice List)

> **Source**: SKELETON.md v1.0.0, `/app/invoices`
> **Primary Action**: New invoice → `/app/invoices/new`
> **Primary Device**: desktop, because freelancers bill from their desks; the list must still work on a phone for checking what's overdue
> **Shell**: BONES-shell.md, app variant

### Needs Action (SKELETON section 2)
- **Layout**: desktop full width, one row per invoice with client (4 cols), amount (2), due date (2), status (2), row action (2); mobile one card per invoice, client and amount on the first line, status and due date on the second, row action as a full-width link
- **Content**: overdue first, then drafts; at most 5 rows, then "Show all" filters All Invoices to `?status=overdue,draft`; client names truncate at one line
- **Behavior**: none

```text
DESKTOP
+--------------------+----------+----------+----------+----------+
| CLIENT_NAME        | AMOUNT   | DUE_DATE | STATUS   | [REMIND] |
| CLIENT_NAME        | AMOUNT   | DUE_DATE | STATUS   | [SEND]   |
+--------------------+----------+----------+----------+----------+
| [SHOW_ALL]                                                     |
+----------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------+
| CLIENT_NAME             AMOUNT |
| STATUS · DUE_DATE              |
| [REMIND]                       |
+--------------------------------+
```

| Name | Trigger | Layout change |
|---|---|---|
| Empty | No invoices yet | Summary and both lists hide; a single centered prompt with New invoice fills the first viewport |
| Nothing to act on | No overdue or draft invoices | Needs Action collapses to one line ("Nothing needs action"); All Invoices moves up |
````
