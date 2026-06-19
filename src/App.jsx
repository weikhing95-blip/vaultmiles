import { useState, useEffect, useRef, useMemo } from "react";
import { T } from "./theme.js";
import { CATALOG, BANK_TO_ID } from "./data.js";
import {
  K_CAT,
  K_HOLD,
  K_SNAP,
  K_INIT,
  uid,
  thisMonth,
  fmt,
  num,
  favKey,
  convertSource,
  readScreenshot,
} from "./utils.js";
import { supabase } from "./supabase.js";
import {
  getHoldings,
  saveHoldings,
  getSnapshots,
  saveSnapshots,
  getCatalog,
  saveCatalog,
  resetCatalog as resetCatalogStorage,
  getFavourites,
  addFavourite,
  removeFavourite,
} from "./storage.js";
import { VaultMilesLogo } from "./components/CardArt.jsx";
import {
  Spinner,
  CreditCardIcon,
  PlaneIcon,
  ChartIcon,
  SettingsIcon,
} from "./components/primitives.jsx";
import { CardPickerModal } from "./components/CardPickerModal.jsx";
import { TabCards } from "./tabs/TabCards.jsx";
import TabFly from "./tabs/TabFly.jsx";
import { TabHistory } from "./tabs/TabHistory.jsx";
import { TabSettings } from "./tabs/TabSettings.jsx";

