import { useState, useEffect } from 'react'
import {
  obtenerRegistroEstadia,
  iniciarRegistroEstadia,
  finalizarRegistroEstadia,
  calcularCompensacionEstadia,
  type RegistroEstadia,
} from '../lib/detentionService'

interface RelojEstadiaModalProps {
  isOpen: boolean
  viajeId: string
  esCamionero: boolean
  onClose: () => void
}

export function RelojEstadiaModal({
  isOpen,
  viajeId,
  esCamionero,
  onClose,
}: RelojEstadiaModalProps) {
  const [registro, setRegistro] = useState<RegistroEstadia>(obtenerRegistroEstadia(viajeId))
  const [, setTick] = useState(0)

  function cargar() {
    setRegistro(obtenerRegistroEstadia(viajeId))
  }

  useEffect(() => {
    if (!isOpen) return
    cargar()

    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_detention_updated', onUpdated)
    return () => {
      clearInterval(interval)
      window.removeEventListener('nortia_detention_updated', onUpdated)
    }
  }, [isOpen, viajeId])

  if (!isOpen) return null

  const comp = calcularCompensacionEstadia(registro)
  const horasTotales = Math.floor(comp.minutosTotales / 60)
  const minsTotales = comp.minutosTotales % 60

  const horasExceso = Math.floor(comp.minutosExceso / 60)
  const minsExceso = comp.minutosExceso % 60

  function handleIniciar() {
    const nuevo = iniciarRegistroEstadia(viajeId)
    setRegistro(nuevo)
  }

  function handleFinalizar() {
    const final = finalizarRegistroEstadia(viajeId)
    setRegistro(final)
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 460, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
              Control en Andén
            </div>
            <div className="h2" style={{ fontSize: 18, margin: 0 }}>
              Reloj de Estadía en Bodega
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px' }}>
          Monitorea los tiempos de espera para carga/descarga. Las primeras <b>2 horas son de cortesía gratuita</b>; superado ese plazo se liquida compensación por hora.
        </p>

        {/* Estado del Cronómetro */}
        {!registro.llegadaBodega ? (
          <div
            className="card flat"
            style={{
              background: 'var(--paper)',
              border: '1.5px dashed var(--line)',
              padding: '24px 16px',
              borderRadius: 18,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>
              Camión en Tránsito (Fuera de Bodega)
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 14 }}>
              Al ingresar a la planta o centro de distribución, presiona el botón para registrar la estampa oficial de llegada.
            </div>

            {esCamionero && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--navy)' }}
                onClick={handleIniciar}
              >
                Registrar Llegada a Bodega
              </button>
            )}
          </div>
        ) : (
          <div
            className="card flat"
            style={{
              background: comp.enCortesía ? 'var(--navy-tint)' : '#FEF2F2',
              border: `1.5px solid ${comp.enCortesía ? 'var(--navy-tint-2)' : '#FCA5A5'}`,
              padding: '18px 20px',
              borderRadius: 18,
              marginBottom: 16,
            }}
          >
            <div className="between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)' }}>
                TIEMPO TOTAL EN ANDÉN
              </span>
              <span
                className={`pill ${comp.enCortesía ? 'pill-green' : 'pill-red'}`}
                style={{ fontSize: 10.5, fontWeight: 800 }}
              >
                {comp.enCortesía ? 'En Cortesía Gratuita' : 'Generando Estadía'}
              </span>
            </div>

            <div style={{ fontSize: 32, fontWeight: 900, color: comp.enCortesía ? 'var(--navy)' : '#DC2626', margin: '4px 0' }}>
              {horasTotales}h {minsTotales < 10 ? `0${minsTotales}` : minsTotales}m
            </div>

            <div style={{ fontSize: 11.5, color: 'var(--slate)', marginBottom: 12 }}>
              Llegada registrada: <b>{new Date(registro.llegadaBodega).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs</b>
            </div>

            {/* Panel de Compensación */}
            {!comp.enCortesía && (
              <div
                className="card flat"
                style={{
                  background: '#FFFFFF',
                  padding: '12px',
                  borderRadius: 12,
                  border: '1px solid #FECDD3',
                  marginBottom: 10,
                }}
              >
                <div className="between">
                  <div>
                    <div style={{ fontSize: 10.5, color: 'var(--slate)' }}>Exceso de espera:</div>
                    <div style={{ fontWeight: 800, fontSize: 12.5, color: '#DC2626' }}>
                      {horasExceso}h {minsExceso}m extras
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--slate)' }}>Compensación generada:</div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: '#DC2626' }}>
                      +${comp.montoCompensacionClp.toLocaleString('es-CL')} CLP
                    </div>
                  </div>
                </div>
              </div>
            )}

            {registro.activo && esCamionero && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px', fontSize: 12, borderRadius: 10, fontWeight: 700 }}
                onClick={handleFinalizar}
              >
                Registrar Salida de Bodega
              </button>
            )}

            {registro.salidaBodega && (
              <div style={{ fontSize: 11, color: '#15803D', fontWeight: 700, textAlign: 'center', marginTop: 6 }}>
                ✓ Estadía finalizada a las {new Date(registro.salidaBodega).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
              </div>
            )}
          </div>
        )}

        {/* Tarifa y Términos */}
        <div
          className="card flat"
          style={{
            background: 'var(--paper)',
            padding: '12px 14px',
            borderRadius: 14,
            fontSize: 11,
            color: 'var(--slate)',
            lineHeight: 1.4,
          }}
        >
          <b>Tarifa estándar NORTIA:</b> $18.000 CLP por hora de demora a partir de la 2ª hora de espera en andén, con estampa horaria y geolocalización verificada.
        </div>
      </div>
    </div>
  )
}
