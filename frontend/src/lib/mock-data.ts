/**
 * MOCK DATA — remove this file when the Python backend is live.
 *
 * To disable: delete this file and src/hooks/useMockSeed.ts,
 * then remove the useMockSeed() call in src/app/dashboard/page.tsx.
 */

import type {
  HemasMindPayload,
  AgentThought,
} from '@/types/hemas-mind-payload'

// ── Demand forecast: 14 days actual + 7 days forecast ────────
const demandData = [
  { date: 'Mar 18', actual: 3200,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 19', actual: 3350,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 20', actual: 3100,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 21', actual: 3400,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 22', actual: 3600,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 23', actual: 4200,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 24', actual: 5800,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 25', actual: 7900,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 26', actual: 9400,  forecast: null, upper: null,  lower: null  },
  { date: 'Mar 27', actual: 10800, forecast: null, upper: null,  lower: null  },
  { date: 'Mar 28', actual: 11200, forecast: null, upper: null,  lower: null  },
  { date: 'Mar 29', actual: 12100, forecast: null, upper: null,  lower: null  },
  { date: 'Mar 30', actual: 13400, forecast: null, upper: null,  lower: null  },
  { date: 'Mar 31', actual: 14100, forecast: null, upper: null,  lower: null  },
  { date: 'Apr 01', actual: null,  forecast: 15200, upper: 17400, lower: 13000 },
  { date: 'Apr 02', actual: null,  forecast: 16100, upper: 18800, lower: 13400 },
  { date: 'Apr 03', actual: null,  forecast: 16900, upper: 19700, lower: 14100 },
  { date: 'Apr 04', actual: null,  forecast: 17400, upper: 20500, lower: 14300 },
  { date: 'Apr 05', actual: null,  forecast: 17100, upper: 20100, lower: 14100 },
  { date: 'Apr 06', actual: null,  forecast: 16200, upper: 19400, lower: 13000 },
  { date: 'Apr 07', actual: null,  forecast: 15300, upper: 18400, lower: 12200 },
]

// ── Stock levels by distribution centre ───────────────────────
const stockData = [
  { centre: 'Colombo',  current: 4200, safetyStock: 5000 },
  { centre: 'Gampaha',  current: 3100, safetyStock: 4000 },
  { centre: 'Kalutara', current: 2800, safetyStock: 3500 },
  { centre: 'Kandy',    current: 1800, safetyStock: 2500 },
  { centre: 'Galle',    current: 500,  safetyStock: 2000 },
]

// ── Historical dengue case index (Sentinel data) ──────────────
const outbreakData = [
  { week: 'W10', cases: 210, threshold: 500 },
  { week: 'W11', cases: 280, threshold: 500 },
  { week: 'W12', cases: 390, threshold: 500 },
  { week: 'W13', cases: 620, threshold: 500 },
  { week: 'W14', cases: 1340, threshold: 500 },
  { week: 'W15', cases: 2180, threshold: 500 },
]

