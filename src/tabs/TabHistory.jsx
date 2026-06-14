import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { T, P } from "../theme.js";
import { fmt, thisMonth, monthLabel } from "../utils.js";
import { SectionLabel, EmptyState, ChartTip } from "../components/primitives.jsx";

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

  const existingSnap = useMemo(
    () => snaps.find((s) => s.month === month),
    [snaps, month]
  );

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

  return (
    <div style={P.page}>
      {/* Page header */}
      <div style={P.pageHeader}>
        <div>
          <div style={P.pageHeaderSub}>Month by month</div>
          <div style={P.pageHeaderTitle}>History</div>
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
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: 20,
            }}
          >
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
                  stroke={T.gold}
                  strokeWidth={2}
                  dot={{ fill: T.gold, strokeWidth: 0, r: 3 }}
                  activeDot={{ fill: T.goldSoft, strokeWidth: 0, r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div style={{ ...P.section }}>
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <EmptyState
              icon="✦"
              title="Start tracking"
              desc="Save your first snapshot below to see your miles grow over time"
            />
          </div>
        </div>
      )}

      {/* Save this month section */}
      <div style={{ ...P.section }}>
        <div style={P.sectionHead}>
          <SectionLabel>Save snapshot</SectionLabel>
        </div>
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 20,
          }}
        >
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
              fontFamily: T.display,
              fontSize: 24,
              fontWeight: 700,
              color: T.goldSoft,
              marginBottom: 16,
            }}
          >
            {fmt(totalMiles)} miles
          </div>
          <button
            className="v-btn"
            style={{ width: "100%" }}
            onClick={() => saveSnap(month)}
          >
            {existingSnap ? `Update ${currentMonthLabel} Snapshot` : `Save ${currentMonthLabel} Snapshot`}
          </button>
        </div>
      </div>

      {/* All snapshots list */}
      {snapsDesc.length > 0 && (
        <div style={P.section}>
          <div style={P.sectionHead}>
            <SectionLabel>All snapshots</SectionLabel>
          </div>
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "0 16px",
            }}
          >
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
          </div>
        </div>
      )}
    </div>
  );
}
