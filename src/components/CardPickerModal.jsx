import { useState } from "react";
import { T } from "../theme.js";
import { CardArt } from "./CardArt.jsx";

const SLIDE_UP = `
@keyframes slideUp {
  from { transform: translateY(32px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
`;

export function CardPickerModal({ catalog, used, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? catalog.filter((c) => `${c.bank} ${c.name} ${c.note ?? ""}`.toLowerCase().includes(q))
    : catalog;

  // Group cards by bank
  const banks = [];
  const seen = new Set();
  for (const c of filtered) {
    if (!seen.has(c.bank)) {
      seen.add(c.bank);
      banks.push(c.bank);
    }
  }
  const grouped = banks.map((bank) => ({
    bank,
    items: filtered.filter((c) => c.bank === bank),
  }));

  return (
    <>
      <style>{SLIDE_UP}</style>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
        }}
      />
      {/* Bottom sheet */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          background: T.surface,
          borderRadius: "20px 20px 0 0",
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 20px 0",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontFamily: T.body, fontSize: 17, fontWeight: 600, color: T.ink }}>
              Add a card
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.faint, marginTop: 3 }}>
              Select which rewards program to track
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: `1px solid ${T.border}`,
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              color: T.mist,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 20px 4px", flexShrink: 0 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bank or program…"
            style={{
              width: "100%",
              background: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              color: T.ink,
              fontFamily: T.body,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Scrollable list */}
        <div style={{ overflowY: "auto", padding: "16px 20px 32px", flex: 1 }}>
          {grouped.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                fontFamily: T.mono,
                fontSize: 11,
                color: T.faint,
              }}
            >
              No programs match “{query}”
            </div>
          )}
          {grouped.map(({ bank, items }) => (
            <div key={bank} style={{ marginBottom: 20 }}>
              {/* Bank section header */}
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: T.faint,
                  textTransform: "uppercase",
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                {bank}
              </div>
              {items.map((c) => {
                const isAdded = used.has(c.id);
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: `1px solid ${T.border}`,
                      opacity: isAdded ? 0.45 : 1,
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        borderRadius: 6,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                      }}
                    >
                      <CardArt id={c.id} width={72} height={46} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: T.body,
                          fontSize: 13,
                          fontWeight: 500,
                          color: T.ink,
                          marginBottom: 2,
                        }}
                      >
                        {c.name}
                      </div>
                      {c.note && (
                        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>
                          {c.note}
                        </div>
                      )}
                    </div>
                    {isAdded ? (
                      <div
                        style={{
                          fontFamily: T.mono,
                          fontSize: 10,
                          color: T.faint,
                          letterSpacing: "0.08em",
                          flexShrink: 0,
                        }}
                      >
                        Added
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelect(c.id)}
                        style={{
                          background: T.goldDim,
                          border: `1px solid ${T.gold}`,
                          borderRadius: 8,
                          color: T.goldSoft,
                          fontFamily: T.mono,
                          fontSize: 16,
                          width: 32,
                          height: 32,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
