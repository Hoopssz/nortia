import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { evaluarCompatibilidad, type Carga, type Camion } from '../../lib/matchEngine'
import { regionNames, regionOrder } from '../../lib/chileRegions'
import { obtenerPolizaSeguro } from '../../lib/insuranceService'
import { RutasFavoritasBar } from '../../components/RutasFavoritasBar'
import type { RutaFavorita } from '../../lib/savedLanesService'

type FiltroRequisito = 'todos' | 'frio' | 'rampa' | 'grua' | 'ayuda'
type AlcanceGeografico = 'mis_regiones' | 'todo_chile' | number
type Ordenamiento = 'recientes' | 'precio_desc' | 'distancia_asc' | 'peso_desc'

export function BuscarCargaPage() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [cargas, setCargas] = useState<Carga[]>([])
  const [camion, setCamion] = useState<Camion | null>(null)
  const [misRegiones, setMisRegiones] = useState<number[]>([])

  const [filtroRequisito, setFiltroRequisito] = useState<FiltroRequisito>('todos')
  const [alcance, setAlcance] = useState<AlcanceGeografico>('mis_regiones')
  const [busquedaTexto, setBusquedaTexto] = useState('')
  const [orden, setOrden] = useState<Ordenamiento>('recientes')
  const [rutaFavoritaActiva, setRutaFavoritaActiva] = useState<RutaFavorita | null>(null)

  const [loading, setLoading] = useState(true)
  const [sinCamion, setSinCamion] = useState(false)

  useEffect(() => {
    if (!session?.user.id) return
    let active = true

    async function load() {
      const [{ data: camionData }, { data: regionesData }, { data: todasPublicadas }] = await Promise.all([
        supabase
          .from('camiones')
          .select('*')
          .eq('perfil_id', session!.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('perfil_regiones')
          .select('region_codigo')
          .eq('perfil_id', session!.user.id),
        supabase
          .from('cargas')
          .select('*')
          .eq('estado', 'publicada')
          .order('created_at', { ascending: false }),
      ])

      if (!active) return

      const isAntigravity = session!.user.id.startsWith('antigravity') || session!.user.id.startsWith('demo')

      let camionFinal = camionData
      if (!camionFinal && isAntigravity) {
        camionFinal = {
          id: 'camion-antigravity-01',
          perfil_id: session!.user.id,
          tipo: 'tractocamion',
          capacidad_kg: 28000,
          volumen_m3: 85,
          patente: 'AG-VY-26',
          rampla: true,
          refrigerado: true,
          disponible: true,
          created_at: new Date().toISOString(),
        } as unknown as Camion
      }

      if (!camionFinal) {
        setSinCamion(true)
        setLoading(false)
        return
      }

      setCamion(camionFinal as Camion)

      const regList = (regionesData ?? []).map((r) => r.region_codigo)
      setMisRegiones(regList)

      // Si no tiene regiones configuradas o tiene todas, default a todo_chile
      if (regList.length === 0 || regList.length === 16) {
        setAlcance('todo_chile')
      }

      setCargas((todasPublicadas as Carga[]) ?? [])
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [session])

  // Filtrado compuesto: Geográfico + Rutas Favoritas + Requisitos Específicos + Búsqueda de Texto
  const cargasFiltradas = cargas
    .filter((c) => {
      // 0. Filtro por Corredor / Ruta Favorita
      if (rutaFavoritaActiva) {
        const matchCorredor =
          (c.origen_region === rutaFavoritaActiva.origenRegion && c.destino_region === rutaFavoritaActiva.destinoRegion) ||
          (c.origen_region === rutaFavoritaActiva.destinoRegion && c.destino_region === rutaFavoritaActiva.origenRegion)
        if (!matchCorredor) return false
        if (rutaFavoritaActiva.tarifaMinimaClp && (c.precio_referencia || 0) < rutaFavoritaActiva.tarifaMinimaClp) {
          return false
        }
      }

      // 1. Filtro Geográfico
      if (!rutaFavoritaActiva && alcance === 'mis_regiones' && misRegiones.length > 0) {
        const origenEnZona = c.origen_region ? misRegiones.includes(c.origen_region) : false
        const destinoEnZona = c.destino_region ? misRegiones.includes(c.destino_region) : false
        if (!origenEnZona && !destinoEnZona) return false
      } else if (!rutaFavoritaActiva && typeof alcance === 'number') {
        if (c.origen_region !== alcance && c.destino_region !== alcance) return false
      }

      // 2. Filtro de Requisitos Específicos
      if (filtroRequisito === 'frio' && !c.requiere_frio) return false
      if (filtroRequisito === 'rampa' && !c.requiere_rampa) return false
      if (filtroRequisito === 'grua' && !c.requiere_grua) return false
      if (filtroRequisito === 'ayuda' && !c.requiere_ayuda) return false

      // 3. Búsqueda de Texto
      if (busquedaTexto.trim()) {
        const term = busquedaTexto.toLowerCase().trim()
        const matchOrigen = c.origen_texto.toLowerCase().includes(term)
        const matchDestino = c.destino_texto.toLowerCase().includes(term)
        const matchTipo = (c.tipo_carga || '').toLowerCase().includes(term)
        if (!matchOrigen && !matchDestino && !matchTipo) return false
      }

      return true
    })
    .sort((a, b) => {
      if (orden === 'precio_desc') {
        return (b.precio_referencia || 0) - (a.precio_referencia || 0)
      }
      if (orden === 'distancia_asc') {
        return (a.distancia_km || 9999) - (b.distancia_km || 9999)
      }
      if (orden === 'peso_desc') {
        return b.peso_kg - a.peso_kg
      }
      // 'recientes' default
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <WebPlatformLayout activeTab="Buscar Cargas">
      <div className="web-platform-container">
        <div className="between" style={{ marginBottom: 18, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>Feed Geográfico Inteligente</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              Buscar Carga en Chile
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              {camion
                ? `Filtrado para tu ${camion.tipo.replace('_', ' ')} (${camion.patente}) · Capacidad Máx ${camion.carga_max_kg.toLocaleString('es-CL')} kg`
                : 'Cargas compatibles a lo largo de todo el país.'}
            </div>
          </div>

          <button
            type="button"
            className="chip"
            style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
            onClick={() => navigate('/camionero')}
          >
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Panel Operativo</span>
          </button>
        </div>

      {/* Barra de Rutas Favoritas / Saved Lanes */}
      {session?.user.id && (
        <RutasFavoritasBar
          camioneroId={session.user.id}
          rutaActivaId={rutaFavoritaActiva?.id || null}
          onSelectRuta={setRutaFavoritaActiva}
        />
      )}

      {/* Buscador de Ciudad / Comuna */}
      <div className="field" style={{ marginBottom: 10 }}>
        <input
          type="search"
          placeholder="Buscar ciudad, comuna o tipo de carga…"
          value={busquedaTexto}
          onChange={(e) => setBusquedaTexto(e.target.value)}
          style={{ borderRadius: 14, padding: '10px 14px', fontSize: 13 }}
        />
      </div>

      {/* Selector de Alcance Geográfico Nacional */}
      <div className="row" style={{ gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {misRegiones.length > 0 && (
          <button
            type="button"
            className="chip"
            style={{
              background: alcance === 'mis_regiones' ? 'var(--navy)' : undefined,
              color: alcance === 'mis_regiones' ? '#fff' : undefined,
              cursor: 'pointer',
              fontSize: 11.5,
              padding: '6px 12px',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setAlcance('mis_regiones')}
          >
            🎯 Mis Regiones ({misRegiones.length})
          </button>
        )}

        <button
          type="button"
          className="chip"
          style={{
            background: alcance === 'todo_chile' ? 'var(--navy)' : undefined,
            color: alcance === 'todo_chile' ? '#fff' : undefined,
            cursor: 'pointer',
            fontSize: 11.5,
            padding: '6px 12px',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setAlcance('todo_chile')}
        >
          🇨🇱 Todo Chile
        </button>

        <button
          type="button"
          className="chip"
          style={{
            background: '#F0F9FF',
            color: '#0369A1',
            border: '1px solid #BAE6FD',
            cursor: 'pointer',
            fontSize: 11.5,
            padding: '6px 12px',
            whiteSpace: 'nowrap',
            fontWeight: 700,
          }}
          onClick={() => navigate('/camionero/retorno')}
        >
          🔄 Retorno Vacío
        </button>

        {/* Dropdown de Región Específica */}
        <select
          value={typeof alcance === 'number' ? alcance : ''}
          onChange={(e) => {
            const val = e.target.value
            setAlcance(val ? Number(val) : 'todo_chile')
          }}
          style={{
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 11.5,
            border: '1.5px solid var(--line)',
            background: typeof alcance === 'number' ? 'var(--navy-tint)' : 'var(--card)',
            color: typeof alcance === 'number' ? 'var(--navy)' : 'var(--ink)',
            fontWeight: typeof alcance === 'number' ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          <option value="">Filtrar por región…</option>
          {regionOrder.map((code) => (
            <option key={code} value={code}>
              {regionNames[code]}
            </option>
          ))}
        </select>
      </div>

      {/* Píldoras de Filtros por Requisitos Específicos */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 6,
          marginBottom: 10,
          scrollbarWidth: 'none',
        }}
      >
        <button
          type="button"
          className="chip"
          style={{
            background: filtroRequisito === 'todos' ? 'var(--navy-tint-2)' : undefined,
            color: filtroRequisito === 'todos' ? 'var(--navy)' : undefined,
            fontWeight: filtroRequisito === 'todos' ? 700 : 500,
            cursor: 'pointer',
            padding: '5px 10px',
            fontSize: 11,
            whiteSpace: 'nowrap',
          }}
          onClick={() => setFiltroRequisito('todos')}
        >
          Todos los requisitos
        </button>
        <button
          type="button"
          className="chip"
          style={{
            background: filtroRequisito === 'frio' ? 'var(--navy)' : undefined,
            color: filtroRequisito === 'frio' ? '#fff' : undefined,
            cursor: 'pointer',
            padding: '5px 10px',
            fontSize: 11,
            whiteSpace: 'nowrap',
          }}
          onClick={() => setFiltroRequisito('frio')}
        >
          ❄️ Con Frío
        </button>
        <button
          type="button"
          className="chip"
          style={{
            background: filtroRequisito === 'rampa' ? 'var(--navy)' : undefined,
            color: filtroRequisito === 'rampa' ? '#fff' : undefined,
            cursor: 'pointer',
            padding: '5px 10px',
            fontSize: 11,
            whiteSpace: 'nowrap',
          }}
          onClick={() => setFiltroRequisito('rampa')}
        >
          🏗️ Con Rampa
        </button>
        <button
          type="button"
          className="chip"
          style={{
            background: filtroRequisito === 'grua' ? 'var(--navy)' : undefined,
            color: filtroRequisito === 'grua' ? '#fff' : undefined,
            cursor: 'pointer',
            padding: '5px 10px',
            fontSize: 11,
            whiteSpace: 'nowrap',
          }}
          onClick={() => setFiltroRequisito('grua')}
        >
          🚜 Con Grúa
        </button>
        <button
          type="button"
          className="chip"
          style={{
            background: filtroRequisito === 'ayuda' ? 'var(--navy)' : undefined,
            color: filtroRequisito === 'ayuda' ? '#fff' : undefined,
            cursor: 'pointer',
            padding: '5px 10px',
            fontSize: 11,
            whiteSpace: 'nowrap',
          }}
          onClick={() => setFiltroRequisito('ayuda')}
        >
          🤝 Peoneta
        </button>
      </div>

      {/* Barra de Ordenamiento y Conteo */}
      <div className="between" style={{ marginBottom: 12, fontSize: 11.5, color: 'var(--slate)' }}>
        <span><b>{cargasFiltradas.length}</b> cargas encontradas</span>
        <div className="row" style={{ gap: 4 }}>
          <span>Ordenar:</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Ordenamiento)}
            style={{
              fontSize: 11,
              border: 'none',
              background: 'transparent',
              color: 'var(--navy)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <option value="recientes">Más recientes</option>
            <option value="precio_desc">Mayor tarifa ($)</option>
            <option value="distancia_asc">Menor distancia (km)</option>
            <option value="peso_desc">Mayor peso (kg)</option>
          </select>
        </div>
      </div>

      {loading && <p style={{ fontSize: 13, color: 'var(--slate)' }}>Buscando cargas compatibles…</p>}

      {!loading && sinCamion && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 12px' }}>
            Registra tu camión para que el motor filtre cargas según tu capacidad y rutas.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/onboarding/vehicle')}>
            Registrar mi camión
          </button>
        </div>
      )}

      {!loading && !sinCamion && cargasFiltradas.length === 0 && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28, borderRadius: 16 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>
            No hay cargas con estos filtros
          </p>
          <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px' }}>
            {alcance === 'mis_regiones'
              ? 'Prueba ampliando tu búsqueda a Todo Chile o cambiando los requisitos.'
              : 'Intenta modificar tus términos de búsqueda o requisitos.'}
          </p>
          {alcance === 'mis_regiones' && (
            <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => setAlcance('todo_chile')}>
              Ver cargas en Todo Chile
            </button>
          )}
        </div>
      )}

      <div className="cards-auto-grid">
        {cargasFiltradas.map((carga) => {
          const match = evaluarCompatibilidad(carga, camion)
          const origenRegionNombre = carga.origen_region ? regionNames[carga.origen_region] : null
          const destinoRegionNombre = carga.destino_region ? regionNames[carga.destino_region] : null
          const esEnMisRegiones = carga.origen_region && misRegiones.includes(carga.origen_region)
          const poliza = obtenerPolizaSeguro(carga.id)
          const tieneSeguro = poliza && poliza.plan !== 'ninguno'

          return (
            <div
              key={carga.id}
              className="card"
              style={{
                cursor: 'pointer',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onClick={() => navigate(`/camionero/cargas/${carga.id}`)}
            >
              <div>
                <div className="between" style={{ alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Origen → Destino Destacado en Grande */}
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>{carga.origen_texto}</span>
                      <span style={{ color: 'var(--navy)' }}>➔</span>
                      <span>{carga.destino_texto}</span>
                    </div>

                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--slate)', marginTop: 3 }}>
                      {carga.tipo_carga || 'Carga General'} · {(carga.peso_kg / 1000).toFixed(1)} Ton
                      {esEnMisRegiones && (
                        <span className="pill pill-navy" style={{ marginLeft: 6, fontSize: 10 }}>
                          Tu zona
                        </span>
                      )}
                    </div>
                  </div>

                  {carga.precio_referencia ? (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 10, color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Tarifa Ref.
                      </div>
                      <span className="text-price" style={{ fontSize: 20, fontWeight: 900, color: 'var(--navy)' }}>
                        ${carga.precio_referencia.toLocaleString('es-CL')}
                      </span>
                    </div>
                  ) : (
                    <span className="pill" style={{ fontSize: 11, fontWeight: 700 }}>A convenir</span>
                  )}
                </div>

                <div style={{ fontSize: 11.5, color: 'var(--slate)', marginBottom: 8 }}>
                  {origenRegionNombre && destinoRegionNombre
                    ? `${origenRegionNombre} a ${destinoRegionNombre}`
                    : origenRegionNombre || destinoRegionNombre}
                  {carga.distancia_km ? ` · ~${carga.distancia_km} km` : ''}
                </div>
              </div>

              {/* Fila Inferior: Especificaciones y Seguro */}
              <div>
                <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className="pill" style={{ fontSize: 10.5 }}>
                    {carga.peso_kg.toLocaleString('es-CL')} kg
                  </span>
                  {carga.volumen_m3 && (
                    <span className="pill" style={{ fontSize: 10.5 }}>
                      {carga.volumen_m3} m³
                    </span>
                  )}
                  {carga.pallets && (
                    <span className="pill" style={{ fontSize: 10.5 }}>
                      {carga.pallets} pallets
                    </span>
                  )}
                  {tieneSeguro && (
                    <span
                      className="pill"
                      style={{
                        background: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0',
                        fontSize: 10,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Icon name="shield" size={11} strokeWidth={2.4} />
                      Seguro {poliza.plan.toUpperCase()}
                    </span>
                  )}
                  {carga.requiere_frio && (
                    <span className="pill" style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 10 }}>
                      Frío
                    </span>
                  )}
                  {carga.requiere_rampa && (
                    <span className="pill" style={{ background: '#FEF3C7', color: '#92400E', fontSize: 10 }}>
                      Rampa
                    </span>
                  )}
                  {carga.requiere_grua && (
                    <span className="pill" style={{ background: '#F3E8FF', color: '#6B21A8', fontSize: 10 }}>
                      Grúa
                    </span>
                  )}
                  {carga.requiere_ayuda && (
                    <span className="pill" style={{ background: '#ECFDF5', color: '#065F46', fontSize: 10 }}>
                      Ayuda estiba
                    </span>
                  )}
                </div>

                {/* Match Score Badge */}
                {camion && (
                  <div className="between" style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--slate)' }}>Compatibilidad:</span>
                    <span
                      className={`pill ${match.esCompatible ? 'pill-green' : 'pill-navy'}`}
                      style={{ fontSize: 10.5, fontWeight: 700 }}
                    >
                      {match.esCompatible ? '100% Compatible' : `${match.porcentajeMatch}% Match`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </WebPlatformLayout>
)
}
