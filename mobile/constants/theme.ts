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
  // Aurora accent (direction B) — parity with web; adopted across all native
  // screens. auroraPrimary = interactive accent + fills; auroraText = big
  // numbers; auroraDim = active backgrounds. Gold is brand-mark only.
  auroraPrimary: "#7C5CFF",
  auroraText: "#C9B8FF",
  auroraDim: "rgba(124,92,255,0.14)",
  display: "Georgia", // serif fallback for RN
  displayAlt: "System", // Space Grotesk not bundled on native yet (follow-up);
  // until then native big numbers keep the serif `display` face.
  body: "System",
  mono: "Courier",
} as const;

// ── Design tokens (DS-01..05) — must stay in parity with src/theme.js ─
// RN-correct shapes: elevation uses shadow props; type lineHeight is absolute
// px; letterSpacing is a number. Reference T.space[4], T.radius.md,
// T.elevation.e2, T.motion.base, T.type.body — never hardcode raw values.
const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 } as const;
const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
const elevation = {
  e0: { backgroundColor: C.bg },
  e1: {
    backgroundColor: C.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  e2: {
    backgroundColor: C.surfaceHi,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  e3: {
    backgroundColor: C.surfaceHi,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;
// Durations in ms; easing handled at call sites via RN Easing.
const motion = { fast: 120, base: 220, slow: 360 } as const;
// Type roles: serif display for moments, system for UI, mono for figures only.
const type = {
  display: { fontFamily: C.display, fontSize: 32, lineHeight: 34, fontWeight: "600" },
  title: { fontFamily: C.display, fontSize: 24, lineHeight: 28, fontWeight: "600" },
  heading: { fontFamily: C.body, fontSize: 18, lineHeight: 24, fontWeight: "600" },
  body: { fontFamily: C.body, fontSize: 14, lineHeight: 21, fontWeight: "400" },
  caption: { fontFamily: C.body, fontSize: 12, lineHeight: 17, fontWeight: "400" },
  overline: {
    fontFamily: C.body,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  number: { fontFamily: C.mono, fontSize: 14, lineHeight: 17, fontWeight: "500" },
} as const;

export const T = { ...C, space, radius, elevation, motion, type } as const;

export type ThemeColors = typeof T;
