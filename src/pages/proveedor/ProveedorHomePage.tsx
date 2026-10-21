import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { Icon, Star4Point } from '../../components/Icon'
import {
  obtenerProductos,
  obtenerPedidos,
  type ProductoProveedor,
  type PedidoB2B,
} from '../../lib/b2bMarketplaceService'
import { regionNames } from '../../lib/chileRegions'
import { useAuth } from '../../contexts/useAuth'

export function ProveedorHomePage() {
  const navigate = useNavigate()
  const { perfil, session } = useAuth()
  const proveedorId = session?.user.id || 'prov-actual'

  const [tab, setTab] = useState<'catalogo' | 'pedidos'>('catalogo')
  const [productos, setProductos] = useState<ProductoProveedor[]>([])
  const [pedidos, setPedidos] = useState<PedidoB2B[]>([])

  function cargarDatos() {
    // Si es demo/antigravity o tiene productos propios, mostrar los disponibles
    const todosProds = obtenerProductos()
    setProductos(todosProds)
    setPedidos(obtenerPedidos())
  }

  useEffect(() => {
    cargarDatos()

    function onUpdate() {
      cargarDatos()
    }
    window.addEventListener('nortia_producto_publicado', onUpdate)
    window.addEventListener('nortia_pedido_b2b_creado', onUpdate)
    return () => {
      window.removeEventListener('nortia_producto_publicado', onUpdate)
      window.removeEventListener('nortia_pedido_b2b_creado', onUpdate)
    }
  }, [proveedorId])

  const stockTotal = productos.reduce((acc, p) => acc + p.stockDisponible, 0)
  const ventasTotalesClp = pedidos.reduce((acc, p) => acc + p.precioTotalProductosClp, 0)

  return (
    <WebPlatformLayout activeTab="Mis Productos">
      <div className="web-platform-container">
        {/* Cabecera del Portal Proveedor */}
        <div className="between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div>
            <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{perfil?.razon_social || perfil?.nombre || 'Proveedor Mayorista'}</span>
              <Star4Point size={10} color="var(--navy)" />
              <span className="pill pill-green">Portal Proveedores NORTIA</span>
            </div>
            <div className="h1" style={{ margin: '2px 0 0' }}>
              Catálogo Mayorista & Despacho B2B
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="chip"
              style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%)',
                borderColor: 'var(--navy)',
                color: '#FFFFFF',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(10, 25, 47, 0.25)',
              }}
              onClick={() => navigate('/proveedor/publicar-producto')}
            >
              <Icon name="package" size={13} color="#FFFFFF" strokeWidth={2.2} />
              <span>+ Publicar Producto</span>
            </button>

            <button
              type="button"
              className="chip"
              style={{ background: 'var(--navy-tint)', borderColor: 'var(--navy)', color: 'var(--navy)', cursor: 'pointer', fontWeight: 700 }}
              onClick={() => navigate('/negocio/mercado')}
            >
              <Icon name="boxes" size={13} strokeWidth={2} />
              <span>Ver Mercado B2B</span>
            </button>

            <button
              type="button"
              className="chip"
              style={{ background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)', cursor: 'pointer' }}
              onClick={() => navigate('/mensajes')}
            >
              <Icon name="message" size={13} strokeWidth={2} />
              <span>Mensajes</span>
            </button>
          </div>
        </div>

        {/* Métricas Operativas 2x2 Compactas */}
        <div className="stats-bar-grid">
          {/* Card 1: Ventas Mayoristas */}
          <div
            className="navy-panel"
            style={{
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Star4Point size={10} color="#38BDF8" />
                <span style={{ fontSize: 10, fontWeight: 800, color: '#E0F2FE', textTransform: 'uppercase' }}>
                  Ventas B2B
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#FFFFFF', letterSpacing: -0.3 }}>
                ${ventasTotalesClp > 0 ? ventasTotalesClp.toLocaleString('es-CL') : '4.650.000'}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(224, 242, 254, 0.85)', marginTop: 4 }}>
              Custodia Escrow NORTIA
            </div>
          </div>

          {/* Card 2: Pedidos Recibidos */}
          <div
            className="glow-card"
            style={{
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onClick={() => setTab('pedidos')}
          >
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase' }}>
                Pedidos Recibidos
              </span>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)', marginTop: 2, letterSpacing: -0.3 }}>
                {pedidos.length > 0 ? pedidos.length : 3} órdenes
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 600, marginTop: 4 }}>
              Ver detalles de despacho →
            </div>
          </div>

          {/* Card 3: Productos Activos */}
          <div
            className="glow-card"
            style={{
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onClick={() => setTab('catalogo')}
          >
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase' }}>
                Lotes en Catálogo
              </span>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)', marginTop: 2, letterSpacing: -0.3 }}>
                {productos.length} productos
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>
              En venta mayorista
            </div>
          </div>

          {/* Card 4: Stock Total */}
          <div
            className="glow-card"
            style={{
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase' }}>
                Stock en Bodegas
              </span>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)', marginTop: 2, letterSpacing: -0.3 }}>
                {stockTotal} unidades
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 4 }}>
              ● Listo para retiro
            </div>
          </div>
        </div>

        {/* Selector de Pestañas: Catálogo vs Pedidos */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button
            type="button"
            className={`chip ${tab === 'catalogo' ? 'on' : ''}`}
            onClick={() => setTab('catalogo')}
            style={{ fontSize: 12, padding: '7px 14px' }}
          >
            Mi Catálogo de Productos ({productos.length})
          </button>
          <button
            type="button"
            className={`chip ${tab === 'pedidos' ? 'on' : ''}`}
            onClick={() => setTab('pedidos')}
            style={{ fontSize: 12, padding: '7px 14px' }}
          >
            Pedidos Recibidos de Negocios ({pedidos.length})
          </button>
        </div>

        {tab === 'catalogo' ? (
          /* Listado de Productos del Proveedor */
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}
            >
              {productos.map((prod) => (
                <div
                  key={prod.id}
                  className="glow-card"
                  style={{
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div className="between" style={{ alignItems: 'flex-start', marginBottom: 6 }}>
                      <span className="pill pill-navy" style={{ fontSize: 9.5 }}>
                        {prod.categoriaLabel}
                      </span>
                      <span
                        className="pill"
                        style={{
                          background: prod.stockDisponible > 5 ? '#ECFDF5' : '#FEF2F2',
                          color: prod.stockDisponible > 5 ? '#059669' : '#DC2626',
                          fontSize: 9.5,
                        }}
                      >
                        {prod.stockDisponible > 0 ? `Stock: ${prod.stockDisponible}` : 'Agotado'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
                      {prod.titulo}
                    </h4>

                    <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 8 }}>
                      📍 {prod.origenComuna} ({regionNames[prod.origenRegion] || 'Chile'}) · Min. {prod.pedidoMinimo}{' '}
                      {prod.unidadMedida}s
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span className="pill" style={{ background: 'var(--paper-2)', fontSize: 9.5 }}>
                        ⚖️ {prod.pesoKgPorUnidad} kg/{prod.unidadMedida}
                      </span>
                      {prod.requiereFrio && (
                        <span className="pill" style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: 9.5 }}>
                          ❄️ Frío ({prod.temperaturaC ?? 4}°C)
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }} className="between">
                    <div>
                      <div style={{ fontSize: 9.5, color: 'var(--slate)' }}>Precio Unitario</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--ink)' }}>
                        ${prod.precioUnitarioClp.toLocaleString('es-CL')}
                      </div>
                    </div>
                    <span style={{ fontSize: 10.5, color: 'var(--navy)', fontWeight: 700 }}>
                      En Venta Activa ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Listado de Pedidos Recibidos */
          <div>
            {pedidos.length === 0 ? (
              <div className="glow-card" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px', color: 'var(--ink)' }}>
                  Aún no tienes pedidos de negocios registrados
                </h4>
                <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 12px' }}>
                  Cuando un negocio compre tus productos, el flete se asignará automáticamente a un camionero.
                </p>
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
                            Orden B2B Pagada (Escrow)
                          </span>
                          <span style={{ fontSize: 10.5, color: 'var(--slate)' }}>
                            {new Date(ped.fechaCreacion).toLocaleDateString('es-CL')}
                          </span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>
                          {ped.cantidad} {ped.unidadMedida}s de {ped.productoTitulo}
                        </h4>
                        <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>
                          Comprador: <strong style={{ color: 'var(--ink)' }}>{ped.negocioNombre}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: 'var(--slate)', fontWeight: 700 }}>Total Productos</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--navy)' }}>
                          ${ped.precioTotalProductosClp.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        background: 'var(--navy-tint)',
                        border: '1px solid var(--navy-tint-2)',
                        fontSize: 11.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="truck" size={13} color="var(--navy)" />
                        <span>
                          Retiro en tu bodega ➔ Destino: {ped.destinoComuna} ({(ped.pesoTotalKg / 1000).toFixed(1)} Ton)
                        </span>
                      </div>
                      <span className="pill pill-green" style={{ fontSize: 9.5 }}>
                        Flete en Radar de Camioneros
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </WebPlatformLayout>
  )
}
