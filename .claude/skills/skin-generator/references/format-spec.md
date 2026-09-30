# SKIN.md Format Specification

> Based on the Google Stitch / getdesign.md alpha spec. Full reference: https://getdesign.md/what-is-design-md

The file is saved as `SKIN.md`. Earlier versions of this pipeline called it DESIGN.md; the format is the same.

A SKIN.md file has two halves:
1. A **YAML front matter block** — structured tokens
2. A **prose body** — 9 canonical sections that make those tokens into language an agent can act on

---

## Full File Structure

```
---                          ← YAML front matter (sections 1–5)
version: alpha
name: BrandName
description: One dense paragraph anchoring the brand atmosphere.
colors: ...
typography: ...
rounded: ...
spacing: ...
components: ...
---

## Overview               ← Section 6
## Colors                 ← Section 7a
## Typography             ← Section 7b
## Layout                 ← Section 7c
## Elevation              ← Section 7d
## Components             ← Section 8
## Responsive Behavior    ← Section 9a
## Known Gaps             ← Section 9b
## Do / Don't             ← Section 10
## Agent Checklist        ← Section 11
```

---

## Section 1 — YAML Front Matter Header

```yaml
---
version: alpha
name: BrandName
description: >
  A dense one-paragraph summary of the brand's atmosphere — not a tagline.
  Sets up everything that follows. The agent reads this before the prose.
---
```

The `description` here is a **brand atmosphere statement**, not a tagline. It should communicate intent, mood, and the key constraints of the system. E.g.: "A bright, citrus-warmed product canvas where every primary moment runs in a single Tangerine accent. Display type stays large and confident at modest weights; cards float on a pale-cream surface separated by hairline borders rather than shadows."

---

## Section 2 — Color Tokens

Inside the YAML, under `colors:`. Name every color by its **role**, never by its hue (no `blue1`, `gray-100`). The name tells the agent what the color *does*.

```yaml
colors:
  primary: "#F76B1C"
  primary-active: "#D45A10"
  ink: "#1B1A17"
  body: "#3D3A33"
  muted: "#7A7568"
  canvas: "#FFFAF1"
  surface-card: "#FFFFFF"
  hairline: "#E8E1D2"
  on-primary: "#FFFFFF"
  focus-ring: "#1B1A17"
  disabled: "#B5AFA3"
  surface-disabled: "#F2ECE0"
  error: "#C2361B"
```

Common role groups to cover:
- **Brand/Accent**: primary, primary-active, secondary (if any)
- **Text**: ink (headings), body, muted, disabled
- **Surface**: canvas (page bg), surface-card, surface-raised
- **Borders**: hairline, border, border-strong
- **Semantic**: success, warning, error, info (and their `on-` counterparts)
- **On colors**: on-primary, on-success, etc.
- **States**: focus-ring (keyboard focus outline, at least 3:1 against every surface it sits on), disabled (text and icons of disabled controls), surface-disabled (their fill)

---

## Section 3 — Typography Tokens

Inside the YAML, under `typography:`. Use **role names**, not HTML element names (`display-lg` not `h1`).

```yaml
typography:
  display-lg:
    fontFamily: "'Söhne', Inter, sans-serif"
    fontSize: 56px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -1.8px
  display-md:
    fontFamily: "'Söhne', Inter, sans-serif"
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -1.2px
  heading:
    fontFamily: "'Söhne', Inter, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.3px
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.2px
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.6px
```

---

## Section 4 — Shape & Spacing Tokens

```yaml
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  section: 80px
```

---

## Section 5 — Component Tokens

Inside the YAML, under `components:`. Use `{token.refs}` — never inline hex or px values.

**Every interactive component defines its states.** Interactive means anything a user can press, type into, or move focus to: buttons, links styled as components, inputs, selects, checkboxes, radios, toggles, tabs, nav items, and clickable cards. Each one gets a base key plus these variant keys, named `<component>-<state>`:

| State | Applies to | Must show |
|---|---|---|
| `-hover` | every interactive component | pointer is over it |
| `-active` | every interactive component | it is being pressed, or it is the selected tab or current nav item |
| `-focus` | every interactive component | keyboard focus; a visible outline in `{colors.focus-ring}` that does not rely on color change alone |
| `-disabled` | every interactive component | it can't be used; `{colors.disabled}` text on `{colors.surface-disabled}`, distinct from the enabled look without relying on opacity alone |
| `-error` | inputs, selects, checkboxes, radios, textareas | its value failed validation; border and helper text in `{colors.error}` |

A variant lists only the properties that change from its base key; everything else inherits. Non-interactive components (card, badge, divider) have no state variants unless they are clickable.

