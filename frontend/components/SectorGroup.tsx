// components/SectorGroup.tsx
import React, { useState } from "react";
import { SectorSummary, PortfolioRow } from "../types";
import { formatCurrency, formatPercent, formatNumber } from "../lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────

function gainClass(value: number): string {
  if (value > 0) return "text-green-600 font-semibold";
  if (value < 0) return "text-red-600 font-semibold";
  return "text-gray-400";
}

const SECTOR_BG: Record<string, string> = {
  Financial: "bg-blue-700",
  Tech:      "bg-violet-700",
  Consumer:  "bg-amber-600",
  Power:     "bg-green-700",
  Pipe:      "bg-cyan-700",
  Others:    "bg-gray-600",
};

// ── StockRow ──────────────────────────────────────────────────────────────

const StockRow: React.FC<{ stock: PortfolioRow; index: number }> = ({ stock, index }) => (
  <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
    <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap">{stock.particulars}</td>
    <td className="px-3 py-2 text-sm text-right text-gray-600">{formatCurrency(stock.purchasePrice)}</td>
    <td className="px-3 py-2 text-sm text-right text-gray-600">{stock.qty}</td>
    <td className="px-3 py-2 text-sm text-right text-gray-700">{formatCurrency(stock.investment)}</td>
    <td className="px-3 py-2 text-sm text-right text-gray-600">{formatNumber(stock.portfolioPercent)}%</td>
    <td className="px-3 py-2 text-sm text-center">
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
        {stock.exchange}
      </span>
    </td>
    <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
      {stock.cmp > 0
        ? formatCurrency(stock.cmp)
        : <span className="text-gray-400 italic text-xs">Loading…</span>}
    </td>
    <td className="px-3 py-2 text-sm text-right text-gray-700">
      {stock.presentValue > 0 ? formatCurrency(stock.presentValue) : "—"}
    </td>
    <td className={`px-3 py-2 text-sm text-right ${gainClass(stock.gainLoss)}`}>
      {stock.gainLoss !== 0 ? (
        <>{formatCurrency(stock.gainLoss)} <span className="text-xs">({formatPercent(stock.gainLossPercent)})</span></>
      ) : "—"}
    </td>
    <td className="px-3 py-2 text-sm text-right text-gray-600">
      {stock.peRatio != null ? formatNumber(stock.peRatio) : <span className="text-gray-400">N/A</span>}
    </td>
    <td className="px-3 py-2 text-sm text-right text-gray-600">
      {stock.latestEarnings ?? <span className="text-gray-400">N/A</span>}
    </td>
  </tr>
);

// ── SectorSummaryRow ──────────────────────────────────────────────────────

const SectorSummaryRow: React.FC<{ s: SectorSummary }> = ({ s }) => (
  <tr className="bg-gray-100 border-t-2 border-gray-300">
    <td colSpan={3} className="px-3 py-2 text-sm font-bold text-gray-700">{s.sector} Total</td>
    <td className="px-3 py-2 text-sm text-right font-bold text-gray-700">{formatCurrency(s.totalInvestment)}</td>
    <td colSpan={2} />
    <td />
    <td className="px-3 py-2 text-sm text-right font-bold text-gray-700">{formatCurrency(s.totalPresentValue)}</td>
    <td className={`px-3 py-2 text-sm text-right font-bold ${gainClass(s.gainLoss)}`}>
      {formatCurrency(s.gainLoss)} <span className="text-xs">({formatPercent(s.gainLossPercent)})</span>
    </td>
    <td colSpan={2} />
  </tr>
);

// ── SectorGroup ───────────────────────────────────────────────────────────

interface Props { summary: SectorSummary; }

const SectorGroup: React.FC<Props> = ({ summary }) => {
  const [open, setOpen] = useState(true);
  const bg = SECTOR_BG[summary.sector] ?? "bg-gray-700";

  return (
    <div className="mb-5 rounded-xl overflow-hidden border border-gray-200 shadow-sm">

      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 ${bg} text-white text-left`}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm">{summary.sector} Sector</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {summary.stocks.length} stocks
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span>Invested: <strong>{formatCurrency(summary.totalInvestment)}</strong></span>
          <span className={summary.gainLoss >= 0 ? "text-green-200" : "text-red-200"}>
            P&amp;L: <strong>{formatCurrency(summary.gainLoss)} ({formatPercent(summary.gainLossPercent)})</strong>
          </span>
          <span className="opacity-60">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Collapsible table */}
      {open && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-3 py-2">Stock Name</th>
                <th className="px-3 py-2 text-right">Buy Price</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Investment</th>
                <th className="px-3 py-2 text-right">Portfolio %</th>
                <th className="px-3 py-2 text-center">Exchange</th>
                <th className="px-3 py-2 text-right">CMP</th>
                <th className="px-3 py-2 text-right">Present Value</th>
                <th className="px-3 py-2 text-right">Gain / Loss</th>
                <th className="px-3 py-2 text-right">P/E Ratio</th>
                <th className="px-3 py-2 text-right">EPS (TTM)</th>
              </tr>
            </thead>
            <tbody>
              {summary.stocks.map((stock, i) => (
                <StockRow key={stock.id} stock={stock} index={i} />
              ))}
              <SectorSummaryRow s={summary} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SectorGroup;
