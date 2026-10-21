/**
 * Servicio de Estimación de Peajes y Consumo de Petróleo Diésel en Chile (NORTIA Cost Calculator)
 */

export interface EstimacionCostosRuta {
  distanciaKm: number
  litrosDiesel: number
  costoDieselClp: number
  peajesEstimadosClp: number
  cantidadPeajes: number
  comisionNortiaClp: number
  gananciaLiquidaClp: number
}

// Precio promedio nacional de Diésel en Chile ($/L)
export const PRECIO_DIESEL_LITRO = 1040

// Rendimiento promedio según tipo de vehículo en carretera chilena (km/L)
export const RENDIMIENTO_KM_LITRO: Record<string, number> = {
  camioneta: 10.5,
  tres_cuartos: 7.2,
  camion: 4.8,
  rampla: 2.6,
  refrigerado: 2.4, // Consume extra por equipo de frío Thermo King
  plano: 3.2,
}

// Costo promedio por peaje troncal en Chile según tipo de camión ($ CLP)
export const COSTO_PROMEDIO_PEAJE: Record<string, number> = {
  camioneta: 3400,
  tres_cuartos: 4800,
  camion: 6900,
  rampla: 9200,
  refrigerado: 9200,
  plano: 6900,
}

/**
 * Calcula los peajes y consumo de petróleo entre origen y destino
 */
export function calcularCostosRuta(
  distanciaKm: number,
  tipoVehiculo: string = 'camion',
  tarifaFleteClp: number = 0
): EstimacionCostosRuta {
  const km = Math.max(distanciaKm, 20)
  const tipoKey = tipoVehiculo.toLowerCase()
  const rendimiento = RENDIMIENTO_KM_LITRO[tipoKey] || 4.5
  const costoPeajeUnidad = COSTO_PROMEDIO_PEAJE[tipoKey] || 6900

  // Estimación de litros de diésel
  const litrosDiesel = Math.round((km / rendimiento) * 10) / 10
  const costoDieselClp = Math.round(litrosDiesel * PRECIO_DIESEL_LITRO)

  // En la Ruta 5 de Chile hay en promedio 1 peaje troncal cada 90-120 km
  const cantidadPeajes = km < 50 ? 0 : Math.max(1, Math.round(km / 110))
  const peajesEstimadosClp = cantidadPeajes * costoPeajeUnidad

  // Comisión NORTIA estándar (12%)
  const comisionNortiaClp = Math.round(tarifaFleteClp * 0.12)

  // Ganancia líquida neta en el bolsillo del camionero
  const costosTotales = costoDieselClp + peajesEstimadosClp + comisionNortiaClp
  const gananciaLiquidaClp = Math.max(0, tarifaFleteClp - costosTotales)

  return {
    distanciaKm: km,
    litrosDiesel,
    costoDieselClp,
    peajesEstimadosClp,
    cantidadPeajes,
    comisionNortiaClp,
    gananciaLiquidaClp,
  }
}
