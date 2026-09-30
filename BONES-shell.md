# BONES: Shell

> **Source**: SKELETON.md v1.3.0, Navigation
> **Breakpoints**: from SKIN.md: mobile under 768, tablet 768 to 1279, desktop 1280 and up
> **Grid**: from SKIN.md: mobile 4 columns, tablet 8 columns, desktop 12 columns; content max width 1200, centered
> **Version**: 1.3.0 · **Updated**: 2026-09-30

---

## App variant

Used by every owner route except Bake Mode (see Focus variant).

- **Header**: logo (links to `/recipes`), then primary navigation in SKELETON order: Library (`/recipes`), Import (`/import`); utility navigation at the far end: account menu (Timer alerts, Sign out, Privacy). The current route's navigation item is marked as current. The header scrolls away with the page on every device, because pages own their sticky elements (Recipe's sticky Start baking bar) and a second sticky bar would take too much of a phone screen.
- **Mobile navigation**: no tab bar and no hamburger menu. With only two primary items, both fit in the top bar: the logo is Library, Import is a compact link, and the account menu is last. This leaves the bottom edge of the screen free for each page's primary action.
- **Footer**: one group: Privacy (`/privacy`).
- **Landmarks and order**: skip link to main content, `header` containing `nav`, `main`, `footer`. DOM order matches visual order on every breakpoint.

```text
DESKTOP
+-----------------------------------------------------------------------+
| [LOGO]   LIBRARY   IMPORT                               [ACCOUNT v]   |
+-----------------------------------------------------------------------+
|                                                                       |
|                               MAIN                                    |
|                                                                       |
+-----------------------------------------------------------------------+
| PRIVACY                                                               |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| [LOGO]              IMPORT [ACCT v]  |
+--------------------------------------+
|                                      |
|                MAIN                  |
|                                      |
+--------------------------------------+
| PRIVACY                              |
+--------------------------------------+
```

**Account menu**: a small dropdown anchored to the account button on every device, with Timer alerts, Sign out, and Privacy in that order; dismissed by selecting an item, Esc, or tapping outside. Timer alerts opens the Timer alerts sheet (below) over the current page.

**Timer alerts sheet** (shared overlay, SKELETON FLOW-05; opened from the account menu or Bake Mode's card): mobile bottom sheet sized to its content; desktop centered modal, 5 cols wide. A header row holds the title and a close X. Its content depends on where the app stands:
- **Not on the Home Screen**: title "Get timer alerts on a locked phone"; one sentence on why ("iPhone only sends alerts to apps on your Home Screen"); 3 numbered steps: tap Share in Safari, choose Add to Home Screen, open Backery from the new icon.
- **On the Home Screen, alerts off**: same title; "Turn on alerts" (the one prominent action), which triggers the phone's permission prompt.
- **Alerts on**: "Timer alerts are on" and a line saying timers will alert even when the phone is locked.
- **Permission denied**: "Alerts are blocked"; how to allow them in the phone's Settings.

Dismissed by the close X, Esc, backdrop tap, or swipe down on mobile; focus is trapped inside and returns to what opened it.

```text
MOBILE (not on the Home Screen)
+--------------------------------------+
| GET TIMER ALERTS ON A LOCKED... [X]  |
| WHY_SENTENCE                         |
| 1  TAP SHARE IN SAFARI               |
| 2  ADD TO HOME SCREEN                |
| 3  OPEN BACKERY FROM THE NEW ICON    |
+--------------------------------------+
```

```text
DESKTOP (alerts off)
+-----------------------------------------+
| GET TIMER ALERTS ON A LOCKED PHONE  [X] |
| WHY_SENTENCE                            |
| [TURN ON ALERTS]                        |
+-----------------------------------------+
```

---

## Share variant

Used by `/r/:shareToken` and `/r/expired`, for friends without an account.

- **Header**: the logo only, not a link (SKELETON allows no links into the owner area from shared pages); no navigation, no account menu; scrolls with the page.
- **Mobile navigation**: none.
- **Footer**: Privacy (`/privacy`).
- **Landmarks**: skip link, `header`, `main`, `footer`; no `nav`.

```text
DESKTOP
+-----------------------------------------------------------------------+
| [LOGO]                                                                |
+-----------------------------------------------------------------------+
|                               MAIN                                    |
+-----------------------------------------------------------------------+
| PRIVACY                                                               |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| [LOGO]                               |
+--------------------------------------+
|                MAIN                  |
+--------------------------------------+
| PRIVACY                              |
+--------------------------------------+
```

---

## Overlay sizing (all pages)

Viewport shares given in page BONES files ("about a third", "about half") are **maximum heights**, not fixed sizes: every sheet and modal fits its content and never leaves empty space below its last element, up to 90% of the viewport, after which its body scrolls. Every sheet and modal has a header row with its title and a close X (icon button) at the end; there is no separate Close button at the bottom. Exceptions that keep their stated height: overlays that are full-screen forms (Bake Log's entry form on mobile) and sheets with a scrolling list and a footer pinned to the bottom (Library's Filters sheet, the Ingredients used picker).

---

## Focus variant

Reserved for Bake Mode (`/recipes/:recipeId/bake`), where SKELETON removes primary and utility navigation. The header holds only an Exit control (back to Recipe) and the recipe title; there is no footer. Its full layout is defined in BONES-recipes-bake.md.

---

## ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: A top bar instead of a bottom tab bar on mobile, because there are only two primary items and the bottom edge is reserved for page actions.
- **Assumed**: The header is not sticky, so page-level sticky actions don't stack with it.
- **Assumed**: A skip link to main content (not in SKELETON; added for keyboard and screen reader users).
- **Assumed**: The Share variant's logo is not a link; linking it would lead friends to the owner's sign-in page.

---

## CHANGE LOG

- 1.3.0 (2026-09-30): Added the Overlay sizing rule (fit to content, close X in the header) for every page; Timer alerts sheet follows it.
- 1.2.0 (2026-09-29): Added the Share variant for shared recipe pages.
- 1.1.0 (2026-09-29): Added Timer alerts to the account menu and the shared Timer alerts sheet (SKELETON 1.3.0).
- 1.0.0 (2026-09-29): Initial shell, App and Focus variants.
