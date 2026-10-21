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
    const demoRol = localStorage.getItem('nortia_demo_auth')
    if (demoRol === 'antigravity') {
      const activeRol = (localStorage.getItem('nortia_antigravity_rol') as Rol) || 'camionero'
      setSession({ user: { id: 'antigravity-master-id', email: 'antigravity@nortia.cl' } } as unknown as Session)
      setPerfil({
        id: 'antigravity-master-id',
        nombre: 'Antigravity Master',
        razon_social: 'Antigravity Logistics SpA',
        rol: activeRol,
        rut: '77.999.888-K',
        telefono: '+56 9 8765 4321',
        verificado: true,
        rating_prom: 5.0,
        total_resenas: 48,
      } as unknown as Perfil)
      setRoles(['camionero', 'negocio', 'proveedor'])
      setLoading(false)
      return
    }

    if (demoRol) {
      const rol = demoRol as Rol
      setSession({ user: { id: 'demo-user-123', email: 'demo@nortia.cl' } } as unknown as Session)
      setPerfil({
        id: 'demo-user-123',
        nombre: rol === 'camionero' ? 'Transportista Demo' : 'Empresa Demo',
        razon_social: rol === 'negocio' ? 'Agrocomercial Norte SpA' : null,
        rol,
        rut: '76.123.456-7',
        verificado: true,
        rating_prom: 4.9,
        total_resenas: 18,
      } as unknown as Perfil)
      setRoles([rol])
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user.id) {
        await loadPerfil(session.user.id)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (localStorage.getItem('nortia_demo_auth')) return
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

  function loginAntigravity(rolInicial: Rol = 'camionero') {
    localStorage.setItem('nortia_demo_auth', 'antigravity')
    localStorage.setItem('nortia_antigravity_rol', rolInicial)
    setSession({ user: { id: 'antigravity-master-id', email: 'antigravity@nortia.cl' } } as unknown as Session)
    setPerfil({
      id: 'antigravity-master-id',
      nombre: 'Antigravity Master',
      razon_social: 'Antigravity Logistics SpA',
      rol: rolInicial,
      rut: '77.999.888-K',
      telefono: '+56 9 8765 4321',
      verificado: true,
      rating_prom: 5.0,
      total_resenas: 48,
    } as unknown as Perfil)
    setRoles(['camionero', 'negocio', 'proveedor'])
    setLoading(false)
  }

  function loginDemo(rol: 'negocio' | 'camionero' | 'antigravity') {
    if (rol === 'antigravity') {
      loginAntigravity('camionero')
      return
    }
    localStorage.setItem('nortia_demo_auth', rol)
    setSession({ user: { id: 'demo-user-123', email: 'demo@nortia.cl' } } as unknown as Session)
    setPerfil({
      id: 'demo-user-123',
      nombre: rol === 'camionero' ? 'Transportista Demo' : 'Empresa Demo',
      razon_social: rol === 'negocio' ? 'Agrocomercial Norte SpA' : null,
      rol,
      rut: '76.123.456-7',
      verificado: true,
      rating_prom: 4.9,
      total_resenas: 18,
    } as unknown as Perfil)
    setRoles([rol])
    setLoading(false)
  }

  async function switchRole(rol: Rol) {
    const demoAuth = localStorage.getItem('nortia_demo_auth')
    if (demoAuth === 'antigravity') {
      loginAntigravity(rol)
      return { error: null }
    }
    if (demoAuth) {
      loginDemo(rol === 'camionero' ? 'camionero' : 'negocio')
      return { error: null }
    }
    const { error } = await supabase.rpc('cambiar_rol_activo', { p_rol: rol })
    if (error) return { error: getErrorMessage(error) }
    await refreshPerfil()
    return { error: null }
  }

  async function signOut() {
    localStorage.removeItem('nortia_demo_auth')
    localStorage.removeItem('nortia_antigravity_rol')
    setSession(null)
    setPerfil(null)
    setRoles([])
    try {
      await supabase.auth.signOut()
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ session, perfil, roles, loading, refreshPerfil, switchRole, signOut, loginDemo, loginAntigravity }}>
      {children}
    </AuthContext.Provider>
  )
}
