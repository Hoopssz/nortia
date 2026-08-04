import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { getErrorMessage } from '../../lib/errors'
import type { Tables } from '../../lib/database.types'

type Camion = Tables<'camiones'>
type Carga = Tables<'cargas'>
type Ganancias = {
  ganancia_semana: number
  ganancia_mes: number
  viajes_semana: number
  viajes_totales: number
}

export function CamioneroHomePage() {
  const navigate = useNavigate()
  const { perfil, signOut } = useAuth()
  const [camion, setCamion] = useState<Camion | null>(null)
  const [ganancias, setGanancias] = useState<Ganancias | null>(null)
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingDisponible, setTogglingDisponible] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data: camionData } = await supabase
          .from('camiones')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const { data: ganData } = await supabase.rpc('mis_ganancias')

        let cargasData: Carga[] = []
        if (camionData) {
          const { data } = await supabase.rpc('cargas_compatibles', { p_camion_id: camionData.id })
          cargasData = (data as Carga[]) ?? []
        }

        if (!active) return
        setCamion(camionData ?? null)
        setGanancias((ganData?.[0] as Ganancias) ?? null)
        setCargas(cargasData.slice(0, 5))
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  async function toggleDisponible() {
    if (!camion) return
    setTogglingDisponible(true)
    const { error: toggleError } = await supabase
      .from('camiones')
      .update({ disponible: !camion.disponible })
      .eq('id', camion.id)
    if (!toggleError) {
      setCamion({ ...camion, disponible: !camion.disponible })
    } else {
      setError(getErrorMessage(toggleError))
    }
    setTogglingDisponible(false)
  }

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="between">
        <div>
          <div className="meta">
            {perfil?.nombre}
            {camion ? ` · ${camion.tipo}` : ''}
          </div>
          <div className="h2" style={{ marginTop: 3 }}>
            Cargas cerca
          </div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--navy-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--navy)',
            cursor: 'pointer',
          }}
          onClick={async () => {
            await signOut()
            navigate('/')
          }}
        >
          <Icon name="logout" size={19} strokeWidth={1.8} />
        </div>
      </div>

      {camion && (
        <div className="card between" style={{ marginTop: 14 }}>
          <div className="row">
            <span style={{ color: 'var(--navy)' }}>
              <Icon name="truck" size={18} strokeWidth={1.7} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{camion.disponible ? 'Disponible' : 'No disponible'}</span>
          </div>
          <div className={`toggle ${camion.disponible ? 'on' : ''}`} onClick={toggleDisponible} style={togglingDisponible ? { opacity: 0.6 } : undefined}>
            <div className="knob" />
          </div>
        </div>
      )}

      <div
        className="navy-panel"
        style={{ borderRadius: 20, marginTop: 14, cursor: 'pointer', boxShadow: 'var(--shadow-lift)' }}
        onClick={() => navigate('/camionero/buscar')}
      >
        <div style={{ position: 'relative', padding: '18px 20px' }} className="between">
          <div>
            <div className="eyebrow on-navy" style={{ marginBottom: 6, color: 'rgba(255,255,255,0.65)' }}>
              Ganancias esta semana
            </div>
            <div style={{ fontWeight: 800, fontSize: 26, color: '#fff', lineHeight: 1.1 }}>
              ${(ganancias?.ganancia_semana ?? 0).toLocaleString('es-CL')}
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {ganancias?.viajes_semana ?? 0} fletes esta semana
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#fff',
              color: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="arrowR" size={22} strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginTop: 14 }}>
        <div className="card flat" style={{ flex: 1, textAlign: 'center', padding: '14px 4px', border: '1.5px solid var(--line)' }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>${(ganancias?.ganancia_mes ?? 0).toLocaleString('es-CL')}</div>
          <div style={{ fontSize: 10.5, color: 'var(--slate)', marginTop: 2 }}>Este mes</div>
        </div>
        <div
          className="card flat"
          style={{ flex: 1, textAlign: 'center', padding: '14px 4px', border: '1.5px solid var(--line)', cursor: 'pointer' }}
          onClick={() => navigate('/camionero/fletes')}
        >
          <div style={{ fontWeight: 800, fontSize: 15 }}>{ganancias?.viajes_totales ?? 0}</div>
          <div style={{ fontSize: 10.5, color: 'var(--slate)', marginTop: 2 }}>Mis fletes</div>
        </div>
      </div>

      <div className="between" style={{ margin: '18px 0 6px' }}>
        <div className="eyebrow" style={{ margin: 0 }}>
          Cargas disponibles
        </div>
        {cargas.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/camionero/buscar')}>
            Ver todas
          </span>
        )}
      </div>

      {loading && <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>}

      {!loading && error && (
        <div className="card flat" style={{ background: 'var(--danger-soft)', textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--danger)', margin: '0 0 10px' }}>No pudimos cargar tu información: {error}</p>
          <span className="pill pill-navy" style={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>
            Reintentar
          </span>
        </div>
      )}

      {!loading && !error && !camion && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Registra tu camión para ver cargas compatibles.</p>
        </div>
      )}

      {!loading && !error && camion && cargas.length === 0 && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Por ahora no hay cargas que calcen con tu camión.</p>
        </div>
      )}

      {cargas.map((carga) => (
        <div
          key={carga.id}
          className="card row"
          style={{ gap: 12, cursor: 'pointer' }}
          onClick={() => navigate(`/camionero/cargas/${carga.id}`)}
        >
          <div className="ic-chip">
            <Icon name="package" size={20} strokeWidth={1.7} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {carga.origen_texto} → {carga.destino_texto}
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate)' }}>
              {carga.tipo_carga || 'Carga'} · {carga.peso_kg} kg
            </div>
          </div>
          {carga.precio_referencia && (
            <span className="pill pill-navy">${carga.precio_referencia.toLocaleString('es-CL')}</span>
          )}
        </div>
      ))}
    </div>
  )
}
