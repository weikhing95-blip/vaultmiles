import { useState, useEffect, useRef, useMemo } from "react";
import { T, P } from "../theme.js";
import { fmt, monthsUntil } from "../utils.js";
import {
  SectionLabel,
  Pill,
  ScanIcon,
  Spinner,
  ListIcon,
  CarouselIcon,
  PlusIcon,
} from "../components/primitives.jsx";
import { VaultMilesLogo } from "../components/CardArt.jsx";
import { CardRow } from "../components/CardRow.jsx";
import { CardTile } from "../components/CardTile.jsx";
import {
  Surface,
  ProgressBar,
  Button,
  EmptyState,
  Skeleton,
  SegmentedControl,
} from "../components/ui.jsx";

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
  smartScan,
  scanning,
  user,
  onChangeCard,
}) {
  const animatedMiles = useCountUp(totalMiles);
  const scanRef = useRef();

  // Card view preference (list | carousel) — persisted per user. List is default.
  const [cardView, setCardView] = useState("list");
  useEffect(() => {
    if (!user?.id) return;
    try {
      const saved = localStorage.getItem(`vm_cardview_${user.id}`);
      if (saved === "list" || saved === "carousel") setCardView(saved);
    } catch {
      /* ignore */
    }
  }, [user?.id]);
  function changeView(v) {
    setCardView(v);
    if (user?.id) {
      try {
        localStorage.setItem(`vm_cardview_${user.id}`, v);
      } catch {
        /* ignore */
      }
    }
  }

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

      {/* Hero — Aurora preview */}
      <div style={P.hero}>
        <div style={P.heroLabel}>Total Convertible</div>
        <div
          style={{
            ...P.heroNumber,
            fontFamily: T.displayAlt,
            fontWeight: 700,
            background: T.aurora,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "none",
            filter: "drop-shadow(0 0 28px rgba(124,92,255,0.35))",
          }}
        >
          {fmt(animatedMiles)}
        </div>
        <div style={P.heroUnit}>KrisFlyer Miles</div>
        <div
          style={{
            ...P.heroRule,
            background: T.aurora,
          }}
        />
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
                  <ProgressBar pct={pct} tone="aurora" />
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {dataReady && rows.length >= 2 && (
              <SegmentedControl
                full={false}
                value={cardView}
                onChange={changeView}
                options={[
                  { value: "list", label: <ListIcon /> },
                  { value: "carousel", label: <CarouselIcon /> },
                ]}
              />
            )}
            <button
              className="v-add"
              onClick={() => scanRef.current?.click()}
              disabled={scanning}
              title="Scan a screenshot"
              aria-label="Scan a screenshot"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              {scanning ? <Spinner size={14} /> : <ScanIcon />}
            </button>
            <button
              className="v-add"
              onClick={addCard}
              title="Add card"
              aria-label="Add card"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              <PlusIcon />
            </button>
          </div>
        </div>
        <input
          ref={scanRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) smartScan(e.target.files[0]);
            e.target.value = "";
          }}
        />

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
            hint="Scan a rewards screenshot — we'll detect the card — or add one manually"
            action={
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  variant="primary"
                  onClick={() => scanRef.current?.click()}
                  disabled={scanning}
                >
                  {scanning ? "Scanning…" : "Scan a screenshot"}
                </Button>
                <Button variant="secondary" onClick={addCard}>
                  Add manually
                </Button>
              </div>
            }
          />
        ) : cardView === "carousel" ? (
          <div
            className="v-carousel"
            style={{
              display: "flex",
              gap: T.space[3],
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              paddingBottom: T.space[2],
              margin: "0 -20px",
              paddingInline: 20,
            }}
          >
            {rows.map((row) => (
              <div
                key={row.uid}
                style={{ flex: "0 0 86%", maxWidth: 360, scrollSnapAlign: "center" }}
              >
                <CardTile
                  row={row}
                  onChange={(patch) => updateHold(row.uid, patch)}
                  onRemove={() => removeHold(row.uid)}
                  onChangeCard={onChangeCard}
                />
              </div>
            ))}
          </div>
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
