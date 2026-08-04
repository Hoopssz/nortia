import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon, StarFill } from '../components/Icon'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'

type Perfil = Tables<'perfiles'>
type Camion = Tables<'camiones'>
type Resena = Tables<'resenas'> & { autor: Pick<Perfil, 'nombre'> | null }

const ROL_TAG: Record<NonNullable<Perfil['rol']>, { icon: 'truck' | 'building' | 'package'; label: string }> = {
  camionero: { icon: 'truck', label: 'PERFIL CAMIONERO' },
  negocio: { icon: 'building', label: 'PERFIL NEGOCIO' },
  proveedor: { icon: 'package', label: 'PERFIL PROVEEDOR' },
}

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [camion, setCamion] = useState<Camion | null>(null)
  const [cargasCount, setCargasCount] = useState(0)
  const [fletesCount, setFletesCount] = useState(0)
  const [resenas, setResenas] = useState<Resena[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let active = true
    async function load() {
      const { data: perfilData } = await supabase.from('perfiles').select('*').eq('id', id!).single()

      let camionData: Camion | null = null
      let cargas = 0
      let fletes = 0

      if (perfilData?.rol === 'camionero') {
        const [{ data: c }, { count }] = await Promise.all([
          supabase.from('camiones').select('*').eq('perfil_id', id!).order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('viajes').select('id', { count: 'exact', head: true }).eq('camionero_id', id!).eq('estado', 'entregado'),
        ])
        camionData = c
        fletes = count ?? 0
      } else if (perfilData) {
        const { count } = await supabase.from('cargas').select('id', { count: 'exact', head: true }).eq('cliente_id', id!)
        cargas = count ?? 0
      }

      const { data: resenasData } = await supabase
        .from('resenas')
        .select('*, autor:autor_id(nombre)')
        .eq('destinatario_id', id!)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!active) return
      setPerfil(perfilData ?? null)
      setCamion(camionData)
      setCargasCount(cargas)
      setFletesCount(fletes)
      setResenas((resenasData as Resena[]) ?? [])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="px" style={{ paddingTop: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>
      </div>
    )
  }

  if (!perfil || !perfil.rol) {
    return (
      <div className="px" style={{ paddingTop: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>No encontramos este perfil.</p>
      </div>
    )
  }

  const tag = ROL_TAG[perfil.rol]
  const iniciales = (perfil.nombre || perfil.razon_social || '??').slice(0, 2).toUpperCase()

  const stats =
    perfil.rol === 'camionero'
      ? [
          [camion ? `${camion.carga_max_kg / 1000} TON` : '—', 'Capacidad'],
          [String(fletesCount), 'Fletes'],
        ]
      : [
          [String(cargasCount), 'Cargas'],
          [perfil.emite_factura ? 'Sí' : 'No', 'Emite factura'],
        ]

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 40, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="row" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <Icon name="arrowL" size={18} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Volver</span>
      </div>

      <span className="pill pill-navy" style={{ marginBottom: 14 }}>
        <Icon name={tag.icon} size={13} strokeWidth={1.9} /> {tag.label}
      </span>

      <div className="row" style={{ gap: 14, marginBottom: 10 }}>
        <div
          className="ic-chip ic-navy"
          style={{ width: 64, height: 64, borderRadius: 20, fontSize: 22, fontWeight: 700 }}
        >
          {iniciales}
        </div>
        <div>
          <div className="row" style={{ gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 19 }}>{perfil.nombre || perfil.razon_social}</span>
            {perfil.verificado && (
              <span className="verified">
                <Icon name="check" size={12} strokeWidth={3} />
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--slate)' }}>
            {perfil.rol === 'camionero' && camion ? `${camion.tipo}` : perfil.rubro || ''}
          </div>
          {perfil.rating_prom != null && (
            <div className="row" style={{ gap: 4, marginTop: 4 }}>
              <span className="stars">
                <StarFill size={13} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{perfil.rating_prom}</span>
              <span className="meta">· {perfil.total_resenas} reseñas</span>
            </div>
          )}
        </div>
      </div>

      <div className="row" style={{ gap: 8, margin: '16px 0' }}>
        {stats.map(([value, label]) => (
          <div key={label} className="card flat" style={{ flex: 1, textAlign: 'center', padding: '14px 4px', border: '1.5px solid var(--line)' }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{value}</div>
            <div style={{ fontSize: 10.5, color: 'var(--slate)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {perfil.rol === 'camionero' && camion && (
        <>
          <div className="eyebrow">Especificaciones</div>
          <div className="card" style={{ padding: '6px 16px', marginBottom: 16 }}>
            <div className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>Dimensiones</span>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>
                {camion.largo_m} × {camion.ancho_m} × {camion.alto_m} m
              </span>
            </div>
            <div className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>Carga máxima</span>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{camion.carga_max_kg.toLocaleString('es-CL')} kg</span>
            </div>
            <div className="between" style={{ padding: '10px 0', borderBottom: camion.carroceria ? '1px solid var(--line)' : 'none' }}>
              <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>Pallets</span>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{camion.pallets ?? '—'} u.</span>
            </div>
            {camion.carroceria && (
              <div className="between" style={{ padding: '10px 0' }}>
                <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>Carrocería</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{camion.carroceria}</span>
              </div>
            )}
          </div>
        </>
      )}

      {(perfil.rol === 'negocio' || perfil.rol === 'proveedor') && (
        <>
          <div className="eyebrow">{perfil.rol === 'proveedor' ? 'Sobre el proveedor' : 'Sobre la empresa'}</div>
          <div className="card" style={{ padding: '6px 16px', marginBottom: 16 }}>
            {perfil.rubro && (
              <div className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>{perfil.rol === 'proveedor' ? 'Producto' : 'Rubro'}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{perfil.rubro}</span>
              </div>
            )}
            {perfil.rut && (
              <div className="between" style={{ padding: '10px 0' }}>
                <span style={{ fontSize: 12.5, color: 'var(--slate)' }}>RUT</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{perfil.rut}</span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="eyebrow">Reseñas</div>
      {resenas.length === 0 && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Todavía no tiene reseñas.</p>
        </div>
      )}
      {resenas.map((r) => (
        <div key={r.id} className="card" style={{ marginBottom: 8 }}>
          <div className="between">
            <span style={{ fontWeight: 700, fontSize: 13 }}>{r.autor?.nombre ?? 'Usuario NORTIA'}</span>
            <div className="row" style={{ gap: 4 }}>
              <span className="stars">
                <StarFill size={12} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{r.puntuacion}</span>
            </div>
          </div>
          {r.comentario && <p style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 6, marginBottom: 0 }}>{r.comentario}</p>}
        </div>
      ))}
    </div>
  )
}
