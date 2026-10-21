/**
 * Servicio de Seguros y Pólizas Dinámicas de Carga por Viaje (NORTIA Seguros)
 * Modelo porcentual según valor comercial declarado (Mercado Asegurador Chileno)
 */

export type TipoSeguro = 'ninguno' | 'basico' | 'premium'

export interface PlanSeguro {
  tipo: TipoSeguro
  nombre: string
  tasaPct: number // Porcentaje sobre el valor declarado
  primaMinimaClp: number
  descripcion: string
  caracteristicas: string[]
}

export const PLANES_SEGURO: Record<TipoSeguro, PlanSeguro> = {
  ninguno: {
    tipo: 'ninguno',
    nombre: 'Sin seguro adicional',
    tasaPct: 0,
    primaMinimaClp: 0,
    descripcion: 'Responsabilidad limitada según código de comercio.',
    caracteristicas: [],
  },
  basico: {
    tipo: 'basico',
    nombre: 'Seguro Estándar NORTIA (0.25%)',
    tasaPct: 0.0025, // 0.25%
    primaMinimaClp: 14990,
    descripcion: 'Cobertura ante accidentes viales mayores y daños en ruta.',
    caracteristicas: [
      'Choque, colisión o volcamiento',
      'Incendio o rayo en ruta',
      'Desbarrancamiento',
      'Deducible 1 UF',
    ],
  },
  premium: {
    tipo: 'premium',
    nombre: 'Seguro Full Cobertura NORTIA (0.40%)',
    tasaPct: 0.004, // 0.40%
    primaMinimaClp: 24990,
    descripcion: 'Máxima protección: Robo con violencia, asalto y perecibles.',
    caracteristicas: [
      'Todo lo del plan estándar',
      'Robo con violencia o asalto en carretera',
      'Pérdida total o parcial de bultos',
      'Falla de equipo de frío (para refrigerados)',
      'Asistencia jurídica en siniestros',
      'Sin deducible en pérdida total',
    ],
  },
}

/**
 * Calcula la prima en CLP según el valor comercial declarado
 */
export function calcularPrimaSeguro(plan: TipoSeguro, valorDeclarado: number): number {
  if (plan === 'ninguno' || !valorDeclarado || valorDeclarado <= 0) return 0
  const planInfo = PLANES_SEGURO[plan]
  const primaCalculada = Math.round(valorDeclarado * planInfo.tasaPct)
  return Math.max(primaCalculada, planInfo.primaMinimaClp)
}

export interface PolizaSeguro {
  numeroPoliza: string
  cargaId: string
  viajeId?: string
  plan: TipoSeguro
  montoAsegurado: number
  costoPrima: number
  fechaEmision: string
  vigenciaHasta: string
  aseguradoNombre: string
  aseguradoRut: string
  estado: 'vigente' | 'completada' | 'siniestro_reportado'
}

const STORAGE_KEY_SEGUROS = 'nortia_poliza_seguro_'

export function guardarPolizaSeguro(cargaId: string, poliza: PolizaSeguro): void {
  try {
    localStorage.setItem(STORAGE_KEY_SEGUROS + cargaId, JSON.stringify(poliza))
  } catch (err) {
    console.error('Error guardando póliza:', err)
  }
}

export function obtenerPolizaSeguro(cargaId: string): PolizaSeguro | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEGUROS + cargaId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function generarPoliza(
  cargaId: string,
  plan: TipoSeguro,
  valorDeclarado: number,
  aseguradoNombre: string,
  aseguradoRut: string,
  viajeId?: string
): PolizaSeguro {
  const monto = valorDeclarado || 5000000
  const prima = calcularPrimaSeguro(plan, monto)
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  const fechaHoy = new Date()
  const fechaVigencia = new Date()
  fechaVigencia.setDate(fechaVigencia.getDate() + 7) // 7 días de vigencia de flete

  const poliza: PolizaSeguro = {
    numeroPoliza: `POL-NORTIA-${fechaHoy.getFullYear()}-${randomNum}`,
    cargaId,
    viajeId,
    plan,
    montoAsegurado: monto,
    costoPrima: prima,
    fechaEmision: fechaHoy.toLocaleDateString('es-CL'),
    vigenciaHasta: fechaVigencia.toLocaleDateString('es-CL'),
    aseguradoNombre,
    aseguradoRut,
    estado: 'vigente',
  }

  guardarPolizaSeguro(cargaId, poliza)
  return poliza
}
