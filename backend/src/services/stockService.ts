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

const GOOGLE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// ── Convert NSE ticker to Google Finance format ───────────────────────────
function toGoogleTicker(ticker: string): string {
  // HDFCBANK.NS → NSE:HDFCBANK
  // HDFCBANK.BO → BOM:HDFCBANK
  if (ticker.endsWith(".NS")) return `NSE:${ticker.replace(".NS", "")}`;
  if (ticker.endsWith(".BO")) return `BOM:${ticker.replace(".BO", "")}`;
  return ticker;
}

// ── Scrape P/E and EPS from Google Finance ────────────────────────────────
async function fetchGoogleFundamentals(ticker: string): Promise<{
  peRatio: number | null;
  latestEarnings: string | null;
}> {
  const cacheKey = `gfund_${ticker}`;
  const cached = cache.get<any>(cacheKey);
  if (cached) return cached;

  try {
    const googleTicker = toGoogleTicker(ticker);
    const url = `https://www.google.com/finance/quote/${googleTicker}`;

    const res = await fetch(url, { headers: GOOGLE_HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Extract P/E ratio
    let peRatio: number | null = null;
    const peMatch = html.match(/P\/E ratio[\s\S]*?<div[^>]*>([\d.]+)<\/div>/i) ||
                    html.match(/"P\/E ratio"[^}]*"([\d.]+)"/i) ||
                    html.match(/P\\u002FE ratio[\s\S]{0,200}?([\d]{1,4}\.[\d]{1,2})/);
    if (peMatch) {
      const val = parseFloat(peMatch[1]);
      if (!isNaN(val)) peRatio = val;
    }

    // Extract EPS
    let latestEarnings: string | null = null;
    const epsMatch = html.match(/EPS[\s\S]*?<div[^>]*>([-\d.]+)<\/div>/i) ||
                     html.match(/"EPS"[^}]*"([-\d.]+)"/i) ||
                     html.match(/Earnings per share[\s\S]{0,200}?([-\d]{1,4}\.[\d]{1,2})/i);
    if (epsMatch) {
      latestEarnings = epsMatch[1];
    }

    const result = { peRatio, latestEarnings };
    cache.set(cacheKey, result, 300); // cache 5 minutes
    return result;

  } catch (err) {
    console.error(`[GOOGLE FINANCE] ${ticker}:`, (err as Error).message);
    return { peRatio: null, latestEarnings: null };
  }
}

// ── Fetch CMP ─────────────────────────────────────────────────────────────
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

      const chartPrice = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (chartPrice && chartPrice > 0) {
        cache.set(cacheKey, chartPrice);
        return chartPrice;
      }

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

// ── Fetch Fundamentals (Yahoo first, Google fallback) ─────────────────────
async function fetchFundamentals(ticker: string): Promise<{
  peRatio: number | null;
  latestEarnings: string | null;
}> {
  const cacheKey = `fund_${ticker}`;
  const cached = cache.get<any>(cacheKey);
  if (cached) return cached;

  // Try Yahoo first
  const yahooEndpoints = [
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics`,
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics`,
  ];

  for (const url of yahooEndpoints) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) continue;

      const data = await res.json() as any;
      const stats = data?.quoteSummary?.result?.[0]?.defaultKeyStatistics;
      const peRatio = stats?.trailingPE?.raw ?? null;
      const eps = stats?.trailingEps?.raw ?? null;

      if (peRatio || eps) {
        const result = {
          peRatio,
          latestEarnings: eps != null ? String(eps) : null,
        };
        cache.set(cacheKey, result);
        return result;
      }
    } catch {}
  }

  // Fallback to Google Finance
  console.log(`[FUNDAMENTALS] Yahoo failed for ${ticker}, trying Google Finance...`);
  const googleResult = await fetchGoogleFundamentals(ticker);

  if (googleResult.peRatio || googleResult.latestEarnings) {
    cache.set(cacheKey, googleResult);
  }

  return googleResult;
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