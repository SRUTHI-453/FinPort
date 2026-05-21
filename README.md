# 📊 FinPort Dashboard

Live Indian stock portfolio tracker built with React (Next.js) + Node.js (Express) + TypeScript.

---

## Do I Need a Database?

**No.** Here's why:

- **Holdings** (stock name, buy price, qty) are static — they live in `backend/src/data/portfolio.ts` and don't change at runtime.
- **Live data** (CMP, P/E, EPS) is always fetched fresh from Yahoo Finance and Google Finance.
- A database would only be needed if users could dynamically add/edit their own holdings or log in. This project doesn't require that.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Next.js 14 + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| CMP Data | `yahoo-finance2` (unofficial Yahoo Finance library) |
| P/E & EPS | `axios` + `cheerio` (Google Finance HTML scraping) |
| Caching | `node-cache` (15-second TTL) |

---

## Project Structure

```
portfolio-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── portfolio.ts        ← Edit this to change your holdings
│   │   ├── services/
│   │   │   ├── stockService.ts     ← Yahoo Finance + Google Finance fetching
│   │   │   └── portfolioService.ts ← Gain/loss calculations + sector grouping
│   │   ├── routes/
│   │   │   └── portfolio.ts        ← REST API route handlers
│   │   ├── types.ts                ← Shared TypeScript interfaces
│   │   └── server.ts               ← Express entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── pages/
    │   ├── _app.tsx                ← Next.js app wrapper
    │   └── index.tsx               ← Main dashboard page
    ├── components/
    │   ├── StatsCard.tsx           ← Summary metric card
    │   └── SectorGroup.tsx         ← Collapsible sector + stocks table
    ├── hooks/
    │   └── usePortfolio.ts         ← Data fetching + 15s auto-refresh
    ├── lib/
    │   └── api.ts                  ← Axios calls + number formatters
    ├── types/
    │   └── index.ts                ← TypeScript types
    ├── styles/
    │   └── globals.css             ← Tailwind base
    ├── next.config.js
    ├── package.json
    └── tsconfig.json
```

---

## Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Update your holdings

Edit `backend/src/data/portfolio.ts`:

```ts
{
  id: "fin-1",
  particulars: "HDFC Bank",
  ticker: "HDFCBANK.NS",   // Yahoo Finance ticker (.NS = NSE, .BO = BSE)
  exchange: "NSE",
  sector: "Financial",
  purchasePrice: 1550,     // Your actual buy price in ₹
  qty: 10,
}
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev
# Starts at http://localhost:4000

# Terminal 2 — frontend
cd frontend && npm run dev
# Starts at http://localhost:3000
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/portfolio` | Full portfolio — sectors, all computed fields |
| `GET /api/portfolio/live` | Live CMP only — used by 15s refresh |
| `GET /api/portfolio/holdings` | Static holdings list |
| `GET /health` | Server health check |

---

## Deployment

### Backend → [Render.com](https://render.com)
1. Push to GitHub → New Web Service → root directory: `backend`
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Copy the Render URL (e.g. `https://portfolio-backend.onrender.com`)

### Frontend → [Vercel](https://vercel.com)
1. Import GitHub repo → root directory: `frontend`
2. Add env variable: `NEXT_PUBLIC_API_URL=https://portfolio-backend.onrender.com`
3. Deploy

---

## How Live Refresh Works

```
Page loads → fetch /api/portfolio (full: Yahoo + Google for all stocks)
     ↓
Every 15s → fetch /api/portfolio/live (Yahoo CMP only — lighter)
     ↓
usePortfolio hook merges updates into React state immutably
     ↓
Only changed cells re-render (no full table flicker)
```
