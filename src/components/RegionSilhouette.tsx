import { regionSilhouettes } from '../lib/chileRegions'

export function RegionSilhouette({ codigo, size = 48 }: { codigo: number; size?: number }) {
  const d = regionSilhouettes[codigo]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ filter: 'drop-shadow(0 5px 9px rgba(18,36,47,0.18))' }}
    >
      <path d={d} fill="var(--navy)" />
    </svg>
  )
}
