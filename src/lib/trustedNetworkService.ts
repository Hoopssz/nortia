/**
 * Servicio de Mi Red de Confianza (NORTIA Trusted Network)
 * Directorio de Clientes y Transportistas habituales con trato directo y rápido
 */

export interface ContactoConfianza {
  id: string
  usuarioId: string
  nombreContacto: string
  rolContacto: 'camionero' | 'cliente' | 'empresa'
  telefono: string
  email?: string
  calificacion: number
  viajesRealizados: number
  rutasHabituales: string
  agregadoEn: string
}

const STORAGE_KEY_NETWORK = 'nortia_trusted_network_'

export function obtenerRedConfianza(usuarioId: string): ContactoConfianza[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NETWORK + usuarioId)
    if (raw) return JSON.parse(raw)
    return inicializarRedSugerida(usuarioId)
  } catch {
    return []
  }
}

export function guardarContactoConfianza(
  usuarioId: string,
  contacto: Omit<ContactoConfianza, 'id' | 'agregadoEn'>
): ContactoConfianza {
  const lista = obtenerRedConfianza(usuarioId)
  const nuevo: ContactoConfianza = {
    ...contacto,
    id: `NET-${Date.now()}`,
    agregadoEn: new Date().toISOString(),
  }
  const actualizadas = [...lista, nuevo]
  try {
    localStorage.setItem(STORAGE_KEY_NETWORK + usuarioId, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_network_updated'))
  } catch (err) {
    console.error('Error guardando contacto en red de confianza:', err)
  }
  return nuevo
}

export function eliminarContactoConfianza(usuarioId: string, contactoId: string): void {
  const lista = obtenerRedConfianza(usuarioId)
  const filtradas = lista.filter((c) => c.id !== contactoId)
  try {
    localStorage.setItem(STORAGE_KEY_NETWORK + usuarioId, JSON.stringify(filtradas))
    window.dispatchEvent(new Event('nortia_network_updated'))
  } catch (err) {
    console.error('Error eliminando contacto de red:', err)
  }
}

export function inicializarRedSugerida(usuarioId: string): ContactoConfianza[] {
  const sugeridos: ContactoConfianza[] = [
    {
      id: 'NET-1',
      usuarioId,
      nombreContacto: 'Agrícola Los Olivos del Maule',
      rolContacto: 'empresa',
      telefono: '+56987654321',
      email: 'logistica@losolivos.cl',
      calificacion: 5.0,
      viajesRealizados: 4,
      rutasHabituales: 'Curicó ↔ Valparaíso Puerto',
      agregadoEn: new Date().toISOString(),
    },
    {
      id: 'NET-2',
      usuarioId,
      nombreContacto: 'Distribuidora Central Santiago',
      rolContacto: 'cliente',
      telefono: '+56912345678',
      email: 'despachos@distribuidoracentral.cl',
      calificacion: 4.9,
      viajesRealizados: 3,
      rutasHabituales: 'Santiago ↔ Concepción',
      agregadoEn: new Date().toISOString(),
    },
  ]
  try {
    localStorage.setItem(STORAGE_KEY_NETWORK + usuarioId, JSON.stringify(sugeridos))
  } catch {}
  return sugeridos
}
