import { useState, useMemo } from 'react'
import {
  nationalMapPaths,
  nationalMapViewBox,
  regionOrder,
  regionNames,
} from '../lib/chileRegions'
import { CITY_HUBS, type ZoneView } from './ChileMap'
import { Star4Point } from './Icon'
import type { RegionDemandaData, NivelDemanda } from '../lib/demandRadarService'

const ZONE_VIEWBOX: Record<ZoneView, string> = {
  nacional: nationalMapViewBox, // 0 0 300 1680.8
  norte: '110 0 200 660',
  centro: '70 630 160 220',
  sur: '30 810 150 365',
  austral: '0 1140 300 545',
}

// Coordenadas óptimas para CENTRAR con precisión quirúrgica cada una de las 16 regiones de Chile
const REGION_VIEWBOX: Record<number, string> = {
  15: '100 0 190 210',    // Arica y Parinacota (y=40)
  1:  '100 20 190 210',   // Tarapacá / Iquique (y=120)
  2:  '90 150 220 230',   // Antofagasta (y=260)
  3:  '75 320 210 240',   // Atacama / Copiapó (y=440)
  4:  '65 470 190 220',   // Coquimbo / La Serena (y=580) -> ¡Centrada en el medio exacto!
  5:  '60 565 170 220',   // Valparaíso (y=675)
  13: '70 598 175 220',   // Región Metropolitana (y=708)
  6:  '55 635 175 220',   // O'Higgins / Rancagua (y=745)
  7:  '45 685 175 220',   // Maule / Talca (y=795)
  16: '40 730 165 220',   // Ñuble / Chillán (y=840)
  8:  '25 775 165 220',   // Biobío / Concepción (y=885)
  9:  '25 825 170 220',   // La Araucanía / Temuco (y=935)
  14: '20 880 170 220',   // Los Ríos / Valdivia (y=990)
  10: '10 970 185 240',   // Los Lagos / Puerto Montt (y=1080)
  11: '0 1140 230 260',   // Aysén / Coyhaique (y=1270)
  12: '30 1440 270 240',  // Magallanes / Punta Arenas (y=1580)
}

interface ChileHeatMapProps {
  demandaData?: RegionDemandaData[]
  selectedRegion: number | null
  onSelectRegion: (codigo: number) => void
  hoveredRegion?: number | null
  onHoverRegion?: (codigo: number | null) => void
  zone?: ZoneView
  onZoneChange?: (zone: ZoneView) => void
  height?: number
  showControls?: boolean
  showLegend?: boolean
}

