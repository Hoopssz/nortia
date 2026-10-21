import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import { useAuth } from '../contexts/useAuth'

export function MobileBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { perfil } = useAuth()

  const rol = perfil?.rol || 'camionero'

  const items =
    rol === 'camionero'
      ? [
          { label: 'Inicio', path: '/camionero', icon: 'truck' as const },
          { label: 'Buscar', path: '/camionero/buscar', icon: 'search' as const },
          { label: 'Mapa', path: '/camionero/mapa-calor', icon: 'flame' as const },
          { label: 'Mensajes', path: '/mensajes', icon: 'message' as const },
          { label: 'Mi Cuenta', path: '/cuenta', icon: 'users' as const },
        ]
      : rol === 'proveedor'
        ? [
            { label: 'Productos', path: '/proveedor', icon: 'boxes' as const },
            { label: 'Publicar', path: '/proveedor/publicar-producto', icon: 'package' as const },
            { label: 'Mercado', path: '/negocio/mercado', icon: 'route' as const },
            { label: 'Mensajes', path: '/mensajes', icon: 'message' as const },
            { label: 'Bodega', path: '/cuenta', icon: 'building' as const },
          ]
        : [
            { label: 'Inicio', path: '/negocio', icon: 'boxes' as const },
            { label: 'Publicar', path: '/negocio/publicar', icon: 'package' as const },
            { label: 'Mercado B2B', path: '/negocio/mercado', icon: 'route' as const },
            { label: 'Mensajes', path: '/mensajes', icon: 'message' as const },
            { label: 'Empresa', path: '/cuenta', icon: 'building' as const },
          ]

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Navegación principal móvil"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: 'var(--card-glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--card-glass-border)',
        boxShadow: '0 -4px 20px rgba(10, 25, 47, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        height: 'calc(62px + env(safe-area-inset-bottom, 12px))',
      }}
    >
      {items.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/camionero' &&
            item.path !== '/negocio' &&
            item.path !== '/proveedor' &&
            location.pathname.startsWith(item.path))

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 2px 4px',
              gap: 3,
              transition: 'transform 0.1s ease, color 0.15s ease',
              color: isActive ? 'var(--navy)' : 'var(--slate)',
              position: 'relative',
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 24,
                  height: 3,
                  borderRadius: 99,
                  background: 'var(--navy)',
                }}
              />
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 28,
                borderRadius: 10,
                background: isActive ? 'var(--navy-tint)' : 'transparent',
                transition: 'background 0.15s ease',
              }}
            >
              <Icon
                name={item.icon}
                size={20}
                color={isActive ? 'var(--navy)' : 'var(--slate)'}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 800 : 600,
                letterSpacing: -0.2,
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
