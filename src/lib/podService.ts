/**
 * Servicio de Comprobante de Entrega Digital (POD - Proof of Delivery) con Gestión de Daños y Mermas
 */

export type TipoRecepcion = 'conforme' | 'con_novedades'

export interface ComprobanteEntrega {
  viajeId: string
  nombreReceptor: string
  rutReceptor: string
  tipoRecepcion: TipoRecepcion
  bultosRechazados?: number
  detalleDano?: string
  fotoEntregaUrl?: string | null
  fotoGuiaUrl?: string | null
  fotoDanoUrl?: string | null
  firmaBase64?: string | null
  observaciones?: string | null
  fechaHora: string
}

const STORAGE_KEY_POD = 'nortia_pod_'

export function guardarComprobanteEntrega(viajeId: string, pod: ComprobanteEntrega): void {
  try {
    localStorage.setItem(STORAGE_KEY_POD + viajeId, JSON.stringify(pod))
    window.dispatchEvent(new Event('nortia_pod_updated'))
  } catch (err) {
    console.error('Error guardando POD:', err)
  }
}

export function obtenerComprobanteEntrega(viajeId: string): ComprobanteEntrega | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POD + viajeId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
