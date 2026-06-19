import { T } from "../theme.js";
import { CardArt } from "./CardArt.jsx";
import { num, fmt, monthsUntil, monthLabel } from "../utils.js";

export function CardRow({ row, catalog, onChange, onRemove, onChangeCard }) {
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
          paddingRight: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              flexShrink: 0,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            <CardArt id={row.srcId} width={88} height={56} />
          </div>
          <div>
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
                fontSize: 13,
                fontWeight: 500,
                color: T.ink,
                lineHeight: 1.3,
              }}
            >
              {row.src?.name ?? ""}
            </div>
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

      {/* Balance + miles row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          className="v-input"
          inputMode="numeric"
          placeholder="0"
          value={row.balance}
          onChange={(e) => onChange({ balance: e.target.value })}
          style={{ flex: 1 }}
        />
        <div style={{ textAlign: "right", minWidth: 72 }}>
          <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.goldSoft }}>
            {fmt(row.miles)}
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              letterSpacing: "0.18em",
              color: T.faint,
              textTransform: "uppercase",
              marginTop: 1,
            }}
          >
            MILES
          </div>
        </div>
      </div>

      {/* Expiry (optional) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
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
