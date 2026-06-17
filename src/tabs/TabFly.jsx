import { useState } from "react";
import { T, P } from "../theme.js";
import { DESTINATIONS, CABIN_OPTIONS, REDEEM_OPTIONS } from "../data.js";
import { fmt, flag, favKey } from "../utils.js";
import { SectionLabel } from "../components/primitives.jsx";

const ALL_REGIONS = ["All", ...Array.from(new Set(DESTINATIONS.map((d) => d.region)))];

function getMiles(dest, redeem, cabin, tripType) {
  const base = dest.miles[redeem]?.[cabin];
  if (base == null) return null;
  return tripType === "return" ? base * 2 : base;
}

function ControlRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 32 }}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          color: T.faint,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          width: 38,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function DestCard({ dest, cabin, redeem, trip, totalMiles, isFav, onToggleFav }) {
  const miles = getMiles(dest, redeem, cabin, trip);
  const reachable = miles != null && totalMiles >= miles;
  const pct = miles != null ? Math.min(100, (totalMiles / miles) * 100) : 0;
  const diff = miles != null ? miles - totalMiles : 0;
  const favSpec = {
    origin: "SIN",
    city: dest.city,
    country: dest.country,
    cabin,
    tier: redeem,
    trip,
  };

  const tierChips = REDEEM_OPTIONS.map((opt) => {
    const m = getMiles(dest, opt.id, cabin, trip);
    if (m == null) return null;
    const active = opt.id === redeem;
    return (
      <span
        key={opt.id}
        style={{
          fontFamily: T.mono,
          fontSize: 9.5,
          letterSpacing: "0.04em",
          padding: "2px 7px",
          borderRadius: 5,
          border: `1px solid ${active ? T.gold : T.border}`,
          color: active ? T.gold : T.faint,
          background: active ? T.goldDim : "transparent",
          whiteSpace: "nowrap",
        }}
      >
        {opt.label} {fmt(m)}
      </span>
    );
  }).filter(Boolean);

  const borderColor =
    miles == null ? T.border : reachable ? "rgba(107,175,137,0.4)" : "rgba(201,123,90,0.35)";

  const bgColor = miles == null ? T.surface : reachable ? T.surface : "rgba(201,123,90,0.04)";

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Top row */}
      <div
        style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, minWidth: 0 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>{flag(dest.country)}</span>
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                fontFamily: T.body,
                fontSize: 14,
                fontWeight: 500,
                color: T.ink,
              }}
            >
              {dest.city}
            </span>
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                color: T.faint,
                marginLeft: 6,
              }}
            >
              {dest.region}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {miles != null ? (
            <>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 13,
                  fontWeight: 600,
                  color: reachable ? T.goldSoft : T.warn,
                }}
              >
                {fmt(miles)}
              </span>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 9,
                  color: reachable ? T.faint : T.warn,
                  marginLeft: 4,
                  opacity: reachable ? 1 : 0.7,
                }}
              >
                mi {trip === "return" ? "return" : "one-way"}
              </span>
            </>
          ) : (
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>—</span>
          )}
          {onToggleFav && miles != null && (
            <div style={{ marginTop: 4 }}>
              <button
                onClick={() => onToggleFav(favSpec)}
                title={isFav ? "Remove from favourites" : "Save to favourites"}
                aria-label={isFav ? "Remove from favourites" : "Save to favourites"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 14,
                  lineHeight: 1,
                  color: isFav ? T.gold : T.faint,
                }}
              >
                {isFav ? "♥" : "♡"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {miles != null && (
        <div
          style={{
            height: 2,
            borderRadius: 2,
            background: reachable ? T.border : "rgba(201,123,90,0.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: reachable ? T.good : T.warn,
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Status */}
      {miles != null && (
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            color: reachable ? T.good : T.warn,
          }}
        >
          {reachable ? "✓ You can fly" : `+${fmt(diff)} miles needed`}
        </div>
      )}

      {/* Tier chips */}
      {tierChips.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{tierChips}</div>
      )}
    </div>
  );
}

const FAV_REGION = "♥ Saved";

