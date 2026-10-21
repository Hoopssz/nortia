import { useState, useEffect } from 'react'
import { solicitarPermisoPush, estadoPermisoPush, yaSePreguntoPermiso } from '../lib/pushService'

/**
 * Banner que solicita permiso de notificaciones push la primera vez.
 * Se muestra solo si:
 *  - El navegador soporta Notification API
 *  - El permiso aún es 'default' (no se ha pedido)
 *  - No se descartó antes
 */
export function PushPermissionBanner() {
  const [visible, setVisible] = useState(false)
  const [solicitando, setSolicitando] = useState(false)

  useEffect(() => {
    // Mostrar banner si aún no se pidió permiso y el browser lo soporta
    if ('Notification' in window && estadoPermisoPush() === 'default' && !yaSePreguntoPermiso()) {
      // Pequeño delay para no interrumpir el login inmediatamente
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  if (!visible) return null

  async function handleAceptar() {
    setSolicitando(true)
    await solicitarPermisoPush()
    setVisible(false)
    setSolicitando(false)
  }

  function handleDescartar() {
    localStorage.setItem('nortia_push_permission_asked', 'dismissed')
    setVisible(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9000,
        width: 'calc(100% - 32px)',
        maxWidth: 480,
        background: '#0F172A',
        color: '#FFFFFF',
        borderRadius: 18,
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        animation: 'slideUpFade 0.35s ease both',
      }}
    >
      <span style={{ fontSize: 26, flexShrink: 0 }}>🔔</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 3 }}>
          Activa las notificaciones
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.45 }}>
          Recibe alertas de nuevos fletes, mensajes y pagos aunque NORTIA esté en segundo plano.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            onClick={handleAceptar}
            disabled={solicitando}
            style={{
              background: '#38BDF8',
              color: '#0F172A',
              border: 'none',
              borderRadius: 999,
              padding: '7px 16px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {solicitando ? 'Activando…' : '✓ Activar'}
          </button>
          <button
            onClick={handleDescartar}
            disabled={solicitando}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)',
              border: 'none',
              borderRadius: 999,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
