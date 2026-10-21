import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, StarFill } from '../components/Icon'
import { WebPlatformLayout } from '../layouts/WebPlatformLayout'
import { PaymentModal } from '../components/PaymentModal'
import { ModoCabinaModal } from '../components/ModoCabinaModal'
import { ProofOfDeliveryModal } from '../components/ProofOfDeliveryModal'
import { GuiaDespachoModal } from '../components/GuiaDespachoModal'
import { PolizaSeguroModal } from '../components/PolizaSeguroModal'
import { SosModal } from '../components/SosModal'
import { ChatModal } from '../components/ChatModal'
import { FacturaComisionModal } from '../components/FacturaComisionModal'
import { SafetyToolkitModal } from '../components/SafetyToolkitModal'
import { RelojEstadiaModal } from '../components/RelojEstadiaModal'
import { ChecklistPreViajeModal } from '../components/ChecklistPreViajeModal'
import { PasePorteriaModal } from '../components/PasePorteriaModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/useAuth'
import { estimarTiempoViaje } from '../lib/chileLocations'
import { guardarViajeOffline, obtenerViajeOffline, encolarAccionOffline } from '../lib/offlineSync'
import { obtenerComprobanteEntrega, type ComprobanteEntrega } from '../lib/podService'
import { obtenerGuiaDespacho, type GuiaDespachoData } from '../lib/guiaDespachoService'
import { obtenerPolizaSeguro, type PolizaSeguro } from '../lib/insuranceService'
import { obtenerIncidencia, type IncidenciaRuta, TIPOS_INCIDENCIA_LABEL } from '../lib/incidentService'
import {
  obtenerChoferViaje,
  asignarChoferAViaje,
  obtenerChoferesFlota,
  type Chofer,
} from '../lib/driversService'
import {
  obtenerEscrow,
  liberarEscrow,
  onEscrowLiberado,
  formatFechaEscrow,
  type EscrowState,
} from '../lib/escrowService'
import {
  notifCamionEnRuta,
  notifEntregaConfirmada,
  notifPagoLiberado,
} from '../lib/pushService'
import type { Tables } from '../lib/database.types'

type Viaje = Tables<'viajes'>
type Carga = Tables<'cargas'>
type Perfil = Tables<'perfiles'>
type Resena = Tables<'resenas'>
type Camion = Tables<'camiones'>

