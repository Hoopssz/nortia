/**
 * Servicio de Tacógrafo Digital y Control de Descanso en Carretera (NORTIA HOS / Tacógrafo)
 * Cumplimiento Ley N° 19.518 y Art. 25 bis del Código del Trabajo de Chile
 */

export interface EstadoTacografo {
  estado: 'conduciendo' | 'descansando' | 'detenido'
  segundosConduccion: number
  segundosDescanso: number
  iniciadoEn: string | null
}

const STORAGE_KEY_TACOGRAFO = 'nortia_tacografo_state'

export const MAX_CONDUCCION_SEGUNDOS = 5 * 3600 // 5 Horas Continuas Máximas (Chile)
export const MIN_DESCANSO_SEGUNDOS = 2 * 3600 // 2 Horas de Descanso Mínimo

export function obtenerEstadoTacografo(): EstadoTacografo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TACOGRAFO)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    estado: 'detenido',
    segundosConduccion: 3 * 3600 + 45 * 60, // 3h 45m de muestra
    segundosDescanso: 0,
    iniciadoEn: null,
  }
}

export function actualizarEstadoTacografo(nuevo: EstadoTacografo): void {
  try {
    localStorage.setItem(STORAGE_KEY_TACOGRAFO, JSON.stringify(nuevo))
    window.dispatchEvent(new Event('nortia_tacografo_updated'))
  } catch (err) {
    console.error('Error guardando estado del tacógrafo:', err)
  }
}
