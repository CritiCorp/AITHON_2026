import { KpiTile } from './KpiTile'
import type { KpiMetric } from '@/types/hemas-mind-payload'

interface KpiRowProps {
  metrics: KpiMetric[]
}

export function KpiRow({ metrics }: KpiRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <KpiTile key={metric.id} metric={metric} />
      ))}
    </div>
  )
}
