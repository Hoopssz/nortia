import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { AGREGAR_ROL_PATH, type Rol } from '../lib/roles'

export function RoleGate({ rol, children }: { rol: Rol; children: ReactNode }) {
  const { perfil, roles, loading, switchRole } = useAuth()
  const habilitado = roles.includes(rol)

  useEffect(() => {
    if (!loading && perfil?.rol && perfil.rol !== rol && habilitado) {
      switchRole(rol)
    }
  }, [loading, perfil?.rol, rol, habilitado, switchRole])

  if (loading) return null
  if (!perfil?.rol) return <Navigate to="/onboarding/rol" replace />
  if (!habilitado) return <Navigate to={AGREGAR_ROL_PATH[rol]} replace />

  return <>{children}</>
}
