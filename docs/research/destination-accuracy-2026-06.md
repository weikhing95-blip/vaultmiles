# Destination Accuracy — KrisFlyer Award Chart Re-sourcing

**Research & Insights · 2026-06-18**
**Decision this informs:** Can we trust / re-source the `DESTINATIONS` award-chart
values after the 1 Nov 2025 KrisFlyer devaluation, or must the data model change?
**Verdict:** App values are **likely wrong** post-devaluation, and **cannot be
authoritatively re-sourced with the tools available** (every credible source is
403-blocked to automated fetch, including the official SQ PDF). Recommendation:
ship a **trust disclaimer now**, re-source the chart **manually**, and **change
the Access tier from a fixed value to a dynamic-multiplier display**.

Honesty tags per the research honesty rule: `[measured]` = read directly from a
credible source; `[estimate]` = third-party/snippet figure not read from a primary
chart; `[unknown]` = could not source.

---

## 1. What actually changed on 1 Nov 2025

All confirmed from search-result snippets of reputable frequent-flyer outlets
(see Sources). The award structure was **not** wholly replaced — the fixed Saver/
Advantage charts survived, and a new dynamic tier was added on top.

| Element | What happened | Confidence |
|---|---|---|
| **Saver** | **Survived** as a fixed, zone-based chart. Economy Saver in Zones 1–9 (intra-Asia/SW-Pacific) *cut ~5%*; Business & First Saver *up ~5%*. Europe/US (Zones 11–13) *up ~5%* across all cabins. Zone 10 (Africa/Middle East/Turkey) *up 10–20%*. | `[measured]` (direction); `[estimate]` (exact figures) |
| **Advantage** | **Survived** as a fixed, zone-based chart. *Up ~10–15%* generally; Zone 10 Business +18%, First +15%. | `[measured]` (direction); `[estimate]` (figures) |
| **Access** | **NEW tier, launched 1 Nov 2025. Dynamic pricing** — miles depend on demand/availability, *not* a static chart. Lets members book the last seat when Saver/Advantage are sold out. **Already re-priced** (raised 3–10%) in **Mar 2026**. | `[measured]` |
| **Promo** (Spontaneous Escapes etc.) | Still exists as periodic promo discounts; not a chart tier. | `[measured]` |
| Grace period | Pre-devaluation rates bookable until 31 Oct 2025. Irrelevant now. | `[measured]` |
| Star Alliance / partner chart | Separately devalued (different chart). **Must never be mixed** with SQ-metal values. | `[measured]` |

**Implication for the app's data model:** the three-tier (Saver / Advantage /
Access) labelling is *directionally* still correct, but **Access as a fixed
per-route integer is structurally wrong** — it is dynamic and has already drifted
once (Mar 2026). This confirms the prior 2026-06-17 finding in `docs/award-chart.md`.

---

## 2. Can per-route SIN→destination values be sourced? (No — not with these tools)

The authoritative source exists and is public:

- **Official SQ chart PDF:**
  `https://www.singaporeair.com/content/dam/sia/web-assets/pdfs/ppsclub-krisflyer/krisflyer/progupdates/awardcharts/SingaporeAirlinesOne-WayAdvantageSaverAwardChartupdated1Nov25.pdf`
  — surfaced in search; **`WebFetch` → HTTP 403 Forbidden.**

Every credible secondary source was **also 403-blocked to automated fetch** on
2026-06-18:

| Source | Fetch result |
|---|---|
| Official SQ one-way Saver/Advantage PDF | 403 |
| The MileLion (Access chart, devaluation analysis) | 403 |
| Mainly Miles ("award prices by route" table) | 403 |
| One Mile at a Time | 403 |
| Australian Frequent Flyer | 403 |
| SuiteSmile (award charts breakdown) | 403 |
| SingSaver (SG, Saver vs Advantage) | 403 |
| AwardWallet news | 403 |
| Roame guide | 403 |
| AwardTravelFinder (KL route) | 403 |

