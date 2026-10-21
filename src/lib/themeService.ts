/**
 * Servicio de Tema y Modo Oscuro de Carretera (Apple Dark Mode) para NORTIA
 */

export type ModoTema = 'dark' | 'light' | 'auto'

const STORAGE_KEY_THEME = 'nortia_theme_mode'

export function obtenerModoTema(): ModoTema {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_THEME) as ModoTema | null
    if (guardado === 'dark' || guardado === 'light' || guardado === 'auto') {
      return guardado
    }
  } catch {}
  return 'light'
}

export function obtenerTemaEfectivo(): 'dark' | 'light' {
  const modo = obtenerModoTema()
  if (modo === 'dark') return 'dark'
  if (modo === 'light') return 'light'
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function aplicarTema(modo?: ModoTema): void {
  const modoUsar = modo || obtenerModoTema()
  let temaFinal: 'dark' | 'light' = 'light'

  if (modoUsar === 'dark') {
    temaFinal = 'dark'
  } else if (modoUsar === 'light') {
    temaFinal = 'light'
  } else {
    // auto
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      temaFinal = 'dark'
    } else {
      temaFinal = 'light'
    }
  }

  if (typeof document !== 'undefined') {
    if (temaFinal === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY_THEME, modoUsar)
    window.dispatchEvent(new CustomEvent('nortia_theme_changed', { detail: temaFinal }))
  } catch (err) {
    console.error('Error guardando tema:', err)
  }
}

export function alternarTema(): 'dark' | 'light' {
  const actual = obtenerTemaEfectivo()
  const nuevo = actual === 'dark' ? 'light' : 'dark'
  aplicarTema(nuevo)
  return nuevo
}

// Inicialización automática
if (typeof window !== 'undefined') {
  aplicarTema()

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const modo = obtenerModoTema()
    if (modo === 'auto') {
      aplicarTema('auto')
    }
  })
}
