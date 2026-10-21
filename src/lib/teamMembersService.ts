/**
 * Servicio de Subcuentas y Equipo de Despacho para Empresas (NORTIA Multi-user Team)
 */

export type RolEquipo = 'admin' | 'bodega' | 'contabilidad'

export interface MiembroEquipo {
  id: string
  empresaId: string
  nombre: string
  email: string
  telefono?: string
  rol: RolEquipo
  sucursal?: string
  estado: 'activo' | 'invitado'
  agregadoEn: string
}

const STORAGE_KEY_TEAM = 'nortia_team_members_'

export function obtenerMiembrosEquipo(empresaId: string): MiembroEquipo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAM + empresaId)
    if (raw) return JSON.parse(raw)
    return inicializarEquipoSugerido(empresaId)
  } catch {
    return []
  }
}

export function guardarMiembroEquipo(
  empresaId: string,
  miembro: Omit<MiembroEquipo, 'id' | 'agregadoEn' | 'estado'>
): MiembroEquipo {
  const lista = obtenerMiembrosEquipo(empresaId)
  const nuevo: MiembroEquipo = {
    ...miembro,
    id: `USER-${Date.now()}`,
    estado: 'invitado',
    agregadoEn: new Date().toISOString(),
  }
  const actualizadas = [...lista, nuevo]
  try {
    localStorage.setItem(STORAGE_KEY_TEAM + empresaId, JSON.stringify(actualizadas))
    window.dispatchEvent(new Event('nortia_team_updated'))
  } catch (err) {
    console.error('Error guardando miembro del equipo:', err)
  }
  return nuevo
}

export function eliminarMiembroEquipo(empresaId: string, miembroId: string): void {
  const lista = obtenerMiembrosEquipo(empresaId)
  const filtradas = lista.filter((m) => m.id !== miembroId)
  try {
    localStorage.setItem(STORAGE_KEY_TEAM + empresaId, JSON.stringify(filtradas))
    window.dispatchEvent(new Event('nortia_team_updated'))
  } catch (err) {
    console.error('Error eliminando miembro del equipo:', err)
  }
}

export function inicializarEquipoSugerido(empresaId: string): MiembroEquipo[] {
  const sugeridos: MiembroEquipo[] = [
    {
      id: 'TEAM-1',
      empresaId,
      nombre: 'Rodrigo Morales',
      email: 'rmorales@empresa.cl',
      telefono: '+56 9 8877 6655',
      rol: 'bodega',
      sucursal: 'Centro de Distribución Quilicura',
      estado: 'activo',
      agregadoEn: new Date().toISOString(),
    },
    {
      id: 'TEAM-2',
      empresaId,
      nombre: 'Camila Sepúlveda',
      email: 'contabilidad@empresa.cl',
      telefono: '+56 9 4433 2211',
      rol: 'contabilidad',
      sucursal: 'Casa Matriz Las Condes',
      estado: 'activo',
      agregadoEn: new Date().toISOString(),
    },
  ]
  try {
    localStorage.setItem(STORAGE_KEY_TEAM + empresaId, JSON.stringify(sugeridos))
  } catch {}
  return sugeridos
}
