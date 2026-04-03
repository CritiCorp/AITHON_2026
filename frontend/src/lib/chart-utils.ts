import type { Granularity } from '@/types/hemas-mind-payload'

const _MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Format an ISO date string (YYYY-MM-DD) for x-axis tick display based on granularity.
 * Parses via string splitting to avoid UTC/local timezone shifts from `new Date()`.
 *
 * - daily:   "2026-04-15" → "Apr 15"
 * - monthly: "2026-04-01" → "Apr 2026"
 * - yearly:  "2026-01-01" → "2026"
 */
export function formatXTick(value: string, granularity?: Granularity): string {
  const parts = value.split('-')
  if (parts.length < 3) return value

  const year = parts[0]
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)
  const monthName = _MONTH_NAMES[month - 1] ?? ''

  switch (granularity) {
    case 'monthly':
      return `${monthName} ${year}`
    case 'yearly':
      return year
    case 'daily':
    default:
      return `${monthName} ${day}`
  }
}

/** Format an ISO date string for chart X-axis labels. */
export function formatChartDate(value: string): string {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Default chart colour palette. */
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#a78bfa', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
]

/** Pick a colour by index, cycling through the palette. */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}
