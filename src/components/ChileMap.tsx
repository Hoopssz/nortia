import { useState } from 'react'
import { nationalMapPaths, nationalMapViewBox, regionOrder, regionNames } from '../lib/chileRegions'

export type ZoneView = 'nacional' | 'norte' | 'centro' | 'sur' | 'austral'

export interface CityHub {
  codigo: number
  ciudad: string
  x: number
  y: number
  tipo: 'puerto' | 'capital' | 'minero' | 'extremo'
}

export const CITY_HUBS: CityHub[] = [
  { codigo: 15, ciudad: 'Arica', x: 215, y: 40, tipo: 'puerto' },
  { codigo: 1, ciudad: 'Iquique', x: 216, y: 120, tipo: 'puerto' },
  { codigo: 2, ciudad: 'Antofagasta', x: 220, y: 260, tipo: 'minero' },
  { codigo: 3, ciudad: 'Copiapó', x: 195, y: 440, tipo: 'minero' },
  { codigo: 4, ciudad: 'La Serena', x: 170, y: 580, tipo: 'puerto' },
  { codigo: 5, ciudad: 'Valparaíso', x: 155, y: 675, tipo: 'puerto' },
  { codigo: 13, ciudad: 'Santiago', x: 180, y: 708, tipo: 'capital' },
  { codigo: 6, ciudad: 'Rancagua', x: 155, y: 745, tipo: 'capital' },
  { codigo: 7, ciudad: 'Talca', x: 145, y: 795, tipo: 'capital' },
  { codigo: 16, ciudad: 'Chillán', x: 130, y: 840, tipo: 'capital' },
  { codigo: 8, ciudad: 'Concepción', x: 110, y: 885, tipo: 'puerto' },
  { codigo: 9, ciudad: 'Temuco', x: 120, y: 935, tipo: 'capital' },
  { codigo: 14, ciudad: 'Valdivia', x: 105, y: 990, tipo: 'puerto' },
  { codigo: 10, ciudad: 'Puerto Montt', x: 95, y: 1080, tipo: 'puerto' },
  { codigo: 11, ciudad: 'Coyhaique', x: 95, y: 1270, tipo: 'capital' },
  { codigo: 12, ciudad: 'Punta Arenas', x: 210, y: 1580, tipo: 'extremo' },
]

const ZONE_VIEWBOX: Record<ZoneView, string> = {
  nacional: nationalMapViewBox, // 0 0 300 1680.8
  norte: '110 0 200 660',
  centro: '70 630 160 220',
  sur: '30 810 150 365',
  austral: '0 1140 300 545',
}

