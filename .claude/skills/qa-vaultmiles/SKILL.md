---
name: qa-vaultmiles
description: QA agent for VaultMiles — runs the full QA checklist, finds and documents bugs, fixes them, and logs learnings so the next run is smarter. Invoke with /qa-vaultmiles.
disable-model-invocation: false
---

# VaultMiles QA Agent

You are the QA lead for VaultMiles (https://vaultmiles.vercel.app). Your job is to:
1. Run the full QA checklist defined in CLAUDE.md
2. Find bugs with evidence (screenshots)
3. Fix every bug you can reach in source code
4. Log learnings so future runs catch issues faster

## Self-Learning Protocol

Before starting, check for accumulated learnings:

```bash
~/.claude/skills/gstack/bin/gstack-learnings-search --limit 20 2>/dev/null || true
```

Apply any prior learnings to your test plan. After each session, log new discoveries:

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"qa-vaultmiles","type":"TYPE","key":"KEY","insight":"DESCRIPTION","confidence":N,"source":"observed","files":["path"]}'
```

## Known Patterns (seed learnings — update as you discover more)

- **Browse refs invalidate on React re-render**: Call `$B snapshot` before each `$B fill`/`$B click` group. All `$B` commands must be in a single Bash `&&` chain — separate Bash calls restart the browse server and lose state.
- **signUp race condition fixed**: Profile name/kf stored in sessionStorage before `supabase.auth.signUp()` so `onAuthStateChange` always has data. If "Traveller" shows up after sign-up again, this race condition has regressed.
- **History chart needs 2+ snapshots**: `showChart` requires `snapsSorted.length >= 2`. One snapshot shows updated "Keep tracking" copy — not a bug.
- **First name only in header**: TabCards.jsx shows `user.name.split(/\s+/)[0]` — intentional design, not a bug.

## QA Checklist (from CLAUDE.md — run every session)

### 1. New User Journey (HIGHEST PRIORITY — always test first with a fresh email)

Use `qa.$(date +%s)@mailinator.com` as the test email.

- [ ] Sign up → Cards tab shows **zero cards, 0 KrisFlyer Miles** (no demo data)
- [ ] Header shows **first name** (not "Traveller" or blank)
- [ ] KF# badge shows the number entered (not "No KF # set")
- [ ] Add first card → balance persists after fresh browser sign-in
- [ ] History snapshot saves and persists after fresh browser sign-in
- [ ] Sign out → sign back in → same data appears

### 2. Auth Edge Cases

- [ ] Wrong password → "Invalid login credentials" (not a crash, not a blank screen)
- [ ] Duplicate email → "User already registered" (not a crash)
- [ ] Sign out → sign in as different user → no data from previous user visible

### 3. Data Integrity

- [ ] Remove a card → fresh sign-in → card is gone
- [ ] Edit balance → fresh sign-in → edited value persists
- [ ] Rate override in Settings → fresh sign-in → shows updated miles

### 4. Calculation Accuracy

- [ ] DBS Points: 50,000 pts → 100,000 miles, S$27.25 fee (blockPts=5000, blockMiles=10000, fee=27.25)
- [ ] Fee shows only when balance >= min threshold

### 5. Tab Checks

- [ ] Fly tab: destinations load, "You can fly" checkmarks appear for reachable destinations
- [ ] History tab: empty state correct, snapshot saves, "Keep tracking" shown after first save
- [ ] Settings tab: full name + email + KF# shown, 11 conversion rate rows, 12 SG programs in About

### 6. Cross-Platform Parity

- [ ] Maybank (12th program) present in web catalog and mobile catalog
- [ ] Destination counts: web has 12, mobile has 26 (known parity gap — not a bug until backlog item ships)

## Bug Severity Scale

- **CRITICAL**: New user sees wrong name / demo data / can't sign up / data loss
- **HIGH**: Feature broken for majority of users
- **MEDIUM**: Wrong copy / stale UI state / slightly technical error messages
- **LOW**: Marketing copy inconsistency / minor visual issues

## Fix Protocol

For each bug found:
1. Take before screenshot
2. Locate source file (grep, read)
3. Make minimal fix
4. `git commit -m "fix(qa): ISSUE-NNN — description"`
5. Re-test and take after screenshot
6. Mark verified / best-effort / reverted

## After Each Session

1. Update this file's "Known Patterns" section with any new discoveries
2. Log learnings via `gstack-learnings-log`
3. Write QA outcome artifact:
   ```bash
   eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" && mkdir -p ~/.gstack/projects/$SLUG
   # Write to ~/.gstack/projects/$SLUG/qa-outcome-$(date +%Y%m%d).md
   ```
4. Report: total issues found, fixed, deferred, health score estimate

## Health Score Quick Rubric

| Score | State |
|-------|-------|
| 90-100 | All checklist items pass, no console errors |
| 75-89 | 1-2 medium issues, no critical/high |
| 60-74 | 1 high issue or 3+ medium |
| < 60 | Any critical issue open |
