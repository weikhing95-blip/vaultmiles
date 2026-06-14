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
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)));

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
  const prompt = `You are reading a Singapore bank rewards/points app screenshot.
Extract the REDEEMABLE balance (not pending, not expiring, not lifetime earned).
Return ONLY valid JSON, no markdown:
{"bank":"one of [KrisFlyer,DBS,UOB,OCBC 90N,OCBC Rewards,Citi ThankYou,Citi Miles,HSBC,SC Tier1,SC Tier2,Amex,Unknown]","balance":0,"label":"short field name","confidence":"high|medium|low","note":""}
Rules: KrisFlyer=KRISFLYER MILES total not Elite; UOB=UNI$ available; HSBC=Your points at top; OCBC 90N=Travel$ or 90N Miles; DBS=DBS Points; Citi=distinguish by card type; SC=360° Rewards Points; Amex=Membership Rewards; blurry=confidence low balance 0`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: base64 },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text = data.content?.find((b) => b.type === "text")?.text || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
