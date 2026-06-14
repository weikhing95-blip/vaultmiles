# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

VaultMiles — Singapore KrisFlyer miles tracker. Tracks bank reward point balances, converts them to KrisFlyer miles, and shows redemption options. All user data is client-side only.

## Dev commands

```bash
npm install      # install deps
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
```

No test or lint commands are configured.

## Architecture

Currently a single-file React app (`src/App.jsx`). This is evolving toward a multi-component structure — use your judgement on when to extract components into separate files under `src/`.

Entry point: `src/main.jsx` → `src/App.jsx` → renders into `#root`.

## Design tokens

All colors and fonts are defined in the `T` object at the top of `App.jsx`. Always reference `T.*` — never hardcode hex values or font strings elsewhere.

```js
T.bg / T.surface / T.surfaceHi / T.hover  // backgrounds
T.border / T.borderHi                      // borders
T.gold / T.goldSoft / T.goldDim            // accent
T.ink / T.mist / T.faint                   // text hierarchy
T.good / T.goodDim                         // success
T.warn / T.warnDim                         // warning
T.display / T.body / T.mono                // fonts
```

Styling uses inline style objects (no CSS classes, no Tailwind).

## Data constants

**`CATALOG`** — one entry per bank rewards program. Shape:
```js
{ id, bank, name, min, blockPts, blockMiles, fee, note }
// min: minimum points required for a conversion block
// blockPts: points consumed per block
// blockMiles: KrisFlyer miles awarded per block
// fee: SGD fee per block (0 = free)
```
Rates as of June 2026. User can override at runtime via Settings tab (persisted via `saveKey`).

**`DESTINATIONS`** — KrisFlyer award chart from Singapore (one-way miles). Shape:
```js
{ city, country, region,
  miles: { saver: {eco, premEco, biz, first},
           advantage: {eco, premEco, biz, first},
           access: {eco, premEco, biz, first} } }
// null = cabin/tier not available for that route
// premEco has no advantage tier; access = dynamic/approximate
// Source: SQ official chart Nov 2025, Access rates Mar 2026 update
```

## Storage

Uses `window.storage` (Claude.ai artifact API). `loadKey` / `saveKey` in `App.jsx` abstract this.

For standalone deployment, replace those two functions with `localStorage` equivalents (see README for the exact swap).

## Claude Vision API (screenshot OCR)

The app calls `https://api.anthropic.com/v1/messages` from the browser, which browsers block due to CORS. To use locally:

**Option A** — Add a Vite proxy in `vite.config.js` (see README for full config).
**Option B** — Add a small Express/FastAPI proxy that injects the API key server-side.

Never commit an API key to source control.

## Backlog (from README)

- Kris+ routing toggle (haircut vs fee trade-off)
- Apple / Google Sign-In
- Backend rates sync
- Push notifications for miles expiry
- React Native port
