# Build prompts, in order

Paste one prompt at a time into Claude Code. Each builds on the last. After each one, review the screenshots (you can bring them back to the Claude chat for a design critique) before moving on.

---

## 0. Kickoff (no code yet)

```text
Read CLAUDE.md, SKELETON.md, SKIN.md, BONES-shell.md and BONES-recipes-detail.md, and the layout-orchestrator skill in .claude/skills. Then propose: the stack and versions you'll use, the folder structure, how you'll generate the theme from SKIN.md's YAML (light and dark), and the fixture data model (recipe, ingredient groups, ingredient-to-step links, markers, bake log, rating, favorite, category). List anything in the specs that is unclear or conflicting. Don't create any files yet.
```

## 1. Theme, shell, and the Recipe page

```text
Use the layout-orchestrator skill to build /recipes/:recipeId. Start with the theme generated from SKIN.md (light and dark), the fonts, and the shared components the page needs, then the App shell from BONES-shell.md, then the page itself with every state and overlay in BONES-recipes-detail.md (Loading, Has estimates, Never baked, Just marked, Invalid scale, Share dialog, Rating prompt). Use fixtures, including the pastel de nata recipe from design-reference/recipe-preview.html. When done, render it at 390px and 1440px in light and dark, compare against the design reference screenshots, and report as the skill asks.
```

## 2. Library

```text
Use the layout-orchestrator skill to build /recipes from BONES-recipes.md: search, filters (category, status, favorites, rating) kept in the URL, the mobile Filters sheet with "Show n recipes", drafts, the recipe list with Show more, and the Empty, Only drafts, and No results states. Add enough fixtures to exercise every filter. Render at 390px and 1440px in light and dark and report.
```

## 3. Review Import and the recipe editor

```text
Use the layout-orchestrator skill to build /import/:draftId from BONES-import-detail.md, including the shared Recipe Editor (details, grouped ingredients with amount inputs and markers, grouped steps with detected times and "Uses:" ingredient links), Needs Your Check, the collapsible transcript, the Save bar, and every overlay (Discard, Row menu, Ingredients used picker, Group picker). Then reuse the editor for /recipes/new and /recipes/:recipeId/edit. Autosave to fixtures in memory. Render and report.
```

## 4. Import

```text
Use the layout-orchestrator skill to build /import from BONES-import.md, with a fake import that walks through the processing stages and lands on /import/:draftId. Include the Invalid link, Import failed, and Already imported states, and ?url= auto-start. Render and report.
```

## 5. Bake Mode

```text
Use the layout-orchestrator skill to build /recipes/:recipeId/bake from BONES-recipes-bake.md with the Focus shell variant: step navigation in ?step=, "For this step" ingredients, timers that run across steps and survive a refresh, the Timer finished banner with sound, the All ingredients checklist, the Exit confirmation, and the Screen awake behavior. Show the Timer alerts card and sheet, but keep notifications stubbed until we have a backend. Render and report.
```

## 6. Bake Log

```text
Use the layout-orchestrator skill to build /recipes/:recipeId/log from BONES-recipes-log.md: entries, the entry form (?new=1, full-screen on mobile), Discard changes, Delete confirmation, and the Rating prompt after saving. Connect Bake Mode's Finish to it. Render and report.
```

## 7. Shared recipe

```text
Use the layout-orchestrator skill to build /r/:shareToken and /r/expired from BONES-r-detail.md and BONES-r-expired.md, with the Share shell variant. Connect the Share dialog on the Recipe page so a created link opens this page. Render and report.
```

## 8. Auth and system pages

```text
There are no BONES files for /login, /forgot-password, /reset-password, /privacy, not-found, and error. Build them from SKELETON.md alone using SKIN.md, keep them simple, and list every layout decision you made so I can review them. Render and report.
```

## 9. Accessibility and responsive audit

```text
Audit every page against WCAG 2.1 AA and the Agent Checklist in SKIN.md: contrast in light and dark, focus order and visibility, headings and landmarks, touch targets, screen reader names and announcements, reduced motion, and 390px / 768px / 1440px layouts. Report findings ranked by severity, and propose fixes before changing anything.
```

---

## Later: backend (decide first)

Not part of the UI build. Before starting, decide the backend with Nathan (the suggestion so far is Supabase for login, database, and storage). Then: owner login, persistence, the reel import service (caption, on-screen text, audio → recipe in grams), share tokens, and server-scheduled timer notifications for the Home Screen web app.
