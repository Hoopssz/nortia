import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import type { Enums } from '../lib/database.types'

type Rol = Enums<'rol_usuario'>

export function RoleGate({ rol, children }: { rol: Rol; children: ReactNode }) {
  const { perfil, loading } = useAuth()

  if (loading) return null
  if (!perfil?.rol) return <Navigate to="/onboarding/rol" replace />
  if (perfil.rol !== rol) return <Navigate to="/home" replace />

  return <>{children}</>
}
