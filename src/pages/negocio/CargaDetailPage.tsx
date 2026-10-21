import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, StarFill, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { PaymentModal } from '../../components/PaymentModal'
import { GuiaDespachoModal } from '../../components/GuiaDespachoModal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import { obtenerGuiaDespacho, type GuiaDespachoData } from '../../lib/guiaDespachoService'
import type { Tables } from '../../lib/database.types'
import { regionNames } from '../../lib/chileRegions'
import { notifFleteAsignado } from '../../lib/pushService'

type Carga = Tables<'cargas'>
type Oferta = Tables<'ofertas'> & {
  perfiles: Pick<Tables<'perfiles'>, 'nombre' | 'rating_prom' | 'total_resenas' | 'verificado'> | null
  camiones: Pick<Tables<'camiones'>, 'tipo' | 'patente' | 'marca' | 'modelo'> | null
}

const ESTADO_LABEL: Record<Carga['estado'], string> = {
  borrador: 'Borrador',
  publicada: 'Buscando transportista',
  asignada: 'Asignada',
  en_ruta: 'En ruta',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
}

export function CargaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const basePath = perfil?.rol === 'proveedor' ? '/proveedor' : '/negocio'
  const [carga, setCarga] = useState<Carga | null>(null)
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [viajeId, setViajeId] = useState<string | null>(null)
  const [guiaData, setGuiaData] = useState<GuiaDespachoData | null>(null)
  const [showGuiaModal, setShowGuiaModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  const [confirmingOfertaId, setConfirmingOfertaId] = useState<string | null>(null)
  const [payingOferta, setPayingOferta] = useState<Oferta | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    async function load() {
      const [{ data: cargaData }, { data: ofertasData }, { data: viajeData }] = await Promise.all([
        supabase.from('cargas').select('*').eq('id', id!).single(),
        supabase
          .from('ofertas')
          .select('*, perfiles:camionero_id(nombre, rating_prom, total_resenas, verificado), camiones:camion_id(tipo, patente, marca, modelo)')
          .eq('carga_id', id!)
          .order('created_at', { ascending: false }),
        supabase.from('viajes').select('id').eq('carga_id', id!).maybeSingle(),
      ])
      if (!active) return
      setCarga(cargaData ?? null)
      setOfertas((ofertasData as Oferta[]) ?? [])
      setViajeId(viajeData?.id ?? null)
      setGuiaData(obtenerGuiaDespacho(id!))
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [id, reloadKey])

  async function handleAceptar(ofertaId: string) {
    setAccepting(ofertaId)
    setError(null)
    const { error } = await supabase.rpc('aceptar_oferta', { p_oferta_id: ofertaId })
    if (error) {
      setError(error.message)
      setAccepting(null)
      setConfirmingOfertaId(null)
      return
    }

    // Notificar al camionero que su oferta fue aceptada
    const ofertaAceptada = ofertas.find((o) => o.id === ofertaId)
    if (ofertaAceptada && carga) {
      // Buscar el viajeId recién creado para el link
      const { data: viajeNuevo } = await supabase
        .from('viajes')
        .select('id')
        .eq('carga_id', carga.id)
        .maybeSingle()
      notifFleteAsignado(
        ofertaAceptada.camionero_id,
        carga.tipo_carga || `${carga.origen_texto} → ${carga.destino_texto}`,
        perfil?.razon_social || perfil?.nombre || 'El cliente',
        viajeNuevo?.id ?? carga.id,
      )
    }

    setReloadKey((k) => k + 1)
    setAccepting(null)
    setConfirmingOfertaId(null)
  }

  async function handlePagoTarjetaExitoso() {
    if (!payingOferta) return
    setAccepting(payingOferta.id)
    setError(null)

    const { error: aErr } = await supabase.rpc('aceptar_oferta', { p_oferta_id: payingOferta.id })
    if (aErr) {
      setError(aErr.message)
      setAccepting(null)
      return
    }

    // Marcar el viaje como pagado (fondos en custodia)
    if (id) {
      await supabase.from('viajes').update({ pagado: true }).eq('carga_id', id)
    }

    setReloadKey((k) => k + 1)
    setAccepting(null)
    setPayingOferta(null)
    setConfirmingOfertaId(null)
  }

  async function handleCancelar() {
    if (!id) return
    setCancelando(true)
    setError(null)
    const { error } = await supabase.rpc('cancelar_carga', { p_carga_id: id })
    if (error) {
      setError(error.message)
      setCancelando(false)
      return
    }
    setReloadKey((k) => k + 1)
    setCancelando(false)
    setConfirmingCancel(false)
  }

  if (loading) {
    return (
      <div className="px" style={{ paddingTop: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>
      </div>
    )
  }

  if (!carga) {
    return (
      <div className="px" style={{ paddingTop: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>No encontramos esta carga.</p>
      </div>
    )
  }

  return (
    <WebPlatformLayout activeTab="Mis Cargas">
      <div className="web-platform-container">
        {/* Header con migas y botón volver */}
        <div className="between" style={{ marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Gestión de Envío · {carga.tipo_carga || 'Carga Comercial'}</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              {carga.origen_texto} → {carga.destino_texto}
            </div>
          </div>

          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <span className="pill pill-navy" style={{ fontWeight: 700 }}>
              {ESTADO_LABEL[carga.estado]}
            </span>
            <button
              type="button"
              className="chip"
              style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
              onClick={() => navigate(basePath)}
            >
              <Icon name="arrowL" size={15} strokeWidth={2} />
              <span>Volver</span>
            </button>
          </div>
        </div>

        <div className="two-col-grid" style={{ alignItems: 'start' }}>
          {/* Columna 1: Ficha del Envío & Guía SII */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: '20px' }}>
              <div className="between" style={{ marginBottom: 14, alignItems: 'center' }}>
                <span className="pill pill-navy" style={{ fontWeight: 700 }}>
                  {carga.tipo_carga || 'Carga General'}
                </span>
                {carga.precio_referencia && (
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>
                    Presupuesto ref: ${carga.precio_referencia.toLocaleString('es-CL')} CLP
                  </span>
                )}
              </div>

              {carga.descripcion && (
                <div className="card flat" style={{ background: 'var(--paper)', marginBottom: 14, padding: '12px 14px' }}>
                  <p style={{ fontSize: 13, color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>{carga.descripcion}</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--slate)' }}>Peso Declarado</span>
                  <span style={{ fontWeight: 700 }}>{carga.peso_kg.toLocaleString('es-CL')} kg</span>
                </div>
                {carga.volumen_m3 && (
                  <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--slate)' }}>Volumen</span>
                    <span style={{ fontWeight: 700 }}>{carga.volumen_m3} m³</span>
                  </div>
                )}
                {carga.pallets && (
                  <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--slate)' }}>Pallets</span>
                    <span style={{ fontWeight: 700 }}>{carga.pallets} pallets</span>
                  </div>
                )}
                {carga.distancia_km && (
                  <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--slate)' }}>Distancia Estimada</span>
                    <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="pin" size={13} strokeWidth={2} />
                      <span>{carga.distancia_km} km</span>
                    </span>
                  </div>
                )}
                {carga.origen_region && (
                  <div className="between">
                    <span style={{ color: 'var(--slate)' }}>Región de Origen</span>
                    <span style={{ fontWeight: 600 }}>{regionNames[carga.origen_region]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Viaje en Ruta si ya está adjudicado */}
            {viajeId && (
              <div
                className="card between"
                style={{
                  cursor: 'pointer',
                  background: 'var(--navy-tint)',
                  borderColor: 'rgba(30, 58, 138, 0.2)',
                  padding: '16px 20px',
                }}
                onClick={() => navigate(`/viajes/${viajeId}`)}
              >
                <div className="row" style={{ gap: 12 }}>
                  <div style={{ color: 'var(--navy)' }}>
                    <Icon name="truck" size={22} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)' }}>
                      Viaje Activo en Curso
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>
                      Seguimiento en tiempo real y estado de entrega
                    </div>
                  </div>
                </div>
                <Icon name="chevR" size={18} strokeWidth={2} />
              </div>
            )}

            {/* Guía de Despacho SII */}
            {carga.estado !== 'borrador' && carga.estado !== 'cancelada' && (
              <div
                className="card between"
                style={{
                  background: guiaData ? 'rgba(16, 185, 129, 0.08)' : 'var(--card-glass-bg)',
                  borderColor: guiaData ? '#10B981' : 'var(--card-glass-border)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderRadius: 16,
                }}
                onClick={() => setShowGuiaModal(true)}
              >
                <div className="row" style={{ gap: 12 }}>
                  <div style={{ color: guiaData ? '#059669' : 'var(--navy)' }}>
                    <Icon name="file" size={22} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: guiaData ? '#065F46' : 'var(--ink)' }}>
                      {guiaData ? `Guía de Despacho SII (Folio N° ${guiaData.folio})` : 'Guía de Despacho Electrónica SII'}
                    </div>
                    <div style={{ fontSize: 11.5, color: guiaData ? '#047857' : 'var(--slate)', marginTop: 2 }}>
                      {guiaData ? 'Documento tributario emitido y disponible para fiscalización' : 'Adjunta copia PDF o foto para el transportista'}
                    </div>
                  </div>
                </div>
                <span className={`pill ${guiaData ? 'pill-green' : 'pill-navy'}`} style={{ fontSize: 11, fontWeight: 700 }}>
                  {guiaData ? 'Ver / Modificar' : 'Adjuntar'}
                </span>
              </div>
            )}

            {/* Cancelar Carga */}
            {(carga.estado === 'borrador' || carga.estado === 'publicada') && (
              <div className="card flat" style={{ padding: '16px 20px', background: 'var(--paper)' }}>
                {confirmingCancel ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: 'var(--ink)', margin: '0 0 12px' }}>¿Deseas cancelar definitivamente esta publicación de carga?</p>
                    <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
                      <button className="btn btn-primary" style={{ background: 'var(--danger)' }} disabled={cancelando} onClick={handleCancelar}>
                        {cancelando ? 'Cancelando…' : 'Sí, cancelar publicación'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setConfirmingCancel(false)}
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="between" style={{ alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--slate)' }}>Si ya no requieres este transporte:</span>
                    <button
                      type="button"
                      className="chip"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}
                      onClick={() => setConfirmingCancel(true)}
                    >
                      Cancelar Carga
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, margin: 0 }}>{error}</p>}
          </div>

          {/* Columna 2: Ofertas de Transportistas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: '20px' }}>
              <div className="between" style={{ marginBottom: 14, alignItems: 'center' }}>
                <div className="eyebrow" style={{ margin: 0 }}>
                  Ofertas Recibidas ({ofertas.length})
                </div>
                {ofertas.length > 0 && (
                  <span className="pill pill-navy" style={{ fontSize: 10.5 }}>
                    {ofertas.filter((o) => o.estado === 'pendiente').length} pendientes
                  </span>
                )}
              </div>

              {ofertas.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--slate)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--navy-tint)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon name="truck" size={22} strokeWidth={1.8} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>
                    Buscando transportistas certificados
                  </div>
                  <p style={{ fontSize: 12.5, margin: 0 }}>
                    Los camioneros con rutas compatibles verán tu carga y recibirás ofertas en tiempo real.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ofertas.map((oferta) => (
                  <div
                    key={oferta.id}
                    className="card flat"
                    style={{
                      padding: '16px',
                      borderRadius: 14,
                      border: '1px solid var(--card-glass-border)',
                      background: 'var(--surface)',
                    }}
                  >
                    <div className="row" style={{ gap: 12, cursor: 'pointer', alignItems: 'flex-start' }} onClick={() => navigate(`/perfil/${oferta.camionero_id}`)}>
                      <div className="ic-chip ic-navy" style={{ fontWeight: 700, width: 40, height: 40, borderRadius: 12 }}>
                        {oferta.perfiles?.nombre?.slice(0, 2).toUpperCase() ?? 'TR'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--ink)' }}>{oferta.perfiles?.nombre ?? 'Transportista'}</span>
                          {oferta.perfiles?.verificado && (
                            <span className="verified" style={{ transform: 'scale(0.8)' }}>
                              <Icon name="check" size={11} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                          {oferta.camiones ? `${oferta.camiones.tipo} · ${oferta.camiones.patente}` : 'Unidad Verificada'}
                        </div>
                        {oferta.perfiles?.verificado && (
                          <div style={{ marginTop: 4 }}>
                            <span className="pill pill-green" style={{ fontSize: 10, padding: '2px 7px', gap: 3 }}>
                              <Icon name="shield" size={10} strokeWidth={2.4} /> Conductor Verificado NORTIA
                            </span>
                          </div>
                        )}
                        {oferta.perfiles?.rating_prom != null && (
                          <div className="row" style={{ gap: 4, marginTop: 4 }}>
                            <span className="stars">
                              <StarFill size={12} />
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{oferta.perfiles.rating_prom}</span>
                            <span className="meta">· {oferta.perfiles.total_resenas} reseñas</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>
                          ${oferta.precio.toLocaleString('es-CL')}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--slate)' }}>Total flete</div>
                      </div>
                    </div>

                    {oferta.mensaje && (
                      <div style={{ fontSize: 12.5, color: 'var(--ink)', marginTop: 10, background: 'var(--paper)', padding: '8px 12px', borderRadius: 10 }}>
                        "{oferta.mensaje}"
                      </div>
                    )}

                    {oferta.estado === 'pendiente' && carga.estado === 'publicada' && (
                      <div style={{ marginTop: 12 }}>
                        {confirmingOfertaId === oferta.id ? (
                          <div
                            className="card flat"
                            style={{
                              background: 'var(--navy-tint)',
                              border: '1.5px solid var(--navy-tint-2)',
                              padding: '14px 16px',
                              borderRadius: 14,
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                              Adjudicación de Flete: ${oferta.precio.toLocaleString('es-CL')} CLP
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--slate)', marginBottom: 12 }}>
                              Elige el método de garantía de pago para <b>{oferta.perfiles?.nombre || 'el transportista'}</b>:
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <button
                                className="btn btn-primary"
                                style={{ padding: '10px 14px', fontSize: 12.5, width: '100%', justifyContent: 'center' }}
                                onClick={() => setPayingOferta(oferta)}
                              >
                                Pagar con Tarjeta (Custodia NORTIA Escrow)
                              </button>
                              <div className="row" style={{ gap: 8 }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ flex: 1, padding: '8px 12px', fontSize: 12, justifyContent: 'center' }}
                                  disabled={accepting === oferta.id}
                                  onClick={() => handleAceptar(oferta.id)}
                                >
                                  {accepting === oferta.id ? 'Asignando…' : 'Pagar al entregar'}
                                </button>
                                <button
                                  className="btn btn-ghost"
                                  style={{ padding: '8px 12px', fontSize: 12 }}
                                  onClick={() => setConfirmingOfertaId(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '10px', fontSize: 13 }}
                            onClick={() => setConfirmingOfertaId(oferta.id)}
                          >
                            Aceptar esta oferta
                          </button>
                        )}
                      </div>
                    )}

                    {oferta.estado !== 'pendiente' && (
                      <div style={{ marginTop: 10 }}>
                        <span className={`pill ${oferta.estado === 'aceptada' ? 'pill-green' : 'pill-navy'}`}>
                          ✦ {oferta.estado === 'aceptada' ? 'Oferta Aceptada' : oferta.estado === 'rechazada' ? 'Rechazada' : 'Retirada'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Checkout con Tarjeta */}
        {payingOferta && (
          <PaymentModal
            isOpen={Boolean(payingOferta)}
            monto={payingOferta.precio}
            descripcionCarga={`${carga.origen_texto} → ${carga.destino_texto}`}
            viajeId={viajeId || 'temp'}
            onClose={() => setPayingOferta(null)}
            onSuccess={handlePagoTarjetaExitoso}
          />
        )}

        {/* Modal de Guía de Despacho Electrónica (SII) */}
        {showGuiaModal && (
          <GuiaDespachoModal
            isOpen={showGuiaModal}
            cargaId={carga.id}
            viajeId={viajeId || undefined}
            esEmisor={true}
            onClose={() => setShowGuiaModal(false)}
            onGuiaActualizada={(nuevaGuia) => setGuiaData(nuevaGuia)}
          />
        )}
      </div>
    </WebPlatformLayout>
  )
}
