import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import type { Tables } from '../../lib/database.types'

type Viaje = Tables<'viajes'> & { cargas: Pick<Tables<'cargas'>, 'origen_texto' | 'destino_texto'> | null }

const ESTADO_LABEL: Record<Tables<'viajes'>['estado'], { label: string; cls: string }> = {
  asignado: { label: 'Asignado', cls: 'pill-navy' },
  en_ruta: { label: 'En ruta', cls: 'pill-navy' },
  entregado: { label: 'Entregado', cls: 'pill-green' },
  cancelado: { label: 'Cancelado', cls: 'pill-navy' },
}

export function MisFletesPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user.id) return
    let active = true
    async function load() {
      const { data } = await supabase
        .from('viajes')
        .select('*, cargas:carga_id(origen_texto, destino_texto)')
        .eq('camionero_id', session!.user.id)
        .order('created_at', { ascending: false })
      if (!active) return
      setViajes((data as Viaje[]) ?? [])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [session])

  return (
    <WebPlatformLayout activeTab="Mis Fletes">
      <div className="web-platform-container">
        <div className="between" style={{ marginBottom: 18, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Control de Despachos & Historial</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              Mis Fletes y Viajes
            </div>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <button
              type="button"
              className="chip"
              style={{ background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)', cursor: 'pointer' }}
              onClick={() => navigate('/camionero')}
            >
              <Icon name="arrowL" size={15} strokeWidth={2} />
              <span>Panel Operativo</span>
            </button>
            <button
              type="button"
              className="chip"
              style={{ background: 'var(--navy)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
              onClick={() => navigate('/camionero/ganancias')}
            >
              <Icon name="dollar" size={15} strokeWidth={2} />
              <span>Ver Ganancias</span>
            </button>
          </div>
        </div>

        {loading && <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando tus fletes…</p>}

        {!loading && viajes.length === 0 && (
          <div className="card flat" style={{ background: 'var(--card-glass-bg)', border: '1px dashed var(--line)', textAlign: 'center', padding: 48, borderRadius: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🚛</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)', marginBottom: 6 }}>
              Todavía no tienes fletes asignados
            </div>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 16px' }}>
              Explora las cargas publicadas en tu zona para postular y comenzar a transportar.
            </p>
            <button className="btn btn-primary" style={{ padding: '10px 20px' }} onClick={() => navigate('/camionero/buscar')}>
              Buscar Cargas Disponibles
            </button>
          </div>
        )}

        <div className="cards-auto-grid">
          {viajes.map((viaje) => {
            const estado = ESTADO_LABEL[viaje.estado]
            return (
              <div
                key={viaje.id}
                className="card"
                style={{
                  margin: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 18px',
                }}
                onClick={() => navigate(`/viajes/${viaje.id}`)}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: 'var(--navy-tint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--navy)',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="truck" size={22} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--navy)' }}>
                    {viaje.cargas?.origen_texto} → {viaje.cargas?.destino_texto}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                    Pago neto: <b>${(viaje.precio_final - (viaje.comision_monto ?? 0)).toLocaleString('es-CL')} CLP</b>
                  </div>
                </div>
                <span className={`pill ${estado.cls}`} style={{ fontSize: 11, fontWeight: 700 }}>
                  {estado.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </WebPlatformLayout>
  )
}
