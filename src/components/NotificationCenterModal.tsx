import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  type Notificacion,
} from '../lib/notificationService'

interface NotificationCenterModalProps {
  isOpen: boolean
  usuarioId: string
  onClose: () => void
}

export function NotificationCenterModal({
  isOpen,
  usuarioId,
  onClose,
}: NotificationCenterModalProps) {
  const navigate = useNavigate()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas'>('todas')

  function cargar() {
    if (!usuarioId) return
    const lista = obtenerNotificaciones(usuarioId)
    setNotificaciones(lista)
  }

  useEffect(() => {
    if (!isOpen) return
    cargar()

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_notifs_updated', onUpdated)
    return () => window.removeEventListener('nortia_notifs_updated', onUpdated)
  }, [isOpen, usuarioId])

  if (!isOpen) return null

  function handleClickNotif(n: Notificacion) {
    marcarNotificacionLeida(usuarioId, n.id)
    cargar()
    if (n.link) {
      onClose()
      navigate(n.link)
    }
  }

  function handleMarcarTodas() {
    marcarTodasLeidas(usuarioId)
    cargar()
  }

  const filtradas = notificaciones.filter((n) => (filtro === 'no_leidas' ? !n.leida : true))
  const noLeidasCount = notificaciones.filter((n) => !n.leida).length

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 440, padding: '20px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <div className="h2" style={{ margin: 0, fontSize: 18 }}>
              🔔 Notificaciones
            </div>
            {noLeidasCount > 0 && (
              <span className="pill pill-navy" style={{ fontSize: 11, fontWeight: 800 }}>
                {noLeidasCount} nuevas
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer', padding: 4 }}
          >
            ✕
          </button>
        </div>

        {/* Filtros y Acción de marcar leídas */}
        <div className="between" style={{ marginBottom: 14 }}>
          <div className="row" style={{ gap: 6 }}>
            <button
              type="button"
              className="chip"
              style={{
                fontSize: 11.5,
                padding: '5px 10px',
                background: filtro === 'todas' ? 'var(--navy)' : undefined,
                color: filtro === 'todas' ? '#fff' : undefined,
              }}
              onClick={() => setFiltro('todas')}
            >
              Todas ({notificaciones.length})
            </button>
            <button
              type="button"
              className="chip"
              style={{
                fontSize: 11.5,
                padding: '5px 10px',
                background: filtro === 'no_leidas' ? 'var(--navy)' : undefined,
                color: filtro === 'no_leidas' ? '#fff' : undefined,
              }}
              onClick={() => setFiltro('no_leidas')}
            >
              No leídas ({noLeidasCount})
            </button>
          </div>

          {noLeidasCount > 0 && (
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--navy)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={handleMarcarTodas}
            >
              ✓ Marcar leídas
            </button>
          )}
        </div>

        {/* Lista de Notificaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
          {filtradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--slate)' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Estás al día</div>
              <div style={{ fontSize: 11.5, marginTop: 2 }}>No tienes notificaciones pendientes.</div>
            </div>
          ) : (
            filtradas.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClickNotif(n)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: n.leida ? 'var(--paper)' : '#FFFFFF',
                  border: n.leida ? '1px solid var(--line)' : '1.5px solid var(--navy)',
                  cursor: n.link ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {!n.leida && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#EF4444',
                    }}
                  />
                )}

                <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icono || '🔔'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: n.leida ? 600 : 800, fontSize: 13, color: 'var(--ink)' }}>
                      {n.titulo}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2, lineHeight: 1.4 }}>
                      {n.mensaje}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--slate-light)', marginTop: 4 }}>
                      {n.fechaHora}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
