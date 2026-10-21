import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../components/Icon'
import { WebPlatformLayout } from '../layouts/WebPlatformLayout'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'
import { DatosBancariosModal } from '../components/DatosBancariosModal'
import { ClubBeneficiosModal } from '../components/ClubBeneficiosModal'
import { RedConfianzaModal } from '../components/RedConfianzaModal'
import { obtenerDatosBancarios, type DatosBancarios } from '../lib/payments'
import { validarRut, formatearRut } from '../lib/validators'
import { obtenerTemaEfectivo, alternarTema } from '../lib/themeService'

const PREGUNTAS_FRECUENTES = [
  {
    q: '¿Cómo funciona la Custodia Segura de Pagos (Escrow)?',
    a: 'Cuando una empresa acepta un flete, los fondos quedan retenidos y protegidos por NORTIA antes de iniciar el viaje. En cuanto el camionero completa la entrega y el receptor firma en pantalla (POD), NORTIA transfiere inmediatamente los fondos a la cuenta bancaria del transportista.',
  },
  {
    q: '¿Qué cubre el Seguro de Carga NORTIA?',
    a: 'Nuestra póliza por viaje cubre robo con violencia, volcamiento, colisión, incendio y pérdida total o parcial durante el tránsito en cualquier ruta o carretera de Chile.',
  },
  {
    q: '¿Qué debo hacer si sufro una pana o corte de ruta?',
    a: 'Dentro del viaje activo, abre el Modo Cabina o el detalle del flete y presiona el Botón SOS. Podrás reportar la incidencia, estimar el retraso y marcar llamadas directas a Carabineros (133), SAMU (131) o Bomberos (132).',
  },
  {
    q: '¿Cómo se emite la Guía de Despacho Electrónica (DTE 52)?',
    a: 'La empresa generadora de carga adjunta el folio o PDF de su guía autorizada por el SII en la app. El conductor la lleva disponible en su celular con el timbre fiscal PDF417 para cualquier control de Carabineros o fiscalizadores.',
  },
]

