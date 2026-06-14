# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

VaultMiles — Singapore KrisFlyer miles tracker. Tracks bank reward point balances, converts them to KrisFlyer miles, and shows redemption options. Data is synced to Supabase per authenticated user.

**Goal:** Be the best KrisFlyer miles calculator for Singapore frequent flyers — polished, accurate, trustworthy, and delightful.

## Dev commands

```bash
# Web (root)
npm install
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # production build
vercel --prod --yes  # deploy to production

# Mobile
cd mobile && npm install
npx expo start   # Expo dev server
```

No test or lint commands are configured.

## Architecture

**Web:** `src/App.jsx` (auth shell + AppShell) → tabs in `src/tabs/` → components in `src/components/`
- `src/supabase.js` — Supabase client (uses `VITE_SUPABASE_*` env vars)
- `src/storage.js` — all Supabase read/write for holdings, snapshots, catalog overrides
- `src/utils.js` — pure utilities (convertSource, fmt, uid, etc.) + OCR proxy call
- `src/data.js` — CATALOG (12 bank programs) + DESTINATIONS (award chart)

**Mobile:** `mobile/app/` (Expo Router file-based) → `(auth)/login.tsx` + `(tabs)/` screens
- `mobile/lib/supabase.ts` — Supabase client (uses `EXPO_PUBLIC_*` env vars)
- `mobile/lib/storage.ts` — all Supabase read/write (same pattern as web storage.js)
- `mobile/hooks/useAuth.ts` — session management, signUp/signIn/logout
- `mobile/hooks/useHoldings.ts` — holdings/snapshots/catalog state, reloads on auth change
- `mobile/context/holdings.tsx` — HoldingsProvider wrapping all 4 tabs (shared state)
- `mobile/constants/catalog.ts` — CATALOG (12 programs) + BANK_TO_ID + BANK_COLORS
- `mobile/constants/destinations.ts` — 26 destinations (award chart)

## Design tokens

All colors and fonts live in `src/theme.js` (web) and `mobile/constants/theme.ts` (mobile). Always reference `T.*` — never hardcode hex values or font strings.

```js
T.bg / T.surface / T.surfaceHi / T.hover  // backgrounds
T.border / T.borderHi                      // borders
T.gold / T.goldSoft / T.goldDim            // accent
T.ink / T.mist / T.faint                   // text hierarchy
T.good / T.goodDim                         // success
T.warn / T.warnDim                         // warning
T.display / T.body / T.mono                // fonts
```

Web uses inline style objects. Mobile uses `StyleSheet.create`.

## Data constants

**`CATALOG`** — one entry per bank rewards program:
```js
{ id, bank, name, min, blockPts, blockMiles, fee, note }
// min: minimum points to convert
// blockPts / blockMiles: points consumed / miles awarded per conversion block
// fee: SGD fee per conversion (0 = free)
```
Rates as of June 2026. Must be kept in sync between `src/data.js` and `mobile/constants/catalog.ts`.

**`DESTINATIONS`** — KrisFlyer award chart from Singapore (one-way miles):
```js
{ city, country, region,
  miles: { saver, advantage, access } × { eco, premEco, biz, first } }
// null = cabin/tier not available
// premEco has no advantage tier
```
Must be kept in sync between `src/data.js` and `mobile/constants/destinations.ts`.

## Storage (Supabase)

All user data lives in Supabase. Tables: `profiles`, `holdings`, `snapshots`, `catalog_overrides`.

- `saveHoldings` / `saveSnapshots` / `saveCatalog` use a **read-backup → delete → insert → rollback-on-failure** pattern to prevent data loss.
- Holdings `uid` is a short random string (`Math.random().toString(36).slice(2,9)`) stored as a text column in Supabase.
- New users start with **zero holdings** — no demo data is seeded. Empty state guides them to add their first card.
- Supabase requires: trigger `on_auth_user_created` (auto-creates profile row), RLS policies (SELECT/UPDATE/INSERT) on `profiles`.

## Auth flow

- Web: `supabase.auth.signUp()` → write profile directly → `onAuthStateChange` → `buildProfile()` → render AppShell
- Mobile: `useAuth.signUp()` → write profile → `onAuthStateChange` sets user → `HoldingsProvider` reloads data
- Logout (web): `supabase.auth.signOut()` + clear localStorage keys → user reset
- Email confirmation: if Supabase requires it, show "Check your inbox" state; `sessionStorage` holds pending name/kf until confirmed

## OCR proxy

Anthropic API calls go through `api/ocr.js` (Vercel serverless) — never directly from the browser. `ANTHROPIC_API_KEY` is a server-side Vercel env var only.

---

