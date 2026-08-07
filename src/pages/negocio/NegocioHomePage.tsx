import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { RoleSwitcher } from '../../components/RoleSwitcher'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import type { Tables } from '../../lib/database.types'

type Carga = Tables<'cargas'> & { ofertas: { count: number }[] }

const ESTADO_PILL: Record<Tables<'cargas'>['estado'], { label: string; cls: string }> = {
  borrador: { label: 'Borrador', cls: 'pill-navy' },
  publicada: { label: 'Buscando transportista', cls: 'pill-navy' },
  asignada: { label: 'Asignada', cls: 'pill-green' },
  en_ruta: { label: 'En ruta', cls: 'pill-green' },
  entregada: { label: 'Entregada', cls: 'pill-green' },
  cancelada: { label: 'Cancelada', cls: 'pill-navy' },
}

export function NegocioHomePage() {
  const navigate = useNavigate()
  const { perfil, session, signOut } = useAuth()
  const basePath = perfil?.rol === 'proveedor' ? '/proveedor' : '/negocio'
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user.id) return
    let active = true
    async function load() {
      const { data, error } = await supabase
        .from('cargas')
        .select('*, ofertas(count)')
        .eq('cliente_id', session!.user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (active) {
        if (error) setError(error.message)
        setCargas((data as Carga[]) ?? [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [session])

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="between">
        <div>
          <div className="meta">{perfil?.razon_social || perfil?.nombre}</div>
          <div className="h2" style={{ marginTop: 3 }}>
            ¿Qué mueves hoy?
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <RoleSwitcher />
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
              flexShrink: 0,
            }}
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          >
            <Icon name="logout" size={19} strokeWidth={1.8} />
          </div>
        </div>
      </div>

      <div
        className="navy-panel"
        style={{ borderRadius: 20, marginTop: 14, cursor: 'pointer', boxShadow: 'var(--shadow-lift)' }}
        onClick={() => navigate(`${basePath}/publicar`)}
      >
        <div style={{ position: 'relative', padding: '18px 20px' }} className="between">
          <div>
            <div className="eyebrow on-navy" style={{ marginBottom: 6, color: 'rgba(255,255,255,0.65)' }}>
              Acción rápida
            </div>
            <div style={{ fontWeight: 800, fontSize: 19, color: '#fff', lineHeight: 1.1 }}>Publicar una carga</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              Recibe ofertas de camioneros en minutos
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
            <Icon name="package" size={22} strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="between" style={{ margin: '18px 0 6px' }}>
        <div className="eyebrow" style={{ margin: 0 }}>
          Mis cargas
        </div>
      </div>

      {loading && (
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>
      )}

      {!loading && error && (
        <div className="card flat" style={{ background: 'var(--danger-soft)', textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--danger)', margin: '0 0 10px' }}>No pudimos cargar tus cargas: {error}</p>
          <span className="pill pill-navy" style={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>
            Reintentar
          </span>
        </div>
      )}

      {!loading && !error && cargas.length === 0 && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>
            Todavía no has publicado ninguna carga.
          </p>
        </div>
      )}

      {cargas.map((carga) => {
        const estado = ESTADO_PILL[carga.estado]
        const nOfertas = carga.ofertas?.[0]?.count ?? 0
        return (
          <div
            key={carga.id}
            className="card row"
            style={{ gap: 12, cursor: 'pointer' }}
            onClick={() => navigate(`${basePath}/cargas/${carga.id}`)}
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
            <span className={`pill ${estado.cls}`}>
              {carga.estado === 'publicada' && nOfertas > 0 ? `${nOfertas} ofertas` : estado.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
