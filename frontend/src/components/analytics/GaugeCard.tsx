'use client'

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import type { StockStatusItem } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface GaugeCardProps {
  item: StockStatusItem
  threshold: number
}

export function GaugeCard({ item, threshold }: GaugeCardProps) {
  const pct = Math.min((item.avg_stock_days / threshold) * 100, 100)
  const isCritical = item.avg_stock_days < threshold * 0.3
  const isWarning =
    item.avg_stock_days >= threshold * 0.3 && item.avg_stock_days < threshold

  const barColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e'

  const gaugeData = [
    { name: 'bg', value: 100, fill: 'hsl(var(--muted))' },
    { name: 'value', value: pct, fill: barColor },
  ]

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-lg border p-4 bg-card',
        isCritical && 'border-red-500/40 bg-red-500/5',
        isWarning && 'border-amber-500/40 bg-amber-500/5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight">
            {item.drug_name}
          </p>
          <p className="text-xs text-muted-foreground">{item.atc_category}</p>
        </div>
        <span
          className={cn(
            'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            isCritical && 'bg-red-500/15 text-red-500',
            isWarning && 'bg-amber-500/15 text-amber-500',
            !isCritical && !isWarning && 'bg-green-500/15 text-green-500'
          )}
        >
          {isCritical ? 'Critical' : isWarning ? 'Warning' : 'OK'}
        </span>
      </div>

      <div className="relative h-[80px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="90%"
            innerRadius="60%"
            outerRadius="90%"
            startAngle={180}
            endAngle={0}
            data={gaugeData}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span
            className={cn(
              'text-xl font-bold tabular-nums',
              isCritical && 'text-red-500',
              isWarning && 'text-amber-500',
              !isCritical && !isWarning && 'text-green-500'
            )}
          >
            {item.avg_stock_days.toFixed(1)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">days</span>
        </div>
      </div>

      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Min stock</span>
          <span className="font-medium tabular-nums text-foreground">
            {item.min_stock_days.toFixed(1)} days
          </span>
        </div>
        <div className="flex justify-between">
          <span>Below threshold</span>
          <span className="font-medium tabular-nums text-foreground">
            {item.pharmacies_below_threshold}/{item.total_pharmacies} pharmacies
          </span>
        </div>
      </div>
    </div>
  )
}
