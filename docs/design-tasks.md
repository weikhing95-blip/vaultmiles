# Design Overhaul — Task Queue

Execution checklist for `docs/design-overhaul.md`, ordered to run **one at a
time, top to bottom**. Each task is independently shippable and dependency-safe:
never restyle a screen before its tokens/components exist (P0 → P1 → P2 → P3).

**Gate legend:** D = `/design-vaultmiles` (always) · P = `/pm-vaultmiles` (scope/UX
or copy) · Q = `/qa-vaultmiles` (after implementation). **Status:** ☐ todo ·
◐ in progress · ☑ done.

**Working rule:** pick the first ☐ whose dependencies are ☑. Every task lands in
**both** `src/theme.js`/web and `mobile/constants/theme.ts`/mobile (parity), and
flips its status here on completion (self-maintaining — this file is the tracker).

---

## P0 — Foundation tokens (invisible; unlocks everything)

| ID | Task | Files | Depends | Gate | Status |
|----|------|-------|---------|------|--------|
| DS-01 | Spacing scale tokens (8pt grid: 4/8/12/16/20/24/32/40) | theme.js, theme.ts | — | D | ☑ |
| DS-02 | Radius scale tokens (sm/md/lg/pill) | theme.js, theme.ts | — | D | ☑ |
| DS-03 | Elevation tokens (e0–e3 = surface + shadow pairs) | theme.js, theme.ts | DS-01 | D | ☑ |
| DS-04 | Motion tokens (durations fast/base/slow + easings, incl. spring) | theme.js, theme.ts | — | D | ☑ |
| DS-05 | Type-scale tokens (display/title/heading/body/caption/overline = size+lh+weight); demote mono to numbers only | theme.js, theme.ts | — | D, P (copy/role of fonts) | ☑ |
| DS-06 | Proof refactor: Settings card surfaces consume tokens (radius.pill, space[3]/[4]) — zero visual regression | TabSettings.jsx | DS-01..05 | D, Q | ☑ |

## P1 — Component library (canonical, both platforms)

| ID | Task | Files | Depends | Gate | Status |
|----|------|-------|---------|------|--------|
> P1 primitives live in `src/components/ui.jsx` + `mobile/components/ui.tsx`,
> compile-verified (web build + mobile tsc). **Not yet adopted into screens or
> visually verified** — that happens in DS-13 / P2 on the preview.

| DS-07 | Surface/Card (elevation-aware) + Button (primary/secondary/ghost) | ui.jsx, ui.tsx | DS-06 | D | ☑ |
| DS-08 | Input field (unifies Add-card search + balance inputs) | ui.jsx, ui.tsx | DS-07 | D | ☑ |
| DS-09 | Chip/Pill ☑ · BottomSheet ☑ · SegmentedControl ☑ | ui.jsx, ui.tsx | DS-07 | D | ☑ |
| DS-10 | ProgressBar ☑ + ProgressRing (web) ☑ + Badge ☑ + Toast ☑ | ui.jsx, ui.tsx | DS-07 | D | ☑ |
| DS-11 | EmptyState + Skeleton loaders | ui.jsx, ui.tsx | DS-07 | D, P (empty copy) | ☑ |
| DS-12 | StatHero ☑ · reusable TabBar (web) ☑ · mobile uses Expo Router tabs | ui.jsx, ui.tsx | DS-07, DS-04 | D | ☑ |
| DS-13 | Migrate tabs onto the component library. Web: Cards (Surface + ProgressBar) ☑, Fly (ProgressBar) ☑; History + Settings + mobile screens pending. Verify on preview. | all tabs/screens | DS-07..12 | D, Q (+ preview) | ◐ |

## P2 — Screens & motion (the visible overhaul)

| ID | Task | Files | Depends | Gate | Status |
|----|------|-------|---------|------|--------|
| DS-14 | Wallet (Cards): slimmer header, hero count-up, skeleton loading, spring card entrance, elevated empty state w/ primary Add-card. Web ☑ (build-verified); mobile parity + preview verification pending. PM dropped "Optimise" CTA (no such flow) + deferred progress-to-next to Fly. | Cards screen | DS-13 | D, P, Q | ◐ |
| DS-15 | Fly: reachable-first (kept), controls→Surface, EmptyState, spring entrance, award caveats kept. Web ☑; rings deferred (bars read better in a dense list); mobile + preview pending. | Fly screen | DS-13 | D, P, Q | ◐ |
| DS-16 | History: trend chart as hero in Surface, Surface+Button+EmptyState adoption. Web ☑; streak/milestones = P3 (DS-21); mobile + preview pending. | History screen | DS-13 | D, P, Q | ◐ |
| DS-17 | Settings: profile/about→Surface, rate provenance via confidence Badge (P4 trust). Web ☑; mobile + preview pending. | Settings screen | DS-13 | D, Q | ◐ |
| DS-18 | Onboarding + designed empty/loading states across the app | onboarding, all screens | DS-11, DS-13 | D, P, Q | ☐ |
| DS-19 | Signature motion pass (list entrance, tab transition, value count-up); honor reduce-motion | all screens | DS-14..18 | D, Q | ☐ |
| DS-20 | IA rename applied (owner-approved): nav Wallet · Fly · Progress · You; History title→"Progress", Settings title→"You". Web ☑; mobile tab labels pending. | tabs, labels | DS-13 | P, D | ◐ |

## P3 — Retention loops (the reason to return)

| ID | Task | Files | Depends | Gate | Status |
|----|------|-------|---------|------|--------|
| DS-21 | Snapshot streak (monthly cadence) surfaced in History — derived from existing snaps (no migration). Web ☑; PM honesty guard: only an ACTIVE streak shows (latest snap = this/prior month). Mobile + preview pending. | History + storage | DS-16 | P, D, Q | ◐ |
| DS-22 | Milestone celebration (earned: a destination becomes reachable) | Fly/Wallet + motion | DS-15, DS-19 | P, D, Q | ☐ |
| DS-23 | Progress-to-next-reward indicator | Fly/Wallet | DS-15 | D, Q | ☐ |
| DS-24 | Expiry nudges (depends on backlog miles-expiry tracking + push) | new | backlog T1-1 | P, D, Q | ☐ |

---

## Notes
- **First up:** DS-01 (spacing tokens) — no dependencies, invisible, unlocks the rest.
- P0 tasks are small and low-risk; they may be reviewed together but are listed
  separately so progress is legible.
- Anything touching copy or IA (DS-05, DS-11, DS-18, DS-20, DS-24) needs PM sign-off.
- Update the matching status cell here the moment a task ships; this file is the
  single source of truth for overhaul progress.
