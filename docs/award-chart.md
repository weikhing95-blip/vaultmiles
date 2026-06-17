# Award Chart — KrisFlyer Redemption Coverage (Destinations)

Backs the `DESTINATIONS` constant in `src/data.js` and
`mobile/constants/destinations.ts`. KrisFlyer award costs (one-way miles) by
destination, redemption tier, and cabin.

**Last reviewed:** 2026-06-17 · **Chart vintage in app:** "KrisFlyer Nov 2025"

## Current model

```
{ city, country, region,
  miles: { saver, advantage, access } × { eco, premEco, biz, first } }
// null = cabin/tier not available
// premEco has no advantage tier
```

Origin is **implicitly Singapore (SIN)** — every route is SIN → destination,
one-way.

## Known state & gaps

| Item | Status |
|------|--------|
| **Web/mobile parity** | ❌ `src/data.js` has **12** destinations; `mobile/constants/destinations.ts` has **26**. Must reconcile (backlog T1-2). |
| **Tier model** | ❌ **WRONG as built** — see finding below. App models Saver/Advantage/Access as three *fixed* chart tiers. As of Nov 2025 that's no longer accurate. |
| **Values verified** | ❌ Stale + unverified. A **major KrisFlyer devaluation on 1 Nov 2025** reset Saver/Advantage; any pre-Nov values are wrong. Automated research could not read the official chart (all primary sources 403-blocked). |
| **Directionality** | One-way, SIN-origin only (today). |

## ⚠️ Tier-structure finding (2026-06-17 verification) — blocks value edits

The current KrisFlyer award structure is **four types**, not three fixed tiers:

| Type | Nature | In app? |
|------|--------|---------|
| **Promo** | Promotional discounts (e.g. Spontaneous Escapes) | ❌ not modelled |
| **Saver** | Fixed zone-based chart | ✅ correct |
| **Advantage** | Fixed zone-based chart (~15–20% above Saver) | ✅ correct |
| **Access** | **Dynamic** "guaranteed seat" award (~2–3× Saver), launched Nov 2025, already re-priced Mar/Apr 2026 | ⚠️ **modelled as a fixed value — structurally wrong** |

Implications before we touch destination values:
- **`access` cannot be a static per-route number.** It is dynamic and drifts.
  Options: drop it, relabel as "from ~2–3× Saver (dynamic)", or compute as a
  multiplier with a clear disclaimer. **PM decision required.**
- **All Saver/Advantage values must be re-checked against the official
  1 Nov 2025 chart** before edits — current values predate the devaluation.
- **PremEco has no Advantage tier** — the app's existing assumption is
  *confirmed* (medium confidence).
- **Verification is blocked on a primary source.** Every official/blog source
  was 403-blocked to automated fetch; values must be captured manually from the
  official SQ PDF / a live award search. **Do not ship automated-snippet values
  for a financial calculator.**
- **Partner-award caveat:** all chart values are SQ-metal only. Star Alliance
  partner awards use a different chart — never apply these numbers to partner
  flights. (Also: SQ A380 Suites don't fly to the US, so US First is largely
  unbookable regardless of chart value.)

## Direction decisions (PM-gated)

### Destination-to-destination — REFRAMED, not a full matrix
A full any-origin→any-destination matrix was **rejected**:
- SQ is hub-and-spoke through Singapore — most non-SIN pairs don't exist on SQ
  metal; they'd be **Star Alliance / partner awards** priced on a *different*
  chart. Mixing charts in one model is an accuracy hazard.
- ~650 ordered pairs × 3 tiers × 4 cabins ≈ 7,800 unmaintainable, unsourceable
  values.
- Off-target for the Singapore frequent flyer, who departs SIN.

**Chosen approach: bidirectional + round-trip.** Treat SIN routes as
bidirectional (X→SIN = reverse of SIN→X) and surface round-trip pricing
(round-trip = 2× one-way). This covers the common "return home" case at
near-zero data cost. Genuine non-SIN origins (curated real SQ routes /
5th-freedom hops) only if demand appears later — never an N×M grid. The full
partner-award chart is out of scope (separate product).

**Verified (2026-06-17):** KrisFlyer Saver/Advantage are symmetric/zone-based
(X→SIN = SIN→X) and round-trip = 2× one-way — so the model is sound **for the
fixed tiers**. ⚠️ It does **not** hold for **Access** (dynamic, priced
per-segment), which is another reason Access can't be a static value. Note a
round-trip Saver includes one free stopover that one-way doesn't (a perk
difference, not a price difference).

### Favourites — IMPLEMENTED (pending migration + live verification)
Users favourite specific routes (♥ on any route in the Fly tab) and see them
in a "♥ Saved" view, each with its own cabin/tier/trip and miles-needed.

How it was built (web + mobile parity):
- **Forward-compatible key** (`favKey` in `src/utils.js` / `mobile/lib/storage.ts`):
  `origin|city|cabin|tier|trip` — origin fixed "SIN" today, so adding origins
  later won't break saved favourites.
- Stores the route **spec only**, never the miles — miles stay derived from
  `DESTINATIONS`, so favourites auto-correct when the chart is updated.
- Supabase table + RLS in `supabase/migrations/0001_favourites.sql`.
- Empty state ("No favourites yet — tap ♡ on any route"); favourites start at
  zero for new users; no demo seeding; optimistic toggle with rollback (web
  shows a toast on failure). `getFavourites` returns `[]` if the table is
  missing, so the app never crashes pre-migration.

**Before this counts as DONE:**
- [ ] Run `supabase/migrations/0001_favourites.sql` on the project.
- [ ] Cross-device verification (sign in on a 2nd browser → favourites appear).
- [ ] Note: favourites display current (paused/unverified) chart values until
      the award chart is refreshed — mechanics are value-independent.

## Status: PAUSED (2026-06-17)

Destinations work is paused pending the official **1 Nov 2025** Saver/Advantage
chart, which must be supplied manually (automated research is 403-blocked on all
primary sources). Decisions locked for when we resume:

- **Access tier → dynamic multiplier.** Do not store fixed Access values. Show
  "from ~2–3× Saver (dynamic)" computed off Saver, with a disclaimer.
- **Values:** to be encoded from the official chart the user supplies; until
  then, treat existing web/mobile values as unverified / pre-Nov-2025.

## Proposed sequence (on resume)

1. ~~Resolve the `access` tier~~ — **decided: dynamic multiplier off Saver.**
2. Encode official 1 Nov 2025 Saver/Advantage values (user-supplied), then
   **verify + source** the SIN chart and **close the 12→26 web/mobile parity
   gap** with `source`/`asOf` provenance.
3. **Favourites** (user data, full gate) with the forward-compatible key and
   bidirectional / round-trip display. Needs a Supabase table + RLS migration.
4. **Curated non-SIN origins** — only if demand shows. No matrix.

## Open verification items

- [x] **PM decision:** Access tier → dynamic multiplier off Saver (no fixed value).
- [ ] Capture official 1 Nov 2025 Saver/Advantage values from the SQ PDF /
      live award search (primary source — not automated snippets). **Blocks resume.**
- [ ] Reconcile web (12) and mobile (26) destination lists into one verified set.
- [x] Confirm tier structure — done: Promo/Saver/Advantage/**Access (dynamic)**;
      PremEco has no Advantage (confirmed).
- [ ] Verify miles values per destination/cabin/tier against the live chart.
- [ ] Decide canonical region groupings and add `source`/`asOf` to destinations.
