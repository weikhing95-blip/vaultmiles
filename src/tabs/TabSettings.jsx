import { useState } from "react";
import { T, P } from "../theme.js";
import { fmt, num } from "../utils.js";
import { CATALOG } from "../data.js";
import { SectionLabel } from "../components/primitives.jsx";

export function TabSettings({ user, onLogout, catalog, updateRate, resetRates, fire }) {
  const [showRates, setShowRates] = useState(false);

  return (
    <div style={P.page}>
      <div style={P.pageHeader}>
        <div>
          <div style={P.pageHeaderSub}>Preferences</div>
          <div style={P.pageHeaderTitle}>Settings</div>
        </div>
      </div>

      {/* Profile */}
      <div style={P.section}>
        <SectionLabel>Account</SectionLabel>
        <div style={ST.profileCard}>
          <div style={ST.avatar}>{(user.name?.[0] || "?").toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: T.ink }}>{user.name}</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mist, marginTop: 2 }}>
              {user.email}
            </div>
            {user.kfNum && (
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, marginTop: 2 }}>
                KF · {user.kfNum}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversion rates */}
      <div style={P.section}>
        <button className="v-disclosure" onClick={() => setShowRates((v) => !v)}>
          <SectionLabel as="span">Conversion rates</SectionLabel>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>
            {showRates ? "hide ↑" : "edit ↓"}
          </span>
        </button>

        {showRates && (
          <div style={{ marginTop: 16 }}>
            <div style={ST.rateHead}>
              {["Program", "Pts/block", "Miles/block", "Min pts", "Fee (S$)"].map((h) => (
                <div
                  key={h}
                  style={{
                    ...ST.rateHCell,
                    textAlign: h === "Program" ? "left" : "right",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {catalog
              .filter((c) => c.id !== "krisflyer")
              .map((c) => (
                <div key={c.id} style={ST.rateRow}>
                  <div style={ST.rateName}>
                    <span style={{ color: T.faint, fontSize: 10 }}>{c.bank}</span>
                    <br />
                    <span style={{ fontSize: 11 }}>{c.name}</span>
                  </div>
                  {["blockPts", "blockMiles", "min", "fee"].map((f) => (
                    <input
                      key={f}
                      className="v-rin"
                      value={c[f]}
                      onChange={(e) => updateRate(c.id, f, e.target.value)}
                    />
                  ))}
                </div>
              ))}
            <button className="v-ghost" style={{ marginTop: 14 }} onClick={resetRates}>
              Reset to Jun 2026 defaults
            </button>
            <p
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                color: T.faint,
                marginTop: 12,
                lineHeight: 1.6,
              }}
            >
              Edit when a bank changes its conversion ratio. All balances recalculate immediately.
            </p>
          </div>
        )}
      </div>

      {/* About */}
      <div style={P.section}>
        <SectionLabel>About</SectionLabel>
        <div style={ST.aboutCard}>
          {[
            ["App", "VaultMiles"],
            ["Version", "1.0.0-beta"],
            ["Rates updated", "Jun 2026"],
            ["Coverage", `${CATALOG.length} SG programs`],
            ["Award chart", "KrisFlyer Nov 2025"],
          ].map(([k, v]) => (
            <div key={k} style={ST.aboutRow}>
              <span style={ST.aboutKey}>{k}</span>
              <span style={ST.aboutVal}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div style={P.section}>
        <button className="v-signout" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}

const ST = {
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: `${T.space[4]}px`,
    marginTop: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: T.radius.pill,
    background: T.goldDim,
    border: `1px solid ${T.gold}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: T.display,
    fontSize: 20,
    fontWeight: 600,
    color: T.goldSoft,
    flexShrink: 0,
  },
  rateHead: {
    display: "grid",
    gridTemplateColumns: "1fr 60px 72px 60px 56px",
    gap: 6,
    padding: "0 0 8px",
    borderBottom: `1px solid ${T.border}`,
  },
  rateHCell: {
    fontFamily: T.mono,
    fontSize: 9,
    letterSpacing: "0.08em",
    color: T.faint,
    textTransform: "uppercase",
  },
  rateRow: {
    display: "grid",
    gridTemplateColumns: "1fr 60px 72px 60px 56px",
    gap: 6,
    alignItems: "center",
    padding: "8px 0",
    borderBottom: `1px solid ${T.border}`,
  },
  rateName: { lineHeight: 1.4 },
  aboutCard: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 14,
  },
  aboutRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: `${T.space[3]}px ${T.space[4]}px`,
    borderBottom: `1px solid ${T.border}`,
  },
  aboutKey: { fontFamily: T.mono, fontSize: 12, color: T.faint },
  aboutVal: { fontFamily: T.mono, fontSize: 12, color: T.ink },
};
