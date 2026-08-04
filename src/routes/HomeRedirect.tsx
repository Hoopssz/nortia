import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export function HomeRedirect() {
  const { perfil, loading } = useAuth()

  if (loading) return null
  if (!perfil?.rol) return <Navigate to="/onboarding/rol" replace />

  return <Navigate to={`/${perfil.rol}`} replace />
}
