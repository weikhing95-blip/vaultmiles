import { useMemo } from "react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T, P } from "../theme.js";
import { fmt, thisMonth, monthLabel } from "../utils.js";
import { SectionLabel, ChartTip } from "../components/primitives.jsx";
import { Surface, EmptyState, Button, Badge } from "../components/ui.jsx";

// "YYYY-MM" → previous month "YYYY-MM"
function prevMonthStr(m) {
  const [y, mo] = m.split("-").map(Number);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
}

export function TabHistory({ snaps, totalMiles, saveSnap, removeSnap }) {
  const month = thisMonth();
  const currentMonthLabel = monthLabel(month);

  // Sort ascending for chart + delta logic
  const snapsSorted = useMemo(
    () => [...snaps].sort((a, b) => a.month.localeCompare(b.month)),
    [snaps]
  );

  // Sort descending for list display
  const snapsDesc = useMemo(() => [...snapsSorted].reverse(), [snapsSorted]);

  const existingSnap = useMemo(() => snaps.find((s) => s.month === month), [snaps, month]);

  const chartData = useMemo(
    () =>
      snapsSorted.map((s) => ({
        month: monthLabel(s.month),
        miles: s.total,
      })),
    [snapsSorted]
  );

  // Delta vs last snapshot (most recent before now in the sorted list)
  const deltaChip = useMemo(() => {
    if (snapsSorted.length < 2) return null;
    const last = snapsSorted[snapsSorted.length - 1];
    const prev = snapsSorted[snapsSorted.length - 2];
    const diff = last.total - prev.total;
    if (diff === 0) return null;
    return { diff, positive: diff > 0 };
  }, [snapsSorted]);

  const showChart = snapsSorted.length >= 2;
  const hasAnySnap = snapsSorted.length >= 1;

  // Monthly tracking streak — consecutive months ending at the latest snapshot.
  // PM honesty guard: only an ACTIVE streak counts (latest snapshot is this month
  // or the immediately-prior month). A lapsed streak is never shown as active.
  const streak = useMemo(() => {
    if (snapsSorted.length === 0) return 0;
    const months = new Set(snapsSorted.map((s) => s.month));
    const latest = snapsSorted[snapsSorted.length - 1].month;
    const active = latest === month || latest === prevMonthStr(month);
    if (!active) return 0;
    let count = 0;
    let cur = latest;
    while (months.has(cur)) {
      count++;
      cur = prevMonthStr(cur);
    }
    return count;
  }, [snapsSorted, month]);

  return (
    <div style={P.page}>
      {/* Page header */}
      <div style={P.pageHeader}>
        <div>
          <div style={P.pageHeaderSub}>Month by month</div>
          <div style={P.pageHeaderTitle}>Progress</div>
          {streak >= 1 && (
            <div style={{ marginTop: 8 }}>
              <Badge tone="gold">🔥 {streak}-month streak</Badge>
            </div>
          )}
        </div>
        {deltaChip && (
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 13,
              fontWeight: 700,
              color: deltaChip.positive ? T.good : T.warn,
              background: deltaChip.positive ? "rgba(107,175,137,0.12)" : "rgba(201,123,90,0.12)",
              border: `1px solid ${deltaChip.positive ? "rgba(107,175,137,0.3)" : "rgba(201,123,90,0.3)"}`,
              borderRadius: 8,
              padding: "6px 12px",
            }}
          >
            {deltaChip.positive ? "↑" : "↓"}
            {fmt(Math.abs(deltaChip.diff))}
          </div>
        )}
      </div>

      {/* Trend chart or empty state */}
      {showChart ? (
        <div style={{ ...P.section }}>
          <div style={P.sectionHead}>
            <SectionLabel>Trend</SectionLabel>
          </div>
          <Surface level="e1" radius="lg" pad={5}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="month"
                  tick={{
                    fontFamily: T.mono,
                    fontSize: 9,
                    fill: T.faint,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTip />} />
                <Line
                  type="monotone"
                  dataKey="miles"
                  stroke={T.auroraPrimary}
                  strokeWidth={2}
                  dot={{ fill: T.auroraPrimary, strokeWidth: 0, r: 3 }}
                  activeDot={{ fill: T.auroraText, strokeWidth: 0, r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Surface>
        </div>
      ) : (
        <div style={{ ...P.section }}>
          <Surface level="e1" radius="lg" pad={5}>
            <EmptyState
              title={hasAnySnap ? "Keep tracking" : "Start tracking"}
              hint={
                hasAnySnap
                  ? "Save next month's snapshot to see your miles trend over time"
                  : "Save your first snapshot below to see your miles grow over time"
              }
            />
          </Surface>
        </div>
      )}

      {/* Save this month section */}
      <div style={{ ...P.section }}>
        <div style={P.sectionHead}>
          <SectionLabel>Save snapshot</SectionLabel>
        </div>
        <Surface level="e1" radius="lg" pad={5}>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              color: T.faint,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              marginBottom: 6,
            }}
          >
            {currentMonthLabel} snapshot
          </div>
          <div
            style={{
              fontFamily: T.displayAlt,
              fontSize: 24,
              fontWeight: 700,
              background: T.aurora,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 16,
            }}
          >
            {fmt(totalMiles)} miles
          </div>
          <Button variant="primary" full onClick={() => saveSnap(month)}>
            {existingSnap
              ? `Update ${currentMonthLabel} snapshot`
              : `Save ${currentMonthLabel} snapshot`}
          </Button>
        </Surface>
      </div>

      {/* All snapshots list */}
      {snapsDesc.length > 0 && (
        <div style={P.section}>
          <div style={P.sectionHead}>
            <SectionLabel>All snapshots</SectionLabel>
          </div>
          <Surface level="e1" radius="lg" style={{ padding: "0 16px" }}>
            {snapsDesc.map((snap, i) => {
              // Find this entry's index in ascending order to get delta vs previous
              const ascIdx = snapsSorted.findIndex((s) => s.month === snap.month);
              const prevSnap = ascIdx > 0 ? snapsSorted[ascIdx - 1] : null;
              const delta = prevSnap ? snap.total - prevSnap.total : null;
              const isLast = i === snapsDesc.length - 1;

              return (
                <div
                  key={snap.month}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: isLast ? "none" : `1px solid ${T.border}`,
                    gap: 8,
                  }}
                >
                  {/* Left: month + delta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: T.body,
                        fontSize: 13,
                        color: T.ink,
                        marginBottom: 2,
                      }}
                    >
                      {monthLabel(snap.month)}
                    </div>
                    {delta !== null && delta !== 0 && (
                      <div
                        style={{
                          fontFamily: T.mono,
                          fontSize: 10,
                          color: delta > 0 ? T.good : T.warn,
                        }}
                      >
                        {delta > 0 ? "↑" : "↓"}
                        {fmt(Math.abs(delta))}
                      </div>
                    )}
                  </div>

                  {/* Right: miles + delete */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: 14,
                        fontWeight: 700,
                        color: T.goldSoft,
                        textAlign: "right",
                      }}
                    >
                      {fmt(snap.total)}
                    </div>
                    <button
                      className="v-icon-sm"
                      onClick={() => removeSnap(snap.month)}
                      title={`Delete ${monthLabel(snap.month)} snapshot`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </Surface>
        </div>
      )}
    </div>
  );
}
