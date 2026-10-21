import { useState, useEffect } from 'react'
import {
  obtenerMiembrosEquipo,
  guardarMiembroEquipo,
  eliminarMiembroEquipo,
  type MiembroEquipo,
  type RolEquipo,
} from '../lib/teamMembersService'

interface EquipoDespachoModalProps {
  isOpen: boolean
  empresaId: string
  onClose: () => void
}

const ROLES_LABEL: Record<RolEquipo, { label: string; cls: string; desc: string }> = {
  admin: { label: 'Administrador', cls: 'pill-navy', desc: 'Acceso total a pagos, fletes y contratos' },
  bodega: { label: 'Encargado de Bodega', cls: 'pill-green', desc: 'Publicar cargas y coordinar despachos' },
  contabilidad: { label: 'Contabilidad', cls: 'pill-navy', desc: 'Descargar facturas DTE 33 y finanzas' },
}

export function EquipoDespachoModal({
  isOpen,
  empresaId,
  onClose,
}: EquipoDespachoModalProps) {
  const [miembros, setMiembros] = useState<MiembroEquipo[]>([])
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [rol, setRol] = useState<RolEquipo>('bodega')
  const [sucursal, setSucursal] = useState('')

  function cargar() {
    if (!empresaId) return
    const lista = obtenerMiembrosEquipo(empresaId)
    setMiembros(lista)
  }

  useEffect(() => {
    if (!isOpen) return
    cargar()

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_team_updated', onUpdated)
    return () => window.removeEventListener('nortia_team_updated', onUpdated)
  }, [isOpen, empresaId])

  if (!isOpen) return null

  function handleGuardar() {
    if (!nombre.trim() || !email.trim()) return
    guardarMiembroEquipo(empresaId, {
      empresaId,
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim() || undefined,
      rol,
      sucursal: sucursal.trim() || undefined,
    })
    setNombre('')
    setEmail('')
    setTelefono('')
    setSucursal('')
    setShowForm(false)
    cargar()
  }

  function handleEliminar(id: string) {
    eliminarMiembroEquipo(empresaId, id)
    cargar()
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 480, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 24 }}>👥</span>
            <div>
              <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
                Equipo & Permisos
              </div>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                Encargados de Despacho & Bodega
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px' }}>
          Otorga accesos a tus jefes de bodega y contadores para operar bajo la misma cuenta de empresa.
        </p>

        {/* Botón / Formulario */}
        {!showForm ? (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: 14, padding: '10px', fontSize: 12.5 }}
            onClick={() => setShowForm(true)}
          >
            + Invitar a un Colaborador
          </button>
        ) : (
          <div className="card flat" style={{ background: 'var(--paper)', padding: '14px', borderRadius: 14, marginBottom: 14 }}>
            <div className="eyebrow" style={{ color: 'var(--navy)', marginBottom: 8 }}>
              Invitar Nuevo Miembro
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Nombre y Apellido</label>
              <input
                placeholder="Ej. Matías Valenzuela"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Correo Electrónico (Para inicio de sesión)</label>
              <input
                type="email"
                placeholder="mvalenzuela@empresa.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Rol y Nivel de Acceso</label>
              <select value={rol} onChange={(e) => setRol(e.target.value as RolEquipo)}>
                <option value="bodega">📦 Encargado de Bodega (Publicar y coordinar)</option>
                <option value="contabilidad">💼 Contabilidad (Descargar DTE 33 y facturas)</option>
                <option value="admin">👑 Administrador (Acceso total)</option>
              </select>
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <label>Sucursal o Centro de Distribución (Opcional)</label>
              <input
                placeholder="Ej. Bodega San Bernardo"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
              />
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '8px', background: 'var(--navy)' }}
                onClick={handleGuardar}
              >
                Enviar Invitación
              </button>
            </div>
          </div>
        )}

        {/* Lista de Miembros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '55vh', overflowY: 'auto' }}>
          {miembros.map((m) => {
            const roleInfo = ROLES_LABEL[m.rol]
            return (
              <div
                key={m.id}
                className="card"
                style={{ padding: '14px 16px', margin: 0, border: '1px solid var(--line)' }}
              >
                <div className="between" style={{ marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13.5 }}>{m.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                      ✉️ {m.email} {m.sucursal ? `· 📍 ${m.sucursal}` : ''}
                    </div>
                  </div>

                  <span className={`pill ${roleInfo.cls}`} style={{ fontSize: 10.5, fontWeight: 800 }}>
                    {roleInfo.label}
                  </span>
                </div>

                <div className="between" style={{ fontSize: 10.5, color: 'var(--slate-light)', marginTop: 4 }}>
                  <span>{roleInfo.desc}</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => handleEliminar(m.id)}
                  >
                    Quitar acceso
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
