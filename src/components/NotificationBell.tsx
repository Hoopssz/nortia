import { useState, useEffect } from 'react'
import { Icon } from './Icon'
import { useAuth } from '../contexts/useAuth'
import { obtenerNoLeidasCount } from '../lib/notificationService'
import { NotificationCenterModal } from './NotificationCenterModal'

export function NotificationBell() {
  const { session } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  function updateCount() {
    if (!session?.user.id) return
    const count = obtenerNoLeidasCount(session.user.id)
    setUnreadCount(count)
  }

  useEffect(() => {
    updateCount()

    function onUpdated() {
      updateCount()
    }
    window.addEventListener('nortia_notifs_updated', onUpdated)
    return () => window.removeEventListener('nortia_notifs_updated', onUpdated)
  }, [session])

  if (!session?.user.id) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          background: 'var(--card-glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--card-glass-border)',
          boxShadow: 'var(--card-glass-shadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--navy)',
          cursor: 'pointer',
          flexShrink: 0,
          position: 'relative',
          transition: 'transform 0.14s var(--ease-apple-press), border-color 0.2s ease',
        }}
        title="Centro de Notificaciones"
      >
        <Icon name="bell" size={19} strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 800,
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
              animation: 'applePillPop 0.25s var(--ease-apple-spring) both',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenterModal
        isOpen={isOpen}
        usuarioId={session.user.id}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
