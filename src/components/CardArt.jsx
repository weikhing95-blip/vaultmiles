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
    bg2: "#7A0A20",
    accent: "#FFD700",
    text: "#fff",
    label: "DBS Altitude",
    sub: "DBS Points",
    network: "visa",
  },
  uob: {
    bg1: "#0A2A6B",
    bg2: "#001A45",
    accent: "#B8A96A",
    text: "#fff",
    label: "UOB KrisFlyer",
    sub: "UNI$",
    network: "visa",
  },
  ocbc90n: {
    bg1: "#D11423",
    bg2: "#7A0A14",
    accent: "#fff",
    text: "#fff",
    label: "OCBC 90°N",
    sub: "Travel$",
    network: "mc",
  },
  ocbcd: {
    bg1: "#CC0000",
    bg2: "#5E0000",
    accent: "#F0C040",
    text: "#fff",
    label: "OCBC Rewards",
    sub: "OCBC$",
    network: "visa",
  },
  citytyp: {
    bg1: "#0A3FA0",
    bg2: "#001A55",
    accent: "#C8A84B",
    text: "#fff",
    label: "Citi Rewards",
    sub: "ThankYou Points",
    network: "visa",
  },
  citimiles: {
    bg1: "#0A3FA0",
    bg2: "#001640",
    accent: "#E8C882",
    text: "#fff",
    label: "Citi PremierMiles",
    sub: "Citi Miles",
    network: "visa",
  },
  hsbc: {
    bg1: "#D60000",
    bg2: "#6E0000",
    accent: "#fff",
    text: "#fff",
    label: "HSBC TravelOne",
    sub: "Reward Points",
    network: "visa",
  },
  sc1: {
    bg1: "#00643A",
    bg2: "#002E1A",
    accent: "#B8A96A",
    text: "#fff",
    label: "SC Visa Infinite",
    sub: "360° Tier 1",
    network: "visa",
  },
  sc2: {
    bg1: "#00824A",
    bg2: "#004226",
    accent: "#A8D8B8",
    text: "#fff",
    label: "SC Journey",
    sub: "360° Tier 2",
    network: "visa",
  },
  amex: {
    bg1: "#1A8CE0",
    bg2: "#003A86",
    accent: "#BFE6FA",
    text: "#fff",
    label: "Amex Membership",
    sub: "Membership Rewards",
    network: "amex",
  },
  maybank: {
    bg1: "#FFC600",
    bg2: "#E69A00",
    accent: "#1A1A1A",
    text: "#1A1A1A",
    label: "Maybank Horizon",
    sub: "TREATS Points",
    network: "visa",
  },
  boc: {
    bg1: "#D11423",
    bg2: "#6E0010",
    accent: "#FFD700",
    text: "#fff",
    label: "BOC Elite Miles",
    sub: "BOC Points",
    network: "visa",
  },
  cimb: {
    bg1: "#B00A42",
    bg2: "#5E0022",
    accent: "#F0C040",
    text: "#fff",
    label: "CIMB",
    sub: "Bonus Points",
    network: "visa",
  },
  diners: {
    bg1: "#1A8CD8",
    bg2: "#003A66",
    accent: "#fff",
    text: "#fff",
    label: "Diners Club",
    sub: "Club Rewards",
    network: "diners",
  },
  ntuclink: {
    bg1: "#12C255",
    bg2: "#00702F",
    accent: "#fff",
    text: "#fff",
    label: "NTUC Link",
    sub: "LinkPoints",
    network: "link",
  },
};

