// ── Colors & fonts (base palette) ────────────────────────────────────
const C = {
  bg: "#0E1117",
  surface: "#161B27",
  surfaceHi: "#1C2333",
  hover: "#212840",
  border: "#2A3347",
  borderHi: "#3A4560",
  gold: "#C4974A",
  goldSoft: "#E8C882",
  goldDim: "rgba(196,151,74,0.12)",
  ink: "#EDE8DF",
  mist: "#8B96A8",
  faint: "#4A5568",
  good: "#6BAF89",
  goodDim: "rgba(107,175,137,0.12)",
  warn: "#C97B5A",
  warnDim: "rgba(201,123,90,0.12)",
  info: "#6E8BC4",
  infoDim: "rgba(110,139,196,0.12)",
  scrim: "rgba(0,0,0,0.6)",
  display: "'Cormorant Garamond', Georgia, serif",
  displayAlt: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Mono', monospace",
  // Aurora accent (direction B) — expressive gradient for "moments" (hero number,
  // progress, celebratory states). Reserved for highlights, never body text.
  aurora: "linear-gradient(110deg, #7C5CFF 0%, #E0488B 52%, #F5A623 100%)",
  auroraSoft: "rgba(124,92,255,0.16)",
};

// ── Design tokens (DS-01..05) — single source of truth ───────────────
// Spacing: 8pt grid. Radius / elevation / motion / type scales.
// Reference T.space[4], T.radius.md, T.elevation.e2, T.motion.base, T.type.body
// — never hardcode raw px / ms / hex in components.
const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 };
const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
const elevation = {
  e0: { background: C.bg, boxShadow: "none" },
  e1: { background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,0.30)" },
  e2: { background: C.surfaceHi, boxShadow: "0 4px 12px rgba(0,0,0,0.35)" },
  e3: { background: C.surfaceHi, boxShadow: "0 12px 32px rgba(0,0,0,0.45)" },
};
const motion = {
  fast: 120,
  base: 220,
  slow: 360,
  easeStandard: "cubic-bezier(0.4,0,0.2,1)",
  easeDecelerate: "cubic-bezier(0,0,0.2,1)",
  spring: "cubic-bezier(0.34,1.56,0.64,1)",
};
// Type roles: serif display for moments, Inter for UI, mono for figures only.
const type = {
  display: { fontFamily: C.display, fontSize: 32, lineHeight: 1.05, fontWeight: 600 },
  title: { fontFamily: C.display, fontSize: 24, lineHeight: 1.15, fontWeight: 600 },
  heading: { fontFamily: C.body, fontSize: 18, lineHeight: 1.3, fontWeight: 600 },
  body: { fontFamily: C.body, fontSize: 14, lineHeight: 1.5, fontWeight: 400 },
  caption: { fontFamily: C.body, fontSize: 12, lineHeight: 1.4, fontWeight: 400 },
  overline: {
    fontFamily: C.body,
    fontSize: 10,
    lineHeight: 1.4,
    fontWeight: 500,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  number: { fontFamily: C.mono, fontSize: 14, lineHeight: 1.2, fontWeight: 500 },
};

export const T = { ...C, space, radius, elevation, motion, type };

// Shared page layout styles used by all tabs
export const P = {
  page: { padding: "0 20px 20px" },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "32px 0 24px",
    borderBottom: `1px solid ${T.border}`,
    marginBottom: 28,
  },
  pageHeaderSub: {
    fontFamily: T.mono,
    fontSize: 10,
    letterSpacing: "0.18em",
    color: T.faint,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pageHeaderTitle: {
    fontFamily: T.display,
    fontSize: 28,
    fontWeight: 600,
    color: T.ink,
    lineHeight: 1,
  },
  kfBadge: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.mist,
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "6px 10px",
  },
  hero: {
    textAlign: "center",
    padding: "32px 0 28px",
    marginBottom: 28,
    borderBottom: `1px solid ${T.border}`,
  },
  heroLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    letterSpacing: "0.24em",
    color: T.faint,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  heroNumber: {
    fontFamily: T.display,
    fontSize: "clamp(60px,16vw,88px)",
    fontWeight: 600,
    lineHeight: 1,
    color: T.goldSoft,
    textShadow: `0 0 40px rgba(196,151,74,0.2)`,
  },
  heroUnit: {
    fontFamily: T.mono,
    fontSize: 10,
    letterSpacing: "0.3em",
    color: T.faint,
    textTransform: "uppercase",
    marginTop: 10,
  },
  heroRule: {
    height: "1px",
    background: `linear-gradient(90deg,transparent,${T.gold},transparent)`,
    margin: "18px auto",
    width: "50%",
    maxWidth: 180,
  },
  heroPills: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  section: { marginBottom: 30 },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
};
