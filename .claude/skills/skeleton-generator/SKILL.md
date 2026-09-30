---
name: skeleton-generator
description: Creates or updates a SKELETON.md file that defines a digital product's information architecture (sitemap, route map, role-based access, navigation systems, key user flows, and a high-level section stack for each page). Use whenever the user wants to plan a sitemap, decide which pages or screens a product needs, define URL routes, map user journeys or flows, structure navigation, or create or revise SKELETON.md, even if they only say "what pages does my app need" or "map out the structure before we build". Not for visual design systems (SKIN.md), component or page code, code scaffolding, or skeleton loading screens.
---

# Skeleton Generator

Produce `SKELETON.md`, the single source of truth for a product's information architecture. Whoever builds next, human or agent, should be able to answer four questions from it without guessing: which pages exist, who can reach each one, how they connect, and what each one is for.

## What belongs in SKELETON.md

SKELETON.md owns structure and intent. Visual language belongs in SKIN.md (or the project's equivalent), and implementation belongs in code. Keep the layers apart because downstream agents read several spec files at once; when two files describe the same thing, they drift, and the agent has to guess which one wins. "Hero: value proposition and primary CTA" survives a redesign. "Hero: two-column layout on a gradient" goes stale the moment SKIN.md changes.

Apply that as follows:

- Describe what a section does and contains, never how it looks. "Compare the three plans by price and limits" is structure; "three-column card grid" is layout.
- Name navigation systems by function (primary, utility, footer, contextual), not by placement (header, left sidebar).
- Name routes, not files or components: `/settings/billing`, not `app/settings/billing/page.tsx` or `<BillingForm>`.
- Write dynamic segments as `:param` and page state as `?key=value`, whatever the framework. The implementing agent maps them to its router.
- Decide routing questions instead of deferring them. If an overlay (share dialog, quick view) must survive a refresh or be linkable, give it a route or query param; otherwise list it inside its page spec as an overlay. "Modal or redirect" is exactly the kind of call this file exists to make.
- For native mobile apps, treat each screen as a route using its deep-link path, and describe tab and stack structure under Navigation.
- State each fact in one place. Navigation owns which links appear where, flows own how users move between routes, and the Route Map owns what each route is for and who can reach it; a page spec adds only what the Route Map can't hold (primary action, section order, states), so it doesn't restate the goal. Repeating a link list in all three makes the file longer and lets the copies drift apart.

## Workflow

### 1. Establish scope

Gather four inputs before writing:

- **Product type**: marketing site, B2B SaaS, marketplace, e-commerce, content site, mobile app, internal tool.
- **Primary goal**: the one outcome the structure must serve (self-serve signup, purchase, demo request, retention).
- **Roles**: Guest, Member, Admin, and so on, plus what separates them.
- **Core objects**: the nouns users browse or manage (products, projects, invoices). These drive the dynamic routes.

Mine the conversation, the repo (README, existing routes, SKIN.md, PRDs), and any attached brief first. If product type or primary goal remains unknown, ask one consolidated question. Infer everything else and record each inference under Assumptions, so the user corrects them in one pass instead of answering a questionnaire.

Structure what the brief asks for and what it directly implies: a free trial implies billing states, staff roles imply an invitation path. Where the brief is silent on a mechanism (sign-in method, payment timing), choose the conventional option and note it as an assumption. Put features the brief doesn't imply, such as integrations or extra roles, under Open Questions instead of the Route Map; every speculative route commits the builder to something nobody asked for.

Match depth to the product. A six-page marketing site needs a short file. A SaaS with forty routes needs routes grouped by area, and page specs only for key pages and shared templates (one spec for `/blog/:slug`, not one per post).

### 2. Check for an existing file

If `SKELETON.md` exists, read it and update it in place. Keep existing route paths and flow IDs stable, because other specs and agents reference them. Bump the version (major for removed or renamed routes, minor for added routes or flows, patch for wording) and add a Change Log entry. Regenerate from scratch only when the user asks.

Otherwise, create it at the project root unless the user names another location.

### 3. Build the route inventory before writing

List every route with its access level, then walk each flow and each navigation system against that list. Most gaps surface here: a flow that needs `/forgot-password` that nobody listed, an admin page nothing links to, a checkout with no failure path. Fix the inventory, then write the file.

### 4. Write the file

Follow the template below. Section order, headings, and field names stay fixed so any agent can parse any SKELETON.md the same way; the content inside fits the product. If a section genuinely doesn't apply (no authenticated area on a brochure site), keep the heading with a one-line note instead of deleting it, so readers know it was considered.

### 5. Validate, then report

Check before handing back:

- Every route named in a flow, navigation system, or page spec appears in the Route Map, and the Sitemap tree lists the same set.
- Every route is reachable from navigation, a flow, or another page, or has an Entry field explaining how users arrive (email link, ad, signed URL).
- Every non-public route has an access rule and a destination for unauthorized users, stated on the route or inherited from its area's default.
- Each concept keeps one name throughout. If the deposit is a "hold" in one flow, it is not a "charge" in another; builders read two names as two things.
- Every flow has a success state and covers its realistic failure paths (payment declined, email already registered, no results).
- System routes exist: not-found and error pages; login, signup, password reset, and email verification when auth exists; legal pages when the product collects personal data or takes payment.
- No visual or implementation detail slipped in.

Then tell the user the route and flow counts, plus the two or three open questions that most affect the structure.

## Template

Placeholders appear in `<angle brackets>`. Replace every one of them.

````markdown
# SKELETON: <Product Name>

> **Product Goal**: <One sentence: the outcome this structure serves>
> **Product Type**: <e.g., B2B SaaS, e-commerce, marketing site>
> **Primary Persona**: <Who they are and what they came to do>
> **Version**: 1.0.0 · **Updated**: <YYYY-MM-DD>

---

## 1. ROLES & ACCESS

| Role | Who | Default landing |
|---|---|---|
| <Role> | <Description> | `<route>` |

**Access levels**: `public` (anyone), `guest-only` (signed-in users redirect to `<route>`), `<role>` (requires that role). Add levels as the product needs.

---

## 2. SITEMAP

```text
/
├── /<route>
│   └── /<route>/:<param>
└── /<area>
    └── /<area>/<route>
```

---

## 3. ROUTE MAP

### <Area, e.g., Marketing | Auth | App | Admin | System>

Default access: <level>; unauthorized → `<route>`. Routes in this area inherit it unless they say otherwise.

- `<route>` - **<Page Name>**
  - Goal: <What this page must achieve>
  - Access: <only when it differs from the area default>
  - Params: <dynamic routes only: what `:param` identifies; unknown value → not-found>
  - Entry: <only when nothing in the product links here: email link, ad, signed URL>

---

## 4. NAVIGATION

- **Primary** (<role or area>): `<route>`, `<route>`, `<route>`
- **Utility**: <account menu, notifications, search, with their routes>
- **Footer**: `<route>`, `<route>`
- **Contextual**: <cross-links that matter, e.g., invoice detail → client detail>

---

## 5. KEY USER FLOWS

### FLOW-01: <Name>
- **Role**: <role, or a transition such as Guest → Member>
- **Entry**: <where the user starts and how they got there>
- **Success**: <end state and the route it ends on>

1. User <action> on `<route>`.
2. System <response> → `<route>`.

**Alternate paths**
- <Condition> at step <n> → <outcome> (`<route>`)

---

## 6. PAGE SPECIFICATIONS

### `<route>` (<Page Name>)
- **Primary Action**: <the one action the page pushes> → `<route>`
- **Section Stack** (order = priority):
  1. `<Section>`: <purpose and content>
- **States**: <app pages only: empty, no-results, or restricted states that change the page's purpose>

---

## 7. ASSUMPTIONS & OPEN QUESTIONS

- **Assumed**: <inference> (<basis>)
- **Open**: <question whose answer would change the structure>

---

## CHANGE LOG

- 1.0.0 (<YYYY-MM-DD>): Initial skeleton.
````

## Example (excerpt)

A partial skeleton for a small invoicing SaaS. It shows the expected level of detail for goals, access rules, alternate paths, and section stacks. Don't carry its routes into unrelated products.

````markdown
# SKELETON: Tally

> **Product Goal**: Take a freelancer from first visit to first invoice sent in one session.
> **Product Type**: B2B SaaS, self-serve
> **Primary Persona**: Solo freelancer billing 3 to 10 clients a month, currently on spreadsheets
> **Version**: 1.0.0 · **Updated**: 2026-09-25

## 1. ROLES & ACCESS

| Role | Who | Default landing |
|---|---|---|
| Guest | Unauthenticated visitor | `/` |
| Member | Signed-in freelancer | `/app/invoices` |
| Client | Invoice recipient without an account; arrives via a signed link | `/pay/:invoiceToken` |

## 3. ROUTE MAP (excerpt)

### App

Default access: member; signed-out → `/login?next=` plus the requested path. Routes in this area inherit it unless they say otherwise.

- `/app/invoices/:invoiceId` - **Invoice Detail**
  - Goal: Show an invoice's status and let the member act on it (send, remind, mark paid).
  - Access: the invoice's owner only; other members → not-found
  - Params: `:invoiceId` identifies an invoice owned by the current member; unknown ID → not-found

### Client

Default access: public, gated by a valid invoice token; expired or unknown token → `/pay/expired`.

- `/pay/:invoiceToken` - **Pay Invoice**
  - Goal: Let a client review and pay an invoice without creating an account.
  - Params: `:invoiceToken` is a signed, single-invoice token
  - Entry: invoice email only

## 5. KEY USER FLOWS (excerpt)

### FLOW-01: First invoice sent
- **Role**: Guest → Member
- **Entry**: `/`, from organic search or a referral link
- **Success**: Invoice sent; member lands on `/app/invoices/:invoiceId` showing status Sent

1. User clicks "Start free" on `/` → `/signup`.
2. System creates the account → `/onboarding/business` (business name, currency).
3. User continues → `/app/invoices/new?onboarding=1`.
4. User adds a client inline, adds line items, and sends.
5. System emails the client a `/pay/:invoiceToken` link → `/app/invoices/:invoiceId`.

**Alternate paths**
- Email already registered at step 1 → `/login` with the email prefilled and a notice.
- User leaves `/app/invoices/new` before sending → the invoice saves as a draft; next sign-in lands on `/app/invoices` with the draft listed under Needs Action.

## 6. PAGE SPECIFICATIONS (excerpt)

### `/app/invoices` (Invoice List)
- **Primary Action**: New invoice → `/app/invoices/new`
- **Section Stack** (order = priority):
  1. `Summary`: outstanding, overdue, and paid-this-month totals.
  2. `Needs Action`: overdue and draft invoices, each linking to its detail page.
  3. `All Invoices`: every invoice, filterable by status and client (`?status=`, `?client=`).
- **States**: Empty (no invoices yet) → the page reduces to a single prompt to create the first invoice.
````
