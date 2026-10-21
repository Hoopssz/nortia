/**
 * Servicio del Mercado B2B NORTIA
 * Conecta Proveedores (productores/mayoristas) con Negocios (compradores)
 * y genera automáticamente cargas de flete para los Camioneros.
 */

import { supabase } from './supabase'

export type CategoriaProductoB2B =
  | 'agro'
  | 'construccion'
  | 'alimentos'
  | 'bebidas'
  | 'congelados'
  | 'industrial'

export type UnidadMedidaB2B = 'Pallet' | 'Caja' | 'Tonelada' | 'Saco' | 'Tambor' | 'Unidad'

export interface ProductoProveedor {
  id: string
  proveedorId: string
  proveedorNombre: string
  proveedorRut: string
  proveedorRating: number
  titulo: string
  descripcion: string
  categoria: CategoriaProductoB2B
  categoriaLabel: string
  unidadMedida: UnidadMedidaB2B
  precioUnitarioClp: number
  stockDisponible: number
  pedidoMinimo: number
  origenComuna: string
  origenRegion: number
  origenDireccion: string
  pesoKgPorUnidad: number
  volumenM3PorUnidad: number
  requiereFrio: boolean
  requiereRampa: boolean
  temperaturaC?: number
  fotoUrl?: string
  fechaPublicacion: string
  activo: boolean
}

export interface PedidoB2B {
  id: string
  productoId: string
  productoTitulo: string
  proveedorId: string
  proveedorNombre: string
  negocioId: string
  negocioNombre: string
  cantidad: number
  unidadMedida: UnidadMedidaB2B
  precioUnitarioClp: number
  precioTotalProductosClp: number
  costoFleteEstimadoClp: number
  totalPedidoClp: number
  origenComuna: string
  origenRegion: number
  origenDireccion: string
  destinoComuna: string
  destinoRegion: number
  destinoDireccion: string
  pesoTotalKg: number
  requiereFrio: boolean
  requiereRampa: boolean
  estado: 'pendiente' | 'confirmado' | 'flete_asignado' | 'en_transito' | 'entregado'
  cargaId?: string
  camioneroNombre?: string
  camioneroPatente?: string
  fechaCreacion: string
}

const STORAGE_KEY_PRODUCTOS = 'nortia_b2b_productos'
const STORAGE_KEY_PEDIDOS = 'nortia_b2b_pedidos'

export const CATEGORIAS_B2B: { id: CategoriaProductoB2B; label: string; icon: string }[] = [
  { id: 'agro', label: 'Agro & Frutas', icon: '🥑' },
  { id: 'construccion', label: 'Construcción', icon: '🧱' },
  { id: 'alimentos', label: 'Abarrotes & Granos', icon: '🌾' },
  { id: 'bebidas', label: 'Vinos & Bebidas', icon: '🍷' },
  { id: 'congelados', label: 'Carnes & Congelados', icon: '❄️' },
  { id: 'industrial', label: 'Insumos Industriales', icon: '📦' },
]

