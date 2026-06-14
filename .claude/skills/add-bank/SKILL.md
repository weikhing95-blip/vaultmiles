---
name: add-bank
description: Add a new Singapore bank rewards program to the CATALOG constant in App.jsx. Use when the user asks to add a new bank, card, or rewards program.
---

When the user invokes `/add-bank`, follow these steps:

1. **Gather the required fields** — ask the user for:
   - `id`: short unique kebab-case key (e.g., `"maybank"`)
   - `bank`: bank display name (e.g., `"Maybank"`)
   - `name`: rewards program name (e.g., `"TreatsPoints"`)
   - `min`: minimum points needed to initiate a conversion block (integer)
   - `blockPts`: points consumed per conversion block (integer)
   - `blockMiles`: KrisFlyer miles awarded per conversion block (integer)
   - `fee`: SGD fee charged per conversion block (number, 0 if free)
   - `note`: one-line human note about the program (expiry, tier, caveats)

2. **Compute the effective ratio** — derive `blockMiles / blockPts` and present it to the user as a sanity check (e.g., "That's 2 pts per mile").

3. **Append to CATALOG** — add the new entry to the `CATALOG` array in `src/App.jsx`, keeping the same compact one-line style used by the existing entries. Maintain alphabetical order by `id` if practical.

4. **Add a CardArt case** — in the `CardArt` function, add a matching entry to the `defs` object. Use the bank's real brand colors for `bg1`/`bg2`, an appropriate `accent` and `text` color, the `label` (card name), `sub` (points currency name), and `network` (`"visa"`, `"mastercard"`, `"amex"`, or `"kf"`). If unsure of exact hex codes, use reasonable brand-approximate values and tell the user to verify.

5. **Confirm** — report the new entry and the effective pts-per-mile ratio. Remind the user that the in-app Settings tab lets them adjust rates at runtime without a code edit.
