import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, StarFill } from '../components/Icon'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/useAuth'
import type { Tables } from '../lib/database.types'

type Viaje = Tables<'viajes'>
type Carga = Tables<'cargas'>
type Perfil = Tables<'perfiles'>
type Resena = Tables<'resenas'>

const ESTADO_LABEL: Record<Viaje['estado'], string> = {
  asignado: 'Asignado',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export function ViajeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [viaje, setViaje] = useState<Viaje | null>(null)
  const [carga, setCarga] = useState<Carga | null>(null)
  const [otraParte, setOtraParte] = useState<Perfil | null>(null)
  const [miResena, setMiResena] = useState<Resena | null>(null)
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const [marcando, setMarcando] = useState(false)
  const [puntuacion, setPuntuacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    if (!id || !session?.user.id) return
    let active = true
    async function load() {
      const { data: viajeData } = await supabase.from('viajes').select('*').eq('id', id!).single()
      if (!viajeData) {
        if (active) setLoading(false)
        return
      }

      const soyCliente = viajeData.cliente_id === session!.user.id
      const otraParteId = soyCliente ? viajeData.camionero_id : viajeData.cliente_id

      const [{ data: cargaData }, { data: otraParteData }, { data: resenaData }] = await Promise.all([
        supabase.from('cargas').select('*').eq('id', viajeData.carga_id).single(),
        supabase.from('perfiles').select('*').eq('id', otraParteId).single(),
        supabase.from('resenas').select('*').eq('viaje_id', id!).eq('autor_id', session!.user.id).maybeSingle(),
      ])

      if (!active) return
      setViaje(viajeData)
      setCarga(cargaData ?? null)
      setOtraParte(otraParteData ?? null)
      setMiResena(resenaData ?? null)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [id, session, reloadKey])

  async function handleMarcarEntregado() {
    if (!viaje) return
    setMarcando(true)
    setError(null)
    const { error } = await supabase.rpc('marcar_entregado', { p_viaje_id: viaje.id })
    if (error) {
      setError(error.message)
      setMarcando(false)
      return
    }
    setReloadKey((k) => k + 1)
    setMarcando(false)
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
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>
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
  const monto = soyCamionero ? viaje.precio_final - (viaje.comision_monto ?? 0) : viaje.precio_final

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="row" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <Icon name="arrowL" size={18} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Volver</span>
      </div>

      <span className={`pill ${viaje.estado === 'entregado' ? 'pill-green' : 'pill-navy'}`} style={{ marginBottom: 10 }}>
        {ESTADO_LABEL[viaje.estado]}
      </span>
      <div className="h2">
        {carga.origen_texto} → {carga.destino_texto}
      </div>
      <div className="sub">
        {soyCamionero ? 'Recibirás' : 'Pagas'} <b style={{ color: 'var(--navy)' }}>${monto.toLocaleString('es-CL')}</b>
      </div>

      {otraParte && (
        <div className="card row" style={{ gap: 12, cursor: 'pointer', marginBottom: 16 }} onClick={() => navigate(`/perfil/${otraParte.id}`)}>
          <div className="ic-chip ic-navy" style={{ fontWeight: 700 }}>
            {(otraParte.nombre || otraParte.razon_social || '??').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row" style={{ gap: 5 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{otraParte.nombre || otraParte.razon_social}</span>
              {otraParte.verificado && (
                <span className="verified" style={{ transform: 'scale(0.8)' }}>
                  <Icon name="check" size={11} strokeWidth={3} />
                </span>
              )}
            </div>
            {otraParte.rating_prom != null && (
              <div className="row" style={{ gap: 4, marginTop: 2 }}>
                <span className="stars">
                  <StarFill size={12} />
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 700 }}>{otraParte.rating_prom}</span>
              </div>
            )}
          </div>
          <Icon name="chevR" size={18} strokeWidth={2} />
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

      {viaje.estado !== 'entregado' && viaje.estado !== 'cancelado' && (
        <>
          {soyCamionero ? (
            <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>
                Esperando que el cliente confirme la entrega.
              </p>
            </div>
          ) : (
            <button className="btn btn-primary" disabled={marcando} onClick={handleMarcarEntregado}>
              {marcando ? 'Guardando…' : 'Marcar como entregado'} {!marcando && <Icon name="check" size={18} strokeWidth={2} />}
            </button>
          )}

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            {confirmingCancel ? (
              <div className="card flat" style={{ background: 'var(--danger-soft)', padding: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--ink)', margin: '0 0 10px' }}>¿Cancelar este viaje?</p>
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
                style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--danger)', cursor: 'pointer' }}
                onClick={() => setConfirmingCancel(true)}
              >
                Cancelar viaje
              </span>
            )}
          </div>
        </>
      )}

      {viaje.estado === 'entregado' && (
        <>
          <div className="eyebrow" style={{ marginTop: 8 }}>
            Reseña
          </div>
          {miResena ? (
            <div className="card flat" style={{ background: 'var(--paper)' }}>
              <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Ya calificaste este viaje. ¡Gracias!</p>
            </div>
          ) : (
            <div className="card">
              <div className="field">
                <label>¿Cómo calificarías esta experiencia?</label>
                <div className="row" style={{ gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      onClick={() => setPuntuacion(n)}
                      style={{ cursor: 'pointer', color: n <= puntuacion ? 'var(--navy)' : 'var(--line)' }}
                    >
                      <StarFill size={26} />
                    </span>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Comentario (opcional)</label>
                <textarea rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Cuéntanos cómo fue" />
              </div>
              <button className="btn btn-primary" disabled={enviandoResena} onClick={handleEnviarResena}>
                {enviandoResena ? 'Enviando…' : 'Enviar reseña'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
