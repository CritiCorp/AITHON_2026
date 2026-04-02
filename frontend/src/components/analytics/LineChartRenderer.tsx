'use client'

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ReferenceLines } from './ReferenceLines'
import type { ChartSpec } from '@/types/hemas-mind-payload'

// ── Custom tooltip ────────────────────────────────────────────
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

interface LineChartRendererProps {
  spec: ChartSpec
}

export function LineChartRenderer({ spec }: LineChartRendererProps) {
  const {
    data,
    series,
    x_axis_key,
    unit,
    show_confidence_band,
    confidence_upper_key,
    confidence_lower_key,
    reference_lines,
  } = spec

  // Main series excludes confidence band series
  const mainSeries = series.filter((s) => !s.is_confidence_band)

  const gradientId = `conf-${spec.id}`

  if (show_confidence_band && confidence_upper_key && confidence_lower_key) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            iconType="line"
          />
          <Area
            dataKey={confidence_upper_key}
            stroke="transparent"
            fill={`url(#${gradientId})`}
            legendType="none"
            connectNulls
          />
          <Area
            dataKey={confidence_lower_key}
            stroke="transparent"
            fill="transparent"
            legendType="none"
            connectNulls
          />
          {mainSeries.map((s) => (
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
          ))}
          {reference_lines && <ReferenceLines lines={reference_lines} />}
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
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
          iconType="line"
        />
        {mainSeries.map((s) => (
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
        ))}
        {reference_lines && <ReferenceLines lines={reference_lines} />}
      </LineChart>
    </ResponsiveContainer>
  )
}
