/**
 * Servicio de Incidencias en Ruta y Asistencia SOS (NORTIA Carretera)
 */

export type TipoIncidencia = 'pana_mecanica' | 'pinchazo' | 'taco_corte' | 'accidente' | 'otro'

export interface IncidenciaRuta {
  id: string
  viajeId: string
  cargaId: string
  tipo: TipoIncidencia
  descripcion: string
  retrasoEstimado: string
  ubicacionAprox?: string
  fechaHora: string
  estado: 'activa' | 'resuelta'
}

export const TIPOS_INCIDENCIA_LABEL: Record<TipoIncidencia, { label: string; icon: string; desc: string }> = {
  pana_mecanica: {
    label: 'Pana Mecánica',
    icon: '🔧',
    desc: 'Falla de motor, frenos, correa o temperatura.',
  },
  pinchazo: {
    label: 'Pinchazo / Neumático',
    icon: '🛞',
    desc: 'Cambio de rueda o vulcanización en ruta.',
  },
  taco_corte: {
    label: 'Corte de Ruta / Taco Mayor',
    icon: '🛑',
    desc: 'Congestión grave, obras viales o corte en peaje.',
  },
  accidente: {
    label: 'Accidente / Colisión',
    icon: '💥',
    desc: 'Choque o despiste en carretera.',
  },
  otro: {
    label: 'Otro Imprevisto',
    icon: '⚠️',
    desc: 'Retraso por clima, control policial o problemas de carga.',
  },
}

const STORAGE_KEY_INCIDENT = 'nortia_incidencia_viaje_'

export function guardarIncidencia(viajeId: string, incidencia: IncidenciaRuta): void {
  try {
    localStorage.setItem(STORAGE_KEY_INCIDENT + viajeId, JSON.stringify(incidencia))
  } catch (err) {
    console.error('Error guardando incidencia:', err)
  }
}

export function obtenerIncidencia(viajeId: string): IncidenciaRuta | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INCIDENT + viajeId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function resolverIncidencia(viajeId: string): void {
  try {
    const inc = obtenerIncidencia(viajeId)
    if (inc) {
      inc.estado = 'resuelta'
      guardarIncidencia(viajeId, inc)
    }
  } catch (err) {
    console.error('Error resolviendo incidencia:', err)
  }
}
