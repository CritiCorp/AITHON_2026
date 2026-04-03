import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartFactory } from './ChartFactory'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { KpiRow } from '@/components/dashboard/KpiRow'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { ActionsPanel } from '@/components/dashboard/ActionsPanel'
import { RegionBadge } from '@/components/shared/RegionBadge'
import { ConfidenceIndicator } from '@/components/agent/ConfidenceIndicator'
import type { Granularity, HemasMindPayload } from '@/types/hemas-mind-payload'

interface AgenticChartProps {
  payload: HemasMindPayload
  isLoading?: boolean
}

/**
 * Root analysis component consumed by the dashboard.
 * Renders the full HemasMindPayload: alert → card header → KPIs → chart → insights → actions.
 */
export function AgenticChart({ payload, isLoading }: AgenticChartProps) {
  const { layout, metadata, alert, kpis, charts, insights, actions } = payload

  if (!layout || !metadata) return null

  const chartList = charts ?? []
  const granularity: Granularity = layout.granularity ?? 'daily'

  return (
    <div className="space-y-4">
      {/* Alert banner — only shown when present */}
      {alert && <AlertBanner alert={alert} />}

      {/* Main card: header + KPIs + primary chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold">{layout.title}</CardTitle>
              {layout.summary && (
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  {layout.summary}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <ConfidenceIndicator
                score={metadata.confidence_score}
                model_used={metadata.model_used}
              />
            </div>
          </div>

          {/* Region badges + date range */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {(layout.regions_covered ?? []).map((region) => (
              <RegionBadge key={region} region={region} />
            ))}
            {layout.date_range && (
              <span className="text-xs text-muted-foreground">{layout.date_range}</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* KPI tiles */}
          {kpis?.length > 0 && <KpiRow kpis={kpis} />}

          {/* Primary chart (first in array — always demand-forecast) */}
          {chartList[0] && (
            <div className="h-[400px]">
              <ChartFactory spec={chartList[0]} granularity={granularity} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary charts — rendered in a responsive grid */}
      {chartList.length > 1 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {chartList.slice(1).map((spec) => (
            <Card key={spec.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{spec.title}</CardTitle>
                {spec.subtitle && (
                  <CardDescription className="text-xs">{spec.subtitle}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ChartFactory spec={spec} granularity={granularity} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Insights & Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InsightsPanel insights={insights ?? []} />
        <ActionsPanel actions={actions ?? []} />
      </div>
    </div>
  )
}
