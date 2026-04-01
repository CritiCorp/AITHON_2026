'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ReferenceLines } from './ReferenceLines'
import type { ChartSpec } from '@/types/hemas-mind-payload'

interface TooltipPayloadEntry {
  color: string
  name: string
  value: number
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  unit?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value}
            {unit ? ` ${unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

const axisStyle = {
  tick: { fontSize: 11, fill: 'hsl(215 20% 52%)' },
  tickLine: false as const,
  axisLine: false as const,
}

interface ComposedChartRendererProps {
  spec: ChartSpec
}

/**
 * Renders a ComposedChart mixing Bar (comparison series) and Line (forecast/actual).
 * Series with `is_comparison=true` render as Bars; others render as Lines.
 */
export function ComposedChartRenderer({ spec }: ComposedChartRendererProps) {
  const { data, series, x_axis_key, unit, reference_lines } = spec

  return (
    <ResponsiveContainer width="100%" height={224}>
      <ComposedChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(217 33% 19%)"
          vertical={false}
        />
        <XAxis dataKey={x_axis_key} {...axisStyle} />
        <YAxis
          {...axisStyle}
          tickFormatter={(v: number) => v.toLocaleString()}
        />
        <Tooltip content={<ChartTooltip unit={unit} />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: 'hsl(215 20% 62%)' }}
        />
        {series.map((s) =>
          s.is_comparison ? (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              stackId={s.stack_id}
              radius={[3, 3, 0, 0]}
              maxBarSize={48}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              strokeDasharray={s.stroke_dasharray}
              connectNulls
            />
          )
        )}
        {reference_lines && <ReferenceLines lines={reference_lines} />}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
