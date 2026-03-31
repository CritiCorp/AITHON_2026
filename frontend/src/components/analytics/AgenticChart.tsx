import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartFactory } from './ChartFactory'
import type { ChartConfig } from '@/types/hemas-mind-payload'

interface AgenticChartProps {
  config: ChartConfig
}

/**
 * Root smart chart component consumed by the dashboard.
 * Wraps a Card shell around ChartFactory — the only place in the tree
 * that knows about both the Card layout and the chart type.
 */
export function AgenticChart({ config }: AgenticChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{config.title}</CardTitle>
        {config.subtitle && (
          <CardDescription className="text-xs">{config.subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ChartFactory config={config} />
      </CardContent>
    </Card>
  )
}
