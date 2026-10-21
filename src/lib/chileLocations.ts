/**
 * Catálogo de comunas, ciudades y centros logísticos clave de Chile,
 * con especial foco en Ñuble (Chillán y sus 21 comunas) y las principales rutas de carga.
 */

export interface ChileLocation {
  nombre: string
  comuna: string
  regionCodigo: number
  regionNombre: string
  lat: number
  lng: number
  tipo: 'comuna' | 'ciudad' | 'logistica' | 'calle'
  descripcion?: string
}

export const COMUNAS_CHILE: ChileLocation[] = [
  // --- REGIÓN DE ÑUBLE (CÓDIGO 16) - 21 COMUNAS COMPLETAS ---
  { nombre: 'Chillán', comuna: 'Chillán', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.6063, lng: -72.1034, tipo: 'ciudad', descripcion: 'Capital Regional de Ñuble' },
  { nombre: 'Chillán Viejo', comuna: 'Chillán Viejo', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.6333, lng: -72.1333, tipo: 'comuna' },
  { nombre: 'San Carlos', comuna: 'San Carlos', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.4239, lng: -71.9583, tipo: 'ciudad', descripcion: 'Centro Agrícola Ñuble Norte' },
  { nombre: 'Bulnes', comuna: 'Bulnes', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.7417, lng: -72.2986, tipo: 'comuna' },
  { nombre: 'Coihueco', comuna: 'Coihueco', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.6236, lng: -71.8328, tipo: 'comuna' },
  { nombre: 'Quillón', comuna: 'Quillón', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.7417, lng: -72.4750, tipo: 'comuna' },
  { nombre: 'Yungay', comuna: 'Yungay', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -37.1211, lng: -72.0167, tipo: 'comuna' },
  { nombre: 'Pinto', comuna: 'Pinto', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.7000, lng: -71.8967, tipo: 'comuna' },
  { nombre: 'San Ignacio', comuna: 'San Ignacio', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.8333, lng: -72.0333, tipo: 'comuna' },
  { nombre: 'San Nicolás', comuna: 'San Nicolás', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.5000, lng: -72.2167, tipo: 'comuna' },
  { nombre: 'Coelemu', comuna: 'Coelemu', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.4886, lng: -72.7042, tipo: 'comuna' },
  { nombre: 'Quirihue', comuna: 'Quirihue', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.2833, lng: -72.5333, tipo: 'comuna' },
  { nombre: 'El Carmen', comuna: 'El Carmen', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.8972, lng: -72.0278, tipo: 'comuna' },
  { nombre: 'Pemuco', comuna: 'Pemuco', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.9750, lng: -72.1000, tipo: 'comuna' },
  { nombre: 'Ninhue', comuna: 'Ninhue', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.4000, lng: -72.4000, tipo: 'comuna' },
  { nombre: 'Portezuelo', comuna: 'Portezuelo', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.5333, lng: -72.4333, tipo: 'comuna' },
  { nombre: 'Ránquil', comuna: 'Ránquil', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.6500, lng: -72.5500, tipo: 'comuna' },
  { nombre: 'San Fabián', comuna: 'San Fabián de Alico', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.5500, lng: -71.5500, tipo: 'comuna' },
  { nombre: 'Cobquecura', comuna: 'Cobquecura', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.1333, lng: -72.7833, tipo: 'comuna' },
  { nombre: 'Trehuaco', comuna: 'Trehuaco', regionCodigo: 16, regionNombre: 'Región de Ñuble', lat: -36.4333, lng: -72.6667, tipo: 'comuna' },

  // --- REGIÓN DEL BIOBÍO (CÓDIGO 8) ---
  { nombre: 'Concepción', comuna: 'Concepción', regionCodigo: 8, regionNombre: 'Región del Biobío', lat: -36.8270, lng: -73.0503, tipo: 'ciudad', descripcion: 'Gran Concepción' },
  { nombre: 'Talcahuano (Puerto)', comuna: 'Talcahuano', regionCodigo: 8, regionNombre: 'Región del Biobío', lat: -36.7249, lng: -73.1168, tipo: 'logistica', descripcion: 'Puerto Comercial e Industrial' },
  { nombre: 'Los Ángeles', comuna: 'Los Ángeles', regionCodigo: 8, regionNombre: 'Región del Biobío', lat: -37.4697, lng: -72.3537, tipo: 'ciudad', descripcion: 'Hub Forestal y Agroindustrial' },
  { nombre: 'Coronel (Puerto)', comuna: 'Coronel', regionCodigo: 8, regionNombre: 'Región del Biobío', lat: -37.0167, lng: -73.1333, tipo: 'logistica' },
  { nombre: 'San Pedro de la Paz', comuna: 'San Pedro de la Paz', regionCodigo: 8, regionNombre: 'Región del Biobío', lat: -36.8400, lng: -73.1000, tipo: 'comuna' },
  { nombre: 'Chiguayante', comuna: 'Chiguayante', regionCodigo: 8, regionNombre: 'Región del Biobío', lat: -36.9167, lng: -73.0333, tipo: 'comuna' },
  { nombre: 'Cabrero', comuna: 'Cabrero', regionCodigo: 8, regionNombre: 'Región del Biobío', lat: -37.0333, lng: -72.4000, tipo: 'logistica', descripcion: 'Cruce Ruta 5 con Ruta 148 a Conce' },

  // --- REGIÓN DEL MAULE (CÓDIGO 7) ---
  { nombre: 'Talca', comuna: 'Talca', regionCodigo: 7, regionNombre: 'Región del Maule', lat: -35.4264, lng: -71.6554, tipo: 'ciudad', descripcion: 'Capital Regional del Maule' },
  { nombre: 'Curicó', comuna: 'Curicó', regionCodigo: 7, regionNombre: 'Región del Maule', lat: -34.9854, lng: -71.2394, tipo: 'ciudad', descripcion: 'Zona Agroexportadora Frutícola' },
  { nombre: 'Linares', comuna: 'Linares', regionCodigo: 7, regionNombre: 'Región del Maule', lat: -35.8454, lng: -71.5979, tipo: 'ciudad' },
  { nombre: 'Parral', comuna: 'Parral', regionCodigo: 7, regionNombre: 'Región del Maule', lat: -36.1428, lng: -71.8256, tipo: 'comuna' },
  { nombre: 'Cauquenes', comuna: 'Cauquenes', regionCodigo: 7, regionNombre: 'Región del Maule', lat: -35.9671, lng: -72.3157, tipo: 'comuna' },
  { nombre: 'Constitución', comuna: 'Constitución', regionCodigo: 7, regionNombre: 'Región del Maule', lat: -35.3332, lng: -72.4118, tipo: 'ciudad' },

  // --- REGIÓN METROPOLITANA (CÓDIGO 13) ---
  { nombre: 'Santiago (Centro)', comuna: 'Santiago', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.4489, lng: -70.6693, tipo: 'ciudad' },
  { nombre: 'Quilicura (Parque Industrial)', comuna: 'Quilicura', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.3646, lng: -70.7289, tipo: 'logistica', descripcion: 'Hub Logístico Panamericana Norte' },
  { nombre: 'Pudahuel (Enea / Aeropuerto)', comuna: 'Pudahuel', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.4428, lng: -70.7656, tipo: 'logistica', descripcion: 'Parque de Negocios Enea / Aeropuerto' },
  { nombre: 'San Bernardo (Ruta 5 Sur)', comuna: 'San Bernardo', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.5922, lng: -70.7044, tipo: 'logistica', descripcion: 'Centro Logístico Sur de Santiago' },
  { nombre: 'Maipú', comuna: 'Maipú', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.5111, lng: -70.7581, tipo: 'comuna' },
  { nombre: 'Renca', comuna: 'Renca', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.4042, lng: -70.7183, tipo: 'comuna' },
  { nombre: 'Lampa / Valle Grande', comuna: 'Lampa', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.2833, lng: -70.8667, tipo: 'logistica' },
  { nombre: 'Buin', comuna: 'Buin', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.7333, lng: -70.7333, tipo: 'comuna' },
  { nombre: 'Paine', comuna: 'Paine', regionCodigo: 13, regionNombre: 'Región Metropolitana', lat: -33.8167, lng: -70.7500, tipo: 'comuna' },

  // --- REGIÓN DE O’HIGGINS (CÓDIGO 6) ---
  { nombre: 'Rancagua', comuna: 'Rancagua', regionCodigo: 6, regionNombre: 'Región de O’Higgins', lat: -34.1708, lng: -70.7444, tipo: 'ciudad' },
  { nombre: 'San Fernando', comuna: 'San Fernando', regionCodigo: 6, regionNombre: 'Región de O’Higgins', lat: -34.5839, lng: -70.9889, tipo: 'ciudad' },
  { nombre: 'Rengo', comuna: 'Rengo', regionCodigo: 6, regionNombre: 'Región de O’Higgins', lat: -34.4089, lng: -70.8581, tipo: 'comuna' },

  // --- REGIÓN DE VALPARAÍSO (CÓDIGO 5) ---
  { nombre: 'Valparaíso (Puerto)', comuna: 'Valparaíso', regionCodigo: 5, regionNombre: 'Región de Valparaíso', lat: -33.0472, lng: -71.6127, tipo: 'logistica', descripcion: 'Puerto de Carga Valparaíso' },
  { nombre: 'San Antonio (Puerto STI/EPSA)', comuna: 'San Antonio', regionCodigo: 5, regionNombre: 'Región de Valparaíso', lat: -33.5947, lng: -71.6175, tipo: 'logistica', descripcion: 'Mayor Puerto de Contenedores de Chile' },
  { nombre: 'Viña del Mar', comuna: 'Viña del Mar', regionCodigo: 5, regionNombre: 'Región de Valparaíso', lat: -33.0245, lng: -71.5518, tipo: 'ciudad' },

  // --- REGIÓN DE LA ARAUCANÍA (CÓDIGO 9) ---
  { nombre: 'Temuco', comuna: 'Temuco', regionCodigo: 9, regionNombre: 'Región de La Araucanía', lat: -38.7359, lng: -72.5904, tipo: 'ciudad' },
  { nombre: 'Padre Las Casas', comuna: 'Padre Las Casas', regionCodigo: 9, regionNombre: 'Región de La Araucanía', lat: -38.7667, lng: -72.6000, tipo: 'comuna' },
  { nombre: 'Victoria', comuna: 'Victoria', regionCodigo: 9, regionNombre: 'Región de La Araucanía', lat: -38.2333, lng: -72.3333, tipo: 'comuna' },

  // --- REGIÓN DE LOS RÍOS Y LOS LAGOS (CÓDIGOS 14 Y 10) ---
  { nombre: 'Valdivia', comuna: 'Valdivia', regionCodigo: 14, regionNombre: 'Región de Los Ríos', lat: -39.8142, lng: -73.2459, tipo: 'ciudad' },
  { nombre: 'Osorno', comuna: 'Osorno', regionCodigo: 10, regionNombre: 'Región de Los Lagos', lat: -40.5739, lng: -73.1335, tipo: 'ciudad', descripcion: 'Hub Agropecuario y Lechero' },
  { nombre: 'Puerto Montt', comuna: 'Puerto Montt', regionCodigo: 10, regionNombre: 'Región de Los Lagos', lat: -41.4693, lng: -72.9424, tipo: 'ciudad', descripcion: 'Conexión Austral / Salmonero' },
  { nombre: 'Puerto Varas', comuna: 'Puerto Varas', regionCodigo: 10, regionNombre: 'Región de Los Lagos', lat: -41.3195, lng: -72.9854, tipo: 'comuna' },

  // --- NORTE DE CHILE (CÓDIGOS 4, 2, 1, 15, 3) ---
  { nombre: 'La Serena', comuna: 'La Serena', regionCodigo: 4, regionNombre: 'Región de Coquimbo', lat: -29.9027, lng: -71.2520, tipo: 'ciudad' },
  { nombre: 'Coquimbo (Puerto)', comuna: 'Coquimbo', regionCodigo: 4, regionNombre: 'Región de Coquimbo', lat: -29.9533, lng: -71.3436, tipo: 'logistica' },
  { nombre: 'Antofagasta', comuna: 'Antofagasta', regionCodigo: 2, regionNombre: 'Región de Antofagasta', lat: -23.6509, lng: -70.3975, tipo: 'ciudad', descripcion: 'Hub Minero Industrial' },
  { nombre: 'Calama', comuna: 'Calama', regionCodigo: 2, regionNombre: 'Región de Antofagasta', lat: -22.4544, lng: -68.9294, tipo: 'ciudad' },
  { nombre: 'Iquique (ZOFRI)', comuna: 'Iquique', regionCodigo: 1, regionNombre: 'Región de Tarapacá', lat: -20.2133, lng: -70.1503, tipo: 'logistica', descripcion: 'Zona Franca ZOFRI' },
  { nombre: 'Arica', comuna: 'Arica', regionCodigo: 15, regionNombre: 'Región de Arica y Parinacota', lat: -18.4783, lng: -70.3126, tipo: 'ciudad' },
  { nombre: 'Copiapó', comuna: 'Copiapó', regionCodigo: 3, regionNombre: 'Región de Atacama', lat: -27.3668, lng: -70.3323, tipo: 'ciudad' },
]

