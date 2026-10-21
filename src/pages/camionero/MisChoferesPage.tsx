import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { useAuth } from '../../contexts/useAuth'
import {
  obtenerChoferesFlota,
  guardarChoferFlota,
  eliminarChoferFlota,
  enviarInvitacionFlota,
  obtenerInvitacionesFlota,
  CHOFERES_DISPONIBLES_MOCK,
  type Chofer,
  type InvitacionFlota,
} from '../../lib/driversService'
import { validarRut, formatearRut } from '../../lib/validators'
import { regionNames, regionOrder } from '../../lib/chileRegions'

type TabType = 'nomina' | 'bolsa'

export function MisChoferesPage() {
  const navigate = useNavigate()
  const { session, perfil } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>('nomina')
  const [choferes, setChoferes] = useState<Chofer[]>([])
  const [invitaciones, setInvitaciones] = useState<InvitacionFlota[]>([])

  // Filtros para la bolsa
  const [filtroRegion, setFiltroRegion] = useState<string>('')
  const [filtroLicencia, setFiltroLicencia] = useState<string>('')

  // Modal para agregar chofer manual
  const [showModal, setShowModal] = useState(false)
  const [nombre, setNombre] = useState('')
  const [rut, setRut] = useState('')
  const [telefono, setTelefono] = useState('')
  const [licencia, setLicencia] = useState<'A5' | 'A4' | 'A2' | 'B'>('A5')
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Modal de Invitación
  const [choferAInvitar, setChoferAInvitar] = useState<Chofer | null>(null)
  const [mensajeInv, setMensajeInv] = useState('')

  useEffect(() => {
    if (!session?.user.id) return
    const lista = obtenerChoferesFlota(session.user.id)
    setChoferes(lista)
    setInvitaciones(obtenerInvitacionesFlota().filter((i) => i.transportistaId === session.user.id))
  }, [session])

  function handleGuardarManual() {
    if (!session?.user.id) return
    setErrorModal(null)

    if (!nombre.trim()) {
      setErrorModal('Ingresa el nombre completo del chofer')
      return
    }

    if (!rut.trim() || !validarRut(rut)) {
      setErrorModal('Ingresa un RUT chileno válido (ej. 12.345.678-9)')
      return
    }

    if (!telefono.trim() || telefono.length < 8) {
      setErrorModal('Ingresa un teléfono de contacto válido')
      return
    }

    guardarChoferFlota(session.user.id, {
      nombreCompleto: nombre.trim(),
      rut: formatearRut(rut),
      telefono: telefono.trim(),
      licenciaClase: licencia,
    })

    const listaActualizada = obtenerChoferesFlota(session.user.id)
    setChoferes(listaActualizada)
    setNombre('')
    setRut('')
    setTelefono('')
    setLicencia('A5')
    setShowModal(false)
    setSuccessMsg('Chofer registrado exitosamente en tu flota')
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  function handleEliminar(choferId: string) {
    if (!session?.user.id) return
    if (confirm('¿Eliminar a este chofer de tu nómina?')) {
      eliminarChoferFlota(session.user.id, choferId)
      setChoferes(obtenerChoferesFlota(session.user.id))
    }
  }

  function handleEnviarInvitacion() {
    if (!session?.user.id || !choferAInvitar) return
    enviarInvitacionFlota(
      session.user.id,
      perfil?.nombre || perfil?.razon_social || 'Transportes NORTIA',
      choferAInvitar,
      mensajeInv
    )
    setInvitaciones(obtenerInvitacionesFlota().filter((i) => i.transportistaId === session.user.id))
    setChoferAInvitar(null)
    setMensajeInv('')
    setSuccessMsg(`Invitación formal enviada a ${choferAInvitar.nombreCompleto}`)
    setTimeout(() => setSuccessMsg(null), 3500)
  }

  // Filtrado de la bolsa
  const choferesDisponiblesFiltrados = CHOFERES_DISPONIBLES_MOCK.filter((ch) => {
    if (filtroRegion && ch.regionCodigo !== Number(filtroRegion)) return false
    if (filtroLicencia && ch.licenciaClase !== filtroLicencia) return false
    return true
  })

  return (
    <WebPlatformLayout activeTab="Mis Choferes">
      <div className="web-platform-container">
        {/* Header con botón Volver */}
        <div className="between" style={{ marginBottom: 18, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Gestión de Flota & Recursos Humanos</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              Nómina de Choferes & Bolsa Laboral
            </div>
          </div>

          <button
            type="button"
            className="chip"
            style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
            onClick={() => navigate('/camionero')}
          >
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Panel Operativo</span>
          </button>
        </div>

      {successMsg && (
        <div className="pill pill-green" style={{ width: '100%', justifyContent: 'center', marginBottom: 14, padding: 10 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Selector de Pestañas */}
      <div
        style={{
          display: 'flex',
          background: 'var(--paper)',
          padding: 4,
          borderRadius: 14,
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('nomina')}
          style={{
            flex: 1,
            padding: '9px',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 12.5,
            cursor: 'pointer',
            background: activeTab === 'nomina' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'nomina' ? 'var(--navy)' : 'var(--slate)',
            boxShadow: activeTab === 'nomina' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          👥 Mi Nómina ({choferes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bolsa')}
          style={{
            flex: 1,
            padding: '9px',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 12.5,
            cursor: 'pointer',
            background: activeTab === 'bolsa' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'bolsa' ? 'var(--navy)' : 'var(--slate)',
            boxShadow: activeTab === 'bolsa' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          🔍 Bolsa de Choferes
        </button>
      </div>

      {/* PESTAÑA 1: MI NÓMINA */}
      {activeTab === 'nomina' && (
        <div>
          {/* Banner Informativo */}
          <div
            className="card flat"
            style={{
              background: 'var(--navy-tint)',
              border: '1.5px solid var(--navy-tint-2)',
              padding: '14px 16px',
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <div style={{ fontSize: 12, color: 'var(--navy-900)', lineHeight: 1.4 }}>
                <b>Seguridad NORTIA:</b> Al asignar un chofer a un flete, los guardias de portería y la empresa verán su nombre y RUT para control de acceso, mientras que <b>todos los cobros se transfieren a tu cuenta bancaria</b>.
              </div>
            </div>
          </div>

          <div className="between" style={{ marginBottom: 10 }}>
            <span className="eyebrow" style={{ margin: 0 }}>Conductores en Nómina</span>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: 12, borderRadius: 10, width: 'auto' }}
              onClick={() => setShowModal(true)}
            >
              + Agregar Manual
            </button>
          </div>

          {/* Titular Principal (Dueño) */}
          <div className="card" style={{ marginBottom: 12, border: '1.5px solid var(--navy)' }}>
            <div className="between" style={{ marginBottom: 6 }}>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 20 }}>👤</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>
                    {perfil?.nombre || 'Titular'} (Dueño / Administrador)
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                    {perfil?.rut ? `RUT: ${perfil.rut}` : 'Conductor Titular'}
                  </div>
                </div>
              </div>
              <span className="pill pill-navy" style={{ fontSize: 10, fontWeight: 700 }}>
                Titular
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 4 }}>
              📞 {perfil?.telefono || 'Sin teléfono'}
            </div>
          </div>

          {choferes.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '24px 20px',
                background: 'var(--paper)',
                border: '1.5px dashed var(--line)',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>👥</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>Sin choferes adicionales</div>
              <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 4, marginBottom: 12 }}>
                Si tienes choferes contratados, puedes agregarlos manualmente o buscarlos en la Bolsa de Choferes.
              </div>
              <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}
                  onClick={() => setShowModal(true)}
                >
                  + Agregar Manual
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}
                  onClick={() => setActiveTab('bolsa')}
                >
                  🔍 Buscar en Bolsa
                </button>
              </div>
            </div>
          ) : (
            <div className="cards-auto-grid">
              {choferes.map((c) => (
                <div key={c.id} className="card" style={{ padding: '14px 16px' }}>
                  <div className="between" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>
                        {c.nombreCompleto}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                        RUT: <b>{c.rut}</b> · <span className="pill pill-green" style={{ fontSize: 10, padding: '2px 6px' }}>Licencia {c.licenciaClase}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--navy)', marginTop: 4 }}>
                        📞 {c.telefono}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEliminar(c.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        fontSize: 14,
                        cursor: 'pointer',
                        padding: '4px 8px',
                      }}
                      title="Eliminar chofer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historial de Invitaciones Enviadas */}
          {invitaciones.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Invitaciones de Flota Enviadas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {invitaciones.map((inv) => (
                  <div key={inv.id} className="card flat" style={{ background: '#F8FAFC', padding: '10px 14px' }}>
                    <div className="between">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{inv.choferNombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--slate)' }}>Enviada el {inv.fecha}</div>
                      </div>
                      <span className={`pill ${inv.estado === 'aceptada' ? 'pill-green' : 'pill-navy'}`} style={{ fontSize: 10 }}>
                        {inv.estado === 'pendiente' ? '⏳ Pendiente' : inv.estado === 'aceptada' ? '✓ Aceptada' : 'Rechazada'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: BOLSA DE CHOFERES DISPONIBLES EN CHILE */}
      {activeTab === 'bolsa' && (
        <div>
          {/* Filtros */}
          <div className="card flat" style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: 16, marginBottom: 14 }}>
            <div className="between" style={{ gap: 8 }}>
              <select
                value={filtroRegion}
                onChange={(e) => setFiltroRegion(e.target.value)}
                style={{ flex: 1, fontSize: 12, padding: '8px 10px', borderRadius: 10 }}
              >
                <option value="">Todas las regiones</option>
                {regionOrder.map((r) => (
                  <option key={r} value={r}>{regionNames[r]}</option>
                ))}
              </select>

              <select
                value={filtroLicencia}
                onChange={(e) => setFiltroLicencia(e.target.value)}
                style={{ width: 120, fontSize: 12, padding: '8px 10px', borderRadius: 10 }}
              >
                <option value="">Licencia (Todas)</option>
                <option value="A5">Clase A5</option>
                <option value="A4">Clase A4</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 10 }}>
            <b>{choferesDisponiblesFiltrados.length}</b> choferes profesionales verificados en Chile
          </div>

          {/* Lista de Choferes Disponibles */}
          <div className="cards-auto-grid">
            {choferesDisponiblesFiltrados.map((ch) => {
              const yaInvitado = invitaciones.some((i) => i.choferId === ch.id)
              return (
                <div key={ch.id} className="card" style={{ padding: '16px' }}>
                  <div className="between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
                    <div className="row" style={{ gap: 10 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: 'var(--navy-tint)',
                          color: 'var(--navy)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 15,
                        }}
                      >
                        {ch.nombreCompleto.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--navy)' }}>
                          {ch.nombreCompleto}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Icon name="pin" size={11} strokeWidth={2} />
                          <span>{ch.regionNombre}</span>
                        </div>
                      </div>
                    </div>

                    <span className="pill pill-green" style={{ fontSize: 10.5, fontWeight: 700 }}>
                      Licencia {ch.licenciaClase}
                    </span>
                  </div>

                  <div className="row" style={{ gap: 14, fontSize: 12, color: 'var(--ink)', marginBottom: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Star4Point size={10} color="var(--navy)" />
                      <b>{ch.experienciaAnos} años</b> exp.
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="shield" size={12} strokeWidth={2} />
                      <span>RUT: <b>{ch.rut}</b></span>
                    </span>
                  </div>

                  <div className="between" style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                      ✓ Hoja de vida y antecedentes al día
                    </span>

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{
                        width: 'auto',
                        padding: '8px 14px',
                        fontSize: 12,
                        borderRadius: 12,
                        background: yaInvitado ? 'var(--slate)' : 'var(--navy)',
                      }}
                      disabled={yaInvitado}
                      onClick={() => setChoferAInvitar(ch)}
                    >
                      {yaInvitado ? '✓ Invitación enviada' : 'Invitar a mi Flota'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal para Invitar Chofer a la Flota */}
      {choferAInvitar && (
        <div className="apple-modal-overlay">
          <div className="apple-modal-sheet" style={{ maxWidth: 420 }}>
            <div className="between" style={{ marginBottom: 12 }}>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>Enviar Invitación de Flota</div>
              <button
                type="button"
                onClick={() => setChoferAInvitar(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--slate)', marginBottom: 14 }}>
              Enviarás una invitación oficial a <b>{choferAInvitar.nombreCompleto}</b> (Licencia {choferAInvitar.licenciaClase}) para unirse a tu flota en NORTIA.
            </div>

            <div className="field">
              <label>Mensaje o propuesta (Opcional)</label>
              <textarea
                rows={3}
                placeholder="Ej. Busco chofer para rampla en Concepción, ruta hacia Santiago. Fletes continuos."
                value={mensajeInv}
                onChange={(e) => setMensajeInv(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px' }}
              onClick={handleEnviarInvitacion}
            >
              📩 Enviar Invitación Oficial NORTIA
            </button>
          </div>
        </div>
      )}

      {/* Modal para Agregar Manual */}
      {showModal && (
        <div className="apple-modal-overlay">
          <div className="apple-modal-sheet" style={{ maxWidth: 420 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>Flotas NORTIA</div>
                <div className="h2" style={{ fontSize: 18, margin: 0 }}>Registrar Conductor</div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="field">
              <label>Nombre y Apellidos completos</label>
              <input
                placeholder="Ej. Juan Carlos Pérez Soto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="field">
              <label>RUT del Conductor</label>
              <input
                placeholder="Ej. 15.678.901-2"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Teléfono celular</label>
              <input
                placeholder="+56 9 8765 4321"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Clase de Licencia de Conducir</label>
              <select value={licencia} onChange={(e) => setLicencia(e.target.value as any)}>
                <option value="A5">Clase A5 (Articulados, Ramplas y Carga Pesada)</option>
                <option value="A4">Clase A4 (Camiones Simples de Carga)</option>
                <option value="A2">Clase A2 (Transporte Profesional)</option>
                <option value="B">Clase B (Vehículos y Camionetas Livianas)</option>
              </select>
            </div>

            {errorModal && (
              <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 12 }}>{errorModal}</p>
            )}

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: 6 }}
              onClick={handleGuardarManual}
            >
              Guardar Conductor en Nómina
            </button>
          </div>
        </div>
      )}
      </div>
    </WebPlatformLayout>
  )
}
