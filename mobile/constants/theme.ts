export const T = {
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
  display: "Georgia" as const,        // serif fallback for RN
  body: "System" as const,
  mono: "Courier" as const,
} as const;

export type ThemeColors = typeof T;