/**
 * Búsqueda rápida local por texto (comuna, ciudad, dirección o región).
 */
export function buscarComunasLocales(query: string, max = 6): ChileLocation[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    // Si no hay query, dar prioridad a las principales de Ñuble (Chillán, San Carlos, Bulnes)
    return COMUNAS_CHILE.slice(0, max)
  }

  return COMUNAS_CHILE.filter((loc) => {
    return (
      loc.nombre.toLowerCase().includes(q) ||
      loc.comuna.toLowerCase().includes(q) ||
      loc.regionNombre.toLowerCase().includes(q) ||
      (loc.descripcion && loc.descripcion.toLowerCase().includes(q))
    )
  }).slice(0, max)
}

/**
 * Geocodificación interactiva en tiempo real usando OpenStreetMap Nominatim
 * acotada exclusivamente al territorio chileno (`countrycodes=cl`).
 */
export async function geocodificarDireccionChile(query: string): Promise<ChileLocation[]> {
  const q = query.trim()
  if (q.length < 3) return buscarComunasLocales(q)

  // Primero obtener coincidencias locales instantáneas
  const locales = buscarComunasLocales(q, 4)

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q + ', Chile'
    )}&format=json&addressdetails=1&countrycodes=cl&limit=5`

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'NortiaLogistics/1.0',
      },
    })

    if (!response.ok) return locales

    const data = await response.json()
    const geocoded: ChileLocation[] = []

    for (const item of data) {
      const addr = item.address || {}
      const comuna = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Chile'
      const state = addr.state || ''

      // Intentar inferir el código de región de Chile
      let regionCodigo = 16 // default Ñuble si no detecta
      if (state.includes('Ñuble') || state.includes('Nuble')) regionCodigo = 16
      else if (state.includes('Biobío') || state.includes('Biobio')) regionCodigo = 8
      else if (state.includes('Maule')) regionCodigo = 7
      else if (state.includes('Metropolitana') || state.includes('Santiago')) regionCodigo = 13
      else if (state.includes('Higgins') || state.includes("O'Higgins")) regionCodigo = 6
      else if (state.includes('Valparaíso') || state.includes('Valparaiso')) regionCodigo = 5
      else if (state.includes('Araucanía') || state.includes('Araucania')) regionCodigo = 9
      else if (state.includes('Lagos')) regionCodigo = 10
      else if (state.includes('Ríos') || state.includes('Rios')) regionCodigo = 14
      else if (state.includes('Coquimbo')) regionCodigo = 4
      else if (state.includes('Antofagasta')) regionCodigo = 2
      else if (state.includes('Tarapacá') || state.includes('Tarapaca')) regionCodigo = 1
      else if (state.includes('Atacama')) regionCodigo = 3
      else if (state.includes('Arica')) regionCodigo = 15
      else if (state.includes('Aysén') || state.includes('Aysen')) regionCodigo = 11
      else if (state.includes('Magallanes')) regionCodigo = 12

      geocoded.push({
        nombre: item.display_name.split(',')[0],
        comuna: typeof comuna === 'string' ? comuna : 'Chile',
        regionCodigo,
        regionNombre: state || 'Chile',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        tipo: 'calle',
        descripcion: item.display_name,
      })
    }

    // Combinar resultados eliminando duplicados cercanos
    const combinados = [...geocoded, ...locales]
    const unicos: ChileLocation[] = []
    for (const item of combinados) {
      if (!unicos.some((u) => Math.abs(u.lat - item.lat) < 0.01 && Math.abs(u.lng - item.lng) < 0.01)) {
        unicos.push(item)
      }
    }

    return unicos.slice(0, 6)
  } catch (err) {
    console.warn('Geocodificación online falló, usando catálogo local:', err)
    return locales
  }
}

/**
 * Fórmula de Haversine para calcular la distancia en kilómetros (km) en línea de ruta estimada.
 * Aplica factor de sinuosidad vial de 1.25 para carreteras de Chile.
 */
export function calcularDistanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Radio terrestre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanciaLineal = R * c

  // Multiplicador de ruta terrestre real (peajes y trazado de autopistas en Chile)
  const factorCurvatura = 1.22
  return Math.round(distanciaLineal * factorCurvatura)
}

/**
 * Estima el tiempo de viaje en horas y minutos según distancia y velocidad promedio de camión de carga.
 */
export function estimarTiempoViaje(distanciaKm: number): { horas: number; minutos: number; texto: string } {
  const velPromedioKmH = 70 // Velocidad promedio de camión en carretera chilena
  const tiempoTotalHoras = distanciaKm / velPromedioKmH
  const horas = Math.floor(tiempoTotalHoras)
  const minutos = Math.round((tiempoTotalHoras - horas) * 60)

  if (horas === 0) {
    return { horas, minutos: Math.max(minutos, 15), texto: `${Math.max(minutos, 15)} min aprox.` }
  }
  return { horas, minutos, texto: `${horas}h ${minutos > 0 ? `${minutos}m` : ''} aprox.` }
}

/**
 * Sugerencia de tarifa base y precio de referencia según specs y distancia:
 * - Tarifa base de arranque flete: $25.000 CLP
 * - Costo por km de flete de carga: ~$700 a $1.200 por km según peso
 */
export function calcularPrecioReferenciaSugerido(distanciaKm: number, pesoKg = 1000): number {
  if (distanciaKm <= 0) return 30000
  const baseFlete = 25000
  const pesoTon = Math.max(pesoKg / 1000, 0.5)
  const valorKm = 650 + pesoTon * 120
  const subtotal = baseFlete + distanciaKm * valorKm
  // Redondear a miles más cercano
  return Math.round(subtotal / 1000) * 1000
}
