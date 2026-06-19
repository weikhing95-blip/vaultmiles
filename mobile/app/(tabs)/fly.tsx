import { useState, useMemo } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { T } from "../../constants/theme";
import { DESTINATIONS, CABIN_OPTIONS, REDEEM_OPTIONS } from "../../constants/destinations";
import type { CabinId, RedeemId } from "../../constants/destinations";
import { getMiles, fmt, flag } from "../../lib/calculator";
import { favKey, type Favourite } from "../../lib/storage";
import { useHoldingsCtx } from "../../context/holdings";
import { ProgressBar } from "../../components/ui";

const FAV_REGION = "♥ Saved";

export default function FlyScreen() {
  const { totalMiles, favourites, toggleFav } = useHoldingsCtx();

  const [cabin, setCabin] = useState<CabinId>("eco");
  const [redeem, setRedeem] = useState<RedeemId>("saver");
  const [trip, setTrip] = useState<"oneway" | "return">("oneway");
  const [region, setRegion] = useState<string>("All");
  const [showControls, setShowControls] = useState(true);
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Coerce premEco + non-saver to saver
  const effectiveRedeem: RedeemId = cabin === "premEco" && redeem !== "saver" ? "saver" : redeem;
  const showPremEcoWarning = cabin === "premEco" && redeem !== "saver";

  const regions = useMemo(() => {
    const set = new Set(DESTINATIONS.map((d) => d.region));
    return [FAV_REGION, "All", ...Array.from(set)];
  }, []);

  const favSet = useMemo(() => new Set(favourites.map(favKey)), [favourites]);
  const favView = region === FAV_REGION;

  // Saved favourites resolved to their destination + own cabin/tier/trip
  const favItems = useMemo(() => {
    return favourites
      .map((f) => {
        const dest = DESTINATIONS.find((d) => d.city === f.city && d.country === f.country);
        if (!dest) return null;
        const eff: RedeemId =
          f.cabin === "premEco" && f.tier !== "saver" ? "saver" : (f.tier as RedeemId);
        return {
          dest,
          miles: getMiles(dest, eff, f.cabin as CabinId, f.trip as "oneway" | "return"),
          cabin: f.cabin as CabinId,
          tier: eff,
          trip: f.trip as "oneway" | "return",
        };
      })
      .filter(Boolean) as {
      dest: (typeof DESTINATIONS)[number];
      miles: number | null;
      cabin: CabinId;
      tier: RedeemId;
      trip: "oneway" | "return";
    }[];
  }, [favourites]);

  const activeCabinOpt = CABIN_OPTIONS.find((c) => c.id === cabin);
  const activeRedeemOpt = REDEEM_OPTIONS.find((r) => r.id === redeem);

  const filtered = useMemo(() => {
    return DESTINATIONS.filter((d) => region === "All" || d.region === region);
  }, [region]);

  const withMiles = useMemo(() => {
    return filtered.map((d) => ({
      dest: d,
      miles: getMiles(d, effectiveRedeem, cabin, trip),
    }));
  }, [filtered, effectiveRedeem, cabin, trip]);

  const reachableCount = useMemo(
    () =>
      (favView ? favItems : withMiles).filter(
        (item) => item.miles != null && totalMiles >= item.miles
      ).length,
    [favView, favItems, withMiles, totalMiles]
  );

  const unavailableCount = useMemo(
    () => withMiles.filter((item) => item.miles == null).length,
    [withMiles]
  );

  const sorted = useMemo(() => {
    const available = withMiles.filter((item) => item.miles != null);
    const unavailable = withMiles.filter((item) => item.miles == null);

    const reachable = available
      .filter((item) => totalMiles >= (item.miles ?? Infinity))
      .sort((a, b) => (a.miles ?? 0) - (b.miles ?? 0));

    const unreachable = available
      .filter((item) => totalMiles < (item.miles ?? Infinity))
      .sort((a, b) => (a.miles ?? 0) - (b.miles ?? 0));

    return [...reachable, ...unreachable, ...(showUnavailable ? unavailable : [])];
  }, [withMiles, totalMiles, showUnavailable]);

  // Progress-to-next-reward (DS-23): cheapest destination just out of reach in
  // this view. `sorted` is reachable-first then ascending, so the first
  // unreachable item is the next reward. Only meaningful with some miles.
  const nextReward = useMemo(() => {
    if (favView || totalMiles <= 0) return null;
    const item = sorted.find((it) => it.miles != null && totalMiles < it.miles);
    if (!item || item.miles == null) return null;
    return {
      dest: item.dest,
      miles: item.miles,
      pct: (totalMiles / item.miles) * 100,
      diff: item.miles - totalMiles,
    };
  }, [favView, totalMiles, sorted]);

  // Unified list: Saved view uses each favourite's own cabin/tier/trip;
  // normal view uses the current controls.
  const displayItems = favView
    ? favItems
    : sorted.map((it) => ({ ...it, cabin, tier: effectiveRedeem, trip }));

  const filterLabel = showControls
    ? "▴ Hide Filters"
    : `▾ Filters · ${activeCabinOpt?.short ?? ""} · ${trip} · ${activeRedeemOpt?.label ?? ""}`;

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
            <Text style={styles.headerSub}>FROM SINGAPORE</Text>
            <Text style={styles.headerTitle}>Where to Fly</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reachableNum}>{reachableCount}</Text>
            <Text style={styles.reachableLabel}>REACHABLE</Text>
          </View>
        </View>

        {/* Filter toggle button */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowControls((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.filterToggleText}>{filterLabel}</Text>
        </TouchableOpacity>

        {/* Controls panel (hidden in Saved view) */}
        {showControls && !favView && (
          <View style={styles.controlsCard}>
            {/* CABIN row */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>CABIN</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {CABIN_OPTIONS.map((opt) => {
                  const active = cabin === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setCabin(opt.id as CabinId)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active ? styles.chipTextActive : styles.chipTextInactive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* TRIP row */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>TRIP</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {(["oneway", "return"] as const).map((t) => {
                  const active = trip === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTrip(t)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active ? styles.chipTextActive : styles.chipTextInactive,
                        ]}
                      >
                        {t === "oneway" ? "One-way" : "Return"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* TYPE row */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>TYPE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {REDEEM_OPTIONS.map((opt) => {
                  const active = redeem === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setRedeem(opt.id as RedeemId)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active ? styles.chipTextActive : styles.chipTextInactive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <Text style={styles.redeemDesc}>{activeRedeemOpt?.desc ?? ""}</Text>

            {/* premEco + non-saver warning */}
            {showPremEcoWarning && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Premium Economy only available as Saver — showing Saver rates
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Your miles pill */}
        <View style={styles.milesPill}>
          <Text style={styles.milesPillLabel}>Your miles{"  "}</Text>
          <Text style={styles.milesPillValue}>{fmt(totalMiles)}</Text>
        </View>

        {/* Progress to next reward (DS-23) */}
        {nextReward && (
          <View style={styles.nextRewardCard}>
            <View style={styles.nextRewardTop}>
              <Text style={styles.nextRewardLabel}>NEXT REWARD</Text>
              <Text style={styles.nextRewardDest}>
                {flag(nextReward.dest.country)} {nextReward.dest.city}
              </Text>
            </View>
            <ProgressBar pct={nextReward.pct} tone="gold" />
            <Text style={styles.nextRewardMeta}>
              {fmt(nextReward.diff)} miles to go · {Math.floor(nextReward.pct)}%
            </Text>
          </View>
        )}

        {/* Region filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionRow}
        >
          {regions.map((r) => {
            const active = region === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRegion(r)}
                style={[
                  styles.chip,
                  active ? styles.chipActive : styles.chipInactive,
                  styles.regionChip,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Saved (favourites) empty state */}
        {favView && favItems.length === 0 && (
          <Text style={styles.emptyFav}>
            No favourites yet.{"\n"}Tap ♡ on any route to save it here.
          </Text>
        )}

        {/* Destination list */}
        {displayItems.map((item) => {
          const { dest, miles } = item;
          const itemCabin = item.cabin;
          const itemTier = item.tier;
          const itemTrip = item.trip;
          const favSpec: Favourite = {
            origin: "SIN",
            city: dest.city,
            country: dest.country,
            cabin: itemCabin,
            tier: itemTier,
            trip: itemTrip,
          };
          const isFav = favSet.has(favKey(favSpec));
          if (miles == null) {
            // unavailable card (only shown when showUnavailable)
            return (
              <View key={`${dest.city}-${dest.country}`} style={styles.destCard}>
                <View style={styles.destTopRow}>
                  <View style={styles.destLeft}>
                    <Text style={styles.destFlag}>{flag(dest.country)}</Text>
                    <View style={styles.destCityWrap}>
                      <Text style={styles.destCity}>{dest.city}</Text>
                      <Text style={styles.destRegion}>{dest.region}</Text>
                    </View>
                  </View>
                  <View style={styles.destRight}>
                    <Text style={[styles.destMilesNum, { color: T.faint }]}>—</Text>
                    <Text style={styles.destMilesLabel}>unavailable</Text>
                  </View>
                </View>
              </View>
            );
          }

          const reachable = totalMiles >= miles;
          const progress = Math.min(100, (totalMiles / miles) * 100);
          const need = miles - totalMiles;

          // Tier chips for this destination (cabin comparison across non-null tiers)
          const tierChips = CABIN_OPTIONS.map((opt) => {
            const tierMiles = getMiles(dest, itemTier, opt.id as CabinId, itemTrip);
            if (tierMiles == null) return null;
            const isActive = opt.id === itemCabin;
            return (
              <View
                key={opt.id}
                style={[
                  styles.tierChip,
                  isActive ? styles.tierChipActive : styles.tierChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.tierChipText,
                    isActive ? styles.tierChipTextActive : styles.tierChipTextInactive,
                  ]}
                >
                  {opt.short} {fmt(tierMiles)}
                </Text>
              </View>
            );
          }).filter(Boolean);

          return (
            <View
              key={`${dest.city}-${dest.country}`}
              style={[styles.destCard, reachable && styles.destCardReachable]}
            >
              {/* Top row */}
              <View style={styles.destTopRow}>
                <View style={styles.destLeft}>
                  <Text style={styles.destFlag}>{flag(dest.country)}</Text>
                  <View style={styles.destCityWrap}>
                    <Text style={styles.destCity}>{dest.city}</Text>
                    <Text style={styles.destRegion}>{dest.region}</Text>
                  </View>
                </View>
                <View style={styles.destRight}>
                  <Text style={[styles.destMilesNum, { color: reachable ? T.goldSoft : T.ink }]}>
                    {fmt(miles)}
                  </Text>
                  <Text style={styles.destMilesLabel}>
                    mi {itemTrip === "oneway" ? "one-way" : "return"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleFav(favSpec)}
                    hitSlop={10}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.favHeart, isFav && styles.favHeartActive]}>
                      {isFav ? "♥" : "♡"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tier comparison chips */}
              {tierChips.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tierRow}
                >
                  {tierChips}
                </ScrollView>
              )}

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
              </View>

              {/* Status */}
              {reachable ? (
                <Text style={styles.statusReachable}>✓ You can fly</Text>
              ) : (
                <Text style={styles.statusUnreachable}>+{fmt(need)} miles needed</Text>
              )}
            </View>
          );
        })}

        {/* Show unavailable toggle */}
        {unavailableCount > 0 && (
          <TouchableOpacity
            style={styles.unavailableToggle}
            onPress={() => setShowUnavailable((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.unavailableToggleText}>
              {showUnavailable
                ? "Hide unavailable"
                : `Show ${unavailableCount} unavailable destination${unavailableCount !== 1 ? "s" : ""}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          KrisFlyer award rates from Singapore · SQ, updated Jun 2026
        </Text>
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
    paddingBottom: 8,
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
  headerRight: {
    alignItems: "flex-end",
  },
  reachableNum: {
    fontFamily: T.display,
    fontSize: 26,
    color: T.goldSoft,
  },
  reachableLabel: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  /* Filter toggle */
  filterToggle: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  filterToggleText: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.faint,
  },

  /* Controls card */
  controlsCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 4,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  controlLabel: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    width: 44,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    paddingRight: 8,
  },
  redeemDesc: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.mist,
    marginLeft: 44,
    marginTop: -4,
    marginBottom: 6,
  },
  warningBox: {
    backgroundColor: "rgba(201,123,90,0.12)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.warn,
    padding: 10,
    marginTop: 6,
  },
  warningText: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.warn,
  },

  /* Chips */
  chip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: T.goldDim,
    borderColor: T.gold,
  },
  chipInactive: {
    backgroundColor: T.surfaceHi,
    borderColor: T.border,
  },
  chipText: {
    fontFamily: T.mono,
    fontSize: 10.5,
  },
  chipTextActive: {
    color: T.gold,
  },
  chipTextInactive: {
    color: T.mist,
  },

  /* Miles pill */
  milesPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  milesPillLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
  },
  milesPillValue: {
    fontFamily: T.mono,
    fontSize: 13,
    color: T.goldSoft,
    fontWeight: "700",
  },

  /* Next reward (DS-23) */
  nextRewardCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nextRewardTop: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  nextRewardLabel: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  nextRewardDest: {
    fontFamily: T.body,
    fontSize: 13,
    fontWeight: "500",
    color: T.ink,
    flexShrink: 1,
    textAlign: "right",
  },
  nextRewardMeta: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.mist,
    marginTop: 8,
  },

  /* Region filter */
  regionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 6,
    paddingBottom: 8,
    paddingRight: 16,
  },
  regionChip: {
    marginBottom: 0,
  },

  /* Destination card */
  destCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
  },
  destCardReachable: {
    borderColor: "rgba(107,175,137,0.35)",
  },
  destTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  destLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  destFlag: {
    fontSize: 24,
    marginRight: 10,
    lineHeight: 28,
  },
  destCityWrap: {
    flex: 1,
  },
  destCity: {
    fontSize: 14,
    fontWeight: "500",
    color: T.ink,
    marginBottom: 2,
  },
  destRegion: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    textTransform: "uppercase",
  },
  destRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  destMilesNum: {
    fontFamily: T.mono,
    fontSize: 18,
    fontWeight: "700",
  },
  destMilesLabel: {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.faint,
    marginTop: 1,
  },

  /* Favourite heart */
  favHeart: {
    fontSize: 16,
    color: T.faint,
    marginTop: 4,
  },
  favHeartActive: {
    color: T.gold,
  },
  emptyFav: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.faint,
    textAlign: "center",
    lineHeight: 18,
    paddingVertical: 40,
    paddingHorizontal: 16,
  },

  /* Tier chips */
  tierRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 10,
    paddingRight: 4,
  },
  tierChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  tierChipActive: {
    backgroundColor: T.goldDim,
    borderColor: T.gold,
  },
  tierChipInactive: {
    backgroundColor: T.surfaceHi,
    borderColor: T.border,
  },
  tierChipText: {
    fontFamily: T.mono,
    fontSize: 9,
  },
  tierChipTextActive: {
    color: T.gold,
  },
  tierChipTextInactive: {
    color: T.faint,
  },

  /* Progress bar */
  progressTrack: {
    height: 2,
    backgroundColor: T.border,
    borderRadius: 999,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: 2,
    backgroundColor: T.gold,
    borderRadius: 999,
  },

  /* Status */
  statusReachable: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.good,
  },
  statusUnreachable: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.faint,
  },

  /* Unavailable toggle */
  unavailableToggle: {
    alignItems: "center",
    padding: 16,
  },
  unavailableToggleText: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.faint,
  },

  /* Footer */
  footer: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
});
