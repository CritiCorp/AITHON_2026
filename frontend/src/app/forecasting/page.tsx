'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Play, RefreshCw, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ChartFactory } from '@/components/analytics/ChartFactory'
import { KpiRow } from '@/components/dashboard/KpiRow'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { ConfidenceIndicator } from '@/components/agent/ConfidenceIndicator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePayloadStore } from '@/store/payloadStore'
import type { HemasMindPayload } from '@/types/hemas-mind-payload'
import { cn } from '@/lib/utils'

interface ForecastSummary {
  run_id: string
  title: string
  summary: string
  region: string
  generated_at: string
  confidence_score: number
  model_used: string
  alert_level: 'critical' | 'warning' | 'info' | null
}

function formatRelativeTime(iso: string): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const alertBadgeVariant: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function ForecastingPage() {
  const { current: livePayload } = usePayloadStore()

  const [forecasts, setForecasts] = useState<ForecastSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedPayload, setSelectedPayload] = useState<HemasMindPayload | null>(null)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const fetchForecasts = useCallback(async () => {
    setLoadingList(true)
    setListError(null)
    try {
      const res = await fetch('/api/forecasts')
      const data = await res.json()
      setForecasts(data.forecasts ?? [])
    } catch {
      setListError('Could not load saved forecasts.')
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    fetchForecasts()
  }, [fetchForecasts])

  // When a new live payload arrives, refresh the list
  useEffect(() => {
    if (livePayload) fetchForecasts()
  }, [livePayload, fetchForecasts])

  const selectForecast = useCallback(async (runId: string) => {
    if (selectedId === runId) return
    setSelectedId(runId)
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/forecasts/${encodeURIComponent(runId)}`)
      const data = await res.json()
      // Only store if it looks like a valid payload (has layout + metadata)
      if (res.ok && data?.layout && data?.metadata) {
        setSelectedPayload(data as HemasMindPayload)
      } else {
        setSelectedPayload(null)
      }
    } catch {
      setSelectedPayload(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [selectedId])

  const displayPayload = selectedPayload ?? (selectedId ? null : livePayload)
  const charts = displayPayload?.charts ?? []

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="max-w-screen-2xl mx-auto w-full flex-1 px-6 py-6">
        <div className="flex gap-6">

          {/* ── Saved forecasts sidebar ─────────────────────── */}
          <aside className="w-72 flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Saved Forecasts
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={fetchForecasts}
                disabled={loadingList}
                title="Refresh"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loadingList && 'animate-spin')} />
              </Button>
            </div>

            {listError && (
              <p className="text-xs text-destructive">{listError}</p>
            )}

            {!loadingList && forecasts.length === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-xs text-muted-foreground">No saved forecasts yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Run the pipeline from the{' '}
                  <Link href="/dashboard" className="underline">Dashboard</Link>.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {forecasts.map((f) => (
                <button
                  key={f.run_id}
                  onClick={() => selectForecast(f.run_id)}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                    selectedId === f.run_id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium leading-tight line-clamp-2 flex-1">
                      {f.title}
                    </p>
                    {f.alert_level && (
                      <span className={cn(
                        'mt-0.5 flex-shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium',
                        alertBadgeVariant[f.alert_level]
                      )}>
                        {f.alert_level}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>{formatRelativeTime(f.generated_at)}</span>
                    <span className="text-muted-foreground/50">·</span>
                    <TrendingUp className="h-3 w-3 flex-shrink-0" />
                    <span>{Math.round(f.confidence_score * 100)}%</span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{f.region}</p>
                </button>
              ))}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-5">
            <ForecastDetail
              payload={displayPayload}
              charts={charts}
              loading={loadingDetail}
              hasSaved={forecasts.length > 0}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function ForecastDetail({
  payload,
  charts,
  loading,
  hasSaved,
}: {
  payload: HemasMindPayload | null
  charts: HemasMindPayload['charts']
  loading: boolean
  hasSaved: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!payload?.layout || !payload?.metadata) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <Play className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">No Forecast Selected</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            {hasSaved
              ? 'Select a saved forecast from the list, or run a new analysis.'
              : 'Run the AI analysis pipeline first to generate demand forecasts.'}
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard">
            <Play className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {payload.alert && (
        <div className={cn(
          'flex items-start gap-3 rounded-lg border px-4 py-3',
          payload.alert.level === 'critical' && 'border-red-200 bg-red-50 text-red-800',
          payload.alert.level === 'warning' && 'border-yellow-200 bg-yellow-50 text-yellow-800',
          payload.alert.level === 'info' && 'border-blue-200 bg-blue-50 text-blue-800',
        )}>
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{payload.alert.title}</p>
            <p className="text-xs opacity-80">{payload.alert.message}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold">
                PharmaCast — {payload.layout?.title}
              </CardTitle>
              {payload.layout?.summary && (
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  {payload.layout.summary}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <ConfidenceIndicator
                score={payload.metadata?.confidence_score ?? 0}
                model_used={payload.metadata?.model_used ?? ''}
              />
              {payload.layout?.date_range && (
                <span className="text-xs text-muted-foreground">
                  {payload.layout.date_range}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {payload.kpis?.length > 0 && <KpiRow kpis={payload.kpis} />}

          {charts.map((spec) => (
            <div key={spec.id} className="h-[500px]">
              <ChartFactory spec={spec} />
            </div>
          ))}

          {charts.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No charts in this forecast.
            </p>
          )}
        </CardContent>
      </Card>

      <InsightsPanel insights={payload.insights ?? []} />
    </>
  )
}
