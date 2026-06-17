# Rewards Catalog — Bank Points → KrisFlyer Conversion

The programs VaultMiles can convert into KrisFlyer miles, with sourced rates.
Backs the `CATALOG` constant in `src/data.js` and `mobile/constants/catalog.ts`.

**Verified:** 2026-06-17 · **Coverage:** the tables below are a dated snapshot; `CATALOG` is the source of truth for the live program set (don't rely on a fixed count).

## Calculation model

A holding's miles are computed by `convertSource` (`src/utils.js`):

```
if (points < min) → 0 miles
blocks   = floor(points / blockPts)
miles    = blocks × blockMiles
fee      = blocks > 0 ? fee : 0          (SGD, flat per conversion)
stranded = points − blocks × blockPts
```

- `min` — minimum points before any conversion is allowed (the gate).
- `blockPts` / `blockMiles` — the recurring conversion block. `min` and
  `blockPts` are **separate fields**, so a program whose first-conversion
  minimum differs from its recurring increment is already expressible
  (e.g. HSBC: full 30,000 block first, then top-ups).

## Verified programs

| id | Bank | Program | Ratio | min | block (pts→mi) | Fee (S$) | Conf. | Notes |
|----|------|---------|-------|-----|----------------|----------|-------|-------|
| krisflyer | Direct | KrisFlyer Miles | 1:1 | 0 | 1→1 | 0 | high | Already in account |
| dbs | DBS | DBS Points | 2:1 | 5,000 | 5,000→10,000 | 27.25 | high | Altitude points never expire |
| uob | UOB | UNI$ | 2:1 | 5,000 | 5,000→10,000 | 27.00 | high | Fee raised S$25→S$27 on 15 Dec 2025; UNI$ expire ~2 yrs |
| ocbc90n | OCBC | 90°N / Travel$ | 1:1 | 1,000 | 1,000→1,000 | 25.00 | high | **S$25 fee since 1 Feb 2023** (was modelled as free) |
| ocbcd | OCBC | OCBC$ (Rewards/Premier VI) | 2.5:1 | 25,000 | 25,000→10,000 | 25.00 | high | |
| citytyp | Citi | ThankYou Points | 2.5:1 | 25,000 | 25,000→10,000 | 27.25 | high | |
| citimiles | Citi | Citi Miles (PremierMiles) | 1:1 | 10,000 | 1→1 | 27.25 | high | **Min is 10,000 block** via Citi app (was 1,000) |
| hsbc | HSBC | Reward Points | 3:1 | 30,000 | 3→1 | 0 | high | 2.5:1→3:1 on 16 Jan 2025; first transfer = full 30k block |
| sc1 | Std Chartered | 360° Tier 1 (Beyond/Journey/VI) | 2.5:1 | 25,000 | 25,000→10,000 | 27.25 | high | |
| sc2 | Std Chartered | 360° Tier 2 (Smart/Rewards+) | 3.45:1 | 34,500 | 34,500→10,000 | 27.25 | high | |
| amex | Amex | Membership Rewards | 2.2:1 | 1,000 | 11→5 | 0 | high | **Devalued to 2.2:1 (550:250) on 23 Feb 2026** for generic cards; Platinum Charge stays 2:1 |
| maybank | Maybank | TREATS Points | 2.5:1 | 25,000 | 25,000→10,000 | 27.25 | high | **3 values corrected**: was 5,000 / 5:1 / S$30. TREATS SG app rate |

## Newly added programs (2026-06-17)

| id | Bank | Program | Ratio | min | block (pts→mi) | Fee (S$) | Conf. | Notes |
|----|------|---------|-------|-----|----------------|----------|-------|-------|
| boc | BOC | BOC Elite Miles (BOC Points) | 5:1 | 50,000 | 50,000→10,000 | ~30 | medium | Elite Miles card; other BOC reward cards 6:1. Effective 1 Jul 2025 |
| cimb | CIMB | CIMB Bonus Points | 15:1 | 75,000 | 75,000→5,000 | 0? | low | Launched ~Oct 2024. **Fee unconfirmed** (likely free) |
| diners | Diners Club | DCS Club Rewards | 4.5:1 | 4,500 | 4,500→1,000 | 0? | low | **Min & fee unconfirmed** — only the 4.5:1 ratio corroborated |
| ntuclink | NTUC Link | LinkPoints (via Link Rewards) | 2:1 | 1,500 | 2→1 | 0 | medium | Flat 2:1 since 8 Jul 2025. The KrisFlyer path for **Trust Bank** cardholders. **Min unconfirmed** |

### Modelling notes
- **Amex 2.2:1** is represented as `blockPts: 11, blockMiles: 5` (= 11/5 = 2.2)
  to keep fine granularity. Platinum Charge holders (2:1) are a minority and
  are flagged in the note rather than split into a second row. Revisit if a
  card-level layer is built.
- **NTUC LinkPoints** is an *intermediary* currency (NTUC Link Rewards), not a
  bank card program. It is the only KrisFlyer route for Trust Bank cardholders,
  hence inclusion. Labelled "via Link Rewards".

## Ruled out (do NOT add)

| Candidate | Reason |
|-----------|--------|
| **RHB Singapore** | No retail credit-card product in SG; all "RHB → KrisFlyer" references are RHB **Malaysia**. High-confidence negative. |
| **Trust Bank** | No proprietary points currency — its cards earn NTUC LinkPoints, which is already covered via `ntuclink`. |
| **GXS Bank** | Gamified instant cashback, no points currency, no KrisFlyer path. |
| **MariBank** | No reward-points-to-KrisFlyer conversion found. |
| **BigPay** | Malaysia-centric; no SG KrisFlyer path. |

## Co-brand cards that earn KrisFlyer DIRECTLY (labelling only, not rows)

These credit KF miles straight to the account (no conversion, no fee) and
collapse into the `krisflyer` direct entry:
UOB KrisFlyer Card · Amex Singapore Airlines KrisFlyer Credit Card · Amex
KrisFlyer Ascend · Amex PPS / Solitaire PPS Credit Cards · Maybank Horizon
(positioned as a direct-miles card; its TREATS feed the `maybank` row).

## Open verification items (re-check against primary T&C)

- [ ] **CIMB** conversion fee (currently `0`, unconfirmed)
- [ ] **Diners Club** minimum and fee (only ratio confirmed)
- [ ] **NTUC LinkPoints** exact minimum / block (ratio + free confirmed)
- [ ] **BOC** non-Elite card ratio (6:1) and exact fee (S$30 vs S$30.56 incl GST)
- [ ] Spot-check all `high` rows against the banks' own T&C PDFs in a browser —
      primary sources (bank PDFs, SQ partner page) were access-blocked during
      automated research; figures came from cross-referenced secondary sources
      (MileLion, Mainly Miles, SingSaver, Refined Points).

## Methodology

Rates gathered Jun 2026 via multiple independent SG miles sources and
cross-checked for agreement. Each `CATALOG` entry stores its `source` URL,
`asOf` date, and a `confidence` rating. GST on conversion fees rose 8%→9% on
1 Jan 2024, so the current "S$27.25" figure reflects 9% GST.
