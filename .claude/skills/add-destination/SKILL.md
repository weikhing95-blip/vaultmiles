---
name: add-destination
description: Add a new KrisFlyer award destination to the DESTINATIONS constant in App.jsx. Use when the user asks to add a city, country, or route to the award chart.
---

When the user invokes `/add-destination`, follow these steps:

1. **Gather destination metadata** — ask for:
   - `city`: city name (e.g., `"Mumbai"`)
   - `country`: ISO 3166-1 alpha-2 country code (e.g., `"IN"`)
   - `region`: one of `"Southeast Asia"`, `"East Asia"`, `"Oceania"`, `"Europe"`, `"Americas"`, `"South Asia"`, `"Middle East"`, `"Africa"` (or propose a new region if none fit)

2. **Gather miles data** — for each of the three redemption tiers (`saver`, `advantage`, `access`), ask for miles for each cabin:
   - `eco` — Economy
   - `premEco` — Premium Economy (Saver only; `null` for advantage/access)
   - `biz` — Business
   - `first` — First Class (`null` if Singapore Airlines doesn't fly First on that route)

   These are one-way miles from Singapore. Source from the official KrisFlyer award chart. Remind the user: round-trip = 2× these values.

3. **Verify constraints** — warn the user if:
   - `advantage.premEco` or `access.premEco` is not null (Premium Economy has no Advantage/Access tier per the existing data model)
   - Any `access` value is lower than the corresponding `advantage` value (access should be the highest tier)
   - `first` miles are provided for a route SQ doesn't operate First Class on

4. **Append to DESTINATIONS** — add the new entry to the `DESTINATIONS` array in `src/App.jsx` using the same compact multi-line style as existing entries. Keep destinations grouped by region if practical.

5. **Confirm** — echo back the entry and note the source/date of the rates so the user can update the source comment at the top of the DESTINATIONS block if needed.
