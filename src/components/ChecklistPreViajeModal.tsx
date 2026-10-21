import { useState, useEffect } from 'react'
import {
  ITEMS_CHECKLIST_PREVIAJE,
  obtenerCertificadoPreViaje,
  guardarCertificadoPreViaje,
  type CertificadoPreViaje,
} from '../lib/preTripChecklistService'

interface ChecklistPreViajeModalProps {
  isOpen: boolean
  viajeId: string
  conductorNombre?: string
  patente?: string
  onClose: () => void
}

export function ChecklistPreViajeModal({
  isOpen,
  viajeId,
  conductorNombre = 'Conductor Profesional',
  patente = 'Camión NORTIA',
  onClose,
}: ChecklistPreViajeModalProps) {
  const [cert, setCert] = useState<CertificadoPreViaje | null>(null)
  const [seleccionados, setSeleccionados] = useState<Record<string, boolean>>({})
  const [observaciones, setObservaciones] = useState('')

  function cargar() {
    const c = obtenerCertificadoPreViaje(viajeId)
    setCert(c)
    if (c) {
      const mapa: Record<string, boolean> = {}
      c.itemsAprobados.forEach((id) => {
        mapa[id] = true
      })
      setSeleccionados(mapa)
      setObservaciones(c.observaciones || '')
    }
  }

  useEffect(() => {
    if (!isOpen) return
    cargar()

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_pretrip_updated', onUpdated)
    return () => window.removeEventListener('nortia_pretrip_updated', onUpdated)
  }, [isOpen, viajeId])

  if (!isOpen) return null

  function toggleItem(id: string) {
    if (cert?.aprobado) return
    setSeleccionados((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const itemsCompletados = ITEMS_CHECKLIST_PREVIAJE.filter((i) => seleccionados[i.id]).length
  const todosAprobados = itemsCompletados === ITEMS_CHECKLIST_PREVIAJE.length

  function handleGuardar() {
    const nuevo: CertificadoPreViaje = {
      viajeId,
      conductorNombre,
      patente,
      itemsAprobados: Object.keys(seleccionados).filter((k) => seleccionados[k]),
      observaciones: observaciones.trim() || undefined,
      aprobado: todosAprobados,
      fechaInspeccion: new Date().toISOString(),
    }
    guardarCertificadoPreViaje(viajeId, nuevo)
    setCert(nuevo)
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 480, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
              Prevención de Riesgos
            </div>
            <div className="h2" style={{ fontSize: 18, margin: 0 }}>
              Checklist Pre-Viaje («Vuelta del Perro»)
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
          Inspección visual de seguridad obligatoria antes de salir a carretera o ingresar a andenes de carga.
        </p>

        {/* Certificado Emitido si está Aprobado */}
        {cert?.aprobado && (
          <div
            className="card flat"
            style={{
              background: '#ECFDF5',
              border: '1.5px solid #10B981',
              padding: '14px 16px',
              borderRadius: 16,
              marginBottom: 14,
            }}
          >
            <div className="between">
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: '#065F46' }}>
                  Certificado de Inspección Válido
                </div>
                <div style={{ fontSize: 11, color: '#047857' }}>
                  {conductorNombre} · Patente: {patente}
                </div>
              </div>

              <span className="pill pill-green" style={{ fontSize: 10, fontWeight: 800 }}>
                APROBADO
              </span>
            </div>

            <div style={{ fontSize: 10.5, color: '#047857', marginTop: 6, borderTop: '1px solid #A7F3D0', paddingTop: 6 }}>
              Verificado el {new Date(cert.fechaInspeccion).toLocaleDateString('es-CL')} a las {new Date(cert.fechaInspeccion).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
            </div>
          </div>
        )}

        {/* Lista de Puntos de Verificación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '50vh', overflowY: 'auto', marginBottom: 14 }}>
          {ITEMS_CHECKLIST_PREVIAJE.map((item) => {
            const isChecked = Boolean(seleccionados[item.id])
            return (
              <div
                key={item.id}
                className="card flat selectable"
                style={{
                  padding: '12px 14px',
                  margin: 0,
                  border: isChecked ? '1.5px solid #10B981' : '1px solid var(--line)',
                  background: isChecked ? '#F0FDF4' : '#FFFFFF',
                  cursor: cert?.aprobado ? 'default' : 'pointer',
                }}
                onClick={() => toggleItem(item.id)}
              >
                <div className="between">
                  <div className="row" style={{ gap: 10 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: 'var(--paper)',
                        color: 'var(--slate)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {item.numero}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--ink)' }}>
                        {item.titulo}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2 }}>
                        {item.descripcion}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: isChecked ? '#10B981' : 'var(--paper)',
                      border: `1.5px solid ${isChecked ? '#10B981' : 'var(--line)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {isChecked ? '✓' : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Botón de Emisión / Guardado */}
        {!cert?.aprobado && (
          <button
            type="button"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              background: todosAprobados ? '#10B981' : 'var(--navy)',
            }}
            disabled={!todosAprobados}
            onClick={handleGuardar}
          >
            {todosAprobados ? 'Firmar y Emitir Certificado Pre-Viaje' : `Revisando (${itemsCompletados}/${ITEMS_CHECKLIST_PREVIAJE.length})`}
          </button>
        )}
      </div>
    </div>
  )
}
