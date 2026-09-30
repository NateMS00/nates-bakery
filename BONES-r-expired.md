# BONES: `/r/expired` (Link Unavailable)

> **Source**: SKELETON.md v1.3.0, `/r/expired`
> **Primary Action**: none; the page only explains (SKELETON gives it no action and no links into the app)
> **Primary Device**: mobile, because friends open share links from a message on their phone
> **Shell**: BONES-shell.md, Share variant
> **Version**: 1.0.0 · **Updated**: 2026-09-29

---

## 1. STRUCTURE

```text
MAIN
└── MESSAGE
    ├── HEADING "This link no longer works"  H1
    └── EXPLANATION
```

**First viewport (mobile)**: the heading and explanation, centered vertically in the space between header and footer.

---

## 2. SECTIONS

### Message
- **Layout**: desktop centered column, 6 of 12 cols; mobile full width; centered vertically on both
- **Content**: "This link no longer works"; "Ask the person who shared it to send you a new one." The wording never says whether the recipe was deleted or the link was revoked (SKELETON)
- **Behavior**: none

```text
DESKTOP
+-----------------------------------------------------------------------+
|                  THIS LINK NO LONGER WORKS                            |
|         ASK THE PERSON WHO SHARED IT TO SEND YOU A NEW ONE.           |
+-----------------------------------------------------------------------+
```

```text
MOBILE
+--------------------------------------+
| THIS LINK NO LONGER WORKS            |
| ASK THE PERSON WHO SHARED IT TO      |
| SEND YOU A NEW ONE.                  |
+--------------------------------------+
```

---

## 3. STATES & OVERLAYS

| Name | Trigger | Layout change |
|---|---|---|
| None | | The page has one state |

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: The section name "Message" (SKELETON gives this route a goal but no section stack).
- **Assumed**: The copy above as draft copy.

---

## CHANGE LOG

- 1.0.0 (2026-09-29): Initial wireframe.
