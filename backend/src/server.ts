// src/server.ts
// Express application entry point

import express from "express";
import cors from "cors";
import portfolioRouter from "./routes/portfolio";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────────────────────────

// Allow requests from Next.js frontend (localhost:3000 in dev, Vercel in prod)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
    ],
    methods: ["GET"],
  })
);

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/portfolio", portfolioRouter);

// Health check — used by Render, Railway, and similar platforms
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Portfolio backend running at http://localhost:${PORT}`);
  console.log(`   GET /api/portfolio        → full portfolio`);
  console.log(`   GET /api/portfolio/live   → live prices only`);
  console.log(`   GET /api/portfolio/holdings → static holdings`);
  console.log(`   GET /health               → health check\n`);
});

export default app;
