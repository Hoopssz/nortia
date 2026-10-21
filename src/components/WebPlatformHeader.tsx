import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon, Star4Point } from './Icon'
import { NortiaLogo } from './NortiaLogo'
import { ThemeTogglePill } from './ThemeTogglePill'
import { NotificationBell } from './NotificationBell'
import { RoleSwitcher } from './RoleSwitcher'
import { useAuth } from '../contexts/useAuth'

export function WebPlatformHeader({ activeTab = '' }: { activeTab?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { perfil, session } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isCamionero = perfil?.rol === 'camionero'
  const isProveedor = perfil?.rol === 'proveedor'

  const navLinks = isCamionero
    ? [
        { label: 'Cargas Disponibles', path: '/camionero', icon: 'truck' as const, highlight: false },
        { label: 'Mapa de Calor', path: '/camionero/mapa-calor', icon: 'flame' as const, highlight: false },
        { label: 'Mensajes & Audios', path: '/mensajes', icon: 'message' as const, highlight: true },
        { label: 'Buscar Cargas', path: '/camionero/buscar', icon: 'search' as const, highlight: false },
        { label: 'Mis Fletes', path: '/camionero/fletes', icon: 'route' as const, highlight: false },
        { label: 'Retorno Vacío', path: '/camionero/retorno', icon: 'repeat' as const, highlight: false },
        { label: 'Ganancias', path: '/camionero/ganancias', icon: 'dollar' as const, highlight: false },
        { label: 'Historial & Facturas', path: '/historial', icon: 'doc' as const, highlight: false },
        { label: 'Mis Choferes', path: '/camionero/choferes', icon: 'users' as const, highlight: false },
        { label: 'Documentación', path: '/camionero/documentos', icon: 'doc' as const, highlight: false },
      ]
    : isProveedor
      ? [
          { label: 'Mis Productos', path: '/proveedor', icon: 'boxes' as const, highlight: false },
          { label: 'Publicar Producto', path: '/proveedor/publicar-producto', icon: 'package' as const, highlight: true },
          { label: 'Mercado B2B', path: '/negocio/mercado', icon: 'boxes' as const, highlight: false },
          { label: 'Mensajes & Audios', path: '/mensajes', icon: 'message' as const, highlight: false },
          { label: 'Historial', path: '/historial', icon: 'doc' as const, highlight: false },
          { label: 'Mi Bodega & DTE', path: '/cuenta', icon: 'building' as const, highlight: false },
        ]
      : [
          { label: 'Panel de Cargas', path: '/negocio', icon: 'boxes' as const },
          { label: 'Mercado Proveedores', path: '/negocio/mercado', icon: 'package' as const, highlight: true },
          { label: 'Publicar Carga', path: '/negocio/publicar', icon: 'truck' as const },
          { label: 'Mensajes & Audios', path: '/mensajes', icon: 'message' as const },
          { label: 'Historial & Facturas', path: '/historial', icon: 'doc' as const },
          { label: 'Mi Empresa & DTE', path: '/cuenta', icon: 'building' as const },
        ]

  const userInitials = (perfil?.nombre || perfil?.razon_social || session?.user.email || 'N')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: 'var(--card-glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--card-glass-border)',
        boxShadow: 'var(--card-glass-shadow)',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Lado Izquierdo: Logotipo y Badge de Portal */}
        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
          <div
            className="row"
            style={{ gap: 10, cursor: 'pointer', userSelect: 'none', alignItems: 'center' }}
            onClick={() => navigate(isCamionero ? '/camionero' : isProveedor ? '/proveedor' : '/negocio')}
          >
            <NortiaLogo variant="isotipo" size={38} />
            <div>
              <NortiaLogo variant="logotipo" size={34} />
              <div style={{ fontSize: 9.5, color: 'var(--navy)', fontWeight: 800, letterSpacing: 0.8, marginTop: 1 }}>
                {isCamionero ? 'PORTAL TRANSPORTISTAS' : isProveedor ? 'PORTAL PROVEEDORES' : 'PORTAL EMPRESAS'}
              </div>
            </div>
          </div>

          <span
            className="pill pill-glow"
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '3px 8px',
              display: 'none',
            }}
            id="portal-web-badge"
          >
            Web Real
          </span>
        </div>

        {/* Centro: Links de Navegación de Escritorio */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 4,
            overflowX: 'auto',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = activeTab ? activeTab === link.label : location.pathname === link.path
            const isHighlight = 'highlight' in link && Boolean(link.highlight)
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: isHighlight ? '7px 14px' : '7px 12px',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: isActive || isHighlight ? 800 : 600,
                  color: isHighlight
                    ? isActive ? '#FFFFFF' : 'var(--navy)'
                    : isActive ? 'var(--navy)' : 'var(--slate)',
                  background: isHighlight
                    ? isActive
                      ? 'var(--navy)'
                      : 'var(--navy-tint)'
                    : isActive
                      ? 'var(--navy-tint)'
                      : 'transparent',
                  border: isHighlight
                    ? isActive
                      ? '1px solid var(--navy)'
                      : '1px solid var(--navy-tint-2)'
                    : isActive
                      ? '1px solid var(--navy-tint-2)'
                      : '1px solid transparent',
                  boxShadow: isHighlight && isActive ? '0 0 14px -2px rgba(10, 25, 47, 0.35)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon
                  name={link.icon}
                  size={15}
                  color={isHighlight ? (isActive ? '#FFFFFF' : 'var(--navy)') : undefined}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span>{link.label}</span>
                {isActive && <Star4Point size={8} color={isHighlight ? '#38BDF8' : 'var(--navy)'} />}
              </button>
            )
          })}
        </nav>

        {/* Lado Derecho: Controles Globales (Tema, Notificaciones, Rol, Perfil) */}
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <ThemeTogglePill />
          <NotificationBell />
          <RoleSwitcher />

          {/* Avatar / Botón de Cuenta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px 4px 5px',
              borderRadius: 999,
              background: 'var(--card-glass-bg)',
              border: '1px solid var(--card-glass-border)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Ver mi perfil y cuenta"
            onClick={() => navigate('/cuenta')}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 11.5,
                boxShadow: '0 2px 8px -2px var(--navy)',
              }}
            >
              {userInitials}
            </div>
            <div style={{ display: 'none', flexDirection: 'column' }} className="desktop-nav">
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {perfil?.nombre || 'Mi Cuenta'}
              </span>
            </div>
          </div>

          {/* Botón Hamburguesa para Celulares / Pantallas pequeñas */}
          <button
            type="button"
            className="chip mobile-only-btn"
            style={{
              padding: '8px 10px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú de navegación"
          >
            <Icon name={mobileMenuOpen ? 'x' : 'sliders'} size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Menú Móvil Desplegable (Drawer) */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--line)',
            background: 'var(--card-glass-bg)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            padding: '14px 20px 20px',
            animation: 'appleFadeIn 0.2s ease both',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Navegación de la Plataforma
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              const isHighlight = 'highlight' in link && Boolean(link.highlight)
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate(link.path)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: isActive || isHighlight ? 800 : 500,
                    color: isHighlight
                      ? 'var(--navy)'
                      : isActive ? 'var(--navy)' : 'var(--ink)',
                    background: isHighlight
                      ? 'var(--navy-tint)'
                      : isActive ? 'var(--navy-tint)' : 'var(--paper)',
                    border: isHighlight
                      ? '1.5px solid var(--navy-tint-2)'
                      : isActive ? '1.5px solid var(--navy)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Icon
                    name={link.icon}
                    size={16}
                    color={isHighlight ? 'var(--navy)' : undefined}
                    strokeWidth={2}
                  />
                  <span>{link.label}</span>
                </button>
              )
            })}
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--slate)' }}>
              Sesión: <b>{perfil?.nombre || session?.user.email}</b>
            </span>
            <button
              type="button"
              className="chip"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={() => {
                setMobileMenuOpen(false)
                navigate('/cuenta')
              }}
            >
              Mi Perfil & Ajustes
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