```yaml
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-active}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    transform: "translateY(1px)"
  button-primary-focus:
    outline: "2px solid {colors.focus-ring}"
    outlineOffset: "2px"
  button-primary-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  button-secondary:
    backgroundColor: "transparent"
    borderColor: "{colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.ink}"
  button-secondary-active:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.ink}"
  button-secondary-focus:
    outline: "2px solid {colors.focus-ring}"
    outlineOffset: "2px"
  button-secondary-disabled:
    borderColor: "{colors.hairline}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
    borderColor: "{colors.hairline}"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.muted}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    typography: "{typography.body-md}"
  input-hover:
    borderColor: "{colors.muted}"
  input-active:
    borderColor: "{colors.ink}"
  input-focus:
    borderColor: "{colors.ink}"
    outline: "2px solid {colors.focus-ring}"
    outlineOffset: "1px"
  input-disabled:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.disabled}"
    cursor: "not-allowed"
  input-error:
    borderColor: "{colors.error}"
    helperTextColor: "{colors.error}"
  badge:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
```

---

## Section 6 — ## Overview prose

The atmospheric statement — **why** the brand looks like this. Not just a description but the philosophy.

```markdown
## Overview

[Brand name] reads like [brief atmospheric summary]. The base canvas is [color token] 
([hex]) [description of feel], with [primary color role] carrying [what it does]. 
[One sentence on shadows vs borders vs elevation]. [One sentence on type philosophy].

**Key Characteristics:**
- [Most distinctive trait, referencing a token]
- [Second distinctive trait]
- [Third distinctive trait]
- [Typography note]
- [Elevation/depth approach]
```

---

## Section 7a — ## Colors prose

Expand every token from `colors:` with rationale. Group under sub-headings.

```markdown
## Colors

### Brand & Accent
- **[Name]** (`{colors.primary}` — #XXXXXX): [What it does and why.]

### Surface
- **[Name]** (`{colors.canvas}` — #XXXXXX): [Context and feel.]
- **[Name]** (`{colors.surface-card}` — #XXXXXX): [When it appears vs canvas.]

### Text
- **[Name]** (`{colors.ink}` — #XXXXXX): [Used for...]
- **[Name]** (`{colors.body}` — #XXXXXX): [...]
- **[Name]** (`{colors.muted}` — #XXXXXX): [...]

### Borders & Hairlines
- **[Name]** (`{colors.hairline}` — #XXXXXX): [How borders replace shadows, or not.]

### Semantic
- **Success** (`{colors.success}` — #XXXXXX): [Context.]
- **Warning** (`{colors.warning}` — #XXXXXX): [Context.]
- **Error** (`{colors.error}` — #XXXXXX): [Context.]

### States
- **Focus ring** (`{colors.focus-ring}` — #XXXXXX): [Why this color, and its contrast against canvas and cards.]
- **Disabled** (`{colors.disabled}` — #XXXXXX) on **Disabled surface** (`{colors.surface-disabled}` — #XXXXXX): [How disabled controls read as unavailable.]
```

---

## Section 7b — ## Typography prose

```markdown
## Typography

**Primary face**: [Font name]. [One sentence on why this face.]

### Type Scale

| Token | Size | Weight | Line Height | Tracking | Use |
|---|---|---|---|---|---|
| `display-lg` | 56px | 500 | 1.05 | -1.8px | Hero headlines |
| `display-md` | 40px | 500 | 1.1 | -1.2px | Section titles |
| `heading` | 24px | 600 | 1.3 | -0.3px | Card/panel titles |
| `body-md` | 16px | 400 | 1.55 | 0 | Default body copy |
| `body-sm` | 14px | 400 | 1.5 | 0 | Secondary copy |
| `button` | 14px | 500 | 1 | 0 | All CTAs |
| `caption` | 12px | 400 | 1.4 | +0.2px | Timestamps, labels |
| `label` | 11px | 600 | 1 | +0.6px | Uppercase tags |

### Principles
[Why the scale is shaped this way — tracking decisions, weight philosophy, line-height choices.]

### Font Substitutes
[If the primary face is licensed, note web-safe fallbacks.]
```

---

## Section 7c — ## Layout prose

```markdown
## Layout

### Spacing Scale
[Summary of the scale philosophy — what {spacing.base} anchors, what {spacing.section} does.]

### Grid & Containers
- Max content width: [Xpx]
- Gutters: [{spacing.lg}] at desktop, [{spacing.base}] at mobile
- Column count: [12 / 8 / 4] at [desktop / tablet / mobile]

### Whitespace Philosophy
[One paragraph on how whitespace is used — generous vs tight, and why.]
```

---

## Section 7d — ## Elevation prose

