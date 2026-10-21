/**
 * Servicio de Gestión de Guías de Despacho Electrónicas (SII / Fiscalización Carretera)
 */

export interface GuiaDespachoData {
  viajeId?: string
  cargaId: string
  folio: string
  emisorRazonSocial: string
  emisorRut: string
  archivoUrl: string
  tipoArchivo: 'pdf' | 'imagen'
  fechaEmision: string
  observaciones?: string
}

const STORAGE_KEY_GUIA = 'nortia_guia_despacho_'

export function guardarGuiaDespacho(cargaId: string, guia: GuiaDespachoData): void {
  try {
    localStorage.setItem(STORAGE_KEY_GUIA + cargaId, JSON.stringify(guia))
  } catch (err) {
    console.error('Error guardando Guía de Despacho:', err)
  }
}

export function obtenerGuiaDespacho(cargaId: string): GuiaDespachoData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUIA + cargaId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