Only **WebSearch result snippets** are readable. Those give *zone-level direction*
and a few *route anchors*, but they are model-summarised from snippets, **not read
off a primary chart**, and they came back **internally inconsistent** (see §3).
That is below the bar for a financial calculator.

**Conclusion:** the chart is *publicly verifiable by a human* (open the PDF), but
**not automatically verifiable** in this environment. The blocker is identical to
the 2026-06-17 pass — it is an egress/anti-bot limitation, not a missing source.

---

## 3. Per-destination confidence (12 web destinations in `src/data.js`)

The snippet anchors below **contradict** several current app values, which is the
key trust signal. None are `[measured]` from a primary chart — they are
`[estimate]` at best — so **no value below should be encoded** without manual
confirmation against the official PDF.

| Destination (Saver) | App value (Business, one-way) | Snippet anchor | Delta | Status |
|---|---|---|---|---|
| Kuala Lumpur | 25,000 | ~22,000 Biz; 8,000 Eco | Biz **too high in app** | `[estimate]` conflict |
| Tokyo | 67,500 | ~55,000 Biz | Biz **~12,500 too high in app** | `[estimate]` conflict |
| London | 113,750 | ~112,500–117,000 Biz (SQ metal) | roughly in range | `[estimate]` plausible |
| Bali, Bangkok, Hong Kong, Seoul, Sydney, Melbourne, Paris, New York, Los Angeles | (various) | no clean per-route snippet found | — | `[unknown]` |

Across all 12 destinations × 3 tiers × 4 cabins:

- **`[measured]` from a primary source: 0 of 12 destinations.**
- **`[estimate]` (snippet-level, partial, conflicting): 3** (KL, Tokyo, London) —
  and two of those *disagree* with the app, suggesting the chart is stale.
- **`[unknown]`: 9 of 12.**
- **Access tier: structurally unverifiable** for *all* destinations (dynamic).

This is itself the important finding: **we cannot stand behind the current numbers**,
and the evidence we *can* read suggests at least KL and Tokyo Business Saver are
overstated in the app.

---

## 4. Is the three-fixed-tier data model still correct?

**Partially. Saver + Advantage: yes. Access: no.**

- **Saver / Advantage** — remain fixed, zone-based, symmetric (SIN→X = X→SIN),
  round-trip = 2× one-way. The model holds. PremEco has no Advantage tier
  (confirmed). ✅ keep as fixed integers (once re-sourced).
- **Access** — dynamic, per-segment, demand-priced, already drifted once. A fixed
  per-route integer **misrepresents reality** and will silently rot. ❌

This matches and reinforces the PM decision already recorded in
`docs/award-chart.md` (Access → dynamic multiplier off Saver).

---

## 5. Recommendations (bets, with validation signals)

Trust-first ordering — disclaimer first because it is the only thing that removes
the live trust risk *today* without shipping unverified numbers.

### R1 — Ship an in-app accuracy disclaimer NOW (highest priority, no data change)
> **Bet:** A clear "Award values are indicative — always confirm on
> singaporeair.com before redeeming. Last verified: <date>." line on the Fly tab
> converts a hidden trust risk (silently-wrong numbers) into honest, trusted
> guidance.
- Trust check: ✅ improves honesty; the opposite of a dark pattern.
- Build-on: use existing `T.faint`/`T.mist` caption tokens; no new system.
- **Validation signal:** zero user reports of "the app quoted the wrong miles";
  qualitative trust feedback. This is the one item that should not wait for re-sourcing.
- Hand-off: PM (copy gate) + Design (placement/craft).

### R2 — Re-source the chart manually from the official PDF (unblocks correctness)
> **Bet:** A human opening the official 1-Nov-2025 PDF (link in §2) and a few live
> award searches yields `[measured]` Saver/Advantage values we can encode with
> `source` + `asOf` provenance, replacing the stale set.
- Automated re-sourcing is **not possible here** (§2) — this needs the owner or a
  manual capture step. Flag clearly; do not fake it with snippets.
