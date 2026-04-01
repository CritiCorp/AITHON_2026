import { cn } from '@/lib/utils'

interface ConfidenceIndicatorProps {
  score: number
  model_used?: string
}

export function ConfidenceIndicator({ score, model_used }: ConfidenceIndicatorProps) {
  const pct = Math.round(score * 100)

  const colorClass =
    pct >= 90
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : pct >= 70
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : 'border-red-500/30 bg-red-500/10 text-red-300'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums',
        colorClass
      )}
      title={model_used ? `Model: ${model_used}` : undefined}
    >
      {pct}% confidence
    </span>
  )
}
