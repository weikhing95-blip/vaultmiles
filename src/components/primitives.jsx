import { T } from "../theme.js";
import { fmt, flag } from "../utils.js";

// Country flag as an IMAGE (flagcdn), not an emoji. Emoji regional-indicator
// flags don't render on Windows / many desktop browsers — an image renders
// everywhere. `code` is an ISO-3166 alpha-2 (e.g. "JP"). Falls back to the emoji
// flag if the image fails to load (e.g. offline).
export function Flag({ code, size = 18, style }) {
  if (!code) return null;
  const cc = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      alt={code.toUpperCase()}
      width={Math.round(size * 1.5)}
      height={size}
      loading="lazy"
      onError={(e) => {
        // graceful fallback to the emoji flag
        const span = document.createElement("span");
        span.textContent = flag(code);
        span.style.fontSize = `${size}px`;
        e.currentTarget.replaceWith(span);
      }}
      style={{
        width: "auto",
        height: size,
        borderRadius: 2,
        display: "block",
        flexShrink: 0,
        objectFit: "cover",
        ...style,
      }}
    />
  );
}

export function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: T.mono,
        fontSize: 10,
        letterSpacing: "0.22em",
        color: T.faint,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export function Pill({ children, good, warn }) {
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 11,
        borderRadius: 999,
        padding: "4px 12px",
        border: "1px solid",
        color: good ? T.good : warn ? T.warn : T.mist,
        borderColor: good ? "rgba(107,175,137,0.3)" : warn ? "rgba(201,123,90,0.3)" : T.border,
        background: good ? T.goodDim : warn ? T.warnDim : "transparent",
      }}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0", color: T.mist }}>
      <div style={{ fontSize: 26, marginBottom: 10, opacity: 0.25 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>{desc}</div>}
    </div>
  );
}

export function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: T.surfaceHi,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontFamily: T.mono,
      }}
    >
      <div style={{ fontSize: 10, color: T.mist, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, color: T.goldSoft }}>{fmt(payload[0].value)}</div>
    </div>
  );
}

export function Spinner({ size = 14 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `1.5px solid ${T.gold}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "vspin 0.7s linear infinite",
      }}
    />
  );
}

export function ScanIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

export function CreditCardIcon({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? T.gold : T.faint}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

export function PlaneIcon({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? T.gold : T.faint}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2C3.7 4.9 3 5.5 3.1 6.6l.5 2.5c.1.6.5 1.1 1 1.4L9 12l-2 3H5l-1 1 3.5 1.5L9 21l1-1v-2l3-2 1.5 3.5c.3.5.8.9 1.4 1l2.5.5c1.1.1 1.7-.6 1.4-1.8z" />
    </svg>
  );
}

export function ChartIcon({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? T.gold : T.faint}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function SettingsIcon({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? T.gold : T.faint}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
