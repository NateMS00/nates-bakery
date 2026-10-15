# BONES: Auth and System pages

> **Source**: SKELETON.md v1.5.0: `/login`, `/forgot-password`, `/reset-password`, `/account`, `/privacy`, not-found, error; FLOW-04
> **Primary Device**: mobile for the auth pages, because a sign-in usually interrupts something started on the iPhone (an import from Instagram's share menu, a link opened from Messages); the system pages have no single primary device
> **Shell**: BONES-shell.md. Auth pages use the Share variant (public shell). Privacy, Not found and Error use the App variant when signed in and the Share variant otherwise, so a guest or friend never sees owner navigation
> **Version**: 1.3.0 · **Updated**: 2026-10-15
> **Note**: Written after the build (prompt 8) to record the layout as reviewed and approved, so later changes and the accessibility audit have a spec to check against.

---

## Shared rules for these pages

- **Column**: one column, full width on mobile; 5 of 12 cols on desktop and 5 of 8 on tablet for the auth pages, 8 of 12 for Privacy, Not found and Error. The column is centered on the page, aligned to the page top like every other page (not vertically centered), with left-aligned text.
- **Footer at the bottom**: on a page shorter than the viewport, `main` grows to fill the remaining height, so the footer sits at the bottom of the screen in every shell, never mid-screen with empty space below it.
- **Forms**:
  - Labels are always visible, and errors follow SKIN's field-error pattern. Each missing or invalid field gets its own error, and on submit focus moves to the first field in error.
  - Every field carries the autocomplete hints the iPhone needs to offer saved and suggested passwords (listed per page below).
- **Notices**: page-level messages ("Password updated", "That reset link has expired…") sit between the H1 and the form, use SKIN's notice component, and are announced when they appear.
- **No account enumeration**: no page ever reveals whether an email has an account.

---

## `/login` (Sign In)

> **Primary Action**: Sign in → `?next=` path or `/recipes`

```text
MAIN
├── PAGE_TITLE "Sign in"                    H1
├── NOTICE (Password updated, or the sign-in error)
└── SIGN_IN_FORM
    ├── EMAIL
    ├── PASSWORD
    ├── SIGN_IN (full width)
    └── FORGOT_PASSWORD → /forgot-password
```

- **Layout**: one column (see Shared rules); Sign in full width of the column on every device; "Forgot password?" a text link below it
- **Content**: "Sign in"; Email (`type="email"`, `autocomplete="username"`); Password (`autocomplete="current-password"`); Sign in; "Forgot password?". No sign-up link (SKELETON)
- **Behavior**: on success → the `?next=` path if it is a same-site path, otherwise `/recipes`. A `?next=` pointing to another site (for example `//evil.example`) is ignored

```text
DESKTOP (5 cols, centered)          MOBILE
+-----------------------------+     +--------------------------------------+
| SIGN IN                     |     | SIGN IN                              |
| EMAIL                       |     | EMAIL                                |
| [                         ] |     | [                                  ] |
| PASSWORD                    |     | PASSWORD                             |
| [                         ] |     | [                                  ] |
| [         SIGN IN         ] |     | [             SIGN IN              ] |
| FORGOT PASSWORD?            |     | FORGOT PASSWORD?                     |
+-----------------------------+     +--------------------------------------+
```

| State | Trigger | Layout change |
|---|---|---|
| Missing fields | Sign in with an empty field | Each empty field shows its own error; focus moves to the first |
| Wrong credentials | Email and password don't match | A notice above the form: "Email or password is incorrect." It takes focus so it is read out. The email is kept, the password cleared. The same message whether or not the email exists |
| Password updated | Arrived from a successful reset | Notice above the form: "Password updated. Sign in with your new password." |
| Already signed in | Owner opens `/login` | Goes straight to `?next=` or `/recipes` |

---

## `/forgot-password` (Forgot Password)

> **Primary Action**: Send reset link

```text
MAIN
├── PAGE_TITLE "Reset your password"        H1
├── INTRO (one sentence; form state only)
├── NOTICE (expired or used link)
├── RESET_FORM: EMAIL, SEND_RESET_LINK      (form state)
├── CHECK_YOUR_EMAIL                         H2 (sent state)
└── BACK_TO_SIGN_IN → /login
```

- **Layout**: as `/login`; Send reset link full width of the column
- **Content**: intro "Enter the email you sign in with, and we'll send you a link to set a new password."; Email (`type="email"`, `autocomplete="username"`); Send reset link; "Back to sign in"
- **Behavior**: sending replaces the intro and the form with the sent state; focus moves to its heading

| State | Trigger | Layout change |
|---|---|---|
| Sent | Send reset link with a valid email | Intro and form are removed. H2 "Check your email" and "If there's a Nate’s Bakery account for <email>, a reset link is on its way. It works once, for one hour. Open it on this device, in this browser." The same answer whether or not the email has an account. "Back to sign in" stays |
| Link expired | Arrived from a reset link that expired, was already used, was opened in a different browser, or came back from Supabase with an error (FLOW-04) | Notice above the form: "That reset link has expired, was already used, or was opened in a different browser. Send a new one below." Never an error page |
| Invalid email | Send with an empty or malformed email | Field error; focus stays in the field |

---

## `/reset-password` (Set New Password)

> **Primary Action**: Save new password → `/login` with the Password updated notice

```text
MAIN
├── PAGE_TITLE "Set a new password"         H1
└── NEW_PASSWORD_FORM
    ├── NEW_PASSWORD + HINT
    ├── SHOW_PASSWORD (checkbox)
    └── SAVE_NEW_PASSWORD (full width)
```

- **Layout**: as `/login`
- **Content**: one New password field (`autocomplete="new-password"`), its hint "At least 12 characters." linked to the field for screen readers; a "Show password" checkbox instead of a second confirm field; Save new password
- **Behavior**: the reset link works once. Saving → `/login` with the Password updated notice

| State | Trigger | Layout change |
|---|---|---|
| Too short | Save with fewer than 12 characters | The hint becomes the error "Use at least 12 characters"; field marked in error, focus stays in it |
| Expired or used token | The `?token=` is no longer valid, on load or on save | → `/forgot-password` with the Link expired notice |

---

## `/account` (Account)

> **Primary Action**: none
> **Shell**: App variant; in the installed app, the Account tab's page (tab bar shown)

```text
MAIN
├── PAGE_TITLE "Account"                    H1
├── SIGNED_IN_AS (email, muted)
├── SETTINGS (list of rows)
│   ├── TIMER_ALERTS ("On" / "Off") → Timer alerts sheet
│   ├── SHORTCUT_AND_IMPORT_KEY → /import#set-up-the-shortcut
│   └── PRIVACY → /privacy
└── SIGN_OUT
```

- **Layout**: reading column, 8 of 12 cols on desktop, full width on mobile. Settings as one glazed `card` with hairline-separated rows, each 56px tall: label on the left, its state in muted text and a chevron on the right. Sign out below the card, as a `button-secondary`, full width on mobile
- **Content**: "Account"; "Signed in as nathan@…" (muted); Timer alerts with its state ("On", "Off", "Blocked"); "Shortcut and import key"; "Privacy"; Sign out
- **Behavior**: Timer alerts opens the Timer alerts sheet (BONES-shell) over this page; Sign out ends the session → `/login`, with no confirmation (signing back in is easy and nothing is lost)

```text
MOBILE
+--------------------------------------+
| ACCOUNT                              |
| SIGNED IN AS EMAIL                   |
| +----------------------------------+ |
| | TIMER ALERTS             OFF   > | |
| | SHORTCUT AND IMPORT KEY        > | |
| | PRIVACY                        > | |
| +----------------------------------+ |
| [            SIGN OUT            ]   |
+--------------------------------------+
| LIBRARY   IMPORT   BAKES   ACCOUNT   |
+--------------------------------------+
```

- **Assumed**: The Account page exists for the installed app's tab bar; in Safari the account menu holds the same items, and `/account` still works if opened directly.

---

## `/privacy` (Privacy)

> **Primary Action**: none; a reading page

```text
MAIN
├── PAGE_TITLE "Privacy"                    H1
├── UPDATED_DATE
├── LEAD (one sentence)
├── WHAT_THE_APP_STORES                     H2 (list)
├── WHAT_A_SHARE_LINK_SHOWS                 H2
├── REELS                                   H2
└── WHERE_IT_IS_STORED                      H2
```

- **Layout**: reading column, 8 of 12 cols on desktop, full width on mobile; body at reading size with comfortable line length
- **Content**:
  - **What Nate’s Bakery stores**: the owner's email and password (the password stored only as a hash); recipes, favorites and the bake log, including each bake's rating and the bake photos you add; reel links, creator handles, captions and a copy of each reel's thumbnail; the import key for the Shortcut, stored only in a form that can't be read back; the timer-alert subscription; a sign-in cookie, with no advertising or tracking cookies.
  - **What a share link shows**: what a friend can and can't see; revoking stops the link at once.
  - **Reels**: when you import, the app sends the reel link to Apify, a web-scraping service, which returns the reel's caption, creator handle and thumbnail. The recipe is read from the caption by Apple Intelligence through the Shortcut, on your device or on Apple's Private Cloud Compute, not by Nate’s Bakery's servers. The audio and video are never downloaded.
  - **Where it is stored**: the database is Supabase, in the United States (Oregon); the app runs on Vercel.
- **Behavior**: none
- **Open**: the copy is a draft whose promises the backend must keep; Nathan reviews every promise before import is turned on.

---

## Not found

> **Primary Action**: none (the one way forward is a secondary button)

```text
MAIN
├── PAGE_TITLE "Page not found"             H1
├── EXPLANATION (one sentence)
└── WAY_FORWARD (button-secondary)
```

- **Layout**: column aligned to the page top (not centered), since the page has a way forward; the button sizes to its label
- **Content**: "Page not found"; "This page doesn't exist, or the recipe was deleted."; "Go to your recipes" → `/recipes` when signed in, "Sign in" → `/login` otherwise
- **Behavior**: served with a 404 status (BACKLOG)

---

## Error

> **Primary Action**: Try again

```text
MAIN
├── PAGE_TITLE "Something went wrong"       H1 (takes focus)
├── EXPLANATION (one sentence)
├── TRY_AGAIN (button-primary)
└── WAY_OUT (button-secondary; depends on where the error happened)
```

- **Layout**: column aligned to the page top; both buttons full width and stacked on mobile, side by side and sized to their labels from tablet up
- **Content**: "Something went wrong"; "This page didn't load. Nothing you saved is lost; try again in a moment."; Try again reloads the page's data from the server (a plain redraw would repeat the failure). The way out depends on the area:
  - Owner area: "Go to your recipes" → `/recipes`
  - Shared pages: none, Try again only, since nothing in the owner area is open to a friend
  - Anywhere else: "Go to Nate’s Bakery" → `/`
- **Behavior**: the H1 takes focus when the page appears, so screen readers announce the failure. If the root layout itself fails, a minimal plain-HTML version with the same text and Try again

---

## ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: Auth pages use the Share variant of the shell (logo not a link, no navigation, Privacy in the footer), since there is no owner yet to navigate.
- **Assumed**: Privacy, Not found and Error pick the App or Share variant by session, so friends never see owner navigation.
- **Assumed**: One password field with "Show password" instead of typing it twice; easier on a phone, and the reset link can always be used again.
- **Assumed**: Reset links work once and expire after one hour.
- **Constraint**: The reset email uses Supabase's default template, because new free projects on Supabase's built-in email can't customize templates (Supabase changelog, June 2026). Its link only works in the browser that requested it, which is why the sent message and the Link expired notice mention the browser. A custom SMTP service with a branded email is in the backlog and would lift this.
- **Assumed**: Only same-site `?next=` paths are followed after sign-in.
- **Assumed**: Sign-in uses Supabase Auth with one owner account and sign-ups turned off. The stub credentials exist only in the fixtures backend for development and tests.
- **Open**: Friend accounts (SKELETON option B) would add a sign-up link here.

---

## CHANGE LOG

- 1.3.0 (2026-10-15): New `/account` page for the installed app's Account tab; Privacy lists ratings per bake and bake photos (SKELETON 1.5.0).
- 1.2.0 (2026-10-13): Privacy names Apify and Apple Intelligence for reel imports, lists captions, thumbnails and the import key, and adds where data is stored (SKELETON 1.4.1).
- 1.1.2 (2026-10-01): App renamed to Nate’s Bakery.
- 1.1.1 (2026-10-01): Restored "Send a new one below." in the Link expired notice; sign-in now recorded as Supabase Auth.
- 1.1.0 (2026-10-01): Reset flow on Supabase's default email: sent message adds "Open it on this device, in this browser."; Link expired notice covers links opened in a different browser; constraint recorded.
- 1.0.0 (2026-09-30): Recorded from the prompt 8 build and review: shell per page, the auth column, sign-in errors without account enumeration, safe `?next=`, the sent state replacing the intro, one password field, autocomplete hints, the footer kept at the bottom on short pages, Privacy sections, Not found and Error ways out.
