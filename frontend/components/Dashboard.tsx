// components/Dashboard.tsx
import React, { useRef, useEffect, memo } from "react";
import { usePortfolio } from "../hooks/usePortfolio";
import { formatCurrency, formatPercent, formatNumber } from "../lib/api";
import { SectorSummary, PortfolioRow } from "../types";

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 20);
    const drops: number[] = Array(cols).fill(1);
    const chars = "₹$%0123456789ABCDEF↑↓+-×÷";
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,229,255,0.15)";
      ctx.font = "14px Share Tech Mono";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" style={{ zIndex: 0 }} />;
};

const StatCard: React.FC<{ label: string; value: string; sub?: string; accent?: string }> = ({ label, value, sub, accent = "#00e5ff" }) => (
  <div style={{ background: "rgba(0,15,30,0.8)", border: `1px solid ${accent}44`, boxShadow: `0 0 20px ${accent}22`, padding: "16px 20px", borderRadius: 2, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
    <p style={{ fontFamily: "Share Tech Mono", fontSize: 10, letterSpacing: "0.3em", color: `${accent}88`, textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
    <p style={{ fontFamily: "Orbitron", fontSize: 22, fontWeight: 700, color: accent, textShadow: `0 0 10px ${accent}88` }}>{value}</p>
    {sub && <p style={{ fontFamily: "Share Tech Mono", fontSize: 12, color: accent, marginTop: 2 }}>{sub}</p>}
  </div>
);

const StockRow = memo(({ stock, index }: { stock: PortfolioRow; index: number }) => {
  const gain = stock.gainLoss > 0;
  return (
    <tr style={{ background: index % 2 === 0 ? "rgba(0,20,40,0.4)" : "rgba(0,10,25,0.4)", borderBottom: "1px solid rgba(0,229,255,0.06)" }}>
      <td style={{ padding: "9px 14px", color: "#e0f0ff" }}>{stock.particulars}</td>
      <td style={{ textAlign: "right", padding: "9px 14px" }}>{formatCurrency(stock.purchasePrice)}</td>
      <td style={{ textAlign: "right", padding: "9px 14px" }}>{stock.qty}</td>
      <td style={{ textAlign: "right", padding: "9px 14px" }}>{formatCurrency(stock.investment)}</td>
      <td style={{ textAlign: "right", padding: "9px 14px" }}>{formatNumber(stock.portfolioPercent)}%</td>
      <td style={{ textAlign: "center", padding: "9px 14px" }}>{stock.exchange}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#ffd700" }}>{formatCurrency(stock.cmp)}</td>
      <td style={{ textAlign: "right", padding: "9px 14px" }}>{formatCurrency(stock.presentValue)}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: gain ? "#00ff88" : "#ff3366" }}>
        {gain ? "▲" : "▼"} {formatCurrency(Math.abs(stock.gainLoss))}
      </td>
      <td style={{ textAlign: "right", padding: "9px 14px" }}>{stock.peRatio != null ? formatNumber(stock.peRatio) : "N/A"}</td>
      <td style={{ textAlign: "right", padding: "9px 14px" }}>{stock.latestEarnings ?? "N/A"}</td>
    </tr>
  );
});
StockRow.displayName = "StockRow";

const SectorGroup = memo(({ summary }: { summary: SectorSummary }) => (
  <div style={{ marginBottom: 24, border: "1px solid rgba(0,229,255,0.2)" }}>
    <div style={{ padding: 16, background: "linear-gradient(90deg, rgba(0,229,255,0.12), transparent)" }}>
      <h2 style={{ color: "#00e5ff", fontFamily: "Orbitron" }}>{summary.sector}</h2>
    </div>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Stock", "Buy", "Qty", "Investment", "Weight", "Exchange", "CMP", "Present", "P&L", "P/E", "EPS"].map((h) => (
            <th key={h} style={{ padding: 10, color: "#00e5ff", fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {summary.stocks.map((stock, i) => <StockRow key={stock.id} stock={stock} index={i} />)}
      </tbody>
    </table>
  </div>
));
SectorGroup.displayName = "SectorGroup";

const Dashboard: React.FC = () => {
  const { sectors, totals, loading, error } = usePortfolio();
  const holdingsCount = sectors.reduce((s, sec) => s + sec.stocks.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#020408", position: "relative" }}>
      <MatrixRain />
      <div style={{ position: "relative", zIndex: 1, padding: 32 }}>
        <header style={{ marginBottom: 30 }}>
          <h1 style={{ fontFamily: "Orbitron", fontSize: 36, color: "#ffffff" }}>
            Fin<span style={{ color: "#00e5ff" }}>Port</span>
          </h1>
        </header>

        {loading && <div style={{ color: "#00e5ff" }}>Loading portfolio...</div>}
        {error && <div style={{ color: "#ff3366" }}>{error}</div>}

        {!loading && !error && totals && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Invested" value={formatCurrency(totals.totalInvestment)} />
              <StatCard label="Current Value" value={formatCurrency(totals.totalPresentValue)} accent="#b47fff" />
              <StatCard label="Overall P&L" value={formatCurrency(totals.totalGainLoss)} sub={formatPercent(totals.totalGainLossPercent)} accent={totals.totalGainLoss >= 0 ? "#00ff88" : "#ff3366"} />
              <StatCard label="Holdings" value={String(holdingsCount)} sub={`${sectors.length} SECTORS`} accent="#ffd700" />
            </div>
            {sectors.map((sector) => <SectorGroup key={sector.sector} summary={sector} />)}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;