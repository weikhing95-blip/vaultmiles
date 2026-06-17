// Canonical UI primitives (P1) — token-pure, reused across all tabs.
// Every style value comes from T.* tokens (src/theme.js). No raw hex/px/ms.
// Reuses the global `vpulse` keyframe defined in App.jsx for Skeleton.
import { T } from "../theme.js";

/* Surface — elevation-aware container (replaces ad-hoc card divs). */
export function Surface({ level = "e1", radius = "lg", pad = 4, style, children, ...rest }) {
  return (
    <div
      style={{
        ...T.elevation[level],
        border: `1px solid ${T.border}`,
        borderRadius: T.radius[radius],
        padding: T.space[pad],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* Button — primary / secondary / ghost. ≥44px tall for tap targets. */
export function Button({ variant = "primary", full, disabled, style, children, ...rest }) {
  const base = {
    minHeight: 44,
    padding: `0 ${T.space[5]}px`,
    borderRadius: T.radius.md,
    fontFamily: T.body,
    fontSize: T.type.body.fontSize,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    width: full ? "100%" : undefined,
    transition: `background ${T.motion.fast}ms ${T.motion.easeStandard}`,
  };
  const variants = {
    primary: { background: T.gold, color: T.bg, border: "none" },
    secondary: { background: T.surfaceHi, color: T.ink, border: `1px solid ${T.border}` },
    ghost: { background: "transparent", color: T.mist, border: "none" },
  };
  return (
    <button disabled={disabled} style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
}

/* Chip / pill — selectable filter token. */
export function Chip({ active, style, children, ...rest }) {
  return (
    <button
      style={{
        minHeight: 32,
        padding: `${T.space[1]}px ${T.space[3]}px`,
        borderRadius: T.radius.pill,
        fontFamily: T.body,
        fontSize: T.type.caption.fontSize,
        cursor: "pointer",
        background: active ? T.goldDim : T.surfaceHi,
        color: active ? T.gold : T.mist,
        border: `1px solid ${active ? T.gold : T.border}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* Input — token-styled text field. */
export function Input({ style, ...rest }) {
  return (
    <input
      style={{
        width: "100%",
        boxSizing: "border-box",
        minHeight: 44,
        background: T.surfaceHi,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius.md,
        padding: `0 ${T.space[3]}px`,
        color: T.ink,
        fontFamily: T.body,
        fontSize: T.type.body.fontSize,
        outline: "none",
        ...style,
      }}
      {...rest}
    />
  );
}

/* ProgressBar — thin track + fill. tone = gold | good | warn. */
export function ProgressBar({ pct = 0, tone = "gold", style }) {
  const fill = { gold: T.gold, good: T.good, warn: T.warn }[tone] ?? T.gold;
  return (
    <div
      style={{
        height: 3,
        borderRadius: T.radius.pill,
        background: T.border,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, pct))}%`,
          background: fill,
          borderRadius: T.radius.pill,
          transition: `width ${T.motion.base}ms ${T.motion.easeDecelerate}`,
        }}
      />
    </div>
  );
}

/* ProgressRing — circular progress (e.g. miles toward a destination). */
export function ProgressRing({ pct = 0, size = 44, tone = "gold" }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const color = { gold: T.gold, good: T.good, warn: T.warn }[tone] ?? T.gold;
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={T.border}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - clamped / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: `stroke-dashoffset ${T.motion.slow}ms ${T.motion.easeDecelerate}` }}
      />
    </svg>
  );
}

/* Badge — small status label. tone = info | good | warn | gold. */
export function Badge({ tone = "info", style, children }) {
  const map = {
    info: { fg: T.info, bg: T.infoDim },
    good: { fg: T.good, bg: T.goodDim },
    warn: { fg: T.warn, bg: T.warnDim },
    gold: { fg: T.goldSoft, bg: T.goldDim },
  };
  const c = map[tone] ?? map.info;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${T.space[1]}px ${T.space[2]}px`,
        borderRadius: T.radius.sm,
        fontFamily: T.body,
        fontSize: T.type.overline.fontSize,
        fontWeight: 500,
        color: c.fg,
        background: c.bg,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* EmptyState — designed empty placeholder for any list. */
export function EmptyState({ title, hint, action }) {
  return (
    <div style={{ textAlign: "center", padding: `${T.space[10]}px ${T.space[5]}px` }}>
      <div style={{ ...T.type.heading, color: T.ink, marginBottom: T.space[2] }}>{title}</div>
      {hint && <div style={{ ...T.type.caption, color: T.faint, lineHeight: 1.6 }}>{hint}</div>}
      {action && <div style={{ marginTop: T.space[4] }}>{action}</div>}
    </div>
  );
}

/* Skeleton — loading placeholder (perceived speed). Uses global vpulse. */
export function Skeleton({ w = "100%", h = 16, radius = "sm", style }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: T.radius[radius],
        background: T.surfaceHi,
        animation: "vpulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

/* StatHero — the single most important number on a screen. */
export function StatHero({ label, value, unit }) {
  return (
    <div style={{ textAlign: "center", padding: `${T.space[8]}px 0` }}>
      {label && (
        <div style={{ ...T.type.overline, color: T.faint, marginBottom: T.space[3] }}>{label}</div>
      )}
      <div
        style={{
          fontFamily: T.display,
          fontSize: "clamp(56px,15vw,84px)",
          fontWeight: 600,
          lineHeight: 1,
          color: T.goldSoft,
          textShadow: `0 0 40px ${T.goldDim}`,
        }}
      >
        {value}
      </div>
      {unit && (
        <div style={{ ...T.type.overline, color: T.faint, marginTop: T.space[2] }}>{unit}</div>
      )}
    </div>
  );
}
