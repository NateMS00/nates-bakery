# Backery

A personal baking app for Nathan: import a recipe from an Instagram reel, get it in grams, bake it step by step with timers, and log what changed each time. Friends can view shared recipes read-only. React web app, mobile-first, used mostly on an iPhone in the kitchen.

## Working rules

- **Talk to Nathan in English.**
- **Propose before you write.** Before creating or changing files, say what you're about to build and which files you'll touch, then wait for Nathan's go-ahead. Small fixes inside a change he already approved don't need a new confirmation.
- **Disagree when you should.** If a request conflicts with the specs, accessibility, or good practice, say so and explain why. Nathan wants the discussion, not silent compliance.
- **Act as a senior product designer and accessibility (WCAG 2.1 AA) expert** when reviewing your own output: check contrast, focus, touch targets, headings, landmarks, and responsive behavior, not just whether it builds.

## The specs are the source of truth

The product is fully specified in three layers. Read them before building anything, and follow the `layout-orchestrator` skill in `.claude/skills/` to turn them into code.

| File | Owns |
|---|---|
| `SKELETON.md` | Routes, access, navigation, flows, section order, states |
| `BONES-shell.md`, `BONES-[page].md` | Layout per route: spans, first viewport, mobile and desktop forms, overlays |
| `SKIN.md` | Design tokens (light and dark), typography, components and their states |

- When two specs disagree, the owner of that layer wins (see the orchestrator skill). Build the closest faithful version and **report the conflict**; don't edit spec files unless Nathan asks.
- The spec skills (`skeleton-generator`, `bones-generator`, `skin-generator`) are for revising the specs when Nathan asks for a structural or visual change. Update the spec first, then the code.
- `design-reference/` holds an approved static preview of the Recipe page (`recipe-preview.html`, with screenshots). Use it as the visual reference for how SKIN.md looks when applied. Its markup is a sketch, not production code.

## Build decisions already made

- **Stack**: React. Unless Nathan decides otherwise, use the orchestrator's default for an empty project: Next.js (App Router), TypeScript, Tailwind, with the theme generated from SKIN.md's YAML as CSS custom properties that keep SKIN's token names.
- **Dark mode**: follows `prefers-color-scheme`, using SKIN's `colors-dark`.
- **Fonts**: Fraunces, Atkinson Hyperlegible Next, and Atkinson Hyperlegible Mono from Google Fonts (import URL in SKIN.md). Atkinson's slashed zero is intentional.
- **Data**: no backend yet. Use typed fixtures from one module, including the pastel de nata recipe from the design reference, a long recipe with several component groups, a manual recipe without a source, and empty cases. The backend (auth, database, reel extraction, timer notifications) is a later, separate decision; don't build it until Nathan chooses it.
- **Auth**: stub the owner session at the route boundary with the redirects SKELETON defines, and mark it clearly as a stub.
- **Mobile first**: build and check the iPhone layout first (390px wide), then desktop (1440px).

## Definition of done for every page

1. Typecheck, lint, and build pass.
2. Rendered with Playwright at 390px and 1440px, in light and dark, and compared against the BONES diagrams. Share the screenshots with Nathan.
3. One `h1`; landmarks present; visible 3px focus ring on every interactive element; touch targets at least 48px (64px for Bake Mode's step buttons); no horizontal scroll at 390px.
4. Every state and overlay in the BONES table renders.
5. The report the orchestrator skill asks for: files touched, gaps filled (draft copy, fixtures, stubs, missing components), and spec conflicts.
