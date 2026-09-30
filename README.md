# Backery: start here

This folder is the starting point of the Backery repo. It holds the complete product spec and the skills Claude Code uses to build from it.

## What's inside

| Path | What it is |
|---|---|
| `CLAUDE.md` | Rules and decisions Claude Code reads at the start of every session |
| `PROMPTS.md` | The build prompts, in order |
| `SKELETON.md` | Routes, flows, navigation, and page contents |
| `BONES-*.md` | Wireframes for the shell and each page |
| `SKIN.md` | Design system: tokens, type, components, dark mode |
| `.claude/skills/` | The four skills: skeleton-generator, bones-generator, skin-generator, layout-orchestrator |
| `design-reference/` | The approved Recipe page preview and its screenshots |

## Setup

1. Unzip this folder where you keep projects and rename it if you like.
2. In a terminal inside the folder:
   ```bash
   git init
   git add .
   git commit -m "Specs and skills for Backery"
   ```
3. Optional: push it to a new private GitHub repo, so you can also use Claude Code on the web.
4. Open the folder in Claude Code and check that the skills are loaded (they live in `.claude/skills/`).
5. Paste prompt **0** from `PROMPTS.md`. Review its plan, then continue with prompt **1**.

The `.claude` folder starts with a dot, so it may be hidden in Finder. Press Cmd + Shift + . to show it.
