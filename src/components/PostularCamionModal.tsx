import { useState, useEffect } from 'react'
import { Icon, Star4Point } from './Icon'
import {
  type FleteRegional,
  registrarPostulacionFlete,
} from '../lib/demandRadarService'
import { useAuth } from '../contexts/useAuth'
import type { Tables } from '../lib/database.types'

type Camion = Tables<'camiones'>

interface PostularCamionModalProps {
  isOpen: boolean
  flete: FleteRegional | null
  camion: Camion | null
  onClose: () => void
  onSuccess?: (fleteId: string) => void
}

export function PostularCamionModal({
  isOpen,
  flete,
  camion,
  onClose,
  onSuccess,
}: PostularCamionModalProps) {
  const { session } = useAuth()
  const [precio, setPrecio] = useState<number>(0)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (flete) {
      setPrecio(flete.precioClp)
      setMensaje(`Disponible para retirar con equipo ${camion?.patente || 'SF2822'}. Cumple todos los requisitos de carga.`)
      setExito(false)
      setError(null)
    }
  }, [flete, camion])

  if (!isOpen || !flete) return null

  const camionPatente = camion?.patente || 'SF2822'
  const camionTipo = camion?.tipo ? camion.tipo.replace('_', ' ').toUpperCase() : 'TRACTO CON RAMPLA'
  const camionCapacidad = camion?.carga_max_kg ? (camion.carga_max_kg / 1000).toFixed(1) : '28.0'

  async function handleConfirmar() {
    if (!flete) return
    setEnviando(true)
    setError(null)

    const userId = session?.user.id || 'usr-camionero-demo'
    const camionId = camion?.id || 'cam-demo-sf2822'

    const res = await registrarPostulacionFlete({
      fleteId: flete.id,
      camioneroId: userId,
      camionId,
      precio,
      mensaje,
      esRealDb: flete.esRealDb,
    })

    setEnviando(false)

    if (res.ok) {
      setExito(true)
      onSuccess?.(flete.id)
      setTimeout(() => {
        onClose()
      }, 1600)
    } else {
      setError(res.error || 'Error al postular. Intenta nuevamente.')
    }
  }

  function ajustarPrecio(delta: number) {
    setPrecio((prev) => Math.max(50000, prev + delta))
  }

  return (
    <div className="apple-modal-overlay" style={{ zIndex: 120 }}>
      <div
        className="apple-modal-sheet glow-card"
        style={{
          maxWidth: 540,
          width: '100%',
          padding: '24px 24px 22px',
          borderRadius: 22,
          position: 'relative',
        }}
      >
        {/* Cabecera del Modal */}
        <div className="between" style={{ marginBottom: 16, alignItems: 'flex-start' }}>
          <div className="row" style={{ gap: 10 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px -2px rgba(10, 25, 47, 0.4)',
              }}
            >
              <Icon name="truck" size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <span>Postulación Táctica Directa</span>
                <Star4Point size={10} color="var(--navy)" />
              </div>
              <div className="h2" style={{ fontSize: 19, margin: '2px 0 0', fontWeight: 800, letterSpacing: -0.3 }}>
                Postular con tu Camión
              </div>
            </div>
          </div>

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

        {/* Banner de Éxito al Postular */}
        {exito ? (
          <div
            style={{
              padding: '28px 20px',
              textAlign: 'center',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1.5px solid #10B981',
              borderRadius: 16,
              animation: 'appleCardEnter 0.25s ease both',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 0 20px -2px #10B981',
              }}
            >
              <Icon name="check" size={28} strokeWidth={2.5} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
              ¡Postulación Enviada con Éxito!
            </div>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '8px 0 0' }}>
              Tu camión <b>{camionPatente}</b> quedó postulado para este flete. La empresa <b>{flete.empresa}</b> ha sido notificada al instante.
            </p>
          </div>
        ) : (
          <>
            {/* Tarjeta Resumen del Flete */}
            <div
              style={{
                background: 'var(--paper-2)',
                borderRadius: 14,
                padding: '14px 16px',
                marginBottom: 16,
                border: '1px solid var(--line)',
              }}
            >
              <div className="between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {flete.regionNombre} · {flete.urgencia.toUpperCase()}
                </span>
                <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600 }}>
                  {flete.distanciaKm} km aprox.
                </span>
              </div>

              <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                {flete.origen} <span style={{ color: 'var(--navy)' }}>➔</span> {flete.destino}
              </div>

              <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <span className="pill pill-navy" style={{ fontSize: 11 }}>
                  <Icon name="boxes" size={12} />
                  {flete.tipoCarga}
                </span>
                <span className="pill" style={{ fontSize: 11, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                  <Icon name="weight" size={12} />
                  {(flete.pesoKg / 1000).toFixed(1)} Ton
                </span>
                {flete.requiereRampa && (
                  <span className="pill pill-cyan" style={{ fontSize: 11 }}>
                    <Icon name="ruler" size={12} />
                    Rampa
                  </span>
                )}
                {flete.requiereFrio && (
                  <span className="pill pill-cyan" style={{ fontSize: 11 }}>
                    <Icon name="snow" size={12} />
                    Reefer Frío
                  </span>
                )}
              </div>
            </div>

            {/* Ficha del Camión Asignado */}
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 14,
                padding: '12px 16px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--navy)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="truck" size={18} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Camión Postulante
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
                    {camionTipo} · <span style={{ color: 'var(--navy)' }}>{camionPatente}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="pill pill-green" style={{ fontSize: 10.5 }}>
                  <Icon name="shield" size={11} />
                  Sello Al Día
                </span>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 3 }}>
                  Cap: {camionCapacidad} Ton
                </div>
              </div>
            </div>

            {/* Configuración de Tarifa Líquida */}
            <div style={{ marginBottom: 16 }}>
              <div className="between" style={{ marginBottom: 6, alignItems: 'center' }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
                  Tu Tarifa de Flete a Cobrar:
                </label>
                <span style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 800 }}>
                  Ref: ${flete.precioClp.toLocaleString('es-CL')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => ajustarPrecio(-50000)}
                  style={{
                    height: 48,
                    padding: '0 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--line)',
                    background: 'var(--card-glass-bg)',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                  title="Bajar 50 mil pesos"
                >
                  – $50k
                </button>

                <div style={{ position: 'relative', flex: 1 }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 18,
                      fontWeight: 900,
                      color: 'var(--slate)',
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: 48,
                      padding: '0 14px 0 30px',
                      borderRadius: 12,
                      border: '1.5px solid var(--navy)',
                      fontSize: 19,
                      fontWeight: 900,
                      color: '#070E1B',
                      background: 'var(--paper)',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => ajustarPrecio(50000)}
                  style={{
                    height: 48,
                    padding: '0 14px',
                    borderRadius: 12,
                    border: '1.5px solid var(--line)',
                    background: 'var(--card-glass-bg)',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                  title="Subir 50 mil pesos"
                >
                  + $50k
                </button>
              </div>
            </div>

            {/* Mensaje Opcional de Disponibilidad */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 5 }}>
                Nota de llegada para el cliente (opcional):
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1.5px solid var(--line)',
                  fontSize: 13,
                  color: 'var(--ink)',
                  background: 'var(--paper)',
                  resize: 'none',
                  outline: 'none',
                }}
                placeholder="Indica cuándo puedes cargar o detalles de tu rampla..."
              />
            </div>

            {error && (
              <div style={{ color: '#EF4444', fontSize: 12.5, marginBottom: 12, fontWeight: 700 }}>
                {error}
              </div>
            )}

            {/* Botón Principal Hero (54px de alto) */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                className="chip"
                onClick={onClose}
                disabled={enviando}
                style={{ height: 54, padding: '0 18px', fontSize: 13.5, cursor: 'pointer', borderRadius: 14 }}
              >
                Volver
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmar}
                disabled={enviando || precio <= 0}
                style={{
                  flex: 1,
                  height: 54,
                  fontSize: 15,
                  fontWeight: 900,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%)',
                  boxShadow: '0 6px 20px -2px rgba(10, 25, 47, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: enviando ? 'wait' : 'pointer',
                }}
              >
                <Star4Point size={15} color="#38BDF8" />
                <span>{enviando ? 'Enviando...' : `POSTULAR ($${precio.toLocaleString('es-CL')})`}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