- **Validation signal:** every encoded value carries a primary-source URL + date;
  KL and Tokyo Business Saver in particular get corrected (snippet says they're
  overstated).

### R3 — Change the Access tier from fixed value → dynamic-multiplier display
> **Bet:** Showing Access as "from ~2–3× Saver (dynamic — varies by demand)"
> instead of a hard number stops the app from asserting a false precision.
- Trust check: ✅ stops misrepresentation. Build-on: derive off the Saver field
  already in `DESTINATIONS`; a label, not a stored number.
- **Validation signal:** no Access value drifts out of sync after the next SQ
  re-price (it can't — there's no stored number to rot).
- Note: this is a **data-model change recommendation for PM/Design** — not
  implemented in this pass.

### R4 — Reconcile the 12 (web) vs 26 (mobile) destination gap during re-sourcing
Do it once, against the primary source, with provenance — not by copying one file
to the other. (Already tracked as backlog T1-2 / `docs/award-chart.md`.)

---

## 6. What I could NOT source (honest scope)

- **No `[measured]` value for any route** — the official PDF and every reputable
  blog are 403-blocked to `WebFetch`; only search snippets are readable here.
- **Exact post-Nov-2025 Saver/Advantage figures per zone** — only directional
  percentage changes (`[measured]`) and a couple of conflicting route anchors
  (`[estimate]`).
- **Current Access multiplier per route** — dynamic and unpublished as a chart;
  the "~2–3× Saver" range is `[estimate]` from secondary commentary, already
  stale (Mar 2026 re-price).
- **Zone membership** for each of the 12 destinations from the primary chart —
  inferred, not read.

I did **not** edit any value in `DESTINATIONS` (web or mobile) and did **not**
touch calculation logic, per the task constraints.

---

## Sources (search-result snippets; full pages 403-blocked to automated fetch)

- The MileLion — 2025 devaluation overview: https://milelion.com/2025/09/09/my-overall-thoughts-on-the-2025-krisflyer-devaluation/
- The MileLion — Access awards (dynamic pricing): https://milelion.com/2025/08/27/singapore-airlines-access-awards-dynamic-pricing-finally-comes-to-krisflyer/
- The MileLion — "secret" Access chart: https://milelion.com/2025/11/01/revealed-the-secret-krisflyer-access-award-chart/
- The MileLion — Access devalued Mar 2026: https://milelion.com/2026/03/26/singapore-airlines-devalues-krisflyer-access-awards/
- The MileLion — best/worst value redemptions (route anchors): https://milelion.com/2025/12/09/whats-the-best-and-worst-value-krisflyer-redemption/
- Mainly Miles — award prices by route: https://mainlymiles.com/2025/11/19/singapore-airlines-krisflyer-award-prices-by-route-2/
- One Mile at a Time — devaluation + dynamic award: https://onemileatatime.com/news/singapore-krisflyer-devaluation/
- Australian Frequent Flyer — devaluation from 1 Nov 2025: https://www.australianfrequentflyer.com.au/krisflyer-award-chart-devaluation-2025/
- SuiteSmile — Saver/Advantage/Access charts: https://suitesmile.com/blog/2026/03/28/krisflyer-award-charts-saver-advantage-access/
- AwardWallet — devaluation news: https://awardwallet.com/news/airlines/singapore-krisflyer-award-devaluation/
- **Official SQ one-way Saver/Advantage chart PDF (1 Nov 2025) — primary source, human-readable only:** https://www.singaporeair.com/content/dam/sia/web-assets/pdfs/ppsclub-krisflyer/krisflyer/progupdates/awardcharts/SingaporeAirlinesOne-WayAdvantageSaverAwardChartupdated1Nov25.pdf
- SQ — KrisFlyer 2025 programme changes: https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/KFupdates2025/
