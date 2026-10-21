/**
 * Motor de Match y Compatibilidad de Carga vs Camión (NORTIA)
 */

import type { Tables } from './database.types'

export type Carga = Tables<'cargas'>
export type Camion = Tables<'camiones'>

export interface MatchResult {
  esCompatible: boolean
  porcentajeMatch: number
  incompatibilidades: string[]
  compatibilidades: string[]
  badges: {
    tipo: 'frio' | 'rampa' | 'grua' | 'ayuda' | 'peso' | 'volumen' | 'pallets'
    label: string
    cumple: boolean
    requerido: boolean
  }[]
}

/**
 * Evalúa rigurosamente la compatibilidad entre una carga y un camión
 */
export function evaluarCompatibilidad(carga: Carga, camion: Camion | null): MatchResult {
  if (!camion) {
    return {
      esCompatible: true,
      porcentajeMatch: 100,
      incompatibilidades: [],
      compatibilidades: [],
      badges: [],
    }
  }

  const incompatibilidades: string[] = []
  const compatibilidades: string[] = []
  const badges: MatchResult['badges'] = []

  let totalCriterios = 0
  let criteriosCumplidos = 0

  // 1. Capacidad de Peso (Crítico)
  totalCriterios++
  const pesoOk = carga.peso_kg <= camion.carga_max_kg
  if (pesoOk) {
    criteriosCumplidos++
    compatibilidades.push(`Capacidad de peso suficiente (${carga.peso_kg.toLocaleString('es-CL')} kg / max ${camion.carga_max_kg.toLocaleString('es-CL')} kg)`)
  } else {
    incompatibilidades.push(`Excede el peso máximo del camión por ${(carga.peso_kg - camion.carga_max_kg).toLocaleString('es-CL')} kg`)
  }
  badges.push({
    tipo: 'peso',
    label: `${carga.peso_kg.toLocaleString('es-CL')} kg`,
    cumple: pesoOk,
    requerido: true,
  })

  // 2. Equipo de Frío / Refrigeración
  if (carga.requiere_frio) {
    totalCriterios++
    const frioOk = camion.tiene_refrigeracion
    if (frioOk) {
      criteriosCumplidos++
      compatibilidades.push('Cuenta con equipo de refrigeración / cadena de frío')
    } else {
      incompatibilidades.push('La carga requiere equipo de refrigeración (cadena de frío)')
    }
    badges.push({
      tipo: 'frio',
      label: 'Frío / Refrigerado',
      cumple: frioOk,
      requerido: true,
    })
  }

  // 3. Rampa Hidráulica
  if (carga.requiere_rampa) {
    totalCriterios++
    const rampaOk = camion.tiene_rampa
    if (rampaOk) {
      criteriosCumplidos++
      compatibilidades.push('Cuenta con rampa hidráulica para carga pesada')
    } else {
      incompatibilidades.push('La carga requiere rampa o plataforma hidráulica')
    }
    badges.push({
      tipo: 'rampa',
      label: 'Rampa Hidráulica',
      cumple: rampaOk,
      requerido: true,
    })
  }

  // 4. Grúa / Pluma
  if (carga.requiere_grua) {
    totalCriterios++
    const gruaOk = camion.tiene_grua
    if (gruaOk) {
      criteriosCumplidos++
      compatibilidades.push('Cuenta con grúa pluma para maniobras de carga y descarga')
    } else {
      incompatibilidades.push('La carga requiere camión con grúa pluma')
    }
    badges.push({
      tipo: 'grua',
      label: 'Grúa / Pluma',
      cumple: gruaOk,
      requerido: true,
    })
  }

  // 5. Ayuda / Peoneta
  if (carga.requiere_ayuda) {
    totalCriterios++
    const ayudaOk = camion.ayuda_carga
    if (ayudaOk) {
      criteriosCumplidos++
      compatibilidades.push('Conductor ofrece peoneta / ayuda física de carga')
    } else {
      incompatibilidades.push('El cliente solicita peoneta / ayuda en carga y descarga')
    }
    badges.push({
      tipo: 'ayuda',
      label: 'Peoneta / Ayuda',
      cumple: ayudaOk,
      requerido: true,
    })
  }

  // 6. Volumen en m3
  if (carga.volumen_m3 && camion.volumen_m3) {
    totalCriterios++
    const volOk = carga.volumen_m3 <= camion.volumen_m3
    if (volOk) {
      criteriosCumplidos++
    } else {
      incompatibilidades.push(`Volumen excede el espacio (${carga.volumen_m3} m³ vs ${camion.volumen_m3} m³)`)
    }
    badges.push({
      tipo: 'volumen',
      label: `${carga.volumen_m3} m³`,
      cumple: volOk,
      requerido: true,
    })
  }

  // 7. Capacidad de Pallets
  if (carga.pallets && camion.pallets) {
    totalCriterios++
    const palOk = carga.pallets <= camion.pallets
    if (palOk) {
      criteriosCumplidos++
    } else {
      incompatibilidades.push(`Cantidad de pallets excede el pañol (${carga.pallets} vs ${camion.pallets} max)`)
    }
    badges.push({
      tipo: 'pallets',
      label: `${carga.pallets} pallets`,
      cumple: palOk,
      requerido: true,
    })
  }

  const esCompatible = incompatibilidades.length === 0
  const porcentajeMatch = totalCriterios > 0 ? Math.round((criteriosCumplidos / totalCriterios) * 100) : 100

  return {
    esCompatible,
    porcentajeMatch,
    incompatibilidades,
    compatibilidades,
    badges,
  }
}
