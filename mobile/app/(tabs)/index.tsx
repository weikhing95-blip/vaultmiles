import { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHoldings } from "../../hooks/useHoldings";
import { useAuth } from "../../hooks/useAuth";
import { fmt } from "../../lib/calculator";
import { T } from "../../constants/theme";
import { BANK_COLORS, CatalogEntry } from "../../constants/catalog";
import type { Row } from "../../hooks/useHoldings";

/* ─── CardRow ─────────────────────────────────────────────────────────── */

interface CardRowProps {
  row: Row;
  onUpdate: (uid: string, balance: string) => void;
  onRemove: (uid: string) => void;
  totalMiles: number;
}

function CardRow({ row, onUpdate, onRemove, totalMiles }: CardRowProps) {
  const bankColor = row.src ? (BANK_COLORS[row.src.bank] ?? T.faint) : T.faint;
  const balNum = parseInt(row.balance.replace(/[^0-9]/g, ""), 10) || 0;
  const belowMin = row.miles === 0 && balNum > 0;

  function handleRemove() {
    Alert.alert(
      "Remove card",
      `Remove ${row.src?.name ?? "this card"}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => onRemove(row.uid) },
      ],
    );
  }

  return (
    <View style={styles.cardRow}>
      {/* Top row */}
      <View style={styles.cardRowTop}>
        <View style={styles.cardRowLeft}>
          <View style={[styles.bankDot, { backgroundColor: bankColor }]} />
          <View>
            <Text style={styles.cardBankName}>{row.src?.bank ?? "Unknown"}</Text>
            <Text style={styles.cardProgramName}>{row.src?.name ?? row.srcId}</Text>
          </View>
        </View>
        <View style={styles.cardRowRight}>
          <Text style={styles.cardMilesNum}>{fmt(row.miles)}</Text>
          <Text style={styles.cardMilesUnit}>miles</Text>
        </View>
      </View>

      {/* Balance row */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>BALANCE</Text>
        <TextInput
          style={styles.balanceInput}
          value={row.balance}
          onChangeText={(text) => onUpdate(row.uid, text)}
          keyboardType="numeric"
          placeholder="Enter points"
          placeholderTextColor={T.faint}
        />
        <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
          <Text style={styles.removeBtnText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Note */}
      {!!row.src?.note && (
        <Text style={styles.cardNote}>{row.src.note}</Text>
      )}

      {/* Below minimum warning */}
      {belowMin && (
        <Text style={styles.belowMinText}>
          Below {row.src?.min.toLocaleString()}-point minimum
        </Text>
      )}
    </View>
  );
}

/* ─── Main screen ─────────────────────────────────────────────────────── */

export default function CardsScreen() {
  const { user } = useAuth();
  const { catalog, rows, totalMiles, totalFees, ready, addHolding, updateHolding, removeHolding } =
    useHoldings();
  const [showPicker, setShowPicker] = useState(false);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const kfNum = user?.kfNum ?? null;

  const milesRows = [...rows]
    .filter((r) => r.miles > 0)
    .sort((a, b) => b.miles - a.miles);

  const strandedCount = rows.filter((r) => r.stranded > 0 && r.miles > 0).length;
  const allClean = totalFees === 0 && strandedCount === 0;

  const existingIds = new Set(rows.map((r) => r.srcId));

  const handleUpdate = useCallback(
    (uid: string, balance: string) => {
      updateHolding(uid, { balance });
    },
    [updateHolding],
  );

  const handleRemove = useCallback(
    (uid: string) => {
      removeHolding(uid);
    },
    [removeHolding],
  );

  function handleAddCard(srcId: string) {
    addHolding(srcId);
    setShowPicker(false);
  }

  /* ── Catalog FlatList data (with bank-header sentinels) ── */
  type CatalogListItem =
    | { type: "header"; bank: string; key: string }
    | { type: "entry"; entry: CatalogEntry; key: string };

  const catalogListData: CatalogListItem[] = [];
  let lastBank = "";
  for (const entry of catalog) {
    if (entry.bank !== lastBank) {
      catalogListData.push({ type: "header", bank: entry.bank, key: `h-${entry.bank}` });
      lastBank = entry.bank;
    }
    catalogListData.push({ type: "entry", entry, key: entry.id });
  }

  function renderCatalogItem({ item }: { item: CatalogListItem }) {
    if (item.type === "header") {
      return <Text style={styles.pickerBankHeader}>{item.bank.toUpperCase()}</Text>;
    }
    const { entry } = item;
    const alreadyAdded = existingIds.has(entry.id);
    const bankColor = BANK_COLORS[entry.bank] ?? T.faint;
    return (
      <TouchableOpacity
        style={[styles.pickerRow, alreadyAdded && styles.pickerRowDisabled]}
        onPress={() => !alreadyAdded && handleAddCard(entry.id)}
        activeOpacity={alreadyAdded ? 1 : 0.7}
        disabled={alreadyAdded}
      >
        <View style={[styles.bankDot, { backgroundColor: bankColor }]} />
        <View style={styles.pickerRowText}>
          <Text style={styles.pickerEntryName}>{entry.name}</Text>
          {!!entry.note && <Text style={styles.pickerEntryNote}>{entry.note}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.pickerAddBtn, alreadyAdded && { opacity: 0.4 }]}
          onPress={() => !alreadyAdded && handleAddCard(entry.id)}
          disabled={alreadyAdded}
        >
          <Text style={styles.pickerAddBtnText}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>VaultMiles</Text>
            <Text style={styles.headerSub}>Welcome back, {firstName}</Text>
          </View>
          <View style={styles.kfBadge}>
            <Text style={styles.kfBadgeText}>
              {kfNum ? `KF ${kfNum}` : "No KF #"}
            </Text>
          </View>
        </View>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>TOTAL CONVERTIBLE</Text>
          <Text style={styles.heroBigNum}>{fmt(totalMiles)}</Text>
          <Text style={styles.heroUnit}>KrisFlyer Miles</Text>
          <View style={styles.heroDivider} />

          {/* Pills */}
          <View style={styles.pillRow}>
            {totalFees > 0 && (
              <View style={[styles.pill, styles.pillWarn]}>
                <Text style={styles.pillWarnText}>
                  S${totalFees.toFixed(2)} transfer fees
                </Text>
              </View>
            )}
            {strandedCount > 0 && (
              <View style={[styles.pill, styles.pillWarn]}>
                <Text style={styles.pillWarnText}>
                  {strandedCount} card{strandedCount > 1 ? "s" : ""} with leftover pts
                </Text>
              </View>
            )}
            {allClean && rows.length > 0 && (
              <View style={[styles.pill, styles.pillGood]}>
                <Text style={styles.pillGoodText}>All points optimised</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Breakdown by bank ── */}
        {milesRows.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>BY BANK</Text>
            <View style={styles.breakdownCard}>
              {milesRows.map((row, idx) => {
                const pct = totalMiles > 0 ? (row.miles / totalMiles) * 100 : 0;
                const isLast = idx === milesRows.length - 1;
                return (
                  <View
                    key={row.uid}
                    style={[styles.breakdownRow, !isLast && styles.breakdownRowBorder]}
                  >
                    <View style={styles.breakdownRowTop}>
                      <View>
                        <Text style={styles.breakdownBank}>{row.src?.bank ?? "Unknown"}</Text>
                        <Text style={styles.breakdownProgram}>{row.src?.name ?? row.srcId}</Text>
                      </View>
                      <Text style={styles.breakdownMiles}>{fmt(row.miles)}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressBar, { width: `${pct}%` }]} />
                    </View>
                    <View style={styles.breakdownMeta}>
                      {row.fee > 0 && (
                        <Text style={styles.breakdownFee}>S${row.fee.toFixed(2)} fee</Text>
                      )}
                      {row.stranded > 0 && (
                        <Text style={styles.breakdownStranded}>
                          {row.stranded.toLocaleString()} pts leftover
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── Cards section ── */}
        <View style={styles.cardsSectionHeader}>
          <Text style={styles.sectionLabel}>YOUR CARDS</Text>
          <TouchableOpacity style={styles.addCardBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.addCardBtnText}>+ Add Card</Text>
          </TouchableOpacity>
        </View>

        {!ready && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={T.gold} />
          </View>
        )}

        {ready && rows.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cards yet — tap Add Card to begin</Text>
          </View>
        )}

        {ready && rows.map((row) => (
          <CardRow
            key={row.uid}
            row={row}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            totalMiles={totalMiles}
          />
        ))}

      </ScrollView>

      {/* ── Add Card Modal ── */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Sheet header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add a card</Text>
                <Text style={styles.modalSubtitle}>
                  Select which rewards program to track
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.modalCloseBtnText}>×</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={catalogListData}
              keyExtractor={(item) => item.key}
              renderItem={renderCatalogItem}
              contentContainerStyle={styles.pickerList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: T.display,
    fontSize: 18,
    fontWeight: "700",
    color: T.gold,
  },
  headerSub: {
    fontFamily: T.body,
    fontSize: 12,
    color: T.mist,
    marginTop: 2,
  },
  kfBadge: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kfBadgeText: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
  },

  /* Hero */
  hero: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  heroLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroBigNum: {
    fontFamily: T.display,
    fontSize: 64,
    color: T.goldSoft,
    fontWeight: "700",
    marginTop: 8,
  },
  heroUnit: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 8,
  },
  heroDivider: {
    height: 1,
    backgroundColor: T.gold,
    opacity: 0.3,
    width: 120,
    alignSelf: "center",
    marginVertical: 16,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillWarn: {
    backgroundColor: T.warnDim,
  },
  pillWarnText: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.warn,
  },
  pillGood: {
    backgroundColor: T.goodDim,
  },
  pillGoodText: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.good,
  },

  /* Section label */
  sectionLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 2,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },

  /* Breakdown card */
  breakdownCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  breakdownRow: {
    padding: 14,
  },
  breakdownRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  breakdownRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  breakdownBank: {
    fontFamily: T.body,
    fontSize: 13,
    fontWeight: "500",
    color: T.ink,
  },
  breakdownProgram: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    marginTop: 2,
  },
  breakdownMiles: {
    fontFamily: T.mono,
    fontSize: 14,
    color: T.goldSoft,
    fontWeight: "700",
  },
  progressTrack: {
    height: 2,
    backgroundColor: T.border,
    borderRadius: 1,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: 2,
    backgroundColor: T.gold,
    borderRadius: 1,
  },
  breakdownMeta: {
    flexDirection: "row",
    gap: 12,
  },
  breakdownFee: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.warn,
  },
  breakdownStranded: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
  },

  /* Cards section header */
  cardsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
  },
  addCardBtn: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addCardBtnText: {
    fontFamily: T.mono,
    fontSize: 12,
    color: T.gold,
  },

  /* Empty / loading */
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: T.body,
    fontSize: 13,
    color: T.mist,
    textAlign: "center",
  },

  /* CardRow */
  cardRow: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  cardRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  cardRowRight: {
    alignItems: "flex-end",
  },
  bankDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardBankName: {
    fontFamily: T.body,
    fontSize: 13,
    fontWeight: "700",
    color: T.ink,
  },
  cardProgramName: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    marginTop: 1,
  },
  cardMilesNum: {
    fontFamily: T.mono,
    fontSize: 18,
    color: T.goldSoft,
    fontWeight: "700",
  },
  cardMilesUnit: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textAlign: "right",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceLabel: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceInput: {
    flex: 1,
    backgroundColor: T.surfaceHi,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.border,
    color: T.ink,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    fontSize: 18,
    color: T.faint,
    lineHeight: 20,
  },
  cardNote: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    marginTop: 8,
  },
  belowMinText: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.warn,
    marginTop: 6,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: T.borderHi,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: T.display,
    fontSize: 22,
    color: T.ink,
  },
  modalSubtitle: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.faint,
    marginTop: 4,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseBtnText: {
    fontSize: 24,
    color: T.mist,
    lineHeight: 28,
  },
  pickerList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  pickerBankHeader: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 4,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  pickerRowDisabled: {
    opacity: 0.4,
  },
  pickerRowText: {
    flex: 1,
  },
  pickerEntryName: {
    fontFamily: T.body,
    fontSize: 13,
    color: T.ink,
  },
  pickerEntryNote: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    marginTop: 2,
  },
  pickerAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.goldDim,
    borderWidth: 1,
    borderColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerAddBtnText: {
    fontSize: 18,
    color: T.gold,
    lineHeight: 22,
  },
});
