import { useState } from 'react'
import { Icon, Star4Point } from './Icon'
import {
  type ProductoProveedor,
  calcularCostoFleteEstimado,
  crearPedidoB2B,
} from '../lib/b2bMarketplaceService'
import { regionNames, regionOrder } from '../lib/chileRegions'
import { useAuth } from '../contexts/useAuth'

interface ComprarProductoModalProps {
  producto: ProductoProveedor
  onClose: () => void
  onSuccess?: () => void
}

export function ComprarProductoModal({ producto, onClose, onSuccess }: ComprarProductoModalProps) {
  const { perfil, session } = useAuth()
  const [cantidad, setCantidad] = useState(producto.pedidoMinimo)
  const [destinoRegion, setDestinoRegion] = useState(13) // RM default
  const [destinoComuna, setDestinoComuna] = useState('Santiago')
  const [destinoDireccion, setDestinoDireccion] = useState('Av. Los Conquistadores 2100')
  const [loading, setLoading] = useState(false)
  const [completado, setCompletado] = useState(false)

  const negocioId = session?.user.id || 'negocio-demo'
  const negocioNombre = perfil?.razon_social || perfil?.nombre || 'Mi Negocio NORTIA'

  const subtotalProductos = producto.precioUnitarioClp * cantidad
  const pesoTotalKg = producto.pesoKgPorUnidad * cantidad
  const fleteEstimado = calcularCostoFleteEstimado(
    producto.origenRegion,
    destinoRegion,
    pesoTotalKg,
    producto.requiereFrio
  )
  const totalConFlete = subtotalProductos + fleteEstimado

  async function handleConfirmarCompra() {
    setLoading(true)
    try {
      await crearPedidoB2B({
        producto,
        negocioId,
        negocioNombre,
        cantidad,
        destinoComuna,
        destinoRegion,
        destinoDireccion,
      })
      setCompletado(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1900)
    } catch (err) {
      console.error('Error al procesar compra:', err)
      setLoading(false)
    }
  }

  return (
    <div className="apple-modal-overlay" onClick={onClose}>
      <div
        className="apple-modal-sheet"
        style={{
          maxWidth: 460,
          width: '100%',
          padding: '22px 20px 24px',
          borderRadius: 24,
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Limpia: Título y Botón Cerrar */}
        <div className="between" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#265370',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Venta Mayorista Directa · {producto.categoriaLabel}
            </span>
            <h2
              style={{
                margin: '4px 0 0',
                fontSize: 18,
                fontWeight: 900,
                color: 'var(--ink)',
                lineHeight: 1.3,
                letterSpacing: -0.3,
              }}
            >
              {producto.titulo}
            </h2>
          </div>
          <button
            type="button"
            className="chip"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={onClose}
            aria-label="Cerrar ventana"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {completado ? (
          <div style={{ textAlign: 'center', padding: '32px 14px' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Icon name="check" size={32} strokeWidth={3} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 8px', color: 'var(--ink)' }}>
              ¡Tu Pedido y Flete Están Confirmados!
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--slate)', margin: 0, lineHeight: 1.5 }}>
              Tu pago queda <b>100% protegido con Garantía NORTIA</b>. Ya despachamos la orden al radar
              de transportistas para que retiren la carga en bodega y te la entreguen en tu local.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. Información del Vendedor */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: 'var(--navy-tint)',
                border: '1px solid var(--navy-tint-2)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
                  🏢 {producto.proveedorNombre}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                  Bodega en {producto.origenComuna} ({regionNames[producto.origenRegion]}) · ⭐ {producto.proveedorRating.toFixed(1)}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: '#059669',
                  background: '#ECFDF5',
                  padding: '4px 8px',
                  borderRadius: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                ✓ Verificado
              </span>
            </div>

            {/* 2. Selector de Cantidad Grande y Táctil (Fácil de usar para adultos mayores) */}
            <div style={{ marginBottom: 16 }}>
              <div className="between" style={{ marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
                  ¿Cuántos {producto.unidadMedida}s necesitas?
                </span>
                <span style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 800 }}>
                  ${producto.precioUnitarioClp.toLocaleString('es-CL')} c/u
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCantidad(Math.max(producto.pedidoMinimo, cantidad - 1))}
                  disabled={cantidad <= producto.pedidoMinimo}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    border: '1.5px solid var(--line)',
                    background: 'var(--card-glass-bg)',
                    fontSize: 22,
                    fontWeight: 900,
                    color: cantidad <= producto.pedidoMinimo ? 'var(--slate-light)' : 'var(--ink)',
                    cursor: cantidad <= producto.pedidoMinimo ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  title="Disminuir cantidad"
                >
                  –
                </button>

                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    background: 'var(--card-glass-bg)',
                    border: '1.5px solid var(--card-glass-border)',
                    padding: '8px 12px',
                    borderRadius: 14,
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)' }}>
                    {cantidad} {producto.unidadMedida}{cantidad > 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--slate)', fontWeight: 600 }}>
                    Equivale a {(pesoTotalKg / 1000).toFixed(1)} Toneladas de carga
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCantidad(Math.min(producto.stockDisponible, cantidad + 1))}
                  disabled={cantidad >= producto.stockDisponible}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    border: '1.5px solid var(--navy)',
                    background: 'var(--navy-tint)',
                    fontSize: 22,
                    fontWeight: 900,
                    color: 'var(--navy)',
                    cursor: cantidad >= producto.stockDisponible ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  title="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4, textAlign: 'right' }}>
                Stock disponible: {producto.stockDisponible} {producto.unidadMedida}s · Pedido mínimo: {producto.pedidoMinimo}
              </div>
            </div>

            {/* 3. Destino de Entrega (Tu Local / Bodega) */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
                📍 ¿Dónde recibes tu pedido? (Local o Bodega)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <select
                  value={destinoRegion}
                  onChange={(e) => setDestinoRegion(Number(e.target.value))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1.5px solid var(--line)',
                    fontSize: 13,
                    fontWeight: 600,
                    background: 'var(--card-glass-bg)',
                    color: 'var(--ink)',
                    outline: 'none',
                  }}
                  aria-label="Región de entrega"
                >
                  {regionOrder.map((cod) => (
                    <option key={cod} value={cod}>
                      {regionNames[cod]}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Comuna (ej. Santiago)"
                  value={destinoComuna}
                  onChange={(e) => setDestinoComuna(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1.5px solid var(--line)',
                    fontSize: 13,
                    background: 'var(--card-glass-bg)',
                    color: 'var(--ink)',
                    outline: 'none',
                  }}
                  aria-label="Comuna de entrega"
                />
              </div>

              <input
                type="text"
                placeholder="Dirección exacta (ej. Av. Los Conquistadores 2100)"
                value={destinoDireccion}
                onChange={(e) => setDestinoDireccion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1.5px solid var(--line)',
                  fontSize: 13,
                  background: 'var(--card-glass-bg)',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
                aria-label="Dirección de entrega"
              />

              {/* Nota de transporte amigable */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 6,
                  fontSize: 11.5,
                  color: 'var(--slate)',
                }}
              >
                <span>🚚 Incluye transporte con {producto.requiereRampa ? 'rampa para descarga fácil' : 'chofer calificado'}</span>
                {producto.requiereFrio && (
                  <span style={{ color: '#265370', fontWeight: 700 }}>· ❄️ Reefer Frío</span>
                )}
              </div>
            </div>

            {/* 4. LO CRUCIAL: Resumen Transparente y Total a Pagar en Grande */}
            <div
              style={{
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(38, 83, 112, 0.08) 0%, rgba(10, 25, 47, 0.05) 100%)',
                border: '2px solid rgba(38, 83, 112, 0.25)',
                padding: '16px 18px',
                marginBottom: 16,
              }}
            >
              {/* Desglose Transparente */}
              <div className="between" style={{ fontSize: 12.5, color: 'var(--slate)', marginBottom: 5 }}>
                <span>Productos ({cantidad} {producto.unidadMedida}{cantidad > 1 ? 's' : ''})</span>
                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                  ${subtotalProductos.toLocaleString('es-CL')}
                </span>
              </div>

              <div className="between" style={{ fontSize: 12.5, color: 'var(--slate)', marginBottom: 10 }}>
                <span>Flete NORTIA con Seguro a tu local</span>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
                  + ${fleteEstimado.toLocaleString('es-CL')}
                </span>
              </div>

              {/* Cifra Reina: TOTAL A PAGAR EN GIGANTE */}
              <div
                className="between"
                style={{
                  paddingTop: 10,
                  borderTop: '1.5px dashed rgba(100, 116, 139, 0.3)',
                  alignItems: 'flex-end',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#1C3E54', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Total Final con Flete Incluido
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#070E1B', letterSpacing: -0.5, marginTop: 2 }}>
                    ${totalConFlete.toLocaleString('es-CL')}{' '}
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate)' }}>CLP</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: '#059669', fontWeight: 800 }}>
                  ✓ Sin cobros sorpresa
                </div>
              </div>
            </div>

            {/* Mensaje de Garantía Humano y Tranquilizador */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 14,
                padding: '10px 14px',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 18 }}>🛡️</span>
              <div style={{ fontSize: 12, color: '#065F46', lineHeight: 1.45 }}>
                <b>Tu dinero está 100% protegido con Garantía NORTIA:</b> No se le paga al vendedor hasta que
                el camión llegue a tu local y tú revises conforme tu pedido.
              </div>
            </div>

            {/* 5. Gran Botón de Acción Principal (56px de alto, toque seguro e inequívoco) */}
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={handleConfirmarCompra}
              style={{
                width: '100%',
                height: 56,
                padding: '0 20px',
                borderRadius: 18,
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: -0.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #265370 0%, #1C3E54 100%)',
                boxShadow: '0 8px 24px -4px rgba(38, 83, 112, 0.45)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <Star4Point size={16} color="#FFFFFF" />
              <span>
                {loading
                  ? 'Confirmando Pedido y Flete Seguro…'
                  : `CONFIRMAR Y PAGAR $${totalConFlete.toLocaleString('es-CL')}`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
