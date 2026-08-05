import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import { regionNames } from '../../lib/chileRegions'
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
  const [camionId, setCamionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [precio, setPrecio] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id || !session?.user.id) return
    let active = true
    async function load() {
      const [{ data: cargaData }, { data: camionData }] = await Promise.all([
        supabase.from('cargas').select('*').eq('id', id!).single(),
        supabase.from('camiones').select('id').order('created_at', { ascending: false }).limit(1).maybeSingle(),
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
      setCamionId(camionData?.id ?? null)
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

    const { error } = await supabase.from('ofertas').insert({
      carga_id: id,
      camionero_id: session.user.id,
      camion_id: camionId,
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

  const requisitos = REQUISITOS.filter((r) => carga[r.key])

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="row" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate('/camionero/buscar')}>
        <Icon name="arrowL" size={18} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Buscar carga</span>
      </div>

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

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="between" style={{ padding: '6px 0' }}>
          <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>Peso</span>
          <span style={{ fontSize: 12.5, fontWeight: 700 }}>{carga.peso_kg} kg</span>
        </div>
        {carga.volumen_m3 && (
          <div className="between" style={{ padding: '6px 0' }}>
            <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>Volumen</span>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{carga.volumen_m3} m³</span>
          </div>
        )}
        {carga.pallets && (
          <div className="between" style={{ padding: '6px 0' }}>
            <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>Pallets</span>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{carga.pallets}</span>
          </div>
        )}
        {carga.precio_referencia && (
          <div className="between" style={{ padding: '6px 0' }}>
            <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>Precio de referencia</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)' }}>
              ${carga.precio_referencia.toLocaleString('es-CL')}
            </span>
          </div>
        )}
      </div>

      {requisitos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {requisitos.map((r) => (
            <span key={r.key} className="chip on">
              <Icon name={r.icon} size={15} strokeWidth={1.7} /> {r.label}
            </span>
          ))}
        </div>
      )}

      <div className="eyebrow">Tu oferta</div>

      {miOferta ? (
        <div className="card">
          <div className="between">
            <span style={{ fontSize: 13, color: 'var(--slate)' }}>Ofertaste</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>
              ${miOferta.precio.toLocaleString('es-CL')}
            </span>
          </div>
          <span
            className={`pill ${
              miOferta.estado === 'aceptada' ? 'pill-green' : miOferta.estado === 'pendiente' ? 'pill-navy' : 'pill-navy'
            }`}
            style={{ marginTop: 10 }}
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
      ) : (
        <>
          <div className="field">
            <label>Tu precio</label>
            <input type="number" min={1} value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="$50.000" />
            {Number(precio) > 0 && (
              <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 5 }}>
                NORTIA cobra 12% de comisión · recibirías aprox.{' '}
                <b style={{ color: 'var(--navy)' }}>${Math.round(Number(precio) * 0.88).toLocaleString('es-CL')}</b>
              </div>
            )}
          </div>
          <div className="field">
            <label>Mensaje (opcional)</label>
            <textarea rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Puedo retirar hoy en la tarde…" />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary" disabled={!precio || Number(precio) <= 0 || saving} onClick={handleSubmit}>
            {saving ? 'Enviando…' : 'Enviar oferta'} {!saving && <Icon name="arrowR" size={18} strokeWidth={2} />}
          </button>
        </>
      )}
    </div>
  )
}
