import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import type { Tables } from '../../lib/database.types'

type Carga = Tables<'cargas'>

export function BuscarCargaPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)
  const [sinCamion, setSinCamion] = useState(false)

  useEffect(() => {
    if (!session?.user.id) return
    let active = true
    async function load() {
      const { data: camionData } = await supabase
        .from('camiones')
        .select('id')
        .eq('perfil_id', session!.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!camionData) {
        if (active) {
          setSinCamion(true)
          setLoading(false)
        }
        return
      }

      const { data } = await supabase.rpc('cargas_compatibles', { p_camion_id: camionData.id })
      if (!active) return
      setCargas((data as Carga[]) ?? [])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [session])

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="row" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate('/camionero')}>
        <Icon name="arrowL" size={18} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Inicio</span>
      </div>

      <div className="eyebrow">Cargas compatibles</div>
      <div className="h2">Buscar carga</div>
      <div className="sub">Solo te mostramos cargas que tu camión puede llevar.</div>

      {loading && <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>}

      {!loading && sinCamion && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Registra tu camión para ver cargas compatibles.</p>
        </div>
      )}

      {!loading && !sinCamion && cargas.length === 0 && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Por ahora no hay cargas que calcen con tu camión.</p>
        </div>
      )}

      {cargas.map((carga) => (
        <div
          key={carga.id}
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/camionero/cargas/${carga.id}`)}
        >
          <div className="row" style={{ gap: 12 }}>
            <div className="ic-chip">
              <Icon name="package" size={20} strokeWidth={1.7} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                {carga.origen_texto} → {carga.destino_texto}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>
                {carga.tipo_carga || 'Carga'} · {carga.peso_kg} kg
                {carga.volumen_m3 ? ` · ${carga.volumen_m3} m³` : ''}
              </div>
            </div>
            {carga.precio_referencia && (
              <span className="pill pill-navy">${carga.precio_referencia.toLocaleString('es-CL')}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
