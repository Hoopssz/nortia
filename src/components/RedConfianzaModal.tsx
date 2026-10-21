import { useState, useEffect } from 'react'
import {
  obtenerRedConfianza,
  guardarContactoConfianza,
  eliminarContactoConfianza,
  type ContactoConfianza,
} from '../lib/trustedNetworkService'

interface RedConfianzaModalProps {
  isOpen: boolean
  usuarioId: string
  onClose: () => void
}

export function RedConfianzaModal({
  isOpen,
  usuarioId,
  onClose,
}: RedConfianzaModalProps) {
  const [contactos, setContactos] = useState<ContactoConfianza[]>([])
  const [showNuevo, setShowNuevo] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [rutas, setRutas] = useState('')

  function cargar() {
    if (!usuarioId) return
    const lista = obtenerRedConfianza(usuarioId)
    setContactos(lista)
  }

  useEffect(() => {
    if (!isOpen) return
    cargar()

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_network_updated', onUpdated)
    return () => window.removeEventListener('nortia_network_updated', onUpdated)
  }, [isOpen, usuarioId])

  if (!isOpen) return null

  function handleAgregar() {
    if (!nombre.trim() || !telefono.trim()) return
    guardarContactoConfianza(usuarioId, {
      usuarioId,
      nombreContacto: nombre.trim(),
      rolContacto: 'empresa',
      telefono: telefono.trim(),
      calificacion: 5.0,
      viajesRealizados: 1,
      rutasHabituales: rutas.trim() || 'Rutas Nacionales',
    })
    setNombre('')
    setTelefono('')
    setRutas('')
    setShowNuevo(false)
    cargar()
  }

  function handleEliminar(id: string) {
    eliminarContactoConfianza(usuarioId, id)
    cargar()
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 480, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 24 }}>🏢</span>
            <div>
              <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
                Fidelización NORTIA
              </div>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                Mi Red de Confianza
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

        <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 10px' }}>
          Tus clientes y transportistas favoritos para coordinar fletes directos con prioridad y máxima confianza.
        </p>

        <div style={{ fontSize: 11, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, background: 'var(--paper)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)' }}>
          <span>🔒</span>
          <span>Fletes gestionados y protegidos bajo el sistema Escrow de NORTIA.</span>
        </div>

        {/* Botón Agregar o Formulario */}
        {!showNuevo ? (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: 14, padding: '10px', fontSize: 12.5 }}
            onClick={() => setShowNuevo(true)}
          >
            + Agregar Nuevo Contacto de Confianza
          </button>
        ) : (
          <div className="card flat" style={{ background: 'var(--paper)', padding: '14px', borderRadius: 14, marginBottom: 14 }}>
            <div className="eyebrow" style={{ color: 'var(--navy)', marginBottom: 8 }}>
              Nuevo Contacto de Confianza
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Nombre o Empresa</label>
              <input
                placeholder="Ej. Frutícola San Felipe"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Teléfono / WhatsApp</label>
              <input
                placeholder="+56 9 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <label>Ruta habitual o notas</label>
              <input
                placeholder="Ej. Santiago ↔ San Antonio"
                value={rutas}
                onChange={(e) => setRutas(e.target.value)}
              />
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setShowNuevo(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '8px', background: 'var(--navy)' }}
                onClick={handleAgregar}
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Contactos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '55vh', overflowY: 'auto' }}>
          {contactos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--slate)' }}>
              No tienes contactos guardados aún.
            </div>
          ) : (
            contactos.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{ padding: '14px 16px', margin: 0, border: '1px solid var(--line)' }}
              >
                <div className="between" style={{ marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13.5 }}>{c.nombreContacto}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                      📍 {c.rutasHabituales} · {c.viajesRealizados} fletes realizados
                    </div>
                  </div>

                  <span className="pill pill-green" style={{ fontSize: 11, fontWeight: 800 }}>
                    ⭐ {c.calificacion.toFixed(1)}
                  </span>
                </div>

                <div className="row" style={{ gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => {
                      onClose()
                      window.location.href = '/publicar'
                    }}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: 'var(--navy)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: 11.5,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      border: 'none',
                      borderRadius: 10,
                    }}
                  >
                    📦 Asignar Flete en NORTIA
                  </button>

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--slate-light)', cursor: 'pointer', padding: '0 6px', fontSize: 14 }}
                    title="Eliminar de mi red"
                    onClick={() => handleEliminar(c.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
