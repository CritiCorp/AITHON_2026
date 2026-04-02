'use client'

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS } from '@/lib/chart-utils'
import type { DiseaseDemandPoint } from '@/types/analytics'

interface ScatterChartRendererProps {
  points: DiseaseDemandPoint[]
}

interface TooltipPayloadEntry {
  name: string
  value: number
  payload: DiseaseDemandPoint
}

function groupByDisease(
  points: DiseaseDemandPoint[]
): Record<string, DiseaseDemandPoint[]> {
  return points.reduce<Record<string, DiseaseDemandPoint[]>>((acc, p) => {
    ;(acc[p.disease_name] ??= []).push(p)
    return acc
  }, {})
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '12px',
      }}
    >
      <p className="font-semibold">{point.disease_name}</p>
      <p className="text-muted-foreground">{point.date}</p>
      <p>Province: {point.province}</p>
      <p>Cases reported: {point.reported_cases.toLocaleString()}</p>
      <p>Units sold: {point.units_sold.toLocaleString()}</p>
      <p>Shock multiplier: {point.shock_multiplier}×</p>
    </div>
  )
}

export function ScatterChartRenderer({ points }: ScatterChartRendererProps) {
  const grouped = groupByDisease(points)
  const diseases = Object.keys(grouped)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.5}
        />
        <XAxis
          type="number"
          dataKey="reported_cases"
          name="Reported Cases"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => v.toLocaleString()}
          label={{
            value: 'Reported Cases',
            position: 'insideBottom',
            offset: -10,
            fontSize: 11,
            fill: 'hsl(var(--muted-foreground))',
          }}
        />
        <YAxis
          type="number"
          dataKey="units_sold"
          name="Units Sold"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
        {diseases.map((disease, i) => (
          <Scatter
            key={disease}
            name={disease}
            data={grouped[disease]}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            opacity={0.8}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
