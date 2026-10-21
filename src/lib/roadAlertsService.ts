/**
 * Servicio de Reportes de Estado de Carretera en Vivo para Camioneros de Chile (Waze Camionero NORTIA)
 */

export type TipoAlertaRuta = 'nieve' | 'taco' | 'trabajos' | 'fiscalizacion' | 'accidente' | 'neblina'

export interface AlertaCarretera {
  id: string
  tipo: TipoAlertaRuta
  titulo: string
  ruta: string
  region: number
  descripcion: string
  confirmaciones: number
  reportadoPor: string
  creadoEn: string
}

const STORAGE_KEY_ROAD_ALERTS = 'nortia_road_alerts_v1'

const ALERTAS_INICIALES: AlertaCarretera[] = [
  {
    id: 'ALERT-1',
    tipo: 'fiscalizacion',
    titulo: 'Control de Pesaje Báscula MTT Activa',
    ruta: 'Ruta 5 Sur km 56 (Angostura)',
    region: 13,
    descripcion: 'Báscula de pesaje operando con fiscalizadores MTT y Carabineros. Tráfico lento pista derecha.',
    confirmaciones: 14,
    reportadoPor: 'Don Héctor G.',
    creadoEn: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'ALERT-2',
    tipo: 'trabajos',
    titulo: 'Trabajos de Asfalto Pista Derecha',
    ruta: 'Ruta 5 Sur km 184 (Curicó Norte)',
    region: 7,
    descripcion: 'Maquinaria pesada trabajando en calzada sur. Tránsito desviado a 1 sola pista.',
    confirmaciones: 8,
    reportadoPor: 'Transportes Maule',
    creadoEn: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    id: 'ALERT-3',
    tipo: 'nieve',
    titulo: 'Porte Obligatorio de Cadenas',
    ruta: 'Ruta 60-CH (Paso Los Libertadores)',
    region: 5,
    descripcion: 'Hielo en calzada desde Guardia Vieja. Carabineros exige cadenas puestas para camiones articulados.',
    confirmaciones: 23,
    reportadoPor: 'Claudio R. (Rampla)',
    creadoEn: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
  {
    id: 'ALERT-4',
    tipo: 'neblina',
    titulo: 'Neblina Densa / Visibilidad Reducida',
    ruta: 'Ruta 5 Norte (Cuesta Las Chilcas)',
    region: 5,
    descripcion: 'Visibilidad menor a 30 metros en la bajada hacia Llay Llay. Manejar con precaución y luces bajas.',
    confirmaciones: 5,
    reportadoPor: 'Don Juan Chofer',
    creadoEn: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
]

export function obtenerAlertasCarretera(): AlertaCarretera[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROAD_ALERTS)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(STORAGE_KEY_ROAD_ALERTS, JSON.stringify(ALERTAS_INICIALES))
    return ALERTAS_INICIALES
  } catch {
    return ALERTAS_INICIALES
  }
}

export function reportarAlertaCarretera(
  alerta: Omit<AlertaCarretera, 'id' | 'confirmaciones' | 'creadoEn'>
): AlertaCarretera {
  const lista = obtenerAlertasCarretera()
  const nueva: AlertaCarretera = {
    ...alerta,
    id: `ALERT-${Date.now()}`,
    confirmaciones: 1,
    creadoEn: new Date().toISOString(),
  }
  const actualizadas = [nueva, ...lista]
  try {
    localStorage.setItem(STORAGE_KEY_ROAD_ALERTS, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_road_alerts_updated'))
  } catch (err) {
    console.error('Error guardando alerta de carretera:', err)
  }
  return nueva
}

export function confirmarAlertaCarretera(id: string): void {
  const lista = obtenerAlertasCarretera()
  const actualizadas = lista.map((a) =>
    a.id === id ? { ...a, confirmaciones: a.confirmaciones + 1 } : a
  )
  try {
    localStorage.setItem(STORAGE_KEY_ROAD_ALERTS, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_road_alerts_updated'))
  } catch {}
}
