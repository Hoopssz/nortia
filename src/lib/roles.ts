import type { Enums } from './database.types'

export type Rol = Enums<'rol_usuario'>

export const ROL_ORDER: Rol[] = ['negocio', 'camionero', 'proveedor']

export const ROL_META: Record<Rol, { label: string; icon: 'building' | 'truck' | 'package' }> = {
  negocio: { label: 'Negocio', icon: 'building' },
  camionero: { label: 'Camionero', icon: 'truck' },
  proveedor: { label: 'Proveedor', icon: 'package' },
}

export const AGREGAR_ROL_PATH: Record<Rol, string> = {
  camionero: '/onboarding/camion?agregar=1',
  negocio: '/onboarding/perfil?agregar=negocio',
  proveedor: '/onboarding/perfil?agregar=proveedor',
}
