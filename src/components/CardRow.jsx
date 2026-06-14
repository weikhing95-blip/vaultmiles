import { useRef } from "react";
import { T } from "../theme.js";
import { CardArt } from "./CardArt.jsx";
import { Spinner, ScanIcon } from "./primitives.jsx";
import { num, fmt } from "../utils.js";

export function CardRow({ row, catalog, onChange, onRemove, onScan, onChangeCard }) {
  const fileRef = useRef();

  const conf = row.scanResult?.confidence;
  const badgeBg = conf === "high" ? T.goodDim : conf === "medium" ? T.goldDim : T.warnDim;
  const badgeBorder = conf === "high" ? T.good : conf === "medium" ? T.gold : T.warn;
  const badgeColor = badgeBorder;
  const badgeLabel =
    conf === "high" ? "✓ Confident" : conf === "medium" ? "~ Verify" : "⚠ Enter manually";

  return (
    <div className="v-card-row" style={{ position: "relative" }}>
      {/* Remove button — top-right corner */}
      <button
        className="v-icon-sm"
        onClick={onRemove}
        style={{ position: "absolute", top: 8, right: 8 }}
      >
        ×
      </button>

      {/* Card header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, paddingRight: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flexShrink: 0, borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            <CardArt id={row.srcId} width={88} height={56} />
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.faint, textTransform: "uppercase", marginBottom: 2 }}>
              {row.src?.bank ?? ""}
            </div>
            <div style={{ fontFamily: T.body, fontSize: 13, fontWeight: 500, color: T.ink, lineHeight: 1.3 }}>
              {row.src?.name ?? ""}
            </div>
          </div>
        </div>
        <button
          onClick={() => onChangeCard(row.uid)}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 10, color: T.faint, padding: "2px 4px", flexShrink: 0 }}
        >
          Change
        </button>
      </div>

      {/* Balance + actions row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          className="v-input"
          inputMode="numeric"
          placeholder="0"
          value={row.balance}
          onChange={(e) => onChange({ balance: e.target.value })}
          style={{ flex: 1 }}
        />
        <button
          className={`v-scan${row.scanning ? " scanning" : ""}`}
          onClick={() => fileRef.current?.click()}
          disabled={row.scanning}
          title="Scan screenshot"
        >
          {row.scanning ? <Spinner size={14} /> : <ScanIcon />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) onScan(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <div style={{ textAlign: "right", minWidth: 72 }}>
          <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.goldSoft }}>
            {fmt(row.miles)}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.18em", color: T.faint, textTransform: "uppercase", marginTop: 1 }}>
            MILES
          </div>
        </div>
      </div>

      {/* Scan result badge */}
      {row.scanResult && (
        <div style={{ fontFamily: T.mono, fontSize: 10.5, padding: "5px 10px", borderRadius: 6, border: "1px solid", marginTop: 8, background: badgeBg, borderColor: badgeBorder, color: badgeColor }}>
          {badgeLabel}
          {row.scanResult.label && <span style={{ color: T.faint }}> · {row.scanResult.label}</span>}
          {row.scanResult.note && <span style={{ color: T.faint }}> · {row.scanResult.note}</span>}
        </div>
      )}

      {/* Warning line */}
      {row.miles === 0 && num(row.balance) > 0 && (
        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.warn, marginTop: 6 }}>
          Below the {fmt(row.src?.min)}-point minimum to convert
        </div>
      )}
      {row.stranded > 0 && row.miles > 0 && (
        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.warn, marginTop: 6 }}>
          {fmt(row.stranded)} pts left over — not enough for another block
        </div>
      )}

      {/* Conversion detail row */}
      {row.miles > 0 && (
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, marginTop: 6 }}>
          {row.fee > 0 ? (
            <>
              <span>S${row.fee.toFixed(2)} transfer fee</span>
              <span style={{ color: T.warn }}> · S${row.fee.toFixed(2)}</span>
            </>
          ) : (
            <span>Free transfer</span>
          )}
        </div>
      )}
    </div>
  );
}
