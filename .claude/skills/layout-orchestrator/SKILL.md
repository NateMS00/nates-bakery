---
name: layout-orchestrator
description: Builds a working page, screen, or shared app shell in the project's codebase by compiling three spec files, SKELETON.md (routes, access, navigation, flows, section stacks, states), BONES-[page].md plus BONES-shell.md (layout, spans, responsive forms, density), and SKIN.md (YAML design tokens, component specs and states, responsive rules). Use whenever the user wants to build, code, implement, render, or scaffold a route or view from these specs, even if they only say "build /pricing", "code up the listing page", or "turn the bones into components". Not for writing or revising the spec files themselves (use skeleton-generator or bones-generator) or for UI work in projects without these specs.
---

# Layout Orchestrator

Turn one route's specs into working code in the project: the page, the shared shell it sits in, its states and overlays, and its links and guards. The specs have already made the product decisions. This skill's job is to implement them faithfully, fill the gaps an implementation needs, and show the user exactly where it did either.

## How the layers divide

Each spec owns one layer, and when two seem to disagree, the owner of that layer wins:

| Question | Owner | What to take from it |
|---|---|---|
| What exists, who reaches it, what it's called, where it leads | SKELETON.md | Route paths, `:params`, `?query` state, area access defaults and unauthorized redirects, navigation items, flow steps and alternate paths, section names and order, primary action, states, overlays |
| Where things sit and how much space they get | BONES-[page].md, BONES-shell.md | Column spans on the shell grid, first viewport, primary device, desktop and mobile forms, sticky and scroll behavior, density limits, truncation, overlay type and size, heading levels, DOM order |
| How things look | SKIN.md | Color, typography, radius, and spacing tokens; component specs and their state variants (hover, active, focus, disabled, error); elevation; breakpoints, max content width, gutters, and column counts; touch targets; Do / Don't rules |
| How it's built | The codebase | Framework, router, styling system, component library, data layer, file conventions |

The visual spec is SKIN.md, written by skin-generator. Older projects may have it as DESIGN.md; treat that as the same file. Where SKIN.md and BONES both touch layout, split them by kind: SKIN.md owns the numbers (breakpoints, max content width, gutters, column counts, spacing values), and BONES owns the arrangement (which column spans what, what stacks, the mobile navigation form). SKIN.md's Responsive Behavior section also describes how navigation and grids collapse; when that disagrees with BONES for this page, follow BONES and report the difference. If BONES-shell.md assumed breakpoints or a grid because no SKIN.md existed yet, use SKIN.md's values and say so.

Implement the Assumptions sections of SKELETON and BONES as written. They are decisions the spec authors made and flagged, not suggestions; the user reviews them there, not in your code.

## Workflow

### 1. Read the codebase

Before touching the specs, learn how this project builds UI: framework and router, styling approach (Tailwind config, CSS modules, CSS variables, a component library), existing layout and shell components, how tokens are defined, how data is fetched, how auth is checked. Reuse what exists. A page that invents its own button next to the project's `Button` component is a bug, even if it matches SKIN.md. If an existing component's styling has drifted from SKIN.md, use it anyway and report the drift; restyling shared components changes pages you weren't asked to touch.

In an empty project, use the framework the user or repo suggests; if nothing suggests one, use Next.js with the App Router, TypeScript, and Tailwind, and say so in the report.

### 2. Read the specs for the route

- **SKELETON.md**: the route's Route Map entry and its area's default access, its page spec, the Navigation section, and every flow that passes through this route (they define what each CTA does and where failures go).
- **BONES-[page].md**: the whole file, including the diagrams, the states and overlays table, and Assumptions. Find it by the route naming rule: drop params, join segments with hyphens, add `-detail` when the route ends in a param (`/listings/:listingId` → `BONES-listings-detail.md`).
- **BONES-shell.md**: the variant this page uses, its breakpoints and grid.
- **SKIN.md**: the whole file. The YAML front matter holds the exact values; the prose explains where each applies. Read these parts closely, because each one changes the code:
  - `colors`, `typography`, `rounded`, `spacing`: the only values you may use.
  - `components`: the styled elements, with values given as `{colors.primary}`-style references to other tokens. A key ending in `-hover`, `-active`, `-focus`, `-disabled`, or `-error` is that component's state, not a separate component.
  - Typography's Font Import: the font URLs to load. A licensed font marked with a placeholder comment gets its listed substitute until the user supplies the file.
  - Layout, Elevation, and Responsive Behavior: grid numbers, whether depth comes from shadows or borders, touch targets.
  - Known Gaps, Do / Don't, and Agent Checklist: rules to follow while building and to check against before reporting.

