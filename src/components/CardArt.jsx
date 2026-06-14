import { T } from "../theme.js";

const CARD_DEFS = {
  krisflyer: {
    bg1: "#0A1A42",
    bg2: "#1A3A7A",
    accent: "#C9A84C",
    text: "#E8C882",
    label: "KrisFlyer",
    sub: "Direct Miles",
    network: "kf",
  },
  dbs: {
    bg1: "#C00F2E",
    bg2: "#8B0000",
    accent: "#FFD700",
    text: "#fff",
    label: "DBS Altitude",
    sub: "DBS Points",
    network: "visa",
  },
  uob: {
    bg1: "#00205B",
    bg2: "#003399",
    accent: "#B8A96A",
    text: "#fff",
    label: "UOB KrisFlyer",
    sub: "UNI$",
    network: "visa",
  },
  ocbc90n: {
    bg1: "#CC0000",
    bg2: "#8B0000",
    accent: "#fff",
    text: "#fff",
    label: "OCBC 90°N",
    sub: "Travel$",
    network: "mc",
  },
  ocbcd: {
    bg1: "#CC0000",
    bg2: "#660000",
    accent: "#F0C040",
    text: "#fff",
    label: "OCBC Rewards",
    sub: "OCBC$",
    network: "visa",
  },
  citytyp: {
    bg1: "#003B9F",
    bg2: "#001F6B",
    accent: "#C8A84B",
    text: "#fff",
    label: "Citi Rewards",
    sub: "ThankYou Points",
    network: "visa",
  },
  citimiles: {
    bg1: "#003B9F",
    bg2: "#00285C",
    accent: "#E8C882",
    text: "#fff",
    label: "Citi PremierMiles",
    sub: "Citi Miles",
    network: "visa",
  },
  hsbc: {
    bg1: "#CC0000",
    bg2: "#8B0000",
    accent: "#fff",
    text: "#fff",
    label: "HSBC TravelOne",
    sub: "Reward Points",
    network: "visa",
  },
  sc1: {
    bg1: "#004D2A",
    bg2: "#003319",
    accent: "#B8A96A",
    text: "#fff",
    label: "SC Visa Infinite",
    sub: "360° Tier 1",
    network: "visa",
  },
  sc2: {
    bg1: "#006633",
    bg2: "#004D26",
    accent: "#90B890",
    text: "#fff",
    label: "SC Journey",
    sub: "360° Tier 2",
    network: "visa",
  },
  amex: {
    bg1: "#016FD0",
    bg2: "#004A9F",
    accent: "#A8D8F0",
    text: "#fff",
    label: "Amex Membership",
    sub: "Membership Rewards",
    network: "amex",
  },
};

export function CardArt({ id, width = 200, height = 126 }) {
  const r = 10;
  const d = CARD_DEFS[id] || CARD_DEFS.krisflyer;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 126"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: r, display: "block" }}
    >
      <defs>
        <linearGradient
          id={`cg_${id}`}
          x1="0"
          y1="0"
          x2="200"
          y2="126"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={d.bg1} />
          <stop offset="100%" stopColor={d.bg2} />
        </linearGradient>
        <linearGradient
          id={`sh_${id}`}
          x1="0"
          y1="0"
          x2="0"
          y2="126"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="200" height="126" rx={r} fill={`url(#cg_${id})`} />
      <rect width="200" height="126" rx={r} fill={`url(#sh_${id})`} />
      <circle cx="160" cy="30" r="60" fill={d.accent} fillOpacity="0.07" />
      <circle cx="170" cy="100" r="40" fill={d.accent} fillOpacity="0.05" />

      {/* EMV chip */}
      <rect x="16" y="44" width="28" height="22" rx="4" fill={d.accent} fillOpacity="0.9" />
      <line x1="16" y1="54" x2="44" y2="54" stroke={d.bg1} strokeWidth="1" opacity="0.4" />
      <line x1="29" y1="44" x2="29" y2="66" stroke={d.bg1} strokeWidth="1" opacity="0.4" />

      <text
        x="16"
        y="22"
        fontFamily="'Inter',sans-serif"
        fontWeight="700"
        fontSize="10"
        fill={d.text}
        opacity="0.95"
        letterSpacing="0.05em"
      >
        {d.label}
      </text>
      <text
        x="16"
        y="106"
        fontFamily="'JetBrains Mono',monospace"
        fontSize="8"
        fill={d.text}
        opacity="0.55"
        letterSpacing="0.08em"
      >
        {d.sub}
      </text>

      {d.network === "visa" && (
        <text
          x="172"
          y="116"
          fontFamily="'Inter',sans-serif"
          fontWeight="800"
          fontSize="11"
          fill="#fff"
          opacity="0.85"
          textAnchor="middle"
          letterSpacing="-0.02em"
        >
          VISA
        </text>
      )}
      {d.network === "mc" && (
        <g>
          <circle cx="164" cy="110" r="8" fill="#EB001B" opacity="0.9" />
          <circle cx="176" cy="110" r="8" fill="#F79E1B" opacity="0.9" />
          <circle cx="170" cy="110" r="8" fill="#FF5F00" opacity="0.8" />
        </g>
      )}
      {d.network === "amex" && (
        <text
          x="172"
          y="116"
          fontFamily="'Inter',sans-serif"
          fontWeight="800"
          fontSize="8"
          fill="#fff"
          opacity="0.85"
          textAnchor="middle"
          letterSpacing="0.04em"
        >
          AMEX
        </text>
      )}
      {d.network === "kf" && (
        <text
          x="172"
          y="116"
          fontFamily="'Inter',sans-serif"
          fontWeight="700"
          fontSize="8"
          fill={d.accent}
          opacity="0.9"
          textAnchor="middle"
          letterSpacing="0.06em"
        >
          ✦ KF
        </text>
      )}
    </svg>
  );
}

export function VaultMilesLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="#C4974A" strokeWidth="1.2" />
      <path
        d="M10 28 Q15 18 20 14 Q25 10 30 8"
        stroke="#C4974A"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="30" cy="8" r="2" fill="#E8C882" />
      <line
        x1="10"
        y1="30"
        x2="30"
        y2="30"
        stroke="#C4974A"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
