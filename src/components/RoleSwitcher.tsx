import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { useAuth } from '../contexts/useAuth'
import { AGREGAR_ROL_PATH, ROL_META, ROL_ORDER, type Rol } from '../lib/roles'

export function RoleSwitcher() {
  const navigate = useNavigate()
  const { perfil, roles, switchRole } = useAuth()
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState<Rol | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!perfil?.rol) return null
  const activo = perfil.rol

  async function handleSelect(rol: Rol) {
    if (rol === activo) {
      setOpen(false)
      return
    }
    if (!roles.includes(rol)) {
      navigate(AGREGAR_ROL_PATH[rol])
      return
    }
    setSwitching(rol)
    setError(null)
    const { error } = await switchRole(rol)
    setSwitching(null)
    if (error) {
      setError(error)
      return
    }
    setOpen(false)
    navigate(`/${rol}`)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="row"
        style={{
          gap: 6,
          cursor: 'pointer',
          background: 'var(--navy-tint)',
          borderRadius: 10,
          padding: '6px 10px',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ color: 'var(--navy)' }}>
          <Icon name={ROL_META[activo].icon} size={15} strokeWidth={1.8} />
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)' }}>{ROL_META[activo].label}</span>
        <span
          style={{
            color: 'var(--navy)',
            display: 'flex',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform .15s',
          }}
        >
          <Icon name="chevR" size={13} strokeWidth={2} />
        </span>
      </div>

      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 44,
            left: 0,
            zIndex: 20,
            width: 200,
            padding: '6px 0',
            boxShadow: 'var(--shadow-lift)',
          }}
        >
          {ROL_ORDER.map((rol) => {
            const habilitado = roles.includes(rol)
            const esActivo = rol === activo
            return (
              <div
                key={rol}
                className="row"
                style={{
                  gap: 10,
                  padding: '10px 14px',
                  cursor: switching ? 'default' : 'pointer',
                  opacity: switching && switching !== rol ? 0.5 : 1,
                }}
                onClick={() => !switching && handleSelect(rol)}
              >
                <span style={{ color: esActivo ? 'var(--navy)' : 'var(--slate)' }}>
                  <Icon name={ROL_META[rol].icon} size={16} strokeWidth={1.8} />
                </span>
                <span style={{ fontSize: 13, fontWeight: esActivo ? 700 : 500, flex: 1 }}>
                  {ROL_META[rol].label}
                </span>
                {esActivo && (
                  <span style={{ color: 'var(--navy)' }}>
                    <Icon name="check" size={13} strokeWidth={2.6} />
                  </span>
                )}
                {!habilitado && (
                  <span style={{ fontSize: 10.5, color: 'var(--slate)' }}>Agregar</span>
                )}
                {switching === rol && <span style={{ fontSize: 10.5, color: 'var(--slate)' }}>…</span>}
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <p style={{ position: 'absolute', top: 44, fontSize: 11, color: 'var(--danger)', marginTop: 4, width: 200 }}>
          {error}
        </p>
      )}
    </div>
  )
}
