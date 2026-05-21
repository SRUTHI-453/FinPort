// hooks/usePortfolio.ts
// ─────────────────────────────────────────────────────────────────────────────
// Custom React hook — manages all portfolio data and live refresh.
//
// Pattern:
//   1. Mount → fetch full portfolio once (expensive: Yahoo + Google for all stocks)
//   2. Every 15s → fetch live prices only (cheap: Yahoo CMP only)
//   3. Merge live update into existing state immutably
//
// Why this pattern?
//   Full fetch = up to 54 external requests (27 stocks × 2 sources).
//   Doing this every 15s risks rate-limiting. The /live endpoint only
//   calls Yahoo Finance (27 requests), which is acceptable.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { SectorSummary, PortfolioTotals, LiveUpdate } from "../types";
import { fetchPortfolio, fetchLivePrices } from "../lib/api";

const REFRESH_INTERVAL_MS = 15_000;

export interface UsePortfolioReturn {
  sectors: SectorSummary[];
  totals: PortfolioTotals | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function usePortfolio(): UsePortfolioReturn {
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [totals, setTotals] = useState<PortfolioTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Full fetch (once on mount) ─────────────────────────────────────────
  const loadFullPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPortfolio();
      if (res.success && res.data) {
        setSectors(res.data.sectors);
        setTotals(res.data.totals);
        setLastUpdated(res.timestamp);
      } else {
        setError(res.error ?? "Unknown error");
      }
    } catch (err) {
      setError(
        (err as Error).message ||
          "Cannot connect to backend. Is it running on port 4000?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Live price refresh (every 15s) ─────────────────────────────────────
  const refreshLivePrices = useCallback(async () => {
    try {
      setRefreshing(true);
      const updates: LiveUpdate[] = await fetchLivePrices();

      // Build id → update lookup map
      const updateMap = new Map<string, LiveUpdate>();
      updates.forEach((u) => updateMap.set(u.id, u));

      // Immutably update only the changed fields in sectors state
      setSectors((prev) =>
        prev.map((sector) => {
          const updatedStocks = sector.stocks.map((stock) => {
            const u = updateMap.get(stock.id);
            if (!u) return stock;
            return {
              ...stock,
              cmp: u.cmp,
              presentValue: u.presentValue,
              gainLoss: u.gainLoss,
              gainLossPercent: u.gainLossPercent,
            };
          });

          const totalInvestment = updatedStocks.reduce((s, r) => s + r.investment, 0);
          const totalPresentValue = updatedStocks.reduce((s, r) => s + r.presentValue, 0);
          const gainLoss = totalPresentValue - totalInvestment;
          const gainLossPercent =
            totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;

          return { ...sector, stocks: updatedStocks, totalInvestment, totalPresentValue, gainLoss, gainLossPercent };
        })
      );

      // Recompute overall totals — investment is fixed, only presentValue changes
      setTotals((prev) => {
        if (!prev) return prev;
        const totalPresentValue = updates.reduce((s, u) => s + u.presentValue, 0);
        const totalGainLoss = totalPresentValue - prev.totalInvestment;
        const totalGainLossPercent =
          prev.totalInvestment > 0
            ? (totalGainLoss / prev.totalInvestment) * 100
            : 0;
        return { ...prev, totalPresentValue, totalGainLoss, totalGainLossPercent };
      });

      setLastUpdated(new Date().toISOString());
    } catch (err) {
      // Silent fail — keep showing old data, don't crash the UI
      console.warn("[usePortfolio] Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Mount effect ───────────────────────────────────────────────────────
  useEffect(() => {
    loadFullPortfolio();
    timerRef.current = setInterval(refreshLivePrices, REFRESH_INTERVAL_MS);

    // Cleanup: prevent memory leak on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadFullPortfolio, refreshLivePrices]);

  return { sectors, totals, loading, refreshing, error, lastUpdated };
}
