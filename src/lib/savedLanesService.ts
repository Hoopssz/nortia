/**
 * Servicio de Rutas Favoritas y Alertas de Corredor (Saved Lanes de NORTIA)
 */

export interface RutaFavorita {
  id: string
  camioneroId: string
  nombre: string
  origenRegion: number
  destinoRegion: number
  origenTexto?: string
  destinoTexto?: string
  diasSemana?: string[]
  tarifaMinimaClp?: number
  alertasActivas: boolean
  creadaEn: string
}

const STORAGE_KEY_SAVED_LANES = 'nortia_rutas_favoritas_'

export function obtenerRutasFavoritas(camioneroId: string): RutaFavorita[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_LANES + camioneroId)
    if (raw) return JSON.parse(raw)

    // Rutas iniciales sugeridas por defecto para transportistas chilenos
    return inicializarRutasSugeridas(camioneroId)
  } catch {
    return []
  }
}

export function guardarRutaFavorita(
  camioneroId: string,
  ruta: Omit<RutaFavorita, 'id' | 'creadaEn' | 'camioneroId'>
): RutaFavorita {
  const lista = obtenerRutasFavoritas(camioneroId)
  const nueva: RutaFavorita = {
    ...ruta,
    id: `LANE-${Date.now()}`,
    camioneroId,
    creadaEn: new Date().toISOString(),
  }
  const actualizadas = [...lista, nueva]
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_LANES + camioneroId, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_lanes_updated'))
  } catch (err) {
    console.error('Error guardando ruta favorita:', err)
  }
  return nueva
}

export function eliminarRutaFavorita(camioneroId: string, rutaId: string): void {
  const lista = obtenerRutasFavoritas(camioneroId)
  const filtradas = lista.filter((r) => r.id !== rutaId)
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_LANES + camioneroId, JSON.stringify(filtradas))
    window.dispatchEvent(new Event('nortia_lanes_updated'))
  } catch (err) {
    console.error('Error eliminando ruta favorita:', err)
  }
}

export function toggleAlertasRuta(camioneroId: string, rutaId: string): void {
  const lista = obtenerRutasFavoritas(camioneroId)
  const actualizadas = lista.map((r) =>
    r.id === rutaId ? { ...r, alertasActivas: !r.alertasActivas } : r
  )
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_LANES + camioneroId, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_lanes_updated'))
  } catch (err) {
    console.error('Error actualizando alerta de ruta:', err)
  }
}

export function inicializarRutasSugeridas(camioneroId: string): RutaFavorita[] {
  const sugeridas: RutaFavorita[] = [
    {
      id: 'LANE-MOCK-1',
      camioneroId,
      nombre: 'Santiago ↔ Biobío (Ruta 5 Sur)',
      origenRegion: 13, // Metropolitana
      destinoRegion: 8, // Biobío
      diasSemana: ['Lun', 'Mié', 'Vie'],
      tarifaMinimaClp: 300000,
      alertasActivas: true,
      creadaEn: new Date().toISOString(),
    },
    {
      id: 'LANE-MOCK-2',
      camioneroId,
      nombre: 'Maule ↔ Valparaíso / Puertos',
      origenRegion: 7, // Maule
      destinoRegion: 5, // Valparaíso
      diasSemana: ['Mar', 'Jue'],
      tarifaMinimaClp: 250000,
      alertasActivas: true,
      creadaEn: new Date().toISOString(),
    },
  ]
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_LANES + camioneroId, JSON.stringify(sugeridas))
  } catch {}
  return sugeridas
}
