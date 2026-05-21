# FinPort — Live Portfolio Intelligence Dashboard

A real-time Indian stock portfolio tracker built with Next.js and Node.js, featuring live NSE/BSE market data, sector-wise grouping, and a cyberpunk-themed UI.

---

## 🚀 Live Demo

- **Frontend:** [FinPort Dashboard](https://finport-dashboard.onrender.com)
- **Backend API:** [https://finport-q9q2.onrender.com](https://finport-q9q2.onrender.com)

---

## 📋 Features

- ✅ Live CMP (Current Market Price) from Yahoo Finance — updates every 15 seconds
- ✅ Sector-wise portfolio grouping (Financial, Tech, Consumer, Power, Pipe, Others)
- ✅ Real-time Gain/Loss calculation with color indicators (green = profit, red = loss)
- ✅ Portfolio summary cards (Total Invested, Current Value, Overall P&L, Holdings)
- ✅ Live clock with NSE/BSE market open/close status
- ✅ Collapsible sector groups
- ✅ Matrix rain background animation
- ✅ Cinematic intro screen
- ✅ P/E Ratio and EPS via Yahoo Finance / Google Finance (may show N/A due to rate limiting)

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14, React, TypeScript       |
| Styling   | Tailwind CSS, Inline Styles         |
| Backend   | Node.js, Express, TypeScript        |
| Data      | Yahoo Finance (unofficial), Google Finance (scraping) |
| Caching   | node-cache (15s TTL)                |
| Hosting   | Render (backend), Render (frontend) |

---

## 📁 Project Structure
FinPort/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── portfolio.ts        # Static holdings data
│   │   ├── routes/
│   │   │   └── portfolio.ts        # API endpoints
│   │   ├── services/
│   │   │   ├── stockService.ts     # Yahoo + Google Finance fetching
│   │   │   └── portfolioService.ts # Portfolio computation logic
│   │   ├── types/
│   │   │   └── index.ts            # Shared TypeScript interfaces
│   │   └── server.ts               # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
├── hooks/
│   └── usePortfolio.ts         # Data fetching + live refresh hook
├── lib/
│   └── api.ts                  # Axios instance + formatters
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx               # Main dashboard page
├── styles/
│   └── globals.css             # Tailwind + custom animations
├── types/
│   └── index.ts                # Shared TypeScript interfaces
├── .env.local                  # Environment variables (not committed)
├── next.config.js
└── package.json

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### 1. Clone the repository

```bash
git clone https://github.com/SRUTHI-453/FinPort.git
cd FinPort
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:4000`

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio` | GET | Full portfolio with live data, sector grouping, totals |
| `/api/portfolio/live` | GET | Live CMP + gain/loss only (lightweight, for 15s refresh) |
| `/api/portfolio/holdings` | GET | Static holdings list |
| `/health` | GET | Health check |

### Sample Response — `/api/portfolio`

```json
{
  "success": true,
  "data": {
    "sectors": [
      {
        "sector": "Financial",
        "totalInvestment": 77300,
        "totalPresentValue": 34715,
        "gainLoss": -42584,
        "gainLossPercent": -55.08,
        "stocks": [...]
      }
    ],
    "totals": {
      "totalInvestment": 344750,
      "totalPresentValue": 264397,
      "totalGainLoss": -80352,
      "totalGainLossPercent": -23.30
    }
  },
  "timestamp": "2026-05-21T07:22:56.854Z"
}
```

---

## 🌐 Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api` |

### Production

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://finport-q9q2.onrender.com/api` |

---

## 🚢 Deployment

### Backend — Render

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

### Frontend — Render / Vercel

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Env Variable | `NEXT_PUBLIC_API_URL=https://finport-q9q2.onrender.com/api` |

---

## ⚠️ Technical Challenges & Solutions

### 1. Yahoo Finance Rate Limiting
**Challenge:** Yahoo Finance has no official public API. Unofficial endpoints get rate-limited and blocked.

**Solution:**
- Used v8 chart endpoint for CMP (more reliable)
- Added fallback to query2 subdomain
- Implemented node-cache with 15s TTL to minimize requests
- Separated full fetch (on load) from live refresh (every 15s)

### 2. P/E Ratio & EPS — N/A Issue
**Challenge:** Yahoo Finance `quoteSummary` and Google Finance scraping both get blocked for Indian NSE stocks due to bot detection.

**Solution:** Implemented a two-tier fallback:
1. Try Yahoo Finance `quoteSummary` first
2. Fall back to Google Finance HTML scraping

**Known Limitation:** Both sources may return N/A due to bot detection. A paid API (Alpha Vantage, Financial Modeling Prep) would provide reliable fundamentals data.

### 3. SSR Conflict with Browser APIs
**Challenge:** Next.js Server-Side Rendering tried to run browser-only code (canvas, window, axios) on the server, causing `[object Promise]` render errors.

**Solution:** Used `useIsMounted()` hook to prevent any rendering until the component is mounted on the client side.

### 4. CORS in Production
**Challenge:** Frontend on different domain couldn't reach backend API.

**Solution:** Configured Express CORS middleware to allow all origins (`app.use(cors())`).

### 5. Real-time Updates
**Challenge:** Fetching all 26 stocks with fundamentals every 15 seconds would cause rate limiting (52+ external requests).

**Solution:** Split into two endpoints:
- `/api/portfolio` — full fetch on page load (CMP + P/E + EPS)
- `/api/portfolio/live` — CMP only every 15 seconds (26 requests)

---

## 📊 Portfolio Holdings

The dashboard tracks 26 stocks across 6 sectors:

| Sector | Stocks |
|--------|--------|
| Financial | HDFC Bank, Bajaj Finance, ICICI Bank, Bajaj Housing, Savani Financials |
| Tech | Affle India, LTI Mindtree, KPIT Tech, Tata Tech, BLS E-Services, Tasia |
| Consumer | Dmart, Tata Consumer, Pidilite |
| Power | Tata Power, KPI Green, Suzlon, Gensol |
| Pipe | Hariom Pipes, Astral, Polycab |
| Others | Clean Science, Deepak Nitrite, Fine Organic, Gravita, SBI Life |

---

## 📝 License

MIT License — free to use and modify.

---

## 👩‍💻 Author
Built by **Sruthi**.
