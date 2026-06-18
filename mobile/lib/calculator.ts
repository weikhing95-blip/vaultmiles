import { CatalogEntry } from "../constants/catalog";
import { CabinId, RedeemId, Destination } from "../constants/destinations";

export interface ConversionResult {
  miles: number;
  stranded: number;
  fee: number;
}

export function convertSource(src: CatalogEntry | undefined, balance: string): ConversionResult {
  const p = parseInt(balance.replace(/[^0-9]/g, ""), 10) || 0;
  if (!src || src.blockPts <= 0) return { miles: 0, stranded: p, fee: 0 };
  if (p < src.min) return { miles: 0, stranded: p, fee: 0 };
  const blocks = Math.floor(p / src.blockPts);
  return {
    miles: blocks * src.blockMiles,
    stranded: p - blocks * src.blockPts,
    fee: blocks > 0 ? src.fee : 0,
  };
}

export function getMiles(
  dest: Destination,
  redeem: RedeemId,
  cabin: CabinId,
  tripType: "oneway" | "return"
): number | null {
  const tier = dest.miles[redeem];
  if (!tier) return null;
  const base = tier[cabin];
  if (base == null) return null;
  return tripType === "return" ? base * 2 : base;
}

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function thisMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function monthLabel(m: string): string {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// "YYYY-MM" → previous month "YYYY-MM" (mirrors web prevMonthStr).
export function prevMonthStr(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
}

export function flag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)));
}
