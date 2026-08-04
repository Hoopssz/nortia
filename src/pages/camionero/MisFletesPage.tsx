import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
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
    <div className="px" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="row" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate('/camionero')}>
        <Icon name="arrowL" size={18} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Inicio</span>
      </div>

      <div className="eyebrow">Tus viajes</div>
      <div className="h2">Mis fletes</div>

      {loading && <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>}

      {!loading && viajes.length === 0 && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Todavía no tienes fletes asignados.</p>
        </div>
      )}

      {viajes.map((viaje) => {
        const estado = ESTADO_LABEL[viaje.estado]
        return (
          <div key={viaje.id} className="card row" style={{ gap: 12, cursor: 'pointer' }} onClick={() => navigate(`/viajes/${viaje.id}`)}>
            <div className="ic-chip">
              <Icon name="truck" size={20} strokeWidth={1.7} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                {viaje.cargas?.origen_texto} → {viaje.cargas?.destino_texto}
              </div>
              <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                ${(viaje.precio_final - (viaje.comision_monto ?? 0)).toLocaleString('es-CL')}
              </div>
            </div>
            <span className={`pill ${estado.cls}`}>{estado.label}</span>
          </div>
        )
      })}
    </div>
  )
}
