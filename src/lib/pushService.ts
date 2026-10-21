/**
 * pushService.ts — NORTIA Notificaciones Push
 *
 * Combina dos canales:
 *  1. Web Push API (Notification API nativa del navegador/SO)
 *     → funciona incluso si la app está en segundo plano (como app nativa en el celular).
 *  2. Centro de Notificaciones interno (notificationService.ts)
 *     → siempre se guarda, aparece en el 🔔 del header.
 */

import { crearNotificacion, type TipoNotificacion } from './notificationService'

const PUSH_PERMISSION_KEY = 'nortia_push_permission_asked'

/** Solicita permiso de notificaciones al SO (solo se muestra 1 vez). */
export async function solicitarPermisoPush(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  const perm = await Notification.requestPermission()
  localStorage.setItem(PUSH_PERMISSION_KEY, perm)
  return perm
}

/** Devuelve el estado actual del permiso sin solicitarlo. */
export function estadoPermisoPush(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

/** Devuelve true si ya se solicitó permiso alguna vez (para no preguntar dos veces). */
export function yaSePreguntoPermiso(): boolean {
  return !!localStorage.getItem(PUSH_PERMISSION_KEY)
}

/**
 * Envía una notificación push + la guarda en el centro interno.
 *
 * @param usuarioId  ID del usuario destinatario (para el centro interno).
 * @param tipo       Tipo de notificación.
 * @param titulo     Título visible.
 * @param mensaje    Cuerpo del mensaje.
 * @param icono      Emoji opcional para el centro interno.
 * @param link       Ruta interna a la que navegar al hacer clic.
 */
export function enviarNotificacion(params: {
  usuarioId: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  icono?: string
  link?: string
}): void {
  const { usuarioId, tipo, titulo, mensaje, icono, link } = params

  // 1. Siempre guardar en el centro interno
  crearNotificacion({ usuarioId, tipo, titulo, mensaje, icono, link })

  // 2. Push nativo si el permiso está concedido y la app está en segundo plano
  if (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    document.visibilityState === 'hidden'
  ) {
    try {
      new Notification(titulo, {
        body: mensaje,
        icon: '/pwa-192x192.png',   // ícono de la PWA
        badge: '/pwa-64x64.png',
        tag: `nortia-${tipo}-${Date.now()}`,
        data: { link },
      })
    } catch {
      // Algunos navegadores bloquean new Notification() si no hay SW registrado
    }
  }
}

// ─── Helpers semánticos para cada evento clave del flujo ───────────────────

/** Nueva oferta/postulación recibida (para la empresa). */
export function notifNuevaOferta(usuarioId: string, camioneroNombre: string, cargaDesc: string, viajeId?: string) {
  enviarNotificacion({
    usuarioId,
    tipo: 'oferta',
    titulo: '📋 Nueva postulación recibida',
    mensaje: `${camioneroNombre} se postuló para tu carga "${cargaDesc}".`,
    icono: '📋',
    link: viajeId ? `/viajes/${viajeId}` : '/negocio/cargas',
  })
}

/** Flete aceptado/asignado (para el camionero). */
export function notifFleteAsignado(usuarioId: string, cargaDesc: string, cliente: string, viajeId: string) {
  enviarNotificacion({
    usuarioId,
    tipo: 'viaje',
    titulo: '🚚 ¡Flete asignado!',
    mensaje: `${cliente} aceptó tu oferta para "${cargaDesc}". Ya puedes iniciar la ruta.`,
    icono: '🚚',
    link: `/viajes/${viajeId}`,
  })
}

/** Camión salió a ruta (para la empresa). */
export function notifCamionEnRuta(usuarioId: string, camioneroNombre: string, destino: string, viajeId: string) {
  enviarNotificacion({
    usuarioId,
    tipo: 'viaje',
    titulo: '🛣️ Tu carga está en camino',
    mensaje: `${camioneroNombre} salió hacia ${destino}.`,
    icono: '🛣️',
    link: `/viajes/${viajeId}`,
  })
}

/** Entrega confirmada (para la empresa). */
export function notifEntregaConfirmada(usuarioId: string, cargaDesc: string, viajeId: string) {
  enviarNotificacion({
    usuarioId,
    tipo: 'entrega',
    titulo: '✅ ¡Carga entregada!',
    mensaje: `Tu carga "${cargaDesc}" fue entregada. Recuerda liberar el pago al camionero.`,
    icono: '✅',
    link: `/viajes/${viajeId}`,
  })
}

/** Pago liberado (para el camionero). */
export function notifPagoLiberado(usuarioId: string, monto: number, viajeId: string) {
  enviarNotificacion({
    usuarioId,
    tipo: 'pago',
    titulo: '💰 ¡Pago liberado!',
    mensaje: `El cliente liberó $${monto.toLocaleString('es-CL')} CLP a tu cuenta. ¡Fondos disponibles!`,
    icono: '💰',
    link: `/viajes/${viajeId}`,
  })
}

/** Nuevo mensaje de chat (para la otra parte). */
export function notifNuevoMensaje(usuarioId: string, remitenteNombre: string, preview: string, link?: string) {
  enviarNotificacion({
    usuarioId,
    tipo: 'chat',
    titulo: `💬 Mensaje de ${remitenteNombre}`,
    mensaje: preview.length > 60 ? preview.slice(0, 60) + '…' : preview,
    icono: '💬',
    link: link ?? '/mensajes',
  })
}
