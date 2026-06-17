export const K_CAT = "kfv5-catalog";
export const K_HOLD = "kfv5-holdings";
export const K_SNAP = "kfv5-snapshots";
export const K_INIT = "kfv5-init";
export const K_USER = "kfv5-user";

export const num = (v) => parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10) || 0;
export const fmt = (n) => num(n).toLocaleString("en-US");
export const uid = () => Math.random().toString(36).slice(2, 9);
export const thisMonth = () => new Date().toISOString().slice(0, 7);
export const monthLabel = (m) => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};
export const flag = (code) =>
  code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)));

// Stable identity for a favourited route. Includes origin (fixed "SIN" today)
// so adding origins later won't break saved favourites.
export const favKey = (f) => `${f.origin ?? "SIN"}|${f.city}|${f.cabin}|${f.tier}|${f.trip}`;

export function convertSource(src, points) {
  const p = num(points);
  if (!src || src.blockPts <= 0) return { miles: 0, stranded: p, fee: 0 };
  if (p < src.min) return { miles: 0, stranded: p, fee: 0 };
  const blocks = Math.floor(p / src.blockPts);
  return {
    miles: blocks * src.blockMiles,
    stranded: p - blocks * src.blockPts,
    fee: blocks > 0 ? src.fee : 0,
  };
}

// localStorage fallback when window.storage (Claude.ai artifact API) is unavailable
export async function loadKey(k, fb) {
  if (typeof window === "undefined") return fb;
  if (window.storage) {
    try {
      const r = await window.storage.get(k, false);
      if (r?.value != null) return JSON.parse(r.value);
    } catch {}
  }
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fb;
  } catch {
    return fb;
  }
}

export async function saveKey(k, v) {
  if (typeof window === "undefined") return;
  if (window.storage) {
    try {
      await window.storage.set(k, JSON.stringify(v), false);
      return;
    } catch {}
  }
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

export async function readScreenshot(base64, mimeType) {
  const res = await fetch("/api/ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `OCR failed (${res.status})`);
  }
  return res.json();
}
