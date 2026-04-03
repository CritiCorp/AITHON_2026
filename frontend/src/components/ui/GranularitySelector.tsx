'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Granularity } from '@/types/hemas-mind-payload'

interface GranularitySelectorProps {
  value: Granularity
  onChange: (value: Granularity) => void
  disabled?: boolean
}

const OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'daily',   label: 'Day by Day' },
  { value: 'monthly', label: 'Month by Month' },
  { value: 'yearly',  label: 'Year by Year' },
]

export function GranularitySelector({ value, onChange, disabled }: GranularitySelectorProps) {
  return (
    <div className="flex overflow-hidden rounded-md border border-input">
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? 'default' : 'ghost'}
          size="sm"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-none border-0 text-xs',
            value !== opt.value && 'text-muted-foreground'
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
