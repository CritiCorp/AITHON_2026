import { ReferenceLine as RechartReferenceLine } from 'recharts'
import type { ReferenceLine } from '@/types/hemas-mind-payload'

interface ReferenceLinesProps {
  lines: ReferenceLine[]
}

/** Renders an array of ReferenceLine configs into Recharts ReferenceLine elements. */
export function ReferenceLines({ lines }: ReferenceLinesProps) {
  return (
    <>
      {lines.map((line, i) => (
        <RechartReferenceLine
          key={i}
          y={line.value}
          label={{ value: line.label, fill: line.color, fontSize: 11 }}
          stroke={line.color}
          strokeDasharray={line.stroke_dasharray}
        />
      ))}
    </>
  )
}