// Premium generated card art: layered mesh gradients (light source + accent hue +
// vignette), a diagonal sheen, faint guilloché texture, a metallic EMV chip and a
// contactless mark. Per-bank colours come from CARD_DEFS. No real bank artwork.
export function CardArt({ id, width = 200, height = 126 }) {
  const r = 12;
  const d = CARD_DEFS[id] || CARD_DEFS.krisflyer;
  const u = id || "kf";

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
          id={`cg_${u}`}
          x1="0"
          y1="0"
          x2="200"
          y2="126"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={d.bg1} />
          <stop offset="100%" stopColor={d.bg2} />
        </linearGradient>
        <radialGradient id={`hl_${u}`} cx="40" cy="12" r="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ac_${u}`} cx="188" cy="24" r="118" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={d.accent} stopOpacity="0.30" />
          <stop offset="62%" stopColor={d.accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`vg_${u}`} cx="150" cy="150" r="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={`sh_${u}`}
          x1="0"
          y1="0"
          x2="200"
          y2="0"
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(16 100 63)"
        >
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.10" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`chip_${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6DD97" />
          <stop offset="48%" stopColor="#D9B964" />
          <stop offset="100%" stopColor="#A9853A" />
        </linearGradient>
        <clipPath id={`clip_${u}`}>
          <rect width="200" height="126" rx={r} />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip_${u})`}>
        {/* Mesh: base → accent hue → vignette → light source */}
        <rect width="200" height="126" fill={`url(#cg_${u})`} />
        <rect width="200" height="126" fill={`url(#ac_${u})`} />
        <rect width="200" height="126" fill={`url(#vg_${u})`} />
        <rect width="200" height="126" fill={`url(#hl_${u})`} />

        {/* Faint guilloché texture */}
        <g stroke={d.accent} strokeOpacity="0.10" fill="none" strokeWidth="0.6">
          <ellipse cx="156" cy="120" rx="72" ry="72" />
          <ellipse cx="156" cy="120" rx="98" ry="98" />
          <ellipse cx="156" cy="120" rx="124" ry="124" />
        </g>

        {/* Diagonal sheen + top edge light */}
        <rect width="200" height="126" fill={`url(#sh_${u})`} />
        <rect x="0" y="0" width="200" height="1" fill="#fff" opacity="0.12" />

        {/* EMV chip */}
        <g transform="translate(18,46)">
          <rect width="30" height="23" rx="5" fill={`url(#chip_${u})`} />
          <rect width="30" height="23" rx="5" fill="none" stroke="#7A5F24" strokeOpacity="0.4" />
          <g stroke="#8A6C2C" strokeOpacity="0.5" strokeWidth="0.8">
            <line x1="0" y1="8" x2="30" y2="8" />
            <line x1="0" y1="15" x2="30" y2="15" />
            <line x1="11" y1="0" x2="11" y2="23" />
            <line x1="19" y1="0" x2="19" y2="23" />
          </g>
          <rect
            x="11"
            y="8"
            width="8"
            height="7"
            rx="1.5"
            fill={`url(#chip_${u})`}
            stroke="#8A6C2C"
            strokeOpacity="0.5"
            strokeWidth="0.8"
          />
        </g>

        {/* Contactless */}
        <g
          transform="translate(56,49)"
          stroke={d.text}
          strokeOpacity="0.55"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M0 5 a6 6 0 0 1 0 11" />
          <path d="M4 2 a10 10 0 0 1 0 17" />
        </g>

        {/* Bank label */}
        <text
          x="18"
          y="24"
          fontFamily="'Inter',sans-serif"
          fontWeight="700"
          fontSize="11"
          fill={d.text}
          letterSpacing="0.02em"
        >
          {d.label}
        </text>

        {/* Program / sub */}
        <text
          x="18"
          y="105"
          fontFamily="'JetBrains Mono',monospace"
          fontSize="8"
          fill={d.text}
          opacity="0.62"
          letterSpacing="0.1em"
        >
          {(d.sub || "").toUpperCase()}
        </text>

        {/* Network mark */}
        {d.network === "visa" && (
          <text
            x="182"
            y="116"
            fontFamily="'Inter',sans-serif"
            fontWeight="800"
            fontSize="12"
            fill="#fff"
            opacity="0.9"
            textAnchor="end"
            letterSpacing="-0.02em"
          >
            VISA
          </text>
        )}
        {d.network === "mc" && (
          <g>
            <circle cx="166" cy="110" r="8" fill="#EB001B" opacity="0.95" />
            <circle cx="178" cy="110" r="8" fill="#F79E1B" opacity="0.95" />
            <circle cx="172" cy="110" r="8" fill="#FF5F00" opacity="0.55" />
          </g>
        )}
        {d.network === "amex" && (
          <text
            x="182"
            y="116"
            fontFamily="'Inter',sans-serif"
            fontWeight="800"
            fontSize="8"
            fill="#fff"
            opacity="0.9"
            textAnchor="end"
            letterSpacing="0.04em"
          >
            AMEX
          </text>
        )}
        {d.network === "diners" && (
          <text
            x="182"
            y="116"
            fontFamily="'Inter',sans-serif"
            fontWeight="700"
            fontSize="7.5"
            fill="#fff"
            opacity="0.85"
            textAnchor="end"
            letterSpacing="0.04em"
          >
            DINERS
          </text>
        )}
        {(d.network === "kf" || d.network === "link") && (
          <text
            x="182"
            y="116"
            fontFamily="'Inter',sans-serif"
            fontWeight="700"
            fontSize="8"
            fill={d.accent}
            opacity="0.9"
            textAnchor="end"
            letterSpacing="0.06em"
          >
            {d.network === "kf" ? "✦ KF" : "LINK"}
          </text>
        )}
      </g>
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
