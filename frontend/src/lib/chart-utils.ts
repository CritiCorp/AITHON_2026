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
