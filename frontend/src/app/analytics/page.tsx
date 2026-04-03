'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ScatterChartRenderer } from '@/components/analytics/ScatterChartRenderer'
import { HeatmapRenderer } from '@/components/analytics/HeatmapRenderer'
import { GaugeCard } from '@/components/analytics/GaugeCard'
import { AnalyticsMap } from '@/components/map/AnalyticsMap'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useKpiSummary,
  useSalesTrend,
  useTopDrugs,
  useProvinceDemand,
  useDrugTypeBreakdown,
  useExpiryTimeline,
  useStockStatus,
  useRiskHeatmap,
  usePharmacyMap,
  useDiseaseDemandCorrelation,
  useSeasonalPattern,
  useCategoryStockoutRisk,
} from '@/hooks/useAnalyticsData'
import { CHART_COLORS } from '@/lib/chart-utils'
import { cn } from '@/lib/utils'

// ── Constants ────────────────────────────────────────────────

const PROVINCES = [
  'Western', 'Central', 'Southern', 'Northern', 'Eastern',
  'North Western', 'North Central', 'Uva', 'Sabaragamuwa',
]

const PERIOD_OPTIONS = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '60d', value: 60 },
  { label: '90d', value: 90 },
]

const RISK_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#10b981',
  minimal:  '#6b7280',
}

const EXPIRY_COLORS: Record<string, string> = {
  expired: '#ef4444',
  '0-7 days': '#f97316',
  '7-30 days': '#f59e0b',
  '30-90 days': '#3b82f6',
  '90+ days': '#22c55e',
}

const EXPIRY_BUCKET_ORDER = ['expired', '0-7 days', '7-30 days', '30-90 days', '90+ days']

const SEASON_LABELS: Record<string, string> = {
  NE_MONSOON: 'NE Monsoon (Dec–Feb)',
  FIM: 'FIM (Mar–Apr)',
  SW_MONSOON: 'SW Monsoon (May–Sep)',
  SIM: 'SIM (Oct–Nov)',
}

// ── Shared sub-components ────────────────────────────────────

const axisStyle = {
  tick: { fontSize: 11, fill: 'hsl(215 20% 52%)' },
  tickLine: false as const,
  axisLine: false as const,
}

function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRetry}>
        <RefreshCw className="h-3 w-3" />
        Retry
      </Button>
    </div>
  )
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 rounded-md bg-muted" />
      ))}
    </div>
  )
}

