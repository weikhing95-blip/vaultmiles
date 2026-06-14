import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { T } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useHoldings } from "../../hooks/useHoldings";
import { CATALOG, CatalogEntry } from "../../constants/catalog";

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { catalog, updateRate, resetCatalog } = useHoldings();
  const [ratesOpen, setRatesOpen] = useState(false);

  const displayCatalog = catalog.filter((c) => c.id !== "krisflyer");

  function handleSignOut() {
    Alert.alert("Sign out?", "Your data stays on this device.", [
      { text: "Cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  }

  function handleResetCatalog() {
    Alert.alert(
      "Reset rates?",
      "This will restore all conversion rates to Jun 2026 defaults.",
      [
        { text: "Cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => resetCatalog(),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.header}>
          <Text style={styles.headerSub}>PREFERENCES</Text>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Account section */}
        <SectionLabel label="ACCOUNT" />
        {user ? (
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>
                  {user.name[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{user.name}</Text>
                <Text style={styles.accountEmail}>{user.email}</Text>
                {user.kfNum ? (
                  <Text style={styles.accountKf}>{user.kfNum}</Text>
                ) : null}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.accountEmail}>Not signed in</Text>
          </View>
        )}

        {/* Conversion rates section */}
        <View style={styles.ratesSectionHeader}>
          <SectionLabel label="CONVERSION RATES" />
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setRatesOpen((v) => !v)}
          >
            <Text style={styles.toggleBtnText}>
              {ratesOpen ? "hide ↑" : "edit ↓"}
            </Text>
          </TouchableOpacity>
        </View>

        {ratesOpen && (
          <>
            <View style={styles.tableCard}>
              {/* Header row */}
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.tableHeaderCell, styles.colProgram]}>
                  Program
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colNum]}>Pts</Text>
                <Text style={[styles.tableHeaderCell, styles.colNum]}>Miles</Text>
                <Text style={[styles.tableHeaderCell, styles.colNum]}>Min</Text>
                <Text style={[styles.tableHeaderCell, styles.colNum]}>Fee S$</Text>
              </View>

              {/* Data rows */}
              {displayCatalog.map((c, idx) => (
                <View
                  key={c.id}
                  style={[
                    styles.tableRow,
                    idx < displayCatalog.length - 1 && styles.tableRowBorder,
                  ]}
                >
                  {/* Program column */}
                  <View style={styles.colProgram}>
                    <Text style={styles.bankName}>{c.bank}</Text>
                    <Text style={styles.programName}>{c.name}</Text>
                  </View>

                  {/* blockPts */}
                  <View style={styles.colNum}>
                    <TextInput
                      style={styles.rateInput}
                      value={String(c.blockPts)}
                      onChangeText={(v) => updateRate(c.id, "blockPts", v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  </View>

                  {/* blockMiles */}
                  <View style={styles.colNum}>
                    <TextInput
                      style={styles.rateInput}
                      value={String(c.blockMiles)}
                      onChangeText={(v) => updateRate(c.id, "blockMiles", v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  </View>

                  {/* min */}
                  <View style={styles.colNum}>
                    <TextInput
                      style={styles.rateInput}
                      value={String(c.min)}
                      onChangeText={(v) => updateRate(c.id, "min", v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  </View>

                  {/* fee */}
                  <View style={styles.colNum}>
                    <TextInput
                      style={styles.rateInput}
                      value={String(c.fee)}
                      onChangeText={(v) => updateRate(c.id, "fee", v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetCatalog}
            >
              <Text style={styles.resetBtnText}>
                Reset to Jun 2026 defaults
              </Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              Edit when a bank changes its conversion ratio. All balances
              recalculate immediately.
            </Text>
          </>
        )}

        {/* About section */}
        <SectionLabel label="ABOUT" />
        <View style={styles.card}>
          {[
            ["App", "VaultMiles"],
            ["Version", "1.0.0"],
            ["Rates updated", "Jun 2026"],
            ["Coverage", "DBS · UOB · OCBC · Citi · HSBC · SC · Amex"],
            ["Award chart", "KrisFlyer (SQ/MI)"],
          ].map(([key, value], idx, arr) => (
            <View
              key={key}
              style={[styles.aboutRow, idx < arr.length - 1 && styles.aboutRowBorder]}
            >
              <Text style={styles.aboutKey}>{key}</Text>
              <Text style={styles.aboutValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
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
    backgroundColor: T.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Page header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerSub: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: T.display,
    fontSize: 28,
    color: T.ink,
  },

  /* Section label */
  sectionLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 10,
  },

  /* Rates section header row */
  ratesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
  },
  toggleBtn: {
    marginTop: 28,
    marginBottom: 10,
  },
  toggleBtnText: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.faint,
  },

  /* Generic card */
  card: {
    marginHorizontal: 20,
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
  },

  /* Account card */
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.goldDim,
    borderWidth: 1,
    borderColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontFamily: T.display,
    fontSize: 20,
    color: T.goldSoft,
  },
  accountInfo: {
    marginLeft: 12,
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: "500",
    color: T.ink,
    marginBottom: 2,
  },
  accountEmail: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.mist,
    marginBottom: 2,
  },
  accountKf: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.faint,
  },

  /* Rates table */
  tableCard: {
    marginHorizontal: 20,
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
  },
  tableHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  tableHeaderCell: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textTransform: "uppercase",
    paddingVertical: 10,
  },
  colProgram: {
    flex: 2.2,
    paddingRight: 6,
  },
  colNum: {
    flex: 1,
    alignItems: "flex-end",
  },
  bankName: {
    fontSize: 9,
    color: T.faint,
    marginBottom: 1,
  },
  programName: {
    fontSize: 11,
    color: T.ink,
  },
  rateInput: {
    backgroundColor: T.surfaceHi,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 6,
    color: T.ink,
    fontFamily: T.mono,
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: "right",
    minWidth: 48,
  },

  /* Reset button */
  resetBtn: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetBtnText: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.mist,
  },

  /* Help text */
  helpText: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    lineHeight: 16,
    marginTop: 10,
    marginHorizontal: 20,
  },

  /* About section */
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  aboutRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  aboutKey: {
    fontFamily: T.mono,
    fontSize: 12,
    color: T.faint,
  },
  aboutValue: {
    fontFamily: T.mono,
    fontSize: 12,
    color: T.ink,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },

  /* Sign out */
  signOutBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 40,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "500",
    color: T.warn,
  },
});
