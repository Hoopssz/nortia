import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { ThemeTogglePill } from '../../components/ThemeTogglePill'
import { regionNames, regionOrder, NUBLE_CODE } from '../../lib/chileRegions'
import { useOnboarding } from '../../features/onboarding/useOnboarding'

const CIUDADES_PRINCIPALES: Record<number, string> = {
  15: 'Arica',
  1: 'Iquique',
  2: 'Antofagasta',
  3: 'Copiapó',
  4: 'La Serena / Coquimbo',
  5: 'Valparaíso / San Antonio',
  13: 'Santiago',
  6: 'Rancagua',
  7: 'Talca / Curicó',
  16: 'Chillán',
  8: 'Concepción / Los Ángeles',
  9: 'Temuco',
  14: 'Valdivia',
  10: 'Puerto Montt / Osorno',
  11: 'Coyhaique',
  12: 'Punta Arenas',
}

const ZONAS_SIMPLES = [
  {
    id: 'sur',
    nombre: 'Zona Centro-Sur (Ruta 5 Sur)',
    codigos: [6, 7, 16, 8, 9, 14, 10],
  },
  {
    id: 'centro',
    nombre: 'Santiago y Valparaíso',
    codigos: [13, 5],
  },
  {
    id: 'norte',
    nombre: 'Zona Norte',
    codigos: [15, 1, 2, 3, 4],
  },
  {
    id: 'austral',
    nombre: 'Zona Austral',
    codigos: [11, 12],
  },
]