function TooltipContent({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: string
  unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs">
      {label && <p className="mb-1.5 font-medium text-foreground">{label}</p>}
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ background: e.color }} />
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-semibold tabular-nums">
            {e.value.toLocaleString()}{unit ? ` ${unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  trend,
  status,
}: {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'stable'
  status?: 'critical' | 'warning' | 'good' | 'neutral'
}) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4',
        status === 'critical' && 'border-red-500/30 bg-red-500/5',
        status === 'warning' && 'border-amber-500/30 bg-amber-500/5',
        status === 'good' && 'border-green-500/30 bg-green-500/5'
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {sub && (
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {trend && (
            <TrendIcon
              className={cn(
                'h-3 w-3',
                trend === 'up' && 'text-green-500',
                trend === 'down' && 'text-red-500',
                trend === 'stable' && 'text-muted-foreground'
              )}
            />
          )}
          <span>{sub}</span>
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [province, setProvince] = useState<string>('')
  const [days, setDays] = useState<number>(30)

  // All data hooks
  const kpi = useKpiSummary(days, province)
  const salesTrend = useSalesTrend(days, undefined, province)
  const topDrugs = useTopDrugs(10, days, province)
  const provinceDemand = useProvinceDemand(days)
  const drugTypeBreakdown = useDrugTypeBreakdown(days, province)
  const expiryTimeline = useExpiryTimeline(province)
  const stockStatus = useStockStatus(province)
  const riskHeatmap = useRiskHeatmap(province)
  const pharmacyMap = usePharmacyMap(province)
  const diseaseDemand = useDiseaseDemandCorrelation(days, province)
  const seasonalPattern = useSeasonalPattern(province)
  const categoryRisk = useCategoryStockoutRisk()

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />

      <main className="max-w-screen-2xl mx-auto w-full flex-1 px-6 py-6 space-y-6">

        {/* ── Page title + filter bar ───────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Supply Chain Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Raw demand, stock risk, and seasonal patterns
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Province filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Province</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Provinces</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Period selector */}
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                    days === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 1: KPI Summary ───────────────────────── */}
        {kpi.loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted" />
            ))}
          </div>
        ) : kpi.error ? (
          <div className="rounded-lg border bg-card p-4">
            <SectionError message={`KPI summary: ${kpi.error}`} onRetry={kpi.refetch} />
          </div>
        ) : kpi.data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard
              label="Total Units Sold"
              value={kpi.data.total_units_sold.toLocaleString()}
              sub={`${kpi.data.date_range.from} → ${kpi.data.date_range.to}`}
              status="good"
            />
            <KpiCard
              label="Total Revenue (LKR)"
              value={`LKR ${(kpi.data.total_revenue_lkr / 1_000_000).toFixed(1)}M`}
              sub={`${days}d window`}
              status="good"
            />
            <KpiCard
              label="Low Stock SKUs"
              value={String(kpi.data.low_stock_count)}
              sub="Below reorder point"
              status={kpi.data.low_stock_count > 10 ? 'warning' : 'neutral'}
            />
            <KpiCard
              label="Critical Risk SKUs"
              value={String(kpi.data.critical_risk_count)}
              sub="Immediate action needed"
              status={kpi.data.critical_risk_count > 0 ? 'critical' : 'good'}
            />
          </div>
        ) : null}

        {/* ── Geospatial Risk & Demand Map ─────────────── */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Geospatial Risk & Demand Map</CardTitle>
                <CardDescription className="text-xs">
                  Province overlays · Pharmacy risk dots · Click province for breakdown
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                <span className="text-xs font-medium text-amber-400">
                  {pharmacyMap.data?.pharmacies.filter(p => p.risk_level === 'critical').length ?? 0} critical sites
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AnalyticsMap
              pharmacies={pharmacyMap.data?.pharmacies ?? []}
              riskHeatmap={riskHeatmap.data?.heatmap ?? []}
              provinceDemand={provinceDemand.data?.provinces ?? []}
              loading={pharmacyMap.loading || riskHeatmap.loading || provinceDemand.loading}
              className="h-[520px] w-full"
            />
          </CardContent>
        </Card>

        {/* ── Row 2: Sales Trend + Risk Distribution ───── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Sales Trend (60%) */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Daily Sales Trend</CardTitle>
              <CardDescription className="text-xs">
                Units sold per day
                {salesTrend.data?.drug_name ? ` — ${salesTrend.data.drug_name}` : ''}
                {salesTrend.data?.province ? ` · ${salesTrend.data.province}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {salesTrend.loading ? (
                  <SectionSkeleton rows={5} />
                ) : salesTrend.error ? (
                  <SectionError message={salesTrend.error} onRetry={salesTrend.refetch} />
                ) : salesTrend.data ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesTrend.data.series}
                      margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 19%)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        {...axisStyle}
                        tickFormatter={(v: string) => {
                          const d = new Date(v)
                          return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }}
                        interval="preserveStartEnd"
                      />
                      <YAxis {...axisStyle} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} width={40} />
                      <Tooltip content={<TooltipContent unit="units" />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="units_sold"
                        name="Units Sold"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Expiry Timeline (40%) */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Drug Expiry Timeline</CardTitle>
              <CardDescription className="text-xs">
                Units at risk by expiry window
                {expiryTimeline.data ? ` — as of ${expiryTimeline.data.as_of_date}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {expiryTimeline.loading ? (
                  <SectionSkeleton rows={5} />
                ) : expiryTimeline.error ? (
                  <SectionError message={expiryTimeline.error} onRetry={expiryTimeline.refetch} />
                ) : expiryTimeline.data ? (() => {
                  const bucketTotals = EXPIRY_BUCKET_ORDER.map((bucket) => ({
                    bucket,
                    total_units: expiryTimeline.data!.items
                      .filter((i) => i.expiry_bucket === bucket)
                      .reduce((sum, i) => sum + i.total_units, 0),
                    drug_count: expiryTimeline.data!.items.filter((i) => i.expiry_bucket === bucket).length,
                  }))
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bucketTotals} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 88%)" vertical={false} />
                        <XAxis
                          dataKey="bucket"
                          {...axisStyle}
                          angle={-30}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis {...axisStyle} width={48} />
                        <Tooltip
                          contentStyle={{ fontSize: 12 }}
                          formatter={(value: number, _: string, entry: { payload: { drug_count: number } }) => [
                            `${value.toLocaleString()} units (${entry.payload.drug_count} drugs)`,
                            'Total Units',
                          ]}
                        />
                        <Bar dataKey="total_units" radius={[4, 4, 0, 0]}>
                          {bucketTotals.map((entry) => (
                            <Cell key={entry.bucket} fill={EXPIRY_COLORS[entry.bucket]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )
                })() : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 3: Top Drugs + Province Demand ─────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Top Drugs — horizontal bar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top 10 Drugs by Units Sold</CardTitle>
              <CardDescription className="text-xs">Last {days} days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                {topDrugs.loading ? (
                  <SectionSkeleton rows={6} />
                ) : topDrugs.error ? (
                  <SectionError message={topDrugs.error} onRetry={topDrugs.refetch} />
                ) : topDrugs.data ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={topDrugs.data.drugs.map((d) => ({
                        name: d.drug_name.length > 22 ? d.drug_name.slice(0, 22) + '…' : d.drug_name,
                        units_sold: d.units_sold,
                        drug_name: d.drug_name,
                      }))}
                      margin={{ top: 4, right: 20, bottom: 4, left: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 19%)" horizontal={false} />
                      <XAxis type="number" {...axisStyle} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                      <YAxis type="category" dataKey="name" {...axisStyle} width={140} />
                      <Tooltip
                        formatter={(v: number) => [v.toLocaleString(), 'Units Sold']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <Bar dataKey="units_sold" fill={CHART_COLORS[0]} radius={[0, 3, 3, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Province Demand */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Province Demand</CardTitle>
              <CardDescription className="text-xs">Units sold by province — last {days} days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                {provinceDemand.loading ? (
                  <SectionSkeleton rows={6} />
                ) : provinceDemand.error ? (
                  <SectionError message={provinceDemand.error} onRetry={provinceDemand.refetch} />
                ) : provinceDemand.data ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={provinceDemand.data.provinces}
                      margin={{ top: 4, right: 16, bottom: 24, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 19%)" vertical={false} />
                      <XAxis
                        dataKey="province"
                        {...axisStyle}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={50}
                      />
                      <YAxis {...axisStyle} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} width={40} />
                      <Tooltip
                        formatter={(v: number, name: string) => [v.toLocaleString(), name === 'units_sold' ? 'Units Sold' : 'Revenue (LKR)']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <Bar dataKey="units_sold" name="Units Sold" fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 4: Drug Type Breakdown (full width) ─── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Drug Type Breakdown by Week</CardTitle>
            <CardDescription className="text-xs">
              Chronic vs seasonal vs other — last {days} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {drugTypeBreakdown.loading ? (
                <SectionSkeleton rows={5} />
              ) : drugTypeBreakdown.error ? (
                <SectionError message={drugTypeBreakdown.error} onRetry={drugTypeBreakdown.refetch} />
              ) : drugTypeBreakdown.data ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={drugTypeBreakdown.data.series}
                    margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 19%)" vertical={false} />
                    <XAxis
                      dataKey="week"
                      {...axisStyle}
                      tickFormatter={(v: string) => {
                        const d = new Date(v)
                        return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis {...axisStyle} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} width={40} />
                    <Tooltip
                      formatter={(v: number, name: string) => [v.toLocaleString(), name]}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="chronic_units" name="Chronic" stackId="a" fill={CHART_COLORS[0]} maxBarSize={48} />
                    <Bar dataKey="seasonal_units" name="Seasonal" stackId="a" fill={CHART_COLORS[1]} maxBarSize={48} />
                    <Bar dataKey="chronic_seasonal_units" name="Chronic+Seasonal" stackId="a" fill={CHART_COLORS[4]} maxBarSize={48} />
                    <Bar dataKey="other_units" name="Other" stackId="a" fill={CHART_COLORS[7]} radius={[3, 3, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* ── Row 5: Category Stockout Risk + Seasonal ─ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Category Stockout Risk */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Category Stockout Risk</CardTitle>
              <CardDescription className="text-xs">% of SKUs below reorder point per ATC category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {categoryRisk.loading ? (
                  <SectionSkeleton rows={5} />
                ) : categoryRisk.error ? (
                  <SectionError message={categoryRisk.error} onRetry={categoryRisk.refetch} />
                ) : categoryRisk.data ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={categoryRisk.data.categories}
                      margin={{ top: 4, right: 20, bottom: 4, left: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 19%)" horizontal={false} />
                      <XAxis type="number" {...axisStyle} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
                      <YAxis type="category" dataKey="atc_category" {...axisStyle} width={64} />
                      <Tooltip
                        formatter={(v: number, name: string) => [
                          name === 'risk_pct' ? `${v.toFixed(1)}%` : v,
                          name === 'risk_pct' ? 'Risk %' : name,
                        ]}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <Bar dataKey="risk_pct" name="risk_pct" fill={CHART_COLORS[3]} radius={[0, 3, 3, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Pattern */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Seasonal Demand Pattern</CardTitle>
              <CardDescription className="text-xs">Average daily units sold by climate season</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {seasonalPattern.loading ? (
                  <SectionSkeleton rows={5} />
                ) : seasonalPattern.error ? (
                  <SectionError message={seasonalPattern.error} onRetry={seasonalPattern.refetch} />
                ) : seasonalPattern.data ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={seasonalPattern.data.seasons.map((s) => ({
                        ...s,
                        label: SEASON_LABELS[s.climate_season] ?? s.climate_season,
                      }))}
                      margin={{ top: 4, right: 16, bottom: 24, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 19%)" vertical={false} />
                      <XAxis dataKey="label" {...axisStyle} angle={-20} textAnchor="end" interval={0} height={55} />
                      <YAxis {...axisStyle} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} width={44} />
                      <Tooltip
                        formatter={(v: number, name: string) => [v.toLocaleString(), name === 'avg_units_per_day' ? 'Avg Units/Day' : name]}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <Bar dataKey="avg_units_per_day" name="avg_units_per_day" fill={CHART_COLORS[5]} radius={[3, 3, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 6: Risk Heatmap (full width) ─────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Risk Heatmap</CardTitle>
            <CardDescription className="text-xs">
              Province × risk level — SKU count and average risk score
              {riskHeatmap.data ? ` · as of ${riskHeatmap.data.as_of_date}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {riskHeatmap.loading ? (
              <SectionSkeleton rows={4} />
            ) : riskHeatmap.error ? (
              <SectionError message={riskHeatmap.error} onRetry={riskHeatmap.refetch} />
            ) : riskHeatmap.data ? (
              <HeatmapRenderer data={riskHeatmap.data.heatmap} />
            ) : null}
          </CardContent>
        </Card>

        {/* ── Row 7: Disease–Demand Scatter + Gauges ───── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Disease–Demand Correlation (60%) */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Disease–Demand Correlation</CardTitle>
              <CardDescription className="text-xs">
                Reported disease cases vs units sold — last {days} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                {diseaseDemand.loading ? (
                  <SectionSkeleton rows={5} />
                ) : diseaseDemand.error ? (
                  <SectionError message={diseaseDemand.error} onRetry={diseaseDemand.refetch} />
                ) : diseaseDemand.data ? (
                  <ScatterChartRenderer points={diseaseDemand.data.points} />
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Stock Status Gauges (40%) */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Stock Status</CardTitle>
              <CardDescription className="text-xs">
                Drugs below {stockStatus.data?.threshold_days ?? 14}-day threshold
                {stockStatus.data ? ` · ${stockStatus.data.items.length} flagged` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockStatus.loading ? (
                <SectionSkeleton rows={4} />
              ) : stockStatus.error ? (
                <SectionError message={stockStatus.error} onRetry={stockStatus.refetch} />
              ) : stockStatus.data?.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  All drugs above threshold
                </p>
              ) : stockStatus.data ? (
                <div className="grid max-h-[340px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
                  {stockStatus.data.items.map((item) => (
                    <GaugeCard
                      key={item.drug_id}
                      item={item}
                      threshold={stockStatus.data!.threshold_days}
                    />
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* ── Row 8: Pharmacy Risk Table (full width) ─── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pharmacy Risk Register</CardTitle>
            <CardDescription className="text-xs">
              Pharmacies sorted by risk score — highest risk first
              {pharmacyMap.data
                ? ` · ${pharmacyMap.data.pharmacies.length} pharmacies`
                : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pharmacyMap.loading ? (
              <SectionSkeleton rows={5} />
            ) : pharmacyMap.error ? (
              <SectionError message={pharmacyMap.error} onRetry={pharmacyMap.refetch} />
            ) : pharmacyMap.data ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground">Pharmacy</th>
                      <th className="pb-2 px-3 text-left text-xs font-medium text-muted-foreground">Province</th>
                      <th className="pb-2 px-3 text-left text-xs font-medium text-muted-foreground">District</th>
                      <th className="pb-2 px-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                      <th className="pb-2 px-3 text-center text-xs font-medium text-muted-foreground">Risk</th>
                      <th className="pb-2 px-3 text-right text-xs font-medium text-muted-foreground">Risk Score</th>
                      <th className="pb-2 pl-3 text-right text-xs font-medium text-muted-foreground">Reorder Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[...pharmacyMap.data.pharmacies]
                      .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))
                      .map((p) => (
                        <tr key={p.pharmacy_id} className="group hover:bg-muted/40">
                          <td className="py-2 pr-4 font-medium">{p.pharmacy_name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{p.province}</td>
                          <td className="py-2 px-3 text-muted-foreground">{p.district}</td>
                          <td className="py-2 px-3 text-muted-foreground">
                            {p.pharmacy_type}
                            {p.is_urban && <span className="ml-1 text-[10px] text-primary">Urban</span>}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                              style={{
                                backgroundColor: `${RISK_COLORS[p.risk_level]}20`,
                                color: RISK_COLORS[p.risk_level],
                              }}
                            >
                              {p.risk_level}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums font-medium">
                            {p.risk_score != null ? p.risk_score.toFixed(2) : '—'}
                          </td>
                          <td className="py-2 pl-3 text-right tabular-nums text-muted-foreground">
                            {p.recommended_reorder_units != null ? p.recommended_reorder_units.toLocaleString() : '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
