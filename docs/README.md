# VaultMiles Documentation

Reference material backing the data that powers the calculator. Keep these in
sync with the code constants whenever rates or coverage change.

| Doc | Covers | Source of truth in code |
|-----|--------|--------------------------|
| [rewards-catalog.md](./rewards-catalog.md) | The bank rewards programs that convert to KrisFlyer — ratios, minimums, fees, sources, confidence | `src/data.js` `CATALOG` + `mobile/constants/catalog.ts` |
| [award-chart.md](./award-chart.md) | KrisFlyer redemption (destination) coverage, directionality plan, favourites | `src/data.js` `DESTINATIONS` + `mobile/constants/destinations.ts` |
| [design-overhaul.md](./design-overhaul.md) | Living design system + phased redesign plan (owned by `/design-vaultmiles`) | `src/theme.js` + `mobile/constants/theme.ts` (`T.*` tokens) |
| [design-tasks.md](./design-tasks.md) | Ordered execution queue for the design overhaul (run one at a time) | — (tracker) |

## How to keep these current

1. **Code is the source of truth, docs are the provenance.** Every `CATALOG`
   entry carries `source`, `asOf`, and `confidence`. When you change a rate,
   update the entry *and* the matching row in `rewards-catalog.md` (and bump
   `asOf`).
2. **Cross-platform parity is mandatory** (see `CLAUDE.md`). Any change to
   `src/data.js` must be mirrored in `mobile/constants/catalog.ts` /
   `destinations.ts`, and vice versa.
3. **Re-verify low/medium-confidence rows first.** The "Open verification
   items" section in each doc lists what still needs a primary-source check.
4. Run `/pm-vaultmiles` then `/qa-vaultmiles` before shipping any data change.

_Last updated: 2026-06-17._
