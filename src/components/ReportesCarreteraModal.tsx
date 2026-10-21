import { useState, useEffect } from 'react'
import {
  obtenerAlertasCarretera,
  reportarAlertaCarretera,
  confirmarAlertaCarretera,
  type AlertaCarretera,
  type TipoAlertaRuta,
} from '../lib/roadAlertsService'

interface ReportesCarreteraModalProps {
  isOpen: boolean
  choferNombre?: string
  onClose: () => void
}

const TIPOS_CONFIG: Record<TipoAlertaRuta, { label: string; icon: string; cls: string }> = {
  fiscalizacion: { label: 'Fiscalización MTT / Báscula', icon: '👮', cls: 'pill-navy' },
  trabajos: { label: 'Trabajos en Calzada', icon: '🚧', cls: 'pill-navy' },
  nieve: { label: 'Nieve / Cadenas Obligatorias', icon: '❄️', cls: 'pill-navy' },
  neblina: { label: 'Neblina Densa', icon: '🌫️', cls: 'pill-navy' },
  taco: { label: 'Taco / Congestión', icon: '🚗', cls: 'pill-navy' },
  accidente: { label: 'Accidente / Pista Cortada', icon: '⚠️', cls: 'pill-red' },
}

export function ReportesCarreteraModal({
  isOpen,
  choferNombre = 'Colega Camionero',
  onClose,
}: ReportesCarreteraModalProps) {
  const [alertas, setAlertas] = useState<AlertaCarretera[]>([])
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [showNuevo, setShowNuevo] = useState(false)
  const [tipo, setTipo] = useState<TipoAlertaRuta>('fiscalizacion')
  const [titulo, setTitulo] = useState('')
  const [ruta, setRuta] = useState('')
  const [descripcion, setDescripcion] = useState('')

  function cargar() {
    const lista = obtenerAlertasCarretera()
    setAlertas(lista)
  }

  useEffect(() => {
    if (!isOpen) return
    cargar()

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_road_alerts_updated', onUpdated)
    return () => window.removeEventListener('nortia_road_alerts_updated', onUpdated)
  }, [isOpen])

  if (!isOpen) return null

  const filtradas = alertas.filter((a) =>
    filtroTipo === 'todos' ? true : a.tipo === filtroTipo
  )

  function handleReportar() {
    if (!ruta.trim() || !descripcion.trim()) return
    reportarAlertaCarretera({
      tipo,
      titulo: titulo.trim() || TIPOS_CONFIG[tipo].label,
      ruta: ruta.trim(),
      region: 13,
      descripcion: descripcion.trim(),
      reportadoPor: choferNombre,
    })
    setTitulo('')
    setRuta('')
    setDescripcion('')
    setShowNuevo(false)
    cargar()
  }

  function handleConfirmar(id: string) {
    confirmarAlertaCarretera(id)
    cargar()
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 480, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 24 }}>🛣️</span>
            <div>
              <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
                Comunidad en Ruta
              </div>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                Estado de Carretera en Vivo
              </div>
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
          Alertas en tiempo real reportadas por colegas en la Ruta 5, puertos y pasos fronterizos de Chile.
        </p>

        {/* Botón Reportar o Formulario */}
        {!showNuevo ? (
          <button
            type="button"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginBottom: 14,
              padding: '11px',
              fontSize: 12.5,
              background: '#DC2626',
              borderRadius: 14,
            }}
            onClick={() => setShowNuevo(true)}
          >
            ⚠️ Reportar Incidente o Fiscalización en Ruta
          </button>
        ) : (
          <div className="card flat" style={{ background: 'var(--paper)', padding: '14px', borderRadius: 14, marginBottom: 14 }}>
            <div className="eyebrow" style={{ color: '#DC2626', marginBottom: 8 }}>
              Nuevo Reporte de Carretera
            </div>

            <div className="field" style={{ marginBottom: 8 }}>
              <label>Tipo de Novedad</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAlertaRuta)}>
                {Object.entries(TIPOS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field" style={{ marginBottom: 8 }}>
              <label>Ubicación / Ruta y Kilómetro</label>
              <input
                placeholder="Ej. Ruta 5 Sur km 120 (Rengo)"
                value={ruta}
                onChange={(e) => setRuta(e.target.value)}
              />
            </div>

            <div className="field" style={{ marginBottom: 10 }}>
              <label>Detalle para los colegas</label>
              <input
                placeholder="Ej. Control de pesaje activo y pista derecha lenta"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setShowNuevo(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '8px', background: '#DC2626' }}
                onClick={handleReportar}
              >
                Publicar Alerta
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 6,
            marginBottom: 12,
            whiteSpace: 'nowrap',
          }}
        >
          {[
            { key: 'todos', label: 'Todas las Alertas' },
            { key: 'fiscalizacion', label: '👮 Fiscalizaciones' },
            { key: 'trabajos', label: '🚧 Trabajos' },
            { key: 'nieve', label: '❄️ Nieve/Clima' },
            { key: 'accidente', label: '⚠️ Accidentes' },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              className="chip"
              style={{
                fontSize: 11,
                padding: '5px 10px',
                background: filtroTipo === f.key ? 'var(--navy)' : '#FFFFFF',
                color: filtroTipo === f.key ? '#FFFFFF' : 'var(--ink)',
                flexShrink: 0,
              }}
              onClick={() => setFiltroTipo(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Alertas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '55vh', overflowY: 'auto' }}>
          {filtradas.map((a) => {
            const cfg = TIPOS_CONFIG[a.tipo] || TIPOS_CONFIG.fiscalizacion
            return (
              <div
                key={a.id}
                className="card"
                style={{
                  padding: '13px 15px',
                  margin: 0,
                  border: a.tipo === 'accidente' ? '1.5px solid #FCA5A5' : '1px solid var(--line)',
                  background: a.tipo === 'accidente' ? '#FEF2F2' : '#FFFFFF',
                }}
              >
                <div className="between" style={{ alignItems: 'flex-start', marginBottom: 4 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                        {a.titulo}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 700 }}>
                        📍 {a.ruta}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: 10, color: 'var(--slate)' }}>
                    {a.reportadoPor}
                  </span>
                </div>

                <div style={{ fontSize: 11.5, color: 'var(--slate)', lineHeight: 1.35, margin: '6px 0 10px' }}>
                  {a.descripcion}
                </div>

                <div className="between" style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--slate-light)' }}>
                    ℹ️ Reportado recientemente
                  </span>

                  <button
                    type="button"
                    className="chip"
                    style={{
                      fontSize: 11,
                      padding: '4px 10px',
                      background: 'var(--navy-tint)',
                      color: 'var(--navy)',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleConfirmar(a.id)}
                  >
                    👍 Confirmar ({a.confirmaciones})
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
