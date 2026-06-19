// Official card images (optional). For any card id listed here, CardArt renders
// the real card artwork; every other card falls back to the generated art.
//
// ⚠️ Only add images you are LICENSED / authorised by the bank to use.
//
// HOW TO ADD:
//   1. Put the file in `public/cards/`  →  e.g. public/cards/hsbc.png (or .webp).
//      Recommended: credit-card ratio ≈ 1.586 : 1 (e.g. 640×403), < ~120 KB.
//   2. Add one line below mapping the card id → its public path.
//      The id keys match CARD_DEFS in CardArt.jsx (hsbc, dbs, uob, ocbc90n,
//      ocbcd, citytyp, citimiles, sc1, sc2, amex, maybank, boc, cimb, diners,
//      ntuclink, krisflyer).
//
// Cards left out here keep the generated art. If a listed file fails to load,
// CardArt automatically falls back to the generated art too.
export const CARD_IMAGES = {
  // Example (uncomment once the licensed file is in public/cards/):
  // hsbc: "/cards/hsbc.png",
};
