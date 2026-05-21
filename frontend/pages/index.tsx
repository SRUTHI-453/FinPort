// pages/index.tsx
import React, { useState, useEffect, useRef, memo } from "react";
import Head from "next/head";
import { usePortfolio } from "../hooks/usePortfolio";
import { formatCurrency, formatPercent, formatNumber } from "../lib/api";
import { SectorSummary, PortfolioRow } from "../types";

// ── Prevents SSR ──────────────────────────────────────────────────────────
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted;
}

// ── Matrix Rain ───────────────────────────────────────────────────────────
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
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", opacity: 0.3, zIndex: 0,
      }}
    />
  );
};

// ── Intro Screen ──────────────────────────────────────────────────────────
const IntroScreen: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const letters = ["F", "i", "n", "P", "o", "r", "t"];
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      setActiveIndex(current);
      current++;
      if (current >= letters.length) {
        clearInterval(interval);
        setTimeout(() => setReady(true), 1000);
      }
    }, 350);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Enter" && ready) onEnter(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ready, onEnter]);

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", alignItems: "center",
      justifyContent: "center", overflow: "hidden", minHeight: "100vh",
      backgroundColor: "#020408",
      background: "radial-gradient(circle at center, #001220 0%, #020408 70%)",
      zIndex: 100,
    }}>
      <MatrixRain />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Glow orb */}
      <div style={{
        position: "absolute", zIndex: 1, width: 500, height: 500,
        borderRadius: "50%", background: "rgba(0,229,255,0.08)",
        filter: "blur(100px)", pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <p style={{
          fontFamily: "Share Tech Mono", color: "rgba(0,229,255,0.6)",
          letterSpacing: "0.4em", fontSize: 12, marginBottom: 40,
        }}>
          INITIALIZING FINANCIAL INTELLIGENCE SYSTEM
        </p>

        {/* Letter boxes */}
        <div style={{ display: "flex", gap: 18, justifyContent: "center", alignItems: "center" }}>
          {letters.map((letter, index) => {
            const active = index <= activeIndex;
            return (
              <div key={index} style={{
                width: 70, height: 100, overflow: "hidden", position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: active ? "1px solid rgba(0,229,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: active ? "0 0 25px rgba(0,229,255,0.3)" : "none",
                transition: "border 0.3s, box-shadow 0.3s",
              }}>
                <span style={{
                  fontFamily: "Orbitron", fontWeight: 900, fontSize: 52,
                  color: active ? "#00e5ff" : "rgba(255,255,255,0.15)",
                  textShadow: active ? "0 0 20px #00e5ff, 0 0 50px #00e5ff" : "none",
                  transition: "color 0.4s, text-shadow 0.4s",
                  animation: active ? "flicker 4s infinite" : "none",
                }}>
                  {letter}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 30, fontFamily: "Share Tech Mono",
          color: "rgba(0,229,255,0.5)", letterSpacing: "0.3em", fontSize: 12,
        }}>
          LIVE NSE / BSE MARKET CORE
        </div>

        {ready && (
          <div style={{ marginTop: 70, animation: "fadeIn 1s ease" }}>
            <button
              onClick={onEnter}
              style={{
                padding: "16px 60px", border: "1px solid #00e5ff",
                background: "rgba(0,229,255,0.08)", color: "#00e5ff",
                fontFamily: "Orbitron", fontSize: 14, letterSpacing: "0.3em",
                cursor: "pointer", boxShadow: "0 0 30px rgba(0,229,255,0.3)",
                transition: "0.3s",
              }}
            >
              ENTER SYSTEM
            </button>
            <p style={{
              marginTop: 14, fontFamily: "Share Tech Mono",
              color: "rgba(0,229,255,0.35)", fontSize: 11, letterSpacing: "0.2em",
            }}>
              PRESS ENTER OR CLICK
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Live Clock ────────────────────────────────────────────────────────────
const LiveClock: React.FC = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!time) return null;

  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(time.getTime() + (time.getTimezoneOffset() * 60000) + istOffset);
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const day = ist.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const afterOpen = hours > 9 || (hours === 9 && minutes >= 15);
  const beforeClose = hours < 15 || (hours === 15 && minutes <= 30);
  const isMarketOpen = isWeekday && afterOpen && beforeClose;

  const h = String(ist.getHours() % 12 || 12).padStart(2, "0");
  const m = String(ist.getMinutes()).padStart(2, "0");
  const s = String(ist.getSeconds()).padStart(2, "0");
  const ampm = ist.getHours() >= 12 ? "PM" : "AM";
  const timeStr = `${h}:${m}:${s} ${ampm}`;

  const dateStr = ist.toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      {/* Clock */}
      <div style={{
        fontFamily: "Orbitron", fontSize: 28, fontWeight: 700,
        color: "#00e5ff", letterSpacing: "0.1em",
        textShadow: "0 0 15px rgba(0,229,255,0.6)",
      }}>
        {timeStr}
      </div>

      {/* Date + Market status */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{
          fontFamily: "Share Tech Mono", fontSize: 11,
          color: "rgba(0,229,255,0.45)", letterSpacing: "0.15em",
        }}>
          {dateStr.toUpperCase()} · IST
        </span>

        {/* NSE badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "3px 10px",
          border: `1px solid ${isMarketOpen ? "rgba(0,255,136,0.4)" : "rgba(255,51,102,0.3)"}`,
          background: isMarketOpen ? "rgba(0,255,136,0.08)" : "rgba(255,51,102,0.08)",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: isMarketOpen ? "#00ff88" : "#ff3366",
            boxShadow: isMarketOpen ? "0 0 6px #00ff88" : "0 0 6px #ff3366",
            animation: isMarketOpen ? "glow-pulse 2s infinite" : "none",
          }} />
          <span style={{
            fontFamily: "Share Tech Mono", fontSize: 10,
            color: isMarketOpen ? "#00ff88" : "#ff3366",
            letterSpacing: "0.2em",
          }}>
            NSE {isMarketOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>

        {/* BSE badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "3px 10px",
          border: `1px solid ${isMarketOpen ? "rgba(0,255,136,0.4)" : "rgba(255,51,102,0.3)"}`,
          background: isMarketOpen ? "rgba(0,255,136,0.08)" : "rgba(255,51,102,0.08)",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: isMarketOpen ? "#00ff88" : "#ff3366",
            boxShadow: isMarketOpen ? "0 0 6px #00ff88" : "0 0 6px #ff3366",
            animation: isMarketOpen ? "glow-pulse 2s infinite" : "none",
          }} />
          <span style={{
            fontFamily: "Share Tech Mono", fontSize: 10,
            color: isMarketOpen ? "#00ff88" : "#ff3366",
            letterSpacing: "0.2em",
          }}>
            BSE {isMarketOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string; sub?: string; accent?: string }> = ({
  label, value, sub, accent = "#00e5ff",
}) => (
  <div style={{
    background: "rgba(0,15,30,0.8)", border: `1px solid ${accent}44`,
    boxShadow: `0 0 20px ${accent}22`, padding: "16px 20px",
    borderRadius: 2, position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
    }} />
    <p style={{
      fontFamily: "Share Tech Mono", fontSize: 10, letterSpacing: "0.3em",
      color: `${accent}88`, textTransform: "uppercase", marginBottom: 6,
    }}>
      {label}
    </p>
    <p style={{
      fontFamily: "Orbitron", fontSize: 22, fontWeight: 700,
      color: accent, textShadow: `0 0 10px ${accent}88`,
    }}>
      {value}
    </p>
    {sub && (
      <p style={{ fontFamily: "Share Tech Mono", fontSize: 12, color: accent, marginTop: 2 }}>
        {sub}
      </p>
    )}
  </div>
);

// ── Stock Row ─────────────────────────────────────────────────────────────
const StockRow = memo(({ stock, index }: { stock: PortfolioRow; index: number }) => {
  const gain = stock.gainLoss > 0;
  return (
    <tr style={{
      background: index % 2 === 0 ? "rgba(0,20,40,0.4)" : "rgba(0,10,25,0.4)",
      borderBottom: "1px solid rgba(0,229,255,0.06)",
    }}>
      <td style={{ padding: "9px 14px", color: "#e0f0ff" }}>{stock.particulars}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#a0b8cc" }}>{formatCurrency(stock.purchasePrice)}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#a0b8cc" }}>{stock.qty}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#c0d8e8" }}>{formatCurrency(stock.investment)}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#a0b8cc" }}>{formatNumber(stock.portfolioPercent)}%</td>
      <td style={{ textAlign: "center", padding: "9px 14px", color: "#80a0b8" }}>{stock.exchange}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#ffd700", fontWeight: 600 }}>{formatCurrency(stock.cmp)}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#c0d8e8" }}>{formatCurrency(stock.presentValue)}</td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: gain ? "#00ff88" : "#ff3366", fontWeight: 600 }}>
        {gain ? "▲" : "▼"} {formatCurrency(Math.abs(stock.gainLoss))}
        <span style={{ fontSize: 11, marginLeft: 4 }}>({formatPercent(stock.gainLossPercent)})</span>
      </td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#a0b8cc" }}>
        {stock.peRatio != null ? formatNumber(stock.peRatio) : "N/A"}
      </td>
      <td style={{ textAlign: "right", padding: "9px 14px", color: "#a0b8cc" }}>
        {stock.latestEarnings ?? "N/A"}
      </td>
    </tr>
  );
});
StockRow.displayName = "StockRow";

// ── Sector Group ──────────────────────────────────────────────────────────
const SectorGroup = memo(({ summary }: { summary: SectorSummary }) => {
  const [open, setOpen] = useState(true);
  const gain = summary.gainLoss >= 0;
  return (
    <div style={{
      marginBottom: 24, border: "1px solid rgba(0,229,255,0.2)",
      borderRadius: 4, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "12px 16px",
          background: "linear-gradient(90deg, rgba(0,229,255,0.12), transparent)",
          border: "none", cursor: "pointer",
        }}
      >
        <h2 style={{ color: "#00e5ff", fontFamily: "Orbitron", fontSize: 14, margin: 0 }}>
          {summary.sector}
        </h2>
        <div style={{ display: "flex", gap: 24, alignItems: "center", fontFamily: "Share Tech Mono", fontSize: 12 }}>
          <span style={{ color: "#a0b8cc" }}>
            Invested: <strong style={{ color: "#e0f0ff" }}>{formatCurrency(summary.totalInvestment)}</strong>
          </span>
          <span style={{ color: gain ? "#00ff88" : "#ff3366" }}>
            P&amp;L: <strong>{formatCurrency(summary.gainLoss)} ({formatPercent(summary.gainLossPercent)})</strong>
          </span>
          <span style={{ color: "rgba(0,229,255,0.4)" }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Share Tech Mono", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,229,255,0.2)" }}>
                {["Stock", "Buy Price", "Qty", "Investment", "Weight", "Exchange", "CMP", "Present Value", "P&L", "P/E", "EPS"].map((h) => (
                  <th key={h} style={{
                    padding: "8px 14px", color: "rgba(0,229,255,0.6)", fontSize: 11,
                    fontWeight: 400, textAlign: h === "Stock" ? "left" : "right", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.stocks.map((stock, i) => (
                <StockRow key={stock.id} stock={stock} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
SectorGroup.displayName = "SectorGroup";

// ── Dashboard ─────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { sectors, totals, loading, error } = usePortfolio();
  const holdingsCount = sectors.reduce((s, sec) => s + sec.stocks.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#020408", position: "relative" }}>
      <MatrixRain />
      <div style={{ position: "relative", zIndex: 1, padding: 32 }}>

        {/* Header with clock */}
        <header style={{
          marginBottom: 30, display: "flex",
          alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(0,229,255,0.15)",
          paddingBottom: 20,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, border: "1.5px solid #00e5ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 15px rgba(0,229,255,0.4)",
            }}>
              <span style={{ fontFamily: "Orbitron", fontSize: 22, color: "#00e5ff", fontWeight: 900 }}>₹</span>
            </div>
            <div>
              <h1 style={{ fontFamily: "Orbitron", fontSize: 32, color: "#ffffff", margin: 0, lineHeight: 1 }}>
                Fin<span style={{ color: "#00e5ff", textShadow: "0 0 15px #00e5ff" }}>Port</span>
              </h1>
              <p style={{ fontFamily: "Share Tech Mono", fontSize: 9, color: "rgba(0,229,255,0.4)", letterSpacing: "0.2em", margin: 0, marginTop: 3 }}>
                PORTFOLIO INTELLIGENCE SYSTEM
              </p>
            </div>
          </div>

          {/* Live clock */}
          <LiveClock />
        </header>

        {loading && (
          <div style={{ color: "#00e5ff", fontFamily: "Share Tech Mono", padding: 40, textAlign: "center", letterSpacing: "0.3em" }}>
            FETCHING MARKET DATA...
          </div>
        )}
        {error && (
          <div style={{ color: "#ff3366", fontFamily: "Share Tech Mono", padding: 40, textAlign: "center" }}>
            {error}
          </div>
        )}

        {!loading && !error && totals && (
  <>
    {/* Stats cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
      <StatCard label="Total Invested" value={formatCurrency(totals.totalInvestment)} />
      <StatCard label="Current Value" value={formatCurrency(totals.totalPresentValue)} accent="#b47fff" />

      {/* Enhanced P&L card */}
      <div style={{
        background: totals.totalGainLoss >= 0 ? "rgba(0,255,136,0.08)" : "rgba(255,51,102,0.1)",
        border: `2px solid ${totals.totalGainLoss >= 0 ? "#00ff88" : "#ff3366"}`,
        boxShadow: totals.totalGainLoss >= 0
          ? "0 0 30px rgba(0,255,136,0.3), inset 0 0 30px rgba(0,255,136,0.05)"
          : "0 0 30px rgba(255,51,102,0.4), inset 0 0 30px rgba(255,51,102,0.08)",
        padding: "16px 20px", borderRadius: 2,
        position: "relative", overflow: "hidden",
      }}>
        {/* Animated top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: totals.totalGainLoss >= 0
            ? "linear-gradient(90deg, transparent, #00ff88, transparent)"
            : "linear-gradient(90deg, transparent, #ff3366, transparent)",
          animation: "glow-pulse 2s ease-in-out infinite",
        }} />
        {/* Top-right corner accent */}
        <div style={{
          position: "absolute", top: 6, right: 6, width: 10, height: 10,
          borderTop: `2px solid ${totals.totalGainLoss >= 0 ? "#00ff88" : "#ff3366"}`,
          borderRight: `2px solid ${totals.totalGainLoss >= 0 ? "#00ff88" : "#ff3366"}`,
        }} />
        {/* Bottom-left corner accent */}
        <div style={{
          position: "absolute", bottom: 6, left: 6, width: 10, height: 10,
          borderBottom: `2px solid ${totals.totalGainLoss >= 0 ? "#00ff88" : "#ff3366"}`,
          borderLeft: `2px solid ${totals.totalGainLoss >= 0 ? "#00ff88" : "#ff3366"}`,
        }} />

        <p style={{
          fontFamily: "Share Tech Mono", fontSize: 10, letterSpacing: "0.3em",
          color: totals.totalGainLoss >= 0 ? "rgba(0,255,136,0.7)" : "rgba(255,51,102,0.7)",
          textTransform: "uppercase", marginBottom: 6,
        }}>
          Overall P&amp;L
        </p>
        <p style={{
          fontFamily: "Orbitron", fontSize: 26, fontWeight: 900,
          color: totals.totalGainLoss >= 0 ? "#00ff88" : "#ff3366",
          textShadow: totals.totalGainLoss >= 0
            ? "0 0 20px #00ff88, 0 0 40px rgba(0,255,136,0.5)"
            : "0 0 20px #ff3366, 0 0 40px rgba(255,51,102,0.5)",
          letterSpacing: "0.05em",
        }}>
          {totals.totalGainLoss >= 0 ? "▲" : "▼"} {formatCurrency(Math.abs(totals.totalGainLoss))}
        </p>
        <p style={{
          fontFamily: "Orbitron", fontSize: 16, fontWeight: 700, marginTop: 6,
          color: totals.totalGainLoss >= 0 ? "#00ff88" : "#ff3366",
          textShadow: totals.totalGainLoss >= 0 ? "0 0 10px #00ff88" : "0 0 10px #ff3366",
        }}>
          {formatPercent(totals.totalGainLossPercent)}
        </p>
      </div>

      <StatCard label="Holdings" value={String(holdingsCount)} sub={`${sectors.length} SECTORS`} accent="#ffd700" />
    </div>

    {/* Disclaimer */}
    <p style={{
      fontFamily: "Share Tech Mono", fontSize: 10,
      color: "rgba(0,229,255,0.25)", letterSpacing: "0.15em",
      marginBottom: 24, borderLeft: "2px solid rgba(0,229,255,0.15)", paddingLeft: 12,
    }}>
      ⚠ CMP VIA YAHOO FINANCE · P/E &amp; EPS VIA GOOGLE FINANCE · PRICES MAY HAVE DELAY · NOT INVESTMENT ADVICE
    </p>

    {/* Sector groups */}
    {sectors.map((sector) => (
      <SectorGroup key={sector.sector} summary={sector} />
    ))}
  </>
)}
    </div>
  </div>
  );
};

// ── Root Page ─────────────────────────────────────────────────────────────
export default function Page() {
  const isMounted = useIsMounted();
  const [launched, setLaunched] = useState(false);

  if (!isMounted) return null;

  return (
    <>
      <Head>
        <title>FinPort — Portfolio Intelligence</title>
        <meta name="description" content="Real-time Indian stock portfolio tracker" />
      </Head>
      {!launched ? (
        <IntroScreen onEnter={() => setLaunched(true)} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}