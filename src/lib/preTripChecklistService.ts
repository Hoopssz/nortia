/**
 * Servicio de Checklist Pre-Viaje de Seguridad («La Vuelta del Perro») para Camiones en Chile
 * Requisito preventivo exigido por faenas mineras, forestales y centros de distribución.
 */

export interface ItemChecklist {
  id: string
  numero: number
  titulo: string
  descripcion: string
  critico: boolean
}

export const ITEMS_CHECKLIST_PREVIAJE: ItemChecklist[] = [
  {
    id: 'check-neumaticos',
    numero: 1,
    titulo: 'Presión y Estado de Neumáticos',
    descripcion: 'Sin cortes laterales, rodado suficiente y pernos de rueda bien torqueados.',
    critico: true,
  },
  {
    id: 'check-luces',
    numero: 2,
    titulo: 'Luces, Focos y Señalizadores',
    descripcion: 'Luces altas, bajas, frenos, reversa y destellantes en tracto y rampla.',
    critico: true,
  },
  {
    id: 'check-amarres',
    numero: 3,
    titulo: 'Trincas y Fajas de Amarre de Carga',
    descripcion: 'Cinchas tensadas con matraca, carga acuñada y lonas/carpas amarradas.',
    critico: true,
  },
  {
    id: 'check-extintor',
    numero: 4,
    titulo: 'Extintor y Elementos de Emergencia',
    descripcion: 'Extintor 10kg PQS cargado y vigente, triángulos y chaleco reflectante.',
    critico: true,
  },
  {
    id: 'check-frenos',
    numero: 5,
    titulo: 'Frenos de Aire y Pulmones',
    descripcion: 'Presión de compresor sobre 100 PSI, sin fugas audibles en acoples de aire.',
    critico: true,
  },
  {
    id: 'check-cunas',
    numero: 6,
    titulo: 'Cuñas de Bloqueo y Conos',
    descripcion: '2 cuñas reglamentarias y conos para detención preventiva en berma.',
    critico: false,
  },
]

export interface CertificadoPreViaje {
  viajeId: string
  conductorNombre: string
  patente: string
  itemsAprobados: string[]
  observaciones?: string
  aprobado: boolean
  fechaInspeccion: string
}

const STORAGE_KEY_CHECKLIST = 'nortia_pretrip_checklist_'

export function obtenerCertificadoPreViaje(viajeId: string): CertificadoPreViaje | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKLIST + viajeId)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function guardarCertificadoPreViaje(
  viajeId: string,
  certificado: CertificadoPreViaje
): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHECKLIST + viajeId, JSON.stringify(certificado))
    window.dispatchEvent(new Event('nortia_pretrip_updated'))
  } catch (err) {
    console.error('Error guardando checklist pre-viaje:', err)
  }
}
