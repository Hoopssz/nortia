import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Enums, Tables } from '../lib/database.types'

export type Perfil = Tables<'perfiles'>
export type Rol = Enums<'rol_usuario'>

export interface AuthContextValue {
  session: Session | null
  perfil: Perfil | null
  roles: Rol[]
  loading: boolean
  refreshPerfil: () => Promise<void>
  switchRole: (rol: Rol) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