If a file is missing, don't stop and don't improvise the missing layer silently:

- No SKELETON.md, or no entry for this route: ask the user for the route's purpose and sections in one question. Without it there is nothing to build against.
- No BONES file for the route: offer to generate it first with bones-generator. If the user wants code now, lay out the SKELETON section stack in its order as a single column on mobile with conventional desktop spans, and list every layout decision in the report.
- No SKIN.md: build with neutral tokens defined in one theme file (or the project's existing theme), using SKIN.md's token names (`primary`, `ink`, `canvas`, `hairline`), so a later SKIN.md drops in by replacing values, and say so in the report.

### 3. Build in this order

1. **Tokens**: generate the theme from SKIN.md's YAML once, where the project keeps tokens: CSS custom properties, the Tailwind theme, or a theme object. Keep SKIN.md's token names (`--color-ink`, `bg-surface-card`, `rounded-lg`), so code, spec, and reviewer all use one vocabulary. Resolve `{token.refs}` in components to those names, not to copied values. Load the fonts from the Font Import URLs. Never write a raw color, size, radius, or shadow into a component when a token exists. If SKIN.md has no token for something you need, apply its Agent Checklist rule (check Known Gaps, then use the nearest analogous token) and report it; don't extend the palette.
2. **Components**: build or map each SKIN.md component the page uses (`button-primary`, `card`, `input`, `badge`), with its state variants as states of one component. SKIN.md defines `-focus` and `-disabled` variants, plus `-error` for form fields, alongside `-hover` and `-active`; implement every variant a component has. If one is missing (an older file, a component added later), derive it from existing tokens (a focus ring in `{colors.focus-ring}` or `{colors.primary}`, disabled text in `{colors.disabled}` or `{colors.muted}`), keep it visible and accessible, and list it in the report. When a page needs an element SKIN.md doesn't define (a week grid, a data table, a price comparison), compose it from tokens and the closest components, and report it as a missing component so the SKIN.md owner can add it.
3. **Shell**: build BONES-shell.md's variant as a shared layout if the project doesn't have it yet: header with primary and utility navigation in SKELETON's order, the mobile navigation form BONES specifies, footer groups, and the landmarks (`header`, `nav`, `main`, `footer`). Pages render inside it; they never redraw it.
4. **Sections**: one component per BONES section, named after the SKELETON section, in SKELETON order. Translate spans to the project's grid literally: "8 cols / 4 cols" on a 12-column grid is an 8/4 split, not whatever looks balanced. Build the primary device's layout first and make sure the primary action is visible in the first viewport there and is the most prominent action on the page: it gets `button-primary`, and every other action gets a secondary variant, which is also what SKIN.md's rules on reserving `{colors.primary}` usually require. Use BONES's heading levels for the elements (`h1`, `h2`) and pick SKIN.md's typography role by context (`display-lg` for a hero heading, `heading` for a section title); never choose a heading level to get a font size. Give the other device the form BONES drew for it; a dense component with an explicit mobile form (day view, card list, pinned-column scroll) gets that form, not a squeezed desktop grid.
5. **Density**: implement BONES's limits as behavior, not as fixture sizes: "at most 5 rows, then Show all" means a slice and a link to the stated query param; "truncates at one line" means a line clamp that holds with long real values.
6. **States and overlays**: implement every row of BONES's states and overlays table, triggered the way SKELETON says (data condition, route, or query param). Loading placeholders keep the final layout's proportions. Overlays use the type, viewport share, and dismiss behavior BONES gives, with focus trapped inside and returned on close. Not-found for unknown `:param` values and the area's unauthorized redirect come from SKELETON and are part of the page, not follow-up work.
7. **Behavior**: links and actions point to SKELETON routes exactly, carrying params and query state as SKELETON writes them (`?status=overdue`, `/login?next=` plus the requested path). Page state that SKELETON puts in the URL lives in the URL, not in component state, so it survives refresh and sharing. Flow alternate paths (payment declined, email already registered) become the error handling of the actions that can trigger them.

### 4. Fill gaps honestly

The specs never cover everything an implementation needs. Decide the gap, build it, and list it in the report, rather than leaving a TODO or silently inventing. Common gaps:

- **Copy**: use SKELETON and BONES labels verbatim for sections, actions, navigation, and states. Where no text is given (body copy, helper text, error wording), write short copy that serves the section's stated purpose and list it as draft copy. No lorem ipsum.
- **Data**: use the project's data layer if it exists. Otherwise define a typed interface for what the page shows and feed it realistic fixture data from one module, including a long value and an empty case, so the states and truncation rules get exercised. Don't build a backend the user didn't ask for.
- **Auth**: use the project's guard mechanism. If there is none, add the check at the route boundary with the redirect SKELETON specifies and a stub session source, marked in the report.
- **Media**: use the aspect ratio BONES implies and a neutral placeholder; don't add imagery BONES didn't draw.

Don't add sections, fields, controls, or links that neither spec contains. When the specs contradict each other in a way precedence can't settle (BONES links to a route SKELETON doesn't define, a SKIN.md component can't hold the content BONES puts in it, or a SKIN.md Do / Don't rule forbids what BONES drew), build the closest faithful version and report the conflict. Leave the spec files unchanged unless the user asks; their owners fix them.

### 5. Verify

Run the project's own checks (typecheck, lint, build, existing tests) and fix what the new code breaks.

Then look at the result. Render the page at the primary device width and the other device width, using the shell's breakpoints (Playwright or the project's preview tooling; in this environment Chromium is available through Playwright). Compare each screenshot against the BONES diagrams:

- Sections appear in SKELETON order with BONES's spans and proportions.
- The primary action is in the first viewport on the primary device.
- The mobile width has no horizontal page scroll, and dense components use their mobile form.
- Each state and overlay renders (drive them through fixtures, props, or the query params that trigger them).
- One `h1`, landmarks present, tab order follows reading order, focus is visible on every interactive element, and touch targets meet SKIN.md's minimum on mobile.
- The code passes SKIN.md's Agent Checklist and Do / Don't table: no raw values, and every styled element maps to a SKIN.md component or is reported as missing.

Fix mismatches before reporting. If rendering isn't possible, say so instead of claiming the page matches.

### 6. Report

Tell the user, briefly:

- Files created or changed, and which existing components and tokens you reused.
- What fills the first viewport on each device, and whether the checks and renders passed.
- Every gap you filled: draft copy, fixture data, stubbed auth, missing tokens or components, derived focus and disabled states, substituted fonts, layout decisions made without BONES.
- Every conflict between specs and how you resolved it, so the spec owners can fix the source.

## Example (excerpt)

The Needs Action section of the Tally invoice list, in a Next.js project whose Tailwind theme is generated from SKIN.md: colors `ink`, `muted`, `surface-card`, `hairline`, `primary`; typography roles as `text-heading` and `text-body-sm`; `rounded-lg`. BONES says: desktop one row per invoice with client (4 cols), amount (2), due date (2), status (2), row action (2); mobile one card per invoice with client and amount on the first line, due date and status on the second, and the row action full width; at most 5 rows, then "Show all" filters to `?status=overdue,draft`; client names truncate at one line. It shows the level of fidelity expected, not a pattern to copy into other pages.

```tsx
// components/invoices/NeedsAction.tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import type { Invoice } from "@/lib/invoices";

const LIMIT = 5; // BONES: at most 5 rows, then Show all

export function NeedsAction({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    // BONES state "Nothing to act on": collapses to one line
    return <p className="text-body-sm text-muted">Nothing needs action</p>;
  }

  return (
    <section aria-labelledby="needs-action-heading">
      <h2 id="needs-action-heading" className="text-heading text-ink">Needs Action</h2>
      <ul className="mt-3 divide-y divide-hairline rounded-lg border border-hairline bg-surface-card">
        {invoices.slice(0, LIMIT).map((invoice) => (
          <li key={invoice.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 p-4 md:grid-cols-12 md:items-center">
            <Link href={`/app/invoices/${invoice.id}`} className="truncate text-ink md:col-span-4">
              {invoice.clientName}
            </Link>
            <span className="text-right text-ink md:col-span-2 md:text-left">{invoice.amountFormatted}</span>
            {/* mobile: one line; desktop: two grid columns */}
            <div className="col-span-2 flex items-center gap-2 text-body-sm md:contents">
              <span className="text-muted md:col-span-2">{invoice.dueDateFormatted}</span>
              <StatusBadge status={invoice.status} className="md:col-span-2" />
            </div>
            <Button variant="secondary" size="sm" className="col-span-2 w-full md:w-auto">
              {invoice.status === "overdue" ? "Remind" : "Send"}
            </Button>
          </li>
        ))}
      </ul>
      {invoices.length > LIMIT && (
        <Link href="/app/invoices?status=overdue,draft" className="mt-3 inline-block text-body-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">
          Show all
        </Link>
      )}
    </section>
  );
}
```

Report lines this section would produce: "Missing component: SKIN.md has no list-row component; rows compose `card` surface tokens with `hairline` dividers. Draft copy: 'Nothing needs action' taken from BONES; Remind and Send labels from BONES diagram. Fixture data: 7 invoices in `lib/invoices.fixtures.ts`, including a 60-character client name to exercise truncation."