export function ChileMap({
  selected,
  onToggle,
  hoveredRegion,
  onHoverRegion,
  zone = 'nacional',
  height = 440,
}: {
  selected: Set<number>
  onToggle: (codigo: number) => void
  hoveredRegion?: number | null
  onHoverRegion?: (codigo: number | null) => void
  zone?: ZoneView
  height?: number
}) {
  const [internalHover, setInternalHover] = useState<number | null>(null)
  const currentHover = hoveredRegion !== undefined ? hoveredRegion : internalHover

  function handleMouseEnter(codigo: number) {
    setInternalHover(codigo)
    onHoverRegion?.(codigo)
  }

  function handleMouseLeave() {
    setInternalHover(null)
    onHoverRegion?.(null)
  }

  const viewBox = ZONE_VIEWBOX[zone] || nationalMapViewBox
  const isZoomed = zone !== 'nacional'

  // Generar rutas conectadas entre ciudades activas
  const activeHubs = CITY_HUBS.filter((h) => selected.has(h.codigo))
  const routePoints = activeHubs.map((h) => `${h.x},${h.y}`).join(' ')

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg
        viewBox={viewBox}
        style={{
          height,
          maxHeight: '100%',
          width: 'auto',
          display: 'block',
          margin: '0 auto',
          transition: 'viewBox 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: 'drop-shadow(0 8px 24px rgba(18, 36, 47, 0.15))',
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Gradiente para regiones seleccionadas en Modo Día / Noche */}
          <linearGradient id="selectedGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--navy)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#265370" stopOpacity="0.95" />
          </linearGradient>

          {/* Gradiente para hover */}
          <linearGradient id="hoverGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--navy)" stopOpacity="0.85" />
          </linearGradient>

          {/* Filtro de resplandor para nodos y fronteras */}
          <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Polígonos de Regiones */}
        {regionOrder.map((codigo) => {
          const on = selected.has(codigo)
          const isHover = currentHover === codigo

          return (
            <path
              key={codigo}
              d={nationalMapPaths[codigo]}
              onClick={() => onToggle(codigo)}
              onMouseEnter={() => handleMouseEnter(codigo)}
              onMouseLeave={handleMouseLeave}
              fill={
                isHover
                  ? 'url(#hoverGlowGrad)'
                  : on
                    ? 'url(#selectedGlowGrad)'
                    : 'var(--navy-tint-2)'
              }
              stroke={
                isHover
                  ? '#38BDF8'
                  : on
                    ? 'rgba(56, 189, 248, 0.9)'
                    : 'var(--card-glass-border)'
              }
              strokeWidth={isHover ? (isZoomed ? 1.2 : 0.9) : on ? (isZoomed ? 1.0 : 0.75) : 0.6}
              style={{
                cursor: 'pointer',
                transition: 'fill 0.22s ease, stroke 0.22s ease, filter 0.22s ease',
                filter: isHover
                  ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 3px var(--navy))'
                  : on
                    ? 'drop-shadow(0 0 7px rgba(56, 189, 248, 0.8)) drop-shadow(0 0 2px var(--navy))'
                    : 'none',
              }}
            >
              <title>{`${regionNames[codigo]} · ${on ? 'Seleccionada' : 'Toca para activar'}`}</title>
            </path>
          )
        })}

        {/* Línea de Red de Carretera / Corredor Activo conectando puertos y ciudades */}
        {activeHubs.length > 1 && (
          <polyline
            points={routePoints}
            fill="none"
            stroke="#38BDF8"
            strokeWidth={isZoomed ? 1.5 : 1.2}
            strokeDasharray="4,3"
            strokeLinecap="round"
            style={{
              animation: 'routePulse 1.8s linear infinite',
              filter: 'drop-shadow(0 0 4px #265370)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Nodos de Ciudades y Puertos */}
        {CITY_HUBS.map((hub) => {
          const on = selected.has(hub.codigo)
          const isHover = currentHover === hub.codigo

          return (
            <g
              key={hub.codigo}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={() => onToggle(hub.codigo)}
              onMouseEnter={() => handleMouseEnter(hub.codigo)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Onda de Radar Ping cuando está activa */}
              {on && (
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={isZoomed ? 8 : 6}
                  fill="none"
                  stroke="#38BDF8"
                  style={{
                    animation: 'radarPing 2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Punto Central del Hub */}
              <circle
                cx={hub.x}
                cy={hub.y}
                r={isHover ? (isZoomed ? 4.5 : 3.8) : on ? (isZoomed ? 3.8 : 3.0) : isZoomed ? 2.5 : 1.8}
                fill={isHover ? '#FFFFFF' : on ? '#38BDF8' : 'var(--slate-light)'}
                stroke={on ? 'var(--navy)' : 'var(--paper)'}
                strokeWidth={isZoomed ? 0.8 : 0.6}
                style={{
                  transition: 'all 0.2s ease',
                  filter: on ? 'url(#hubGlow)' : 'none',
                }}
              />

              {/* Etiqueta de la ciudad (visible en zoom o en hover) */}
              {(isZoomed || isHover) && (
                <text
                  x={hub.x + (isZoomed ? 7 : 5)}
                  y={hub.y + 3}
                  fill="var(--ink)"
                  fontSize={isZoomed ? 10 : 8}
                  fontWeight={on ? 800 : 600}
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    textShadow: '0 1px 3px var(--paper), 0 0 6px var(--paper)',
                    letterSpacing: -0.2,
                  }}
                >
                  {hub.ciudad}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