export default function TabFly({ totalMiles, favourites = [], onToggleFav }) {
  const [region, setRegion] = useState("All");
  const [cabin, setCabin] = useState("eco");
  const [redeem, setRedeem] = useState("saver");
  const [trip, setTrip] = useState("oneway");
  const [showControls, setShowControls] = useState(true);
  const [showUnavailable, setShowUnavailable] = useState(false);

  const favSet = new Set(favourites.map(favKey));
  const favView = region === FAV_REGION;

  // Resolve each saved favourite to its destination + own cabin/tier/trip
  const favRows = favourites
    .map((f) => ({
      f,
      dest: DESTINATIONS.find((d) => d.city === f.city && d.country === f.country),
    }))
    .filter((x) => x.dest);

  const selectedRedeem = REDEEM_OPTIONS.find((o) => o.id === redeem);
  const selectedCabin = CABIN_OPTIONS.find((o) => o.id === cabin);
  const premEcoUnavailableWarning =
    cabin === "premEco" && (redeem === "advantage" || redeem === "access");

  // Filter by region
  const regionFiltered =
    region === "All" ? DESTINATIONS : DESTINATIONS.filter((d) => d.region === region);

  // Compute available/unavailable split
  const available = regionFiltered.filter((d) => getMiles(d, redeem, cabin, trip) != null);
  const unavailable = regionFiltered.filter((d) => getMiles(d, redeem, cabin, trip) == null);

  // Sort available: reachable first, then by miles ascending
  const sorted = [...available].sort((a, b) => {
    const ma = getMiles(a, redeem, cabin, trip);
    const mb = getMiles(b, redeem, cabin, trip);
    const ra = totalMiles >= ma;
    const rb = totalMiles >= mb;
    if (ra !== rb) return ra ? -1 : 1;
    return ma - mb;
  });

  const reachableCount = favView
    ? favRows.filter(({ f, dest }) => {
        const m = getMiles(dest, f.tier, f.cabin, f.trip);
        return m != null && totalMiles >= m;
      }).length
    : available.filter((d) => totalMiles >= getMiles(d, redeem, cabin, trip)).length;

  // Collapsed summary string
  const collapsedSummary = `${selectedCabin?.short ?? cabin} · ${trip === "oneway" ? "One-way" : "Return"} · ${selectedRedeem?.label ?? redeem}`;

  return (
    <div style={P.page}>
      {/* Page header */}
      <div style={P.pageHeader}>
        <div>
          <div style={P.pageHeaderSub}>From Singapore</div>
          <div style={P.pageHeaderTitle}>Where to Fly</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: T.display,
              fontSize: 26,
              fontWeight: 600,
              color: T.goldSoft,
              lineHeight: 1,
            }}
          >
            {reachableCount}
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              color: T.faint,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginTop: 4,
            }}
          >
            reachable
          </div>
        </div>
      </div>

      {/* Controls panel (hidden in Saved view) */}
      {!favView && (
        <div style={{ marginBottom: 16 }}>
          {/* Toggle button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
            <button
              onClick={() => setShowControls((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: T.mono,
                fontSize: 10,
                color: T.faint,
                padding: "2px 0",
              }}
            >
              {showControls ? "▴ Hide filters" : "▾ Filters"}
            </button>
          </div>

          {showControls ? (
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Cabin */}
              <ControlRow label="Cabin">
                {CABIN_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={cabin === opt.id ? "v-seg-active" : "v-seg"}
                    onClick={() => setCabin(opt.id)}
                  >
                    {opt.short}
                  </button>
                ))}
              </ControlRow>

              {/* Trip */}
              <ControlRow label="Trip">
                <button
                  className={trip === "oneway" ? "v-seg-active" : "v-seg"}
                  onClick={() => setTrip("oneway")}
                >
                  One-way
                </button>
                <button
                  className={trip === "return" ? "v-seg-active" : "v-seg"}
                  onClick={() => setTrip("return")}
                >
                  Return
                </button>
              </ControlRow>

              {/* Redeem type */}
              <ControlRow label="Type">
                {REDEEM_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={redeem === opt.id ? "v-seg-active" : "v-seg"}
                    onClick={() => setRedeem(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </ControlRow>

              {/* Redeem desc */}
              {selectedRedeem && (
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: T.mist,
                    paddingLeft: 48,
                  }}
                >
                  {selectedRedeem.desc}
                </div>
              )}

              {/* PremEco warning */}
              {premEcoUnavailableWarning && (
                <div
                  style={{
                    background: "rgba(201,123,90,0.1)",
                    border: "1px solid rgba(201,123,90,0.3)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: T.warn,
                  }}
                >
                  Prem. Economy is only available at Saver rates — showing Saver prices for PremEco.
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                color: T.faint,
                textAlign: "right",
              }}
            >
              {collapsedSummary}
            </div>
          )}
        </div>
      )}

      {/* Your miles banner */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            padding: "5px 14px",
            fontFamily: T.mono,
            fontSize: 11,
            color: T.mist,
          }}
        >
          Your miles:&nbsp;
          <span style={{ color: T.goldSoft, fontWeight: 600 }}>{fmt(totalMiles)}</span>
        </div>
      </div>

      {/* Region filter */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 2,
          marginBottom: 18,
          scrollbarWidth: "none",
        }}
      >
        {[FAV_REGION, ...ALL_REGIONS].map((r) => (
          <button
            key={r}
            className={region === r ? "v-pill-active" : "v-pill"}
            onClick={() => setRegion(r)}
          >
            {r === FAV_REGION && favourites.length ? `♥ Saved (${favourites.length})` : r}
          </button>
        ))}
      </div>

      {/* Destination list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Saved (favourites) view */}
        {favView && favRows.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              fontFamily: T.mono,
              fontSize: 11,
              color: T.faint,
              lineHeight: 1.7,
            }}
          >
            No favourites yet.
            <br />
            Tap ♡ on any route to save it here.
          </div>
        )}

        {favView &&
          favRows.map(({ f, dest }) => (
            <DestCard
              key={favKey(f)}
              dest={dest}
              cabin={f.cabin}
              redeem={f.tier}
              trip={f.trip}
              totalMiles={totalMiles}
              isFav={true}
              onToggleFav={onToggleFav}
            />
          ))}

        {!favView &&
          sorted.map((dest) => (
            <DestCard
              key={`${dest.city}-${dest.country}`}
              dest={dest}
              cabin={cabin}
              redeem={redeem}
              trip={trip}
              totalMiles={totalMiles}
              isFav={favSet.has(
                favKey({ origin: "SIN", city: dest.city, cabin, tier: redeem, trip })
              )}
              onToggleFav={onToggleFav}
            />
          ))}

        {/* Unavailable section */}
        {showUnavailable &&
          unavailable.map((dest) => (
            <div key={`${dest.city}-${dest.country}`} style={{ opacity: 0.5 }}>
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>{flag(dest.country)}</span>
                <span style={{ fontFamily: T.body, fontSize: 13, color: T.mist }}>{dest.city}</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>
                  {dest.region}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: T.faint,
                  }}
                >
                  Not available
                </span>
              </div>
            </div>
          ))}

        {/* Show/hide unavailable toggle */}
        {unavailable.length > 0 && (
          <button
            onClick={() => setShowUnavailable((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: T.mono,
              fontSize: 10,
              color: T.faint,
              padding: "8px 0",
              textAlign: "center",
              width: "100%",
            }}
          >
            {showUnavailable
              ? `Hide ${unavailable.length} unavailable`
              : `Show ${unavailable.length} unavailable`}
          </button>
        )}

        {!favView && sorted.length === 0 && unavailable.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              fontFamily: T.mono,
              fontSize: 11,
              color: T.faint,
            }}
          >
            No destinations in this region
          </div>
        )}
      </div>

      {/* Footer note */}
      <div
        style={{
          textAlign: "center",
          fontFamily: T.mono,
          fontSize: 10,
          color: T.faint,
          marginTop: 28,
          paddingTop: 16,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        KrisFlyer award rates from Singapore · SQ, updated Jun 2026
      </div>
    </div>
  );
}
