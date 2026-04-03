import { LineChartRenderer } from './LineChartRenderer'
import { BarChartRenderer } from './BarChartRenderer'
import { AreaChartRenderer } from './AreaChartRenderer'
import { ComposedChartRenderer } from './ComposedChartRenderer'
import { PieChartRenderer } from './PieChartRenderer'
import type { ChartSpec, Granularity } from '@/types/hemas-mind-payload'

interface ChartFactoryProps {
  spec: ChartSpec
  granularity?: Granularity
}

/** Switches on ChartSpec.type and renders the correct chart component. */
export function ChartFactory({ spec, granularity }: ChartFactoryProps) {
  switch (spec.type) {
    case 'line':
      return <LineChartRenderer spec={spec} granularity={granularity} />
    case 'bar':
      return <BarChartRenderer spec={spec} granularity={granularity} />
    case 'area':
      return <AreaChartRenderer spec={spec} granularity={granularity} />
    case 'composed':
      return <ComposedChartRenderer spec={spec} granularity={granularity} />
    case 'pie': {
      const pieData = spec.data.map((d) => ({
        name: String(d[spec.series?.[0]?.key ?? 'name'] ?? ''),
        value: Number(d[spec.series?.[1]?.key ?? 'value'] ?? 0),
      }))
      return <PieChartRenderer data={pieData} unit={spec.unit} />
    }
    case 'scatter':
      return <LineChartRenderer spec={spec} granularity={granularity} />
    default:
      return <LineChartRenderer spec={spec} granularity={granularity} />
  }
}
