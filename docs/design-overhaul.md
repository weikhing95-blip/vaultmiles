# VaultMiles Design Overhaul — System Redesign Plan

Owned by `/design-vaultmiles`. This is the **living design-system doc**: when the
system changes, update this file + the tokens (`src/theme.js`,
`mobile/constants/theme.ts`) and nothing else should need editing.

**North star:** design so good and so consistent that a Singapore frequent flyer
*wants* to open VaultMiles again tomorrow. Beauty in service of retention.

---

## 1. Honest critique of where we are

The current look is genuinely premium — dark canvas, gold accent, Cormorant
serif. That equity is worth keeping. What's holding it back:

| Issue | Why it hurts retention |
|---|---|
| **No spacing / radius / motion / elevation scale.** Padding (`"14px 16px"`), radii (`12`, `14`, `999`), and durations (`0.3s`) are hardcoded ad-hoc per component. | Inconsistent rhythm reads as "unfinished"; every new screen reinvents spacing → drift. The #1 system gap. |
| **Three font families** (serif display + Inter + JetBrains Mono), mono used heavily for labels/numbers. | Mono everywhere feels "dashboard/technical," not delightful-consumer. Fine for figures, overused for UI chrome. |
| **Mostly static.** One `width 0.3s` transition; no entrance, no feedback, no celebration. | Nothing rewards the user for opening or acting → no habit hook. This is the biggest Snap-shaped gap. |
| **Flat depth.** Single surface + border everywhere; weak layering. | Hierarchy relies on borders alone; the hero number doesn't feel as special as it should. |
| **No engagement loop.** Track balance → … → nothing. No streak, no milestone, no reason to return between conversions. | Miles balances change slowly; without a loop, weekly/monthly opens decay. |
| **Empty/loading states are thin.** | First-run and slow-network moments are where new users churn. |

Verdict: the *aesthetic* is strong; the *system* and the *engagement layer* are
underbuilt. This overhaul keeps the soul, adds the skeleton and the hook.

## 2. What we borrow — and what we refuse

**From Meta (rigor & clarity):**
- A real token system: spacing, radius, elevation, motion — not just color/type.
- Component library with strict states (default/pressed/disabled/loading).
- Accessibility as a gate (contrast, 44pt targets, large-type, screen readers).
- Motion that *orients* — shared-element and directional transitions.

**From Snap (speed, delight, return-to-app):**
- Sub-second perceived speed; optimistic UI; gesture-friendly, thumb-first.
- Signature micro-interactions and a genuine celebratory moment.
- Engagement loop: streaks, milestones, progress that pulls the next open.

**What we deliberately do NOT copy (this is finance):**
- ❌ Snap's visual noise, neon chrome, ephemerality, face filters, social/feed.
- ❌ Aggressive gamification that cheapens money (no confetti on every tap, no
  slot-machine patterns, no dark patterns to inflate "engagement").
- ❌ Meta's density/ad surfaces. We stay calm, spacious, trustworthy.
- Rule: **delight amplifies trust, never competes with it.** A celebration is
  earned (you can now afford a flight), not random.

## 3. The redesign system

### 3.1 Color (evolve, don't replace)
Keep the dark-premium + gold identity. Add the missing semantic layers:
- **Elevation surfaces:** formalize `bg → surface → surfaceHi → hover` as an
  elevation ramp (0–3) and add soft shadows for true depth (today depth is
  border-only).
- **Accent discipline:** gold = reward/primary only (one primary action per
  screen). Stop using gold for incidental chrome so the "you can fly" gold moment
  stays special.
- **Semantic tokens:** add intent names (`success`/`warning`/`info`) mapping to
  existing `good`/`warn` + a new info hue, so components reference intent, not raw color.
- **Light mode:** out of scope for v1 of the overhaul (dark is the brand); design
  tokens should be structured so it's addable later without a rewrite.

### 3.2 Typography
- **Keep** Cormorant (display) for *moments* — the hero number, big screen titles.
- **Promote** Inter to the default for all UI text and labels.
- **Demote** JetBrains Mono to **numbers/figures only** (balances, miles, fees) —
  tabular, aligned. Remove mono from labels/captions.
- Define a fixed **type scale** token set (display / title / heading / body /
  caption / overline) with paired size + line-height + weight. No more per-component font sizes.

### 3.3 Spacing, radius, elevation (the big rigor win)
Add scale tokens to `T.*` (and mirror to mobile):
- **Spacing:** 8pt grid — `space.1=4, .2=8, .3=12, .4=16, .5=20, .6=24, .8=32, .10=40`.
- **Radius:** `radius.sm=8, .md=12, .lg=16, .pill=999`.
- **Elevation:** `e0` flat → `e3` modal, each a (surface + shadow) pair.
- Every component consumes these; zero raw numbers in component code.

### 3.4 Motion
Add motion tokens: durations (`fast=120ms, base=220ms, slow=360ms`) and easing
(standard, decelerate, spring-for-celebration). Signature motions:
- **List entrance:** staggered fade-up (cards, destinations).
- **Tab change:** quick cross-fade/slide, directional.
- **Value change:** miles count-up animation when balance updates.
- **Celebration:** a single tasteful spring + gold shimmer when a destination
  becomes reachable. All motion respects `prefers-reduced-motion`.

