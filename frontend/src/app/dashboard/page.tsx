'use client'

import { Play, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { AgentStatusBar } from '@/components/agent/AgentStatusBar'
import { AgentThoughtStream } from '@/components/agent/AgentThoughtStream'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { KpiRow } from '@/components/dashboard/KpiRow'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { ActionsPanel } from '@/components/dashboard/ActionsPanel'
import { AgenticChart } from '@/components/analytics/AgenticChart'
import { Button } from '@/components/ui/button'
import { usePayloadStore } from '@/store/payloadStore'
import { useAgentStore } from '@/store/agentStore'
import { useAgentStream } from '@/hooks/useAgentStream'
import { useMockSeed } from '@/hooks/useMockSeed' // MOCK: remove when backend is live

export default function DashboardPage() {
  const { current: payload } = usePayloadStore()
  const { isStreaming } = useAgentStore()
  const { triggerRun } = useAgentStream()
  useMockSeed() // MOCK: remove when backend is live

  const handleRun = () => triggerRun('dengue_outbreak')

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />

      <main className="max-w-screen-2xl mx-auto w-full flex-1 space-y-5 px-6 py-6">

        {/* ── Top bar: agent pills + run button ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AgentStatusBar />
          <Button onClick={handleRun} disabled={isStreaming} className="gap-2">
            {isStreaming ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Agents Running…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        {/* ── Critical / warning alert banner ── */}
        {payload?.alert && <AlertBanner alert={payload.alert} />}

        {/* ── KPI tile row ── */}
        {payload?.kpis && payload.kpis.length > 0 && (
          <KpiRow metrics={payload.kpis} />
        )}

        {/* ── Chart grid ── */}
        {payload?.charts && payload.charts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {payload.charts.map((chart) => (
              <AgenticChart key={chart.id} config={chart} />
            ))}
          </div>
        )}

        {/* ── Insights · Actions · Thought stream ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InsightsPanel insights={payload?.insights ?? []} />
          <ActionsPanel actions={payload?.actions ?? []} />
          <AgentThoughtStream />
        </div>

        {/* ── Empty / idle state ── */}
        {!payload && !isStreaming && (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Ready for Analysis</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                Click <strong>Run Analysis</strong> to trigger the AI pipeline.
                Sentinel will scan for health events in Sri Lanka, the Operator
                will generate demand forecasts, and the Communicator will package
                everything into this dashboard.
              </p>
            </div>
            <Button onClick={handleRun} size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Run Demo Scenario
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
