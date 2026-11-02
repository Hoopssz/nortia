import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { ThemeTogglePill } from '../../components/ThemeTogglePill'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import type { Enums } from '../../lib/database.types'

const ROLES: { value: Enums<'rol_usuario'>; icon: 'building' | 'truck' | 'package'; label: string; sub: string }[] = [
  { value: 'camionero', icon: 'truck', label: 'Soy Camionero / Transportista', sub: 'Tengo camión y busco cargas para viajar' },
  { value: 'negocio', icon: 'building', label: 'Soy Empresa / Negocio', sub: 'Necesito contratar un camión para mover mi carga' },
  { value: 'proveedor', icon: 'package', label: 'Soy Proveedor / Distribuidor', sub: 'Vendo productos o hago repartos frecuentes' },
]

export function RolePage() {
  const navigate = useNavigate()
  const { state, update } = useOnboarding()

  useEffect(() => {
    try {
      const prefill = localStorage.getItem('nortia_prefill_nombre')
      if (prefill && !state.nombre.trim()) {
        update({ nombre: prefill })
      }
    } catch {}
  }, [])

  const canContinue = state.nombre.trim().length > 0 && state.rol !== null

  return (
    <div
      className="px"
      style={{
        paddingTop: 20,
        paddingBottom: 36,
        maxWidth: 580,
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Barra superior */}
      <div className="between" style={{ marginBottom: 10, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star4Point size={15} color="var(--navy)" />
          <span className="eyebrow" style={{ margin: 0, fontSize: 13 }}>
            Paso 1 de 3 · Tus datos básicos
          </span>
        </div>
        <ThemeTogglePill />
      </div>

      {/* Barra de progreso */}
      <div className="steps" style={{ margin: '6px 0 18px', height: 8 }}>
        <span className="on" />
        <span />
        <span />
      </div>

      {/* Título grande y claro */}
      <div style={{ marginBottom: 18 }}>
        <h1 className="h2" style={{ margin: '0 0 6px', fontSize: 26, lineHeight: 1.25 }}>
          ¡Bienvenido a NORTIA!
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: 'var(--slate)', lineHeight: 1.45 }}>
          Escribe tu nombre, tu teléfono y toca cómo vas a usar la aplicación:
        </p>
      </div>

      {/* Datos de contacto con letra grande */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
        <div className="field" style={{ margin: 0 }}>
          <label style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>1. Tu nombre y apellido</label>
          <input
            value={state.nombre}
            onChange={(e) => update({ nombre: e.target.value })}
            placeholder="Ej. Juan Muñoz"
            style={{
              fontSize: 17,
              padding: '14px 16px',
              borderRadius: 14,
              background: 'var(--surface)',
              border: '2px solid var(--line)',
            }}
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>2. Tu teléfono / WhatsApp</label>
          <input
            type="tel"
            value={state.telefono}
            onChange={(e) => update({ telefono: e.target.value })}
            placeholder="Ej. +56 9 8765 4321"
            style={{
              fontSize: 17,
              padding: '14px 16px',
              borderRadius: 14,
              background: 'var(--surface)',
              border: '2px solid var(--line)',
            }}
          />
        </div>
      </div>

      {/* Selección de Rol con botones grandes */}
      <div style={{ marginBottom: 8, fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
        3. Toca una opción según tu trabajo:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {ROLES.map((r) => {
          const active = state.rol === r.value
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => update({ rol: r.value })}
              style={{
                width: '100%',
                padding: '16px 18px',
                cursor: 'pointer',
                borderRadius: 18,
                background: active ? 'var(--navy)' : 'var(--surface)',
                color: active ? '#FFFFFF' : 'var(--ink)',
                border: `2px solid ${active ? 'var(--navy)' : 'var(--line)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: active ? 'rgba(255, 255, 255, 0.2)' : 'var(--navy-tint)',
                  color: active ? '#FFFFFF' : 'var(--navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={r.icon} size={24} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.25 }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 14, opacity: active ? 0.92 : 0.75, marginTop: 3 }}>
                  {r.sub}
                </div>
              </div>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: active ? '2px solid #FFFFFF' : '2px solid var(--slate)',
                  background: active ? '#10B981' : 'transparent',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {active ? '✓' : ''}
              </div>
            </button>
          )
        })}
      </div>

      {/* Botón Continuar grande */}
      <button
        className="btn btn-primary"
        style={{
          padding: '16px 24px',
          fontSize: 17,
          fontWeight: 800,
          borderRadius: 18,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          opacity: canContinue ? 1 : 0.5,
          cursor: canContinue ? 'pointer' : 'not-allowed',
        }}
        disabled={!canContinue}
        onClick={() => navigate('/onboarding/regiones')}
      >
        <span>Siguiente paso →</span>
      </button>
    </div>
  )
}
