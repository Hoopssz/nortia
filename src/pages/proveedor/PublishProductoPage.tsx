import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { Star4Point } from '../../components/Icon'
import {
  publicarProducto,
  CATEGORIAS_B2B,
  type CategoriaProductoB2B,
  type UnidadMedidaB2B,
} from '../../lib/b2bMarketplaceService'
import { regionNames, regionOrder } from '../../lib/chileRegions'
import { useAuth } from '../../contexts/useAuth'

const UNIDADES: UnidadMedidaB2B[] = ['Pallet', 'Caja', 'Tonelada', 'Saco', 'Tambor', 'Unidad']

export function PublishProductoPage() {
  const navigate = useNavigate()
  const { perfil, session } = useAuth()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState<CategoriaProductoB2B>('agro')
  const [unidadMedida, setUnidadMedida] = useState<UnidadMedidaB2B>('Pallet')
  const [precioUnitarioClp, setPrecioUnitarioClp] = useState(1200000)
  const [stockDisponible, setStockDisponible] = useState(20)
  const [pedidoMinimo, setPedidoMinimo] = useState(2)
  const [origenRegion, setOrigenRegion] = useState(5) // Valparaíso
  const [origenComuna, setOrigenComuna] = useState('Quillota')
  const [origenDireccion, setOrigenDireccion] = useState('Camino Troncal 450, Bodega 3')
  const [pesoKgPorUnidad, setPesoKgPorUnidad] = useState(850)
  const [volumenM3PorUnidad, setVolumenM3PorUnidad] = useState(1.5)
  const [requiereFrio, setRequiereFrio] = useState(false)
  const [temperaturaC, setTemperaturaC] = useState(4)
  const [requiereRampa, setRequiereRampa] = useState(true)
  const [fotoUrl, setFotoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!titulo.trim()) {
      setError('Por favor indica un título para el producto.')
      return
    }
    if (precioUnitarioClp <= 0) {
      setError('El precio unitario debe ser mayor a 0.')
      return
    }

    setSubmitting(true)
    try {
      const catObj = CATEGORIAS_B2B.find((c) => c.id === categoria)
      const proveedorId = session?.user.id || 'prov-actual'
      const proveedorNombre = perfil?.razon_social || perfil?.nombre || 'Mi Bodega Proveedora'
      const proveedorRut = perfil?.rut || '76.123.456-7'

      publicarProducto({
        proveedorId,
        proveedorNombre,
        proveedorRut,
        proveedorRating: perfil?.rating_prom || 5.0,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        categoriaLabel: catObj?.label || 'General',
        unidadMedida,
        precioUnitarioClp: Number(precioUnitarioClp),
        stockDisponible: Number(stockDisponible),
        pedidoMinimo: Number(pedidoMinimo),
        origenComuna: origenComuna.trim(),
        origenRegion: Number(origenRegion),
        origenDireccion: origenDireccion.trim(),
        pesoKgPorUnidad: Number(pesoKgPorUnidad),
        volumenM3PorUnidad: Number(volumenM3PorUnidad),
        requiereFrio,
        requiereRampa,
        temperaturaC: requiereFrio ? Number(temperaturaC) : undefined,
        fotoUrl: fotoUrl.trim() || undefined,
      })

      navigate('/proveedor')
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el producto. Inténtalo de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <WebPlatformLayout activeTab="Publicar Producto">
      <div className="web-platform-container" style={{ maxWidth: 740 }}>
        {/* Cabecera */}
        <div style={{ marginBottom: 14 }}>
          <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Portal Proveedores</span>
            <Star4Point size={10} color="var(--navy)" />
            <span className="pill pill-navy">Nuevo Catálogo Mayorista</span>
          </div>
          <div className="h1" style={{ margin: '2px 0 0' }}>
            Publicar Producto en Mercado B2B
          </div>
          <div className="sub" style={{ margin: '2px 0 12px' }}>
            Conecta tu lote o producción con cientos de negocios compradores y flete coordinado.
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              fontSize: 12.5,
              marginBottom: 12,
              border: '1px solid var(--danger)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glow-card" style={{ padding: '16px 18px', borderRadius: 14 }}>
          {/* Título y Categoría */}
          <div className="field">
            <label>Título del Producto o Lote Mayorista *</label>
            <input
              type="text"
              placeholder="Ej. Pallets de Palta Hass Calibre 1 Selección"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label>Categoría / Rubro *</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaProductoB2B)}>
                {CATEGORIAS_B2B.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Unidad de Venta *</label>
              <select value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value as UnidadMedidaB2B)}>
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precios y Cantidades */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div className="field">
              <label>Precio Unitario (CLP) *</label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={precioUnitarioClp}
                onChange={(e) => setPrecioUnitarioClp(Number(e.target.value))}
                required
              />
            </div>

            <div className="field">
              <label>Stock Disponible ({unidadMedida}s) *</label>
              <input
                type="number"
                min={1}
                value={stockDisponible}
                onChange={(e) => setStockDisponible(Number(e.target.value))}
                required
              />
            </div>

            <div className="field">
              <label>Pedido Mínimo ({unidadMedida}s) *</label>
              <input
                type="number"
                min={1}
                value={pedidoMinimo}
                onChange={(e) => setPedidoMinimo(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Ubicación de Bodega de Retiro */}
          <div style={{ margin: '14px 0 10px', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              📍 Bodega de Retiro (Dónde el camionero recogerá la carga)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Región de Origen *</label>
                <select value={origenRegion} onChange={(e) => setOrigenRegion(Number(e.target.value))}>
                  {regionOrder.map((cod) => (
                    <option key={cod} value={cod}>
                      {regionNames[cod]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Comuna *</label>
                <input
                  type="text"
                  placeholder="Ej. Quillota, Buin, Curicó"
                  value={origenComuna}
                  onChange={(e) => setOrigenComuna(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Dirección exacta o Parque Industrial</label>
              <input
                type="text"
                placeholder="Ej. Av. Los Paltos 340, Módulo 4B"
                value={origenDireccion}
                onChange={(e) => setOrigenDireccion(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Parámetros de Transporte y Ficha Logística */}
          <div style={{ margin: '14px 0 10px', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              🚚 Ficha de Transporte para Camioneros (Calce Automático)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Peso por {unidadMedida} (kg) *</label>
                <input
                  type="number"
                  min={1}
                  value={pesoKgPorUnidad}
                  onChange={(e) => setPesoKgPorUnidad(Number(e.target.value))}
                  required
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Volumen por {unidadMedida} (m³)</label>
                <input
                  type="number"
                  step={0.1}
                  min={0.1}
                  value={volumenM3PorUnidad}
                  onChange={(e) => setVolumenM3PorUnidad(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Requisitos de Frío y Rampa */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={requiereFrio}
                  onChange={(e) => setRequiereFrio(e.target.checked)}
                />
                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>❄️ Requiere Camión Frigorífico (Reefer)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={requiereRampa}
                  onChange={(e) => setRequiereRampa(e.target.checked)}
                />
                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>📦 Requiere Rampa / Transpaleta</span>
              </label>
            </div>

            {requiereFrio && (
              <div style={{ marginTop: 8, maxWidth: 200 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)' }}>Temperatura requerida (°C)</label>
                <input
                  type="number"
                  value={temperaturaC}
                  onChange={(e) => setTemperaturaC(Number(e.target.value))}
                  style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12 }}
                />
              </div>
            )}
          </div>

          {/* URL de Foto / Ilustración */}
          <div className="field" style={{ marginTop: 12 }}>
            <label>URL de Foto del Producto (Opcional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/…"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div className="field">
            <label>Descripción y Condiciones de Venta Mayorista</label>
            <textarea
              rows={3}
              placeholder="Detalla calibres, embalaje, condiciones de carga en andén, horarios de retiro…"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Botón Guardar */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/proveedor')}
              style={{ flex: 1, padding: '11px 14px', fontSize: 13 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 2, padding: '11px 14px', fontSize: 13 }}
            >
              <Star4Point size={14} color="#FFFFFF" />
              <span>{submitting ? 'Publicando…' : 'Publicar Producto en Mercado B2B'}</span>
            </button>
          </div>
        </form>
      </div>
    </WebPlatformLayout>
  )
}
