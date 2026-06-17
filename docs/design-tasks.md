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
| DS-07 | Surface/Card (elevation-aware) + Button (primary/secondary/ghost) with all states | new components, both platforms | DS-06 | D | ☐ |
| DS-08 | Input + Search field (unify the Add-card search + balance inputs) | components | DS-07 | D | ☐ |
| DS-09 | BottomSheet + SegmentedControl + Chip/Pill | components | DS-07 | D | ☐ |
| DS-10 | ProgressBar + ProgressRing + Badge + Toast | components | DS-07 | D | ☐ |
| DS-11 | EmptyState + Skeleton loaders | components | DS-07 | D, P (empty copy) | ☐ |
| DS-12 | StatHero (big animated total) + redesigned TabBar | components | DS-07, DS-04 | D | ☐ |
| DS-13 | Migrate all 4 tabs onto the component library — zero hardcoded style values | all tabs/screens | DS-07..12 | D, Q | ☐ |

## P2 — Screens & motion (the visible overhaul)

| ID | Task | Files | Depends | Gate | Status |
|----|------|-------|---------|------|--------|
| DS-14 | Wallet (Cards): StatHero total with count-up; elevated card stack | Cards screen | DS-13 | D, P, Q | ☐ |
| DS-15 | Fly: reachable-first, progress rings, favourites promoted; keep award caveats | Fly screen | DS-13 | D, P, Q | ☐ |
| DS-16 | Progress (History): trend chart as hero; surface for streak/milestones | History screen | DS-13 | D, P, Q | ☐ |
| DS-17 | You (Settings): grouped + calm; surface rate provenance (source/asOf/confidence) | Settings screen | DS-13 | D, Q | ☐ |
| DS-18 | Onboarding + designed empty/loading states across the app | onboarding, all screens | DS-11, DS-13 | D, P, Q | ☐ |
| DS-19 | Signature motion pass (list entrance, tab transition, value count-up); honor reduce-motion | all screens | DS-14..18 | D, Q | ☐ |
| DS-20 | IA rename decision + apply (Wallet · Fly · Progress · You) — **PM-gated** | tabs, labels | DS-13 | P, D | ☐ |

## P3 — Retention loops (the reason to return)

| ID | Task | Files | Depends | Gate | Status |
|----|------|-------|---------|------|--------|
| DS-21 | Snapshot streak (monthly cadence) surfaced in Progress | History + storage | DS-16 | P, D, Q | ☐ |
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
