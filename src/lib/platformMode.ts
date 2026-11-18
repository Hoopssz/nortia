import { Capacitor } from '@capacitor/core'

/**
 * Detecta si NORTIA se está ejecutando como LA APP MÓVIL (iOS / Android nativo o App instalada)
 * versus LA PÁGINA WEB de escritorio.
 */
export function isStandaloneApp(): boolean {
  if (Capacitor.isNativePlatform()) return true
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  if (params.get('app') === '1' || params.get('mode') === 'app') {
    try {
      sessionStorage.setItem('nortia_app_mode', '1')
    } catch {}
    return true
  }

  try {
    if (sessionStorage.getItem('nortia_app_mode') === '1') return true
  } catch {}

  const isStandaloneDisplay =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)

  return isStandaloneDisplay
}

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}