## QA & PM Standards

> These standards exist because bugs that reach users — especially on the new-user first experience — destroy trust in a financial tracking app. QA and PM are the last line of defence.

### Non-negotiable QA checklist (run before every deploy)

**New user journey (highest priority — test this first, every time)**
- [ ] Sign up with a fresh email → lands on Cards tab with **zero cards, zero miles** — no demo data, no leftover data from any other session
- [ ] Name entered during sign-up appears correctly in the header (not "Traveller" or blank)
- [ ] KF number entered during sign-up appears in the badge (or "No KF # set" if omitted)
- [ ] Add first card → balance persists after page refresh
- [ ] History snapshot saves and persists after page refresh
- [ ] Sign out → sign back in → same data appears (cross-session sync)

**Auth edge cases**
- [ ] Sign in with wrong password → clear error message, not a crash
- [ ] Sign up with an already-registered email → clear error ("User already registered"), not a blank screen
- [ ] Sign out on web → sign in as a different user → no data from the previous user is visible

**Data integrity**
- [ ] Remove a card → refreshing does not bring it back
- [ ] Edit a balance → refreshing shows the edited value, not the original
- [ ] Rate override in Settings → persists after refresh and shows updated miles calculation

**Calculation accuracy**
- [ ] Verify miles math for at least one card: `floor(balance / blockPts) × blockMiles`
- [ ] Verify fee: flat fee only when `balance >= min`, zero otherwise
- [ ] Verify stranded points: `balance mod blockPts`

**Cross-platform parity**
- [ ] Any new bank program added to web `data.js` must also be added to mobile `catalog.ts` (and vice versa)
- [ ] Any new destination added to web `data.js` must also be added to mobile `destinations.ts`
- [ ] Settings About section must list all programs in the catalog

### PM acceptance criteria (required before marking any feature "done")

1. **Define the empty state** — every feature that shows a list must specify what appears when that list is empty. No feature ships without an explicit empty state.
2. **Define the new-user state** — every feature must be verified from a freshly created account. "It works for my existing account" is not acceptance.
3. **No fake/demo data in production** — demo data is only acceptable in a pre-auth prototype. Once auth exists, all data must be real user data.
4. **Error messages are human-readable** — Supabase/API error strings (e.g. "new row violates row-level security policy") must never be shown verbatim to users.
5. **Copy is final** — placeholder text (developer names, hardcoded emails, "TODO") must be replaced before deploy.
6. **Cross-device verified** — any feature touching data persistence must be tested by signing in on a second browser/device and confirming data appears.

### Common failure patterns to watch for

| Pattern | What goes wrong | Prevention |
|---|---|---|
| Demo seeding in authenticated app | New users see fake data they didn't enter | Never seed demo data when a user session exists |
| Profile write blocked by RLS | Name not saved; user sees fallback display name | Always test sign-up with a fresh email; check name appears in header |
| `throw` on non-critical write | Auth blocked by profile/secondary write failure | Separate critical auth errors from non-critical profile errors |
| localStorage not cleared on logout | Next user on same browser sees previous user's cards | Test: logout → sign in as different user → verify clean state |
| Race condition between auth event and state write | Data written before auth context is ready | Write profile directly in signUp handler, not via async side-effect |
| delete-then-insert without rollback | Network failure between steps leaves user with zero data | Use backup-read → delete → insert → rollback pattern |

## Backlog

- Miles expiry tracking (per-card expiry date, warning when < 6 months)
- Kris+ routing toggle (fee comparison)
- Destination coverage expansion (26 → 70+ SQ routes)
- Per-bank breakdown in History snapshots
- EAS Build → TestFlight
- Apple / Google Sign-In (after TestFlight)
- Backend rates sync
- Push notifications for miles expiry

## Skill Routing

**MANDATORY**: For any enhancement, new feature, or backlog item discussed, ALWAYS spawn both agents before proceeding:

- `/pm-vaultmiles` — reviews requirement against the /goal and 7 PM acceptance criteria, defines empty states and edge cases, gates the feature
- `/qa-vaultmiles` — runs the full QA checklist end-to-end, finds and fixes bugs, logs learnings

These are not optional. PM and QA are the gatekeepers. No feature is considered "done" until both have signed off. If either agent finds a blocker, fix it before moving on.

Routing rules:
- Feature request / enhancement / "let's add X" → invoke `/pm-vaultmiles` first, then `/qa-vaultmiles` after implementation
- Bug report → invoke `/qa-vaultmiles` directly
- Pre-deploy / pre-ship → invoke `/qa-vaultmiles` for full checklist run
- Backlog prioritization / "what's next" → invoke `/pm-vaultmiles`
