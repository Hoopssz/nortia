import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import type { Enums } from '../../lib/database.types'

const ROLES: { value: Enums<'rol_usuario'>; icon: 'building' | 'truck' | 'package'; label: string; sub: string }[] = [
  { value: 'negocio', icon: 'building', label: 'Negocio', sub: 'Necesito mover carga' },
  { value: 'camionero', icon: 'truck', label: 'Camionero', sub: 'Tengo camión y busco carga' },
  { value: 'proveedor', icon: 'package', label: 'Proveedor', sub: 'Distribuyo productos' },
]

export function RolePage() {
  const navigate = useNavigate()
  const { state, update } = useOnboarding()

  const canContinue = state.nombre.trim().length > 0 && state.telefono.trim().length > 0 && state.rol !== null

  return (
    <div className="px" style={{ paddingTop: 20, paddingBottom: 24, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="steps">
        <span className="on" />
        <span />
        <span />
      </div>
      <div className="eyebrow">Paso 1 de 3 · Cuenta</div>
      <div className="h2">¿Cómo usarás NORTIA?</div>
      <div className="sub">Cuéntanos quién eres y elige el perfil que mejor te describe.</div>

      <div className="field">
        <label>Tu nombre</label>
        <input value={state.nombre} onChange={(e) => update({ nombre: e.target.value })} placeholder="Juan Muñoz" />
      </div>
      <div className="field">
        <label>Teléfono</label>
        <input
          value={state.telefono}
          onChange={(e) => update({ telefono: e.target.value })}
          placeholder="+56 9 1234 5678"
        />
      </div>

      {ROLES.map((r) => {
        const active = state.rol === r.value
        return (
          <div
            key={r.value}
            className={`card selectable ${active ? 'active' : ''}`}
            onClick={() => update({ rol: r.value })}
          >
            <div className="row">
              <div className="ic-chip" style={active ? { background: 'var(--navy)', color: '#fff' } : undefined}>
                <Icon name={r.icon} size={22} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: 'var(--slate)' }}>{r.sub}</div>
              </div>
              <div className={`radio ${active ? 'on' : ''}`}>{active && <Icon name="check" size={12} strokeWidth={2.6} />}</div>
            </div>
          </div>
        )
      })}

      <div
        className="card flat"
        style={{
          background: 'var(--navy-tint)',
          border: 'none',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          padding: '13px 15px',
        }}
      >
        <span style={{ color: 'var(--navy)', flexShrink: 0 }}>
          <Icon name="help" size={18} strokeWidth={1.9} />
        </span>
        <span style={{ fontSize: 12, color: 'var(--navy-700)', lineHeight: 1.5 }}>
          <b>Negocio</b> = fletes puntuales. <b>Proveedor</b> = rutas y entregas recurrentes.
        </span>
      </div>

      <button
        className="btn btn-primary"
        disabled={!canContinue}
        onClick={() => navigate('/onboarding/regiones')}
      >
        Continuar <Icon name="arrowR" size={18} strokeWidth={2} />
      </button>
    </div>
  )
}
