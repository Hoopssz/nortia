import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from './Icon'
import { ChileHeatMap } from './ChileHeatMap'
import { PostularCamionModal } from './PostularCamionModal'
import {
  calcularRadarDemanda,
  obtenerFletesPorRegion,
  estaPostulado,
  type FleteRegional,
} from '../lib/demandRadarService'
import { regionNames } from '../lib/chileRegions'
import type { ZoneView } from './ChileMap'
import type { Tables } from '../lib/database.types'

type Camion = Tables<'camiones'>

interface RadarDemandaModalProps {
  isOpen: boolean
  cargas?: Tables<'cargas'>[]
  camion?: Camion | null
  onClose: () => void
}

export function RadarDemandaModal({
  isOpen,
  cargas = [],
  camion = null,
  onClose,
}: RadarDemandaModalProps) {
  const navigate = useNavigate()
  const [selectedRegion, setSelectedRegion] = useState<number>(13) // Default RM
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null)
  const [zone, setZone] = useState<ZoneView>('centro')
  const [fleteParaPostular, setFleteParaPostular] = useState<FleteRegional | null>(null)
  const [modalPostularOpen, setModalPostularOpen] = useState(false)
  const [, setTriggerUpdate] = useState(0)

  const dataDemanda = useMemo(() => calcularRadarDemanda(cargas), [cargas])
  const fletesRegion = useMemo(
    () => obtenerFletesPorRegion(selectedRegion, cargas),
    [selectedRegion, cargas]
  )

  if (!isOpen) return null

  const regionActualData = dataDemanda.find((d) => d.regionCodigo === selectedRegion)

  function handleAbrirPostulacion(f: FleteRegional) {
    setFleteParaPostular(f)
    setModalPostularOpen(true)
  }

  return (
    <div className="apple-modal-overlay" style={{ zIndex: 100 }}>
      <div
        className="apple-modal-sheet glow-card"
        style={{
          maxWidth: 980,
          width: '95%',
          maxHeight: '92vh',
          padding: '22px 24px',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Superior */}
        <div className="between" style={{ marginBottom: 14, alignItems: 'center' }}>
          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px -2px rgba(10, 25, 47, 0.4)',
              }}
            >
              <Icon name="flame" size={20} color="#38BDF8" strokeWidth={2} />
            </div>
            <div>
              <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <span>Radar Térmico NORTIA</span>
                <Star4Point size={10} color="var(--navy)" />
              </div>
              <div className="h2" style={{ fontSize: 18, margin: 0, fontWeight: 800 }}>
                Mapa de Calor de Demanda y Fletes en Chile
              </div>
            </div>
          </div>

          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="chip"
              onClick={() => {
                onClose()
                navigate('/camionero/mapa-calor')
              }}
              style={{
                fontSize: 12,
                padding: '6px 12px',
                fontWeight: 700,
                color: 'var(--navy)',
                cursor: 'pointer',
              }}
            >
              <Icon name="eye" size={13} />
              <span>Pantalla Completa</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'var(--card-glass-bg)',
                border: '1px solid var(--card-glass-border)',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: 'var(--slate)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido Principal: Mapa Térmico (Izquierda) + Consola de Postulación (Derecha) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            overflowY: 'auto',
            paddingRight: 4,
            flex: 1,
          }}
          className="two-col-grid"
        >
          {/* Columna Izquierda: Mapa de Calor Vectorial */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Toca una región para explorar fletes activos
            </div>
            <ChileHeatMap
              demandaData={dataDemanda}
              selectedRegion={selectedRegion}
              onSelectRegion={(r) => setSelectedRegion(r)}
              hoveredRegion={hoveredRegion}
              onHoverRegion={setHoveredRegion}
              zone={zone}
              onZoneChange={setZone}
              height={420}
              showControls={true}
              showLegend={true}
            />
          </div>

          {/* Columna Derecha: Panel de Cargas y Postulación con Camión */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Información y Filtro de Región Seleccionada */}
            <div
              style={{
                background: 'var(--card-glass-bg)',
                border: '1px solid var(--card-glass-border)',
                borderRadius: 16,
                padding: '14px 16px',
              }}
            >
              <div className="between" style={{ alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Región Seleccionada
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)' }}>
                    {regionNames[selectedRegion]}
                  </div>
                </div>

                <span className="pill pill-navy" style={{ fontSize: 11 }}>
                  <Icon name="truck" size={12} />
                  {fletesRegion.length} Cargas Disponibles
                </span>
              </div>

              <div className="row" style={{ gap: 12, marginTop: 8, fontSize: 11.5, color: 'var(--slate)' }}>
                <span><b>Carga dominante:</b> {regionActualData?.tipoCargaPredominante || 'General'}</span>
                <span>·</span>
                <span><b>Tarifa promedio:</b> ${regionActualData?.tarifaPromedioTonClp.toLocaleString('es-CL')} / Ton</span>
              </div>
            </div>

            {/* Lista de Fletes Disponibles en la Región */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="between" style={{ alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Fletes Disponibles para Postular
                </span>
                <span style={{ fontSize: 11, color: 'var(--slate)' }}>
                  Camión: <b>{camion?.patente || 'SF2822'}</b>
                </span>
              </div>

              {fletesRegion.length === 0 ? (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'var(--paper)',
                    borderRadius: 12,
                    border: '1px dashed var(--line)',
                  }}
                >
                  <Icon name="truck" size={28} color="var(--slate-light)" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginTop: 6 }}>
                    No hay fletes spot en esta región en este instante
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--slate)', margin: '4px 0 0' }}>
                    Toca otra región en el mapa de calor (ej. Valparaíso o Metropolitana)
                  </p>
                </div>
              ) : (
                fletesRegion.map((flete) => {
                  const yaPostulado = estaPostulado(flete.id)
                  return (
                    <div
                      key={flete.id}
                      className="glow-card selectable"
                      style={{
                        padding: '13px 15px',
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

                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
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
                          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>
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
                            Postulado ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleAbrirPostulacion(flete)}
                            style={{
                              padding: '7px 14px',
                              fontSize: 12,
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, var(--navy) 0%, #0F2D59 100%)',
                              boxShadow: '0 0 12px -2px rgba(10, 25, 47, 0.35)',
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
        </div>

        {/* Modal de Confirmación de Postulación */}
        <PostularCamionModal
          isOpen={modalPostularOpen}
          flete={fleteParaPostular}
          camion={camion}
          onClose={() => setModalPostularOpen(false)}
          onSuccess={() => {
            setTriggerUpdate((c) => c + 1)
          }}
        />
      </div>
    </div>
  )
}
