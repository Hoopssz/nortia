import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { GastosLogisticaModal } from '../../components/GastosLogisticaModal'
import { EquipoDespachoModal } from '../../components/EquipoDespachoModal'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import type { Tables } from '../../lib/database.types'

type Carga = Tables<'cargas'> & { ofertas: { count: number }[] }

const ESTADO_PILL: Record<Tables<'cargas'>['estado'], { label: string; cls: string }> = {
  borrador: { label: 'Borrador', cls: 'pill-navy' },
  publicada: { label: 'Buscando transportista', cls: 'pill-navy' },
  asignada: { label: 'Camión Asignado', cls: 'pill-green' },
  en_ruta: { label: 'En Ruta hacia Destino', cls: 'pill-green' },
  entregada: { label: 'Entregada con Éxito', cls: 'pill-green' },
  cancelada: { label: 'Cancelada', cls: 'pill-navy' },
}

export function NegocioHomePage() {
  const navigate = useNavigate()
  const { perfil, session } = useAuth()
  const basePath = perfil?.rol === 'proveedor' ? '/proveedor' : '/negocio'
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGastosModal, setShowGastosModal] = useState(false)
  const [showEquipoModal, setShowEquipoModal] = useState(false)

  useEffect(() => {
    if (!session?.user.id) return
    let active = true
    async function load() {
      const { data, error } = await supabase
        .from('cargas')
        .select('*, ofertas(count)')
        .eq('cliente_id', session!.user.id)
        .order('created_at', { ascending: false })
        .limit(15)
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

  const activas = cargas.filter((c) => c.estado === 'publicada' || c.estado === 'asignada' || c.estado === 'en_ruta')
  const entregadas = cargas.filter((c) => c.estado === 'entregada')

  return (
    <WebPlatformLayout activeTab="Panel de Cargas">
      <div className="web-platform-container">
        {/* Cabecera de Plataforma Web con Título y Acciones */}
        <div style={{ marginBottom: 16 }}>
          <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span>{perfil?.razon_social || perfil?.nombre || 'Empresa Cliente'}</span>
            <span>· Portal Negocios</span>
            <Star4Point size={10} color="var(--navy)" />
          </div>
          <div className="h1" style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900 }}>
            Centro de Despacho & Compras
          </div>
        </div>

        {/* Botón Principal Hero (56px de alto, toque inmediato con el pulgar) */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate(`${basePath}/publicar`)}
          style={{
            width: '100%',
            height: 56,
            padding: '0 20px',
            borderRadius: 18,
            fontSize: 15.5,
            fontWeight: 900,
            letterSpacing: -0.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #265370 0%, #1C3E54 100%)',
            boxShadow: '0 8px 24px -4px rgba(38, 83, 112, 0.4)',
            marginBottom: 16,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="package" size={22} color="#FFFFFF" strokeWidth={2.5} />
            <span>PUBLICAR CARGA NUEVA</span>
          </div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              padding: '5px 12px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Buscar Camión →
          </span>
        </button>

        {/* Tarjeta de Acceso Rápido a Mercado B2B Proveedores */}
        <div
          className="glow-card selectable"
          style={{
            padding: '16px 20px',
            borderRadius: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 18,
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.05)',
          }}
          onClick={() => navigate('/negocio/mercado')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                flexShrink: 0,
              }}
            >
              <Icon name="boxes" size={22} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--ink)' }}>
                Mercado Mayorista de Proveedores
              </div>
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                Compra insumos, agro y materiales con Escrow protegido
              </div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
            Comprar <Icon name="chevR" size={14} strokeWidth={2.5} />
          </span>
        </div>


        {/* Barra de 4 Métricas Clave */}
        <div className="stats-bar-grid">
          {/* Card 1: Cargas en Gestión Activa */}
          <div
            className="navy-panel"
            style={{
              borderRadius: 16,
              padding: '16px 18px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onClick={() => navigate(`${basePath}/publicar`)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Star4Point size={10} color="#38BDF8" />
                <span style={{ fontSize: 10.5, fontWeight: 800, color: '#E0F2FE', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  En Operación
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 24, color: '#FFFFFF', letterSpacing: -0.5 }}>
                {activas.length} cargas activas
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(224, 242, 254, 0.85)', marginTop: 8 }}>
              Monitoreo con GPS & firma digital
            </div>
          </div>

          {/* Card 2: Fletes Completados */}
          <div
            className="glow-card"
            style={{
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Fletes Completados
              </span>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--ink)', marginTop: 4, letterSpacing: -0.3 }}>
                {entregadas.length} entregas exitosas
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="check" size={13} strokeWidth={2.4} /> Facturación DTE 33 al día
            </div>
          </div>

          {/* Card 3: Gastos y Ahorro Logístico */}
          <div
            className="glow-card selectable glow-tile-emerald"
            style={{
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onClick={() => setShowGastosModal(true)}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Ahorro Logístico Estimado
              </span>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--ink)', marginTop: 4, letterSpacing: -0.3 }}>
                ~22% vs Tradicional
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginTop: 8 }}>
              Ver desglose de ahorro →
            </div>
          </div>

          {/* Card 4: Equipo y Encargados */}
          <div
            className="glow-card selectable glow-tile-cyan"
            style={{
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onClick={() => setShowEquipoModal(true)}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Equipo de Despacho
              </span>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--ink)', marginTop: 4, letterSpacing: -0.3 }}>
                Bodega y Rutas
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--navy)', fontWeight: 600, marginTop: 8 }}>
              Gestionar encargados →
            </div>
          </div>
        </div>

        {/* Grid Principal de 2 Columnas (Dashboard Split: 65% Cargas / 35% Sidebar Corporativo) */}
        <div className="dashboard-split-grid">
          {/* Columna Izquierda: Hero de Publicación y Lista de Cargas */}
          <div>
            {/* Hero Panel Glowy: Publicar Carga Inmediata */}
            <div
              className="navy-panel"
              style={{
                borderRadius: 18,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: 20,
              }}
              onClick={() => navigate(`${basePath}/publicar`)}
            >
              <div style={{ position: 'relative', padding: '20px 24px', zIndex: 1 }} className="between">
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      marginBottom: 8,
                    }}
                  >
                    <Star4Point size={10} color="#38BDF8" />
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: '#E0F2FE', textTransform: 'uppercase' }}>
                      Asignación Rápida
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: '#FFFFFF', letterSpacing: -0.3 }}>
                    ¿Necesitas mover una carga hoy?
                  </div>
                  <div style={{ fontSize: 12.5, color: 'rgba(224, 242, 254, 0.85)', marginTop: 4 }}>
                    Publica origen, destino y tonelaje. Recibe ofertas de transportistas verificados en minutos.
                  </div>
                </div>

                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    color: '#0369A1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <Icon name="package" size={22} strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Listado de Cargas de la Empresa */}
            <div className="between" style={{ marginBottom: 12, alignItems: 'center' }}>
              <div>
                <span className="eyebrow" style={{ margin: 0 }}>
                  Monitoreo de Despachos
                </span>
                <div className="h2" style={{ margin: '2px 0 0', fontSize: 18 }}>
                  Cargas de la empresa ({cargas.length})
                </div>
              </div>
            </div>

            {loading && <p style={{ fontSize: 13, color: 'var(--slate)', padding: 20 }}>Cargando despachos…</p>}

            {!loading && error && (
              <div className="glow-card" style={{ background: 'var(--danger-soft)', textAlign: 'center', padding: 24, borderRadius: 14 }}>
                <p style={{ fontSize: 13, color: 'var(--danger)', margin: '0 0 10px' }}>No pudimos cargar tus cargas: {error}</p>
                <button type="button" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 12 }} onClick={() => window.location.reload()}>
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && cargas.length === 0 && (
              <div className="glow-card" style={{ textAlign: 'center', padding: 36, borderRadius: 16 }}>
                <Icon name="boxes" size={36} strokeWidth={1.5} />
                <p style={{ fontSize: 14, fontWeight: 700, margin: '10px 0 4px', color: 'var(--ink)' }}>
                  Todavía no has publicado ninguna carga
                </p>
                <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 16px' }}>
                  Publica tu primer envío y accede a tarifas competitivas en todo Chile.
                </p>
                <button type="button" className="btn btn-primary" onClick={() => navigate(`${basePath}/publicar`)}>
                  Publicar Primera Carga
                </button>
              </div>
            )}

            {/* Tarjetas Amplias de Cargas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cargas.map((carga) => {
                const estado = ESTADO_PILL[carga.estado]
                const nOfertas = carga.ofertas?.[0]?.count ?? 0
                return (
                  <div
                    key={carga.id}
                    className="glow-card"
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                    onClick={() => navigate(`${basePath}/cargas/${carga.id}`)}
                  >
                    <div className="row" style={{ gap: 14, minWidth: 0, flex: 1 }}>
                      <div
                        className="ic-chip"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: 'var(--navy-tint)',
                          color: 'var(--navy)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="package" size={22} strokeWidth={1.8} />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{carga.origen_texto}</span>
                          <span style={{ color: 'var(--navy)' }}>→</span>
                          <span>{carga.destino_texto}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600 }}>{carga.tipo_carga || 'Carga general'} · {Number(carga.peso_kg).toLocaleString('es-CL')} kg</span>
                          {carga.distancia_km && (
                            <>
                              <span>·</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <Icon name="pin" size={12} strokeWidth={2} />
                                {carga.distancia_km} km
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        {nOfertas > 0 && (
                          <span className="pill pill-navy" style={{ fontWeight: 700 }}>
                            {nOfertas} {nOfertas === 1 ? 'oferta' : 'ofertas'}
                          </span>
                        )}
                        <span className={`pill ${estado.cls}`}>{estado.label}</span>
                        <Icon name="chevR" size={16} strokeWidth={2} />
                      </div>
                      {carga.precio_referencia ? (
                        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>
                          Ref: ${carga.precio_referencia.toLocaleString('es-CL')}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Columna Derecha: Sidebar Corporativo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="eyebrow" style={{ margin: 0 }}>
              Gestión Corporativa
            </div>

            {/* Gastos y Facturación DTE */}
            <div
              className="glow-card selectable glow-tile-emerald"
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                cursor: 'pointer',
              }}
              onClick={() => setShowGastosModal(true)}
            >
              <div className="row" style={{ gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(52, 211, 153, 0.15)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="chart" size={18} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
                    Gastos & Ahorro Logístico
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                    Reporte de ahorro DTE 33 ante el SII
                  </div>
                </div>
                <Icon name="chevR" size={16} strokeWidth={2} />
              </div>
            </div>

            {/* Encargados de Bodega */}
            <div
              className="glow-card selectable glow-tile-cyan"
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                cursor: 'pointer',
              }}
              onClick={() => setShowEquipoModal(true)}
            >
              <div className="row" style={{ gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="users" size={18} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
                    Equipo & Bodega
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                    Encargados de recepción y despacho
                  </div>
                </div>
                <Icon name="chevR" size={16} strokeWidth={2} />
              </div>
            </div>

            {/* Información de Garantía Escrow NORTIA */}
            <div
              className="glow-card"
              style={{
                padding: '16px',
                borderRadius: 14,
                background: 'var(--card-glass-bg)',
              }}
            >
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <span style={{ color: 'var(--navy)' }}><Icon name="shield" size={18} strokeWidth={2} /></span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>Custodia Escrow NORTIA</span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--slate)', lineHeight: 1.5, margin: 0 }}>
                Tus pagos se custodian de forma segura en Banco de Chile. El transportista solo cobra una vez que el receptor confirma la entrega satisfactoria mediante firma digital.
              </p>
            </div>
          </div>
        </div>

        {/* Modales Corporativos */}
        <GastosLogisticaModal
          isOpen={showGastosModal}
          cargas={cargas}
          empresaNombre={perfil?.razon_social || perfil?.nombre || 'Mi Empresa'}
          onClose={() => setShowGastosModal(false)}
        />

        {session?.user.id && (
          <EquipoDespachoModal
            isOpen={showEquipoModal}
            empresaId={session.user.id}
            onClose={() => setShowEquipoModal(false)}
          />
        )}
      </div>
    </WebPlatformLayout>
  )
}
