/**
 * Storage abstraction — AsyncStorage today, Supabase tomorrow.
 * All functions follow the same interface so swapping backends = changing this file only.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CATALOG, CatalogEntry } from "../constants/catalog";

const K = {
  user:     "vm:user",
  holdings: "vm:holdings",
  snapshots:"vm:snapshots",
  catalog:  "vm:catalog",
  init:     "vm:init",
} as const;

/* ── types ─────────────────────────────────────────────────────────── */

export interface User {
  name: string;
  email: string;
  kfNum: string;
  joinedAt: string;
}

export interface Holding {
  uid: string;
  srcId: string;
  balance: string;
}

export interface Snapshot {
  month: string;   // "2026-06"
  total: number;
  fees: number;
}

/* ── helpers ────────────────────────────────────────────────────────── */

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* ── auth ───────────────────────────────────────────────────────────── */

export async function getUser(): Promise<User | null> {
  return get<User | null>(K.user, null);
}

export async function saveUser(user: User): Promise<void> {
  return set(K.user, user);
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(K.user);
}

/* ── holdings ───────────────────────────────────────────────────────── */

const DEMO_HOLDINGS: Holding[] = [
  { uid: "demo1", srcId: "krisflyer", balance: "120675" },
  { uid: "demo2", srcId: "uob",       balance: "22830"  },
  { uid: "demo3", srcId: "hsbc",      balance: "74337"  },
];

export async function getHoldings(): Promise<Holding[]> {
  const inited = await get<boolean>(K.init, false);
  if (!inited) {
    await set(K.holdings, DEMO_HOLDINGS);
    await set(K.init, true);
    return DEMO_HOLDINGS;
  }
  return get<Holding[]>(K.holdings, []);
}

export async function saveHoldings(holdings: Holding[]): Promise<void> {
  return set(K.holdings, holdings);
}

/* ── snapshots ──────────────────────────────────────────────────────── */

export async function getSnapshots(): Promise<Snapshot[]> {
  return get<Snapshot[]>(K.snapshots, []);
}

export async function saveSnapshots(snaps: Snapshot[]): Promise<void> {
  return set(K.snapshots, snaps);
}

/* ── catalog (user-overrideable rates) ──────────────────────────────── */

export async function getCatalog(): Promise<CatalogEntry[]> {
  const overrides = await get<CatalogEntry[] | null>(K.catalog, null);
  if (!overrides) return CATALOG;
  return CATALOG.map((d) => overrides.find((o) => o.id === d.id) ?? d);
}

export async function saveCatalog(catalog: CatalogEntry[]): Promise<void> {
  return set(K.catalog, catalog);
}

export async function resetCatalog(): Promise<void> {
  await AsyncStorage.removeItem(K.catalog);
}
