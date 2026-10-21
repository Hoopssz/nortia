/**
 * Servicio de Gestión de Choferes / Conductores de Flota y Bolsa de Trabajo (NORTIA Flotas)
 */

export interface Chofer {
  id: string
  transportistaId?: string
  nombreCompleto: string
  rut: string
  telefono: string
  licenciaClase: 'A5' | 'A4' | 'A2' | 'B'
  regionCodigo?: number
  regionNombre?: string
  experienciaAnos?: number
  disponible?: boolean
  camionPatente?: string
  creadoEn: string
}

export interface InvitacionFlota {
  id: string
  transportistaId: string
  transportistaNombre: string
  choferId: string
  choferNombre: string
  mensaje?: string
  estado: 'pendiente' | 'aceptada' | 'rechazada'
  fecha: string
}

const STORAGE_KEY_CHOFERES = 'nortia_choferes_flota_'
const STORAGE_KEY_VIAJE_CHOFER = 'nortia_viaje_chofer_asignado_'
const STORAGE_KEY_INVITACIONES = 'nortia_invitaciones_flota_'

// Mock inicial de choferes profesionales verificados en Chile disponibles para trabajar
export const CHOFERES_DISPONIBLES_MOCK: Chofer[] = [
  {
    id: 'CH-DISP-1',
    nombreCompleto: 'Carlos Mendoza Morales',
    rut: '14.289.431-K',
    telefono: '+56 9 8234 1122',
    licenciaClase: 'A5',
    regionCodigo: 13,
    regionNombre: 'Metropolitana de Santiago',
    experienciaAnos: 9,
    disponible: true,
    creadoEn: '2026-01-10T10:00:00Z',
  },
  {
    id: 'CH-DISP-2',
    nombreCompleto: 'Roberto Silva Valenzuela',
    rut: '16.543.210-4',
    telefono: '+56 9 7654 3210',
    licenciaClase: 'A5',
    regionCodigo: 8,
    regionNombre: 'Biobío (Concepción / Los Ángeles)',
    experienciaAnos: 12,
    disponible: true,
    creadoEn: '2026-01-15T11:00:00Z',
  },
  {
    id: 'CH-DISP-3',
    nombreCompleto: 'Jorge Andrés Tapia',
    rut: '15.112.987-3',
    telefono: '+56 9 9123 4567',
    licenciaClase: 'A4',
    regionCodigo: 7,
    regionNombre: 'Maule (Curicó / Talca)',
    experienciaAnos: 6,
    disponible: true,
    creadoEn: '2026-02-01T12:00:00Z',
  },
  {
    id: 'CH-DISP-4',
    nombreCompleto: 'Héctor Gómez Cárdenas',
    rut: '17.890.123-5',
    telefono: '+56 9 6543 2198',
    licenciaClase: 'A5',
    regionCodigo: 10,
    regionNombre: 'Los Lagos (Puerto Montt / Osorno)',
    experienciaAnos: 15,
    disponible: true,
    creadoEn: '2026-02-05T09:30:00Z',
  },
  {
    id: 'CH-DISP-5',
    nombreCompleto: 'Mauricio Barraza Pizarro',
    rut: '13.987.654-2',
    telefono: '+56 9 8877 6655',
    licenciaClase: 'A4',
    regionCodigo: 5,
    regionNombre: 'Valparaíso / San Antonio',
    experienciaAnos: 7,
    disponible: true,
    creadoEn: '2026-02-10T14:00:00Z',
  },
]

export function obtenerChoferesFlota(transportistaId: string): Chofer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHOFERES + transportistaId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function guardarChoferFlota(
  transportistaId: string,
  chofer: Omit<Chofer, 'id' | 'creadoEn' | 'transportistaId'>
): Chofer {
  const lista = obtenerChoferesFlota(transportistaId)
  const nuevoChofer: Chofer = {
    ...chofer,
    id: `CHOFER-${Date.now()}`,
    transportistaId,
    creadoEn: new Date().toISOString(),
  }
  const actualizada = [...lista, nuevoChofer]
  try {
    localStorage.setItem(STORAGE_KEY_CHOFERES + transportistaId, JSON.stringify(actualizada))
  } catch (err) {
    console.error('Error guardando chofer:', err)
  }
  return nuevoChofer
}

export function eliminarChoferFlota(transportistaId: string, choferId: string): void {
  const lista = obtenerChoferesFlota(transportistaId)
  const filtrada = lista.filter((c) => c.id !== choferId)
  try {
    localStorage.setItem(STORAGE_KEY_CHOFERES + transportistaId, JSON.stringify(filtrada))
  } catch (err) {
    console.error('Error eliminando chofer:', err)
  }
}

export function asignarChoferAViaje(viajeId: string, chofer: Chofer | null): void {
  try {
    if (!chofer) {
      localStorage.removeItem(STORAGE_KEY_VIAJE_CHOFER + viajeId)
    } else {
      localStorage.setItem(STORAGE_KEY_VIAJE_CHOFER + viajeId, JSON.stringify(chofer))
    }
  } catch (err) {
    console.error('Error asignando chofer a viaje:', err)
  }
}

export function obtenerChoferViaje(viajeId: string): Chofer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VIAJE_CHOFER + viajeId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Invitaciones de Flota
export function obtenerInvitacionesFlota(): InvitacionFlota[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVITACIONES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function enviarInvitacionFlota(
  transportistaId: string,
  transportistaNombre: string,
  chofer: Chofer,
  mensaje?: string
): InvitacionFlota {
  const invitaciones = obtenerInvitacionesFlota()
  const nueva: InvitacionFlota = {
    id: `INV-${Date.now()}`,
    transportistaId,
    transportistaNombre,
    choferId: chofer.id,
    choferNombre: chofer.nombreCompleto,
    mensaje: mensaje || 'Te invitamos a unirte a nuestra flota de camiones en NORTIA.',
    estado: 'pendiente',
    fecha: new Date().toLocaleDateString('es-CL'),
  }
  const actualizadas = [nueva, ...invitaciones]
  try {
    localStorage.setItem(STORAGE_KEY_INVITACIONES, JSON.stringify(actualizadas))
  } catch (err) {
    console.error('Error guardando invitación:', err)
  }
  return nueva
}

export function responderInvitacionFlota(
  invitacionId: string,
  estado: 'aceptada' | 'rechazada',
  choferData?: Chofer
): void {
  const invitaciones = obtenerInvitacionesFlota()
  const index = invitaciones.findIndex((i) => i.id === invitacionId)
  if (index !== -1) {
    invitaciones[index].estado = estado
    try {
      localStorage.setItem(STORAGE_KEY_INVITACIONES, JSON.stringify(invitaciones))
    } catch (err) {
      console.error('Error actualizando invitación:', err)
    }

    // Si fue aceptada, agregar chofer automáticamente a la flota del transportista
    if (estado === 'aceptada' && choferData) {
      guardarChoferFlota(invitaciones[index].transportistaId, {
        nombreCompleto: choferData.nombreCompleto,
        rut: choferData.rut,
        telefono: choferData.telefono,
        licenciaClase: choferData.licenciaClase,
        regionCodigo: choferData.regionCodigo,
        regionNombre: choferData.regionNombre,
      })
    }
  }
}
