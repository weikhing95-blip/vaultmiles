import { createContext, useContext, ReactNode } from "react";
import { useHoldings } from "../hooks/useHoldings";

type HoldingsContextValue = ReturnType<typeof useHoldings>;

const HoldingsContext = createContext<HoldingsContextValue | null>(null);

export function HoldingsProvider({ children }: { children: ReactNode }) {
  const value = useHoldings();
  return <HoldingsContext.Provider value={value}>{children}</HoldingsContext.Provider>;
}

export function useHoldingsCtx(): HoldingsContextValue {
  const ctx = useContext(HoldingsContext);
  if (!ctx) throw new Error("useHoldingsCtx must be used inside HoldingsProvider");
  return ctx;
}