export function ChileHeatMap({
  demandaData = [],
  selectedRegion,
  onSelectRegion,
  hoveredRegion,
  onHoverRegion,
  zone = 'nacional',
  onZoneChange,
  height = 540,
  showControls = true,
  showLegend = true,
}: ChileHeatMapProps) {
  const [internalHover, setInternalHover] = useState<number | null>(null)
  const currentHover = hoveredRegion !== undefined ? hoveredRegion : internalHover

  // Mapear datos por código para acceso O(1)
  const dataMap = new Map<number, RegionDemandaData>()
  demandaData.forEach((d) => dataMap.set(d.regionCodigo, d))

  const activeHoverData = currentHover ? dataMap.get(currentHover) : null
  const activeSelectedData = selectedRegion ? dataMap.get(selectedRegion) : null
  const displayData = activeHoverData || activeSelectedData

  // Cálculo dinámico del viewBox: SIEMPRE centrar la región seleccionada si no está en vista nacional
  const viewBox = useMemo(() => {
    // Si el usuario eligió "Todo Chile" y no hay región activa
    if (zone === 'nacional') {
      return nationalMapViewBox
    }

    // Centrar exactamente en la región seleccionada si coincide con la zona actual
    if (selectedRegion && REGION_VIEWBOX[selectedRegion]) {
      const regZone = [15, 1, 2, 3, 4].includes(selectedRegion)
        ? 'norte'
        : [5, 13, 6, 7].includes(selectedRegion)
          ? 'centro'
          : [16, 8, 9, 14, 10].includes(selectedRegion)
            ? 'sur'
            : [11, 12].includes(selectedRegion)
              ? 'austral'
              : 'nacional'

      if (regZone === zone) {
        return REGION_VIEWBOX[selectedRegion]
      }
    }

    // Si se seleccionó una macro-zona diferente, mostrar la macro-zona completa
    if (zone && ZONE_VIEWBOX[zone]) {
      return ZONE_VIEWBOX[zone]
    }

    return nationalMapViewBox
  }, [zone, selectedRegion])

  const isZoomed = zone !== 'nacional'

  function handleMouseEnter(codigo: number) {
    setInternalHover(codigo)
    onHoverRegion?.(codigo)
  }

  function handleMouseLeave() {
    setInternalHover(null)
    onHoverRegion?.(null)
  }

  function getNivelColor(nivel?: NivelDemanda): { fill: string; stroke: string; glow: string } {
    switch (nivel) {
      case 'muy_alta':
        return {
          fill: 'url(#heatFireGrad)',
          stroke: '#FDA4AF',
          glow: 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.65))',
        }
      case 'alta':
        return {
          fill: 'url(#heatAmberGrad)',
          stroke: '#FDE68A',
          glow: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.55))',
        }
      case 'media':
        return {
          fill: 'url(#heatCyanGrad)',
          stroke: '#67E8F9',
          glow: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.45))',
        }
      default:
        return {
          fill: 'url(#heatBlueGrad)',
          stroke: '#93C5FD',
          glow: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.25))',
        }
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Controles de Macro-Zona / Perspectiva Táctica (Segmented Control Minimalista) */}
      {showControls && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            width: '100%',
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          {/* Segmented Control Unificado */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(15, 23, 42, 0.05)',
              borderRadius: 14,
              padding: 3,
              border: '1px solid var(--card-glass-border)',
              gap: 2,
              backdropFilter: 'blur(8px)',
            }}
          >
            {(
              [
                { id: 'nacional', label: 'Todo Chile' },
                { id: 'norte', label: 'Norte' },
                { id: 'centro', label: 'Centro' },
                { id: 'sur', label: 'Sur' },
                { id: 'austral', label: 'Austral' },
              ] as { id: ZoneView; label: string }[]
            ).map((z) => {
              const active = zone === z.id
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => onZoneChange?.(z.id)}
                  style={{
                    padding: '5px 12px',
                    fontSize: 11.5,
                    fontWeight: active ? 800 : 600,
                    background: active ? 'var(--navy)' : 'transparent',
                    color: active ? '#FFFFFF' : 'var(--slate)',
                    border: 'none',
                    borderRadius: 11,
                    cursor: 'pointer',
                    boxShadow: active ? '0 2px 8px rgba(10, 25, 47, 0.25)' : 'none',
                    transition: 'all 0.16s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {active && <Star4Point size={7} color="#38BDF8" />}
                  <span>{z.label}</span>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)' }}>
              Radar Activo en Vivo
            </span>
          </div>
        </div>
      )}

      {/* HUD Tooltip Flotante */}
      {displayData && (
        <div
          style={{
            position: 'absolute',
            top: showControls ? 48 : 10,
            left: 14,
            zIndex: 10,
            background: 'var(--card-glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--card-glass-border)',
            boxShadow: 'var(--card-glass-shadow)',
            borderRadius: 14,
            padding: '10px 14px',
            animation: 'appleCardEnter 0.2s ease both',
            pointerEvents: 'none',
            maxWidth: 260,
          }}
        >
          <div className="between" style={{ gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
              {displayData.regionNombre}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color:
                  displayData.nivelDemanda === 'muy_alta'
                    ? '#F43F5E'
                    : displayData.nivelDemanda === 'alta'
                      ? '#D97706'
                      : 'var(--navy)',
              }}
            >
              {displayData.cargasActivas} fletes
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--slate)', lineHeight: 1.3 }}>
            {displayData.tipoCargaPredominante}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', marginTop: 4 }}>
            Tarifa est: ${displayData.tarifaPromedioTonClp.toLocaleString('es-CL')} / Ton
          </div>
        </div>
      )}

      {/* Lienzo SVG con Malla Térmica */}
      <div
        className="heatmap-canvas-bg"
        style={{
          width: '100%',
          borderRadius: 20,
          border: '1px solid var(--card-glass-border)',
          padding: '16px 10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--card-glass-bg)',
        }}
      >
        <svg
          viewBox={viewBox}
          style={{
            height,
            maxHeight: '100%',
            width: 'auto',
            display: 'block',
            margin: '0 auto',
            transition: 'viewBox 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 10px 28px rgba(18, 36, 47, 0.15))',
            overflow: 'visible',
          }}
        >
          <defs>
            {/* Gradiente CRÍTICO (Muy Alta Demanda - Solo RM) */}
            <linearGradient id="heatFireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0.92" />
            </linearGradient>

            {/* Gradiente ÁMBAR DORADO (Alta Demanda) */}
            <linearGradient id="heatAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
            </linearGradient>

            {/* Gradiente CIAN NORTIA (Demanda Media) */}
            <linearGradient id="heatCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#265370" stopOpacity="0.85" />
            </linearGradient>

            {/* Gradiente AZUL PIZARRA (Demanda Estable / Normal) */}
            <linearGradient id="heatBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.75" />
            </linearGradient>

            {/* Gradiente de Selección Activa */}
            <linearGradient id="heatSelectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Polígonos de las Regiones con Color Térmico Calibrado */}
          {regionOrder.map((codigo) => {
            const data = dataMap.get(codigo)
            const nivel = data?.nivelDemanda || 'normal'
            const isSelected = selectedRegion === codigo
            const isHover = currentHover === codigo
            const nivelStyles = getNivelColor(nivel)

            return (
              <path
                key={codigo}
                d={nationalMapPaths[codigo]}
                onClick={() => onSelectRegion(codigo)}
                onMouseEnter={() => handleMouseEnter(codigo)}
                onMouseLeave={handleMouseLeave}
                fill={isSelected ? '#F8FAFC' : nivelStyles.fill}
                stroke={isSelected ? '#38BDF8' : isHover ? '#FFFFFF' : nivelStyles.stroke}
                strokeWidth={
                  isSelected
                    ? isZoomed ? 2.4 : 2.0
                    : isHover
                      ? isZoomed ? 1.6 : 1.2
                      : isZoomed ? 0.9 : 0.65
                }
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  filter: isSelected
                    ? 'drop-shadow(0 0 14px #38BDF8) drop-shadow(0 0 4px #FFFFFF)'
                    : isHover
                      ? 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.9))'
                      : nivelStyles.glow,
                }}
              >
                <title>{`${regionNames[codigo]} · ${data?.cargasActivas || 0} fletes activos (Click para postular)`}</title>
              </path>
            )
          })}

          {/* Nodos de Ciudades y Puertos con Contadores de Fletes */}
          {CITY_HUBS.map((hub) => {
            const data = dataMap.get(hub.codigo)
            const count = data?.cargasActivas || 0
            const nivel = data?.nivelDemanda || 'normal'
            const isSelected = selectedRegion === hub.codigo
            const isHover = currentHover === hub.codigo

            const isFuego = nivel === 'muy_alta'
            const isAlta = nivel === 'alta'

            return (
              <g
                key={hub.codigo}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onClick={() => onSelectRegion(hub.codigo)}
                onMouseEnter={() => handleMouseEnter(hub.codigo)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Onda de Radar Ping Térmico para zonas calientes */}
                {(isFuego || isAlta || isSelected) && (
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r={isZoomed ? 8 : 6}
                    fill="none"
                    stroke={isFuego ? '#F43F5E' : isAlta ? '#F59E0B' : '#38BDF8'}
                    style={{
                      animation: isFuego ? 'pingFire 1.8s ease-out infinite' : 'radarPing 2.2s ease-out infinite',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Punto Central del Hub */}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={isHover ? (isZoomed ? 5 : 4) : isSelected ? (isZoomed ? 4.5 : 3.6) : isZoomed ? 3.2 : 2.4}
                  fill={isHover || isSelected ? '#FFFFFF' : isFuego ? '#F43F5E' : isAlta ? '#F59E0B' : '#38BDF8'}
                  stroke={isFuego ? '#9F1239' : isAlta ? '#92400E' : '#0F172A'}
                  strokeWidth={isZoomed ? 0.9 : 0.7}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Insignia / Badge con Número de Cargas */}
                <g transform={`translate(${hub.x + (isZoomed ? 7 : 5)}, ${hub.y - (isZoomed ? 8 : 6)})`}>
                  <rect
                    x={0}
                    y={0}
                    width={isZoomed ? 20 : 16}
                    height={isZoomed ? 13 : 11}
                    rx={isZoomed ? 6 : 5}
                    fill={isFuego ? '#F43F5E' : isAlta ? '#D97706' : isSelected ? '#265370' : '#0369A1'}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}
                  />
                  <text
                    x={isZoomed ? 10 : 8}
                    y={isZoomed ? 9.5 : 8}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isZoomed ? 8.5 : 7}
                    fontWeight={900}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {count}
                  </text>
                </g>

                {/* Nombre de la Ciudad en Zoom o Hover */}
                {(isZoomed || isHover) && (
                  <text
                    x={hub.x + (isZoomed ? 28 : 22)}
                    y={hub.y + 3}
                    fill="var(--ink)"
                    fontSize={isZoomed ? 10 : 8}
                    fontWeight={isSelected ? 900 : 700}
                    style={{
                      pointerEvents: 'none',
                      userSelect: 'none',
                      textShadow: '0 1px 4px var(--paper), 0 0 6px var(--paper)',
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

      {/* Leyenda Térmica Cromática Moderada */}
      {showLegend && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            width: '100%',
            marginTop: 12,
            padding: '8px 14px',
            background: 'var(--card-glass-bg)',
            border: '1px solid var(--card-glass-border)',
            borderRadius: 12,
            flexWrap: 'wrap',
          }}
        >
          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F43F5E, #FB7185)',
                boxShadow: '0 0 6px rgba(244, 63, 94, 0.6)',
              }}
            />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>
              Crítica (&ge;14)
            </span>
          </div>

          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                boxShadow: '0 0 6px rgba(245, 158, 11, 0.5)',
              }}
            />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>
              Alta (9-13)
            </span>
          </div>

          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06B6D4, #265370)',
                boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
              }}
            />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>
              Media (5-8)
            </span>
          </div>

          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
              }}
            />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>
              Estable (1-4)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
