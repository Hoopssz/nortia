import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type Perfil, type Rol } from './auth-context'
import { getErrorMessage } from '../lib/errors'

interface LocalStoredUser {
  id: string
  email: string
  perfil: Perfil | null
  roles: Rol[]
}

function getLocalUsersDb(): Record<string, LocalStoredUser> {
  try {
    const raw = localStorage.getItem('nortia_users_db')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalUsersDb(db: Record<string, LocalStoredUser>) {
  try {
    localStorage.setItem('nortia_users_db', JSON.stringify(db))
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPerfil(userId: string) {
    try {
      const [{ data: perfilData }, { data: rolesData }] = await Promise.all([
        supabase.from('perfiles').select('*').eq('id', userId).single(),
        supabase.from('perfil_roles').select('rol').eq('perfil_id', userId),
      ])
      if (perfilData) {
        setPerfil(perfilData)
        setRoles((rolesData ?? []).map((r) => r.rol))
        return
      }
    } catch {}

    // Fallback a almacenamiento local si Supabase está pausado u offline
    const activeEmail = localStorage.getItem('nortia_active_user_email')
    if (activeEmail) {
      const db = getLocalUsersDb()
      const record = db[activeEmail.toLowerCase()]
      if (record) {
        setPerfil(record.perfil)
        setRoles(record.roles)
      }
    }
  }

  async function refreshPerfil() {
    const activeEmail = localStorage.getItem('nortia_active_user_email')
    if (activeEmail) {
      const db = getLocalUsersDb()
      const record = db[activeEmail.toLowerCase()]
      if (record) {
        setPerfil(record.perfil)
        setRoles(record.roles)
        return
      }
    }
    if (session?.user.id) {
      await loadPerfil(session.user.id)
    }
  }

  useEffect(() => {
    const activeEmail = localStorage.getItem('nortia_active_user_email')
    if (activeEmail) {
      const db = getLocalUsersDb()
      const record = db[activeEmail.toLowerCase()]
      if (record) {
        setSession({ user: { id: record.id, email: record.email } } as unknown as Session)
        setPerfil(record.perfil)
        setRoles(record.roles)
        setLoading(false)
        return
      }
    }

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
      if (localStorage.getItem('nortia_demo_auth') || localStorage.getItem('nortia_active_user_email')) return
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

  function loginWithLocalUser(email: string, nombre?: string): { hasProfile: boolean } {
    const cleanEmail = email.trim().toLowerCase()
    const db = getLocalUsersDb()
    let record = db[cleanEmail]
    if (!record) {
      const newId = 'usr-' + Math.random().toString(36).slice(2, 10)
      record = {
        id: newId,
        email: cleanEmail,
        perfil: null,
        roles: [],
      }
      if (nombre) {
        try {
          localStorage.setItem('nortia_prefill_nombre', nombre)
        } catch {}
      }
      db[cleanEmail] = record
      saveLocalUsersDb(db)
    }
    localStorage.removeItem('nortia_demo_auth')
    localStorage.setItem('nortia_active_user_email', cleanEmail)
    setSession({ user: { id: record.id, email: record.email } } as unknown as Session)
    setPerfil(record.perfil)
    setRoles(record.roles)
    setLoading(false)
    return { hasProfile: Boolean(record.perfil?.rol) }
  }

  function completeLocalProfile(data: Partial<Perfil> & { regiones?: number[] }, rol: Rol, isAddingRole = false) {
    const activeEmail = localStorage.getItem('nortia_active_user_email') || session?.user?.email
    if (!activeEmail) return
    const cleanEmail = activeEmail.toLowerCase()
    const db = getLocalUsersDb()
    const existing = db[cleanEmail] || {
      id: session?.user?.id || 'usr-' + Math.random().toString(36).slice(2, 10),
      email: cleanEmail,
      perfil: null,
      roles: [],
    }
    const updatedPerfil: Perfil = {
      id: existing.id,
      nombre: data.nombre || existing.perfil?.nombre || cleanEmail.split('@')[0],
      telefono: data.telefono || existing.perfil?.telefono || '+56 9 0000 0000',
      rol,
      rut: data.rut || existing.perfil?.rut || null,
      razon_social: data.razon_social ?? existing.perfil?.razon_social ?? null,
      rubro: data.rubro ?? existing.perfil?.rubro ?? null,
      emite_factura: data.emite_factura ?? existing.perfil?.emite_factura ?? true,
      verificado: true,
      rating_prom: existing.perfil?.rating_prom ?? 5.0,
      total_resenas: existing.perfil?.total_resenas ?? 1,
      created_at: existing.perfil?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Perfil

    const updatedRoles = isAddingRole
      ? Array.from(new Set([...existing.roles, rol]))
      : Array.from(new Set([...existing.roles, rol]))

    db[cleanEmail] = {
      ...existing,
      perfil: updatedPerfil,
      roles: updatedRoles,
    }
    saveLocalUsersDb(db)
    localStorage.setItem('nortia_active_user_email', cleanEmail)
    setPerfil(updatedPerfil)
    setRoles(updatedRoles)
  }

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
    const activeEmail = localStorage.getItem('nortia_active_user_email')
    if (activeEmail) {
      const db = getLocalUsersDb()
      const record = db[activeEmail.toLowerCase()]
      if (record && record.perfil) {
        record.perfil = { ...record.perfil, rol }
        if (!record.roles.includes(rol)) {
          record.roles.push(rol)
        }
        saveLocalUsersDb(db)
        setPerfil(record.perfil)
        setRoles([...record.roles])
        return { error: null }
      }
    }

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
    localStorage.removeItem('nortia_active_user_email')
    setSession(null)
    setPerfil(null)
    setRoles([])
    try {
      await supabase.auth.signOut()
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        perfil,
        roles,
        loading,
        refreshPerfil,
        switchRole,
        signOut,
        loginDemo,
        loginAntigravity,
        loginWithLocalUser,
        completeLocalProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
