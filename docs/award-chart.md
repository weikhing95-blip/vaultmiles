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
| **Tier naming** | ⚠️ Verify "Saver / Advantage / Access" are still the current KrisFlyer tier names — SQ has restructured redemption tiers before. A wrong tier label invalidates every value beneath it. |
| **Values verified** | ❌ Not yet verified against the live KrisFlyer award chart (this is the destinations equivalent of the rewards-catalog verification pass). |
| **Directionality** | One-way, SIN-origin only. |

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
(KrisFlyer Saver round-trip = 2× one-way). This covers the common "return home"
case at near-zero data cost. Genuine non-SIN origins (curated real SQ routes /
5th-freedom hops) only if demand appears later — never an N×M grid. The full
partner-award chart is out of scope (separate product).

### Favourites — planned (user data)
Let users favourite specific routes and see miles-needed at a glance, ideally
cross-referenced with their balance ("you have 60% of this").

Requirements locked by PM:
- **Forward-compatible key:** store the full route spec —
  `origin + destination + cabin + tier` — even though origin is fixed to SIN
  today, so adding origins later doesn't break saved favourites.
- User data → Supabase table + RLS policy; full acceptance gate applies:
  explicit empty state ("No favourites yet — tap ♥ on any route"), zero-state
  for new users, no demo seeding, cross-device sync, human-readable errors,
  web/mobile parity.

## Proposed sequence

1. **Verify + source** the SIN award chart and **close the 12→26 web/mobile
   parity gap** (apply same `source`/`asOf` provenance discipline as the
   rewards catalog).
2. **Favourites** (user data, full gate) with the forward-compatible key and
   bidirectional / round-trip display.
3. **Curated non-SIN origins** — only if demand shows. No matrix.

## Open verification items

- [ ] Reconcile web (12) and mobile (26) destination lists into one verified set.
- [ ] Confirm current KrisFlyer tier structure & names (Saver/Advantage/Access).
- [ ] Verify miles values per destination/cabin/tier against the live chart.
- [ ] Decide canonical region groupings and add `source`/`asOf` to destinations.
