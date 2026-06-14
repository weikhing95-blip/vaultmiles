import { useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { T } from "../../constants/theme";
import { fmt, thisMonth, monthLabel } from "../../lib/calculator";
import { useHoldings } from "../../hooks/useHoldings";

export default function HistoryScreen() {
  const { totalMiles, snaps, saveSnap, removeSnap } = useHoldings();

  const snapsAsc = useMemo(
    () => [...snaps].sort((a, b) => a.month.localeCompare(b.month)),
    [snaps]
  );

  const snapsDesc = useMemo(() => [...snapsAsc].reverse(), [snapsAsc]);

  const currentMonth = thisMonth();
  const hasCurrentSnap = snaps.some((s) => s.month === currentMonth);

  // Delta: difference between last two snapshots
  const delta = useMemo(() => {
    if (snapsAsc.length < 2) return null;
    const last = snapsAsc[snapsAsc.length - 1];
    const prev = snapsAsc[snapsAsc.length - 2];
    return last.total - prev.total;
  }, [snapsAsc]);

  // Bar chart: max value for scaling
  const maxTotal = useMemo(() => {
    if (snapsAsc.length === 0) return 1;
    return Math.max(...snapsAsc.map((s) => s.total));
  }, [snapsAsc]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>MONTH BY MONTH</Text>
            <Text style={styles.headerTitle}>History</Text>
          </View>
          {delta != null && (
            <View
              style={[
                styles.deltaChip,
                delta >= 0 ? styles.deltaChipGood : styles.deltaChipWarn,
              ]}
            >
              <Text
                style={[
                  styles.deltaChipText,
                  delta >= 0 ? styles.deltaTextGood : styles.deltaTextWarn,
                ]}
              >
                {delta >= 0 ? "↑" : "↓"}
                {fmt(Math.abs(delta))}
              </Text>
            </View>
          )}
        </View>

        {/* Trend chart */}
        <View style={styles.chartCard}>
          {snapsAsc.length >= 2 ? (
            <>
              <Text style={styles.chartLabel}>MILES OVER TIME</Text>
              <View style={styles.chartBarsRow}>
                {snapsAsc.map((snap) => {
                  const heightPct = maxTotal > 0 ? snap.total / maxTotal : 0;
                  const barHeight = Math.max(4, Math.round(heightPct * 100));
                  return (
                    <View key={snap.month} style={styles.chartBarCol}>
                      <View style={styles.chartBarWrapper}>
                        <View
                          style={[styles.chartBar, { height: barHeight }]}
                        />
                      </View>
                      <Text style={styles.chartBarLabel} numberOfLines={1}>
                        {monthLabel(snap.month).split(" ")[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.chartEmpty}>
              <Text style={styles.chartEmptyTitle}>Start tracking</Text>
              <Text style={styles.chartEmptyDesc}>
                Save your first snapshot below
              </Text>
            </View>
          )}
        </View>

        {/* Save snapshot section */}
        <View style={styles.saveCard}>
          <Text style={styles.saveCardLabel}>
            {monthLabel(currentMonth).toUpperCase()} SNAPSHOT
          </Text>
          <Text style={styles.saveCardMiles}>{fmt(totalMiles)}</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => saveSnap(currentMonth)}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {hasCurrentSnap
                ? `Update ${monthLabel(currentMonth)} Snapshot`
                : `Save ${monthLabel(currentMonth)} Snapshot`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* All snapshots list */}
        {snaps.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>ALL SNAPSHOTS</Text>
            <View style={styles.snapsList}>
              {snapsDesc.map((snap, i) => {
                // Find previous snap in ascending order for delta
                const ascIdx = snapsAsc.findIndex(
                  (s) => s.month === snap.month
                );
                const prevSnap =
                  ascIdx > 0 ? snapsAsc[ascIdx - 1] : null;
                const snapDelta = prevSnap != null ? snap.total - prevSnap.total : null;
                const isLast = i === snapsDesc.length - 1;

                return (
                  <View
                    key={snap.month}
                    style={[
                      styles.snapRow,
                      !isLast && styles.snapRowBorder,
                    ]}
                  >
                    <View style={styles.snapLeft}>
                      <Text style={styles.snapMonth}>
                        {monthLabel(snap.month)}
                      </Text>
                      {snapDelta != null && (
                        <Text
                          style={[
                            styles.snapDelta,
                            snapDelta >= 0
                              ? styles.snapDeltaGood
                              : styles.snapDeltaWarn,
                          ]}
                        >
                          {snapDelta >= 0 ? "↑" : "↓"}
                          {fmt(Math.abs(snapDelta))}
                        </Text>
                      )}
                    </View>
                    <View style={styles.snapRight}>
                      <Text style={styles.snapTotal}>{fmt(snap.total)}</Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => removeSnap(snap.month)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.deleteButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerSub: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: T.display,
    fontSize: 28,
    color: T.ink,
  },
  deltaChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  deltaChipGood: {
    backgroundColor: T.goodDim,
    borderColor: T.good,
  },
  deltaChipWarn: {
    backgroundColor: T.warnDim,
    borderColor: T.warn,
  },
  deltaChipText: {
    fontFamily: T.mono,
    fontSize: 12,
    fontWeight: "600",
  },
  deltaTextGood: {
    color: T.good,
  },
  deltaTextWarn: {
    color: T.warn,
  },

  /* Chart card */
  chartCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    margin: 16,
    padding: 20,
  },
  chartLabel: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  chartBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  chartBarCol: {
    flex: 1,
    alignItems: "center",
  },
  chartBarWrapper: {
    height: 100,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  chartBar: {
    width: "100%",
    backgroundColor: T.gold,
    borderRadius: 2,
    maxWidth: 32,
  },
  chartBarLabel: {
    fontFamily: T.mono,
    fontSize: 8,
    color: T.faint,
    marginTop: 4,
    textAlign: "center",
  },
  chartEmpty: {
    alignItems: "center",
    paddingVertical: 16,
  },
  chartEmptyTitle: {
    fontSize: 14,
    color: T.ink,
    marginBottom: 4,
  },
  chartEmptyDesc: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.faint,
    marginTop: 8,
  },

  /* Save snapshot card */
  saveCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    margin: 16,
    padding: 20,
  },
  saveCardLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  saveCardMiles: {
    fontFamily: T.display,
    fontSize: 28,
    color: T.goldSoft,
    fontWeight: "700",
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: T.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#1A1200",
    fontSize: 14,
    fontWeight: "700",
  },

  /* All snapshots */
  sectionLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  snapsList: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  snapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  snapRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  snapLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  snapMonth: {
    fontSize: 13,
    color: T.ink,
  },
  snapDelta: {
    fontFamily: T.mono,
    fontSize: 11,
  },
  snapDeltaGood: {
    color: T.good,
  },
  snapDeltaWarn: {
    color: T.warn,
  },
  snapRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  snapTotal: {
    fontFamily: T.mono,
    fontSize: 14,
    color: T.goldSoft,
    fontWeight: "700",
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 18,
    color: T.faint,
    lineHeight: 22,
  },
});
