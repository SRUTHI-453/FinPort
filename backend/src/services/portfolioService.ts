// src/services/portfolioService.ts

import {
  StockHolding,
  LiveStockData,
  PortfolioRow,
  SectorSummary,
} from "../types";

// ── Build one PortfolioRow per holding ───────────────────────────────────────

export function buildPortfolioRows(
  holdings: StockHolding[],
  liveDataMap: Map<string, LiveStockData>
): PortfolioRow[] {
  // Total investment across all holdings (used to compute portfolio weight %)
  const totalInvestment = holdings.reduce(
    (sum, h) => sum + h.purchasePrice * h.qty,
    0
  );

  return holdings.map((holding): PortfolioRow => {
    const live = liveDataMap.get(holding.ticker) ?? {
      ticker: holding.ticker,
      cmp: 0,
      peRatio: null,
      latestEarnings: null,
      lastUpdated: new Date().toISOString(),
    };

    const investment = holding.purchasePrice * holding.qty;
    const presentValue = live.cmp * holding.qty;
    const gainLoss = presentValue - investment;
    const gainLossPercent =
      investment > 0 ? (gainLoss / investment) * 100 : 0;
    const portfolioPercent =
      totalInvestment > 0 ? (investment / totalInvestment) * 100 : 0;

    return {
      ...holding,
      ...live,
      investment,
      portfolioPercent,
      presentValue,
      gainLoss,
      gainLossPercent,
    };
  });
}

// ── Group rows by sector and compute sector totals ───────────────────────────

export function groupBySector(rows: PortfolioRow[]): SectorSummary[] {
  // Accumulate stocks per sector using a Map
  const sectorMap = new Map<string, PortfolioRow[]>();

  rows.forEach((row) => {
    const list = sectorMap.get(row.sector) ?? [];
    sectorMap.set(row.sector, [...list, row]);
  });

  const summaries: SectorSummary[] = [];

  sectorMap.forEach((stocks, sector) => {
    const totalInvestment = stocks.reduce((s, r) => s + r.investment, 0);
    const totalPresentValue = stocks.reduce((s, r) => s + r.presentValue, 0);
    const gainLoss = totalPresentValue - totalInvestment;
    const gainLossPercent =
      totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;

    summaries.push({
      sector,
      totalInvestment,
      totalPresentValue,
      gainLoss,
      gainLossPercent,
      stocks,
    });
  });

  // Sort sectors alphabetically for consistent rendering
  return summaries.sort((a, b) => a.sector.localeCompare(b.sector));
}