// ── Full mock payload ─────────────────────────────────────────
export const MOCK_PAYLOAD: HemasMindPayload = {
  metadata: {
    timestamp: new Date().toISOString(),
    scenario: 'dengue_outbreak_western_province',
    region: 'Western Province',
    product: 'Paracetamol 500mg',
    severity: 'critical',
    runId: 'mock-run-001',
  },

  alert: {
    type: 'stockout_risk',
    severity: 'critical',
    title: 'Stockout Risk — Paracetamol 500mg · Western Province',
    message:
      'Dengue outbreak confirmed across Western Province with 2,180 new cases this week (+340% vs 4-week average). At current consumption rate, available stock will be exhausted in 4 days.',
    region: 'Western Province',
    affectedProducts: ['Paracetamol 500mg', 'ORS Sachets 1L', 'Dengue NS1 Test Kits'],
    daysUntilStockout: 4,
  },

  kpis: [
    {
      id: 'current-stock',
      label: 'Current Stock',
      value: 12400,
      unit: 'units',
      trend: 'down',
      trendValue: '-18%',
      status: 'warning',
      subLabel: 'across all DCs',
    },
    {
      id: 'days-to-stockout',
      label: 'Days to Stockout',
      value: 4,
      unit: 'days',
      trend: 'down',
      trendValue: '-6d',
      status: 'critical',
      subLabel: 'at current burn rate',
    },
    {
      id: 'demand-spike',
      label: 'Demand Spike',
      value: '+340%',
      trend: 'up',
      trendValue: 'vs 4-wk avg',
      status: 'critical',
      subLabel: 'Western Province',
    },
    {
      id: 'reorder-point',
      label: 'Reorder Point',
      value: 15000,
      unit: 'units',
      status: 'healthy',
      subLabel: 'recommended threshold',
    },
  ],

  charts: [
    {
      id: 'demand-forecast',
      type: 'line',
      title: 'Paracetamol Demand — Actual vs Forecast',
      subtitle: 'Units/day · Western Province · ML model confidence 87%',
      data: demandData,
      series: [
        { dataKey: 'actual',   label: 'Actual',   color: '#3b82f6', type: 'actual'   },
        { dataKey: 'forecast', label: 'Forecast', color: '#f59e0b', strokeDasharray: '5 4', type: 'forecast' },
      ],
      xAxisKey: 'date',
      unit: 'units',
      showConfidenceBand: true,
      confidenceUpperKey: 'upper',
      confidenceLowerKey: 'lower',
    },
    {
      id: 'stock-by-dc',
      type: 'bar',
      title: 'Stock Levels by Distribution Centre',
      subtitle: 'Current stock vs safety-stock threshold',
      data: stockData,
      series: [
        { dataKey: 'current',      label: 'Current Stock',   color: '#ef4444' },
        { dataKey: 'safetyStock',  label: 'Safety Stock',    color: '#374151' },
      ],
      xAxisKey: 'centre',
      unit: 'units',
    },
    {
      id: 'dengue-outbreak',
      type: 'bar',
      title: 'Dengue Case Index — Western Province',
      subtitle: 'Sentinel Agent · MOH Sri Lanka data · weekly',
      data: outbreakData,
      series: [
        { dataKey: 'cases',     label: 'Confirmed Cases', color: '#f97316' },
        { dataKey: 'threshold', label: 'Alert Threshold', color: '#374151' },
      ],
      xAxisKey: 'week',
      unit: 'cases',
    },
    {
      id: 'forecast-trend',
      type: 'line',
      title: '7-Day Demand Forecast Detail',
      subtitle: 'Operator Agent · XGBoost model · 87% confidence interval',
      data: demandData.slice(13),
      series: [
        { dataKey: 'forecast', label: 'Forecast', color: '#a78bfa', type: 'forecast' },
      ],
      xAxisKey: 'date',
      unit: 'units',
      showConfidenceBand: true,
      confidenceUpperKey: 'upper',
      confidenceLowerKey: 'lower',
    },
  ],

  insights: [
    {
      id: 'ins-1',
      type: 'risk',
      severity: 'critical',
      text: 'Dengue cases in Western Province surged to 2,180 this week — a 340% increase over the 4-week rolling average. MOH has issued a Level 3 public health advisory.',
      source: 'sentinel',
    },
    {
      id: 'ins-2',
      type: 'observation',
      severity: 'warning',
      text: 'Historical correlation (r=0.91) between dengue case volume and Paracetamol demand confirms this spike is outbreak-driven, not a seasonal or distribution anomaly.',
      source: 'orchestrator',
    },
    {
      id: 'ins-3',
      type: 'risk',
      severity: 'critical',
      text: 'XGBoost demand model forecasts 16,900 units/day by Apr 3. At this rate, all five Western Province DCs will reach zero stock within 4 days without intervention.',
      source: 'operator',
    },
    {
      id: 'ins-4',
      type: 'recommendation',
      severity: 'critical',
      text: 'Issue an expedited Purchase Order for 25,000 units from primary supplier (Lanka Pharma Ltd) with 48-hour delivery. Estimated cost: LKR 3.75M.',
      source: 'communicator',
    },
    {
      id: 'ins-5',
      type: 'recommendation',
      severity: 'warning',
      text: 'Redistribute 1,200 units from Kandy DC (surplus relative to local dengue risk) to Colombo and Galle DCs to cover the immediate 48-hour gap.',
      source: 'orchestrator',
    },
    {
      id: 'ins-6',
      type: 'opportunity',
      severity: 'info',
      text: 'Secondary supplier (MedPharma Ceylon) has 18,000 units available at 4% premium. Consider split order to mitigate single-supplier delivery risk.',
      source: 'communicator',
    },
  ],

  actions: [
    {
      id: 'action-generate-po',
      label: 'Generate Purchase Order',
      description: '25,000 units from Lanka Pharma Ltd · 48-hr delivery · LKR 3.75M',
      type: 'generate_po',
      endpoint: '/api/procurement/generate-po',
      method: 'POST',
      payload: {
        product: 'Paracetamol 500mg',
        quantity: 25000,
        supplier: 'Lanka Pharma Ltd',
        priority: 'expedited',
      },
      variant: 'primary',
      requiresConfirmation: true,
      confirmationMessage:
        'This will raise a PO for 25,000 units (LKR 3.75M) with Lanka Pharma Ltd on expedited 48-hr terms. Proceed?',
    },
    {
      id: 'action-notify-supplier',
      label: 'Notify Supplier',
      description: 'Send stock alert to Lanka Pharma Ltd and MedPharma Ceylon',
      type: 'notify_supplier',
      endpoint: '/api/procurement/generate-po',
      method: 'POST',
      payload: {
        action: 'notify',
        suppliers: ['Lanka Pharma Ltd', 'MedPharma Ceylon'],
      },
      variant: 'secondary',
    },
    {
      id: 'action-redistribute',
      label: 'Redistribute Stock',
      description: 'Move 1,200 units Kandy → Colombo & Galle DCs',
      type: 'redistribute_stock',
      endpoint: '/api/procurement/generate-po',
      method: 'POST',
      payload: {
        action: 'redistribute',
        from: 'Kandy',
        to: ['Colombo', 'Galle'],
        quantity: 1200,
      },
      variant: 'secondary',
      requiresConfirmation: true,
      confirmationMessage:
        'Transfer 1,200 units from Kandy DC to Colombo (800) and Galle (400)?',
    },
  ],

  agentSummary: {
    sentinel: {
      status: 'completed',
      lastAction: 'Scraped MOH Sri Lanka bulletin — 2,180 dengue cases confirmed W15',
      startedAt: new Date(Date.now() - 42000).toISOString(),
      completedAt: new Date(Date.now() - 35000).toISOString(),
      durationMs: 7200,
    },
    orchestrator: {
      status: 'completed',
      lastAction: 'Triggered demand_forecast + stock_risk ML pipelines',
      startedAt: new Date(Date.now() - 35000).toISOString(),
      completedAt: new Date(Date.now() - 28000).toISOString(),
      durationMs: 7000,
    },
    operator: {
      status: 'completed',
      lastAction: 'XGBoost inference complete — 87% CI, MAPE 4.2%',
      startedAt: new Date(Date.now() - 28000).toISOString(),
      completedAt: new Date(Date.now() - 18000).toISOString(),
      durationMs: 10100,
    },
    communicator: {
      status: 'completed',
      lastAction: 'Payload packaged — 4 KPIs, 4 charts, 6 insights, 3 actions',
      startedAt: new Date(Date.now() - 18000).toISOString(),
      completedAt: new Date(Date.now() - 16000).toISOString(),
      durationMs: 1800,
    },
  },
}

