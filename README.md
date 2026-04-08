# HemasMind

AI-powered pharmaceutical supply chain intelligence for Hemas Pharmaceuticals Lanka.

## Overview

HemasMind monitors drug demand, detects outbreak-driven demand spikes, forecasts stockout risk, and enables one-click purchase order generation — all driven by a multi-agent AI backend.

**Demo scenario:** Sentinel detects a dengue outbreak in Western Province → demand for Paracetamol spikes → forecast shows stockout risk → user clicks "Generate Purchase Order".

## Architecture

```
Python Backend  :8000
  ├── POST /api/run-agents          → HemasMindPayload (REST)
  ├── socket.io                     → AgentStreamEvent stream
  └── /api/analytics/*              → Raw analytics endpoints

Next.js Frontend  :3000
  ├── /api/agent                    → Proxy to backend
  ├── /api/procurement/generate-po  → Proxy to backend
  ├── useAgentStream                → socket.io client
  └── /dashboard                   → Main UI
```

### Agent pipeline

```
Sentinel → Orchestrator → Operator → Communicator
```

The backend emits a typed `HemasMindPayload` JSON. The frontend is a **pure renderer** — it never mutates or derives AI logic; it only receives and displays payloads.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| State | Zustand |
| Charts | Recharts |
| Map | MapLibre GL |
| Styling | Tailwind CSS |
| Realtime | socket.io-client |

## Getting Started

```bash
# 1. Start the Python backend (port 8000)
# See backend README for setup

# 2. Start the frontend
cd frontend
cp .env.example .env.local   # configure backend URLs if needed
npm install
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8000` | Backend REST base URL (server-side) |
| `NEXT_PUBLIC_WS_URL` | `http://localhost:8000` | socket.io connection URL (client-side) |
| `ML_SERVER_URL` | `http://localhost:8001` | Reserved for direct ML server calls |

## Development

```bash
npm run dev         # dev server
npm run build       # production build
npm run type-check  # TypeScript check
npm run lint        # ESLint
```

## Key Files

| File | Purpose |
|---|---|
| `src/types/hemas-mind-payload.ts` | Data contract — all interfaces mirroring Communicator Agent output |
| `src/store/payloadStore.ts` | Current payload + 10-item history ring-buffer |
| `src/store/agentStore.ts` | Per-agent statuses, 200-entry thought log, connection flags |
| `src/hooks/useAgentStream.ts` | socket.io lifecycle, routes events to stores |
| `src/hooks/useActionHandler.ts` | Executes Action buttons from payload |
| `src/components/analytics/AgenticChart.tsx` | Root chart component → ChartFactory → renderers |
| `src/lib/api.ts` | Typed fetch wrapper; `proxyToBackend()` for server-side API routes |

## Analytics API

The backend exposes analytics endpoints under `/api/analytics` (port 8000):

- **KPIs:** `/kpis/summary`, `/kpis/province-demand`, `/kpis/category-stockout-risk`
- **Charts:** `/charts/sales-trend`, `/charts/top-drugs`, `/charts/drug-type-breakdown`, `/charts/risk-distribution`, `/charts/stock-status`, `/charts/risk-heatmap`, `/charts/pharmacy-map`, `/charts/disease-demand-correlation`, `/charts/seasonal-pattern`

See [ENDPOINTS.md](ENDPOINTS.md) for full request/response documentation.

```bash
# Quick health check
curl http://localhost:8000/api/health

# Interactive Swagger UI
open http://localhost:8000/docs
```
