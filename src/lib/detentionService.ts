/**
 * Servicio de Control de Estadía y Compensación por Tiempos de Espera en Bodega (NORTIA Detention Pay)
 * Protege al transportista ante demoras excesivas en carga o descarga en Chile.
 */

export interface RegistroEstadia {
  viajeId: string
  llegadaBodega: string | null // ISO String
  inicioCargaDescarga: string | null
  salidaBodega: string | null
  horasLibresCortesía: number // 2 horas estándar
  tarifaHoraClp: number // $18.000 CLP por hora extra
  activo: boolean
}

const STORAGE_KEY_DETENTION = 'nortia_detention_records_'

export function obtenerRegistroEstadia(viajeId: string): RegistroEstadia {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DETENTION + viajeId)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    viajeId,
    llegadaBodega: null,
    inicioCargaDescarga: null,
    salidaBodega: null,
    horasLibresCortesía: 2,
    tarifaHoraClp: 18000,
    activo: false,
  }
}

export function iniciarRegistroEstadia(viajeId: string): RegistroEstadia {
  const registro: RegistroEstadia = {
    viajeId,
    llegadaBodega: new Date().toISOString(),
    inicioCargaDescarga: null,
    salidaBodega: null,
    horasLibresCortesía: 2,
    tarifaHoraClp: 18000,
    activo: true,
  }
  try {
    localStorage.setItem(STORAGE_KEY_DETENTION + viajeId, JSON.stringify(registro))
    window.dispatchEvent(new Event('nortia_detention_updated'))
  } catch (err) {
    console.error('Error guardando registro de estadía:', err)
  }
  return registro
}

export function finalizarRegistroEstadia(viajeId: string): RegistroEstadia {
  const actual = obtenerRegistroEstadia(viajeId)
  const finalizado: RegistroEstadia = {
    ...actual,
    salidaBodega: new Date().toISOString(),
    activo: false,
  }
  try {
    localStorage.setItem(STORAGE_KEY_DETENTION + viajeId, JSON.stringify(finalizado))
    window.dispatchEvent(new Event('nortia_detention_updated'))
  } catch {}
  return finalizado
}

export function calcularCompensacionEstadia(registro: RegistroEstadia): {
  minutosTotales: number
  minutosExceso: number
  montoCompensacionClp: number
  enCortesía: boolean
} {
  if (!registro.llegadaBodega) {
    return { minutosTotales: 0, minutosExceso: 0, montoCompensacionClp: 0, enCortesía: true }
  }

  const inicio = new Date(registro.llegadaBodega).getTime()
  const fin = registro.salidaBodega ? new Date(registro.salidaBodega).getTime() : Date.now()
  const minutosTotales = Math.max(0, Math.floor((fin - inicio) / (60 * 1000)))

  const minutosCortesía = registro.horasLibresCortesía * 60
  const minutosExceso = Math.max(0, minutosTotales - minutosCortesía)

  // Cálculo proporcional por minuto
  const valorMinuto = registro.tarifaHoraClp / 60
  const montoCompensacionClp = Math.round(minutosExceso * valorMinuto)

  return {
    minutosTotales,
    minutosExceso,
    montoCompensacionClp,
    enCortesía: minutosExceso === 0,
  }
}
