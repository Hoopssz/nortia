import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { ChileHeatMap } from '../../components/ChileHeatMap'
import { PostularCamionModal } from '../../components/PostularCamionModal'
import {
  calcularRadarDemanda,
  obtenerFletesPorRegion,
  estaPostulado,
  type FleteRegional,
} from '../../lib/demandRadarService'
import { regionNames } from '../../lib/chileRegions'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import type { Tables } from '../../lib/database.types'
import type { ZoneView } from '../../components/ChileMap'

type Camion = Tables<'camiones'>
type Carga = Tables<'cargas'>

export function MapaCalorPage() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [camion, setCamion] = useState<Camion | null>(null)
  const [cargasDb, setCargasDb] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedRegion, setSelectedRegion] = useState<number>(13) // RM default
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null)
  const [zone, setZone] = useState<ZoneView>('nacional')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'rampa' | 'frio' | 'pesado'>('todos')

  const [fleteSeleccionado, setFleteSeleccionado] = useState<FleteRegional | null>(null)
  const [modalPostularOpen, setModalPostularOpen] = useState(false)
  const [, setTriggerUpdate] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [{ data: camData }, { data: cargasData }] = await Promise.all([
          session?.user.id
            ? supabase
                .from('camiones')
                .select('*')
                .eq('perfil_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from('cargas')
            .select('*')
            .eq('estado', 'publicada')
            .order('created_at', { ascending: false }),
        ])

        if (!active) return
        setCamion((camData as Camion) ?? null)
        setCargasDb((cargasData as Carga[]) ?? [])
      } catch (err) {
        console.error('Error al cargar datos del mapa de calor:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [session])

  // Escuchar evento global de postulación para refrescar estados
  useEffect(() => {
    function onPostulacion() {
      setTriggerUpdate((c) => c + 1)
    }
    window.addEventListener('nortia_postulacion_creada', onPostulacion)
    return () => window.removeEventListener('nortia_postulacion_creada', onPostulacion)
  }, [])

  const demandaData = useMemo(() => calcularRadarDemanda(cargasDb), [cargasDb])

  // Métricas Consolidadas Nacionales
  const totalCargasNacional = useMemo(
    () => demandaData.reduce((acc, curr) => acc + curr.cargasActivas, 0),
    [demandaData]
  )

  const regionTopDemanda = useMemo(() => demandaData[0], [demandaData])

  const fletesDisponibles = useMemo(() => {
    const raw = obtenerFletesPorRegion(selectedRegion, cargasDb)
    if (filtroTipo === 'todos') return raw
    if (filtroTipo === 'rampa') return raw.filter((f) => f.requiereRampa)
    if (filtroTipo === 'frio') return raw.filter((f) => f.requiereFrio)
    if (filtroTipo === 'pesado') return raw.filter((f) => f.pesoKg >= 20000)
    return raw
  }, [selectedRegion, cargasDb, filtroTipo])

  const regionActual = demandaData.find((d) => d.regionCodigo === selectedRegion)

  function handlePostular(f: FleteRegional) {
    setFleteSeleccionado(f)
    setModalPostularOpen(true)
  }

  function getZoneForRegion(codigo: number): ZoneView {
    if ([15, 1, 2, 3, 4].includes(codigo)) return 'norte'
    if ([5, 13, 6, 7].includes(codigo)) return 'centro'
    if ([16, 8, 9, 14, 10].includes(codigo)) return 'sur'
    if ([11, 12].includes(codigo)) return 'austral'
    return 'nacional'
  }

  function handleSelectRegion(codigo: number) {
    setSelectedRegion(codigo)
    const newZone = getZoneForRegion(codigo)
    setZone(newZone)
  }

  return (
    <WebPlatformLayout activeTab="Mapa de Calor">
      <div className="web-platform-container">
        {/* Cabecera Principal de la Pantalla de Mapa de Calor */}
        <div className="between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div>
            <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--navy)', fontWeight: 800 }}>✦ RADAR TÉRMICO NORTIA</span>
              <span>{loading ? '· Sincronizando radar...' : '· Demanda Logística Nacional en Tiempo Real'}</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 25, letterSpacing: -0.4 }}>
              Mapa de Calor de Cargas en Chile
            </div>
          </div>

          <button
            type="button"
            className="chip"
            style={{
              background: 'var(--navy)',
              color: '#FFFFFF',
              borderColor: 'var(--navy)',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px -2px rgba(10, 25, 47, 0.3)',
              padding: '8px 16px',
            }}
            onClick={() => navigate('/camionero/buscar')}
          >
            <Icon name="search" size={14} color="#38BDF8" strokeWidth={2} />
            <span>Explorar Todas las Cargas</span>
          </button>
        </div>

        {/* 4 KPIs de Inteligencia de Demanda Nacional */}
        <div className="stats-bar-grid" style={{ marginBottom: 20 }}>
          {/* KPI 1: Total Fletes Activos */}
          <div
            className="glow-card glow-tile-cyan"
            style={{
              padding: '16px 18px',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div className="between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Demanda Nacional
                </span>
                <Icon name="flame" size={16} color="#F59E0B" />
              </div>
              <div style={{ fontWeight: 900, fontSize: 26, color: 'var(--ink)', letterSpacing: -0.5 }}>
                {totalCargasNacional} Fletes
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 8 }}>
              Activos en las 16 regiones de Chile hoy
            </div>
          </div>

          {/* KPI 2: Polo Logístico Líder */}
          <div
            className="glow-card"
            style={{
              padding: '16px 18px',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Polo de Mayor Concentración
              </span>
              <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--ink)', marginTop: 4 }}>
                {regionTopDemanda?.regionNombre || 'Metropolitana'}
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: '#D97706', fontWeight: 700, marginTop: 8 }}>
              🔥 {regionTopDemanda?.cargasActivas || 14} fletes inmediatos
            </div>
          </div>

          {/* KPI 3: Tarifa Promedio Nacional */}
          <div
            className="glow-card"
            style={{
              padding: '16px 18px',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Tarifa Promedio Estimada
              </span>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--navy)', marginTop: 4 }}>
                $24.500 <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)' }}>/ Ton</span>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 8 }}>
              Tendencia alcista en corredores minero y puerto
            </div>
          </div>

          {/* KPI 4: Tu Camión Disponible */}
          <div
            className="glow-card glow-tile-cyan"
            style={{
              padding: '16px 18px',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div className="between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Tu Camión en Radar
                </span>
                <span className="pill pill-green" style={{ fontSize: 10 }}>Activo</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 19, color: 'var(--ink)' }}>
                {camion?.tipo ? camion.tipo.replace('_', ' ').toUpperCase() : 'TRACTO / RAMPLA'}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 800, marginTop: 8 }}>
              Patente: {camion?.patente || 'SF2822'} · Listo para postular
            </div>
          </div>
        </div>

        {/* Atajos Rápidos de Polos de Carga */}
        {/* Escenario Dividido: Mapa Interactivo a la Izquierda (55%) + Consola de Fletes a la Derecha (45%) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: 22,
            alignItems: 'start',
          }}
          className="two-col-grid"
        >
          {/* Columna Izquierda: Mapa de Calor Vectorial */}
          <div className="glow-card" style={{ padding: '20px', borderRadius: 20 }}>
            <div className="between" style={{ marginBottom: 14, alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Radar Territorial Interactivo
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
                  Haz clic en el mapa o elige una región
                </div>
              </div>

              {/* Selector Desplegable Limpio de Región */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedRegion}
                    onChange={(e) => handleSelectRegion(Number(e.target.value))}
                    aria-label="Seleccionar región"
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      padding: '7px 30px 7px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      background: 'var(--card-glass-bg)',
                      border: '1px solid var(--card-glass-border)',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    {demandaData.map((d) => (
                      <option key={d.regionCodigo} value={d.regionCodigo}>
                        {d.regionNombre} ({d.cargasActivas} fletes)
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 9, color: 'var(--slate)' }}>
                    ▼
                  </span>
                </div>

                {zone !== 'nacional' && (
                  <button
                    type="button"
                    onClick={() => setZone('nacional')}
                    className="chip"
                    style={{
                      fontSize: 11.5,
                      padding: '6px 10px',
                      background: 'transparent',
                      color: 'var(--slate)',
                      border: '1px solid var(--card-glass-border)',
                      cursor: 'pointer',
                    }}
                    title="Restablecer vista a Chile Completo"
                  >
                    ⟲ Todo Chile
                  </button>
                )}
              </div>
            </div>

            <ChileHeatMap
              demandaData={demandaData}
              selectedRegion={selectedRegion}
              onSelectRegion={handleSelectRegion}
              hoveredRegion={hoveredRegion}
              onHoverRegion={setHoveredRegion}
              zone={zone}
              onZoneChange={setZone}
              height={580}
              showControls={true}
              showLegend={true}
            />
          </div>

          {/* Columna Derecha: Consola de Fletes y Postulación con Camión */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Banner de Región Seleccionada */}
            <div
              style={{
                background: 'var(--card-glass-bg)',
                border: '1px solid var(--card-glass-border)',
                borderRadius: 18,
                padding: '16px 18px',
              }}
            >
              <div className="between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Zona Operativa Activa
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: -0.3 }}>
                    {regionNames[selectedRegion]}
                  </div>
                </div>

                <span
                  className="pill pill-navy"
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  <Icon name="truck" size={13} />
                  {fletesDisponibles.length} fletes
                </span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.4 }}>
                Sector logístico predominante: <b>{regionActual?.tipoCargaPredominante || 'General'}</b>. Tarifa estimada en origen: <b>${regionActual?.tarifaPromedioTonClp.toLocaleString('es-CL')} / Ton</b>.
              </div>

              {/* Filtro Rápido de Tipo de Carga */}
              <div className="row" style={{ gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="chip"
                  onClick={() => setFiltroTipo('todos')}
                  style={{
                    fontSize: 11.5,
                    padding: '5px 10px',
                    fontWeight: filtroTipo === 'todos' ? 800 : 500,
                    background: filtroTipo === 'todos' ? 'var(--navy)' : 'var(--paper)',
                    color: filtroTipo === 'todos' ? '#FFFFFF' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  Todos ({obtenerFletesPorRegion(selectedRegion, cargasDb).length})
                </button>
                <button
                  type="button"
                  className="chip"
                  onClick={() => setFiltroTipo('rampa')}
                  style={{
                    fontSize: 11.5,
                    padding: '5px 10px',
                    fontWeight: filtroTipo === 'rampa' ? 800 : 500,
                    background: filtroTipo === 'rampa' ? 'var(--navy)' : 'var(--paper)',
                    color: filtroTipo === 'rampa' ? '#FFFFFF' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  Con Rampa
                </button>
                <button
                  type="button"
                  className="chip"
                  onClick={() => setFiltroTipo('frio')}
                  style={{
                    fontSize: 11.5,
                    padding: '5px 10px',
                    fontWeight: filtroTipo === 'frio' ? 800 : 500,
                    background: filtroTipo === 'frio' ? 'var(--navy)' : 'var(--paper)',
                    color: filtroTipo === 'frio' ? '#FFFFFF' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  Reefer / Frío
                </button>
                <button
                  type="button"
                  className="chip"
                  onClick={() => setFiltroTipo('pesado')}
                  style={{
                    fontSize: 11.5,
                    padding: '5px 10px',
                    fontWeight: filtroTipo === 'pesado' ? 800 : 500,
                    background: filtroTipo === 'pesado' ? 'var(--navy)' : 'var(--paper)',
                    color: filtroTipo === 'pesado' ? '#FFFFFF' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  Pesado (&ge;20T)
                </button>
              </div>
            </div>

            {/* Listado de Cargas de la Región con Postulación Táctica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fletesDisponibles.length === 0 ? (
                <div
                  className="glow-card"
                  style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    borderRadius: 16,
                  }}
                >
                  <Icon name="boxes" size={32} color="var(--slate-light)" />
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginTop: 8 }}>
                    No hay fletes con este filtro en {regionNames[selectedRegion]}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--slate)', margin: '4px 0 12px' }}>
                    Selecciona "Todos" o toca otra región en el mapa de calor.
                  </p>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setFiltroTipo('todos')}
                    style={{ margin: '0 auto', fontSize: 12 }}
                  >
                    Ver todos los fletes de {regionNames[selectedRegion]}
                  </button>
                </div>
              ) : (
                fletesDisponibles.map((flete) => {
                  const yaPostulado = estaPostulado(flete.id)

                  return (
                    <div
                      key={flete.id}
                      className="glow-card selectable"
                      style={{
                        padding: '15px 18px',
                        borderRadius: 16,
                        border: yaPostulado ? '1.5px solid #10B981' : '1px solid var(--card-glass-border)',
                        background: yaPostulado ? 'rgba(16, 185, 129, 0.05)' : 'var(--card-glass-bg)',
                      }}
                    >
                      <div className="between" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--slate)' }}>
                          {flete.empresa}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--navy)',
                            background: 'var(--navy-tint)',
                            padding: '2px 7px',
                            borderRadius: 6,
                          }}
                        >
                          {flete.fechaRetiro}
                        </span>
                      </div>

                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: -0.2 }}>
                        {flete.origen} <span style={{ color: 'var(--navy)' }}>➔</span> {flete.destino}
                      </div>

                      <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        <span className="pill pill-navy" style={{ fontSize: 11 }}>
                          <Icon name="boxes" size={12} />
                          {flete.tipoCarga}
                        </span>
                        <span className="pill" style={{ fontSize: 11, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                          <Icon name="weight" size={12} />
                          {(flete.pesoKg / 1000).toFixed(1)} Ton
                        </span>
                        <span className="pill" style={{ fontSize: 11, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                          <Icon name="route" size={12} />
                          {flete.distanciaKm} km
                        </span>
                        {flete.requiereFrio && (
                          <span className="pill pill-cyan" style={{ fontSize: 11 }}>
                            <Icon name="snow" size={12} />
                            Reefer Frío
                          </span>
                        )}
                        {flete.requiereRampa && (
                          <span className="pill pill-cyan" style={{ fontSize: 11 }}>
                            <Icon name="ruler" size={12} />
                            Rampa
                          </span>
                        )}
                      </div>

                      <div className="between" style={{ alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 800 }}>
                            Tarifa Referencial Estimada
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)' }}>
                            ${flete.precioClp.toLocaleString('es-CL')}
                          </div>
                        </div>

                        {yaPostulado ? (
                          <span
                            className="pill pill-green"
                            style={{
                              fontSize: 12,
                              padding: '8px 14px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Icon name="check" size={14} strokeWidth={2.5} />
                            Postulado con tu Camión ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handlePostular(flete)}
                            style={{
                              padding: '9px 18px',
                              fontSize: 13,
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, var(--navy) 0%, #0F2D59 100%)',
                              boxShadow: '0 0 14px -2px rgba(10, 25, 47, 0.35)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              cursor: 'pointer',
                            }}
                          >
                            <Star4Point size={13} color="#38BDF8" />
                            <span>Postular con mi Camión</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal de Postulación Directa con Camión */}
        <PostularCamionModal
          isOpen={modalPostularOpen}
          flete={fleteSeleccionado}
          camion={camion}
          onClose={() => setModalPostularOpen(false)}
          onSuccess={() => {
            setTriggerUpdate((c) => c + 1)
          }}
        />
      </div>
    </WebPlatformLayout>
  )
}
