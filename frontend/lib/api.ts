// lib/api.ts — all HTTP calls + number formatters

import axios from "axios";
import { PortfolioApiResponse, LiveUpdate } from "../types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// ── API calls ──────────────────────────────────────────────────────────────

/** Full portfolio fetch — called once on page load */
export async function fetchPortfolio(): Promise<PortfolioApiResponse> {
  const { data } = await api.get<PortfolioApiResponse>("/portfolio");
  return data;
}

/** Live prices only — called every 15 seconds */
export async function fetchLivePrices(): Promise<LiveUpdate[]> {
  const { data } = await api.get<{ success: boolean; data: LiveUpdate[] }>(
    "/portfolio/live"
  );
  return data.data ?? [];
}

// ── Formatters ─────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  if (value === 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}