import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { ChileMap, type ZoneView, CITY_HUBS } from '../../components/ChileMap'
import { ThemeTogglePill } from '../../components/ThemeTogglePill'
import { regionNames, regionOrder, NUBLE_CODE } from '../../lib/chileRegions'
import { useOnboarding } from '../../features/onboarding/useOnboarding'

interface MacroZona {
  id: ZoneView
  nombre: string
  subtitulo: string
  icon: 'truck' | 'building' | 'compass' | 'shield'
  tag: string
  codigos: number[]
}

const MACRO_ZONAS: MacroZona[] = [
  {
    id: 'norte',
    nombre: 'Zona Norte',
    subtitulo: 'Arica, Tarapacá, Antofagasta, Atacama, Coquimbo',
    icon: 'truck',
    tag: 'Minería & Puertos',
    codigos: [15, 1, 2, 3, 4],
  },
  {
    id: 'centro',
    nombre: 'Zona Central',
    subtitulo: 'Valparaíso, Metropolitana, O\'Higgins, Maule',
    icon: 'building',
    tag: 'Comercio & Agro',
    codigos: [5, 13, 6, 7],
  },
  {
    id: 'sur',
    nombre: 'Zona Sur',
    subtitulo: 'Ñuble, Biobío, La Araucanía, Los Ríos, Los Lagos',
    icon: 'compass',
    tag: 'Forestal & Graneles',
    codigos: [16, 8, 9, 14, 10],
  },
  {
    id: 'austral',
    nombre: 'Zona Austral',
    subtitulo: 'Aysén y Magallanes',
    icon: 'shield',
    tag: 'Rutas Australes',
    codigos: [11, 12],
  },
]

interface PresetCorredor {
  id: string
  label: string
  desc: string
  icon: 'check' | 'map' | 'truck' | 'building'
  codigos: number[]
}

const PRESETS: PresetCorredor[] = [
  {
    id: 'todo-chile',
    label: 'Todo Chile (16)',
    desc: 'Red nacional completa',
    icon: 'check',
    codigos: [15, 1, 2, 3, 4, 5, 13, 6, 7, 16, 8, 9, 14, 10, 11, 12],
  },
  {
    id: 'ruta-5',
    label: 'Ruta 5 Troncal',
    desc: 'Valparaíso a Los Lagos',
    icon: 'map',
    codigos: [5, 13, 6, 7, 16, 8, 9, 14, 10],
  },
  {
    id: 'eje-central',
    label: 'Eje Metropolitano & Puertos',
    desc: 'Valparaíso, RM, O\'Higgins',
    icon: 'building',
    codigos: [5, 13, 6],
  },
  {
    id: 'norte-minero',
    label: 'Corredor Norte Minero',
    desc: 'Arica a Coquimbo',
    icon: 'truck',
    codigos: [15, 1, 2, 3, 4],
  },
]