/* ─── CSS ─────────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');`;

const CSS = `
${FONTS}
@keyframes vspin { to { transform:rotate(360deg); } }
@keyframes vpulse { 0%,100%{opacity:.7} 50%{opacity:1} }
@keyframes slideUp {
  from { transform:translateY(32px); opacity:0; }
  to   { transform:translateY(0);    opacity:1; }
}
@keyframes vfade { from { opacity:0; } to { opacity:1; } }
@keyframes vsheet {
  from { transform:translateY(24px); opacity:0; }
  to   { transform:translateY(0);    opacity:1; }
}

*,*::before,*::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

.v-input, .v-select, .v-month {
  width:100%; background:${T.surfaceHi}; border:1px solid ${T.border};
  border-radius:10px; color:${T.ink}; font-size:14px; padding:10px 12px; outline:none;
  transition:border-color .15s, box-shadow .15s; appearance:none;
}
.v-input  { font-family:${T.mono}; }
.v-select { font-family:${T.body}; cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:32px; }
.v-month  { font-family:${T.mono}; font-size:14px; }
.v-input:focus,.v-select:focus,.v-month:focus {
  border-color:${T.gold}; box-shadow:0 0 0 3px rgba(196,151,74,0.14);
}
.v-input::placeholder { color:${T.faint}; }
.v-select option { background:${T.surface}; color:${T.ink}; }
.v-month::-webkit-calendar-picker-indicator { filter:invert(.4); cursor:pointer; }

.v-rin {
  width:100%; text-align:right; background:${T.surfaceHi}; border:1px solid ${T.border};
  border-radius:7px; color:${T.ink}; font-family:${T.mono}; font-size:12px;
  padding:6px 8px; outline:none;
}
.v-rin:focus { border-color:${T.gold}; }

.v-btn {
  background:${T.gold}; color:#0E1117; border:none; border-radius:10px;
  font-family:${T.body}; font-size:13px; font-weight:600;
  padding:11px 18px; cursor:pointer; white-space:nowrap;
  transition:background .15s, transform .1s;
}
.v-btn:hover  { background:${T.goldSoft}; }
.v-btn:active { transform:scale(.97); }

.v-btn-full {
  width:100%; background:${T.gold}; color:#0E1117; border:none; border-radius:12px;
  font-family:${T.body}; font-size:15px; font-weight:600;
  padding:15px; cursor:pointer; display:flex; align-items:center; justify-content:center;
  gap:8px; transition:background .15s, transform .1s;
}
.v-btn-full:hover  { background:${T.goldSoft}; }
.v-btn-full:active { transform:scale(.98); }
.v-btn-full:disabled { opacity:.6; cursor:wait; }

.v-add {
  background:transparent; color:${T.gold}; border:1px solid ${T.border};
  border-radius:8px; font-family:${T.body}; font-size:12px; font-weight:500;
  padding:6px 14px; cursor:pointer; white-space:nowrap;
  transition:border-color .15s;
}
.v-add:hover { border-color:${T.gold}; }

.v-ghost {
  background:transparent; border:1px solid ${T.border}; color:${T.mist};
  border-radius:8px; font-family:${T.mono}; font-size:11px;
  padding:6px 12px; cursor:pointer; transition:border-color .15s, color .15s;
}
.v-ghost:hover { border-color:${T.mist}; color:${T.ink}; }

.v-icon-sm {
  background:transparent; border:none; color:${T.faint};
  width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:18px; font-weight:300;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  transition:color .15s, background .15s;
}
.v-icon-sm:hover { color:${T.warn}; background:${T.warnDim}; }

.v-scan {
  width:44px; height:44px; border-radius:10px; flex-shrink:0;
  background:${T.surfaceHi}; border:1px solid ${T.border};
  display:flex; align-items:center; justify-content:center;
  color:${T.mist}; cursor:pointer;
  transition:border-color .15s, color .15s, background .15s;
}
.v-scan:hover { border-color:${T.gold}; color:${T.gold}; background:${T.goldDim}; }
.v-scan.scanning {
  border-color:${T.gold}; color:${T.gold}; cursor:wait;
  animation:vpulse 1.2s ease infinite;
}

.v-card-row {
  background:${T.surface}; border-radius:14px; padding:16px;
  border:1px solid ${T.border}; transition:border-color .2s; position:relative;
}
.v-card-row:hover { border-color:${T.borderHi}; }

.v-tab { background:none; border:none; cursor:pointer; touch-action:manipulation; }
.v-tab:active { opacity:.7; }

.v-disclosure {
  width:100%; display:flex; align-items:center; justify-content:space-between;
  background:transparent; border:none; color:${T.ink};
  padding:0; cursor:pointer; text-align:left;
}

.v-pill {
  background:transparent; border:1px solid ${T.border}; color:${T.mist};
  border-radius:999px; font-family:${T.mono}; font-size:11px;
  padding:5px 14px; cursor:pointer; white-space:nowrap;
  transition:border-color .15s, color .15s, background .15s;
}
.v-pill:hover { border-color:${T.mist}; color:${T.ink}; }
.v-pill-active {
  background:${T.goldDim}; border:1px solid ${T.gold}; color:${T.gold};
  border-radius:999px; font-family:${T.mono}; font-size:11px;
  padding:5px 14px; cursor:pointer; white-space:nowrap;
}

.v-seg {
  background:transparent; border:1px solid ${T.border}; color:${T.mist};
  border-radius:8px; font-family:${T.mono}; font-size:10.5px;
  padding:6px 12px; cursor:pointer; white-space:nowrap;
  transition:border-color .12s, color .12s, background .12s;
}
.v-seg:hover { border-color:${T.borderHi}; color:${T.ink}; }
.v-seg-active {
  background:${T.goldDim}; border:1px solid ${T.gold}; color:${T.gold};
  border-radius:8px; font-family:${T.mono}; font-size:10.5px;
  padding:6px 12px; cursor:pointer; white-space:nowrap;
}

.v-picker-row:hover { background:${T.hover}; }

.v-carousel::-webkit-scrollbar { display:none; }
.v-carousel { -webkit-overflow-scrolling:touch; }

.v-signout {
  width:100%; background:transparent; border:1px solid ${T.border}; color:${T.warn};
  border-radius:12px; font-family:${T.body}; font-size:14px; font-weight:500;
  padding:14px; cursor:pointer; transition:border-color .15s, background .15s;
}
.v-signout:hover { border-color:${T.warn}; background:${T.warnDim}; }
`;

/* ─── LOGIN ───────────────────────────────────────────────────────────── */
function LoginScreen() {
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kfNum, setKfNum] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  const isSignUp = mode === "signup";

  async function handleSubmit() {
    setError("");
    if (isSignUp && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (isSignUp) {
        // Store name/kf BEFORE signUp so onAuthStateChange fires with data already available
        sessionStorage.setItem("vm:pending_name", name.trim());
        sessionStorage.setItem("vm:pending_kf", kfNum.trim());
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) {
          sessionStorage.removeItem("vm:pending_name");
          sessionStorage.removeItem("vm:pending_kf");
          throw signUpError;
        }
        if (!data.session) {
          // Email confirmation required — pending data stays in sessionStorage for after confirmation
          setPendingConfirm(true);
          return;
        }
        // Session exists — onAuthStateChange will write the profile from sessionStorage
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (e) {
      setError(e.message ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (pendingConfirm) {
    return (
      <div style={LS.root}>
        <style>{CSS}</style>
        <div style={{ ...LS.shell, textAlign: "center" }}>
          <div style={LS.brand}>
            <div style={LS.logoMark}>
              <VaultMilesLogo size={40} />
            </div>
            <div style={LS.wordmark}>
              Vault<span style={{ color: T.gold }}>Miles</span>
            </div>
          </div>
          <div style={LS.card}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>☑</div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: 22,
                fontWeight: 700,
                color: T.ink,
                marginBottom: 10,
              }}
            >
              Check your inbox
            </div>
            <p
              style={{
                fontFamily: T.mono,
                fontSize: 12,
                color: T.mist,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              We sent a confirmation link to <strong style={{ color: T.gold }}>{email}</strong>.
              Open it to activate your account, then come back to sign in.
            </p>
            <button
              className="v-btn-full"
              onClick={() => {
                setPendingConfirm(false);
                setMode("signin");
              }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={LS.root}>
      <style>{CSS}</style>
      <div style={LS.shell}>
        <div style={LS.brand}>
          <div style={LS.logoMark}>
            <VaultMilesLogo size={40} />
          </div>
          <div style={LS.wordmark}>
            Vault<span style={{ color: T.gold }}>Miles</span>
          </div>
          <div style={LS.sub}>Your KrisFlyer miles, consolidated.</div>
        </div>

        {/* Mode toggle */}
        <div style={LS.modeRow}>
          {["signup", "signin"].map((m) => (
            <button
              key={m}
              style={{ ...LS.modeBtn, ...(mode === m ? LS.modeBtnActive : {}) }}
              onClick={() => {
                setMode(m);
                setError("");
              }}
            >
              <span style={{ ...LS.modeBtnText, ...(mode === m ? LS.modeBtnTextActive : {}) }}>
                {m === "signup" ? "Create account" : "Sign in"}
              </span>
            </button>
          ))}
        </div>

        <div style={LS.card}>
          <div style={LS.fields}>
            {isSignUp && (
              <div style={LS.fieldGroup}>
                <label style={LS.label}>Full name</label>
                <input
                  className="v-input"
                  type="text"
                  placeholder="Jane Tan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            )}
            <div style={LS.fieldGroup}>
              <label style={LS.label}>Email address</label>
              <input
                className="v-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div style={LS.fieldGroup}>
              <label style={LS.label}>Password</label>
              <input
                className="v-input"
                type="password"
                placeholder={isSignUp ? "Min. 6 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            {isSignUp && (
              <div style={LS.fieldGroup}>
                <label style={LS.label}>
                  KrisFlyer number <span style={{ color: T.faint }}>(optional)</span>
                </label>
                <input
                  className="v-input"
                  placeholder="8879996605"
                  value={kfNum}
                  onChange={(e) => setKfNum(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            )}
          </div>
          {error && <div style={LS.error}>{error}</div>}
          <button className="v-btn-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner size={14} /> : isSignUp ? "Create account →" : "Sign in →"}
          </button>
          <p style={LS.legal}>
            {isSignUp
              ? "Your data syncs securely to the cloud."
              : "Data synced to your account across devices."}
          </p>
        </div>

        {isSignUp && (
          <div style={LS.features}>
            {[
              ["📷", "Scan any bank screenshot", "AI reads your balance automatically"],
              ["✦", "All Singapore banks", "DBS, UOB, OCBC, Citi, HSBC, SC, Amex, Maybank"],
              ["☁", "Syncs across devices", "Your miles are safe, even if you change devices"],
            ].map(([icon, title, desc]) => (
              <div key={title} style={LS.feature}>
                <div style={LS.featureIcon}>{icon}</div>
                <div>
                  <div style={LS.featureTitle}>{title}</div>
                  <div style={LS.featureDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const LS = {
  root: {
    minHeight: "100vh",
    background: T.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    boxSizing: "border-box",
  },
  shell: { width: "100%", maxWidth: 390, display: "flex", flexDirection: "column", gap: 28 },
  brand: { textAlign: "center" },
  logoMark: { display: "flex", justifyContent: "center", marginBottom: 16 },
  wordmark: {
    fontFamily: T.display,
    fontSize: 32,
    fontWeight: 700,
    color: T.ink,
    letterSpacing: "0.02em",
    marginBottom: 8,
  },
  sub: {
    fontFamily: T.mono,
    fontSize: 11,
    letterSpacing: "0.18em",
    color: T.faint,
    textTransform: "uppercase",
  },
  card: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 28 },
  cardLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    letterSpacing: "0.2em",
    color: T.faint,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  fields: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontFamily: T.mono,
    fontSize: 10.5,
    letterSpacing: "0.1em",
    color: T.mist,
    textTransform: "uppercase",
  },
  error: {
    fontFamily: T.mono,
    fontSize: 12,
    color: T.warn,
    marginBottom: 14,
    background: T.warnDim,
    border: `1px solid ${T.warn}`,
    borderRadius: 8,
    padding: "8px 12px",
  },
  legal: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 1.6,
  },
  modeRow: {
    display: "flex",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: 3,
    gap: 0,
  },
  modeBtn: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    borderRadius: 10,
    background: "none",
    cursor: "pointer",
  },
  modeBtnActive: { background: T.gold },
  modeBtnText: { fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: "0.08em" },
  modeBtnTextActive: { color: "#0E1117", fontWeight: 600 },
  features: { display: "flex", flexDirection: "column", gap: 16 },
  feature: { display: "flex", alignItems: "flex-start", gap: 14 },
  featureIcon: { fontSize: 18, width: 32, textAlign: "center", flexShrink: 0, marginTop: 1 },
  featureTitle: { fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 2 },
  featureDesc: { fontFamily: T.mono, fontSize: 11, color: T.mist },
};

/* ─── APP SHELL ───────────────────────────────────────────────────────── */
const TABS = [
  { id: "cards", label: "Wallet", icon: CreditCardIcon },
  { id: "fly", label: "Fly", icon: PlaneIcon },
  { id: "history", label: "Progress", icon: ChartIcon },
  { id: "settings", label: "You", icon: SettingsIcon },
];

function AppShell({ user, onLogout }) {
  const [tab, setTab] = useState("cards");
  const [catalog, setCatalog] = useState(CATALOG);
  const [holdings, setHoldings] = useState([]);
  const [snaps, setSnaps] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [changeCardUid, setChangeCardUid] = useState(null); // uid of card being changed, null = adding new
  const toastRef = useRef(null);

  const catById = useMemo(() => {
    const m = {};
    catalog.forEach((c) => (m[c.id] = c));
    return m;
  }, [catalog]);

  useEffect(() => {
    (async () => {
      try {
        const [cat, h, snapsData, favs] = await Promise.all([
          getCatalog(),
          getHoldings(),
          getSnapshots(),
          getFavourites(),
        ]);
        setCatalog(cat);
        setHoldings(h.map((x) => ({ ...x, scanning: false, scanResult: null })));
        setSnaps(snapsData);
        setFavourites(favs);
      } finally {
        setDataReady(true);
      }
    })();
  }, [user]);

  const rows = useMemo(
    () =>
      holdings.map((h) => ({
        ...h,
        src: catById[h.srcId],
        ...convertSource(catById[h.srcId], h.balance),
      })),
    [holdings, catById]
  );

  const totalMiles = useMemo(() => rows.reduce((s, r) => s + r.miles, 0), [rows]);
  const totalFees = useMemo(() => rows.reduce((s, r) => s + r.fee, 0), [rows]);

  function fire(msg, type = "good") {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }
  function persistHold(next) {
    setHoldings(next);
    saveHoldings(
      next.map((h) => ({ uid: h.uid, srcId: h.srcId, balance: h.balance, expiry: h.expiry }))
    );
  }
  function toggleFav(f) {
    const prev = favourites;
    const exists = prev.some((x) => favKey(x) === favKey(f));
    if (exists) {
      setFavourites(prev.filter((x) => favKey(x) !== favKey(f)));
      removeFavourite(f).catch(() => {
        setFavourites(prev);
        fire("Couldn't remove favourite — try again", "warn");
      });
    } else {
      setFavourites([...prev, f]);
      addFavourite(f).catch(() => {
        setFavourites(prev);
        fire("Couldn't save favourite — try again", "warn");
      });
    }
  }
  function updateHold(u, patch) {
    const next = holdings.map((h) => (h.uid === u ? { ...h, ...patch } : h));
    setHoldings(next);
    if ("balance" in patch || "srcId" in patch || "expiry" in patch)
      saveHoldings(
        next.map((h) => ({ uid: h.uid, srcId: h.srcId, balance: h.balance, expiry: h.expiry }))
      );
  }
  function removeHold(u) {
    persistHold(holdings.filter((h) => h.uid !== u));
  }

  // Opens picker for adding a new card
  function addCard() {
    setChangeCardUid(null);
    setShowCardPicker(true);
  }

  // Opens picker to change an existing card's bank
  function handleChangeCard(u) {
    setChangeCardUid(u);
    setShowCardPicker(true);
  }

  function onPickerSelect(srcId) {
    setShowCardPicker(false);
    if (changeCardUid) {
      updateHold(changeCardUid, { srcId });
      fire("Card updated");
    } else {
      persistHold([
        ...holdings,
        { uid: uid(), srcId, balance: "", expiry: "", scanning: false, scanResult: null },
      ]);
    }
    setChangeCardUid(null);
  }

  async function handleScan(u, file) {
    if (!file) return;
    updateHold(u, { scanning: true, scanResult: null });
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("read failed"));
        r.readAsDataURL(file);
      });
      const result = await readScreenshot(b64, file.type || "image/png");
      const srcId = BANK_TO_ID[result.bank] || holdings.find((h) => h.uid === u)?.srcId;
      const balance =
        result.confidence !== "low" && result.balance > 0
          ? String(result.balance)
          : holdings.find((h) => h.uid === u)?.balance || "";
      updateHold(u, { scanning: false, scanResult: result, srcId, balance });
      result.confidence === "low"
        ? fire("Couldn't read clearly — enter manually", "warn")
        : fire(`Read ${fmt(result.balance)} from ${result.label}`);
    } catch (e) {
      updateHold(u, { scanning: false, scanResult: { confidence: "low", note: e.message } });
      fire("Scan failed — check connection", "warn");
    }
  }

  function saveSnap(month) {
    const snap = { month, total: totalMiles, fees: totalFees };
    const idx = snaps.findIndex((s) => s.month === month);
    const next = idx >= 0 ? snaps.map((s, i) => (i === idx ? snap : s)) : [...snaps, snap];
    setSnaps(next);
    saveSnapshots(next);
    fire(`Snapshot saved`);
  }
  function removeSnap(m) {
    const next = snaps.filter((s) => s.month !== m);
    setSnaps(next);
    saveSnapshots(next);
  }
  function updateRate(id, field, val) {
    const next = catalog.map((c) =>
      c.id === id ? { ...c, [field]: field === "fee" ? Number(val) || 0 : num(val) } : c
    );
    setCatalog(next);
    saveCatalog(next);
  }
  function resetRates() {
    setCatalog(CATALOG);
    resetCatalogStorage();
    fire("Rates reset");
  }

  // used set: when changing a card, exclude that card's current srcId
  const usedSet = useMemo(
    () => new Set(holdings.filter((h) => h.uid !== changeCardUid).map((h) => h.srcId)),
    [holdings, changeCardUid]
  );

  return (
    <div style={SH.root}>
      <style>{CSS}</style>

      {/* Toast */}
      <div
        style={{
          ...SH.toast,
          opacity: toast ? 1 : 0,
          transform: toast ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(8px)",
          background: toast?.type === "warn" ? T.warnDim : T.goodDim,
          borderColor: toast?.type === "warn" ? T.warn : T.good,
          color: toast?.type === "warn" ? T.warn : T.good,
        }}
      >
        {toast?.msg}
      </div>

      {/* Card picker modal */}
      {showCardPicker && (
        <CardPickerModal
          catalog={catalog}
          used={usedSet}
          title={changeCardUid ? "Change card" : "Add a card"}
          onSelect={onPickerSelect}
          onClose={() => {
            setShowCardPicker(false);
            setChangeCardUid(null);
          }}
        />
      )}

      {/* Content */}
      <div style={SH.content}>
        {tab === "cards" && (
          <TabCards
            rows={rows}
            totalMiles={totalMiles}
            totalFees={totalFees}
            dataReady={dataReady}
            catalog={catalog}
            addCard={addCard}
            updateHold={updateHold}
            removeHold={removeHold}
            handleScan={handleScan}
            user={user}
            onChangeCard={handleChangeCard}
          />
        )}
        {tab === "fly" && (
          <TabFly
            totalMiles={totalMiles}
            favourites={favourites}
            onToggleFav={toggleFav}
            userId={user?.id}
          />
        )}
        {tab === "history" && (
          <TabHistory
            snaps={snaps}
            totalMiles={totalMiles}
            saveSnap={saveSnap}
            removeSnap={removeSnap}
          />
        )}
        {tab === "settings" && (
          <TabSettings
            user={user}
            onLogout={onLogout}
            catalog={catalog}
            updateRate={updateRate}
            resetRates={resetRates}
            fire={fire}
          />
        )}
      </div>

      {/* Tab bar */}
      <nav style={SH.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button key={t.id} className="v-tab" style={SH.tabBtn} onClick={() => setTab(t.id)}>
              <Icon active={active} />
              <span style={{ ...SH.tabLabel, color: active ? T.gold : T.faint }}>{t.label}</span>
              {active && <div style={SH.tabDot} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

const SH = {
  root: {
    minHeight: "100vh",
    background: T.bg,
    display: "flex",
    flexDirection: "column",
    maxWidth: 430,
    margin: "0 auto",
    position: "relative",
  },
  toast: {
    position: "fixed",
    bottom: 90,
    left: "50%",
    fontFamily: T.mono,
    fontSize: 12,
    padding: "9px 16px",
    borderRadius: 999,
    border: "1px solid",
    zIndex: 999,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    transition: "opacity .22s ease, transform .22s ease",
  },
  content: { flex: 1, overflowY: "auto", paddingBottom: 72 },
  tabBar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    background: T.surface,
    borderTop: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "stretch",
    zIndex: 100,
    paddingBottom: "env(safe-area-inset-bottom,0px)",
  },
  tabBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: "10px 4px 8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    position: "relative",
    minHeight: 56,
  },
  tabLabel: {
    fontFamily: T.mono,
    fontSize: 9.5,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    transition: "color .15s",
  },
  tabDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 999,
    background: T.gold,
  },
};

/* ─── ROOT ────────────────────────────────────────────────────────────── */
export default function Root() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setUser(await buildProfile(session.user));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // After email confirmation, write the pending profile if it was stored
        if (event === "SIGNED_IN") {
          const pendingName = sessionStorage.getItem("vm:pending_name");
          const pendingKf = sessionStorage.getItem("vm:pending_kf");
          if (pendingName) {
            await supabase.from("profiles").upsert({
              id: session.user.id,
              name: pendingName,
              kf_num: pendingKf ?? "",
            });
            sessionStorage.removeItem("vm:pending_name");
            sessionStorage.removeItem("vm:pending_kf");
          }
        }
        setUser(await buildProfile(session.user));
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    // Clear all local data so the next user on this browser starts clean
    [K_CAT, K_HOLD, K_SNAP, K_INIT].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
    setUser(null);
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{CSS}</style>
        <Spinner size={20} />
      </div>
    );

  return user ? <AppShell user={user} onLogout={handleLogout} /> : <LoginScreen />;
}

async function buildProfile(authUser) {
  const { data } = await supabase
    .from("profiles")
    .select("name, kf_num, created_at")
    .eq("id", authUser.id)
    .single();
  return {
    id: authUser.id,
    name: data?.name ?? "",
    email: authUser.email ?? "",
    kfNum: data?.kf_num ?? "",
    joinedAt: data?.created_at?.slice(0, 7) ?? thisMonth(),
  };
}
