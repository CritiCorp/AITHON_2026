import { LineChartRenderer } from './LineChartRenderer'
import { BarChartRenderer } from './BarChartRenderer'
import type { ChartConfig } from '@/types/hemas-mind-payload'

interface ChartFactoryProps {
  config: ChartConfig
}

/** Switches on ChartConfig.type and renders the correct chart component. */
export function ChartFactory({ config }: ChartFactoryProps) {
  switch (config.type) {
    case 'line':
      return <LineChartRenderer config={config} />
    case 'bar':
      return <BarChartRenderer config={config} />
    default: {
      const exhaustive: never = config.type
      return (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Unknown chart type: {exhaustive}
        </div>
      )
    }
  }
}