const ESTADO_LABEL: Record<Viaje['estado'], string> = {
  asignado: 'Carga Asignada',
  en_ruta: 'En Ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export function ViajeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session, perfil } = useAuth()

  const [viaje, setViaje] = useState<Viaje | null>(null)
  const [carga, setCarga] = useState<Carga | null>(null)
  const [camion, setCamion] = useState<Camion | null>(null)
  const [otraParte, setOtraParte] = useState<Perfil | null>(null)
  const [miResena, setMiResena] = useState<Resena | null>(null)
  const [podData, setPodData] = useState<ComprobanteEntrega | null>(null)
  const [guiaData, setGuiaData] = useState<GuiaDespachoData | null>(null)
  const [polizaData, setPolizaData] = useState<PolizaSeguro | null>(null)
  const [incidenciaActiva, setIncidenciaActiva] = useState<IncidenciaRuta | null>(null)
  const [choferAsignado, setChoferAsignado] = useState<Chofer | null>(null)
  const [misChoferes, setMisChoferes] = useState<Chofer[]>([])
  const [showAsignarChoferModal, setShowAsignarChoferModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const [actualizandoEstado, setActualizandoEstado] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showModoCabina, setShowModoCabina] = useState(false)
  const [showPodModal, setShowPodModal] = useState(false)
  const [showGuiaModal, setShowGuiaModal] = useState(false)
  const [showPolizaModal, setShowPolizaModal] = useState(false)
  const [showSosModal, setShowSosModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showFacturaModal, setShowFacturaModal] = useState(false)
  const [showSafetyModal, setShowSafetyModal] = useState(false)
  const [showEstadiaModal, setShowEstadiaModal] = useState(false)
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [showPaseModal, setShowPaseModal] = useState(false)
  const [puntuacion, setPuntuacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [escrow, setEscrow] = useState<EscrowState>({ liberado: false, fechaLiberacion: null, liberadoPor: null })
  const [liberandoPago, setLiberandoPago] = useState(false)
  const [confirmandoLiberar, setConfirmandoLiberar] = useState(false)

  useEffect(() => {
    if (!id || !session?.user.id) return
    let active = true
    async function load() {
      try {
        const { data: viajeData } = await supabase.from('viajes').select('*').eq('id', id!).single()
        if (!viajeData) {
          // Intentar cargar desde caché offline
          const cached = obtenerViajeOffline(id!)
          if (cached && active) {
            setViaje(cached.viaje)
            setCarga(cached.carga)
            setOtraParte(cached.otraParte)
            setCamion(cached.camion)
            setLoading(false)
          } else if (active) {
            setLoading(false)
          }
          return
        }

        const soyCliente = viajeData.cliente_id === session!.user.id
        const otraParteId = soyCliente ? viajeData.camionero_id : viajeData.cliente_id

        const [{ data: cargaData }, { data: otraParteData }, { data: camionData }, { data: resenaData }] = await Promise.all([
          supabase.from('cargas').select('*').eq('id', viajeData.carga_id).single(),
          supabase.from('perfiles').select('*').eq('id', otraParteId).single(),
          viajeData.camion_id ? supabase.from('camiones').select('*').eq('id', viajeData.camion_id).maybeSingle() : Promise.resolve({ data: null }),
          supabase.from('resenas').select('*').eq('viaje_id', id!).eq('autor_id', session!.user.id).maybeSingle(),
        ])

        if (!active) return
        setViaje(viajeData)
        setCarga(cargaData ?? null)
        setOtraParte(otraParteData ?? null)
        setCamion(camionData ?? null)
        setMiResena(resenaData ?? null)

        const pod = obtenerComprobanteEntrega(id!)
        setPodData(pod)

        if (cargaData?.id) {
          const guia = obtenerGuiaDespacho(cargaData.id)
          setGuiaData(guia)
          const poliza = obtenerPolizaSeguro(cargaData.id)
          setPolizaData(poliza)
        }

        const inc = obtenerIncidencia(id!)
        if (inc && inc.estado === 'activa') setIncidenciaActiva(inc)
        else setIncidenciaActiva(null)

        const chofer = obtenerChoferViaje(id!)
        setChoferAsignado(chofer)

        if (session?.user.id) {
          setMisChoferes(obtenerChoferesFlota(session.user.id))
        }

        // Guardar en caché offline para acceso en carretera sin señal
        guardarViajeOffline(id!, {
          viaje: viajeData,
          carga: cargaData,
          otraParte: otraParteData,
          camion: camionData,
        })

        setLoading(false)
      } catch (err) {
        // Fallback a caché offline si no hay red
        const cached = obtenerViajeOffline(id!)
        const pod = obtenerComprobanteEntrega(id!)
        const inc = obtenerIncidencia(id!)
        if (cached && active) {
          setViaje(cached.viaje)
          setCarga(cached.carga)
          setOtraParte(cached.otraParte)
          setCamion(cached.camion)
          setPodData(pod)
          if (inc && inc.estado === 'activa') setIncidenciaActiva(inc)
          if (cached.carga?.id) {
            setGuiaData(obtenerGuiaDespacho(cached.carga.id))
            setPolizaData(obtenerPolizaSeguro(cached.carga.id))
          }
        }
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id, session, reloadKey])

  // Cargar estado de escrow y suscribirse a actualizaciones en tiempo real
  useEffect(() => {
    if (!id) return
    setEscrow(obtenerEscrow(id))
    const unsub = onEscrowLiberado(id, () => setEscrow(obtenerEscrow(id)))
    return unsub
  }, [id])

  async function handleIniciarRuta() {
    if (!viaje) return
    setActualizandoEstado(true)
    setError(null)

    // Si está offline, guardar en cola local
    if (!navigator.onLine) {
      encolarAccionOffline({ tipo: 'iniciar_ruta', payload: { viajeId: viaje.id } })
      setViaje({ ...viaje, estado: 'en_ruta', fecha_inicio: new Date().toISOString() })
      setSuccessMsg('📶 Guardado offline. Se sincronizará automáticamente al recuperar señal.')
      setTimeout(() => setSuccessMsg(null), 5000)
      setActualizandoEstado(false)
      return
    }

    try {
      const nowIso = new Date().toISOString()
      const { error: vErr } = await supabase
        .from('viajes')
        .update({ estado: 'en_ruta', fecha_inicio: nowIso })
        .eq('id', viaje.id)

      if (vErr) throw vErr

      await supabase.from('cargas').update({ estado: 'en_ruta' }).eq('id', viaje.carga_id)

      // Notificar al cliente que el camión salió a ruta
      if (viaje.cliente_id && carga) {
        notifCamionEnRuta(
          viaje.cliente_id,
          perfil?.nombre || 'El transportista',
          carga.destino_texto,
          viaje.id,
        )
      }

      setSuccessMsg('¡Viaje iniciado! Tu cliente ya puede ver que vas en ruta.')
      setTimeout(() => setSuccessMsg(null), 4000)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar ruta')
    } finally {
      setActualizandoEstado(false)
    }
  }

  async function handleMarcarEntregado() {
    if (!viaje) return
    // Si es camionero, abrir el modal de captura de POD (foto y firma)
    if (soyCamionero) {
      setShowPodModal(true)
      return
    }

    setActualizandoEstado(true)
    setError(null)

    const { error } = await supabase.rpc('marcar_entregado', { p_viaje_id: viaje.id })
    if (error) {
      setError(error.message)
      setActualizandoEstado(false)
      return
    }
    setSuccessMsg('¡Carga entregada y confirmada exitosamente!')
    setTimeout(() => setSuccessMsg(null), 4000)
    setReloadKey((k) => k + 1)
    setActualizandoEstado(false)
  }

  async function handlePodCompletado(pod: ComprobanteEntrega) {
    if (!viaje) return
    setActualizandoEstado(true)
    setPodData(pod)

    if (!navigator.onLine) {
      encolarAccionOffline({ tipo: 'marcar_entregado', payload: { viajeId: viaje.id } })
      setViaje({ ...viaje, estado: 'entregado', fecha_entrega: new Date().toISOString() })
      setSuccessMsg('📶 Entrega y comprobante guardados offline. Se sincronizará al volver la señal.')
      setTimeout(() => setSuccessMsg(null), 5000)
      setActualizandoEstado(false)
      setShowPodModal(false)
      return
    }

    const { error } = await supabase.rpc('marcar_entregado', { p_viaje_id: viaje.id })
    if (error) {
      setError(error.message)
      setActualizandoEstado(false)
      return
    }

    // Notificar al cliente que la carga fue entregada
    if (viaje.cliente_id && carga) {
      notifEntregaConfirmada(
        viaje.cliente_id,
        carga.tipo_carga || 'tu carga',
        viaje.id,
      )
    }

    setSuccessMsg('¡Comprobante de entrega registrado y flete completado!')
    setTimeout(() => setSuccessMsg(null), 4000)
    setReloadKey((k) => k + 1)
    setActualizandoEstado(false)
    setShowPodModal(false)
  }

  async function handleCancelar() {
    if (!viaje) return
    setCancelando(true)
    setError(null)
    const { error } = await supabase.rpc('cancelar_viaje', { p_viaje_id: viaje.id })
    if (error) {
      setError(error.message)
      setCancelando(false)
      return
    }
    setReloadKey((k) => k + 1)
    setCancelando(false)
    setConfirmingCancel(false)
  }

  async function handlePagoViajeExitoso() {
    if (!viaje) return
    setError(null)
    const { error: pErr } = await supabase.from('viajes').update({ pagado: true }).eq('id', viaje.id)
    if (pErr) {
      setError(pErr.message)
      return
    }
    setSuccessMsg('¡Pago con tarjeta procesado exitosamente! Fondos en custodia NORTIA.')
    setTimeout(() => setSuccessMsg(null), 5000)
    setReloadKey((k) => k + 1)
    setShowPaymentModal(false)
  }

  async function handleLiberarPago() {
    if (!viaje || !session?.user.id) return
    setLiberandoPago(true)
    setError(null)
    // Si el viaje todavía no está marcado como pagado, marcarlo ahora
    if (!viaje.pagado) {
      const { error: pErr } = await supabase.from('viajes').update({ pagado: true }).eq('id', viaje.id)
      if (pErr) {
        setError(pErr.message)
        setLiberandoPago(false)
        return
      }
    }
    // Registrar liberación en escrow
    liberarEscrow(viaje.id, session.user.id)

    // Notificar al camionero que el pago fue liberado
    notifPagoLiberado(viaje.camionero_id, montoLiquido, viaje.id)

    setConfirmandoLiberar(false)
    setLiberandoPago(false)
    setSuccessMsg('✅ Pago liberado al transportista. ¡Flete completado exitosamente!')
    setTimeout(() => setSuccessMsg(null), 6000)
    setReloadKey((k) => k + 1)
  }

  async function handleEnviarResena() {
    if (!viaje || !session?.user.id || !otraParte) return
    setEnviandoResena(true)
    setError(null)
    const { error } = await supabase.from('resenas').insert({
      viaje_id: viaje.id,
      autor_id: session.user.id,
      destinatario_id: otraParte.id,
      puntuacion,
      comentario: comentario || null,
    })
    if (error) {
      setError(error.message)
      setEnviandoResena(false)
      return
    }
    setReloadKey((k) => k + 1)
    setEnviandoResena(false)
  }

  if (loading) {
    return (
      <div className="px" style={{ paddingTop: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando información del viaje…</p>
      </div>
    )
  }

  if (!viaje || !carga) {
    return (
      <div className="px" style={{ paddingTop: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>No encontramos este viaje.</p>
      </div>
    )
  }

  const soyCamionero = viaje.camionero_id === session?.user.id
  const montoLiquido = viaje.precio_final - (viaje.comision_monto ?? 0)
  const monto = soyCamionero ? montoLiquido : viaje.precio_final

  const stepIndex = viaje.estado === 'asignado' ? 1 : viaje.estado === 'en_ruta' ? 2 : viaje.estado === 'entregado' ? 3 : 0

  return (
    <WebPlatformLayout activeTab={soyCamionero ? 'Mis Fletes' : 'Mis Cargas'}>
      <div className="web-platform-container" style={{ maxWidth: 920 }}>
        <div className="between" style={{ marginBottom: 16, alignItems: 'center' }}>
          <button
            type="button"
            className="chip"
            style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
            onClick={() => navigate(-1)}
          >
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Volver</span>
          </button>
        </div>

      {/* Barra de Progreso del Viaje */}
      {viaje.estado !== 'cancelado' && (
        <div className="card" style={{ marginBottom: 16, padding: '14px 16px', background: '#FFFFFF' }}>
          <div className="between" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate)' }}>
              Estado del flete
            </span>
            <span className={`pill ${viaje.estado === 'entregado' ? 'pill-green' : 'pill-navy'}`}>
              {ESTADO_LABEL[viaje.estado]}
            </span>
          </div>

          <div className="steps" style={{ margin: '8px 0' }}>
            <span className={stepIndex >= 1 ? 'on' : ''} />
            <span className={stepIndex >= 2 ? 'on' : ''} />
            <span className={stepIndex >= 3 ? 'on' : ''} />
          </div>

          <div className="between" style={{ fontSize: 11, color: 'var(--slate)', marginTop: 6 }}>
            <span style={{ fontWeight: stepIndex === 1 ? 700 : 500, color: stepIndex === 1 ? 'var(--navy)' : undefined }}>
              1. Asignado
            </span>
            <span style={{ fontWeight: stepIndex === 2 ? 700 : 500, color: stepIndex === 2 ? 'var(--navy)' : undefined }}>
              2. En ruta
            </span>
            <span style={{ fontWeight: stepIndex === 3 ? 700 : 500, color: stepIndex === 3 ? '#10B981' : undefined }}>
              3. Entregado
            </span>
          </div>
        </div>
      )}

      {/* Alerta de Incidencia / Imprevisto en Ruta */}
      {incidenciaActiva && (
        <div
          className="card flat"
          style={{
            background: '#FEF2F2',
            border: '2px solid #EF4444',
            padding: '14px 16px',
            borderRadius: 18,
            marginBottom: 16,
            boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.15)',
          }}
        >
          <div className="between" style={{ marginBottom: 6 }}>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ fontSize: 20 }}>🚨</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#991B1B' }}>
                Incidencia en Ruta: {TIPOS_INCIDENCIA_LABEL[incidenciaActiva.tipo]?.label || 'Imprevisto'}
              </span>
            </div>
            <span className="pill" style={{ background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 700 }}>
              En Curso
            </span>
          </div>

          <div style={{ fontSize: 12.5, color: '#7F1D1D', marginBottom: 4 }}>
            <b>Retraso estimado:</b> {incidenciaActiva.retrasoEstimado}
          </div>

          {incidenciaActiva.ubicacionAprox && (
            <div style={{ fontSize: 12, color: '#7F1D1D', marginBottom: 4 }}>
              <b>Ubicación:</b> {incidenciaActiva.ubicacionAprox}
            </div>
          )}

          <div style={{ fontSize: 11, color: '#991B1B', marginTop: 6, opacity: 0.9 }}>
            Reportado a las {incidenciaActiva.fechaHora}. {soyCamionero ? 'Toca el botón SOS para resolver o actualizar.' : 'Comunícate con el transportista si necesitas coordinar.'}
          </div>
        </div>
      )}

      {successMsg && (
        <div
          className="card flat"
          style={{ background: '#ECFDF5', border: '1.5px solid #10B981', color: '#065F46', marginBottom: 14, padding: 12, fontSize: 12.5, fontWeight: 600 }}
        >
          <Icon name="check" size={14} strokeWidth={2.5} /> {successMsg}
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

      <div className="h2" style={{ fontSize: 20 }}>
        {carga.origen_texto} → {carga.destino_texto}
      </div>
      <div className="sub" style={{ marginBottom: 14 }}>
        {carga.tipo_carga || 'Carga'} · {carga.peso_kg} kg
        {carga.distancia_km ? ` · 📍 ${carga.distancia_km} km` : ''}
        {carga.distancia_km ? ` (${estimarTiempoViaje(carga.distancia_km).texto})` : ''}
      </div>

      {/* Modo Cabina para Transportistas */}
      {soyCamionero && viaje.estado !== 'cancelado' && (
        <div
          className="card between"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            marginBottom: 14,
            padding: '14px 16px',
            cursor: 'pointer',
            borderRadius: 18,
            border: '1.5px solid #334155',
            boxShadow: 'var(--shadow-lift)',
          }}
          onClick={() => setShowModoCabina(true)}
        >
          <div className="row" style={{ gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}
            >
              <Icon name="truck" size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#38BDF8' }}>
                Activar Modo Cabina / Conducción
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>
                Botones gigantes, Waze, Google Maps y llamada directa
              </div>
            </div>
          </div>
          <span className="pill" style={{ background: '#265370', color: '#fff', fontSize: 10, fontWeight: 800 }}>
            Abrir
          </span>
        </div>
      )}

      {/* Tarjeta Financiera / Monto + Escrow Lifecycle */}
      <div
        className="card"
        style={{
          background: escrow.liberado
            ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
            : viaje.pagado
              ? 'var(--navy-tint)'
              : 'var(--navy-tint)',
          border: escrow.liberado
            ? '1.5px solid #86EFAC'
            : viaje.pagado
              ? '1.5px solid var(--navy-tint-2)'
              : '1.5px solid var(--navy-tint-2)',
          marginBottom: 14,
          padding: '14px 16px',
        }}
      >
        <div className="between">
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>
              {soyCamionero ? 'Líquido a recibir (descontada comisión 12%)' : 'Monto total acordado del flete'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: escrow.liberado ? '#166534' : 'var(--navy)', marginTop: 2 }}>
              ${monto.toLocaleString('es-CL')} CLP
            </div>
          </div>
          <span
            className="pill"
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: escrow.liberado ? '#16A34A' : viaje.pagado ? '#0F172A' : '#64748B',
              color: '#fff',
            }}
          >
            {escrow.liberado ? '✅ Pago Liberado' : viaje.pagado ? '🛡️ En Custodia NORTIA' : '⏳ Pago Pendiente'}
          </span>
        </div>

        {/* Banner camionero — estado del pago */}
        {soyCamionero && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid rgba(0,0,0,0.07)',
              fontSize: 12,
            }}
          >
            {escrow.liberado ? (
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 18 }}>💰</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: 13 }}>
                    ¡Pago liberado! Fondos disponibles
                  </div>
                  <div style={{ color: '#15803D', marginTop: 2 }}>
                    Liberado el {formatFechaEscrow(escrow.fechaLiberacion)} · ${monto.toLocaleString('es-CL')} CLP
                  </div>
                </div>
              </div>
            ) : viaje.pagado ? (
              <div
                style={{
                  background: '#FEF9C3',
                  border: '1px solid #FDE047',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#713F12', fontSize: 13 }}>
                    Fondos en custodia — pendiente confirmación
                  </div>
                  <div style={{ color: '#92400E', marginTop: 2 }}>
                    El cliente debe confirmar la recepción para liberar tu pago.
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#9A3412', fontSize: 13 }}>
                    El cliente aún no ha depositado el pago
                  </div>
                  <div style={{ color: '#C2410C', marginTop: 2 }}>
                    Recuerda solicitar el pago antes o durante el flete.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel empresa — pagar y/o liberar */}
        {!soyCamionero && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--navy-tint-2)' }}>
            {escrow.liberado ? (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 12.5,
                  color: '#166534',
                  fontWeight: 700,
                  padding: '8px 0',
                }}
              >
                ✅ Pago liberado al transportista · {formatFechaEscrow(escrow.fechaLiberacion)}
              </div>
            ) : viaje.estado === 'entregado' ? (
              /* Confirmar recepción y liberar */
              confirmandoLiberar ? (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: '0 0 8px' }}>
                    ¿Confirmar recepción conforme y liberar ${monto.toLocaleString('es-CL')} CLP al transportista?
                  </p>
                  <p style={{ fontSize: 11.5, color: '#15803D', margin: '0 0 12px' }}>
                    Esta acción es irreversible. Los fondos quedarán disponibles para el camionero.
                  </p>
                  <div className="row" style={{ gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: 13, background: '#16A34A', borderColor: '#16A34A' }}
                      disabled={liberandoPago}
                      onClick={handleLiberarPago}
                    >
                      {liberandoPago ? 'Liberando…' : '💸 Sí, liberar pago'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '10px', fontSize: 13 }}
                      disabled={liberandoPago}
                      onClick={() => setConfirmandoLiberar(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: 13,
                    justifyContent: 'center',
                    background: '#16A34A',
                    borderColor: '#16A34A',
                  }}
                  onClick={() => setConfirmandoLiberar(true)}
                >
                  💸 Confirmar recepción y liberar pago al camionero
                </button>
              )
            ) : !viaje.pagado ? (
              /* Aún no pagado y viaje no entregado */
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px 14px', fontSize: 13, justifyContent: 'center' }}
                onClick={() => setShowPaymentModal(true)}
              >
                💳 Pagar flete con Tarjeta (Custodia Segura)
              </button>
            ) : (
              /* Pagado pero en ruta/asignado */
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--slate)', padding: '4px 0' }}>
                🛡️ Fondos retenidos en custodia. Se liberarán al confirmar la entrega.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guía de Despacho SII (Fiscalización Carretera) */}
      <div
        className="card between"
        style={{
          background: guiaData ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' : '#F8FAFC',
          border: `1.5px solid ${guiaData ? '#86EFAC' : 'var(--line)'}`,
          marginBottom: 14,
          padding: '13px 16px',
          cursor: 'pointer',
          borderRadius: 16,
        }}
        onClick={() => setShowGuiaModal(true)}
      >
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: 20 }}>📄</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: guiaData ? '#166534' : 'var(--navy)' }}>
              {guiaData ? `Guía de Despacho SII (Folio N° ${guiaData.folio})` : 'Guía de Despacho Electrónica SII'}
            </div>
            <div style={{ fontSize: 11, color: guiaData ? '#15803D' : 'var(--slate)' }}>
              {guiaData
                ? '✓ Lista para control de Carabineros / Fiscalización MTT'
                : soyCamionero
                  ? 'Pendiente de emisión por el cliente'
                  : '+ Adjuntar PDF con timbre fiscal para el chofer'}
            </div>
          </div>
        </div>
        <span className={`pill ${guiaData ? 'pill-green' : 'pill-navy'}`} style={{ fontSize: 10, fontWeight: 700 }}>
          {guiaData ? 'Ver Guía' : soyCamionero ? 'Consultar' : 'Adjuntar'}
        </span>
      </div>

      {/* Póliza de Seguro NORTIA por Viaje */}
      {polizaData && polizaData.plan !== 'ninguno' && (
        <div
          className="card between"
          style={{
            background: 'linear-gradient(135deg, #0B192C 0%, #1E293B 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            marginBottom: 14,
            padding: '13px 16px',
            cursor: 'pointer',
            borderRadius: 16,
          }}
          onClick={() => setShowPolizaModal(true)}
        >
          <div className="row" style={{ gap: 10 }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: '#38BDF8' }}>
                Póliza de Seguro NORTIA Activa
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                {polizaData.numeroPoliza} · Cobertura hasta ${polizaData.montoAsegurado.toLocaleString('es-CL')} CLP
              </div>
            </div>
          </div>
          <span className="pill pill-green" style={{ fontSize: 10, fontWeight: 700 }}>
            Ver Póliza
          </span>
        </div>
      )}

      {/* Factura de Comisión NORTIA DTE 33 */}
      <div
        className="card between"
        style={{
          background: 'var(--paper)',
          border: '1.5px solid var(--line)',
          marginBottom: 14,
          padding: '13px 16px',
          cursor: 'pointer',
          borderRadius: 16,
        }}
        onClick={() => setShowFacturaModal(true)}
      >
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: 20 }}>📄</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--navy)' }}>
              Factura de Comisión NORTIA (DTE 33)
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate)' }}>
              Comprobante tributario SII del 12% (${Math.round(viaje.precio_final * 0.12).toLocaleString('es-CL')} CLP)
            </div>
          </div>
        </div>
        <span className="pill pill-navy" style={{ fontSize: 10, fontWeight: 700 }}>
          Ver Factura
        </span>
      </div>

      {/* Safety Toolkit & Compartir con Familia */}
      <div
        className="card between"
        style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          border: '1.5px solid #86EFAC',
          marginBottom: 14,
          padding: '13px 16px',
          cursor: 'pointer',
          borderRadius: 16,
        }}
        onClick={() => setShowSafetyModal(true)}
      >
        <div className="row" style={{ gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D' }}>
            <Icon name="shield" size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#15803D' }}>
              Safety Toolkit & Asistencia en Ruta
            </div>
            <div style={{ fontSize: 11, color: '#166534' }}>
              Compartir seguimiento en vivo con contactos y números de emergencia
            </div>
          </div>
        </div>
        <span className="pill pill-green" style={{ fontSize: 10, fontWeight: 700 }}>
          Abrir Toolkit
        </span>
      </div>

      {/* Control de Estadía / Detention Pay */}
      <div
        className="card between"
        style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '1.5px solid #FCD34D',
          marginBottom: 14,
          padding: '13px 16px',
          cursor: 'pointer',
          borderRadius: 16,
        }}
        onClick={() => setShowEstadiaModal(true)}
      >
        <div className="row" style={{ gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
            <Icon name="clock" size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#B45309' }}>
              Reloj de Estadía & Espera en Bodega
            </div>
            <div style={{ fontSize: 11, color: '#92400E' }}>
              2 horas de cortesía · Compensación de $18.000/hr por demoras en andén
            </div>
          </div>
        </div>
        <span className="pill pill-navy" style={{ fontSize: 10, fontWeight: 700 }}>
          Ver Reloj
        </span>
      </div>

      {/* Checklist Digital Pre-Viaje / Vuelta del Perro */}
      <div
        className="card between"
        style={{
          background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
          border: '1.5px solid #BAE6FD',
          marginBottom: 14,
          padding: '13px 16px',
          cursor: 'pointer',
          borderRadius: 16,
        }}
        onClick={() => setShowChecklistModal(true)}
      >
        <div className="row" style={{ gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369A1' }}>
            <Icon name="doc" size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0369A1' }}>
              Checklist Pre-Viaje («Vuelta del Perro»)
            </div>
            <div style={{ fontSize: 11, color: '#265370' }}>
              Neumáticos, amarres, frenos y extintor · Certificado digital para andén
            </div>
          </div>
        </div>
        <span className="pill pill-navy" style={{ fontSize: 10, fontWeight: 700 }}>
          Ver Checklist
        </span>
      </div>

      {/* Pase de Portería Express con QR */}
      <div
        className="card between"
        style={{
          background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
          border: '1.5px solid #D8B4FE',
          marginBottom: 14,
          padding: '13px 16px',
          cursor: 'pointer',
          borderRadius: 16,
        }}
        onClick={() => setShowPaseModal(true)}
      >
        <div className="row" style={{ gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE' }}>
            <Icon name="user" size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#7E22CE' }}>
              Pase de Portería Digital
            </div>
            <div style={{ fontSize: 11, color: '#6B21A8' }}>
              Credencial digital para control de acceso rápido en garita
            </div>
          </div>
        </div>
        <span className="pill" style={{ background: '#7E22CE', color: '#fff', fontSize: 10, fontWeight: 700 }}>
          Ver Pase
        </span>
      </div>

      {/* Botones de Navegación GPS Rápida */}
      <div className="row" style={{ gap: 8, marginBottom: 14 }}>
        <a
          href={carga.destino_lat && carga.destino_lng ? `https://waze.com/ul?ll=${carga.destino_lat},${carga.destino_lng}&navigate=yes` : `https://waze.com/ul?q=${encodeURIComponent(carga.destino_texto + ', Chile')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="chip"
          style={{ flex: 1, justifyContent: 'center', background: '#E0F2FE', color: '#0369A1', textDecoration: 'none', fontWeight: 700, fontSize: 12, padding: '8px' }}
        >
          Navegar en Waze
        </a>
        <a
          href={carga.destino_lat && carga.destino_lng ? `https://www.google.com/maps/dir/?api=1&destination=${carga.destino_lat},${carga.destino_lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(carga.destino_texto + ', Chile')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="chip"
          style={{ flex: 1, justifyContent: 'center', background: '#ECFDF5', color: '#065F46', textDecoration: 'none', fontWeight: 700, fontSize: 12, padding: '8px' }}
        >
          🗺️ Google Maps
        </a>
      </div>

      {/* Datos de Contacto de la Otra Parte (Teléfono / WhatsApp) */}
      {otraParte && (
        <div className="card" style={{ marginBottom: 14, padding: 14 }}>
          <div className="row" style={{ gap: 12 }}>
            <div className="ic-chip ic-navy" style={{ fontWeight: 700, width: 44, height: 44, borderRadius: 14, fontSize: 16 }}>
              {(otraParte.nombre || otraParte.razon_social || '??').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 14.5 }}>{otraParte.nombre || otraParte.razon_social}</span>
                {otraParte.verificado && (
                  <span className="verified">
                    <Icon name="check" size={11} strokeWidth={3} />
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 1 }}>
                {soyCamionero ? 'Cliente / Negocio' : 'Transportista asignado'}
                {camion ? ` · ${camion.tipo} (${camion.patente})` : ''}
              </div>
            </div>
          </div>

          {/* Botón de Chat Oficial NORTIA */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 13,
                justifyContent: 'center',
                background: 'var(--navy)',
              }}
              onClick={() => setShowChatModal(true)}
            >
              💬 Abrir Chat Oficial del Flete
            </button>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--slate)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <span>🔒</span>
              <span>Comunicación protegida y respaldada por NORTIA Escrow</span>
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta de Conductor Asignado en Ruta (Modo Flotas) */}
      <div className="card" style={{ marginBottom: 14, padding: '14px 16px', background: '#FFFFFF', border: '1.5px solid var(--line)' }}>
        <div className="between" style={{ marginBottom: 6 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 20 }}>🪪</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--navy)' }}>
                {choferAsignado ? 'Conductor Asignado en Ruta' : 'Conductor del Camión'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                {choferAsignado
                  ? `${choferAsignado.nombreCompleto} (RUT: ${choferAsignado.rut})`
                  : soyCamionero
                    ? 'Conducirás tú mismo (Titular)'
                    : 'Conductor titular'}
              </div>
            </div>
          </div>

          {soyCamionero && (
            <button
              type="button"
              className="pill pill-navy"
              style={{ fontSize: 10.5, fontWeight: 700, cursor: 'pointer', border: 'none' }}
              onClick={() => setShowAsignarChoferModal(true)}
            >
              {choferAsignado ? 'Cambiar Chofer' : 'Asignar Chofer'}
            </button>
          )}
        </div>

        {choferAsignado && soyCamionero && choferAsignado.telefono && (
          <div className="row" style={{ gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
            <a
              href={`tel:${choferAsignado.telefono}`}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '8px 12px', fontSize: 12, textDecoration: 'none', textAlign: 'center', justifyContent: 'center' }}
            >
              📞 Llamar a tu Chofer ({choferAsignado.telefono})
            </a>
          </div>
        )}
      </div>

      {/* Datos Tributarios y de Facturación */}
      {otraParte && (
        <div className="card" style={{ marginBottom: 14, padding: 14 }}>
          <div className="between" style={{ marginBottom: 10 }}>
            <div className="row" style={{ gap: 6 }}>
              <span style={{ color: 'var(--navy)' }}>
                <Icon name="doc" size={16} strokeWidth={2} />
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate)' }}>
                Datos de Facturación
              </span>
            </div>
            <span className="pill pill-navy" style={{ fontSize: 10.5 }}>
              {otraParte.emite_factura ? 'Requiere Factura DTE' : 'Boleta de Servicios'}
            </span>
          </div>

          <div style={{ fontSize: 12.5 }}>
            <div className="between" style={{ padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--slate)' }}>Razón Social / Nombre</span>
              <span style={{ fontWeight: 600 }}>{otraParte.razon_social || otraParte.nombre}</span>
            </div>
            {otraParte.rut && (
              <div className="between" style={{ padding: '4px 0', borderBottom: otraParte.rubro ? '1px solid var(--line)' : 'none' }}>
                <span style={{ color: 'var(--slate)' }}>RUT Tributario</span>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{otraParte.rut}</span>
              </div>
            )}
            {otraParte.rubro && (
              <div className="between" style={{ padding: '4px 0' }}>
                <span style={{ color: 'var(--slate)' }}>Giro / Actividad</span>
                <span style={{ fontWeight: 500 }}>{otraParte.rubro}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botones de Acción según Rol y Estado */}
      {viaje.estado === 'asignado' && (
        <div className="card flat" style={{ background: '#FFFFFF', border: '1.5px solid var(--line)', padding: 16, marginBottom: 14 }}>
          {soyCamionero ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>¿Listo para retirar la carga?</div>
              <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 12 }}>
                Al presionar "Salir a ruta", el cliente sabrá que el camión va en camino hacia el destino.
              </div>
              <button
                className="btn btn-primary"
                disabled={actualizandoEstado}
                onClick={handleIniciarRuta}
                style={{ width: '100%', padding: '12px' }}
              >
                {actualizandoEstado ? 'Actualizando…' : '🚚 Salir a ruta / Iniciar viaje'}
              </button>
            </div>
          ) : (
            <div className="row" style={{ gap: 10 }}>
              <span style={{ color: 'var(--navy)' }}>
                <Icon name="clock" size={20} strokeWidth={1.8} />
              </span>
              <div style={{ fontSize: 12.5, color: 'var(--slate)' }}>
                El transportista está coordinando el retiro de tu carga.
              </div>
            </div>
          )}
        </div>
      )}

      {viaje.estado === 'en_ruta' && (
        <div className="card flat" style={{ background: '#ECFDF5', border: '1.5px solid #10B981', padding: 16, marginBottom: 14 }}>
          <div className="between" style={{ marginBottom: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ color: '#10B981' }}>
                <Icon name="truck" size={20} strokeWidth={2} />
              </span>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#065F46' }}>
                Viaje en curso
              </span>
            </div>
            <span className="pill pill-green" style={{ fontSize: 11 }}>En ruta</span>
          </div>

          <p style={{ fontSize: 12.5, color: '#065F46', margin: '0 0 12px' }}>
            {soyCamionero
              ? 'Cuando hayas entregado la carga en el destino, confirma el cierre del viaje.'
              : 'El camión se encuentra en camino. Confirma cuando hayas recibido la carga conforme.'}
          </p>

          <button
            className="btn btn-primary"
            disabled={actualizandoEstado}
            onClick={handleMarcarEntregado}
            style={{ width: '100%', padding: '12px', background: '#10B981', borderColor: '#10B981' }}
          >
            {actualizandoEstado ? 'Guardando…' : '✅ Confirmar entrega de carga'}
          </button>

          {soyCamionero && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: '100%',
                marginTop: 8,
                padding: '10px',
                color: '#DC2626',
                borderColor: '#FCA5A5',
                background: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
              }}
              onClick={() => setShowSosModal(true)}
            >
              🚨 Reportar Imprevisto / SOS (Pana, Neumático, Taco)
            </button>
          )}
        </div>
      )}

      {/* Cancelación de viaje */}
      {viaje.estado !== 'entregado' && viaje.estado !== 'cancelado' && (
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          {confirmingCancel ? (
            <div className="card flat" style={{ background: 'var(--danger-soft)', padding: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--ink)', margin: '0 0 10px' }}>¿Seguro que deseas cancelar este viaje?</p>
              <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-primary" disabled={cancelando} onClick={handleCancelar}>
                  {cancelando ? 'Cancelando…' : 'Sí, cancelar'}
                </button>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)', cursor: 'pointer', padding: '0 10px' }}
                  onClick={() => setConfirmingCancel(false)}
                >
                  No
                </span>
              </div>
            </div>
          ) : (
            <span
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', cursor: 'pointer' }}
              onClick={() => setConfirmingCancel(true)}
            >
              Cancelar viaje
            </span>
          )}
        </div>
      )}

      {/* Comprobante de Entrega Digital (POD) Certificado */}
      {viaje.estado === 'entregado' && (
        <div
          className="card flat"
          style={{
            background: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            padding: '16px',
            marginBottom: 16,
            borderRadius: 18,
          }}
        >
          <div className="between" style={{ marginBottom: 10 }}>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ fontSize: 18 }}>📸</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#166534' }}>
                Comprobante de Entrega Certificado (POD)
              </span>
            </div>
            <span className="pill pill-green" style={{ fontSize: 10 }}>
              Recepción Conforme
            </span>
          </div>

          <div style={{ fontSize: 12, color: '#15803D', marginBottom: 10 }}>
            <div className="between" style={{ padding: '3px 0' }}>
              <span style={{ color: '#4B5563' }}>Receptor:</span>
              <span style={{ fontWeight: 700 }}>{podData?.nombreReceptor || otraParte?.nombre || 'Receptor en Destino'}</span>
            </div>
            {podData?.rutReceptor && (
              <div className="between" style={{ padding: '3px 0' }}>
                <span style={{ color: '#4B5563' }}>RUT Receptor:</span>
                <span style={{ fontWeight: 700 }}>{podData.rutReceptor}</span>
              </div>
            )}
            <div className="between" style={{ padding: '3px 0' }}>
              <span style={{ color: '#4B5563' }}>Fecha y Hora:</span>
              <span>{podData?.fechaHora || (viaje.fecha_entrega ? new Date(viaje.fecha_entrega).toLocaleString('es-CL') : 'Entregado')}</span>
            </div>
            {podData?.observaciones && (
              <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed #BBF7D0', color: '#166534' }}>
                <b>Observaciones:</b> {podData.observaciones}
              </div>
            )}
          </div>

          {/* Firma Digital y Fotos */}
          {podData?.firmaBase64 && (
            <div style={{ marginTop: 8, padding: 8, background: '#FFFFFF', borderRadius: 12, border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: 10.5, color: '#6B7280', marginBottom: 4, fontWeight: 700 }}>
                FIRMA DIGITAL DEL RECEPTOR:
              </div>
              <img
                src={podData.firmaBase64}
                alt="Firma del Receptor"
                style={{ maxHeight: 60, display: 'block', margin: '0 auto' }}
              />
            </div>
          )}

          {(podData?.fotoEntregaUrl || podData?.fotoGuiaUrl) && (
            <div className="row" style={{ gap: 8, marginTop: 10 }}>
              {podData.fotoEntregaUrl && (
                <a
                  href={podData.fotoEntregaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="chip"
                  style={{ flex: 1, justifyContent: 'center', background: '#DCFCE7', color: '#166534', fontSize: 11, fontWeight: 700 }}
                >
                  📷 Foto Carga
                </a>
              )}
              {podData.fotoGuiaUrl && (
                <a
                  href={podData.fotoGuiaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="chip"
                  style={{ flex: 1, justifyContent: 'center', background: '#DCFCE7', color: '#166534', fontSize: 11, fontWeight: 700 }}
                >
                  📄 Guía Timbrada
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reseñas post-entrega */}
      {viaje.estado === 'entregado' && (
        <div style={{ marginTop: 10 }}>
          <div className="eyebrow">Calificación del servicio</div>
          {miResena ? (
            <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 20 }}>
              <Icon name="check" size={20} strokeWidth={2.5} className="text-navy" />
              <p style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 700, margin: '6px 0 2px' }}>
                ¡Ya calificaste este flete!
              </p>
              <p style={{ fontSize: 12, color: 'var(--slate)', margin: 0 }}>
                Tu reseña ayuda a construir confianza en NORTIA.
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="field">
                <label>Califica tu experiencia con {otraParte?.nombre || 'el usuario'}</label>
                <div className="row" style={{ gap: 8, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      onClick={() => setPuntuacion(n)}
                      style={{ cursor: 'pointer', color: n <= puntuacion ? '#F59E0B' : 'var(--line)' }}
                    >
                      <StarFill size={28} />
                    </span>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Comentario</label>
                <textarea
                  rows={2}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Puntualidad, trato, estado de la carga…"
                />
              </div>
              <button className="btn btn-primary" disabled={enviandoResena} onClick={handleEnviarResena}>
                {enviandoResena ? 'Publicando…' : 'Enviar reseña'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Pago Seguro con Tarjeta */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          monto={viaje.precio_final}
          descripcionCarga={`${carga.origen_texto} → ${carga.destino_texto}`}
          viajeId={viaje.id}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePagoViajeExitoso}
        />
      )}

      {/* Modal de Modo Cabina / Conducción */}
      {showModoCabina && (
        <ModoCabinaModal
          isOpen={showModoCabina}
          viaje={viaje}
          carga={carga}
          otraParte={otraParte}
          onClose={() => setShowModoCabina(false)}
          onCambiarEstado={(nuevoEstado) => {
            if (nuevoEstado === 'en_ruta') handleIniciarRuta()
            if (nuevoEstado === 'entregado') handleMarcarEntregado()
          }}
          onOpenGuia={() => setShowGuiaModal(true)}
          onOpenSos={() => setShowSosModal(true)}
          onOpenChat={() => {
            setShowModoCabina(false)
            setShowChatModal(true)
          }}
          actualizando={actualizandoEstado}
        />
      )}

      {/* Modal de Comprobante de Entrega Digital (POD) */}
      {showPodModal && (
        <ProofOfDeliveryModal
          isOpen={showPodModal}
          viajeId={viaje.id}
          destinoTexto={carga.destino_texto}
          onClose={() => setShowPodModal(false)}
          onSuccess={handlePodCompletado}
        />
      )}

      {/* Modal de Guía de Despacho Electrónica (SII) */}
      {showGuiaModal && (
        <GuiaDespachoModal
          isOpen={showGuiaModal}
          cargaId={carga.id}
          viajeId={viaje.id}
          esEmisor={!soyCamionero}
          onClose={() => setShowGuiaModal(false)}
          onGuiaActualizada={(nuevaGuia) => setGuiaData(nuevaGuia)}
        />
      )}

      {/* Modal de Póliza de Seguro NORTIA */}
      {showPolizaModal && polizaData && (
        <PolizaSeguroModal
          isOpen={showPolizaModal}
          poliza={polizaData}
          onClose={() => setShowPolizaModal(false)}
        />
      )}

      {/* Modal de Asistencia SOS e Incidencias en Ruta */}
      {showSosModal && (
        <SosModal
          isOpen={showSosModal}
          viajeId={viaje.id}
          cargaId={carga.id}
          origenTexto={carga.origen_texto}
          destinoTexto={carga.destino_texto}
          onClose={() => setShowSosModal(false)}
          onIncidenciaActualizada={(inc) => setIncidenciaActiva(inc)}
        />
      )}

      {/* Modal para Asignar Chofer al Viaje */}
      {showAsignarChoferModal && (
        <div className="apple-modal-overlay">
          <div className="apple-modal-sheet" style={{ maxWidth: 420 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>Asignar Conductor al Flete</div>
              <button
                type="button"
                onClick={() => setShowAsignarChoferModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 14 }}>
              Selecciona quién conducirá el camión en este viaje para que la empresa y los guardias de bodega puedan identificarlo en la portería:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {/* Opción 1: Yo mismo (Titular) */}
              <div
                onClick={() => {
                  asignarChoferAViaje(viaje.id, null)
                  setChoferAsignado(null)
                  setShowAsignarChoferModal(false)
                }}
                style={{
                  border: `1.5px solid ${!choferAsignado ? 'var(--navy)' : 'var(--line)'}`,
                  background: !choferAsignado ? 'var(--navy-tint)' : '#FFFFFF',
                  borderRadius: 14,
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                <div className="between">
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontSize: 18 }}>👤</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: !choferAsignado ? 'var(--navy)' : 'var(--ink)' }}>
                        {session?.user.email ? 'Yo mismo' : 'Titular'} (Conductor Principal)
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--slate)' }}>Conduciré personalmente</div>
                    </div>
                  </div>
                  {!choferAsignado && <span className="pill pill-navy" style={{ fontSize: 10 }}>Seleccionado</span>}
                </div>
              </div>

              {/* Lista de Choferes de Flota */}
              {misChoferes.map((c) => {
                const isSelected = choferAsignado?.id === c.id
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      asignarChoferAViaje(viaje.id, c)
                      setChoferAsignado(c)
                      setShowAsignarChoferModal(false)
                    }}
                    style={{
                      border: `1.5px solid ${isSelected ? 'var(--navy)' : 'var(--line)'}`,
                      background: isSelected ? 'var(--navy-tint)' : '#FFFFFF',
                      borderRadius: 14,
                      padding: '12px 14px',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="between">
                      <div className="row" style={{ gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🚚</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? 'var(--navy)' : 'var(--ink)' }}>
                            {c.nombreCompleto}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                            RUT: {c.rut} · Tel: {c.telefono} (Licencia {c.licenciaClase})
                          </div>
                        </div>
                      </div>
                      {isSelected && <span className="pill pill-navy" style={{ fontSize: 10 }}>Seleccionado</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', padding: '10px' }}
              onClick={() => {
                setShowAsignarChoferModal(false)
                navigate('/camionero/choferes')
              }}
            >
              + Administrar Nómina de Choferes
            </button>
          </div>
        </div>
      )}

      {/* Modal de Chat Oficial NORTIA */}
      {showChatModal && session?.user.id && otraParte && (
        <ChatModal
          isOpen={showChatModal}
          viajeId={viaje.id}
          miUsuarioId={session.user.id}
          miNombre={perfil?.nombre || perfil?.razon_social || (soyCamionero ? 'Transportista' : 'Cliente')}
          miRol={soyCamionero ? 'camionero' : 'cliente'}
          otraParteNombre={otraParte.nombre || otraParte.razon_social || 'Contacto'}
          otraParteId={otraParte.id}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Modal de Factura Electrónica SII NORTIA */}
      {showFacturaModal && carga && (
        <FacturaComisionModal
          isOpen={showFacturaModal}
          viajeId={viaje.id}
          clienteNombre={perfil?.razon_social || perfil?.nombre || 'Empresa Cliente'}
          clienteRut={perfil?.rut || '76.890.123-4'}
          origenTexto={carga.origen_texto}
          destinoTexto={carga.destino_texto}
          montoFleteTotal={viaje.precio_final}
          onClose={() => setShowFacturaModal(false)}
        />
      )}

      {/* Modal de Safety Toolkit & Familia */}
      {showSafetyModal && carga && (
        <SafetyToolkitModal
          isOpen={showSafetyModal}
          origenTexto={carga.origen_texto}
          destinoTexto={carga.destino_texto}
          patente={camion?.patente || 'Camión NORTIA'}
          viajeId={viaje.id}
          onClose={() => setShowSafetyModal(false)}
        />
      )}

      {/* Modal de Reloj de Estadía en Bodega */}
      <RelojEstadiaModal
        isOpen={showEstadiaModal}
        viajeId={viaje.id}
        esCamionero={soyCamionero}
        onClose={() => setShowEstadiaModal(false)}
      />

      {/* Modal de Checklist Digital Pre-Viaje */}
      <ChecklistPreViajeModal
        isOpen={showChecklistModal}
        viajeId={viaje.id}
        conductorNombre={perfil?.nombre || 'Conductor Profesional'}
        patente={camion?.patente || 'Camión NORTIA'}
        onClose={() => setShowChecklistModal(false)}
      />

      {/* Modal de Pase de Portería Express */}
      {carga && (
        <PasePorteriaModal
          isOpen={showPaseModal}
          viajeId={viaje.id}
          conductorNombre={perfil?.nombre || 'Conductor NORTIA'}
          conductorRut={perfil?.rut || '14.567.890-2'}
          patente={camion?.patente || 'Camión NORTIA'}
          empresaCliente={otraParte?.nombre || otraParte?.razon_social || 'Empresa Cliente'}
          origenTexto={carga.origen_texto}
          destinoTexto={carga.destino_texto}
          onClose={() => setShowPaseModal(false)}
        />
      )}
      </div>
    </WebPlatformLayout>
  )
}

