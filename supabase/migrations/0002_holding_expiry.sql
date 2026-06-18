-- T1-1 Miles expiry tracking: optional per-card expiry (month granularity, "YYYY-MM").
-- Nullable + IF NOT EXISTS so it is safe to run more than once and does not affect
-- existing rows. The web/mobile code degrades gracefully if this has not been applied
-- (balances still save), but expiry only persists once this migration is live.
alter table holdings add column if not exists expiry text;
