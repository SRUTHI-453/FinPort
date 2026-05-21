// src/services/stockService.ts
import NodeCache from "node-cache";
import { LiveStockData } from "../types";

const cache = new NodeCache({ stdTTL: 30, checkperiod: 40 });

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Origin": "https://finance.yahoo.com",
  "Referer": "https://finance.yahoo.com/",
};

// ── Fetch CMP with multiple fallback endpoints ────────────────────────────
async function fetchCMP(ticker: string): Promise<number> {
  const cacheKey = `cmp_${ticker}`;
  const cached = cache.get<number>(cacheKey);
  if (cached !== undefined && cached > 0) return cached;

  const endpoints = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: HEADERS });

      if (!res.ok) continue;

      const data = await res.json() as any;

      // v8 chart response
      const chartPrice = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (chartPrice && chartPrice > 0) {
        cache.set(cacheKey, chartPrice);
        return chartPrice;
      }

      // v7 quote response
      const quotePrice = data?.quoteResponse?.result?.[0]?.regularMarketPrice;
      if (quotePrice && quotePrice > 0) {
        cache.set(cacheKey, quotePrice);
        return quotePrice;
      }

    } catch (err) {
      console.error(`[CMP] ${ticker} failed on ${url}:`, (err as Error).message);
    }
  }

  console.error(`[CMP FAILED] ${ticker} — all endpoints returned 0`);
  return 0;
}

// ── Fetch fundamentals ────────────────────────────────────────────────────
async function fetchFundamentals(ticker: string): Promise<{
  peRatio: number | null;
  latestEarnings: string | null;
}> {
  const cacheKey = `fund_${ticker}`;
  const cached = cache.get<any>(cacheKey);
  if (cached) return cached;

  const endpoints = [
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics`,
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) continue;

      const data = await res.json() as any;
      const stats = data?.quoteSummary?.result?.[0]?.defaultKeyStatistics;

      const peRatio = stats?.trailingPE?.raw ?? null;
      const eps = stats?.trailingEps?.raw ?? null;

      const result = {
        peRatio,
        latestEarnings: eps != null ? String(eps) : null,
      };

      cache.set(cacheKey, result);
      return result;
    } catch {}
  }

  return { peRatio: null, latestEarnings: null };
}

// ── Public: fetch one stock ───────────────────────────────────────────────
export async function fetchLiveData(ticker: string): Promise<LiveStockData> {
  const [cmp, fundamentals] = await Promise.all([
    fetchCMP(ticker),
    fetchFundamentals(ticker),
  ]);

  return {
    ticker,
    cmp,
    peRatio: fundamentals.peRatio,
    latestEarnings: fundamentals.latestEarnings,
    lastUpdated: new Date().toISOString(),
  };
}

// ── Public: fetch all stocks ──────────────────────────────────────────────
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