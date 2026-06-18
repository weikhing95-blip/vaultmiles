import { useState, useEffect, useRef, useMemo } from "react";
import { T, P } from "../theme.js";
import { fmt, monthsUntil } from "../utils.js";
import { SectionLabel, Pill } from "../components/primitives.jsx";
import { VaultMilesLogo } from "../components/CardArt.jsx";
import { CardRow } from "../components/CardRow.jsx";
import { Surface, ProgressBar, Button, EmptyState, Skeleton } from "../components/ui.jsx";

const PRM =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion:reduce)").matches;

function useCountUp(to) {
  const [v, setV] = useState(to);
  const prev = useRef(to);
  useEffect(() => {
    if (PRM) {
      setV(to);
      prev.current = to;
      return;
    }
    const from = prev.current;
    if (from === to) {
      setV(to);
      return;
    }
    let raf;
    const dur = 800,
      start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setV(Math.round(from + (to - from) * (1 - Math.pow(1 - t, 4))));
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return v;
}

export function TabCards({
  rows,
  totalMiles,
  totalFees,
  dataReady,
  catalog,
  addCard,
  updateHold,
  removeHold,
  handleScan,
  user,
  onChangeCard,
}) {
  const animatedMiles = useCountUp(totalMiles);

  const firstName = useMemo(() => {
    if (!user?.name) return "";
    return user.name.trim().split(/\s+/)[0];
  }, [user?.name]);

  const totalStrandedCount = useMemo(
    () => rows.filter((r) => r.stranded > 0 && r.miles > 0).length,
    [rows]
  );

  const bankBreakdown = useMemo(() => {
    const withMiles = rows.filter((r) => r.miles > 0);
    return withMiles.sort((a, b) => b.miles - a.miles);
  }, [rows]);

  const expiringCount = useMemo(
    () =>
      rows.filter((r) => {
        const mu = monthsUntil(r.expiry);
        return mu != null && mu < 6;
      }).length,
    [rows]
  );

  const hasFees = totalFees > 0;
  const hasStranded = totalStrandedCount > 0;
  const hasExpiring = expiringCount > 0;

  return (
    <div style={P.page}>
      {/* Page header */}
      <div style={P.pageHeader}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <VaultMilesLogo size={22} />
            <span
              style={{
                fontFamily: T.display,
                fontSize: 15,
                fontWeight: 600,
                color: T.goldSoft,
                letterSpacing: "0.04em",
              }}
            >
              VaultMiles
            </span>
          </div>
          <div style={P.pageHeaderSub}>Welcome back</div>
          <div style={P.pageHeaderTitle}>{firstName || "Traveller"}</div>
        </div>
        <div style={P.kfBadge}>{user?.kfNum ? user.kfNum : "No KF # set"}</div>
      </div>

      {/* Hero */}
      <div style={P.hero}>
        <div style={P.heroLabel}>Total Convertible</div>
        <div style={P.heroNumber}>{fmt(animatedMiles)}</div>
        <div style={P.heroUnit}>KrisFlyer Miles</div>
        <div style={P.heroRule} />
        <div style={P.heroPills}>
          {hasFees && <Pill warn>S${totalFees.toFixed(2)} in fees</Pill>}
          {hasStranded && (
            <Pill>
              {totalStrandedCount} card{totalStrandedCount !== 1 ? "s" : ""} with leftover pts
            </Pill>
          )}
          {hasExpiring && (
            <Pill warn>
              {expiringCount} card{expiringCount !== 1 ? "s" : ""} expiring within 6 months
            </Pill>
          )}
          {!hasFees && !hasStranded && !hasExpiring && totalMiles > 0 && (
            <Pill good>All points optimised</Pill>
          )}
        </div>
      </div>

      {/* By bank breakdown */}
      {bankBreakdown.length > 0 && (
        <div style={{ ...P.section }}>
          <div style={P.sectionHead}>
            <SectionLabel>By bank</SectionLabel>
          </div>
          <Surface level="e1" radius="lg" style={{ padding: "0 16px" }}>
            {bankBreakdown.map((row, i) => {
              const pct = totalMiles > 0 ? (row.miles / totalMiles) * 100 : 0;
              const isLast = i === bankBreakdown.length - 1;
              return (
                <div
                  key={row.uid}
                  style={{
                    padding: "10px 0",
                    borderBottom: isLast ? "none" : `1px solid ${T.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: T.body,
                          fontSize: 13,
                          fontWeight: 500,
                          color: T.ink,
                          marginBottom: 2,
                        }}
                      >
                        {row.src?.bank ?? ""}
                      </div>
                      <div
                        style={{
                          fontFamily: T.mono,
                          fontSize: 10,
                          color: T.faint,
                        }}
                      >
                        {row.src?.name ?? ""}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                        {row.fee > 0 && (
                          <span
                            style={{
                              fontFamily: T.mono,
                              fontSize: 9,
                              color: T.warn,
                            }}
                          >
                            S${row.fee.toFixed(2)} fee
                          </span>
                        )}
                        {row.stranded > 0 && (
                          <span
                            style={{
                              fontFamily: T.mono,
                              fontSize: 9,
                              color: T.faint,
                            }}
                          >
                            {fmt(row.stranded)} pts leftover
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: 14,
                        fontWeight: 600,
                        color: T.goldSoft,
                        textAlign: "right",
                        flexShrink: 0,
                        marginLeft: 12,
                      }}
                    >
                      {fmt(row.miles)}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <ProgressBar pct={pct} />
                </div>
              );
            })}
          </Surface>
        </div>
      )}

      {/* Cards section */}
      <div style={P.section}>
        <div style={P.sectionHead}>
          <SectionLabel>Your cards</SectionLabel>
          <button className="v-add" onClick={addCard}>
            + Add card
          </button>
        </div>

        {!dataReady ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <Surface key={i} level="e1" radius="lg">
                <Skeleton w="40%" h={14} style={{ marginBottom: T.space[3] }} />
                <Skeleton w="70%" h={22} style={{ marginBottom: T.space[2] }} />
                <Skeleton w="100%" h={3} radius="pill" />
              </Surface>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No cards yet"
            hint="Add your first rewards card to start tracking your miles"
            action={
              <Button variant="primary" onClick={addCard}>
                Add your first card
              </Button>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((row, i) => (
              <div
                key={row.uid}
                style={{
                  animation: PRM
                    ? "none"
                    : `vsheet ${T.motion.base}ms ${T.motion.easeDecelerate} both`,
                  animationDelay: PRM ? undefined : `${i * 40}ms`,
                }}
              >
                <CardRow
                  row={row}
                  catalog={catalog}
                  onChange={(patch) => updateHold(row.uid, patch)}
                  onRemove={() => removeHold(row.uid)}
                  onScan={(file) => handleScan(row.uid, file)}
                  onChangeCard={onChangeCard}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
