/**
 * Servicio del Centro de Notificaciones en Tiempo Real (NORTIA Notifications)
 */

export type TipoNotificacion =
  | 'oferta'
  | 'viaje'
  | 'incidencia'
  | 'entrega'
  | 'invitacion'
  | 'chat'
  | 'pago'
  | 'sistema'

export interface Notificacion {
  id: string
  usuarioId: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  fechaHora: string
  timestamp: number
  leida: boolean
  link?: string
  icono?: string
}

const STORAGE_KEY_NOTIFS = 'nortia_notificaciones_'

export function obtenerNotificaciones(usuarioId: string): Notificacion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS + usuarioId)
    if (raw) return JSON.parse(raw)

    // Si no existen notificaciones aún, inicializamos unas de bienvenida según contexto
    return inicializarNotificacionesMock(usuarioId)
  } catch {
    return []
  }
}

export function obtenerNoLeidasCount(usuarioId: string): number {
  const lista = obtenerNotificaciones(usuarioId)
  return lista.filter((n) => !n.leida).length
}

export function marcarNotificacionLeida(usuarioId: string, notifId: string): void {
  const lista = obtenerNotificaciones(usuarioId)
  const actualizadas = lista.map((n) => (n.id === notifId ? { ...n, leida: true } : n))
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS + usuarioId, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_notifs_updated'))
  } catch (err) {
    console.error('Error actualizando notificaciones:', err)
  }
}

export function marcarTodasLeidas(usuarioId: string): void {
  const lista = obtenerNotificaciones(usuarioId)
  const actualizadas = lista.map((n) => ({ ...n, leida: true }))
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS + usuarioId, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_notifs_updated'))
  } catch (err) {
    console.error('Error marcando todas leídas:', err)
  }
}

export function crearNotificacion(
  notif: Omit<Notificacion, 'id' | 'timestamp' | 'fechaHora' | 'leida'>
): Notificacion {
  const lista = obtenerNotificaciones(notif.usuarioId)
  const ahora = new Date()
  const nueva: Notificacion = {
    ...notif,
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: ahora.getTime(),
    fechaHora: ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    leida: false,
  }

  const actualizadas = [nueva, ...lista]
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS + notif.usuarioId, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_notifs_updated'))
  } catch (err) {
    console.error('Error guardando notificación:', err)
  }

  return nueva
}

export function inicializarNotificacionesMock(usuarioId: string): Notificacion[] {
  const iniciales: Notificacion[] = [
    {
      id: `NOTIF-INIT-1`,
      usuarioId,
      tipo: 'sistema',
      titulo: '¡Bienvenido a NORTIA!',
      mensaje: 'Tu cuenta está lista para mover y gestionar fletes en todo Chile.',
      fechaHora: 'Hoy',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      leida: false,
      icono: '🇨🇱',
    },
    {
      id: `NOTIF-INIT-2`,
      usuarioId,
      tipo: 'oferta',
      titulo: 'Nueva carga disponible en tu zona',
      mensaje: 'Flete de frutas y vino Curicó → Santiago con Seguro Full Cobertura.',
      fechaHora: 'Hace 30m',
      timestamp: Date.now() - 1000 * 60 * 30,
      leida: false,
      icono: '📦',
      link: '/camionero/buscar',
    },
    {
      id: `NOTIF-INIT-3`,
      usuarioId,
      tipo: 'pago',
      titulo: 'Custodia Segura NORTIA activa',
      mensaje: 'Tus pagos y transferencias a Cuenta RUT están garantizados.',
      fechaHora: 'Ayer',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      leida: true,
      icono: '🛡️',
      link: '/cuenta',
    },
  ]

  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS + usuarioId, JSON.stringify(iniciales))
  } catch {}

  return iniciales
}
