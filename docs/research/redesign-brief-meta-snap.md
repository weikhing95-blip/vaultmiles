# Frontend Redesign — Research Brief (Meta · Snapchat · fintech)

**Author:** `/research-vaultmiles` · **Date:** 2026-06-18 · **Status:** Phase 0 → hand-off to `/design-vaultmiles` + `/pm-vaultmiles`
**Decision it informs:** direction for the incremental, system-based frontend redesign (design-overhaul P2, DS-14–19).

## TL;DR
Borrow **principles, not patterns**. The winning ideas from Meta/Snap are *focus,
physics-based motion, and earned delight*. The winning ideas for our category come
from **fintech UX: state clarity and trust-by-design**. Snap's literal navigation
(hidden gestures) is an **anti-pattern** for us. Everything below builds on the
existing design system (`src/theme.js` + `src/components/ui.jsx`), extending it
where noted — nothing is discarded.

## Principles → VaultMiles opportunities

| # | Principle (source) | Adapted for VaultMiles (trust-first) | Screen / component | Hypothesis · validation signal |
|---|---|---|---|---|
| P1 | **One job per screen; surface "what matters now," hide the rest** (fintech dashboards reduce decision fatigue) | Wallet leads with the single hero number (StatHero, already built) + the *one* next action ("convert X", "Y pts stranded"). Detail is progressive. | Wallet (`TabCards`) — DS-14 | Faster comprehension → users act on conversions. Signal: conversion-action taps / session |
| P2 | **Physics-based, "springy" motion creates delight** (Meta Expressive 2025) | Use our existing `T.motion.spring` for value count-up, list entrance, tab transitions. Subtle, not theme-park. Honor reduce-motion. | All screens — DS-19 | Delight ↑ without distraction. Signal: qualitative feedback, session length |
| P3 | **State clarity: current state · system state · what happens next** (fintech trust) | Every action (convert, add card, snapshot) shows where you are, what the app is doing, and the outcome. Replace bare spinners with labelled progress + a clear success state. | Conversions, OCR scan, snapshots — DS-14/16/18 | Lower anxiety/abandonment. Signal: add-card + snapshot completion rate |
| P4 | **Security/trust shown, friction hidden; explain "what we noticed, why, what to do"** (fintech) | Surface rate **provenance** (source/asOf/confidence already in CATALOG) inline, calmly. Explain *why* a number is what it is. No raw errors. | Settings (`TabSettings`) DS-17; rate displays | Trust ↑. Signal: rate-override usage, support questions about accuracy |
| P5 | **Data-viz drives return visits** (dashboard engagers log in 60% more) | Make History's trend chart the hero; per-bank breakdown; "you're X% to next redemption." Already partly built (by-bank). | History (`TabHistory`) DS-16; Fly progress | Repeat visits ↑. Signal: History tab views, snapshot cadence |
| P6 | **Earned delight: streaks, milestones, progress-to-next** (retention; 7-day streak → 2.3× daily engagement) | *Monthly* snapshot streak (cadence fits a miles tracker — not daily), milestone when a destination becomes reachable, progress-to-next-reward ring. Celebrate honestly, never nag. | History streak DS-21; Fly/Wallet DS-22/23 | Habit forms. Signal: snapshot streak length, return rate |
| P7 | **Frictionless onboarding** (KYC > 5 min → 40% drop) | First-run: one-card-to-first-number in the fewest taps; designed empty states guide, not block. | Onboarding + empty states DS-18 | Activation ↑. Signal: % new users who add first card |

## Anti-patterns — explicitly rejected
- **Hidden-gesture navigation (Snap).** Engaging in a social app, but *widely
  criticised for confusing users*; Snap itself added a bottom nav to fix it. We
  keep explicit, visible navigation — non-negotiable for a finance app.
- **Engagement over honesty.** No streak guilt, no manufactured urgency, no dark
  patterns. A miles tracker earns return visits by being *useful and trusted*,
  not by manipulation. Every retention idea (P6) must pass the trust check.
- **Camera/feed-first metaphors.** Irrelevant to our task; ignore.

## How this maps to existing plans
- Reuses the **design system** (tokens, `ui.jsx`/`ui.tsx`, StatHero, ProgressBar/
  Ring, Surface, EmptyState, Skeleton) — extend tokens only if a principle needs it.
- Slots directly onto the **design-overhaul P2/P3 queue** (`docs/design-tasks.md`):
  P1→DS-14, P2→DS-19, P3→DS-14/16/18, P4→DS-17, P5→DS-16, P6→DS-21/22/23, P7→DS-18.
- Rollout is **incremental, screen-by-screen, verified on preview** (owner-approved scope).

## Scope honesty (what this brief is *not*)
- Based on **public secondary sources** (design write-ups, fintech UX guides), not
  Meta/Snap internal docs. Directional, not gospel.
- No **VaultMiles user feedback exists yet** — so every row above is a *hypothesis*,
  not a validated finding. As feedback/usage data arrives, `/research-vaultmiles`
  reconciles each hypothesis (validated/refuted) in its Insight Ledger.

## Hand-off
- **`/design-vaultmiles`**: turn P1–P7 into concrete screen direction (start DS-14 Wallet), extending the system; flag any new tokens/components needed.
- **`/pm-vaultmiles`**: gate scope against the /goal + 7 criteria; lock empty/new-user states (P7) before build.

## Sources
- [Spaceberry — iPhone App Design 2025: Clarity, Depth & Trust](https://spaceberry.studio/blog/iphone-app-design-essentials-2025-crafting-clarity-depth-trust)
- [Medium — 2025 mobile design innovations (Expressive motion)](https://medium.com/@uidesign0005/the-next-wave-of-mobile-apps-2025-design-innovations-a229b7690bb6)
- [Eleken — Trusted fintech UI examples](https://www.eleken.co/blog-posts/trusted-fintech-ui-examples)
- [ProCreator — Best fintech UX practices 2026](https://procreator.design/blog/best-fintech-ux-practices-for-mobile-apps/)
- [DesignStudio — Fintech UX trends 2025](https://www.designstudiouiux.com/blog/fintech-ux-design-trends/)
- [ProCreator — Design patterns that boost retention](https://procreator.design/blog/mobile-app-design-patterns-boost-retention/)
- [Plotline — Streaks & milestones gamification](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)
- [Ironhack — Secrets behind Snapchat's UI](https://www.ironhack.com/gb/blog/the-secrets-behind-snapchat-s-engaging-and-user-friendly-ui)
- [Bootcamp/Medium — Snapchat's intuitive UX (and its nav criticism)](https://medium.com/design-bootcamp/snapchats-intuitive-ux-redefining-communication-through-innovative-design-6bf1ef4da617)
