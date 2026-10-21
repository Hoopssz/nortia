import { useState, useEffect } from 'react'
import { Icon, Star4Point } from './Icon'
import { alternarTema, obtenerTemaEfectivo } from '../lib/themeService'

export function ThemeTogglePill({ className = '' }: { className?: string }) {
  const [tema, setTema] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    setTema(obtenerTemaEfectivo())

    function handleThemeChange(e: Event) {
      const customEvent = e as CustomEvent<'dark' | 'light'>
      if (customEvent.detail) {
        setTema(customEvent.detail)
      } else {
        setTema(obtenerTemaEfectivo())
      }
    }

    window.addEventListener('nortia_theme_changed', handleThemeChange)
    return () => window.removeEventListener('nortia_theme_changed', handleThemeChange)
  }, [])

  function handleClick() {
    const nuevo = alternarTema()
    setTema(nuevo)
  }

  const isDark = tema === 'dark'

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 11px',
        borderRadius: 999,
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.25) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(224, 242, 254, 0.5) 100%)',
        border: isDark
          ? '1px solid rgba(56, 189, 248, 0.32)'
          : '1px solid rgba(2, 132, 199, 0.2)',
        boxShadow: isDark
          ? '0 2px 10px -2px rgba(56, 189, 248, 0.25), 0 0 12px -3px rgba(56, 189, 248, 0.2)'
          : '0 2px 8px -2px rgba(2, 132, 199, 0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: 'translateZ(0)',
        height: 38,
        flexShrink: 0,
      }}
      title={isDark ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
      aria-label="Alternar tema de la aplicación"
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(254, 243, 199, 0.9)',
          color: isDark ? '#38BDF8' : '#D97706',
          transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.12)',
        }}
      >
        {isDark ? <Icon name="moon" size={13} strokeWidth={2.2} /> : <Icon name="sun" size={13} strokeWidth={2.2} />}
      </div>

      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: isDark ? '#F1F5F9' : '#0F172A',
          letterSpacing: -0.2,
        }}
      >
        {isDark ? 'Noche' : 'Día'}
      </span>

      <Star4Point size={10} color={isDark ? '#38BDF8' : '#265370'} />
    </button>
  )
}
