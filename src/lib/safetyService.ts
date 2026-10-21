/**
 * Servicio de Seguridad y Safety Toolkit para Camioneros de Chile (NORTIA Safety)
 */

export interface ContactoEmergencia {
  nombre: string
  telefono: string
  relacion: string
}

export const EMERGENCIAS_CHILE = [
  { nombre: 'Carabineros de Chile', numero: '133', icono: '👮' },
  { nombre: 'SAMU Ambulancia', numero: '131', icono: '🚑' },
  { nombre: 'Bomberos de Chile', numero: '132', icono: '🚒' },
  { nombre: 'Asistencia Autopistas MOP', numero: '1407', icono: '🛣️' },
]

export function generarMensajeSeguridadFamilia(
  origenTexto: string,
  destinoTexto: string,
  patente: string,
  viajeId: string
): string {
  const link = `https://nortia.cl/tracking/${viajeId}`
  return `Hola familia ❤️, voy en viaje de transporte con NORTIA desde ${origenTexto} hasta ${destinoTexto} en el camión patente ${patente}. Pueden seguir mi avance y estado del viaje en tiempo real aquí: ${link}`
}