### 3.5 Component library (canonical, both platforms)
Buttons (primary/secondary/ghost), Card/Surface (elevation-aware), Input/Search,
BottomSheet, SegmentedControl, Chip/Pill, ProgressBar/Ring, TabBar, Toast,
Badge, EmptyState, Skeleton (loading), StatHero. Each: documented states,
token-only styling, web + mobile implementations kept in parity.

## 4. Navigation & IA
- Keep the **4 tabs** (Cards, Fly, History, Settings) — the mental model is right.
- Rename for clarity of value, not feature: consider **Wallet · Fly · Progress ·
  You** (validate with PM). Cards→Wallet (it's your miles, not just cards);
  History→Progress (forward-looking, retention-positive).
- **Tab bar** redesign: larger thumb targets, active state uses the gold accent +
  subtle motion, floating elevated bar on mobile.
- **Home moment:** the Wallet tab opens on a **StatHero** (total KrisFlyer miles,
  count-up animated) — the single most important number, the reason they opened.

## 5. Screen-by-screen direction

**Wallet (Cards):** StatHero total on top (count-up); cards as an elevated,
swipeable stack with clear per-card miles + stranded + fee; primary action "Add
card" uses the search picker we just shipped. Empty state: warm first-run that
guides to add the first card (no demo data).

**Fly:** lead with "where can I fly *right now*" (reachable first, celebratory
treatment for newly-reachable). Favourites (♥ Saved) promoted near the top.
Progress rings instead of thin bars. Keep the SQ-metal/award caveats honest
(ties to the paused award-chart work).

**Progress (History):** make the trend the hero — a beautiful chart, monthly
snapshot **streak**, and milestone markers. This tab becomes the retention
engine, not an archive.

**You (Settings):** calm, grouped, human. Conversion-rate editor becomes a clean
list with provenance (`source`/`asOf`/`confidence`) surfaced — trust on display.

**Onboarding & empty/loading states:** a short, premium first-run (value prop →
add first card → see hero). Every list gets a designed empty state, skeleton
loaders (not spinners) for perceived speed.

## 6. Retention / engagement loops (the Snap lesson, finance-appropriate)
- **Snapshot streak:** reward logging a monthly balance snapshot (gentle, monthly
  cadence — not daily-guilt). Visualized in Progress. Hypothesis: a streak gives a
  reason to return between conversions.
- **Milestone celebration:** when total miles cross a destination threshold ("You
  can now fly Business to Tokyo"), a single earned, tasteful celebration moment.
- **Progress to next reward:** always show "X% to your next destination/favourite"
  — concrete forward pull.
- **Expiry nudges:** tie into backlog miles-expiry tracking + push notifications —
  the highest-intent reason to re-open.
- Guardrail: every loop must pass the PM "no dark patterns" and Design "earns
  trust" bars.

## 7. Accessibility (gate, not afterthought)
WCAG AA contrast on every token pair (re-check gold-on-dark and `faint` text);
≥44×44pt targets; full large-type support; screen-reader labels on icon buttons
and the heart/favourite control; never signal state by color alone (pair with
icon/label); honor reduce-motion.

## 8. Phased rollout (each phase gated by PM + QA + Design)

> **Execution queue:** see [`design-tasks.md`](./design-tasks.md) — this plan
> broken into ordered, one-at-a-time tasks with dependencies and gates.

| Phase | Scope | Exit criteria |
|---|---|---|
| **P0 — Foundation** | Add spacing/radius/elevation/motion + type-scale tokens to `theme.js` + `theme.ts`; no visual change yet beyond consistency. | Tokens in both platforms; one screen refactored to prove the system. |
| **P1 — Component library** | Build canonical components on the tokens; migrate screens to them. | All 4 tabs use shared components; zero hardcoded style values in migrated screens. |
| **P2 — Screens & motion** | Apply screen-by-screen direction + signature motion + skeletons + empty states. | Each screen passes the 8 design criteria; reduce-motion verified. |
| **P3 — Retention loops** | Streak, milestone celebration, progress-to-next, expiry nudges. | Loops pass PM no-dark-pattern + Design earns-trust gates; QA cross-device. |

Sequencing rule: **no screen restyle before its tokens/components exist** (P0→P1
before P2). Cross-platform parity holds at every phase.

## 9. Success metrics (tied to the goal)
- **D7 / D30 retention** and **weekly open frequency** (primary).
- Snapshot-streak adoption; favourite usage; time-to-first-card (onboarding).
- Qualitative: "feels premium / trustworthy / delightful" in user feedback.
- Counter-metric: no rise in mis-taps or accessibility complaints; trust intact.

## 10. How to extend this doc
Add new components/patterns/decisions here as they're built (one place). When a
token changes, change it in `theme.js` + `theme.ts` and reference it here — never
restate raw values in this doc. Counts and lists derive from code, per
`CLAUDE.md` → Documentation principles.
