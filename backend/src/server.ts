// src/server.ts
import express from "express";
import cors from "cors";
import portfolioRouter from "./routes/portfolio";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors()); // ← allow all origins

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/portfolio", portfolioRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

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