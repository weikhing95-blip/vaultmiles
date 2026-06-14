import { useState, useEffect, useRef, useMemo } from "react";
import { T, P } from "../theme.js";
import { fmt } from "../utils.js";
import { SectionLabel, Pill, EmptyState, Spinner } from "../components/primitives.jsx";
import { VaultMilesLogo } from "../components/CardArt.jsx";
import { CardRow } from "../components/CardRow.jsx";

const PRM =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion:reduce)").matches;

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

  const hasFees = totalFees > 0;
  const hasStranded = totalStrandedCount > 0;

  return (
    <div style={P.page}>
      {/* Page header */}
      <div style={P.pageHeader}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <VaultMilesLogo size={28} />
            <span
              style={{
                fontFamily: T.display,
                fontSize: 17,
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
        <div style={P.kfBadge}>
          {user?.kfNum ? user.kfNum : "No KF # set"}
        </div>
      </div>

      {/* Hero */}
      <div style={P.hero}>
        <div style={P.heroLabel}>Total Convertible</div>
        <div style={P.heroNumber}>{fmt(animatedMiles)}</div>
        <div style={P.heroUnit}>KrisFlyer Miles</div>
        <div style={P.heroRule} />
        <div style={P.heroPills}>
          {hasFees && (
            <Pill warn>S${totalFees.toFixed(2)} in fees</Pill>
          )}
          {hasStranded && (
            <Pill>
              {totalStrandedCount} card{totalStrandedCount !== 1 ? "s" : ""} with leftover pts
            </Pill>
          )}
          {!hasFees && !hasStranded && totalMiles > 0 && (
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
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "0 16px",
            }}
          >
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
                  <div
                    style={{
                      height: 2,
                      background: T.border,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: T.gold,
                        borderRadius: 2,
                        transition: PRM ? "none" : "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <Spinner size={20} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon="✦"
            title="No cards yet"
            desc="Add your first rewards card to start tracking your miles"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((row) => (
              <CardRow
                key={row.uid}
                row={row}
                catalog={catalog}
                onChange={(patch) => updateHold(row.uid, patch)}
                onRemove={() => removeHold(row.uid)}
                onScan={(file) => handleScan(row.uid, file)}
                onChangeCard={onChangeCard}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
