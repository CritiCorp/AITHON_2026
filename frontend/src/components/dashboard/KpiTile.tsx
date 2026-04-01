import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { KpiTile as KpiTileType } from '@/types/hemas-mind-payload'

const statusValue: Record<KpiTileType['status'], string> = {
  good: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
  neutral: 'text-muted-foreground',
}

const statusBorder: Record<KpiTileType['status'], string> = {
  good: 'border-emerald-500/20',
  warning: 'border-amber-500/20',
  critical: 'border-red-500/20',
  neutral: 'border-border/50',
}

interface KpiTileProps {
  tile: KpiTileType
}

export function KpiTile({ tile }: KpiTileProps) {
  return (
    <Card className={cn('border', statusBorder[tile.status])}>
      <CardContent className="p-4">
        <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {tile.label}
        </p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <span
              className={cn(
                'text-2xl font-bold tabular-nums',
                statusValue[tile.status]
              )}
            >
              {typeof tile.value === 'number'
                ? tile.value.toLocaleString()
                : tile.value}
            </span>
            {tile.unit && (
              <span className="ml-1 text-sm text-muted-foreground">{tile.unit}</span>
            )}
          </div>

          {tile.trend && (
            <div
              className={cn(
                'flex flex-shrink-0 items-center gap-0.5 text-xs font-semibold',
                statusValue[tile.status]
              )}
            >
              {tile.trend === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
              {tile.trend === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
              {tile.trend === 'stable' && <Minus className="h-3.5 w-3.5" />}
              {tile.trend_value && <span>{tile.trend_value}</span>}
            </div>
          )}
        </div>

        {tile.sub_label && (
          <p className="mt-1 text-xs text-muted-foreground">{tile.sub_label}</p>
        )}
      </CardContent>
    </Card>
  )
}
