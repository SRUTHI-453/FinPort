// components/IntroScreen.tsx
import React, { useState, useEffect, useRef } from "react";

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
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" style={{ zIndex: 0 }} />
  );
};

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
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(circle at center, #001220 0%, #020408 70%)", zIndex: 100 }}>
      <MatrixRain />
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "rgba(0,229,255,0.08)", filter: "blur(100px)" }} />
      <div className="relative z-10 text-center">
        <p style={{ fontFamily: "Share Tech Mono", color: "rgba(0,229,255,0.6)", letterSpacing: "0.4em", fontSize: 12, marginBottom: 40 }}>
          INITIALIZING FINANCIAL INTELLIGENCE SYSTEM
        </p>
        <div style={{ display: "flex", gap: "18px", justifyContent: "center", alignItems: "center" }}>
          {letters.map((letter, index) => {
            const active = index <= activeIndex;
            return (
              <div key={index} style={{ width: 70, height: 100, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", width: "100%", transition: "transform 0.5s cubic-bezier(0.2,0.8,0.2,1)", transform: active ? "translateY(-700px)" : "translateY(0px)" }}>
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("").concat(letter).map((c, i) => (
                    <div key={i} style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Orbitron", fontWeight: 900, fontSize: 72,
                      color: c === letter ? "#00e5ff" : "rgba(255,255,255,0.15)",
                      textShadow: c === letter ? "0 0 20px #00e5ff, 0 0 50px #00e5ff" : "none" }}>
                      {c}
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", inset: 0, border: active ? "1px solid rgba(0,229,255,0.5)" : "1px solid rgba(255,255,255,0.08)", boxShadow: active ? "0 0 25px rgba(0,229,255,0.3)" : "none" }} />
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 30, fontFamily: "Share Tech Mono", color: "rgba(0,229,255,0.5)", letterSpacing: "0.3em", fontSize: 12 }}>
          LIVE NSE / BSE MARKET CORE
        </div>
        {ready && (
          <div style={{ marginTop: 70, animation: "fadeIn 1s ease" }}>
            <button onClick={onEnter} style={{ padding: "16px 60px", border: "1px solid #00e5ff", background: "rgba(0,229,255,0.08)", color: "#00e5ff", fontFamily: "Orbitron", fontSize: 14, letterSpacing: "0.3em", cursor: "pointer", boxShadow: "0 0 30px rgba(0,229,255,0.3)", transition: "0.3s" }}>
              ENTER SYSTEM
            </button>
            <p style={{ marginTop: 14, fontFamily: "Share Tech Mono", color: "rgba(0,229,255,0.35)", fontSize: 11, letterSpacing: "0.2em" }}>
              PRESS ENTER OR CLICK
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroScreen;