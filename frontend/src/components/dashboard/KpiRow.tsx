import { KpiTile } from './KpiTile'
import type { KpiTile as KpiTileType } from '@/types/hemas-mind-payload'

interface KpiRowProps {
  kpis: KpiTileType[]
}

export function KpiRow({ kpis }: KpiRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {kpis.map((tile) => (
        <KpiTile key={tile.id} tile={tile} />
      ))}
    </div>
  )
}