```markdown
## Elevation

### Surface Tiers
| Tier | Token | Appearance |
|---|---|---|
| Page floor | `{colors.canvas}` | Base layer |
| Card | `{colors.surface-card}` | 1px `{colors.hairline}` border |
| Modal / Overlay | `{colors.surface-card}` | [shadow or border definition] |

### Shadow Definitions
[If the system uses shadows, define them here with exact values.
If it uses borders only, say so explicitly: "This system uses 1px hairline borders in place of drop shadows."]
```

---

## Section 8 — ## Components prose

One entry per component in the YAML `components:` block. Every property references a token — never inline values.

```markdown
## Components

**`button-primary`** — [Description of surface, typography, padding, radius.] States: hover [change], active [change], focus [outline], disabled [look].

**`button-secondary`** — [Description. How it differs from primary.] States: hover, active, focus, disabled [one clause each].

**`card`** — [Description. Background, border vs shadow, padding, radius.]

**`input`** — [Description.] States: hover, active, focus, disabled, error [one clause each, including where the error message sits].

**`badge`** — [Description. Sizing, when it appears.]
```

The YAML `components:` block and the prose `## Components` section must be 1:1 — every YAML key has a prose entry, every prose entry is a YAML key. State variants (`button-primary-hover`) are covered inside their base component's entry, on its States line, not as separate entries.

---

## Section 9 — ## Responsive Behavior + ## Known Gaps

```markdown
## Responsive Behavior

| Breakpoint | Width | Key Changes |
|---|---|---|
| Mobile | < 720px | [Navigation, grid, type scale changes] |
| Tablet | 720–1024px | [Mid adaptations] |
| Desktop | 1024–1440px | [Standard layout] |
| Wide | > 1440px | [Cap behavior] |

### Touch Targets
- Primary CTAs ≥ 44 × 44px (WCAG AA / AAA)
- Form inputs at [X]px height

### Collapsing Strategy
- [How navigation adapts]
- [How grid drops columns]
- [How spacing tightens]

## Known Gaps

- [Anything not covered — animations, dark mode, sub-brands, etc. Component states are never a gap; define them.]
```

---

---

## Section 10 — ## Do / Don't

A paired table of the system's most important rules. At minimum cover: color usage, typography, elevation, spacing, and component variant selection. Make every rule specific to this system — not generic "use consistent spacing" advice.

```markdown
## Do / Don't

| Do | Don't |
|---|---|
| Use `{colors.primary}` only on primary CTAs and active nav items | Use `{colors.primary}` as a decorative accent or background fill |
| Reference spacing tokens (`{spacing.base}`) for all layout gaps | Use arbitrary px values for margins or padding |
| Separate card surfaces from canvas with a 1px `{colors.hairline}` border | Add drop shadows to card surfaces — this system is border-only |
| Use `{typography.display-lg}` at weight 500 for hero headlines | Increase display weight above 500 to signal importance |
| Keep `{colors.muted}` for secondary labels and timestamps | Use `{colors.muted}` for body copy — it fails contrast at small sizes |
| Show keyboard focus with the `-focus` outline in `{colors.focus-ring}` | Remove focus outlines or signal focus with a color shift alone |
```

---

## Section 11 — ## Agent Checklist

A numbered quick-reference list (8–12 items) for AI coding agents. Each item should be specific to this system, not generic. The agent should read this list before writing any UI component.

```markdown
## Agent Checklist

1. Read this entire SKIN.md before writing any component or layout.
2. Every color reference must use a named token from `colors:` — no inline hex values.
3. `{colors.primary}` is reserved for primary CTAs, active states, and the brand wordmark only.
4. Elevation is tonal — use stepped surface backgrounds, not drop shadows, except for floating layers.
5. All padding and layout gaps must reference `{spacing.*}` tokens — no arbitrary px values.
6. Button components: always default to `button-primary`; use `button-secondary` only for non-destructive secondary actions.
7. Typography: match role to context exactly — `display-lg` for heroes, `heading` for section titles, `body-md` for prose, `caption` for metadata.
8. When a gap exists in this file, check `## Known Gaps` before guessing. If the gap is listed, surface it to the developer; if it isn't listed, apply the nearest analogous token.
9. Never introduce a new color, font, shadow, or radius that isn't defined in this file without noting it.
10. Before shipping any screen, verify that all components used map 1:1 to entries in `## Components`.
11. Every interactive element implements its `-hover`, `-active`, `-focus`, and `-disabled` variants, and form fields their `-error` variant; never ship a control with only its default look.
```

---

## What Belongs Where

| Question the agent asks | Section that answers it |
|---|---|
| Which exact value? | YAML tokens (sections 1–5) |
| Why does it look like this? | Overview prose (section 6) |
| Where does each token apply, and why? | Colors/Typography/Layout/Elevation (section 7) |
| What does this element look like? | Components (section 8) |
| What changes at small screens? | Responsive Behavior (section 9) |
| What isn't covered? | Known Gaps (section 9) |
