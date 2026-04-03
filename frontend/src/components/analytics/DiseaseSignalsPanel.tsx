'use client'

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { AlertCircle, RefreshCw, Activity } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDiseaseSignals, useDiseaseSignalsImpact } from '@/hooks/useAnalyticsData'
import type { DiseaseSignalImpactItem } from '@/types/analytics'
import { cn } from '@/lib/utils'

// ── Severity colour helpers ───────────────────────────────────

function shockColor(m: number): string {
  if (m >= 1.8) return '#ef4444'
  if (m >= 1.4) return '#f97316'
  if (m >= 1.3) return '#f59e0b'
  return '#10b981'
}

function shockBadgeClasses(m: number): string {
  if (m >= 1.8) return 'border-red-500/30 bg-red-500/15 text-red-300'
  if (m >= 1.4) return 'border-orange-500/30 bg-orange-500/15 text-orange-300'
  if (m >= 1.3) return 'border-amber-500/30 bg-amber-500/15 text-amber-300'
  return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
}

// ── Shared axis style ─────────────────────────────────────────

const axisStyle = {
  tick: { fontSize: 11, fill: 'hsl(215 20% 52%)' },
  tickLine: false as const,
  axisLine: false as const,
}

// ── Sub-components ────────────────────────────────────────────

function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 rounded-md bg-muted" />
      ))}
    </div>
  )
}

function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRetry}>
        <RefreshCw className="h-3 w-3" />
        Retry
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
      <Activity className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">No disease signals in this period.</p>
      <p className="text-xs text-muted-foreground/60">
        The LLM scraper will populate data when outbreak signals are detected.
      </p>
    </div>
  )
}

// Custom tooltip for the shock-multiplier bar chart
function ShockTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: DiseaseSignalImpactItem }[]
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs max-w-[240px]">
      <p className="font-medium text-foreground mb-1 leading-tight">{d.disease_name}</p>
      <div className="space-y-0.5 text-muted-foreground">
        <div>
          Shock multiplier:{' '}
          <span
            className="font-semibold"
            style={{ color: shockColor(d.max_shock_multiplier) }}
          >
            {d.max_shock_multiplier.toFixed(1)}×
          </span>
        </div>
        <div>
          Total cases:{' '}
          <span className="font-semibold text-foreground">{d.total_cases.toLocaleString()}</span>
        </div>
        <div>
          Signals:{' '}
          <span className="font-semibold text-foreground">{d.signal_count}</span>
        </div>
        {d.primary_atc_category && (
          <div>
            ATC:{' '}
            <span className="font-mono text-foreground">{d.primary_atc_category}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

interface DiseaseSignalsPanelProps {
  days: number
  province?: string
}

export function DiseaseSignalsPanel({ days, province }: DiseaseSignalsPanelProps) {
  const signals = useDiseaseSignals(days, province)
  const impact = useDiseaseSignalsImpact(days)

  function truncateName(name: string, max = 28): string {
    return name.length > max ? name.slice(0, max) + '…' : name
  }

  const chartData = (impact.data?.diseases ?? []).map((d) => ({
    ...d,
    label: truncateName(d.disease_name),
  }))

  const chartHeight = Math.max(200, chartData.length * 36)

  return (
    <div className="space-y-4">

      {/* ── Section header ──────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold tracking-tight">Disease Signals</h2>
        <p className="text-xs text-muted-foreground">
          LLM-detected outbreak signals and demand shock indicators — last {days} days
        </p>
      </div>

      {/* ── KPI Tiles ──────────────────────────────── */}
      {signals.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      ) : signals.error ? (
        <SectionError message={`Signals summary: ${signals.error}`} onRetry={signals.refetch} />
      ) : signals.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Active disease count */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Active Signals</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {signals.data.summary.active_disease_count}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {signals.data.summary.total_signals} total records
            </p>
          </div>

          {/* Max shock multiplier — color coded */}
          <div
            className={cn(
              'rounded-lg border bg-card p-4',
              signals.data.summary.max_shock_multiplier >= 1.8 && 'border-red-500/30 bg-red-500/5',
              signals.data.summary.max_shock_multiplier >= 1.4 &&
                signals.data.summary.max_shock_multiplier < 1.8 &&
                'border-orange-500/30 bg-orange-500/5',
              signals.data.summary.max_shock_multiplier >= 1.3 &&
                signals.data.summary.max_shock_multiplier < 1.4 &&
                'border-amber-500/30 bg-amber-500/5',
            )}
          >
            <p className="text-xs text-muted-foreground">Max Shock Multiplier</p>
            <p
              className="mt-1 text-2xl font-bold tabular-nums"
              style={{ color: shockColor(signals.data.summary.max_shock_multiplier) }}
            >
              {signals.data.summary.max_shock_multiplier.toFixed(1)}×
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Peak demand amplification</p>
          </div>

          {/* Total reported cases */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Reported Cases</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {signals.data.summary.total_reported_cases.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              0 = detected, not yet confirmed
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Shock Impact Bar Chart ──────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Disease Shock Multipliers</CardTitle>
          <CardDescription className="text-xs">
            Diseases ranked by peak demand shock — higher means greater forecast amplification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {impact.loading ? (
            <SectionSkeleton rows={6} />
          ) : impact.error ? (
            <SectionError message={impact.error} onRetry={impact.refetch} />
          ) : chartData.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 4, right: 56, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(217 33% 19%)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[1.0, 'dataMax + 0.1']}
                    tickFormatter={(v: number) => `${v.toFixed(1)}×`}
                    {...axisStyle}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={195}
                    {...axisStyle}
                  />
                  <Tooltip content={<ShockTooltip />} cursor={{ fill: 'hsl(217 33% 15%)' }} />
                  <Bar dataKey="max_shock_multiplier" maxBarSize={22} radius={[0, 3, 3, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.disease_name}
                        fill={shockColor(entry.max_shock_multiplier)}
                      />
                    ))}
                    <LabelList
                      dataKey="max_shock_multiplier"
                      position="right"
                      formatter={(v: number) => `${v.toFixed(1)}×`}
                      style={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Signal Table ────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Signal Log</CardTitle>
          <CardDescription className="text-xs">
            All signals — sorted by date then shock severity
            {signals.data ? ` · ${signals.data.signals.length} entries` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {signals.loading ? (
            <div className="px-6 py-4">
              <SectionSkeleton rows={5} />
            </div>
          ) : signals.error ? (
            <div className="px-6 py-4">
              <SectionError message={signals.error} onRetry={signals.refetch} />
            </div>
          ) : !signals.data || signals.data.signals.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-h-[440px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      Disease
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Province
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Cases
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                      ATC
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Shock ×
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {signals.data.signals.map((sig, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {sig.signal_date}
                      </td>
                      <td className="px-3 py-2 font-medium text-sm max-w-[240px]">
                        <span title={sig.disease_name}>
                          {sig.disease_name.length > 36
                            ? sig.disease_name.slice(0, 36) + '…'
                            : sig.disease_name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {sig.province ?? (
                          <span className="italic text-muted-foreground/50">Global</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-xs">
                        {sig.reported_cases === 0 ? (
                          <span className="text-muted-foreground/40">—</span>
                        ) : (
                          sig.reported_cases.toLocaleString()
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {sig.affected_atc_category ?? (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums',
                            shockBadgeClasses(sig.shock_multiplier),
                          )}
                        >
                          {sig.shock_multiplier.toFixed(1)}×
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
