import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type Perfil } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadPerfil(userId: string) {
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single()
    setPerfil(data ?? null)
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
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, perfil, loading, refreshPerfil, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
