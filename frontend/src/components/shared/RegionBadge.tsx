interface RegionBadgeProps {
  region: string
}

export function RegionBadge({ region }: RegionBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-300">
      {region}
    </span>
  )
}
