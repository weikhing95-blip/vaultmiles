import { useState, useEffect, useMemo } from "react";
import { CATALOG, CatalogEntry } from "../constants/catalog";
import {
  Holding, Snapshot,
  getHoldings, saveHoldings,
  getSnapshots, saveSnapshots,
  getCatalog, saveCatalog, resetCatalog,
} from "../lib/storage";
import { convertSource, uid } from "../lib/calculator";

export interface Row extends Holding {
  src: CatalogEntry | undefined;
  miles: number;
  stranded: number;
  fee: number;
}

export function useHoldings() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>(CATALOG);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getCatalog(), getHoldings(), getSnapshots()]).then(([cat, hold, snap]) => {
      setCatalog(cat);
      setHoldings(hold);
      setSnaps(snap);
      setReady(true);
    });
  }, []);

  const catById = useMemo(() => {
    const m: Record<string, CatalogEntry> = {};
    catalog.forEach((c) => (m[c.id] = c));
    return m;
  }, [catalog]);

  const rows: Row[] = useMemo(
    () =>
      holdings.map((h) => {
        const src = catById[h.srcId];
        const conv = convertSource(src, h.balance);
        return { ...h, src, ...conv };
      }),
    [holdings, catById],
  );

  const totalMiles = useMemo(() => rows.reduce((s, r) => s + r.miles, 0), [rows]);
  const totalFees  = useMemo(() => rows.reduce((s, r) => s + r.fee, 0), [rows]);

  /* ── holdings CRUD ─────────────────────────────────────────────── */

  function persistHoldings(next: Holding[]) {
    setHoldings(next);
    saveHoldings(next);
  }

  function addHolding(srcId: string) {
    persistHoldings([...holdings, { uid: uid(), srcId, balance: "" }]);
  }

  function updateHolding(id: string, patch: Partial<Holding>) {
    const next = holdings.map((h) => (h.uid === id ? { ...h, ...patch } : h));
    persistHoldings(next);
  }

  function removeHolding(id: string) {
    persistHoldings(holdings.filter((h) => h.uid !== id));
  }

  /* ── snapshots ─────────────────────────────────────────────────── */

  function saveSnap(month: string) {
    const snap = { month, total: totalMiles, fees: totalFees };
    const idx = snaps.findIndex((s) => s.month === month);
    const next = idx >= 0 ? snaps.map((s, i) => (i === idx ? snap : s)) : [...snaps, snap];
    setSnaps(next);
    saveSnapshots(next);
  }

  function removeSnap(month: string) {
    const next = snaps.filter((s) => s.month !== month);
    setSnaps(next);
    saveSnapshots(next);
  }

  /* ── catalog ───────────────────────────────────────────────────── */

  function updateRate(id: string, field: keyof CatalogEntry, val: string) {
    const next = catalog.map((c) =>
      c.id === id
        ? { ...c, [field]: field === "fee" ? parseFloat(val) || 0 : parseInt(val) || 0 }
        : c,
    );
    setCatalog(next);
    saveCatalog(next);
  }

  function doResetCatalog() {
    setCatalog(CATALOG);
    resetCatalog();
  }

  return {
    catalog, rows, totalMiles, totalFees, snaps, ready,
    addHolding, updateHolding, removeHolding,
    saveSnap, removeSnap,
    updateRate, resetCatalog: doResetCatalog,
  };
}
