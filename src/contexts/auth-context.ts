import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Tables } from '../lib/database.types'

export type Perfil = Tables<'perfiles'>

export interface AuthContextValue {
  session: Session | null
  perfil: Perfil | null
  loading: boolean
  refreshPerfil: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
