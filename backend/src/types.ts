// src/types.ts
// All shared TypeScript interfaces for the backend

export interface StockHolding {
  id: string;
  particulars: string;      // Display name e.g. "HDFC Bank"
  ticker: string;           // Yahoo Finance ticker e.g. "HDFCBANK.NS"
  exchange: string;         // "NSE" or "BSE"
  sector: string;           // "Financial", "Tech", "Consumer", "Power", "Pipe", "Others"
  purchasePrice: number;    // Your buy price in ₹
  qty: number;              // Number of shares held
}

export interface LiveStockData {
  ticker: string;
  cmp: number;                    // Current Market Price from Yahoo Finance
  peRatio: number | null;         // P/E Ratio from Google Finance
  latestEarnings: string | null;  // EPS (TTM) from Google Finance
  lastUpdated: string;            // ISO timestamp
}

// PortfolioRow = StockHolding + LiveStockData + computed fields
export interface PortfolioRow extends StockHolding, LiveStockData {
  investment: number;        // purchasePrice × qty
  portfolioPercent: number;  // This stock's share of total portfolio investment
  presentValue: number;      // cmp × qty
  gainLoss: number;          // presentValue − investment
  gainLossPercent: number;   // (gainLoss / investment) × 100
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

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
