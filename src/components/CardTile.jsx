import { useRef } from "react";
import { T } from "../theme.js";
import { CardArt } from "./CardArt.jsx";
import { Spinner, ScanIcon } from "./primitives.jsx";
import { num, fmt, monthsUntil, monthLabel } from "../utils.js";
import { Surface } from "./ui.jsx";

// Carousel variant of a card — art-forward, stacked layout. Same props/handlers
// as CardRow, just a different presentation (the list keeps using CardRow).
export function CardTile({ row, onChange, onRemove, onScan, onChangeCard }) {
  const fileRef = useRef();

  const mu = monthsUntil(row.expiry);
  const expColor = mu == null ? T.faint : mu < 6 ? T.warn : T.faint;
  const expLabel =
    mu == null
      ? null
      : mu < 0
        ? `Expired ${monthLabel(row.expiry)}`
        : mu === 0
          ? "Expires this month"
          : mu < 6
            ? `Expires in ${mu} mo`
            : `Expires ${monthLabel(row.expiry)}`;

  return (
    <Surface
      level="e2"
      radius="lg"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: T.space[3],
      }}
    >
      <button
        className="v-icon-sm"
        onClick={onRemove}
        style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        aria-label="Remove card"
      >
        ×
      </button>

      {/* Card art — the hero */}
      <div
        style={{
          width: "100%",
          aspectRatio: "200 / 126",
          borderRadius: T.radius.md,
          overflow: "hidden",
          boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
        }}
      >
        <CardArt id={row.srcId} width="100%" height="100%" />
      </div>

      {/* Bank + program name + change */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: "0.14em",
              color: T.faint,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            {row.src?.bank ?? ""}
          </div>
          <div
            style={{
              fontFamily: T.body,
              fontSize: 15,
              fontWeight: 600,
              color: T.ink,
              lineHeight: 1.3,
            }}
          >
            {row.src?.name ?? ""}
          </div>
        </div>
        <button
          onClick={() => onChangeCard(row.uid)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: T.mono,
            fontSize: 10,
            color: T.faint,
            padding: "2px 4px",
            flexShrink: 0,
          }}
        >
          Change
        </button>
      </div>

      {/* Miles payoff */}
      <div>
        <div
          style={{
            fontFamily: T.display,
            fontSize: 32,
            fontWeight: 600,
            color: T.goldSoft,
            lineHeight: 1,
          }}
        >
          {fmt(row.miles)}
        </div>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 9,
            letterSpacing: "0.18em",
            color: T.faint,
            textTransform: "uppercase",
            marginTop: 3,
          }}
        >
          KrisFlyer miles
        </div>
      </div>

      {/* Balance + scan */}
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
      </div>

      {/* Expiry */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: "0.14em",
            color: T.faint,
            textTransform: "uppercase",
          }}
        >
          Expiry
        </span>
        <input
          type="month"
          className="v-month"
          value={row.expiry || ""}
          onChange={(e) => onChange({ expiry: e.target.value })}
          style={{ maxWidth: 150, flex: "0 1 auto" }}
        />
        {expLabel && (
          <span style={{ fontFamily: T.mono, fontSize: 10, color: expColor }}>{expLabel}</span>
        )}
      </div>

      {/* Fee / warning line */}
      {row.miles === 0 && num(row.balance) > 0 ? (
        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.warn }}>
          Below the {fmt(row.src?.min)}-point minimum to convert
        </div>
      ) : row.miles > 0 ? (
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>
          {row.fee > 0 ? `S$${row.fee.toFixed(2)} transfer fee` : "Free transfer"}
        </div>
      ) : null}
    </Surface>
  );
}
