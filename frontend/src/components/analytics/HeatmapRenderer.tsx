'use client'

import type { RiskHeatmapItem } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface HeatmapRendererProps {
  data: RiskHeatmapItem[]
}

const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const
type RiskLevel = (typeof RISK_LEVELS)[number]

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const RISK_BASE_COLOR: Record<RiskLevel, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
}

function cellOpacity(value: number, max: number): number {
  if (max === 0) return 0
  return Math.max(0.08, value / max)
}

export function HeatmapRenderer({ data }: HeatmapRendererProps) {
  const maxPerLevel = RISK_LEVELS.reduce<Record<string, number>>((acc, level) => {
    acc[level] = Math.max(...data.map((r) => r[level] ?? 0), 1)
    return acc
  }, {})

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground">
              Province
            </th>
            {RISK_LEVELS.map((level) => (
              <th
                key={level}
                className="pb-2 px-2 text-center text-xs font-medium text-muted-foreground"
              >
                {RISK_LABEL[level]}
              </th>
            ))}
            <th className="pb-2 pl-4 text-right text-xs font-medium text-muted-foreground">
              Avg Risk Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr key={row.province} className="group">
              <td className="py-2 pr-4 font-medium text-sm whitespace-nowrap">
                {row.province}
              </td>
              {RISK_LEVELS.map((level) => {
                const count = row[level] ?? 0
                const opacity = cellOpacity(count, maxPerLevel[level])
                return (
                  <td key={level} className="py-2 px-2">
                    <div
                      className={cn(
                        'flex items-center justify-center rounded px-3 py-1.5 text-xs font-semibold transition-all',
                        count === 0 ? 'text-muted-foreground' : 'text-white'
                      )}
                      style={{
                        backgroundColor:
                          count > 0
                            ? `${RISK_BASE_COLOR[level]}${Math.round(opacity * 255)
                                .toString(16)
                                .padStart(2, '0')}`
                            : 'transparent',
                        minWidth: '2.5rem',
                      }}
                      title={`${row.province} — ${RISK_LABEL[level]}: ${count}`}
                    >
                      {count}
                    </div>
                  </td>
                )
              })}
              <td className="py-2 pl-4 text-right tabular-nums text-sm text-muted-foreground">
                {row.avg_risk_score.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
