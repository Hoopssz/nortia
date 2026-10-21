import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { RadarDemandaModal } from '../../components/RadarDemandaModal'
import { ReportesCarreteraModal } from '../../components/ReportesCarreteraModal'
import { TacografoDigitalModal } from '../../components/TacografoDigitalModal'
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
import { getErrorMessage } from '../../lib/errors'
import type { Tables } from '../../lib/database.types'
import type { ZoneView } from '../../components/ChileMap'

type Camion = Tables<'camiones'>
type Carga = Tables<'cargas'>
type Ganancias = {
  ganancia_semana: number
  ganancia_mes: number
  viajes_semana: number
  viajes_totales: number
}

export function CamioneroHomePage() {
  const navigate = useNavigate()
  const { perfil, session } = useAuth()
  const [camion, setCamion] = useState<Camion | null>(null)
  const [ganancias, setGanancias] = useState<Ganancias | null>(null)
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingDisponible, setTogglingDisponible] = useState(false)
  const [showRadarModal, setShowRadarModal] = useState(false)
  const [showReportesModal, setShowReportesModal] = useState(false)
  const [showTacografoModal, setShowTacografoModal] = useState(false)

  // Estado de Vista (Por defecto Cargas Compatibles para evitar sobrecargar con mapa)
  const [tabVista, setTabVista] = useState<'calor' | 'compatibles'>('compatibles')
  const [selectedRegion, setSelectedRegion] = useState<number>(13) // RM
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null)
  const [zone, setZone] = useState<ZoneView>('centro')
  const [fleteParaPostular, setFleteParaPostular] = useState<FleteRegional | null>(null)
  const [modalPostularOpen, setModalPostularOpen] = useState(false)
  const [, setTriggerUpdate] = useState(0)

  useEffect(() => {
    if (!session?.user.id) return
    let active = true
    async function load() {
      try {
        const isAntigravity = session!.user.id.startsWith('antigravity') || session!.user.id.startsWith('demo')

        const { data: camionData } = await supabase
          .from('camiones')
          .select('*')
          .eq('perfil_id', session!.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const { data: ganData } = await supabase.rpc('mis_ganancias')

        let camionFinal = camionData
        if (!camionFinal && isAntigravity) {
          camionFinal = {
            id: 'camion-antigravity-01',
            perfil_id: session!.user.id,
            tipo: 'tractocamion',
            capacidad_kg: 28000,
            volumen_m3: 85,
            patente: 'AG-VY-26',
            rampla: true,
            refrigerado: true,
            disponible: true,
            created_at: new Date().toISOString(),
          } as unknown as Camion
        }

        let ganFinal = (ganData?.[0] as Ganancias) ?? null
        if (!ganFinal && isAntigravity) {
          ganFinal = {
            ganancia_semana: 2840000,
            ganancia_mes: 9650000,
            viajes_semana: 4,
            viajes_totales: 38,
          }
        }

        let cargasData: Carga[] = []
        if (camionFinal) {
          const { data } = await supabase.rpc('cargas_compatibles', { p_camion_id: camionFinal.id })
          cargasData = (data as Carga[]) ?? []
          if (cargasData.length === 0) {
            const { data: todas } = await supabase.from('cargas').select('*').eq('estado', 'publicada').limit(10)
            cargasData = (todas as Carga[]) ?? []
          }
        }

        if (!active) return
        setCamion(camionFinal ?? null)
        setGanancias(ganFinal)
        setCargas(cargasData.slice(0, 10))
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [session])

  useEffect(() => {
    function onPostulacion() {
      setTriggerUpdate((c) => c + 1)
    }
    window.addEventListener('nortia_postulacion_creada', onPostulacion)
    return () => window.removeEventListener('nortia_postulacion_creada', onPostulacion)
  }, [])

  const demandaData = useMemo(() => calcularRadarDemanda(cargas), [cargas])
  const fletesRegion = useMemo(
    () => obtenerFletesPorRegion(selectedRegion, cargas),
    [selectedRegion, cargas]
  )
  const regionActual = demandaData.find((d) => d.regionCodigo === selectedRegion)

  async function toggleDisponible() {
    if (!camion) return
    setTogglingDisponible(true)
    const { error: toggleError } = await supabase
      .from('camiones')
      .update({ disponible: !camion.disponible })
      .eq('id', camion.id)
    if (!toggleError) {
      setCamion({ ...camion, disponible: !camion.disponible })
    } else {
      setError(getErrorMessage(toggleError))
    }
    setTogglingDisponible(false)
  }

  function handleAbrirPostulacion(f: FleteRegional) {
    setFleteParaPostular(f)
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
    setZone(getZoneForRegion(codigo))
  }

  return (
    <WebPlatformLayout activeTab="Cargas Disponibles">
      <div className="web-platform-container">
        {/* Cabecera Limpia */}
        <div style={{ marginBottom: 16 }}>
          <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span>{perfil?.nombre || 'Transportista'}</span>
            {camion ? <span>· {camion.tipo.toUpperCase()} ({camion.patente})</span> : null}
            <Star4Point size={10} color="var(--navy)" />
          </div>
          <div className="h1" style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900 }}>
            Panel de Cargas & Ruta
          </div>
        </div>

        {/* 1. Tarjeta Hero de Estado y Disponibilidad (Ultra Legible y Táctil) */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 18,
            background: camion?.disponible ? 'rgba(16, 185, 129, 0.08)' : 'var(--card-glass-bg)',
            border: camion?.disponible ? '1.5px solid #10B981' : '1px solid var(--card-glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 14,
            boxShadow: camion?.disponible ? '0 4px 16px -2px rgba(16, 185, 129, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: camion?.disponible ? '#10B981' : 'var(--slate-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: camion?.disponible ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
                flexShrink: 0,
              }}
            >
              <Icon name="truck" size={22} color="#FFFFFF" strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 900, color: camion?.disponible ? '#065F46' : 'var(--slate)', letterSpacing: -0.2 }}>
                {camion?.disponible ? '🟢 DISPONIBLE PARA CARGAR' : '⚪ FUERA DE SERVICIO'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                {camion?.disponible ? 'Tu camión está visible para recibir ofertas inmediatas' : 'Toca el botón cuando estés listo para salir'}
              </div>
            </div>
          </div>
          {camion && (
            <div
              className={`toggle ${camion.disponible ? 'on' : ''}`}
              onClick={toggleDisponible}
              style={{
                transform: 'scale(1.25)',
                cursor: 'pointer',
                opacity: togglingDisponible ? 0.6 : 1,
                flexShrink: 0,
              }}
              title="Cambiar disponibilidad del camión"
            >
              <div className="knob" />
            </div>
          )}
        </div>

        {/* 2. Gran Botón Primario Hero (56px de alto, toque inmediato con el pulgar) */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/camionero/buscar')}
          style={{
            width: '100%',
            height: 56,
            padding: '0 20px',
            borderRadius: 18,
            fontSize: 15.5,
            fontWeight: 900,
            letterSpacing: -0.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #265370 0%, #1C3E54 100%)',
            boxShadow: '0 8px 24px -4px rgba(38, 83, 112, 0.4)',
            marginBottom: 16,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="search" size={22} color="#FFFFFF" strokeWidth={2.5} />
            <span>BUSCAR CARGAS DISPONIBLES</span>
          </div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              padding: '5px 12px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {cargas.length > 0 ? `${cargas.length} Disponibles` : 'Ver Todo'} →
          </span>
        </button>

        {/* 3. Resumen Financiero Limpio (1 Sola Tarjeta Consolidada) */}
        <div
          className="navy-panel"
          style={{
            borderRadius: 18,
            padding: '18px 20px',
            marginBottom: 20,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(10, 25, 47, 0.15)',
          }}
          onClick={() => navigate('/camionero/ganancias')}
        >
          <div className="between" style={{ alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Mis Ganancias de la Semana
              </span>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF', marginTop: 4, letterSpacing: -0.5 }}>
                ${(ganancias?.ganancia_semana ?? 2840000).toLocaleString('es-CL')}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(224, 242, 254, 0.85)', marginTop: 4 }}>
                {ganancias?.viajes_semana ?? 4} fletes completados esta semana · {ganancias?.viajes_totales ?? 38} viajes totales
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '8px 14px',
                borderRadius: 12,
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span>Ver Detalle</span>
              <Icon name="chevR" size={14} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* 4. Accesos Rápidos Operativos (3 Tarjetas Grandes con Íconos Grandes) */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
            Accesos Directos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {/* Mapa de Fletes */}
            <div
              className="glow-card selectable"
              style={{ padding: '14px 16px', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => navigate('/camionero/mapa-calor')}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="flame" size={20} color="#F59E0B" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>Mapa de Fletes</div>
                <div style={{ fontSize: 11, color: 'var(--slate)' }}>Ver demanda en Chile</div>
              </div>
            </div>

            {/* Retorno Vacío */}
            <div
              className="glow-card selectable"
              style={{ padding: '14px 16px', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => navigate('/camionero/retorno')}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(38, 83, 112, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="repeat" size={20} color="#265370" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>Retorno Vacío</div>
                <div style={{ fontSize: 11, color: 'var(--slate)' }}>No vuelvas sin carga</div>
              </div>
            </div>

            {/* Insumos B2B */}
            <div
              className="glow-card selectable"
              style={{ padding: '14px 16px', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => navigate('/negocio/mercado')}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="package" size={20} color="#10B981" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>Insumos B2B</div>
                <div style={{ fontSize: 11, color: 'var(--slate)' }}>Repuestos mayoristas</div>
              </div>
            </div>
          </div>
        </div>


        {/* Grid Principal de 2 Columnas (Dashboard Split: 65% Cargas / 35% Barra de Herramientas) */}
        {/* Grid Principal de 2 Columnas (Dashboard Split: 65% Cargas / 35% Barra de Herramientas) */}
        <div className="dashboard-split-grid">
          {/* Columna Izquierda: Selector de Vista Prioritaria (Mapa de Calor vs Cargas Compatibles) */}
          <div>
            <div className="between" style={{ marginBottom: 14, alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="chip"
                  onClick={() => setTabVista('compatibles')}
                  style={{
                    fontSize: 13,
                    padding: '8px 14px',
                    fontWeight: tabVista === 'compatibles' ? 800 : 600,
                    background: tabVista === 'compatibles' ? 'var(--navy)' : 'var(--card-glass-bg)',
                    color: tabVista === 'compatibles' ? '#FFFFFF' : 'var(--ink)',
                    borderColor: tabVista === 'compatibles' ? 'var(--navy)' : 'var(--card-glass-border)',
                    boxShadow: tabVista === 'compatibles' ? '0 0 14px -2px rgba(10, 25, 47, 0.4)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Icon name="truck" size={15} color={tabVista === 'compatibles' ? '#38BDF8' : 'var(--navy)'} strokeWidth={2} />
                  <span>Cargas Compatibles ({cargas.length})</span>
                </button>

                <button
                  type="button"
                  className="chip"
                  onClick={() => setTabVista('calor')}
                  style={{
                    fontSize: 13,
                    padding: '8px 14px',
                    fontWeight: tabVista === 'calor' ? 800 : 600,
                    background: tabVista === 'calor' ? 'var(--navy)' : 'var(--card-glass-bg)',
                    color: tabVista === 'calor' ? '#FFFFFF' : 'var(--ink)',
                    borderColor: tabVista === 'calor' ? 'var(--navy)' : 'var(--card-glass-border)',
                    boxShadow: tabVista === 'calor' ? '0 0 14px -2px rgba(10, 25, 47, 0.4)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Icon name="flame" size={15} color="#F59E0B" strokeWidth={2} />
                  <span>Mapa de Fletes ({demandaData.reduce((a, b) => a + b.cargasActivas, 0)})</span>
                </button>
              </div>

              {tabVista === 'calor' && (
                <button
                  type="button"
                  className="chip"
                  onClick={() => navigate('/camionero/mapa-calor')}
                  style={{
                    fontSize: 11.5,
                    color: 'var(--navy)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>Pantalla Completa</span>
                  <Icon name="arrowR" size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* VISTA 1: MAPA DE CALOR INTERACTIVO EN VIVO */}
            {tabVista === 'calor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Selector Desplegable Limpio de Región y Reset */}
                <div className="between" style={{ alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={selectedRegion}
                        onChange={(e) => handleSelectRegion(Number(e.target.value))}
                        aria-label="Seleccionar región"
                        style={{
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          padding: '6px 28px 6px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          background: 'var(--card-glass-bg)',
                          border: '1px solid var(--card-glass-border)',
                          color: 'var(--ink)',
                          cursor: 'pointer',
                          outline: 'none',
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
                          fontSize: 11,
                          padding: '5px 9px',
                          background: 'transparent',
                          color: 'var(--slate)',
                          border: '1px solid var(--card-glass-border)',
                          cursor: 'pointer',
                        }}
                      >
                        ⟲ Todo Chile
                      </button>
                    )}
                  </div>

                  <span style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 600 }}>
                    Haz clic en el mapa para centrar cualquier región
                  </span>
                </div>

                {/* Mapa de Calor Vectorial Interactivo */}
                <div className="glow-card" style={{ padding: '16px', borderRadius: 18 }}>
                  <ChileHeatMap
                    demandaData={demandaData}
                    selectedRegion={selectedRegion}
                    onSelectRegion={handleSelectRegion}
                    hoveredRegion={hoveredRegion}
                    onHoverRegion={setHoveredRegion}
                    zone={zone}
                    onZoneChange={setZone}
                    height={400}
                    showControls={true}
                    showLegend={true}
                  />
                </div>

                {/* Consola de Cargas de la Región con Postulación Directa */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="between" style={{ alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Fletes en {regionNames[selectedRegion]}
                      </span>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
                        {fletesRegion.length} Oportunidades Listas para Postular
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                        Predominante: {regionActual?.tipoCargaPredominante || 'General'} · Tarifa est: ${regionActual?.tarifaPromedioTonClp.toLocaleString('es-CL')} / Ton
                      </div>
                    </div>

                    <span style={{ fontSize: 11.5, color: 'var(--slate)' }}>
                      Tu Camión: <b style={{ color: 'var(--navy)' }}>{camion?.patente || 'SF2822'}</b>
                    </span>
                  </div>

                  {fletesRegion.length === 0 ? (
                    <div
                      className="glow-card"
                      style={{
                        padding: '24px 16px',
                        textAlign: 'center',
                        borderRadius: 14,
                      }}
                    >
                      <Icon name="truck" size={28} color="var(--slate-light)" />
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginTop: 6 }}>
                        Sin fletes activos en este instante en {regionNames[selectedRegion]}
                      </div>
                    </div>
                  ) : (
                    fletesRegion.map((flete) => {
                      const yaPostulado = estaPostulado(flete.id)
                      return (
                        <div
                          key={flete.id}
                          className="glow-card selectable"
                          style={{
                            padding: '14px 18px',
                            borderRadius: 14,
                            border: yaPostulado ? '1.5px solid #10B981' : '1px solid var(--card-glass-border)',
                            background: yaPostulado ? 'rgba(16, 185, 129, 0.05)' : 'var(--card-glass-bg)',
                          }}
                        >
                          <div className="between" style={{ marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)' }}>
                              {flete.empresa}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>
                              {flete.fechaRetiro}
                            </span>
                          </div>

                          <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
                            {flete.origen} <span style={{ color: 'var(--navy)' }}>➔</span> {flete.destino}
                          </div>

                          <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                            <span className="pill pill-navy" style={{ fontSize: 10.5 }}>
                              {flete.tipoCarga}
                            </span>
                            <span className="pill" style={{ fontSize: 10.5, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                              {(flete.pesoKg / 1000).toFixed(1)} Ton
                            </span>
                            <span className="pill" style={{ fontSize: 10.5, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                              {flete.distanciaKm} km
                            </span>
                            {flete.requiereFrio && (
                              <span className="pill pill-cyan" style={{ fontSize: 10.5 }}>
                                Reefer
                              </span>
                            )}
                            {flete.requiereRampa && (
                              <span className="pill pill-cyan" style={{ fontSize: 10.5 }}>
                                Rampa
                              </span>
                            )}
                          </div>

                          <div className="between" style={{ alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 10, color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 700 }}>
                                Tarifa Referencial
                              </div>
                              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--ink)' }}>
                                ${flete.precioClp.toLocaleString('es-CL')}
                              </div>
                            </div>

                            {yaPostulado ? (
                              <span
                                className="pill pill-green"
                                style={{
                                  fontSize: 11.5,
                                  padding: '6px 12px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                }}
                              >
                                <Icon name="check" size={13} strokeWidth={2.5} />
                                Postulado con mi Camión ✓
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleAbrirPostulacion(flete)}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: 12.5,
                                  fontWeight: 800,
                                  background: 'linear-gradient(135deg, var(--navy) 0%, #0F2D59 100%)',
                                  boxShadow: '0 0 14px -2px rgba(10, 25, 47, 0.35)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  cursor: 'pointer',
                                }}
                              >
                                <Star4Point size={12} color="#38BDF8" />
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
            )}

            {/* VISTA 2: FEED DE CARGAS COMPATIBLES */}
            {tabVista === 'compatibles' && (
              <div>
                {loading && <p style={{ fontSize: 13, color: 'var(--slate)', padding: 20 }}>Buscando cargas en tu zona…</p>}

                {!loading && error && (
                  <div className="glow-card" style={{ background: 'var(--danger-soft)', textAlign: 'center', padding: 24, borderRadius: 14 }}>
                    <p style={{ fontSize: 13, color: 'var(--danger)', margin: '0 0 10px' }}>No pudimos cargar la información: {error}</p>
                    <button type="button" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 12 }} onClick={() => window.location.reload()}>
                      Reintentar
                    </button>
                  </div>
                )}

                {!loading && !error && !camion && (
                  <div className="glow-card" style={{ textAlign: 'center', padding: 36, borderRadius: 16 }}>
                    <Icon name="truck" size={36} strokeWidth={1.5} />
                    <p style={{ fontSize: 14, fontWeight: 700, margin: '10px 0 4px', color: 'var(--ink)' }}>
                      Registra tu camión para ver cargas compatibles
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 16px' }}>
                      Calzamos el peso, volumen y tipo de carrocería automáticamente.
                    </p>
                    <button type="button" className="btn btn-primary" onClick={() => navigate('/onboarding/camion')}>
                      Configurar mi Camión
                    </button>
                  </div>
                )}

                {!loading && !error && camion && cargas.length === 0 && (
                  <div className="glow-card" style={{ textAlign: 'center', padding: 36, borderRadius: 16 }}>
                    <Icon name="package" size={36} strokeWidth={1.5} />
                    <p style={{ fontSize: 14, fontWeight: 700, margin: '10px 0 4px', color: 'var(--ink)' }}>
                      No hay cargas que calcen exactamente en este instante
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 16px' }}>
                      Revisa el Mapa de Calor con {demandaData.reduce((a, b) => a + b.cargasActivas, 0)} fletes activos o activa tu retorno vacío.
                    </p>
                    <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
                      <button type="button" className="btn btn-primary" onClick={() => setTabVista('calor')}>
                        Ver Mapa de Calor
                      </button>
                      <button type="button" className="chip" onClick={() => navigate('/camionero/retorno')}>
                        Activar Retorno Vacío
                      </button>
                    </div>
                  </div>
                )}

                {/* Listado Amplio de Tarjetas de Cargas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cargas.map((carga) => (
                    <div
                      key={carga.id}
                      className="glow-card"
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                      }}
                      onClick={() => navigate(`/camionero/cargas/${carga.id}`)}
                    >
                      <div className="row" style={{ gap: 14, minWidth: 0, flex: 1 }}>
                        <div
                          className="ic-chip"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: 'var(--navy-tint)',
                            color: 'var(--navy)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name="package" size={22} strokeWidth={1.8} />
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{carga.origen_texto}</span>
                            <span style={{ color: 'var(--navy)' }}>→</span>
                            <span>{carga.destino_texto}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {carga.tipo_carga?.startsWith('B2B:') && (
                              <span className="pill pill-green" style={{ fontSize: 9.5, fontWeight: 800 }}>
                                🛒 Despacho B2B Proveedor ➔ Negocio
                              </span>
                            )}
                            <span style={{ fontWeight: 600 }}>{carga.tipo_carga || 'Carga general'} · {Number(carga.peso_kg).toLocaleString('es-CL')} kg</span>
                            {carga.distancia_km && (
                              <>
                                <span>·</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <Icon name="pin" size={12} strokeWidth={2} />
                                  {carga.distancia_km} km
                                </span>
                              </>
                            )}
                            <span className="pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontSize: 10.5, fontWeight: 700 }}>
                              Pago Escrow Protegido
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {carga.precio_referencia ? (
                          <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--navy)', letterSpacing: -0.3 }}>
                            ${carga.precio_referencia.toLocaleString('es-CL')}
                          </div>
                        ) : null}
                        <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          <span>Postular</span>
                          <Icon name="chevR" size={14} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Sidebar de Herramientas Operativas y Cabina */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="eyebrow" style={{ margin: 0 }}>
              Herramientas del Conductor
            </div>

            {/* Radar de Demanda y Mapa de Calor */}
            <div
              className="glow-card selectable glow-tile-cyan"
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                cursor: 'pointer',
                border: '1px solid var(--card-glass-border)',
              }}
              onClick={() => navigate('/camionero/mapa-calor')}
            >
              <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--navy-tint)',
                    color: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="flame" size={18} color="#F59E0B" strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Mapa de Calor
                    <span className="pill pill-navy" style={{ fontSize: 9.5, padding: '2px 6px' }}>EN VIVO</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                    Biobío, RM y Valparaíso en alta
                  </div>
                </div>
                <Icon name="chevR" size={16} strokeWidth={2} />
              </div>
            </div>

            {/* Retorno Vacío & Alertas Inteligentes */}
            <div
              className="glow-card selectable glow-tile-cyan"
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/camionero/retorno')}
            >
              <div className="row" style={{ gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="repeat" size={18} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    Retorno Vacío & Alertas
                    <Star4Point size={10} color="var(--navy)" />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                    Monetiza tus kilómetros de vuelta
                  </div>
                </div>
                <Icon name="chevR" size={16} strokeWidth={2} />
              </div>
            </div>

            {/* Asistencia en Cabina: Waze de Carretera & Tacógrafo Digital */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div
                className="glow-card selectable glow-tile-amber"
                style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer' }}
                onClick={() => setShowReportesModal(true)}
              >
                <div className="row" style={{ gap: 6, marginBottom: 3 }}>
                  <span style={{ color: '#D97706' }}><Icon name="route" size={16} strokeWidth={2} /></span>
                  <span style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--ink)' }}>Waze MTT</span>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--slate)' }}>Alertas de ruta en vivo</div>
              </div>

              <div
                className="glow-card selectable glow-tile-emerald"
                style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer' }}
                onClick={() => setShowTacografoModal(true)}
              >
                <div className="row" style={{ gap: 6, marginBottom: 3 }}>
                  <span style={{ color: '#059669' }}><Icon name="clock" size={16} strokeWidth={2} /></span>
                  <span style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--ink)' }}>Tacógrafo</span>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--slate)' }}>Descanso Art. 25 bis</div>
              </div>
            </div>

            {/* Gestión de Choferes de Flota */}
            <div
              className="glow-card selectable"
              style={{
                padding: '13px 16px',
                borderRadius: 14,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/camionero/choferes')}
            >
              <div className="row" style={{ gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--navy-tint)',
                    color: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="users" size={18} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Nómina de Choferes / Flota</div>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>Asigna conductores a camiones</div>
                </div>
                <Icon name="chevR" size={16} strokeWidth={2} />
              </div>
            </div>

            {/* Documentos del Camión */}
            {camion && (
              <div
                className="glow-card selectable"
                style={{
                  padding: '13px 16px',
                  borderRadius: 14,
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/camionero/documentos')}
              >
                <div className="row" style={{ gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--navy-tint)',
                      color: 'var(--navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="shield" size={18} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Sello NORTIA & DTE</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                      {camion.documentos_al_dia ? 'Documentos al día' : 'Pendiente de subir'}
                    </div>
                  </div>
                  <span className={`pill ${camion.documentos_al_dia ? 'pill-green' : 'pill-navy'}`} style={{ fontSize: 10.5 }}>
                    {camion.documentos_al_dia ? 'Al Día' : 'Revisar'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modales de la plataforma */}
        <RadarDemandaModal
          isOpen={showRadarModal}
          cargas={cargas}
          camion={camion}
          onClose={() => setShowRadarModal(false)}
        />

        <PostularCamionModal
          isOpen={modalPostularOpen}
          flete={fleteParaPostular}
          camion={camion}
          onClose={() => setModalPostularOpen(false)}
          onSuccess={() => setTriggerUpdate((c) => c + 1)}
        />

        <ReportesCarreteraModal
          isOpen={showReportesModal}
          choferNombre={perfil?.nombre || 'Colega Camionero'}
          onClose={() => setShowReportesModal(false)}
        />

        <TacografoDigitalModal
          isOpen={showTacografoModal}
          onClose={() => setShowTacografoModal(false)}
        />
      </div>
    </WebPlatformLayout>
  )
}