// Productos iniciales precargados representativos de Chile
const PRODUCTOS_SEMILLA: ProductoProveedor[] = [
  {
    id: 'prod-001',
    proveedorId: 'prov-quillota',
    proveedorNombre: 'Agrícola Valle de Quillota SpA',
    proveedorRut: '76.452.120-4',
    proveedorRating: 4.9,
    titulo: 'Pallets de Palta Hass Calibre 1 Selección',
    descripcion: 'Paltas Hass frescas cosechadas en Quillota, listas para distribución o maduración en cámara.',
    categoria: 'agro',
    categoriaLabel: 'Agro & Frutas',
    unidadMedida: 'Pallet',
    precioUnitarioClp: 1850000,
    stockDisponible: 24,
    pedidoMinimo: 2,
    origenComuna: 'Quillota',
    origenRegion: 5,
    origenDireccion: 'Camino San Isidro Parcela 14, Quillota',
    pesoKgPorUnidad: 800,
    volumenM3PorUnidad: 1.6,
    requiereFrio: true,
    requiereRampa: true,
    temperaturaC: 6,
    fotoUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=60',
    fechaPublicacion: '2026-10-01T08:00:00Z',
    activo: true,
  },
  {
    id: 'prod-002',
    proveedorId: 'prov-curico',
    proveedorNombre: 'Frutícola Los Robles Curicó',
    proveedorRut: '77.812.340-9',
    proveedorRating: 4.8,
    titulo: 'Cajas de Manzana Cripps Pink (Pink Lady)',
    descripcion: 'Manzanas de exportación embaladas en cajas telescópicas de 18 kg netos con separadores alveolares.',
    categoria: 'agro',
    categoriaLabel: 'Agro & Frutas',
    unidadMedida: 'Pallet',
    precioUnitarioClp: 920000,
    stockDisponible: 40,
    pedidoMinimo: 4,
    origenComuna: 'Curicó',
    origenRegion: 7,
    origenDireccion: 'Ruta 5 Sur Km 189, Curicó',
    pesoKgPorUnidad: 900,
    volumenM3PorUnidad: 1.7,
    requiereFrio: true,
    requiereRampa: true,
    temperaturaC: 2,
    fotoUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60',
    fechaPublicacion: '2026-10-02T10:30:00Z',
    activo: true,
  },
  {
    id: 'prod-003',
    proveedorId: 'prov-polpaico',
    proveedorNombre: 'Distribuidora Central de Cemento & Áridos',
    proveedorRut: '76.991.002-1',
    proveedorRating: 5.0,
    titulo: 'Pallets Cemento Especial Melón / Polpaico (25 kg)',
    descripcion: 'Pallets retractilados de 40 sacos de 25 kg de cemento de alta resistencia para obras y barracas.',
    categoria: 'construccion',
    categoriaLabel: 'Construcción',
    unidadMedida: 'Pallet',
    precioUnitarioClp: 215000,
    stockDisponible: 80,
    pedidoMinimo: 6,
    origenComuna: 'Til Til',
    origenRegion: 13,
    origenDireccion: 'Planta Polpaico Km 38 Panamericana Norte',
    pesoKgPorUnidad: 1000,
    volumenM3PorUnidad: 1.2,
    requiereFrio: false,
    requiereRampa: true,
    fotoUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=500&auto=format&fit=crop&q=60',
    fechaPublicacion: '2026-10-03T12:00:00Z',
    activo: true,
  },
  {
    id: 'prod-004',
    proveedorId: 'prov-molinera',
    proveedorNombre: 'Molino & Abarrotes San Antonio SpA',
    proveedorRut: '78.109.870-K',
    proveedorRating: 4.7,
    titulo: 'Sacos de Harina Panadera Flor 000 (50 kg)',
    descripcion: 'Harina panadera enriquecida con gluten natural, ideal para panaderías industriales y distribuidoras.',
    categoria: 'alimentos',
    categoriaLabel: 'Abarrotes & Granos',
    unidadMedida: 'Tonelada',
    precioUnitarioClp: 540000,
    stockDisponible: 30,
    pedidoMinimo: 2,
    origenComuna: 'San Antonio',
    origenRegion: 5,
    origenDireccion: 'Av. Ramón Barros Luco 1250, San Antonio',
    pesoKgPorUnidad: 1000,
    volumenM3PorUnidad: 1.4,
    requiereFrio: false,
    requiereRampa: false,
    fotoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    fechaPublicacion: '2026-10-03T15:00:00Z',
    activo: true,
  },
  {
    id: 'prod-005',
    proveedorId: 'prov-maipo',
    proveedorNombre: 'Viñas & Bodegas del Valle del Maipo',
    proveedorRut: '76.882.114-3',
    proveedorRating: 4.9,
    titulo: 'Pallets Vino Cabernet Sauvignon Reserva (Cajas x12)',
    descripcion: 'Lotes de vino reserva valle central embotellado, estibado en pallets estándar madera tratada.',
    categoria: 'bebidas',
    categoriaLabel: 'Vinos & Bebidas',
    unidadMedida: 'Pallet',
    precioUnitarioClp: 1420000,
    stockDisponible: 18,
    pedidoMinimo: 1,
    origenComuna: 'Buin',
    origenRegion: 13,
    origenDireccion: 'Camino Los Morros 820, Buin',
    pesoKgPorUnidad: 820,
    volumenM3PorUnidad: 1.5,
    requiereFrio: false,
    requiereRampa: true,
    fotoUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=60',
    fechaPublicacion: '2026-10-04T09:00:00Z',
    activo: true,
  },
  {
    id: 'prod-006',
    proveedorId: 'prov-salmon',
    proveedorNombre: 'Austral Seafoods Puerto Montt',
    proveedorRut: '79.220.551-7',
    proveedorRating: 5.0,
    titulo: 'Filetes de Salmón Atlántico Congelado IQF Trim D',
    descripcion: 'Filetes congelados individualmente en cajas master de 10 kg con certificación Sernapesca.',
    categoria: 'congelados',
    categoriaLabel: 'Carnes & Congelados',
    unidadMedida: 'Tonelada',
    precioUnitarioClp: 7800000,
    stockDisponible: 12,
    pedidoMinimo: 1,
    origenComuna: 'Puerto Montt',
    origenRegion: 10,
    origenDireccion: 'Ruta Chinquihue Km 8, Puerto Montt',
    pesoKgPorUnidad: 1000,
    volumenM3PorUnidad: 1.8,
    requiereFrio: true,
    requiereRampa: true,
    temperaturaC: -18,
    fotoUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60',
    fechaPublicacion: '2026-10-04T16:00:00Z',
    activo: true,
  },
]

