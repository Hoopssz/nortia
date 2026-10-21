import { useNetworkStatus } from '../lib/offlineSync'
import { Icon } from './Icon'

export function OfflineIndicator() {
  const { isOnline, ultimoSyncExito } = useNetworkStatus()

  if (isOnline && !ultimoSyncExito) return null

  if (ultimoSyncExito) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%) translateZ(0)',
          zIndex: 9999,
          background: '#065F46',
          color: '#FFFFFF',
          padding: '7px 16px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          boxShadow: '0 8px 24px -4px rgba(6, 95, 70, 0.35)',
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          maxWidth: '90vw',
        }}
      >
        <Icon name="check" size={14} strokeWidth={3} />
        <span>Conexión restablecida · Datos sincronizados</span>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%) translateZ(0)',
        zIndex: 9999,
        background: '#92400E',
        color: '#FEF3C7',
        padding: '7px 16px',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 11.5,
        fontWeight: 700,
        boxShadow: '0 8px 24px -4px rgba(146, 64, 14, 0.35)',
        maxWidth: '92vw',
        textAlign: 'center',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FCD34D', display: 'inline-block' }} />
      <span>Modo Sin Señal · Datos protegidos en el dispositivo</span>
    </div>
  )
}
