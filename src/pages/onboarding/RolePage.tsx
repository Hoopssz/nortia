import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { ThemeTogglePill } from '../../components/ThemeTogglePill'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import type { Enums } from '../../lib/database.types'

const ROLES: { value: Enums<'rol_usuario'>; icon: 'building' | 'truck' | 'package'; label: string; sub: string }[] = [
  { value: 'negocio', icon: 'building', label: 'Negocio', sub: 'Necesito mover carga de mi empresa' },
  { value: 'camionero', icon: 'truck', label: 'Camionero', sub: 'Tengo camión y busco viajes y retornos' },
  { value: 'proveedor', icon: 'package', label: 'Proveedor', sub: 'Distribuyo productos con rutas recurrentes' },
]

export function RolePage() {
  const navigate = useNavigate()
  const { state, update } = useOnboarding()

  const canContinue = state.nombre.trim().length > 0 && state.telefono.trim().length > 0 && state.rol !== null

  return (
    <div
      className="px"
      style={{
        paddingTop: 16,
        paddingBottom: 24,
        maxWidth: 540,
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Barra superior con Paso y ThemeTogglePill */}
      <div className="between" style={{ marginBottom: 6, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Star4Point size={13} color="var(--navy)" />
          <span className="eyebrow" style={{ margin: 0 }}>
            Paso 1 de 3 · Perfil de cuenta
          </span>
        </div>
        <ThemeTogglePill />
      </div>

      {/* Barra de progreso de 3 pasos con resplandor */}
      <div className="steps" style={{ margin: '4px 0 14px' }}>
        <span className="on" style={{ boxShadow: '0 0 10px var(--navy)' }} />
        <span />
        <span />
      </div>

      {/* Título y subtítulo */}
      <div style={{ marginBottom: 14 }}>
        <div className="h2" style={{ margin: '0 0 4px', fontSize: 22 }}>
          ¿Cómo usarás NORTIA?
        </div>
        <div className="sub" style={{ margin: 0, fontSize: 13.5 }}>
          Cuéntanos quién eres y elige el perfil que mejor describe tu operación.
        </div>
      </div>

      {/* Inputs compactos (Nombre y Teléfono) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 14 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>Tu nombre completo</label>
          <input
            value={state.nombre}
            onChange={(e) => update({ nombre: e.target.value })}
            placeholder="Ej. Juan Muñoz"
            style={{
              background: 'var(--card-glass-bg)',
              borderColor: 'var(--card-glass-border)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Teléfono móvil</label>
          <input
            value={state.telefono}
            onChange={(e) => update({ telefono: e.target.value })}
            placeholder="+56 9 1234 5678"
            style={{
              background: 'var(--card-glass-bg)',
              borderColor: 'var(--card-glass-border)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />
        </div>
      </div>

      {/* Tarjetas de Selección de Rol con resplandor Glowy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {ROLES.map((r) => {
          const active = state.rol === r.value
          return (
            <div
              key={r.value}
              className="glow-card"
              style={{
                padding: '12px 14px',
                cursor: 'pointer',
                borderRadius: 14,
                background: active
                  ? 'linear-gradient(135deg, var(--navy-tint) 0%, rgba(2, 132, 199, 0.04) 100%)'
                  : 'var(--card-glass-bg)',
                borderColor: active ? 'var(--navy)' : 'var(--card-glass-border)',
                boxShadow: active ? '0 0 20px -3px var(--navy-tint-2)' : 'var(--card-glass-shadow)',
                transition: 'all 0.18s ease',
                userSelect: 'none',
              }}
              onClick={() => update({ rol: r.value })}
            >
              <div className="row" style={{ gap: 12 }}>
                <div
                  className="ic-chip"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: active ? 'var(--navy)' : 'var(--navy-tint)',
                    color: active ? '#fff' : 'var(--navy)',
                    boxShadow: active ? '0 0 14px var(--navy)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon name={r.icon} size={20} strokeWidth={1.9} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {r.label}
                    {active && <Star4Point size={10} color="var(--navy)" />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>{r.sub}</div>
                </div>
                <div
                  className={`radio ${active ? 'on' : ''}`}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: active ? 'none' : '1.5px solid var(--slate-light)',
                    background: active ? 'var(--navy)' : 'transparent',
                    boxShadow: active ? '0 0 10px var(--navy)' : 'none',
                    color: '#fff',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {active && <Icon name="check" size={12} strokeWidth={2.8} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cuadro de ayuda translúcido */}
      <div
        className="glow-tile-cyan"
        style={{
          borderRadius: 12,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          padding: '10px 14px',
          marginBottom: 16,
        }}
      >
        <span style={{ color: 'var(--navy)', flexShrink: 0 }}>
          <Icon name="help" size={16} strokeWidth={2} />
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.45 }}>
          <b>Negocio</b> = fletes puntuales. <b>Camionero</b> = ofreces camión y fletes. <b>Proveedor</b> = entregas recurrentes.
        </span>
      </div>

      {/* Botón Continuar */}
      <button
        className="btn btn-primary"
        style={{
          padding: '13px 0',
          fontSize: 15,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: canContinue ? '0 8px 24px -4px var(--navy)' : 'none',
          transition: 'all 0.2s ease',
        }}
        disabled={!canContinue}
        onClick={() => navigate('/onboarding/regiones')}
      >
        <span>Continuar a Cobertura</span>
        <Icon name="arrowR" size={16} strokeWidth={2.4} />
      </button>
    </div>
  )
}