export function obtenerProductos(): ProductoProveedor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTOS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(PRODUCTOS_SEMILLA))
      return PRODUCTOS_SEMILLA
    }
    const parsed = JSON.parse(raw) as ProductoProveedor[]
    return parsed.filter((p) => p.activo)
  } catch {
    return PRODUCTOS_SEMILLA
  }
}

export function obtenerProductoPorId(id: string): ProductoProveedor | undefined {
  const productos = obtenerProductos()
  return productos.find((p) => p.id === id)
}

export function publicarProducto(
  datos: Omit<ProductoProveedor, 'id' | 'fechaPublicacion' | 'activo'>
): ProductoProveedor {
  const productos = obtenerProductos()
  const nuevo: ProductoProveedor = {
    ...datos,
    id: `prod-${Date.now()}`,
    fechaPublicacion: new Date().toISOString(),
    activo: true,
  }
  const actualizados = [nuevo, ...productos]
  localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(actualizados))
  window.dispatchEvent(new CustomEvent('nortia_producto_publicado', { detail: nuevo }))
  return nuevo
}

export function obtenerPedidos(): PedidoB2B[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PEDIDOS)
    if (!raw) return []
    return JSON.parse(raw) as PedidoB2B[]
  } catch {
    return []
  }
}

export function obtenerPedidosProveedor(proveedorId: string): PedidoB2B[] {
  const pedidos = obtenerPedidos()
  return pedidos.filter((p) => p.proveedorId === proveedorId)
}

export function obtenerPedidosNegocio(negocioId: string): PedidoB2B[] {
  const pedidos = obtenerPedidos()
  return pedidos.filter((p) => p.negocioId === negocioId)
}

/**
 * Estima el costo del flete según distancia aproximada regional y peso
 */
export function calcularCostoFleteEstimado(
  origenRegion: number,
  destinoRegion: number,
  pesoKg: number,
  requiereFrio: boolean
): number {
  const distanciaEstimadaKm =
    origenRegion === destinoRegion ? 45 : Math.abs(origenRegion - destinoRegion) * 110 + 70

  const costoKm = distanciaEstimadaKm * 850
  const factorPeso = Math.max(1, pesoKg / 2000) * 45000
  const recargoFrio = requiereFrio ? 60000 : 0

  const subtotal = 90000 + costoKm + factorPeso + recargoFrio
  return Math.round(subtotal / 1000) * 1000
}

/**
 * Crea una orden de compra B2B y AUTOMÁTICAMENTE crea la Carga de Flete
 * en NORTIA para que los camioneros la vean y postulen.
 */
