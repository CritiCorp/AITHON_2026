// ================================================================
// HemasMind Payload — single source of truth for the data contract
// All interfaces mirror exactly what the Communicator Agent emits.
// The frontend NEVER mutates these; it only renders them.
// Spec version: 1.1
// ================================================================

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error'
export type AgentName = 'sentinel' | 'orchestrator' | 'operator' | 'communicator'
export type ThoughtType = 'thought' | 'action' | 'observation' | 'result' | 'error'
export type ChartType = 'line' | 'bar' | 'area' | 'composed' | 'pie' | 'scatter'

// ── Metadata ──────────────────────────────────────────────────
export interface PayloadMetadata {
  agent_name: AgentName
  reasoning_id: string
  generated_at: string
  confidence_score: number
  model_used: string
  processing_time_ms: number
}

// ── Layout ────────────────────────────────────────────────────
export interface PayloadLayout {
  title: string
  summary: string
  regions_covered: string[]
  date_range: string
  source_module: string
}

// ── Alert banner ───────────────────────────────────────────────
export interface AlertBanner {
  level: 'critical' | 'warning' | 'info'
  title: string
  message: string
  detected_at: string
  source: string
}

// ── KPI tiles ─────────────────────────────────────────────────
export interface KpiTile {
  id: string
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  /** Formatted change string, e.g. "+340%" */
  trend_value?: string
  status: 'critical' | 'warning' | 'good' | 'neutral'
  sub_label?: string
}

// ── Charts ────────────────────────────────────────────────────
export interface ChartDataPoint {
  [key: string]: string | number | null | boolean
}

export interface DataSeries {
  key: string
  label: string
  color: string
  /** SVG stroke-dasharray for dashed/dotted lines (e.g. forecast) */
  stroke_dasharray?: string
  is_comparison?: boolean
  is_forecast?: boolean
  is_confidence_band?: boolean
  stack_id?: string
}

export interface ReferenceLine {
  value: number
  label: string
  color: string
  stroke_dasharray?: string
}

export interface ChartSpec {
  id: string
  type: ChartType
  title: string
  subtitle?: string
  data: ChartDataPoint[]
  series: DataSeries[]
  x_axis_key: string
  unit?: string
  /** Render shaded confidence band between upper/lower keys */
  show_confidence_band?: boolean
  confidence_upper_key?: string
  confidence_lower_key?: string
  reference_lines?: ReferenceLine[]
}

// ── Recommended actions ───────────────────────────────────────
export interface AgentAction {
  id: string
  label: string
  description: string
  type: 'primary' | 'secondary' | 'danger' | 'ghost'
  /** Next.js API route to call, e.g. "/api/procurement/generate-po" */
  endpoint: string
  method: 'POST' | 'GET'
  /** Extra body fields merged with payload context at call time */
  payload?: Record<string, unknown>
  requires_confirmation?: boolean
  confirmation_message?: string
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
  version: '1.0' | '1.1' | '1.2'
  metadata: PayloadMetadata
  layout: PayloadLayout
  /** Null when no active alert */
  alert: AlertBanner | null
  kpis: KpiTile[]
  /** v1.2+: array of 2–4 charts chosen by the agent for this scenario */
  charts: ChartSpec[]
  insights: string[]
  actions: AgentAction[]
  agentSummary: AgentSummary
}

// ── WebSocket / streaming events ──────────────────────────────
export interface AgentThought {
  id: string
  agent: AgentName
  type: ThoughtType
  message: string
  /** ISO-8601 */
  timestamp: string
}

export interface AgentStatusUpdate {
  agent: AgentName
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
