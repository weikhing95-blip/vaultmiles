import { supabase } from "./supabase.js";
import { CATALOG } from "./data.js";

const DEMO_HOLDINGS = [
  { uid: "demo1", srcId: "krisflyer", balance: "120675" },
  { uid: "demo2", srcId: "uob", balance: "22830" },
  { uid: "demo3", srcId: "hsbc", balance: "74337" },
];

async function userId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/* ── holdings ─────────────────────────────────────────────────────── */

export async function getHoldings() {
  const uid = await userId();
  if (!uid) return [];

  const { data, error } = await supabase
    .from("holdings")
    .select("uid, src_id, balance")
    .eq("user_id", uid)
    .order("sort_order");

  if (error) return [];

  if (!data || data.length === 0) {
    const seeded = localStorage.getItem(`vm:seeded:${uid}`);
    if (!seeded) {
      await saveHoldings(DEMO_HOLDINGS);
      localStorage.setItem(`vm:seeded:${uid}`, "true");
      return DEMO_HOLDINGS;
    }
    return [];
  }

  return data.map((row) => ({ uid: row.uid, srcId: row.src_id, balance: row.balance }));
}

export async function saveHoldings(holdings) {
  const uid = await userId();
  if (!uid) return;

  const { data: backup } = await supabase
    .from("holdings")
    .select("uid, src_id, balance, sort_order")
    .eq("user_id", uid)
    .order("sort_order");

  const { error: deleteError } = await supabase.from("holdings").delete().eq("user_id", uid);
  if (deleteError) throw deleteError;

  if (holdings.length === 0) return;

  const { error: insertError } = await supabase.from("holdings").insert(
    holdings.map((h, idx) => ({
      user_id: uid,
      uid: h.uid,
      src_id: h.srcId,
      balance: h.balance,
      sort_order: idx,
    }))
  );

  if (insertError) {
    if (backup?.length) {
      await supabase
        .from("holdings")
        .insert(
          backup.map((r) => ({
            user_id: uid,
            uid: r.uid,
            src_id: r.src_id,
            balance: r.balance,
            sort_order: r.sort_order,
          }))
        );
    }
    throw insertError;
  }
}

/* ── snapshots ────────────────────────────────────────────────────── */

export async function getSnapshots() {
  const uid = await userId();
  if (!uid) return [];

  const { data, error } = await supabase
    .from("snapshots")
    .select("month, total, fees")
    .eq("user_id", uid)
    .order("month");

  if (error) return [];
  return data ?? [];
}

export async function saveSnapshots(snaps) {
  const uid = await userId();
  if (!uid) return;

  const { data: backup } = await supabase
    .from("snapshots")
    .select("month, total, fees")
    .eq("user_id", uid);

  const { error: deleteError } = await supabase.from("snapshots").delete().eq("user_id", uid);
  if (deleteError) throw deleteError;

  if (snaps.length === 0) return;

  const { error: insertError } = await supabase
    .from("snapshots")
    .insert(snaps.map((s) => ({ user_id: uid, month: s.month, total: s.total, fees: s.fees })));

  if (insertError) {
    if (backup?.length) {
      await supabase
        .from("snapshots")
        .insert(
          backup.map((r) => ({ user_id: uid, month: r.month, total: r.total, fees: r.fees }))
        );
    }
    throw insertError;
  }
}

/* ── catalog overrides ────────────────────────────────────────────── */

export async function getCatalog() {
  const uid = await userId();
  if (!uid) return CATALOG;

  const { data } = await supabase
    .from("catalog_overrides")
    .select("src_id, block_pts, block_miles, min_pts, fee")
    .eq("user_id", uid);

  if (!data?.length) return CATALOG;

  return CATALOG.map((d) => {
    const o = data.find((r) => r.src_id === d.id);
    if (!o) return d;
    return {
      ...d,
      blockPts: o.block_pts ?? d.blockPts,
      blockMiles: o.block_miles ?? d.blockMiles,
      min: o.min_pts ?? d.min,
      fee: o.fee ?? d.fee,
    };
  });
}

export async function saveCatalog(catalog) {
  const uid = await userId();
  if (!uid) return;

  const changed = catalog.filter((c) => {
    const def = CATALOG.find((d) => d.id === c.id);
    return (
      def &&
      (c.blockPts !== def.blockPts ||
        c.blockMiles !== def.blockMiles ||
        c.min !== def.min ||
        c.fee !== def.fee)
    );
  });

  const { data: backup } = await supabase
    .from("catalog_overrides")
    .select("src_id, block_pts, block_miles, min_pts, fee")
    .eq("user_id", uid);

  const { error: deleteError } = await supabase
    .from("catalog_overrides")
    .delete()
    .eq("user_id", uid);
  if (deleteError) throw deleteError;

  if (changed.length === 0) return;

  const { error: insertError } = await supabase.from("catalog_overrides").insert(
    changed.map((c) => ({
      user_id: uid,
      src_id: c.id,
      block_pts: c.blockPts,
      block_miles: c.blockMiles,
      min_pts: c.min,
      fee: c.fee,
    }))
  );

  if (insertError) {
    if (backup?.length) {
      await supabase.from("catalog_overrides").insert(backup.map((r) => ({ user_id: uid, ...r })));
    }
    throw insertError;
  }
}

export async function resetCatalog() {
  const uid = await userId();
  if (!uid) return;
  await supabase.from("catalog_overrides").delete().eq("user_id", uid);
}
