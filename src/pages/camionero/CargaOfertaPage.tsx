import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import { regionNames } from '../../lib/chileRegions'
import { calcularDistanciaKm, estimarTiempoViaje } from '../../lib/chileLocations'
import { evaluarCompatibilidad, type Camion } from '../../lib/matchEngine'
import { CalculadoraRutaCard } from '../../components/CalculadoraRutaCard'
import type { Tables } from '../../lib/database.types'

type Carga = Tables<'cargas'>
type Oferta = Tables<'ofertas'>

const REQUISITOS: { key: keyof Carga; label: string; icon: 'snow' | 'ruler' | 'boxes' | 'user' }[] = [
  { key: 'requiere_frio', label: 'Requiere frío', icon: 'snow' },
  { key: 'requiere_rampa', label: 'Requiere rampa', icon: 'ruler' },
  { key: 'requiere_grua', label: 'Requiere grúa', icon: 'boxes' },
  { key: 'requiere_ayuda', label: 'Necesita ayuda', icon: 'user' },
]

export function CargaOfertaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [carga, setCarga] = useState<Carga | null>(null)
  const [miOferta, setMiOferta] = useState<Oferta | null>(null)
  const [camion, setCamion] = useState<Camion | null>(null)
  const [loading, setLoading] = useState(true)

  const [precio, setPrecio] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [confirmingRetiro, setConfirmingRetiro] = useState(false)
  const [retirando, setRetirando] = useState(false)

  useEffect(() => {
    if (!id || !session?.user.id) return
    let active = true
    async function load() {
      const [{ data: cargaData }, { data: camionData }] = await Promise.all([
        supabase.from('cargas').select('*').eq('id', id!).single(),
        supabase
          .from('camiones')
          .select('*')
          .eq('perfil_id', session!.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      let ofertaData: Oferta | null = null
      if (cargaData) {
        const { data } = await supabase
          .from('ofertas')
          .select('*')
          .eq('carga_id', id!)
          .eq('camionero_id', session!.user.id)
          .maybeSingle()
        ofertaData = data
      }

      if (!active) return
      setCarga(cargaData ?? null)
      setCamion((camionData as Camion) ?? null)
      setMiOferta(ofertaData)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [id, session, reloadKey])

  async function handleSubmit() {
    if (!id || !session?.user.id) return
    setSaving(true)
    setError(null)

    const { error } = miOferta
      ? await supabase
          .from('ofertas')
          .update({
            camion_id: camion?.id ?? null,
            precio: Number(precio),
            mensaje: mensaje || null,
            estado: 'pendiente',
          })
          .eq('id', miOferta.id)
      : await supabase.from('ofertas').insert({
          carga_id: id,
          camionero_id: session.user.id,
          camion_id: camion?.id ?? null,
          precio: Number(precio),
          mensaje: mensaje || null,
        })

    if (error) {
      setSaving(false)
      setError(error.message)
      return
    }

    setReloadKey((k) => k + 1)
    setSaving(false)
  }

  async function handleRetirar() {
    if (!miOferta) return
    setRetirando(true)
    setError(null)
    const { error } = await supabase.rpc('retirar_oferta', { p_oferta_id: miOferta.id })
    if (error) {
      setError(error.message)
      setRetirando(false)
      return
    }
    setReloadKey((k) => k + 1)
    setRetirando(false)
    setConfirmingRetiro(false)
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

  const match = evaluarCompatibilidad(carga, camion)
  const requisitos = REQUISITOS.filter((r) => carga[r.key])
  const distancia =
    carga.distancia_km ||
    (carga.origen_lat && carga.origen_lng && carga.destino_lat && carga.destino_lng
      ? calcularDistanciaKm(carga.origen_lat, carga.origen_lng, carga.destino_lat, carga.destino_lng)
      : 120)

  return (
    <WebPlatformLayout activeTab="Buscar Cargas">
      <div className="web-platform-container">
        {/* Header con migas y botón volver */}
        <div className="between" style={{ marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Oportunidad de Carga · {carga.tipo_carga || 'Flete Comercial'}</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              {carga.origen_texto} → {carga.destino_texto}
            </div>
          </div>

          <button
            type="button"
            className="chip"
            style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
            onClick={() => navigate('/camionero/buscar')}
          >
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Volver a Buscar Cargas</span>
          </button>
        </div>

        <div className="two-col-grid" style={{ alignItems: 'start' }}>
          {/* Columna 1: Especificaciones de Carga y Ruta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Ficha Principal de la Carga */}
            <div className="card" style={{ padding: '20px' }}>
              <div className="between" style={{ marginBottom: 14, alignItems: 'center' }}>
                <span className="pill pill-navy" style={{ fontWeight: 700 }}>
                  {carga.tipo_carga || 'Carga General'}
                </span>
                {carga.precio_referencia && (
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>
                    ${carga.precio_referencia.toLocaleString('es-CL')} CLP ref.
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
                  <span style={{ color: 'var(--slate)' }}>Peso Total</span>
                  <span style={{ fontWeight: 700 }}>{carga.peso_kg.toLocaleString('es-CL')} kg</span>
                </div>
                {carga.volumen_m3 && (
                  <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--slate)' }}>Volumen Estimado</span>
                    <span style={{ fontWeight: 700 }}>{carga.volumen_m3} m³</span>
                  </div>
                )}
                {carga.pallets && (
                  <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--slate)' }}>Pallets Requeridos</span>
                    <span style={{ fontWeight: 700 }}>{carga.pallets} pallets</span>
                  </div>
                )}
                <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                  <span style={{ color: 'var(--slate)' }}>Distancia en Carretera</span>
                  <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="pin" size={13} strokeWidth={2} />
                    <span>{distancia} km ({estimarTiempoViaje(distancia).texto})</span>
                  </span>
                </div>
                {carga.origen_region && (
                  <div className="between">
                    <span style={{ color: 'var(--slate)' }}>Región de Origen</span>
                    <span style={{ fontWeight: 600 }}>{regionNames[carga.origen_region]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Requisitos de Equipamiento */}
            {requisitos.length > 0 && (
              <div className="card" style={{ padding: '16px 20px' }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Requisitos Especiales</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {requisitos.map((r) => (
                    <span key={r.key} className="chip on">
                      <Icon name={r.icon} size={15} strokeWidth={1.7} /> {r.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tarjeta de Compatibilidad de Equipamiento y Capacidad */}
            {camion && (
              <div
                className="card flat"
                style={{
                  background: match.esCompatible ? 'rgba(16, 185, 129, 0.08)' : 'var(--navy-tint)',
                  border: `1.5px solid ${match.esCompatible ? '#10B981' : 'rgba(30, 58, 138, 0.2)'}`,
                  padding: '16px 18px',
                  borderRadius: 16,
                }}
              >
                <div className="between" style={{ marginBottom: 8, alignItems: 'center' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ color: match.esCompatible ? '#059669' : 'var(--navy)', display: 'flex', alignItems: 'center' }}>
                      <Icon name={match.esCompatible ? 'shield' : 'help'} size={18} strokeWidth={2} />
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                      {match.esCompatible ? 'Camión 100% Compatible' : `Compatibilidad: ${match.porcentajeMatch}%`}
                    </span>
                  </div>
                  <span
                    className={`pill ${match.esCompatible ? 'pill-green' : 'pill-navy'}`}
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    {camion.tipo.replace('_', ' ')} ({camion.patente})
                  </span>
                </div>

                <div style={{ fontSize: 12.5, color: match.esCompatible ? '#15803D' : 'var(--ink)' }}>
                  {match.compatibilidades.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ color: '#059669', fontWeight: 800 }}>✓</span> <span>{c}</span>
                    </div>
                  ))}
                  {match.incompatibilidades.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontWeight: 700, color: '#DC2626' }}>
                      <span>✕</span> <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculadora de Petróleo y Peajes */}
            <CalculadoraRutaCard
              distanciaKm={distancia}
              tarifaFleteClp={Number(precio) || carga.precio_referencia || 0}
              tipoVehiculo={camion?.tipo || carga.tipo_vehiculo_sugerido || 'camion'}
            />
          </div>

          {/* Columna 2: Tu Oferta & Respaldo Escrow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: '20px' }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Tu Oferta de Transporte</div>

              {miOferta && miOferta.estado === 'retirada' && (
                <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: -4, marginBottom: 10 }}>
                  Retiraste tu oferta anterior. Puedes enviar una nueva propuesta.
                </p>
              )}

              {miOferta && miOferta.estado !== 'retirada' ? (
                <div>
                  <div className="between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate)' }}>
                      Tu oferta registrada
                    </span>
                    <span
                      className={`pill ${
                        miOferta.estado === 'aceptada' ? 'pill-green' : miOferta.estado === 'pendiente' ? 'pill-navy' : 'pill-navy'
                      }`}
                    >
                      {miOferta.estado === 'pendiente'
                        ? 'Esperando respuesta'
                        : miOferta.estado === 'aceptada'
                          ? 'Aceptada'
                          : miOferta.estado === 'rechazada'
                            ? 'Rechazada'
                            : 'Retirada'}
                    </span>
                  </div>

                  <div
                    className="card flat"
                    style={{
                      background: 'var(--navy-tint)',
                      border: '1.5px solid var(--navy-tint-2)',
                      padding: '12px 14px',
                      borderRadius: 14,
                      marginTop: 6,
                    }}
                  >
                    <div className="between" style={{ fontSize: 12.5, marginBottom: 4 }}>
                      <span style={{ color: 'var(--slate)' }}>Total flete (cliente paga)</span>
                      <span style={{ fontWeight: 600 }}>${miOferta.precio.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="between" style={{ fontSize: 12.5, marginBottom: 6, color: 'var(--slate)' }}>
                      <span>Comisión de servicio NORTIA (12%)</span>
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                        -${Math.round(miOferta.precio * 0.12).toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div
                      className="between"
                      style={{
                        paddingTop: 8,
                        borderTop: '1px solid var(--navy-tint-2)',
                        fontSize: 13.5,
                      }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Líquido a recibir</span>
                      <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>
                        ${Math.round(miOferta.precio * 0.88).toLocaleString('es-CL')} CLP
                      </span>
                    </div>
                  </div>

                  {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 12, marginBottom: 0 }}>{error}</p>}

                  {miOferta.estado === 'pendiente' && (
                    <div style={{ marginTop: 14 }}>
                      {confirmingRetiro ? (
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 13, color: 'var(--ink)', margin: '0 0 10px' }}>¿Retirar tu oferta?</p>
                          <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
                            <button className="btn btn-primary" disabled={retirando} onClick={handleRetirar}>
                              {retirando ? 'Retirando…' : 'Sí, retirar'}
                            </button>
                            <span
                              style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)', cursor: 'pointer', padding: '0 10px' }}
                              onClick={() => setConfirmingRetiro(false)}
                            >
                              No
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span
                          style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--danger)', cursor: 'pointer' }}
                          onClick={() => setConfirmingRetiro(true)}
                        >
                          Retirar oferta
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="field">
                    <label>Tu precio total de flete</label>
                    <input
                      type="number"
                      min={1}
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder={carga.precio_referencia ? `$${carga.precio_referencia.toLocaleString('es-CL')}` : '$50.000'}
                    />

                    {Number(precio) > 0 && (
                      <div
                        className="card flat"
                        style={{
                          background: 'var(--navy-tint)',
                          border: '1.5px solid var(--navy-tint-2)',
                          marginTop: 10,
                          padding: '12px 14px',
                          borderRadius: 14,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate)', marginBottom: 8 }}>
                          Desglose de Pago Transparente
                        </div>
                        <div className="between" style={{ fontSize: 12.5, marginBottom: 4 }}>
                          <span style={{ color: 'var(--slate)' }}>Monto total del flete</span>
                          <span style={{ fontWeight: 600 }}>${Number(precio).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="between" style={{ fontSize: 12.5, marginBottom: 6, color: 'var(--slate)' }}>
                          <span>Comisión de servicio NORTIA (12%)</span>
                          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                            -${Math.round(Number(precio) * 0.12).toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div
                          className="between"
                          style={{
                            paddingTop: 8,
                            borderTop: '1px solid var(--navy-tint-2)',
                            fontSize: 13.5,
                          }}
                        >
                          <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Líquido a recibir en tu cuenta</span>
                          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>
                            ${Math.round(Number(precio) * 0.88).toLocaleString('es-CL')} CLP
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="field">
                    <label>Mensaje para el cliente (opcional)</label>
                    <textarea rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Puedo retirar hoy en la tarde…" />
                  </div>
                  {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}
                  <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={!precio || Number(precio) <= 0 || saving} onClick={handleSubmit}>
                    {saving ? 'Enviando…' : 'Enviar oferta'} {!saving && <Icon name="arrowR" size={18} strokeWidth={2} />}
                  </button>
                </>
              )}
            </div>

            {/* Garantía Escrow NORTIA */}
            <div
              className="card"
              style={{
                background: 'var(--navy-tint)',
                borderColor: 'rgba(30, 58, 138, 0.15)',
                padding: '18px 20px',
              }}
            >
              <div className="row" style={{ gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ color: 'var(--navy)', marginTop: 2 }}>
                  <Icon name="shield" size={20} strokeWidth={2} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>
                  Garantía NORTIA Escrow
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--navy-700)', lineHeight: 1.55 }}>
                Al ser aceptada tu oferta, el monto total queda resguardado en la cuenta de garantía NORTIA antes de que muevas tu camión. Al entregar la carga y subir el comprobante firmado, tu pago se libera inmediatamente a tu cuenta bancaria registrada.
              </div>
            </div>
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  )
}
