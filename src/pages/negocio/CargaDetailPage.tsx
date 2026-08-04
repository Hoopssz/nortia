import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, StarFill } from '../../components/Icon'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import type { Tables } from '../../lib/database.types'
import { regionNames } from '../../lib/chileRegions'

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
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

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
      return
    }
    setReloadKey((k) => k + 1)
    setAccepting(null)
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
    <div className="px" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="row" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate(basePath)}>
        <Icon name="arrowL" size={18} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Mis cargas</span>
      </div>

      <span className="pill pill-navy" style={{ marginBottom: 10 }}>
        {ESTADO_LABEL[carga.estado]}
      </span>
      <div className="h2">
        {carga.origen_texto} → {carga.destino_texto}
      </div>
      <div className="sub">
        {carga.tipo_carga || 'Carga'} · {carga.peso_kg} kg
        {carga.origen_region ? ` · ${regionNames[carga.origen_region]}` : ''}
      </div>

      {carga.descripcion && (
        <div className="card flat" style={{ background: 'var(--paper)', marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--ink)', margin: 0 }}>{carga.descripcion}</p>
        </div>
      )}

      {viajeId && (
        <div
          className="card between"
          style={{ marginBottom: 12, cursor: 'pointer', background: 'var(--navy-tint)', border: 'none' }}
          onClick={() => navigate(`/viajes/${viajeId}`)}
        >
          <div className="row">
            <span style={{ color: 'var(--navy)' }}>
              <Icon name="truck" size={18} strokeWidth={1.7} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Ver viaje</span>
          </div>
          <Icon name="chevR" size={18} strokeWidth={2} />
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

      <div className="eyebrow" style={{ marginTop: 8 }}>
        Ofertas recibidas
      </div>

      {ofertas.length === 0 && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>
            Todavía no tienes ofertas para esta carga.
          </p>
        </div>
      )}

      {ofertas.map((oferta) => (
        <div key={oferta.id} className="card" style={{ marginBottom: 10 }}>
          <div className="row" style={{ gap: 12, cursor: 'pointer' }} onClick={() => navigate(`/perfil/${oferta.camionero_id}`)}>
            <div className="ic-chip ic-navy" style={{ fontWeight: 700 }}>
              {oferta.perfiles?.nombre?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 5 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{oferta.perfiles?.nombre ?? 'Camionero'}</span>
                {oferta.perfiles?.verificado && (
                  <span className="verified" style={{ transform: 'scale(0.8)' }}>
                    <Icon name="check" size={11} strokeWidth={3} />
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>
                {oferta.camiones ? `${oferta.camiones.tipo} · ${oferta.camiones.patente}` : ''}
              </div>
              {oferta.perfiles?.rating_prom != null && (
                <div className="row" style={{ gap: 4, marginTop: 4 }}>
                  <span className="stars">
                    <StarFill size={12} />
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700 }}>{oferta.perfiles.rating_prom}</span>
                  <span className="meta">· {oferta.perfiles.total_resenas} reseñas</span>
                </div>
              )}
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>
              ${oferta.precio.toLocaleString('es-CL')}
            </div>
          </div>
          {oferta.mensaje && (
            <p style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 10, marginBottom: 0 }}>{oferta.mensaje}</p>
          )}
          {oferta.estado === 'pendiente' && carga.estado === 'publicada' && (
            <button
              className="btn btn-primary"
              style={{ marginTop: 12 }}
              disabled={accepting === oferta.id}
              onClick={() => handleAceptar(oferta.id)}
            >
              {accepting === oferta.id ? 'Aceptando…' : 'Aceptar oferta'}
            </button>
          )}
          {oferta.estado !== 'pendiente' && (
            <span className={`pill ${oferta.estado === 'aceptada' ? 'pill-green' : 'pill-navy'}`} style={{ marginTop: 12 }}>
              {oferta.estado === 'aceptada' ? 'Aceptada' : oferta.estado === 'rechazada' ? 'Rechazada' : 'Retirada'}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
