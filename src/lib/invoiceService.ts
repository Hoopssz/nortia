/**
 * Servicio de Facturación Electrónica de Comisión NORTIA (DTE 33 - SII Chile)
 */

export interface FacturaComisionNortia {
  id: string
  folio: number
  fechaEmision: string
  viajeId: string
  clienteNombre: string
  clienteRut: string
  clienteGiro: string
  clienteDireccion: string
  origenTexto: string
  destinoTexto: string
  montoFleteTotal: number
  montoNetoComision: number
  ivaComision: number
  totalComision: number
  codigoAutorizacionSii: string
}

const STORAGE_KEY_FACTURAS = 'nortia_facturas_comision_'

export function generarFacturaComision(
  viajeId: string,
  clienteNombre: string,
  clienteRut: string,
  origenTexto: string,
  destinoTexto: string,
  montoFleteTotal: number
): FacturaComisionNortia {
  // Comisión total 12% con IVA incluido
  const totalComision = Math.round(montoFleteTotal * 0.12)
  const montoNetoComision = Math.round(totalComision / 1.19)
  const ivaComision = totalComision - montoNetoComision

  const folio = 104200 + Math.floor(Math.random() * 8000)
  const fecha = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const factura: FacturaComisionNortia = {
    id: `FACT-${Date.now()}`,
    folio,
    fechaEmision: fecha,
    viajeId,
    clienteNombre: clienteNombre || 'Empresa Cliente',
    clienteRut: clienteRut || '76.123.456-7',
    clienteGiro: 'Transporte y Logística / Comercio General',
    clienteDireccion: 'Santiago, Chile',
    origenTexto,
    destinoTexto,
    montoFleteTotal,
    montoNetoComision,
    ivaComision,
    totalComision,
    codigoAutorizacionSii: `RES-SII-${Date.now().toString().slice(-6)}`,
  }

  try {
    localStorage.setItem(STORAGE_KEY_FACTURAS + viajeId, JSON.stringify(factura))
  } catch (err) {
    console.error('Error guardando factura:', err)
  }

  return factura
}

export function obtenerFacturaComision(viajeId: string): FacturaComisionNortia | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FACTURAS + viajeId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
