---
name: skin-generator
description: >
  Create a SKIN.md file (formerly DESIGN.md) — a markdown-based design system that describes a brand's visual language in a format AI coding agents can read and act on. Use this skill whenever the user wants to document a design system, create design tokens for their project, write a DESIGN.md or brand design guide, or describe visual language for an AI agent to use. Works from scratch (by interviewing the user) or from partial input (existing colors, fonts, components). Also use when the user wants to capture their brand's aesthetic so an AI coding tool like Claude Code, Cursor, or Windsurf can generate consistent UI automatically. Not for sitemaps and routes (SKELETON.md), page layouts and wireframes (BONES files), or component code.
---

# SKIN Generator

A SKIN.md file is a markdown document that describes a brand's visual language — colors, typography, spacing, components, and rationale — in a format AI coding agents can read before they write UI. Think of it as the briefing an experienced designer gives a developer who's never seen the brand before: not just "use #0070f3" but "use #0070f3 here, because this is the primary action color and it should feel decisive, not playful."

The format was introduced by Google Stitch and extended by the getdesign.md community. It has two halves: a YAML front matter block with structured tokens, and a prose body with nine canonical sections. The tokens give the agent exact values; the prose gives it intent and context.

Read `references/format-spec.md` for the full format reference — section templates, YAML examples, and token naming conventions. You'll need it while writing the output.

---

## Step 1 — Gather what you need

Before writing, figure out what the user has and what you need to ask. Two modes:

**Mode A — From scratch**: The user has a brand in mind but no existing tokens. You need to interview them. Keep it conversational — one or two questions at a time, not a form. The minimum you need to produce a complete file:
- Brand name and a sentence or two on its personality/feel
- Primary accent color (everything else can be derived from this + the feel)
- Font preferences (or if they have none, you'll pick something appropriate)
- Whether they lean toward shadows vs borders for elevation
- Any reference brands they like ("think Linear but warmer")

You don't need answers to every field before starting. Make reasonable decisions based on the brand's personality and fill in the rest yourself.

**Mode B — Partial input**: The user gives you some existing tokens, a color palette, a brand guide PDF, a screenshot, a Figma link, or reference sites. Extract everything you can from what's provided, then derive the rest. If something is truly ambiguous, pick a reasonable value and move on.

**Mode C — Inspiration-based**: The user says "make it look like Linear" or "give it a Stripe feel." This is a shortcut to Mode B — treat the named brand as the design reference. You know these systems well enough to derive the correct token values and prose rationale from them. Make the result feel like that brand without copying it literally.

---

## Step 2 — Write SKIN.md

Produce a single complete `SKIN.md` file. Always follow the structure in `references/format-spec.md` exactly. Every section in order, no skipping.

**A few principles that make the difference between a useful and a useless file:**

**Push to completeness.** The goal is a finished, usable design system — not a skeleton with notes about what's missing. If the user hasn't specified animation timings, pick sensible defaults and document them. If they haven't mentioned dark mode, either build it out or explicitly leave it for a future version. Don't punt large chunks to Known Gaps when a reasonable decision could be made instead. Known Gaps should only hold things that genuinely require input from the user: proprietary font files they need to supply, undocumented sub-brands, or decisions that could invalidate existing work if guessed wrong.

**Rationale is the whole point.** Tokens without reasons are just a JSON export. Every color entry, every type scale decision, every component definition should carry a "because" — even a short one. "Used for primary CTAs because shipping should feel decisive" is more useful to an agent than "#0070f3".

**Token names carry intent, not hue.** `primary`, `ink`, `canvas`, `hairline` — not `blue`, `gray-100`, `white`. The agent learns what to do with a color from its name. If the name just says `blue`, the agent learns nothing it didn't already know.

**Prose and YAML must stay in sync.** Every color in `colors:` gets a prose entry under `## Colors`. Every component in `components:` gets a prose entry under `## Components`. No orphans in either direction.

**Components use `{token.refs}`, never inline values.** `backgroundColor: "{colors.primary}"` not `backgroundColor: "#F76B1C"`. This is what makes the system coherent — if the primary changes, the button updates everywhere.

**Every interactive component ships with its states.** Buttons, inputs, links, selects, tabs, nav items, and anything else a user can press or focus get `-hover`, `-active`, `-focus`, and `-disabled` variants, and form fields also get `-error`. Add the `focus-ring`, `disabled`, and `surface-disabled` color tokens to support them. The coding agent builds exactly what this file defines, so a missing focus state becomes an inaccessible control and a missing error state becomes a form that fails silently. Follow the state table in `references/format-spec.md`, Section 5.

**Handle fonts explicitly.** For every typeface used in the system:
1. Search Google Fonts for the font name. If it's available there, include the `@import` URL directly in the Typography section under a `### Font Import` heading.
2. If the font appears to be proprietary or licensed (e.g., Söhne, GT America, Circular), add a note like: `<!-- Font is licensed. Provide a CDN URL or local path (e.g. /fonts/SöhneBook.woff2) to complete this entry. -->`.
3. If no font preference was given and you've chosen a free alternative, include the Google Fonts import for it.

The file should never leave a font reference that a coding agent can't resolve. Either include the import URL or make the gap explicit with a clear placeholder.

**Close with a Do / Don't table and an Agent Checklist.**

After `## Known Gaps`, add two final sections:

`## Do / Don't` — a concise table of the system's most important rules, formatted as paired do/don't statements. Cover at least: color usage, typography choices, elevation approach, spacing discipline, and component variant selection. This is the fastest way for an agent to calibrate when it hits a decision not covered by the rest of the file.

`## Agent Checklist` — a numbered quick-reference list (8–12 items) for AI coding agents to run through before writing any UI. Things like "1. Load SKIN.md before writing any component", "2. Use {colors.primary} only for primary CTAs and active states — never decoratively", etc. Make it specific to this system, not generic.

---

## Step 3 — Deliver

Save the output as `SKIN.md` at the project root, next to SKELETON.md and the BONES files. If the user hasn't specified a location, use the default output folder.

After saving, give the user a brief summary:
- What you derived from their input vs. what you assumed
- The key decisions: accent color strategy, elevation approach, type philosophy
- What's in Known Gaps and why

Offer to refine any section, swap reference brands, or add components they haven't mentioned.

---

## Tone for the prose sections

The prose inside SKIN.md should read like a senior designer talking to a developer — direct, specific, and confident. Avoid vague language ("feels modern", "contemporary palette"). Be precise: "tight -1.8px tracking on display sizes so headlines read like compressed, purposeful code rather than editorial typography." The agent needs to understand the decision, not just the value.

---

## Reference

`references/format-spec.md` — Full section templates with YAML examples, token naming conventions, the component 1:1 rule, and the "what belongs where" mapping. Load it before writing the output file.
