import { LineChartRenderer } from './LineChartRenderer'
import { BarChartRenderer } from './BarChartRenderer'
import { AreaChartRenderer } from './AreaChartRenderer'
import { ComposedChartRenderer } from './ComposedChartRenderer'
import { PieChartRenderer } from './PieChartRenderer'
import type { ChartSpec } from '@/types/hemas-mind-payload'

interface ChartFactoryProps {
  spec: ChartSpec
}

/** Switches on ChartSpec.type and renders the correct chart component. */
export function ChartFactory({ spec }: ChartFactoryProps) {
  switch (spec.type) {
    case 'line':
      return <LineChartRenderer spec={spec} />
    case 'bar':
      return <BarChartRenderer spec={spec} />
    case 'area':
      return <AreaChartRenderer spec={spec} />
    case 'composed':
      return <ComposedChartRenderer spec={spec} />
    case 'pie': {
      const pieData = spec.data.map((d) => ({
        name: String(d[spec.series?.[0]?.key ?? 'name'] ?? ''),
        value: Number(d[spec.series?.[1]?.key ?? 'value'] ?? 0),
      }))
      return <PieChartRenderer data={pieData} unit={spec.unit} />
    }
    case 'scatter':
      return <LineChartRenderer spec={spec} />
    default:
      return <LineChartRenderer spec={spec} />
  }
}
