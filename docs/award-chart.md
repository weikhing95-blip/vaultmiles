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

1. **Resolve the `access` tier** (PM decision) — drop / relabel dynamic /
   multiplier-with-disclaimer. Blocks everything else.
2. **Manually capture** the official 1 Nov 2025 Saver/Advantage chart values
   (automated research is 403-blocked; this needs a human/browser pass), then
   **verify + source** the SIN chart and **close the 12→26 web/mobile parity
   gap** with `source`/`asOf` provenance.
3. **Favourites** (user data, full gate) with the forward-compatible key and
   bidirectional / round-trip display.
4. **Curated non-SIN origins** — only if demand shows. No matrix.

## Open verification items

- [ ] **PM decision:** how to model `access` now that it's dynamic (Nov 2025).
- [ ] Capture official 1 Nov 2025 Saver/Advantage values from the SQ PDF /
      live award search (primary source — not automated snippets).
- [ ] Reconcile web (12) and mobile (26) destination lists into one verified set.
- [x] Confirm tier structure — done: Promo/Saver/Advantage/**Access (dynamic)**;
      PremEco has no Advantage (confirmed).
- [ ] Verify miles values per destination/cabin/tier against the live chart.
- [ ] Decide canonical region groupings and add `source`/`asOf` to destinations.
