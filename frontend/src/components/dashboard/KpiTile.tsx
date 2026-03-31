import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { KpiMetric } from '@/types/hemas-mind-payload'

const statusValue: Record<KpiMetric['status'], string> = {
  healthy: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
}

const statusBorder: Record<KpiMetric['status'], string> = {
  healthy: 'border-emerald-500/20',
  warning: 'border-amber-500/20',
  critical: 'border-red-500/20',
}

interface KpiTileProps {
  metric: KpiMetric
}

export function KpiTile({ metric }: KpiTileProps) {
  return (
    <Card className={cn('border', statusBorder[metric.status])}>
      <CardContent className="p-4">
        <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {metric.label}
        </p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <span
              className={cn(
                'text-2xl font-bold tabular-nums',
                statusValue[metric.status]
              )}
            >
              {typeof metric.value === 'number'
                ? metric.value.toLocaleString()
                : metric.value}
            </span>
            {metric.unit && (
              <span className="ml-1 text-sm text-muted-foreground">{metric.unit}</span>
            )}
          </div>

          {metric.trend && (
            <div
              className={cn(
                'flex flex-shrink-0 items-center gap-0.5 text-xs font-semibold',
                statusValue[metric.status]
              )}
            >
              {metric.trend === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
              {metric.trend === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
              {metric.trend === 'stable' && <Minus className="h-3.5 w-3.5" />}
              {metric.trendValue && <span>{metric.trendValue}</span>}
            </div>
          )}
        </div>

        {metric.subLabel && (
          <p className="mt-1 text-xs text-muted-foreground">{metric.subLabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
