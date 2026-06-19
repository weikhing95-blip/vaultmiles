# Card art accuracy research — snapshot 2026-06-19

Goal: make each generated card in `src/components/CardArt.jsx` instantly
identifiable as its real Singapore counterpart. Source: the `CARD_DEFS` keys are
the single source of truth for which cards exist — this doc explains the data
behind each entry, not a separate card list.

Trademark-safe rule: brand colours + product NAME text + the generic network
glyph (VISA/AMEX wordmark, Mastercard circles, Diners text) + a short product
code/initials. No copied bank or network logos.

## Honesty / confidence

- **Networks** are high confidence — sourced from issuer pages and Mastercard /
  Visa material.
- **Colours** are the weakest data point. WebFetch was blocked (HTTP 403) for the
  research run, so card-face images could not be inspected directly; colours come
  from text descriptions where available, otherwise brand-identity reasoning.
  Low-confidence colours are tagged below.
- **Marks** are tasteful identifiers: sourced product codes where they exist
  (HSBC `T1`, OCBC `90°N`), otherwise a generic product initialism. Marks are not
  copied logos.

## Per-card table

| id | Real card | Network | Was | Colour (face) | Mark | Confidence | Source |
|---|---|---|---|---|---|---|---|
| krisflyer | KrisFlyer programme (not a bank card) | KF glyph | kf | navy + gold (brand) | — | n/a | brand identity |
| dbs | DBS Altitude (Visa Signature) | Visa | visa ✓ | charcoal/dark premium [colour LOW] | ALT | net HIGH, colour LOW | https://www.dbs.com.sg/personal/cards/credit-cards/dbs-altitude-cards |
| uob | UOB KrisFlyer | **Mastercard** | ~~visa~~ | deep navy [colour LOW] | KF | net HIGH | https://www.uob.com.sg/personal/cards/travel/krisflyer-card.page ; https://www.you.co/sg/blog/krisflyer-uob-credit-card/ |
| ocbc90n | OCBC 90°N | Mastercard (also Visa variant) | mc ✓ | dark face, "°" coordinate motif [colour LOW] | 90°N | net HIGH, mark HIGH, colour LOW | https://www.ocbc.com/personal-banking/cards/90-degrees-travel-credit-card |
| ocbcd | OCBC Rewards (ex-Titanium) | **Mastercard** | ~~visa~~ | OCBC red [MED] | OCBC | net HIGH | https://ringgitplus.com/en/credit-card/OCBC-Titanium-MasterCard-Blue.html ; https://milelion.com/2024/01/11/rebrand-ocbc-titanium-rewards-becoming-ocbc-rewards-card/ |
| citytyp | Citi Rewards | **Mastercard** | ~~visa~~ | Citi blue [MED] | TY | net HIGH | https://www.citibank.com.sg/credit-cards/rewards/citi-rewards-card/ |
| citimiles | Citi PremierMiles | **Mastercard** | ~~visa~~ | silver [MED] | PM | net HIGH, colour MED | https://mainlymiles.com/2026/04/29/citi-premiermiles-card-review-2026/ ; https://www.moneysmart.sg/credit-cards/citi-premiermiles-card |
| hsbc | HSBC TravelOne | **Mastercard** | ~~visa~~ | near-black / charcoal dual-tone, silver accents | **T1** | all HIGH | https://www.about.hsbc.com.sg/news-and-media/hsbc-launches-new-travelone-credit-card ; https://merewards.sg/brand-and-store-details/3244/hsbc-travelone-t1-credit-card |
| sc1 | Standard Chartered Visa Infinite | Visa | visa ✓ | brown plastic [HIGH] | VI | net HIGH, colour HIGH | https://milelion.com/2025/11/13/review-standard-chartered-visa-infinite-card/ |
| sc2 | Standard Chartered Journey | Visa | visa ✓ | SC green (brand) [colour LOW] | JNY | net HIGH, colour LOW | https://www.sc.com/sg/credit-cards/journey-credit-card/ ; https://milelion.com/2025/09/15/review-standard-chartered-journey-card/ |
| amex | American Express Rewards (Membership Rewards) | Amex | amex ✓ | Amex blue [colour LOW] | MR | net HIGH, colour LOW | https://www.americanexpress.com/en-sg/benefits/rewards-card/ |
| maybank | Maybank Horizon Visa Signature | Visa | visa ✓ | Maybank yellow (brand); dark text for contrast | HZN | net HIGH, colour MED | https://www.maybank2u.com.sg/en/personal/cards/credit/maybank-horizon-visa-signature-card.page |
| boc | BOC Elite Miles | **Mastercard** (World) | ~~visa~~ | BOC red [colour LOW] | EM | net HIGH | https://www.mastercard.com/news/ap/en/newsroom/press-releases/en/2018/july/bank-of-china-mastercard-launch-new-travel-credit-card-with-air-mile-rewards/ |
| cimb | CIMB Visa | Visa | visa ✓ | CIMB red/maroon (brand) [colour LOW] | CIMB | net HIGH, colour LOW | https://www.cimb.com.sg/en/personal/banking-with-us/cards/credit-cards/cimb-visa-infinite.html |
| diners | Diners Club International (DCS, SG) | Diners | diners ✓ | brand blue + gold [MED] | DC | net HIGH | https://technode.global/2023/08/02/diners-club-singapore-rebrands-to-dcs-card-centre-for-transformation/ ; https://1000logos.net/diners-club-international-logo/ |
| ntuclink | NTUC Link (current card via Trust) | **Visa** | ~~link~~ | Link green (brand) [colour LOW] | LINK | net HIGH, colour LOW | https://trustbank.sg/earn-linkpoints/ ; https://support.link.sg/hc/en-us/articles/360028882852 |

## Corrections made to existing data

Networks that were wrong (made up as Visa/link) and are now corrected:

- **uob** visa → mc (UOB KrisFlyer is a co-branded Mastercard)
- **ocbcd** visa → mc (OCBC Rewards / ex-Titanium is Mastercard)
- **citytyp** visa → mc (Citi Rewards migrated to Mastercard)
- **citimiles** visa → mc (Citi PremierMiles migrated to Mastercard)
- **hsbc** visa → mc (HSBC TravelOne is Mastercard) + colour red → near-black + mark `T1`
- **boc** visa → mc (BOC Elite Miles is a World Mastercard)
- **ntuclink** link → visa (NTUC Link is a loyalty programme; the current card is issued on Visa by Trust)

## Could not verify (left as brand-reasoned, tagged LOW above)

Exact card-face colours for: dbs, uob, ocbc90n, sc2 (Journey), amex, cimb,
ntuclink. WebFetch could not load card images. These use brand-identity colours,
not invented ones, and are flagged LOW. Next step to firm them up: view the issuer
product images directly.

## Notes for maintainers

- `ocbc90n` and `dbs` exist in dual-network variants (Visa **and** Mastercard /
  Visa **and** Amex). We render the more common / flagship variant.
- The prominent watermark mark renders from `CARD_DEFS[id].mark`; an empty string
  renders no mark. Font size auto-scales by length (≤2, ≤3, else smaller).
