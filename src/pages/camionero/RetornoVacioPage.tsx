import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { ChileLocationInput } from '../../components/ChileLocationInput'
import { evaluarCompatibilidad, type Carga, type Camion } from '../../lib/matchEngine'
import { estimarTiempoViaje } from '../../lib/chileLocations'

interface AlertaRetorno {
  id: string
  origenTexto: string
  origenRegion: number | null
  destinoTexto: string
  destinoRegion: number | null
  fecha: string
  activa: boolean
}

const STORAGE_KEY_ALERTAS = 'nortia_alertas_retorno_'

export function RetornoVacioPage() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [camion, setCamion] = useState<Camion | null>(null)
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)

  // Formulario de retorno
  const [origenTexto, setOrigenTexto] = useState('')
  const [origenRegion, setOrigenRegion] = useState<number | null>(null)
  const [destinoTexto, setDestinoTexto] = useState('')
  const [destinoRegion, setDestinoRegion] = useState<number | null>(null)
  const [fechaRetorno, setFechaRetorno] = useState('')

  const [alertaGuardada, setAlertaGuardada] = useState<AlertaRetorno | null>(null)
  const [guardadoMsg, setGuardadoMsg] = useState(false)

  useEffect(() => {
    if (!session?.user.id) return
    let active = true

    async function load() {
      const [{ data: camionData }, { data: cargasData }] = await Promise.all([
        supabase
          .from('camiones')
          .select('*')
          .eq('perfil_id', session!.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('cargas')
          .select('*')
          .eq('estado', 'publicada')
          .order('created_at', { ascending: false }),
      ])

      if (!active) return
      setCamion(camionData as Camion)
      setCargas((cargasData as Carga[]) ?? [])

      // Cargar alerta activa guardada
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ALERTAS + session!.user.id)
        if (raw) {
          const parsed = JSON.parse(raw)
          setAlertaGuardada(parsed)
          if (parsed.activa) {
            setOrigenTexto(parsed.origenTexto)
            setOrigenRegion(parsed.origenRegion)
            setDestinoTexto(parsed.destinoTexto)
            setDestinoRegion(parsed.destinoRegion)
          }
        }
      } catch (err) {
        console.error(err)
      }

      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [session])

  function handleGuardarAlerta() {
    if (!origenTexto || !destinoTexto || !session?.user.id) return

    const nuevaAlerta: AlertaRetorno = {
      id: `ALERTA-${Date.now()}`,
      origenTexto,
      origenRegion,
      destinoTexto,
      destinoRegion,
      fecha: fechaRetorno || new Date().toISOString().slice(0, 10),
      activa: true,
    }

    localStorage.setItem(STORAGE_KEY_ALERTAS + session.user.id, JSON.stringify(nuevaAlerta))
    setAlertaGuardada(nuevaAlerta)
    setGuardadoMsg(true)
    setTimeout(() => setGuardadoMsg(false), 4000)
  }

  function handleEliminarAlerta() {
    if (!session?.user.id) return
    localStorage.removeItem(STORAGE_KEY_ALERTAS + session.user.id)
    setAlertaGuardada(null)
    setOrigenTexto('')
    setOrigenRegion(null)
    setDestinoTexto('')
    setDestinoRegion(null)
  }

  // Filtrar cargas que calzan con la ruta de retorno
  const cargasRetorno = cargas.filter((c) => {
    if (!origenTexto && !destinoTexto) return false

    // Concordancia por región o texto
    const coincideOrigen = origenRegion
      ? c.origen_region === origenRegion
      : origenTexto
        ? c.origen_texto.toLowerCase().includes(origenTexto.toLowerCase())
        : true

    const coincideDestino = destinoRegion
      ? c.destino_region === destinoRegion
      : destinoTexto
        ? c.destino_texto.toLowerCase().includes(destinoTexto.toLowerCase())
        : true

    return coincideOrigen && coincideDestino
  })

  return (
    <WebPlatformLayout activeTab="Retorno Vacío">
      <div className="web-platform-container">
        {/* Header con botón Volver */}
        <div className="between" style={{ marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Optimización Logística & Corredores</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              Retorno Vacío & Alertas de Ruta
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              ¿Terminaste un flete y vuelves a tu base? Rentabiliza el viaje de vuelta y ahorra en peajes y combustible.
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

        {/* Layout de 2 columnas: Columna izquierda (Configuración de Ruta) + Columna derecha (Cargas encontradas) */}
        <div className="two-col-grid">
          {/* COLUMNA IZQUIERDA: Tarjeta informativa + Formulario */}
          <div>
            {/* Tarjeta Informativa del Corredor */}
            <div
              className="card flat"
              style={{
                background: 'linear-gradient(135deg, #265370 0%, #1C3E54 100%)',
                color: '#FFFFFF',
                padding: '20px',
                borderRadius: 24,
                marginBottom: 18,
                boxShadow: 'var(--shadow-lift)',
              }}
            >
              <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🔄</span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Rentabiliza tu vuelta a casa</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.45, margin: 0, opacity: 0.95 }}>
                Ingresa desde dónde sales y hacia dónde regresas. NORTIA filtra automáticamente fletes compatibles en esa dirección y te envía alertas inmediatas.
              </p>
            </div>

            {/* Formulario de Ruta de Retorno */}
            <div className="card" style={{ padding: '20px', margin: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 14 }}>
                Configura tu ruta de regreso
              </div>

              <ChileLocationInput
                label="¿Dónde te encuentras ahora? (Origen retorno)"
                placeholder="Ej. Santiago, Pudahuel, Valparaíso…"
                value={origenTexto}
                onChange={({ texto, regionCodigo }) => {
                  setOrigenTexto(texto)
                  setOrigenRegion(regionCodigo)
                }}
              />

              <ChileLocationInput
                label="¿Hacia dónde regresas? (Destino retorno)"
                placeholder="Ej. Concepción, Rancagua, Antofagasta…"
                value={destinoTexto}
                onChange={({ texto, regionCodigo }) => {
                  setDestinoTexto(texto)
                  setDestinoRegion(regionCodigo)
                }}
              />

              <div className="field">
                <label>Fecha estimada de regreso</label>
                <input
                  type="date"
                  value={fechaRetorno}
                  onChange={(e) => setFechaRetorno(e.target.value)}
                />
              </div>

              {guardadoMsg && (
                <div className="pill pill-green" style={{ width: '100%', justifyContent: 'center', marginBottom: 12, padding: 10 }}>
                  ✓ ¡Alerta de retorno activada! Te notificaremos cargas en este corredor.
                </div>
              )}

              <div className="row" style={{ gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                  disabled={!origenTexto || !destinoTexto}
                  onClick={handleGuardarAlerta}
                >
                  🔔 Activar alerta de retorno
                </button>
                {alertaGuardada && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '12px', color: 'var(--danger)' }}
                    onClick={handleEliminarAlerta}
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Cargas Disponibles en la Ruta de Retorno */}
          <div>
            <div className="between" style={{ marginBottom: 14 }}>
              <div className="eyebrow" style={{ margin: 0 }}>Cargas encontradas en tu regreso</div>
              <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 700 }}>{cargasRetorno.length} disponibles</span>
            </div>

            {loading ? (
              <p style={{ fontSize: 13, color: 'var(--slate)' }}>Buscando cargas en ruta…</p>
            ) : !origenTexto || !destinoTexto ? (
              <div className="card flat" style={{ background: 'var(--card-glass-bg)', border: '1px dashed var(--line)', textAlign: 'center', padding: 36, borderRadius: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🗺️</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>
                  Define tu corredor de retorno
                </div>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0, lineHeight: 1.5 }}>
                  Ingresa tu ciudad o comuna de salida y destino a la izquierda para rastrear cargas compatibles en tu camino de regreso.
                </p>
              </div>
            ) : cargasRetorno.length === 0 ? (
              <div className="card flat" style={{ background: 'var(--card-glass-bg)', textAlign: 'center', padding: 36, borderRadius: 16, border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: 'var(--navy)' }}>
                  <Icon name="truck" size={32} strokeWidth={1.8} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>
                  No hay cargas en este momento para {origenTexto} → {destinoTexto}
                </div>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0, lineHeight: 1.5 }}>
                  Tu alerta ya está activa. En cuanto una empresa publique una carga en este corredor, recibirás un aviso instantáneo en tu centro de notificaciones.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cargasRetorno.map((carga) => {
                  const match = evaluarCompatibilidad(carga, camion)

                  return (
                    <div
                      key={carga.id}
                      className="card"
                      style={{
                        margin: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/camionero/cargas/${carga.id}`)}
                    >
                      <div className="between" style={{ marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)' }}>
                          {carga.origen_texto} → {carga.destino_texto}
                        </div>
                        {carga.precio_referencia && (
                          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>
                            ${carga.precio_referencia.toLocaleString('es-CL')}
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span>{carga.tipo_carga || 'Carga'} · {carga.peso_kg.toLocaleString('es-CL')} kg</span>
                        {carga.distancia_km ? (
                          <>
                            <span>·</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Icon name="pin" size={11} strokeWidth={2} />
                              {carga.distancia_km} km ({estimarTiempoViaje(carga.distancia_km).texto})
                            </span>
                          </>
                        ) : null}
                      </div>

                      <div className="between" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                        <span className="pill pill-navy" style={{ fontSize: 10.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Star4Point size={9} color="var(--navy)" />
                          En tu ruta de regreso
                        </span>
                        <span className={`pill ${match.esCompatible ? 'pill-green' : 'pill-navy'}`} style={{ fontSize: 10.5 }}>
                          {match.esCompatible ? '100% Compatible' : `${match.porcentajeMatch}% Match`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  )
}
