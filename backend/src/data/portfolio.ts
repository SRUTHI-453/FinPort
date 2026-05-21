// src/data/portfolio.ts
// ─────────────────────────────────────────────────────────────────────────────
// Static portfolio holdings — sourced from E555815F_58D02905OB.xlsx
//
// NO DATABASE NEEDED:
//   Holdings (stock name, buy price, qty) are static — they don't change at
//   runtime. Live data (CMP, P/E, EPS) is always fetched fresh from
//   Yahoo Finance and Google Finance. A database would only be needed if
//   users could add/edit their own holdings dynamically.
//
// HOW TO UPDATE:
//   Add or remove stocks here. Ticker format:
//     .NS suffix = NSE  (e.g. HDFCBANK.NS)
//     .BO suffix = BSE  (e.g. HDFCBANK.BO)
// ─────────────────────────────────────────────────────────────────────────────

import { StockHolding } from "../types";

export const PORTFOLIO_HOLDINGS: StockHolding[] = [

  // ── Financial Sector ──────────────────────────────────────────────────────
  {
    id: "fin-1",
    particulars: "HDFC Bank",
    ticker: "HDFCBANK.NS",
    exchange: "NSE",
    sector: "Financial",
    purchasePrice: 1550,
    qty: 10,
  },
  {
    id: "fin-2",
    particulars: "Bajaj Finance",
    ticker: "BAJFINANCE.NS",
    exchange: "NSE",
    sector: "Financial",
    purchasePrice: 6800,
    qty: 5,
  },
  {
    id: "fin-3",
    particulars: "ICICI Bank",
    ticker: "ICICIBANK.NS",
    exchange: "NSE",
    sector: "Financial",
    purchasePrice: 920,
    qty: 15,
  },
  {
    id: "fin-4",
    particulars: "Bajaj Housing",
    ticker: "BAJAJHFL.NS",
    exchange: "NSE",
    sector: "Financial",
    purchasePrice: 110,
    qty: 50,
  },
  {
    id: "fin-5",
    particulars: "Savani Financials",
    ticker: "SAVANIFINL.NS",
    exchange: "NSE",
    sector: "Financial",
    purchasePrice: 85,
    qty: 100,
  },

  // ── Tech Sector ───────────────────────────────────────────────────────────
  {
    id: "tech-1",
    particulars: "Affle India",
    ticker: "AFFLE.NS",
    exchange: "NSE",
    sector: "Tech",
    purchasePrice: 1200,
    qty: 8,
  },
  {
    id: "tech-2",
    particulars: "LTI Mindtree",
    ticker: "LTIM.NS",
    exchange: "NSE",
    sector: "Tech",
    purchasePrice: 4800,
    qty: 4,
  },
  {
    id: "tech-3",
    particulars: "KPIT Tech",
    ticker: "KPITTECH.NS",
    exchange: "NSE",
    sector: "Tech",
    purchasePrice: 1350,
    qty: 10,
  },
  {
    id: "tech-4",
    particulars: "Tata Tech",
    ticker: "TATATECH.NS",
    exchange: "NSE",
    sector: "Tech",
    purchasePrice: 1050,
    qty: 12,
  },
  {
    id: "tech-5",
    particulars: "BLS E-Services",
    ticker: "BLSE.NS",
    exchange: "NSE",
    sector: "Tech",
    purchasePrice: 220,
    qty: 30,
  },
  {
    id: "tech-6",
    particulars: "Tasia",
    ticker: "TASIA.NS",
    exchange: "NSE",
    sector: "Tech",
    purchasePrice: 580,
    qty: 20,
  },

  // ── Consumer Sector ───────────────────────────────────────────────────────
  {
    id: "con-1",
    particulars: "Dmart",
    ticker: "DMART.NS",
    exchange: "NSE",
    sector: "Consumer",
    purchasePrice: 3800,
    qty: 5,
  },
  {
    id: "con-2",
    particulars: "Tata Consumer",
    ticker: "TATACONSUM.NS",
    exchange: "NSE",
    sector: "Consumer",
    purchasePrice: 850,
    qty: 20,
  },
  {
    id: "con-3",
    particulars: "Pidilite",
    ticker: "PIDILITIND.NS",
    exchange: "NSE",
    sector: "Consumer",
    purchasePrice: 2600,
    qty: 6,
  },

  // ── Power Sector ──────────────────────────────────────────────────────────
  {
    id: "pow-1",
    particulars: "Tata Power",
    ticker: "TATAPOWER.NS",
    exchange: "NSE",
    sector: "Power",
    purchasePrice: 380,
    qty: 30,
  },
  {
    id: "pow-2",
    particulars: "KPI Green",
    ticker: "KPIGREEN.NS",
    exchange: "NSE",
    sector: "Power",
    purchasePrice: 950,
    qty: 10,
  },
  {
    id: "pow-3",
    particulars: "Suzlon",
    ticker: "SUZLON.NS",
    exchange: "NSE",
    sector: "Power",
    purchasePrice: 42,
    qty: 200,
  },
  {
    id: "pow-4",
    particulars: "Gensol",
    ticker: "GENSOL.NS",
    exchange: "NSE",
    sector: "Power",
    purchasePrice: 650,
    qty: 15,
  },

  // ── Pipe Sector ───────────────────────────────────────────────────────────
  {
    id: "pipe-1",
    particulars: "Hariom Pipes",
    ticker: "HARIOMPIPE.NS",
    exchange: "NSE",
    sector: "Pipe",
    purchasePrice: 480,
    qty: 20,
  },
  {
    id: "pipe-2",
    particulars: "Astral",
    ticker: "ASTRAL.NS",
    exchange: "NSE",
    sector: "Pipe",
    purchasePrice: 1800,
    qty: 8,
  },
  {
    id: "pipe-3",
    particulars: "Polycab",
    ticker: "POLYCAB.NS",
    exchange: "NSE",
    sector: "Pipe",
    purchasePrice: 4200,
    qty: 4,
  },

  // ── Others ────────────────────────────────────────────────────────────────
  {
    id: "oth-1",
    particulars: "Clean Science",
    ticker: "CLEAN.NS",
    exchange: "NSE",
    sector: "Others",
    purchasePrice: 1400,
    qty: 8,
  },
  {
    id: "oth-2",
    particulars: "Deepak Nitrite",
    ticker: "DEEPAKNTR.NS",
    exchange: "NSE",
    sector: "Others",
    purchasePrice: 2100,
    qty: 6,
  },
  {
    id: "oth-3",
    particulars: "Fine Organic",
    ticker: "FINEORG.NS",
    exchange: "NSE",
    sector: "Others",
    purchasePrice: 4500,
    qty: 3,
  },
  {
    id: "oth-4",
    particulars: "Gravita",
    ticker: "GRAVITA.NS",
    exchange: "NSE",
    sector: "Others",
    purchasePrice: 1800,
    qty: 7,
  },
  {
    id: "oth-5",
    particulars: "SBI Life",
    ticker: "SBILIFE.NS",
    exchange: "NSE",
    sector: "Others",
    purchasePrice: 1300,
    qty: 10,
  },
];
