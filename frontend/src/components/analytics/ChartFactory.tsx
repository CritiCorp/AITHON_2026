import { LineChartRenderer } from './LineChartRenderer'
import { BarChartRenderer } from './BarChartRenderer'
import { AreaChartRenderer } from './AreaChartRenderer'
import { ComposedChartRenderer } from './ComposedChartRenderer'
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
    case 'pie':
    case 'scatter':
      // Fallback to line for unsupported types
      return <LineChartRenderer spec={spec} />
    default:
      return <LineChartRenderer spec={spec} />
  }
}
