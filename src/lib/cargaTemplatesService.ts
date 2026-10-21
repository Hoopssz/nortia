/**
 * Servicio de Plantillas de Cargas Recurrentes para Empresas (NORTIA Load Templates)
 */

export interface PlantillaCarga {
  id: string
  clienteId: string
  nombrePlantilla: string
  tipoCarga: string
  descripcion?: string
  pesoKg: number
  volumenM3?: number
  pallets?: number
  origenTexto: string
  origenRegion: number
  origenLat?: number
  origenLng?: number
  destinoTexto: string
  destinoRegion: number
  destinoLat?: number
  destinoLng?: number
  tipoVehiculo: string
  requiereFrio: boolean
  requiereRampa: boolean
  requiereGrua: boolean
  requiereAyuda: boolean
  precioReferencia?: number
  frecuencia?: string
  usadaVeces: number
  creadaEn: string
}

const STORAGE_KEY_TEMPLATES = 'nortia_carga_templates_'

export function obtenerPlantillas(clienteId: string): PlantillaCarga[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES + clienteId)
    if (raw) return JSON.parse(raw)
    return inicializarPlantillasSugeridas(clienteId)
  } catch {
    return []
  }
}

export function guardarPlantilla(
  clienteId: string,
  plantilla: Omit<PlantillaCarga, 'id' | 'usadaVeces' | 'creadaEn'>
): PlantillaCarga {
  const lista = obtenerPlantillas(clienteId)
  const nueva: PlantillaCarga = {
    ...plantilla,
    id: `TMPL-${Date.now()}`,
    usadaVeces: 1,
    creadaEn: new Date().toISOString(),
  }
  const actualizadas = [nueva, ...lista]
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES + clienteId, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_templates_updated'))
  } catch (err) {
    console.error('Error guardando plantilla de carga:', err)
  }
  return nueva
}

export function eliminarPlantilla(clienteId: string, plantillaId: string): void {
  const lista = obtenerPlantillas(clienteId)
  const filtradas = lista.filter((t) => t.id !== plantillaId)
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES + clienteId, JSON.stringify(filtradas))
    window.dispatchEvent(new Event('nortia_templates_updated'))
  } catch (err) {
    console.error('Error eliminando plantilla:', err)
  }
}

export function incrementarUsoPlantilla(clienteId: string, plantillaId: string): void {
  const lista = obtenerPlantillas(clienteId)
  const actualizadas = lista.map((t) =>
    t.id === plantillaId ? { ...t, usadaVeces: (t.usadaVeces || 1) + 1 } : t
  )
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES + clienteId, JSON.stringify(actualizadas))
  } catch {}
}

export function inicializarPlantillasSugeridas(clienteId: string): PlantillaCarga[] {
  const sugeridas: PlantillaCarga[] = [
    {
      id: 'TMPL-AGRO-1',
      clienteId,
      nombrePlantilla: 'Despacho Semanal Fruta Fresca (Exportación)',
      tipoCarga: 'Fruta de exportación (Cerezas / Manzanas)',
      descripcion: 'Pallets con embalaje térmico y precinto de exportación.',
      pesoKg: 22000,
      volumenM3: 60,
      pallets: 24,
      origenTexto: 'Curicó, Región del Maule',
      origenRegion: 7,
      origenLat: -34.9828,
      origenLng: -71.2394,
      destinoTexto: 'San Antonio (Puerto Terrestre), Región de Valparaíso',
      destinoRegion: 5,
      destinoLat: -33.5833,
      destinoLng: -71.6167,
      tipoVehiculo: 'refrigerado',
      requiereFrio: true,
      requiereRampa: false,
      requiereGrua: false,
      requiereAyuda: false,
      precioReferencia: 420000,
      frecuencia: 'Semanal',
      usadaVeces: 6,
      creadaEn: new Date().toISOString(),
    },
    {
      id: 'TMPL-RETAIL-2',
      clienteId,
      nombrePlantilla: 'Distribución Bodega Central a Sucursal',
      tipoCarga: 'Abarrotes y Alimentos no perecibles',
      descripcion: 'Cajas selladas sobre pallets europeos. Requiere rampa hidráulica.',
      pesoKg: 5000,
      volumenM3: 20,
      pallets: 8,
      origenTexto: 'Quilicura, Región Metropolitana',
      origenRegion: 13,
      origenLat: -33.3667,
      origenLng: -70.7333,
      destinoTexto: 'Rancagua, Región de O\'Higgins',
      destinoRegion: 6,
      destinoLat: -34.1708,
      destinoLng: -70.7444,
      tipoVehiculo: 'tres_cuartos',
      requiereFrio: false,
      requiereRampa: true,
      requiereGrua: false,
      requiereAyuda: true,
      precioReferencia: 180000,
      frecuencia: 'Quincenal',
      usadaVeces: 4,
      creadaEn: new Date().toISOString(),
    },
  ]
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES + clienteId, JSON.stringify(sugeridas))
  } catch {}
  return sugeridas
}
