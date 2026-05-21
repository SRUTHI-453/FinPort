// src/routes/portfolio.ts

import { Router, Request, Response } from "express";
import { PORTFOLIO_HOLDINGS } from "../data/portfolio";
import { fetchAllLiveData } from "../services/stockService";
import { buildPortfolioRows, groupBySector } from "../services/portfolioService";
import { ApiResponse, SectorSummary, PortfolioTotals } from "../types";

const router = Router();

// ── GET /api/portfolio ────────────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tickers = PORTFOLIO_HOLDINGS.map((h) => h.ticker);

    // ✅ FIX: fetchAllLiveData returns an ARRAY, not a Map
    // buildPortfolioRows expects a Map — convert it first
    const liveDataArray = await fetchAllLiveData(tickers);
    const liveDataMap = new Map(liveDataArray.map((d) => [d.ticker, d]));

    const rows = buildPortfolioRows(PORTFOLIO_HOLDINGS, liveDataMap);
    const sectors = groupBySector(rows);

    const totalInvestment = rows.reduce((s, r) => s + r.investment, 0);
    const totalPresentValue = rows.reduce((s, r) => s + r.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercent =
      totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    const response: ApiResponse<{
      sectors: SectorSummary[];
      totals: PortfolioTotals;
    }> = {
      success: true,
      data: {
        sectors,
        totals: { totalInvestment, totalPresentValue, totalGainLoss, totalGainLossPercent },
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error("[GET /api/portfolio]", (error as Error).message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch portfolio data.",
      timestamp: new Date().toISOString(),
    });
  }
});

// ── GET /api/portfolio/live ───────────────────────────────────────────────────
router.get("/live", async (_req: Request, res: Response) => {
  try {
    const tickers = PORTFOLIO_HOLDINGS.map((h) => h.ticker);

    // ✅ FIX: same here — convert array → Map before .get() calls
    const liveDataArray = await fetchAllLiveData(tickers);
    const liveDataMap = new Map(liveDataArray.map((d) => [d.ticker, d]));

    const updates = PORTFOLIO_HOLDINGS.map((holding) => {
      const live = liveDataMap.get(holding.ticker);
      const cmp = live?.cmp ?? 0;
      const investment = holding.purchasePrice * holding.qty;
      const presentValue = cmp * holding.qty;
      const gainLoss = presentValue - investment;
      const gainLossPercent =
        investment > 0 ? (gainLoss / investment) * 100 : 0;

      return {
        id: holding.id,
        ticker: holding.ticker,
        cmp,
        presentValue,
        gainLoss,
        gainLossPercent,
        lastUpdated: live?.lastUpdated ?? new Date().toISOString(),
      };
    });

    res.json({
      success: true,
      data: updates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ── GET /api/portfolio/holdings ───────────────────────────────────────────────
router.get("/holdings", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: PORTFOLIO_HOLDINGS,
    timestamp: new Date().toISOString(),
  });
});

export default router;