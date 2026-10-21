import { useState, useEffect } from 'react'
import {
  TIPOS_INCIDENCIA_LABEL,
  guardarIncidencia,
  obtenerIncidencia,
  resolverIncidencia,
  type TipoIncidencia,
  type IncidenciaRuta,
} from '../lib/incidentService'

interface SosModalProps {
  isOpen: boolean
  viajeId: string
  cargaId: string
  origenTexto: string
  destinoTexto: string
  onClose: () => void
  onIncidenciaActualizada: (incidencia: IncidenciaRuta | null) => void
}

const RETRASOS_OPCIONES = [
  '30 a 45 minutos',
  '1 a 2 horas',
  '2 a 4 horas',
  'Más de 4 horas (en espera de grúa)',
]

export function SosModal({
  isOpen,
  viajeId,
  cargaId,
  origenTexto,
  destinoTexto,
  onClose,
  onIncidenciaActualizada,
}: SosModalProps) {
  const [incidenciaActiva, setIncidenciaActiva] = useState<IncidenciaRuta | null>(null)
  const [tipo, setTipo] = useState<TipoIncidencia>('pana_mecanica')
  const [retraso, setRetraso] = useState('1 a 2 horas')
  const [ubicacionAprox, setUbicacionAprox] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [msgExito, setMsgExito] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const inc = obtenerIncidencia(viajeId)
    if (inc && inc.estado === 'activa') {
      setIncidenciaActiva(inc)
    } else {
      setIncidenciaActiva(null)
    }
  }, [isOpen, viajeId])

  if (!isOpen) return null

  function handleReportar() {
    setEnviando(true)
    const nuevaIncidencia: IncidenciaRuta = {
      id: `INC-${Date.now()}`,
      viajeId,
      cargaId,
      tipo,
      descripcion: descripcion.trim() || TIPOS_INCIDENCIA_LABEL[tipo].desc,
      retrasoEstimado: retraso,
      ubicacionAprox: ubicacionAprox.trim() || undefined,
      fechaHora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      estado: 'activa',
    }

    guardarIncidencia(viajeId, nuevaIncidencia)
    setIncidenciaActiva(nuevaIncidencia)
    setEnviando(false)
    setMsgExito(true)
    onIncidenciaActualizada(nuevaIncidencia)
    setTimeout(() => {
      setMsgExito(false)
      onClose()
    }, 2000)
  }

  function handleResolver() {
    resolverIncidencia(viajeId)
    setIncidenciaActiva(null)
    onIncidenciaActualizada(null)
    onClose()
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 450 }}>
        {/* Header SOS */}
        <div className="between" style={{ marginBottom: 14 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 24 }}>🚨</span>
            <div>
              <div className="eyebrow" style={{ color: '#DC2626', margin: 0, fontWeight: 800 }}>
                ASISTENCIA EN RUTA
              </div>
              <div className="h2" style={{ fontSize: 19, margin: 0 }}>Reportar Imprevisto / SOS</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: 'var(--slate)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Si ya hay una incidencia activa */}
        {incidenciaActiva ? (
          <div>
            <div
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: 16,
                padding: '16px',
                marginBottom: 16,
              }}
            >
              <div className="between" style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#991B1B' }}>
                  {TIPOS_INCIDENCIA_LABEL[incidenciaActiva.tipo].icon} {TIPOS_INCIDENCIA_LABEL[incidenciaActiva.tipo].label}
                </span>
                <span className="pill" style={{ background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                  Incidencia Activa
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#7F1D1D', marginBottom: 6 }}>
                <b>Retraso estimado:</b> {incidenciaActiva.retrasoEstimado}
              </div>
              {incidenciaActiva.ubicacionAprox && (
                <div style={{ fontSize: 12, color: '#7F1D1D' }}>
                  <b>Ubicación:</b> {incidenciaActiva.ubicacionAprox}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#991B1B', marginTop: 8, opacity: 0.8 }}>
                Reportado a las {incidenciaActiva.fechaHora}. El cliente ha sido notificado.
              </div>
            </div>

            {/* Números de Emergencia Directos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <a
                href="tel:133"
                className="btn btn-secondary"
                style={{ background: '#F1F5F9', padding: '12px', fontSize: 12.5, textAlign: 'center', textDecoration: 'none', justifyContent: 'center' }}
              >
                🚔 Carabineros (133)
              </a>
              <a
                href="tel:131"
                className="btn btn-secondary"
                style={{ background: '#F1F5F9', padding: '12px', fontSize: 12.5, textAlign: 'center', textDecoration: 'none', justifyContent: 'center' }}
              >
                🚑 SAMU (131)
              </a>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', background: '#059669', fontSize: 14 }}
              onClick={handleResolver}
            >
              ✅ Problema Resuelto · Reanudar Ruta
            </button>
          </div>
        ) : (
          /* Formulario de Reporte de Incidencia */
          <div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 12 }}>
              Trayecto: <b>{origenTexto} → {destinoTexto}</b>
            </div>

            {/* Selector de Tipo de Incidencia */}
            <div className="eyebrow" style={{ marginBottom: 6 }}>Tipo de imprevisto en carretera</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginBottom: 14 }}>
              {(Object.keys(TIPOS_INCIDENCIA_LABEL) as TipoIncidencia[]).map((key) => {
                const item = TIPOS_INCIDENCIA_LABEL[key]
                const isSelected = tipo === key
                return (
                  <div
                    key={key}
                    onClick={() => setTipo(key)}
                    style={{
                      border: `1.5px solid ${isSelected ? '#DC2626' : 'var(--line)'}`,
                      background: isSelected ? '#FEF2F2' : '#FFFFFF',
                      borderRadius: 12,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#991B1B' : 'var(--ink)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--slate)' }}>{item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Retraso Estimado */}
            <div className="field">
              <label>Retraso estimado aproximado</label>
              <select value={retraso} onChange={(e) => setRetraso(e.target.value)}>
                {RETRASOS_OPCIONES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Ubicación Aproximada */}
            <div className="field">
              <label>Ubicación aproximada en carretera (Opcional)</label>
              <input
                placeholder="Ej. Km 195 Ruta 5 Sur, cerca de Curicó"
                value={ubicacionAprox}
                onChange={(e) => setUbicacionAprox(e.target.value)}
              />
            </div>

            {/* Detalle adicional */}
            <div className="field">
              <label>Detalle adicional (Opcional)</label>
              <input
                placeholder="Ej. Esperando mecánico / vulcanización móvil"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {/* Teléfonos de Emergencia Directos */}
            <div className="between" style={{ marginTop: 10, marginBottom: 12, padding: '10px 12px', background: '#F8FAFC', borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)' }}>Asistencia Rápida:</span>
              <div className="row" style={{ gap: 8 }}>
                <a href="tel:133" style={{ fontSize: 12, fontWeight: 800, color: '#0369A1', textDecoration: 'none' }}>
                  🚔 Carabineros (133)
                </a>
                <span style={{ color: 'var(--line)' }}>·</span>
                <a href="tel:132" style={{ fontSize: 12, fontWeight: 800, color: '#DC2626', textDecoration: 'none' }}>
                  🚒 Bomberos (132)
                </a>
              </div>
            </div>

            {msgExito && (
              <div className="pill pill-green" style={{ width: '100%', justifyContent: 'center', marginBottom: 10, padding: 8 }}>
                ✓ ¡Incidencia reportada! Se ha notificado al cliente.
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', background: '#DC2626', fontSize: 14 }}
              disabled={enviando}
              onClick={handleReportar}
            >
              {enviando ? 'Enviando reporte…' : '🚨 Notificar Incidencia al Cliente'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
