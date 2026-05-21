// src/services/stockService.ts

import NodeCache from "node-cache";
import { LiveStockData } from "../types";

const cache = new NodeCache({ stdTTL: 15, checkperiod: 20 });

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  "Accept": "application/json",
};

// ─────────────────────────────────────────────────────────────────────────────
// Fetch ALL data (CMP + P/E + EPS) from Yahoo v8 chart endpoint in ONE call
// ─────────────────────────────────────────────────────────────────────────────

async function fetchYahooData(ticker: string): Promise<{
  cmp: number;
  peRatio: number | null;
  latestEarnings: string | null;
}> {
  const cacheKey = `yahoo_${ticker}`;
  const cached = cache.get<any>(cacheKey);
  if (cached) return cached;

  try {
    // v8 chart endpoint — no auth needed, returns price + some fundamentals
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const chartRes = await fetch(chartUrl, { headers: HEADERS });
    const chartData = await chartRes.json();
    const meta = chartData?.chart?.result?.[0]?.meta ?? {};
    const cmp: number = meta?.regularMarketPrice ?? 0;

    // v10 quoteSummary — different endpoint, more reliable than yahoo-finance2 library
    let peRatio: number | null = null;
    let latestEarnings: string | null = null;

    try {
      const summaryUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics%2CfinancialData`;
      const summaryRes = await fetch(summaryUrl, { headers: HEADERS });
      const summaryData = await summaryRes.json();
      const stats = summaryData?.quoteSummary?.result?.[0]?.defaultKeyStatistics;
      const financial = summaryData?.quoteSummary?.result?.[0]?.financialData;

      peRatio = stats?.trailingPE?.raw ?? financial?.currentPrice?.raw ?? null;
      const eps = stats?.trailingEps?.raw ?? financial?.revenuePerShare?.raw ?? null;
      latestEarnings = eps != null ? String(eps) : null;
    } catch {
      // PE/EPS fetch failed — still return CMP
    }

    const result = { cmp, peRatio, latestEarnings };
    cache.set(cacheKey, result);
    return result;

  } catch (err) {
    console.error(`[YAHOO ERROR] ${ticker}`, (err as Error).message);
    return { cmp: 0, peRatio: null, latestEarnings: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public: fetch full live data for ONE stock
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchLiveData(ticker: string): Promise<LiveStockData> {
  const { cmp, peRatio, latestEarnings } = await fetchYahooData(ticker);
  return {
    ticker,
    cmp,
    peRatio,
    latestEarnings,
    lastUpdated: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public: fetch live data for ALL stocks
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllLiveData(tickers: string[]): Promise<LiveStockData[]> {
  const results = await Promise.allSettled(tickers.map((t) => fetchLiveData(t)));

  return results.map((r, index) => {
    if (r.status === "fulfilled") return r.value;
    return {
      ticker: tickers[index],
      cmp: 0,
      peRatio: null,
      latestEarnings: null,
      lastUpdated: new Date().toISOString(),
    };
  });
}