export async function crearPedidoB2B(datos: {
  producto: ProductoProveedor
  negocioId: string
  negocioNombre: string
  cantidad: number
  destinoComuna: string
  destinoRegion: number
  destinoDireccion: string
}): Promise<PedidoB2B> {
  const { producto, negocioId, negocioNombre, cantidad, destinoComuna, destinoRegion, destinoDireccion } =
    datos

  const precioTotalProductosClp = producto.precioUnitarioClp * cantidad
  const pesoTotalKg = producto.pesoKgPorUnidad * cantidad
  const costoFleteEstimadoClp = calcularCostoFleteEstimado(
    producto.origenRegion,
    destinoRegion,
    pesoTotalKg,
    producto.requiereFrio
  )
  const totalPedidoClp = precioTotalProductosClp + costoFleteEstimadoClp

  const nuevoPedidoId = `ped-b2b-${Date.now()}`
  const cargaIdGenerada = `carga-b2b-${Date.now()}`

  const nuevoPedido: PedidoB2B = {
    id: nuevoPedidoId,
    productoId: producto.id,
    productoTitulo: producto.titulo,
    proveedorId: producto.proveedorId,
    proveedorNombre: producto.proveedorNombre,
    negocioId,
    negocioNombre,
    cantidad,
    unidadMedida: producto.unidadMedida,
    precioUnitarioClp: producto.precioUnitarioClp,
    precioTotalProductosClp,
    costoFleteEstimadoClp,
    totalPedidoClp,
    origenComuna: producto.origenComuna,
    origenRegion: producto.origenRegion,
    origenDireccion: producto.origenDireccion,
    destinoComuna,
    destinoRegion,
    destinoDireccion,
    pesoTotalKg,
    requiereFrio: producto.requiereFrio,
    requiereRampa: producto.requiereRampa,
    estado: 'confirmado',
    cargaId: cargaIdGenerada,
    fechaCreacion: new Date().toISOString(),
  }

  // 1. Guardar el pedido
  const pedidosExistentes = obtenerPedidos()
  localStorage.setItem(STORAGE_KEY_PEDIDOS, JSON.stringify([nuevoPedido, ...pedidosExistentes]))

  // 2. Descontar stock del producto
  const productos = obtenerProductos()
  const indexProd = productos.findIndex((p) => p.id === producto.id)
  if (indexProd !== -1) {
    productos[indexProd].stockDisponible = Math.max(0, productos[indexProd].stockDisponible - cantidad)
    localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(productos))
  }

  // 3. GENERAR AUTOMÁTICAMENTE LA CARGA EN NORTIA PARA LOS CAMIONEROS
  try {
    await supabase.from('cargas').insert({
      id: cargaIdGenerada,
      cliente_id: negocioId,
      origen_texto: `${producto.origenComuna}, Región ${producto.origenRegion}`,
      destino_texto: `${destinoComuna}, Región ${destinoRegion}`,
      origen_region: producto.origenRegion,
      destino_region: destinoRegion,
      peso_kg: pesoTotalKg,
      precio_referencia: costoFleteEstimadoClp,
      requiere_frio: producto.requiereFrio,
      requiere_rampa: producto.requiereRampa,
      requiere_grua: false,
      requiere_ayuda: false,
      tipo_carga: `B2B: ${cantidad} ${producto.unidadMedida} de ${producto.titulo}`,
      descripcion: `Despacho de Compra B2B NORTIA desde bodega ${producto.proveedorNombre} (${producto.origenDireccion}) hacia ${negocioNombre} (${destinoDireccion}). Pago garantizado en Custodia Escrow.`,
      estado: 'publicada',
      fecha_retiro: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  } catch (err) {
    console.warn('Carga insertada en modo local (sin conexión a base remota):', err)
  }

  // Disparar eventos reactivos
  window.dispatchEvent(new CustomEvent('nortia_pedido_b2b_creado', { detail: nuevoPedido }))
  window.dispatchEvent(new CustomEvent('nortia_carga_creada', { detail: { id: cargaIdGenerada } }))

  return nuevoPedido
}
