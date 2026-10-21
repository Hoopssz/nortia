import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalada en modo standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setIsStandalone(standalone)

    // Verificar si el usuario ya descartó el banner recientemente
    const dismissedTimestamp = localStorage.getItem('nortia_pwa_dismissed')
    const hasBeenDismissedRecently =
      dismissedTimestamp && Date.now() - Number(dismissedTimestamp) < 1000 * 60 * 60 * 24 * 3 // 3 días

    if (standalone || hasBeenDismissedRecently) {
      setDismissed(true)
      return
    }

    setDismissed(false)

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIphoneOrIpad)

    // Evento de instalación en Android / Chrome
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setDismissed(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem('nortia_pwa_dismissed', String(Date.now()))
  }

  async function handleInstallAndroid() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDismissed(true)
    }
    setDeferredPrompt(null)
  }

  if (dismissed || isStandalone) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: 460,
        zIndex: 9990,
        background: '#0B192C',
        color: '#FFFFFF',
        borderRadius: 20,
        padding: '14px 16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <div className="between" style={{ alignItems: 'flex-start' }}>
        <div className="row" style={{ gap: 12, flex: 1, minWidth: 0 }}>
          <img
            src="/icon-192.png"
            alt="NORTIA"
            style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#FFFFFF' }}>
              Instala NORTIA en tu celular
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
              Acceso rápido desde tu pantalla de inicio y modo sin conexión.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 18,
            cursor: 'pointer',
            padding: 2,
            marginLeft: 8,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {isIOS ? (
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, padding: '10px 14px', fontSize: 12.5, background: '#2563EB' }}
            onClick={() => setShowIOSGuide(!showIOSGuide)}
          >
            📲 Cómo instalar en iPhone / iPad
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, padding: '10px 14px', fontSize: 12.5, background: '#2563EB' }}
            onClick={handleInstallAndroid}
          >
            📲 Instalar App Gratis
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          style={{
            padding: '10px 14px',
            fontSize: 12.5,
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: 'none',
          }}
          onClick={handleDismiss}
        >
          Ahora no
        </button>
      </div>

      {showIOSGuide && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Para instalar en Safari iOS:</div>
          <div>1. Toca el botón <b>Compartir (⎋)</b> en la barra inferior de Safari.</div>
          <div>2. Desliza hacia abajo y selecciona <b>"Agregar a Inicio (➕)"</b>.</div>
        </div>
      )}
    </div>
  )
}