export function MiCuentaPage() {
  const navigate = useNavigate()
  const { session, perfil, refreshPerfil } = useAuth()

  // Estados de edición de perfil
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [rut, setRut] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null)

  // Datos bancarios
  const [datosBancarios, setDatosBancarios] = useState<DatosBancarios | null>(null)
  const [showBancoModal, setShowBancoModal] = useState(false)

  // FAQ abierto
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null)

  // Modo oscuro
  const [isDarkMode, setIsDarkMode] = useState(obtenerTemaEfectivo() === 'dark')

  // Modales de Beneficios y Red de Confianza
  const [showClubModal, setShowClubModal] = useState(false)
  const [showRedModal, setShowRedModal] = useState(false)
  const [showEliminarModal, setShowEliminarModal] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  // Datos del camión
  const [camion, setCamion] = useState<any | null>(null)

  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre || perfil.razon_social || '')
      setTelefono(perfil.telefono || '')
      setRut(perfil.rut || '')
    }
    if (session?.user.id) {
      const b = obtenerDatosBancarios(session.user.id)
      setDatosBancarios(b)

      // Cargar camión si es transportista
      supabase
        .from('camiones')
        .select('*')
        .eq('perfil_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setCamion(data)
        })
    }
  }, [perfil, session])

  async function handleGuardarPerfil() {
    if (!session?.user.id) return
    setErrorPerfil(null)

    if (!nombre.trim()) {
      setErrorPerfil('Ingresa tu nombre o razón social')
      return
    }

    if (rut.trim() && !validarRut(rut)) {
      setErrorPerfil('El RUT ingresado no es válido')
      return
    }

    setGuardando(true)
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          rut: rut.trim() ? formatearRut(rut) : null,
        })
        .eq('id', session.user.id)

      if (error) throw error

      await refreshPerfil()
      setEditando(false)
      setMensajeExito('Datos actualizados correctamente')
      setTimeout(() => setMensajeExito(null), 3500)
    } catch (err: any) {
      setErrorPerfil(err?.message || 'Error guardando datos')
    } finally {
      setGuardando(false)
    }
  }

  async function handleCerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      navigate('/login')
    }
  }

  async function handleEliminarCuenta() {
    setEliminando(true)
    try {
      localStorage.clear()
      sessionStorage.clear()
      await supabase.auth.signOut()
      alert('Tu cuenta y datos personales han sido dados de baja conforme a la normativa vigente.')
      navigate('/login')
    } catch (err) {
      console.error('Error al dar de baja la cuenta:', err)
    } finally {
      setEliminando(false)
      setShowEliminarModal(false)
    }
  }

  const soyCamionero = perfil?.rol === 'camionero'
  const iniciales = (perfil?.nombre || perfil?.razon_social || session?.user.email || 'N')
    .slice(0, 2)
    .toUpperCase()

  return (
    <WebPlatformLayout activeTab={soyCamionero ? '' : 'Mi Empresa & DTE'}>
      <div className="web-platform-container">
        {/* Header con botón Volver y Título */}
        <div className="between" style={{ marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Centro de Control & Configuración</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              Mi Cuenta & Datos Operativos
            </div>
          </div>

          <button
            type="button"
            className="chip"
            style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
            onClick={() => navigate(soyCamionero ? '/camionero' : '/negocio')}
          >
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Volver a {soyCamionero ? 'Panel Transportistas' : 'Panel Empresas'}</span>
          </button>
        </div>

        {mensajeExito && (
          <div className="pill pill-green" style={{ width: '100%', justifyContent: 'center', marginBottom: 18, padding: '10px 14px' }}>
            ✓ {mensajeExito}
          </div>
        )}

        <div className="two-col-grid">
          {/* COLUMNA 1: IDENTIDAD, FACTURACIÓN Y FLOTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Tarjeta Principal de Perfil */}
            <div className="card" style={{ padding: '22px', border: '1.5px solid var(--navy-tint-2)', margin: 0 }}>
              <div className="between" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
                <div className="row" style={{ gap: 14 }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      background: 'var(--navy)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 18,
                      boxShadow: '0 4px 10px rgba(38, 83, 112, 0.3)',
                    }}
                  >
                    {iniciales}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--navy)' }}>
                      {perfil?.nombre || perfil?.razon_social || 'Usuario NORTIA'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                      {session?.user.email}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="pill pill-navy" style={{ fontSize: 10.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name={soyCamionero ? 'truck' : 'building'} size={12} strokeWidth={2} />
                        {soyCamionero ? 'Transportista / Camionero' : 'Generador de Carga'}
                      </span>
                      {perfil?.verificado && (
                        <span className="pill pill-green" style={{ fontSize: 10.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="shield" size={11} strokeWidth={2.4} />
                          Verificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: 12, borderRadius: 10 }}
                  onClick={() => setEditando(!editando)}
                >
                  {editando ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {/* Formulario de Edición de Datos */}
              {editando ? (
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 10 }}>
                  <div className="field">
                    <label>Nombre o Razón Social</label>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre o empresa" />
                  </div>

                  <div className="field">
                    <label>RUT Chileno</label>
                    <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="Ej. 12.345.678-9" />
                  </div>

                  <div className="field">
                    <label>Teléfono celular de contacto</label>
                    <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 8765 4321" />
                  </div>

                  {errorPerfil && (
                    <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 10 }}>{errorPerfil}</p>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={guardando}
                    onClick={handleGuardarPerfil}
                    style={{ width: '100%', padding: '12px' }}
                  >
                    {guardando ? 'Guardando…' : 'Guardar Cambios'}
                  </button>
                </div>
              ) : (
                <div className="between" style={{ borderTop: '1px solid var(--line)', paddingTop: 12, fontSize: 12, color: 'var(--slate)', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    RUT: <b>{perfil?.rut || 'Sin registrar'}</b> · Tel: <b>{perfil?.telefono || 'Sin registrar'}</b>
                  </div>
                  {session?.user.id && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '5px 12px', fontSize: 11.5, width: 'auto', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      onClick={() => navigate(`/perfil/${session.user.id}`)}
                    >
                      <span>Ver Perfil Público</span>
                      <Star4Point size={11} color="var(--navy)" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN: FINANZAS Y DATOS BANCARIOS */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Finanzas y Facturación</div>
              <div className="card" style={{ padding: '18px 20px', margin: 0 }}>
                <div className="between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                  <div className="row" style={{ gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'var(--navy-tint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--navy)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="bank" size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>
                        {datosBancarios ? datosBancarios.banco : 'Cuenta Bancaria para Pagos'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                        {datosBancarios
                          ? `${datosBancarios.tipoCuenta === 'cuenta_rut' ? 'Cuenta RUT' : 'Cuenta Corriente'} · N° ${datosBancarios.numeroCuenta}`
                          : 'Configura tu Cuenta RUT o banco para recibir transferencias inmediatas.'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: 12, borderRadius: 10 }}
                    onClick={() => setShowBancoModal(true)}
                  >
                    {datosBancarios ? 'Actualizar' : '+ Configurar'}
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN: DOCUMENTACIÓN Y FLOTA (Exclusivo Camionero) */}
            {soyCamionero && (
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Operaciones y Vehículo</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    className="card selectable"
                    style={{ padding: '14px 16px', margin: 0 }}
                    onClick={() => navigate('/camionero/documentos')}
                  >
                    <div className="between">
                      <div className="row" style={{ gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: 'var(--navy-tint)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--navy)',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name="doc" size={19} strokeWidth={1.8} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Documentos del Camión</div>
                          <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>
                            Padrón, SOAP, Revisión Técnica y Licencia A5/A4
                          </div>
                        </div>
                      </div>
                      <Icon name="arrowR" size={16} strokeWidth={2} />
                    </div>
                  </div>

                  <div
                    className="card selectable"
                    style={{ padding: '14px 16px', margin: 0 }}
                    onClick={() => navigate('/camionero/choferes')}
                  >
                    <div className="between">
                      <div className="row" style={{ gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: 'var(--navy-tint)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--navy)',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name="users" size={19} strokeWidth={1.8} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Nómina de Choferes & Bolsa</div>
                          <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>
                            Gestiona tus conductores o invita choferes disponibles
                          </div>
                        </div>
                      </div>
                      <Icon name="arrowR" size={16} strokeWidth={2} />
                    </div>
                  </div>

                  {camion && (
                    <div className="card flat" style={{ background: 'var(--card-glass-bg)', padding: '12px 16px', border: '1px solid var(--line)', margin: 0 }}>
                      <div className="between">
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 700 }}>Camión Registrado</div>
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--navy)' }}>
                            {camion.tipo.toUpperCase()} · Patente: <b>{camion.patente}</b>
                          </div>
                        </div>
                        <span className="pill pill-navy" style={{ fontSize: 11 }}>
                          {camion.carga_max_kg?.toLocaleString('es-CL')} kg
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA 2: PREFERENCIAS, RED Y SOPORTE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* SECCIÓN: PREFERENCIAS Y APARIENCIA */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>Preferencias y Apariencia</span>
                <Star4Point size={10} color="var(--navy)" />
              </div>
              <div className="card" style={{ padding: '16px 18px', margin: 0 }}>
                <div className="between">
                  <div className="row" style={{ gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: isDarkMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                        border: isDarkMode ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDarkMode ? '#38BDF8' : 'var(--navy)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={isDarkMode ? 'moon' : 'sun'} size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>
                        {isDarkMode ? 'Modo Noche (Deep Obsidian Glow)' : 'Modo Día (Light Pearl Glow)'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--slate)' }}>
                        {isDarkMode
                          ? 'Estética translúcida de alto contraste para viajes nocturnos.'
                          : 'Lienzo perla de alta luminosidad para conducción diurna.'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`toggle ${isDarkMode ? 'on' : ''}`}
                    onClick={() => {
                      const nuevo = alternarTema()
                      setIsDarkMode(nuevo === 'dark')
                    }}
                  >
                    <div className="knob" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN: CLUB NORTIA PRO & RED DE CONFIANZA */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Fidelización y Red</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  className="card selectable"
                  style={{ padding: '14px 16px', margin: 0 }}
                  onClick={() => setShowClubModal(true)}
                >
                  <div className="between">
                    <div className="row" style={{ gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'var(--navy-tint)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--navy)',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="sparkles" size={19} strokeWidth={1.8} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>Club NORTIA Pro · Beneficios en Ruta</div>
                        <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>
                          Convenios en vulcanizaciones 24h, duchas, repuestos y asesoría legal
                        </div>
                      </div>
                    </div>
                    <Icon name="arrowR" size={16} strokeWidth={2} />
                  </div>
                </div>

                <div
                  className="card selectable"
                  style={{ padding: '14px 16px', margin: 0 }}
                  onClick={() => setShowRedModal(true)}
                >
                  <div className="between">
                    <div className="row" style={{ gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'var(--navy-tint)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--navy)',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="building" size={19} strokeWidth={1.8} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>Mi Red de Confianza</div>
                        <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>
                          Directorio de clientes y choferes para fletes rápidos y directos
                        </div>
                      </div>
                    </div>
                    <Icon name="arrowR" size={16} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN: CENTRO DE AYUDA Y SOPORTE 24/7 */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Centro de Ayuda y Soporte 24/7</div>
              <div className="card" style={{ padding: '18px', margin: 0 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <a
                    href="https://wa.me/56987654321?text=Hola%20equipo%20NORTIA,%20necesito%20asistencia%20con%20mi%20cuenta"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: 12.5,
                      background: '#25D366',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icon name="message" size={16} strokeWidth={2} />
                    <span>WhatsApp Soporte</span>
                  </a>

                  <a
                    href="tel:+56987654321"
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: 12.5,
                      textDecoration: 'none',
                      textAlign: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Icon name="phone" size={16} strokeWidth={2} />
                    <span>Mesa Central</span>
                  </a>
                </div>

                {/* Acordeón de Preguntas Frecuentes */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, color: 'var(--navy)' }}>
                    Preguntas Frecuentes
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PREGUNTAS_FRECUENTES.map((faq, index) => {
                      const isOpen = faqAbierto === index
                      return (
                        <div
                          key={index}
                          style={{
                            background: isOpen ? 'var(--navy-tint)' : 'var(--card-glass-bg)',
                            border: '1px solid var(--line)',
                            borderRadius: 12,
                            padding: '10px 14px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onClick={() => setFaqAbierto(isOpen ? null : index)}
                        >
                          <div className="between" style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--ink)' }}>
                            <span>{faq.q}</span>
                            <span style={{ fontSize: 14, color: 'var(--slate)', marginLeft: 8 }}>{isOpen ? '▲' : '▼'}</span>
                          </div>
                          {isOpen && (
                            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 8, lineHeight: 1.45 }}>
                              {faq.a}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN: ACCIONES DE SESIÓN Y CUENTA */}
            <div style={{ paddingTop: 6 }}>
              {/* Botón de Cerrar Sesión */}
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)',
                  borderRadius: 14,
                  fontWeight: 700,
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={handleCerrarSesion}
              >
                <Icon name="logout" size={16} strokeWidth={2} />
                <span>Cerrar Sesión</span>
              </button>

              {/* Botón de Eliminación de Cuenta */}
              <button
                type="button"
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate)',
                  fontSize: 12,
                  padding: '8px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => setShowEliminarModal(true)}
              >
                Solicitar eliminación o baja de mi cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación de Cuenta */}
      {showEliminarModal && (
        <div className="apple-modal-overlay">
          <div className="apple-modal-sheet" style={{ maxWidth: 440, padding: '22px' }}>
            <div className="between" style={{ marginBottom: 12 }}>
              <div className="row" style={{ gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'var(--danger-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)',
                  }}
                >
                  <Icon name="shield" size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="eyebrow" style={{ color: 'var(--danger)', margin: 0 }}>
                    Privacidad & Datos
                  </div>
                  <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                    Eliminar Cuenta NORTIA
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEliminarModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div
              className="card flat"
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                padding: '14px',
                borderRadius: 14,
                marginBottom: 14,
                color: '#991B1B',
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              <b>Esta acción es permanente e irreversible:</b>
              <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                <li>Se cerrará tu sesión de inmediato.</li>
                <li>Se eliminarán tus datos de perfil, vehículos y documentos asociados.</li>
                <li>Conforme a la Ley N° 19.628 de Protección de Datos Personales y directrices de Apple/Google.</li>
              </ul>
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setShowEliminarModal(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', background: '#DC2626' }}
                disabled={eliminando}
                onClick={handleEliminarCuenta}
              >
                {eliminando ? 'Eliminando…' : 'Sí, Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Datos Bancarios */}
      {session?.user.id && (
        <DatosBancariosModal
          isOpen={showBancoModal}
          userId={session.user.id}
          onClose={() => setShowBancoModal(false)}
          onSaved={(datos) => {
            setDatosBancarios(datos)
            setShowBancoModal(false)
            setMensajeExito('Datos bancarios guardados con éxito')
            setTimeout(() => setMensajeExito(null), 3500)
          }}
        />
      )}

      {/* Modal de Club NORTIA Pro */}
      <ClubBeneficiosModal
        isOpen={showClubModal}
        onClose={() => setShowClubModal(false)}
      />

      {/* Modal de Mi Red de Confianza */}
      {session?.user.id && (
        <RedConfianzaModal
          isOpen={showRedModal}
          usuarioId={session.user.id}
          onClose={() => setShowRedModal(false)}
        />
      )}
    </WebPlatformLayout>
  )
}
