import { useState, useEffect } from 'react'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { Icon, Star4Point } from '../../components/Icon'
import {
  obtenerProductos,
  obtenerPedidosNegocio,
  type ProductoProveedor,
  type PedidoB2B,
  type CategoriaProductoB2B,
  CATEGORIAS_B2B,
} from '../../lib/b2bMarketplaceService'
import { regionNames } from '../../lib/chileRegions'
import { ComprarProductoModal } from '../../components/ComprarProductoModal'
import { useAuth } from '../../contexts/useAuth'

export function MercadoB2BPage() {
  const { session } = useAuth()
  const negocioId = session?.user.id || 'negocio-demo'

  const [tab, setTab] = useState<'catalogo' | 'pedidos'>('catalogo')
  const [productos, setProductos] = useState<ProductoProveedor[]>([])
  const [pedidos, setPedidos] = useState<PedidoB2B[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaProductoB2B | 'todas'>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [filtroFrio, setFiltroFrio] = useState(false)
  const [productoParaComprar, setProductoParaComprar] = useState<ProductoProveedor | null>(null)

  function cargarDatos() {
    setProductos(obtenerProductos())
    setPedidos(obtenerPedidosNegocio(negocioId))
  }

  useEffect(() => {
    cargarDatos()

    function onPedidoCreado() {
      cargarDatos()
    }
    window.addEventListener('nortia_pedido_b2b_creado', onPedidoCreado)
    return () => window.removeEventListener('nortia_pedido_b2b_creado', onPedidoCreado)
  }, [negocioId])

  const productosFiltrados = productos.filter((p) => {
    if (categoriaSeleccionada !== 'todas' && p.categoria !== categoriaSeleccionada) {
      return false
    }
    if (filtroFrio && !p.requiereFrio) {
      return false
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      const matchTitulo = p.titulo.toLowerCase().includes(q)
      const matchDesc = p.descripcion.toLowerCase().includes(q)
      const matchProv = p.proveedorNombre.toLowerCase().includes(q)
      const matchComuna = p.origenComuna.toLowerCase().includes(q)
      if (!matchTitulo && !matchDesc && !matchProv && !matchComuna) return false
    }
    return true
  })

  return (
    <WebPlatformLayout activeTab="Mercado B2B">
      <div className="web-platform-container">
        {/* Cabecera del Mercado Mayorista */}
        <div className="between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div>
            <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Red de Productores NORTIA</span>
              <Star4Point size={10} color="var(--navy)" />
              <span className="pill pill-green">Directo sin intermediarios</span>
            </div>
            <div className="h1" style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900 }}>
              Mercado Mayorista de Productores
            </div>
          </div>

          {/* Toggle de Pestañas: Catálogo vs Mis Pedidos */}
          <div style={{ display: 'inline-flex', background: 'var(--navy-tint)', padding: 3, borderRadius: 12, border: '1px solid var(--navy-tint-2)' }}>
            <button
              type="button"
              onClick={() => setTab('catalogo')}
              style={{
                padding: '8px 16px',
                fontSize: 12.5,
                fontWeight: tab === 'catalogo' ? 800 : 600,
                background: tab === 'catalogo' ? 'var(--navy)' : 'transparent',
                color: tab === 'catalogo' ? '#FFFFFF' : 'var(--ink)',
                border: 'none',
                borderRadius: 9,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Catálogo ({productos.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('pedidos')}
              style={{
                padding: '8px 16px',
                fontSize: 12.5,
                fontWeight: tab === 'pedidos' ? 800 : 600,
                background: tab === 'pedidos' ? 'var(--navy)' : 'transparent',
                color: tab === 'pedidos' ? '#FFFFFF' : 'var(--ink)',
                border: 'none',
                borderRadius: 9,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Mis Compras ({pedidos.length})
            </button>
          </div>
        </div>

        {tab === 'catalogo' ? (
          <div>
            {/* Barra de Búsqueda y Filtros */}
            <div
              className="glow-card"
              style={{
                padding: '10px 14px',
                marginBottom: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Buscar producto, proveedor o comuna (ej. Palta, Cemento, Quillota)…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: 10,
                      border: '1px solid var(--line)',
                      fontSize: 12.5,
                      background: 'var(--card-glass-bg)',
                      color: 'var(--ink)',
                    }}
                  />
                  <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)' }}>
                    <Icon name="search" size={14} />
                  </div>
                </div>

                <button
                  type="button"
                  className={`chip ${filtroFrio ? 'on' : ''}`}
                  onClick={() => setFiltroFrio(!filtroFrio)}
                  style={{ flexShrink: 0, padding: '7px 11px', fontSize: 11.5 }}
                >
                  <span>❄️ Solo Frío</span>
                </button>
              </div>

              {/* Categorías en Carrusel Horizontal */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  paddingBottom: 2,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <button
                  type="button"
                  className={`chip ${categoriaSeleccionada === 'todas' ? 'on' : ''}`}
                  onClick={() => setCategoriaSeleccionada('todas')}
                  style={{ padding: '5px 10px', fontSize: 11 }}
                >
                  Todos los Rubros
                </button>
                {CATEGORIAS_B2B.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`chip ${categoriaSeleccionada === cat.id ? 'on' : ''}`}
                    onClick={() => setCategoriaSeleccionada(cat.id)}
                    style={{ padding: '5px 10px', fontSize: 11, whiteSpace: 'nowrap' }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Productos en Grilla Adaptable */}
            {productosFiltrados.length === 0 ? (
              <div className="glow-card" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px', color: 'var(--ink)' }}>
                  No hay productos que coincidan con tus filtros
                </h4>
                <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 12px' }}>
                  Prueba seleccionando otra categoría o limpiando la barra de búsqueda.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setCategoriaSeleccionada('todas')
                    setBusqueda('')
                    setFiltroFrio(false)
                  }}
                  style={{ padding: '6px 14px', fontSize: 12 }}
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 12,
                }}
              >
                {productosFiltrados.map((prod) => (
                  <div
                    key={prod.id}
                    className="glow-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 14,
                      padding: 12,
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div>
                      {/* Imagen o Banner Visual */}
                      <div
                        style={{
                          height: 120,
                          borderRadius: 10,
                          backgroundImage: `url(${prod.fotoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                          marginBottom: 10,
                        }}
                      >
                        <span
                          className="pill"
                          style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            background: 'rgba(7, 14, 27, 0.75)',
                            color: '#FFFFFF',
                            backdropFilter: 'blur(8px)',
                            fontSize: 9.5,
                          }}
                        >
                          {prod.categoriaLabel}
                        </span>
                        {prod.requiereFrio && (
                          <span
                            className="pill"
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              background: 'rgba(2, 132, 199, 0.9)',
                              color: '#FFFFFF',
                              fontSize: 9.5,
                            }}
                          >
                            ❄️ {prod.temperaturaC ?? 4}°C
                          </span>
                        )}
                      </div>

                      {/* Título & Proveedor */}
                      <div style={{ marginBottom: 8 }}>
                        <h4
                          style={{
                            margin: '0 0 4px',
                            fontSize: 15,
                            fontWeight: 900,
                            color: 'var(--ink)',
                            lineHeight: 1.3,
                          }}
                        >
                          {prod.titulo}
                        </h4>
                        <div style={{ fontSize: 12, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🏢 {prod.proveedorNombre}</span>
                          <span>· ⭐ {prod.proveedorRating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Ubicación de Retiro */}
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="pin" size={13} color="var(--navy)" />
                        <span>Bodega: {prod.origenComuna} ({regionNames[prod.origenRegion] || 'Chile'})</span>
                      </div>
                    </div>

                    {/* Precios & Botón de Compra */}
                    <div style={{ paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                      <div className="between" style={{ alignItems: 'flex-end', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 10.5, color: '#0369A1', textTransform: 'uppercase', fontWeight: 800 }}>
                            Precio Mayorista
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: '#070E1B', letterSpacing: -0.3 }}>
                            ${prod.precioUnitarioClp.toLocaleString('es-CL')}{' '}
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--slate)' }}>
                              / {prod.unidadMedida}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 800 }}>
                            Mínimo: {prod.pedidoMinimo} {prod.unidadMedida}s
                          </span>
                          <div style={{ fontSize: 10.5, color: 'var(--slate)' }}>
                            Stock: {prod.stockDisponible} disp.
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setProductoParaComprar(prod)}
                        style={{
                          width: '100%',
                          height: 46,
                          padding: '0 14px',
                          fontSize: 13.5,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: 'pointer',
                        }}
                      >
                        <Icon name="truck" size={16} strokeWidth={2.2} />
                        <span>Ver y Comprar con Flete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Pestaña: Mis Pedidos de Compra B2B */
          <div>
            {pedidos.length === 0 ? (
              <div className="glow-card" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px', color: 'var(--ink)' }}>
                  Aún no tienes pedidos de compra B2B
                </h4>
                <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px' }}>
                  Explora el catálogo de productores mayoristas y adquiere insumos con flete garantizado.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setTab('catalogo')}
                  style={{ padding: '8px 16px', fontSize: 12 }}
                >
                  Explorar Catálogo Mayorista
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pedidos.map((ped) => (
                  <div
                    key={ped.id}
                    className="glow-card"
                    style={{
                      borderRadius: 14,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div className="between" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span className="pill pill-green" style={{ fontSize: 9.5 }}>
                            {ped.estado === 'confirmado' ? 'Flete en Radar' : ped.estado}
                          </span>
                          <span style={{ fontSize: 10.5, color: 'var(--slate)' }}>
                            {new Date(ped.fechaCreacion).toLocaleDateString('es-CL')}
                          </span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>
                          {ped.cantidad} {ped.unidadMedida}s de {ped.productoTitulo}
                        </h4>
                        <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>
                          Proveedor: <strong style={{ color: 'var(--ink)' }}>{ped.proveedorNombre}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: 'var(--slate)', fontWeight: 700 }}>Total Escrow</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--navy)' }}>
                          ${ped.totalPedidoClp.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </div>

                    {/* Ruta y Flete */}
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        background: 'var(--paper-2)',
                        border: '1px solid var(--line)',
                        fontSize: 11.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="truck" size={13} color="var(--navy)" />
                        <span>
                          {ped.origenComuna} ➔ {ped.destinoComuna} ({(ped.pesoTotalKg / 1000).toFixed(1)} Ton)
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--slate)' }}>
                        Flete: ${ped.costoFleteEstimadoClp.toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Compra */}
        {productoParaComprar && (
          <ComprarProductoModal
            producto={productoParaComprar}
            onClose={() => setProductoParaComprar(null)}
            onSuccess={() => {
              cargarDatos()
              setTab('pedidos')
            }}
          />
        )}
      </div>
    </WebPlatformLayout>
  )
}