export function RegionsPage() {
  const navigate = useNavigate()
  const { state, update } = useOnboarding()
  const [selected, setSelected] = useState<Set<number>>(
    new Set(state.regiones.length ? state.regiones : [NUBLE_CODE, 8, 13]),
  )

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

  function toggleGroup(codigos: number[]) {
    setSelected((prev) => {
      const next = new Set(prev)
      const allActive = codigos.every((c) => next.has(c))
      if (allActive) {
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

  return (
    <div
      className="px"
      style={{
        paddingTop: 20,
        paddingBottom: 40,
        maxWidth: 640,
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {/* Cabecera simple */}
      <div className="between" style={{ marginBottom: 10, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star4Point size={15} color="var(--navy)" />
          <span className="eyebrow" style={{ margin: 0, fontSize: 13 }}>
            Paso 2 de 3 · Zonas de trabajo
          </span>
        </div>
        <ThemeTogglePill />
      </div>

      {/* Barra de progreso */}
      <div className="steps" style={{ margin: '6px 0 18px', height: 8 }}>
        <span className="on" />
        <span className="on" />
        <span />
      </div>

      {/* Título grande y claro para fácil lectura */}
      <div style={{ marginBottom: 18 }}>
        <h1
          className="h2"
          style={{
            margin: '0 0 8px',
            fontSize: 26,
            lineHeight: 1.25,
          }}
        >
          ¿En qué regiones trabajas?
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.5,
            color: 'var(--slate)',
          }}
        >
          Toca cada región para <b>activarla (en azul con ✓)</b> o vuelve a tocarla para <b>desactivarla</b>.
        </p>
      </div>

      {/* Botones grandes de acción rápida (Todo Chile / Limpiar) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <button
          type="button"
          onClick={allSelected ? clearAll : selectAll}
          style={{
            padding: '15px 16px',
            borderRadius: 16,
            border: `2px solid ${allSelected ? '#10B981' : 'var(--navy)'}`,
            background: allSelected ? '#10B981' : 'var(--navy)',
            color: '#FFFFFF',
            fontSize: 15.5,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="check" size={18} strokeWidth={2.8} />
          <span>{allSelected ? 'Todo Chile Activado' : 'Marcar Todo Chile'}</span>
        </button>

        <button
          type="button"
          onClick={clearAll}
          disabled={selected.size === 0}
          style={{
            padding: '15px 16px',
            borderRadius: 16,
            border: '2px solid var(--line)',
            background: 'var(--surface)',
            color: selected.size === 0 ? 'var(--slate-light)' : 'var(--danger)',
            fontSize: 15.5,
            fontWeight: 800,
            cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="x" size={18} strokeWidth={2.6} />
          <span>Desmarcar todas</span>
        </button>
      </div>

      {/* Contador claro */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 16,
          background: selected.size > 0 ? 'var(--navy-tint)' : 'rgba(239, 68, 68, 0.1)',
          border: `1.5px solid ${selected.size > 0 ? 'var(--navy)' : 'var(--danger)'}`,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
          {selected.size === 0
            ? '⚠️ No has marcado ninguna región todavía'
            : `✓ Tienes ${selected.size} ${selected.size === 1 ? 'región activada' : 'regiones activadas'}`}
        </span>
      </div>

      {/* Lista de Regiones por Zona con botones grandes y claros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 28 }}>
        {ZONAS_SIMPLES.map((zona) => {
          const allInZona = zona.codigos.every((c) => selected.has(c))
          return (
            <div
              key={zona.id}
              style={{
                background: 'var(--surface)',
                border: '1.5px solid var(--line)',
                borderRadius: 20,
                padding: '18px 16px',
              }}
            >
              <div
                className="between"
                style={{
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: '1px solid var(--line)',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{zona.nombre}</div>
                <button
                  type="button"
                  onClick={() => toggleGroup(zona.codigos)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 12,
                    border: `1.5px solid ${allInZona ? 'var(--danger)' : 'var(--navy)'}`,
                    background: allInZona ? 'rgba(239, 68, 68, 0.08)' : 'var(--navy-tint)',
                    color: allInZona ? 'var(--danger)' : 'var(--navy)',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {allInZona ? '✕ Quitar toda esta zona' : '+ Marcar toda esta zona'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {zona.codigos.map((codigo) => {
                  const active = selected.has(codigo)
                  return (
                    <button
                      key={codigo}
                      type="button"
                      onClick={() => toggle(codigo)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 16,
                        border: `2px solid ${active ? 'var(--navy)' : 'var(--line)'}`,
                        background: active ? 'var(--navy)' : 'var(--paper)',
                        color: active ? '#FFFFFF' : 'var(--ink)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* Casilla grande tipo Checkbox fácil de ver */}
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: active ? '2px solid #FFFFFF' : '2px solid var(--slate)',
                            background: active ? '#10B981' : 'var(--surface)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: 18,
                            fontWeight: 900,
                          }}
                        >
                          {active ? '✓' : ''}
                        </div>
                        <div>
                          <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>
                            {regionNames[codigo]}
                          </div>
                          <div
                            style={{
                              fontSize: 13.5,
                              opacity: active ? 0.9 : 0.75,
                              marginTop: 2,
                              fontWeight: 500,
                            }}
                          >
                            {CIUDADES_PRINCIPALES[codigo]}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 800,
                          background: active ? 'rgba(255, 255, 255, 0.2)' : 'var(--surface)',
                          color: active ? '#FFFFFF' : 'var(--slate)',
                          border: active ? 'none' : '1px solid var(--line)',
                          flexShrink: 0,
                        }}
                      >
                        {active ? '✓ ACTIVADA' : 'Tocar para activar'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Botones Inferiores Grandes */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate('/onboarding/rol')}
          style={{
            padding: '16px 20px',
            borderRadius: 18,
            border: '2px solid var(--line)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="arrowL" size={18} strokeWidth={2.5} />
          <span>Volver</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          disabled={selected.size === 0}
          onClick={handleContinue}
          style={{
            flex: 1,
            padding: '16px 24px',
            borderRadius: 18,
            fontSize: 17,
            fontWeight: 800,
            opacity: selected.size === 0 ? 0.5 : 1,
            cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span>Siguiente paso ({selected.size})</span>
          <Icon name="arrowR" size={18} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  )
}