export function RegionsPage() {
  const navigate = useNavigate()
  const { state, update } = useOnboarding()
  const [selected, setSelected] = useState<Set<number>>(new Set(state.regiones.length ? state.regiones : [NUBLE_CODE]))
  const [zoneView, setZoneView] = useState<ZoneView>('nacional')
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null)

  useEffect(() => {
    if (!state.rol) navigate('/onboarding/rol', { replace: true })
  }, [state.rol, navigate])

  function toggle(codigo: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(codigo)) {
        next.delete(codigo)
      } else {
        next.add(codigo)
      }
      return next
    })
  }

  function toggleZone(codigos: number[]) {
    setSelected((prev) => {
      const next = new Set(prev)
      const allInZone = codigos.every((c) => next.has(c))
      if (allInZone) {
        codigos.forEach((c) => next.delete(c))
      } else {
        codigos.forEach((c) => next.add(c))
      }
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(regionOrder))
  }

  function clearAll() {
    setSelected(new Set())
  }

  function handleContinue() {
    update({ regiones: [...selected] })
    navigate(state.rol === 'camionero' ? '/onboarding/camion' : '/onboarding/perfil')
  }

  const allSelected = selected.size === regionOrder.length
  const pct = Math.round((selected.size / regionOrder.length) * 100)

  // Nivel de Cobertura para Gamificación
  const tier =
    allSelected
      ? { label: 'Red 100% Nacional Integral', color: 'var(--green)', cls: 'pill-green' }
      : selected.size >= 9
        ? { label: 'Red Multirregional Pro', color: 'var(--navy)', cls: 'pill-navy' }
        : selected.size >= 4
          ? { label: 'Corredor Interurbano Activo', color: 'var(--navy)', cls: 'pill-navy' }
          : selected.size >= 1
            ? { label: 'Operador Regional Local', color: 'var(--slate)', cls: 'pill-navy' }
            : { label: 'Selecciona tus rutas', color: 'var(--danger)', cls: 'pill-danger' }

  // Nombre de ciudad del hub para cada región
  const hubMap = new Map(CITY_HUBS.map((h) => [h.codigo, h.ciudad]))

  return (
    <div
      className="px"
      style={{
        paddingTop: 16,
        paddingBottom: 24,
        maxWidth: 1040,
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Cabecera con Paso y Selector de Modo Día / Noche */}
      <div className="between" style={{ marginBottom: 6, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Star4Point size={13} color="var(--navy)" />
          <span className="eyebrow" style={{ margin: 0 }}>
            Paso 2 de 3 · Cobertura Territorial Interactiva
          </span>
        </div>
        <ThemeTogglePill />
      </div>

      {/* Barra de progreso de 3 pasos */}
      <div className="steps" style={{ margin: '4px 0 12px' }}>
        <span className="on" style={{ boxShadow: '0 0 10px var(--navy)' }} />
        <span className="on" style={{ boxShadow: '0 0 10px var(--navy)' }} />
        <span />
      </div>

      {/* Título y subtítulo */}
      <div style={{ marginBottom: 12 }}>
        <div className="h2" style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: -0.4 }}>
          ¿Dónde quieres operar tu red de transporte?
        </div>
        <div className="sub" style={{ margin: 0, fontSize: 13, color: 'var(--slate)' }}>
          Toca las regiones en el radar táctil o activa corredores macro-zonales con 1 solo toque.
        </div>
      </div>

      {/* Corredores Rápidos 1-Tap (Presets) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--slate)', marginRight: 2 }}>
          Atajos:
        </span>

        {PRESETS.map((p) => {
          const isFullActive = p.codigos.every((c) => selected.has(c))
          return (
            <button
              key={p.id}
              type="button"
              className="chip"
              style={{
                fontSize: 11.5,
                padding: '6px 13px',
                cursor: 'pointer',
                background: isFullActive ? 'var(--navy)' : 'var(--card-glass-bg)',
                color: isFullActive ? '#FFFFFF' : 'var(--ink)',
                borderColor: isFullActive ? 'var(--navy)' : 'var(--card-glass-border)',
                boxShadow: isFullActive ? '0 0 14px -2px var(--navy)' : 'none',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.18s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={() => {
                if (p.id === 'todo-chile') {
                  allSelected ? clearAll() : selectAll()
                } else {
                  if (isFullActive) {
                    setSelected((prev) => {
                      const next = new Set(prev)
                      p.codigos.forEach((c) => next.delete(c))
                      return next
                    })
                  } else {
                    setSelected((prev) => {
                      const next = new Set(prev)
                      p.codigos.forEach((c) => next.add(c))
                      return next
                    })
                  }
                }
              }}
            >
              <Icon name={p.icon} size={13} strokeWidth={2.2} />
              <span>{p.label}</span>
            </button>
          )
        })}

        {selected.size > 0 && (
          <button
            type="button"
            className="chip"
            style={{
              fontSize: 11.5,
              padding: '6px 12px',
              cursor: 'pointer',
              background: 'transparent',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
              marginLeft: 'auto',
            }}
            onClick={clearAll}
          >
            <Icon name="x" size={12} strokeWidth={2.4} />
            <span>Limpiar ({selected.size})</span>
          </button>
        )}
      </div>

      {/* Escenario Central: Radar Táctil (Izquierda) + Módulo de Macro-Zonas & HUD (Derecha) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 440px) 1fr',
          gap: 16,
          alignItems: 'stretch',
          marginBottom: 16,
        }}
      >
        {/* ============================================================
            COLUMNA IZQUIERDA: RADAR TÁCTIL DE MAPA
           ============================================================ */}
        <div
          className="glow-card"
          style={{
            background: 'var(--card-glass-bg)',
            border: '1.5px solid var(--card-glass-border)',
            borderRadius: 18,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(18, 36, 47, 0.08)',
          }}
        >
          {/* Cabecera del Radar Táctil: Switcher de Enfoque / Zoom de Zona */}
          <div className="between" style={{ marginBottom: 10, alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.5, color: 'var(--navy)', textTransform: 'uppercase' }}>
                Radar de Red
              </span>
            </div>

            {/* Píldoras de Enfoque / Zoom */}
            <div
              style={{
                display: 'flex',
                background: 'var(--paper)',
                padding: 2,
                borderRadius: 9,
                gap: 2,
              }}
            >
              {(
                [
                  { id: 'nacional', label: 'Todo Chile' },
                  { id: 'norte', label: 'Norte' },
                  { id: 'centro', label: 'Centro' },
                  { id: 'sur', label: 'Sur' },
                  { id: 'austral', label: 'Austral' },
                ] as const
              ).map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setZoneView(z.id)}
                  style={{
                    border: 'none',
                    background: zoneView === z.id ? 'var(--surface)' : 'transparent',
                    color: zoneView === z.id ? 'var(--navy)' : 'var(--slate)',
                    fontWeight: zoneView === z.id ? 800 : 500,
                    fontSize: 10.5,
                    padding: '3px 8px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    boxShadow: zoneView === z.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lienzo del Mapa SVG con Grilla Táctica Ambiental */}
          <div
            className="radar-canvas-bg"
            style={{
              flex: 1,
              minHeight: 330,
              maxHeight: 380,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderRadius: 14,
              border: '1px solid var(--card-glass-border)',
              background: 'var(--surface)',
              padding: '6px 8px',
            }}
          >
            <ChileMap
              selected={selected}
              onToggle={toggle}
              zone={zoneView}
              hoveredRegion={hoveredRegion}
              onHoverRegion={setHoveredRegion}
              height={360}
            />

            {/* Floating HUD Indicator sobre el mapa */}
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
                background: 'var(--card-glass-bg)',
                border: '1px solid var(--card-glass-border)',
                borderRadius: 10,
                padding: '6px 10px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star4Point size={11} color="var(--navy)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>
                  {hoveredRegion
                    ? `${regionNames[hoveredRegion]} (${hubMap.get(hoveredRegion)})`
                    : `${selected.size} de 16 regiones activadas`}
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--slate)', fontWeight: 600 }}>
                {hoveredRegion
                  ? selected.has(hoveredRegion)
                    ? '✓ Toca para quitar'
                    : '+ Toca para sumar'
                  : 'Toca el mapa interactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            COLUMNA DERECHA: MACRO-ZONAS & LIVE COVERAGE HUD
           ============================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Tarjeta de Cobertura y Nivel de Red (HUD) */}
          <div
            className="card flat"
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: 'var(--card-glass-bg)',
              border: '1px solid var(--card-glass-border)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div className="between" style={{ marginBottom: 6, alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink)' }}>
                Cobertura Territorial Activa
              </div>
              <span className={`pill ${tier.cls}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                ✦ {tier.label}
              </span>
            </div>

            {/* Barra Medidora de Cobertura */}
            <div
              style={{
                width: '100%',
                height: 8,
                borderRadius: 99,
                background: 'var(--paper)',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #265370 0%, #38BDF8 100%)',
                  borderRadius: 99,
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)',
                  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>

            <div className="between" style={{ fontSize: 11, color: 'var(--slate)' }}>
              <span>{pct}% del territorio nacional cubierto</span>
              <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
                {selected.size > 0 ? `~${selected.size * 95}+ fletes/mes estimados` : '0 cargas'}
              </span>
            </div>
          </div>

          {/* Mazos de Macro-Zonas (4 zonas ejecutivas sin checkboxes aburridos) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 330,
              overflowY: 'auto',
              paddingRight: 2,
            }}
          >
            {MACRO_ZONAS.map((z) => {
              const count = z.codigos.filter((c) => selected.has(c)).length
              const isAll = count === z.codigos.length
              const isSome = count > 0 && !isAll

              return (
                <div
                  key={z.id}
                  className="glow-card"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 12,
                    background: isAll ? 'var(--navy-tint)' : isSome ? 'var(--card-glass-bg)' : 'var(--card-glass-bg)',
                    border: `1px solid ${isAll ? 'var(--navy)' : isSome ? 'var(--navy-tint-2)' : 'var(--card-glass-border)'}`,
                    transition: 'all 0.16s ease',
                  }}
                >
                  {/* Fila del Título de Zona y Botón 1-Tap */}
                  <div className="between" style={{ alignItems: 'center', marginBottom: 6 }}>
                    <div className="row" style={{ gap: 7, alignItems: 'center' }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: isAll ? 'var(--navy)' : 'var(--navy-tint)',
                          color: isAll ? '#FFFFFF' : 'var(--navy)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                        }}
                      >
                        <Icon name={z.icon} size={12} strokeWidth={2} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--ink)' }}>{z.nombre}</span>
                        <span style={{ fontSize: 10, color: 'var(--slate)', marginLeft: 6 }}>· {z.tag}</span>
                      </div>
                    </div>

                    <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                      <span
                        className={`pill ${isAll ? 'pill-green' : isSome ? 'pill-navy' : 'pill-navy'}`}
                        style={{ fontSize: 9.5, padding: '1px 6px' }}
                      >
                        {count}/{z.codigos.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleZone(z.codigos)}
                        style={{
                          border: 'none',
                          background: isAll ? 'rgba(239, 68, 68, 0.1)' : 'var(--navy-tint)',
                          color: isAll ? 'var(--danger)' : 'var(--navy)',
                          fontWeight: 700,
                          fontSize: 10.5,
                          padding: '3px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {isAll ? 'Quitar' : isSome ? 'Sumar todas' : '+ Activar'}
                      </button>
                    </div>
                  </div>

                  {/* Pills de Regiones individuales con efecto de Hover en Mapa */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {z.codigos.map((c) => {
                      const on = selected.has(c)
                      const isHover = hoveredRegion === c

                      return (
                        <div
                          key={c}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 7,
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: on ? 700 : 500,
                            background: on ? 'var(--navy)' : isHover ? 'var(--navy-tint)' : 'var(--surface)',
                            color: on ? '#FFFFFF' : isHover ? 'var(--navy)' : 'var(--ink)',
                            border: `1px solid ${on ? 'var(--navy)' : isHover ? '#38BDF8' : 'var(--line)'}`,
                            boxShadow: on ? '0 0 8px rgba(2, 132, 199, 0.4)' : 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            userSelect: 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onClick={() => toggle(c)}
                          onMouseEnter={() => setHoveredRegion(c)}
                          onMouseLeave={() => setHoveredRegion(null)}
                        >
                          <span style={{ fontSize: 9, opacity: on ? 1 : 0.4 }}>
                            {on ? '✓' : '+'}
                          </span>
                          <span>{regionNames[c]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Barra Inferior de Acción */}
      <div className="between" style={{ alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Star4Point size={12} color="var(--navy)" />
          <span>
            <b>{selected.size}</b> regiones seleccionadas para recibir alertas de carga NORTIA.
          </span>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{
            width: 'auto',
            minWidth: 200,
            padding: '12px 24px',
            fontSize: 13.5,
            fontWeight: 800,
            borderRadius: 12,
            opacity: selected.size === 0 ? 0.5 : 1,
            cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
            boxShadow: selected.size > 0 ? '0 0 20px -2px rgba(2, 132, 199, 0.6)' : 'none',
          }}
          disabled={selected.size === 0}
          onClick={handleContinue}
        >
          <span>Continuar ({selected.size})</span>
          <Icon name="arrowR" size={16} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
