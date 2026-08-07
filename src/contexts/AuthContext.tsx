import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type Perfil, type Rol } from './auth-context'
import { getErrorMessage } from '../lib/errors'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPerfil(userId: string) {
    const [{ data: perfilData }, { data: rolesData }] = await Promise.all([
      supabase.from('perfiles').select('*').eq('id', userId).single(),
      supabase.from('perfil_roles').select('rol').eq('perfil_id', userId),
    ])
    setPerfil(perfilData ?? null)
    setRoles((rolesData ?? []).map((r) => r.rol))
  }

  async function refreshPerfil() {
    if (session?.user.id) {
      await loadPerfil(session.user.id)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user.id) {
        await loadPerfil(session.user.id)
      }
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user.id) {
        await loadPerfil(session.user.id)
      } else {
        setPerfil(null)
        setRoles([])
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  async function switchRole(rol: Rol) {
    const { error } = await supabase.rpc('cambiar_rol_activo', { p_rol: rol })
    if (error) return { error: getErrorMessage(error) }
    await refreshPerfil()
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, perfil, roles, loading, refreshPerfil, switchRole, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
