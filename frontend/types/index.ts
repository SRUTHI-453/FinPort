// types/index.ts  — mirrors backend types exactly

export interface StockHolding {
  id: string;
  particulars: string;
  ticker: string;
  exchange: string;
  sector: string;
  purchasePrice: number;
  qty: number;
}

export interface LiveStockData {
  ticker: string;
  cmp: number;
  peRatio: number | null;
  latestEarnings: string | null;
  lastUpdated: string;
}

export interface PortfolioRow extends StockHolding, LiveStockData {
  investment: number;
  portfolioPercent: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  stocks: PortfolioRow[];
}

export interface PortfolioTotals {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface PortfolioApiResponse {
  success: boolean;
  data?: {
    sectors: SectorSummary[];
    totals: PortfolioTotals;
  };
  error?: string;
  timestamp: string;
}

export interface LiveUpdate {
  id: string;
  ticker: string;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  lastUpdated: string;
}
