import { nationalMapPaths, nationalMapViewBox, regionOrder } from '../lib/chileRegions'

export function ChileMap({
  selected,
  onToggle,
  height = 420,
}: {
  selected: Set<number>
  onToggle: (codigo: number) => void
  height?: number
}) {
  return (
    <svg
      viewBox={nationalMapViewBox}
      style={{
        height,
        width: 'auto',
        display: 'block',
        margin: '0 auto',
        filter: 'drop-shadow(0 6px 14px rgba(18,36,47,0.12))',
      }}
    >
      {regionOrder.map((codigo) => {
        const on = selected.has(codigo)
        return (
          <path
            key={codigo}
            d={nationalMapPaths[codigo]}
            onClick={() => onToggle(codigo)}
            fill={on ? 'var(--navy)' : '#D6E2E9'}
            stroke="#fff"
            strokeWidth={0.7}
            style={{ cursor: 'pointer', transition: 'fill .2s' }}
          />
        )
      })}
    </svg>
  )
}
