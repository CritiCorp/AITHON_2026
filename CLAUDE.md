# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**HemasMind** — AI-powered pharmaceutical supply chain intelligence frontend for Hemas Pharmaceuticals Lanka.

The frontend is a **pure renderer**: all AI logic lives in the Python backend (port 8000). Four agents run there (Sentinel → Orchestrator → Operator → Communicator) and emit a typed `HemasMindPayload` JSON. The frontend receives it over WebSocket and/or REST and renders it.

Demo scenario: Sentinel detects dengue outbreak in Western Province → demand for Paracetamol spikes → forecast shows stockout risk → user clicks "Generate Purchase Order".

## Commands

```bash
cd frontend
npm install          # install dependencies
npm run dev          # dev server on http://localhost:3000
npm run build        # production build
npm run type-check   # TypeScript check without emitting
npm run lint         # ESLint
```

## Architecture

### Data flow

```
Python Backend :8000
  ├── POST /api/run-agents   → returns HemasMindPayload (REST fallback)
  └── socket.io              → pushes AgentStreamEvent stream

Next.js Frontend :3000
  ├── src/app/api/agent/route.ts                    POST proxy → backend
  ├── src/app/api/procurement/generate-po/route.ts  POST proxy → backend
  ├── src/hooks/useAgentStream.ts  socket.io client  → agentStore + payloadStore
  └── src/app/dashboard/page.tsx   reads stores, renders all components
```

### Key files

| File | Purpose |
|---|---|
| `src/types/hemas-mind-payload.ts` | **Single source of truth** — all interfaces. Match this against what the Communicator Agent emits. |
| `src/store/payloadStore.ts` | Zustand: `current` payload + 10-item history ring-buffer |
| `src/store/agentStore.ts` | Zustand: per-agent `statuses`, 200-entry `thoughts[]`, connection flags |
| `src/hooks/useAgentStream.ts` | socket.io lifecycle, routes events to both stores |
| `src/hooks/useActionHandler.ts` | Executes `Action` buttons from the payload; merges live context into request body |
| `src/components/analytics/AgenticChart.tsx` | Root chart component → `ChartFactory` → `LineChartRenderer` \| `BarChartRenderer` |
| `src/lib/api.ts` | Typed `fetch` wrapper; `proxyToBackend()` used server-side only |

### Chart confidence bands

Set `ChartConfig.showConfidenceBand = true` and provide `confidenceUpperKey` / `confidenceLowerKey` dataKeys — `LineChartRenderer` switches to a `ComposedChart` with a gradient `Area` fill between the two series.

### Action buttons

`Action.endpoint` is a **relative Next.js API route** (e.g. `/api/procurement/generate-po`). `useActionHandler` merges `action.payload` with `{ metadata, alert }` from the current payload store before calling it.

## Environment variables

| Variable | Default | Used |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8000` | Server-side proxy in API routes |
| `NEXT_PUBLIC_WS_URL` | `http://localhost:8000` | Client-side socket.io connection |
| `ML_SERVER_URL` | `http://localhost:8001` | Reserved for direct ML server calls |

Copy `frontend/.env.example` → `frontend/.env.local` to configure.
