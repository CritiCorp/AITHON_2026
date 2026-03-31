// ================================================================
// HemasMind Payload — single source of truth for the data contract
// All interfaces mirror exactly what the Communicator Agent emits.
// The frontend NEVER mutates these; it only renders them.
// ================================================================

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type AlertSeverity = 'warning' | 'critical'
export type KpiStatus = 'healthy' | 'warning' | 'critical'
export type TrendDirection = 'up' | 'down' | 'stable'
export type ChartType = 'line' | 'bar'
export type InsightType = 'observation' | 'recommendation' | 'risk' | 'opportunity'
export type InsightSeverity = 'info' | 'warning' | 'critical'
export type ActionType =
  | 'generate_po'
  | 'notify_supplier'
  | 'redistribute_stock'
  | 'custom'
export type ActionVariant = 'primary' | 'secondary' | 'destructive'
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error'
export type AgentName = 'sentinel' | 'orchestrator' | 'operator' | 'communicator'
export type ThoughtType = 'thought' | 'action' | 'observation' | 'result' | 'error'

// ── Metadata ──────────────────────────────────────────────────
export interface PayloadMetadata {
  /** ISO-8601 timestamp of when the Communicator packaged this payload */
  timestamp: string
  /** Machine-readable scenario key, e.g. "dengue_outbreak_western_province" */
  scenario: string
  /** Human-readable region, e.g. "Western Province" */
  region: string
  /** Target product, e.g. "Paracetamol 500mg" */
  product: string
  severity: Severity
  /** Unique ID for this agent pipeline run */
  runId: string
}

// ── Alert banner ───────────────────────────────────────────────
export interface Alert {
  type: 'stockout_risk' | 'demand_spike' | 'outbreak' | 'supply_disruption'
  severity: AlertSeverity
  title: string
  message: string
  region: string
  affectedProducts: string[]
  /** How many days until projected stockout (optional) */
  daysUntilStockout?: number
}

// ── KPI tiles ─────────────────────────────────────────────────
export interface KpiMetric {
  id: string
  label: string
  value: string | number
  unit?: string
  trend?: TrendDirection
  /** Formatted change string, e.g. "+340%" */
  trendValue?: string
  status: KpiStatus
  /** Secondary label, e.g. "vs. last week" */
  subLabel?: string
}

// ── Charts ────────────────────────────────────────────────────
export interface ChartDataPoint {
  [key: string]: string | number | null
}

export interface ChartSeries {
  dataKey: string
  label: string
  color: string
  /** SVG stroke-dasharray for dashed/dotted lines (e.g. forecast) */
  strokeDasharray?: string
  type?: 'actual' | 'forecast' | 'confidence_upper' | 'confidence_lower'
}

export interface ChartConfig {
  id: string
  type: ChartType
  title: string
  subtitle?: string
  data: ChartDataPoint[]
  series: ChartSeries[]
  xAxisKey: string
  unit?: string
  /** Render shaded confidence band between upper/lower keys */
  showConfidenceBand?: boolean
  confidenceUpperKey?: string
  confidenceLowerKey?: string
}

// ── Insights ──────────────────────────────────────────────────
export interface Insight {
  id: string
  type: InsightType
  severity: InsightSeverity
  text: string
  /** Which agent generated this insight */
  source: AgentName
}

// ── Recommended actions ───────────────────────────────────────
export interface Action {
  id: string
  label: string
  description: string
  type: ActionType
  /** Next.js API route to call, e.g. "/api/procurement/generate-po" */
  endpoint: string
  method: 'POST' | 'GET'
  /** Extra body fields merged with payload context at call time */
  payload?: Record<string, unknown>
  variant: ActionVariant
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

// ── Agent run summary ─────────────────────────────────────────
export interface AgentInfo {
  status: AgentStatus
  lastAction: string
  startedAt?: string
  completedAt?: string
  durationMs?: number
}

export interface AgentSummary {
  sentinel: AgentInfo
  orchestrator: AgentInfo
  operator: AgentInfo
  communicator: AgentInfo
}

// ── Root payload (what Communicator Agent emits) ──────────────
export interface HemasMindPayload {
  metadata: PayloadMetadata
  /** Null when no active alert */
  alert: Alert | null
  kpis: KpiMetric[]
  charts: ChartConfig[]
  insights: Insight[]
  actions: Action[]
  agentSummary: AgentSummary
}

// ── WebSocket / streaming events ──────────────────────────────
export interface AgentThought {
  id: string
  agentName: AgentName
  type: ThoughtType
  message: string
  /** ISO-8601 */
  timestamp: string
}

export interface AgentStatusUpdate {
  agentName: AgentName
  status: AgentStatus
  message?: string
  /** ISO-8601 */
  timestamp: string
}

/** Discriminated union of everything the backend can push over socket.io */
export type AgentStreamEvent =
  | { type: 'thought'; data: AgentThought }
  | { type: 'payload'; data: HemasMindPayload }
  | { type: 'status'; data: AgentStatusUpdate }
  | { type: 'error'; data: string }
  | { type: 'connected'; data: string }

// ── API response wrappers ─────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PurchaseOrder {
  poNumber: string
  product: string
  quantity: number
  supplier: string
  estimatedDelivery: string
  totalValue: number
  currency: string
  status: 'draft' | 'submitted' | 'confirmed'
  createdAt: string
}