// ── Mock thought stream ───────────────────────────────────────
export const MOCK_THOUGHTS: AgentThought[] = [
  {
    id: 't-01',
    agentName: 'sentinel',
    type: 'thought',
    message: 'Initialising web intelligence scan for Sri Lanka health events…',
    timestamp: new Date(Date.now() - 42000).toISOString(),
  },
  {
    id: 't-02',
    agentName: 'sentinel',
    type: 'action',
    message: 'Fetching MOH Sri Lanka weekly epidemiology bulletin (Week 15)…',
    timestamp: new Date(Date.now() - 41000).toISOString(),
  },
  {
    id: 't-03',
    agentName: 'sentinel',
    type: 'observation',
    message: 'Detected: 2,180 dengue cases in Western Province — 340% above 4-week average. Level 3 advisory issued.',
    timestamp: new Date(Date.now() - 39000).toISOString(),
  },
  {
    id: 't-04',
    agentName: 'sentinel',
    type: 'result',
    message: 'Outbreak event structured: { region: "Western Province", disease: "dengue", severity: "critical", case_count: 2180 }',
    timestamp: new Date(Date.now() - 37000).toISOString(),
  },
  {
    id: 't-05',
    agentName: 'orchestrator',
    type: 'thought',
    message: 'Received outbreak event. Checking historical demand correlation for dengue × Paracetamol…',
    timestamp: new Date(Date.now() - 35000).toISOString(),
  },
  {
    id: 't-06',
    agentName: 'orchestrator',
    type: 'action',
    message: 'Dispatching ML pipeline: [demand_forecast, stockout_risk, redistribution_optimiser]',
    timestamp: new Date(Date.now() - 33000).toISOString(),
  },
  {
    id: 't-07',
    agentName: 'operator',
    type: 'thought',
    message: 'Loading XGBoost demand model v2.4 for Paracetamol 500mg — Western Province…',
    timestamp: new Date(Date.now() - 28000).toISOString(),
  },
  {
    id: 't-08',
    agentName: 'operator',
    type: 'action',
    message: 'POST http://localhost:8001/forecast — payload: { product_id: "P-5001", region: "WP", horizon: 7, context: outbreak_event }',
    timestamp: new Date(Date.now() - 27000).toISOString(),
  },
  {
    id: 't-09',
    agentName: 'operator',
    type: 'observation',
    message: 'Forecast received: peak 17,400 units/day on Apr 4 (upper CI). Current stock depletes Apr 4 at 18:00.',
    timestamp: new Date(Date.now() - 24000).toISOString(),
  },
  {
    id: 't-10',
    agentName: 'operator',
    type: 'action',
    message: 'Running redistribution optimiser across 5 DCs — LP solver converged in 340ms.',
    timestamp: new Date(Date.now() - 22000).toISOString(),
  },
  {
    id: 't-11',
    agentName: 'operator',
    type: 'result',
    message: 'Stockout risk: CRITICAL. Recommended PO: 25,000 units. Redistribution: 1,200 units Kandy → Colombo/Galle.',
    timestamp: new Date(Date.now() - 20000).toISOString(),
  },
  {
    id: 't-12',
    agentName: 'communicator',
    type: 'thought',
    message: 'Aggregating outputs from Sentinel, Orchestrator, and Operator into typed payload…',
    timestamp: new Date(Date.now() - 18000).toISOString(),
  },
  {
    id: 't-13',
    agentName: 'communicator',
    type: 'action',
    message: 'Generating 4 chart configs, 6 insights, 3 action recommendations, 4 KPI tiles…',
    timestamp: new Date(Date.now() - 17000).toISOString(),
  },
  {
    id: 't-14',
    agentName: 'communicator',
    type: 'result',
    message: 'HemasMindPayload packaged and validated against schema. Emitting to frontend.',
    timestamp: new Date(Date.now() - 16000).toISOString(),
  },
]
