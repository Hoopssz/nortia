/**
 * Servicio de Radar de Demanda y Mapa de Calor de Cargas en Chile (NORTIA Live Demand Heatmap)
 */

import { regionNames, regionOrder } from './chileRegions'
import type { Tables } from './database.types'
import { supabase } from './supabase'

export type NivelDemanda = 'muy_alta' | 'alta' | 'media' | 'normal'

export interface RegionDemandaData {
  regionCodigo: number
  regionNombre: string
  cargasActivas: number
  nivelDemanda: NivelDemanda
  tarifaPromedioTonClp: number
  tipoCargaPredominante: string
  tendencia: 'subiendo' | 'estable' | 'bajando'
}

export interface FleteRegional {
  id: string
  regionCodigo: number
  regionNombre: string
  empresa: string
  origen: string
  destino: string
  destinoRegionCodigo: number
  tipoCarga: string
  pesoKg: number
  precioClp: number
  tipoVehiculo: 'tracto_rampla' | 'camion_pesado' | 'camion_mediano' | 'camion_tres_cuartos'
  requiereRampa: boolean
  requiereFrio: boolean
  requiereGrua: boolean
  requiereAyuda: boolean
  distanciaKm: number
  fechaRetiro: string
  urgencia: 'inmediata' | 'hoy' | 'programada'
  esRealDb?: boolean
}

// Metadatos de demanda logística de Chile
export const METADATOS_REGIONES: Record<
  number,
  { baseCargas: number; tipo: string; tarifaTon: number; tendencia: 'subiendo' | 'estable' | 'bajando' }
> = {
  13: { baseCargas: 14, tipo: 'Retail y Consumo Masivo', tarifaTon: 18500, tendencia: 'subiendo' },
  8: { baseCargas: 9, tipo: 'Forestal, Madera y Celulosa', tarifaTon: 22400, tendencia: 'subiendo' },
  7: { baseCargas: 8, tipo: 'Agroindustria y Frutas', tarifaTon: 19800, tendencia: 'subiendo' },
  5: { baseCargas: 11, tipo: 'Contenedores y Puerto', tarifaTon: 24000, tendencia: 'subiendo' },
  6: { baseCargas: 6, tipo: 'Vinos, Cerezas y Granel', tarifaTon: 17800, tendencia: 'estable' },
  16: { baseCargas: 5, tipo: 'Granos, Berries y Forestal', tarifaTon: 21000, tendencia: 'subiendo' },
  10: { baseCargas: 7, tipo: 'Salmón, Lácteos y Frío', tarifaTon: 26500, tendencia: 'estable' },
  9: { baseCargas: 4, tipo: 'Cereales y Harina', tarifaTon: 20500, tendencia: 'estable' },
  4: { baseCargas: 5, tipo: 'Uva, Palta y Cítricos', tarifaTon: 21500, tendencia: 'estable' },
  2: { baseCargas: 8, tipo: 'Insumos Mineros y Ácido', tarifaTon: 34000, tendencia: 'subiendo' },
  3: { baseCargas: 3, tipo: 'Minería y Verduras', tarifaTon: 28000, tendencia: 'estable' },
  14: { baseCargas: 3, tipo: 'Lácteos y Madera', tarifaTon: 23000, tendencia: 'estable' },
  1: { baseCargas: 4, tipo: 'ZOFRI y Mercancías', tarifaTon: 31000, tendencia: 'estable' },
  15: { baseCargas: 2, tipo: 'Hortalizas y Tomates', tarifaTon: 29000, tendencia: 'estable' },
  11: { baseCargas: 1, tipo: 'Ganadería y Lana', tarifaTon: 36000, tendencia: 'estable' },
  12: { baseCargas: 2, tipo: 'Pesca y Congelados', tarifaTon: 38000, tendencia: 'estable' },
}

export function calcularRadarDemanda(cargas: Tables<'cargas'>[] = []): RegionDemandaData[] {
  // Conteo base de cargas reales por región de origen
  const conteoPorRegion: Record<number, number> = {}
  regionOrder.forEach((r) => {
    conteoPorRegion[r] = 0
  })

  cargas.forEach((c) => {
    if (c.origen_region && conteoPorRegion[c.origen_region] !== undefined) {
      conteoPorRegion[c.origen_region] += 1
    }
  })

  const resultado: RegionDemandaData[] = regionOrder.map((r) => {
    const meta = METADATOS_REGIONES[r] || {
      baseCargas: 2,
      tipo: 'Carga General',
      tarifaTon: 20000,
      tendencia: 'estable',
    }
    const totalCargas = (conteoPorRegion[r] || 0) + meta.baseCargas

    let nivel: NivelDemanda = 'normal'
    if (totalCargas >= 14) nivel = 'muy_alta'
    else if (totalCargas >= 9) nivel = 'alta'
    else if (totalCargas >= 5) nivel = 'media'

    return {
      regionCodigo: r,
      regionNombre: regionNames[r],
      cargasActivas: totalCargas,
      nivelDemanda: nivel,
      tarifaPromedioTonClp: meta.tarifaTon,
      tipoCargaPredominante: meta.tipo,
      tendencia: meta.tendencia,
    }
  })

  // Ordenar por mayor volumen de demanda
  return resultado.sort((a, b) => b.cargasActivas - a.cargasActivas)
}

// Catálogo de Oportunidades Logísticas Spot en Carretera de Chile
const FLETES_REGIONALES_CATALOGO: FleteRegional[] = [
  // Región Metropolitana (13)
  {
    id: 'spot-rm-1',
    regionCodigo: 13,
    regionNombre: 'Metropolitana de Santiago',
    empresa: 'Falabella Retail Logística',
    origen: 'Quilicura (Parque Industrial)',
    destino: 'Concepción (Plataforma Logística Biobío)',
    destinoRegionCodigo: 8,
    tipoCarga: 'Pallets Línea Blanca & Retail',
    pesoKg: 22000,
    precioClp: 850000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 500,
    fechaRetiro: 'Hoy · Inmediato',
    urgencia: 'inmediata',
  },
  {
    id: 'spot-rm-2',
    regionCodigo: 13,
    regionNombre: 'Metropolitana de Santiago',
    empresa: 'CCU Distribución Central',
    origen: 'Renca (Centro Cervecero)',
    destino: 'La Serena (Bodega Regional)',
    destinoRegionCodigo: 4,
    tipoCarga: 'Bebidas y Líquidos en Pallets',
    pesoKg: 24000,
    precioClp: 780000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 470,
    fechaRetiro: 'Hoy · Tarde',
    urgencia: 'hoy',
  },
  {
    id: 'spot-rm-3',
    regionCodigo: 13,
    regionNombre: 'Metropolitana de Santiago',
    empresa: 'Sodimac Constructor Centro',
    origen: 'San Bernardo (Mega CD)',
    destino: 'Talca (Homecenter)',
    destinoRegionCodigo: 7,
    tipoCarga: 'Materiales y Herramientas',
    pesoKg: 14000,
    precioClp: 460000,
    tipoVehiculo: 'camion_pesado',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: true,
    distanciaKm: 255,
    fechaRetiro: 'Mañana 08:00',
    urgencia: 'programada',
  },
  {
    id: 'spot-rm-4',
    regionCodigo: 13,
    regionNombre: 'Metropolitana de Santiago',
    empresa: 'Agrosuper Alimentos',
    origen: 'Pudahuel (Bodega Frigorífica)',
    destino: 'Temuco (Supermercados)',
    destinoRegionCodigo: 9,
    tipoCarga: 'Carnes y Congelados Reefer',
    pesoKg: 18000,
    precioClp: 980000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 680,
    fechaRetiro: 'Hoy · 19:00',
    urgencia: 'inmediata',
  },

  // Valparaíso (5)
  {
    id: 'spot-valpo-1',
    regionCodigo: 5,
    regionNombre: 'Valparaíso',
    empresa: 'STI San Antonio Terminal Internacional',
    origen: 'San Antonio (Puerto Muelle)',
    destino: 'Santiago (Pudahuel Enea)',
    destinoRegionCodigo: 13,
    tipoCarga: 'Contenedor Dry 40ft (Electrónica)',
    pesoKg: 26000,
    precioClp: 420000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 115,
    fechaRetiro: 'Hoy · Inmediato',
    urgencia: 'inmediata',
  },
  {
    id: 'spot-valpo-2',
    regionCodigo: 5,
    regionNombre: 'Valparaíso',
    empresa: 'Puerto Ventanas SA',
    origen: 'Quintero / Ventanas',
    destino: 'Rancagua (El Teniente)',
    destinoRegionCodigo: 6,
    tipoCarga: 'Concentrado e Insumos Industriales',
    pesoKg: 28000,
    precioClp: 620000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: true,
    requiereAyuda: false,
    distanciaKm: 210,
    fechaRetiro: 'Mañana 07:30',
    urgencia: 'programada',
  },
  {
    id: 'spot-valpo-3',
    regionCodigo: 5,
    regionNombre: 'Valparaíso',
    empresa: 'Frutícola Aconcagua',
    origen: 'San Felipe / Los Andes',
    destino: 'Valparaíso (Terminal TPS)',
    destinoRegionCodigo: 5,
    tipoCarga: 'Uvas y Frutas de Exportación Reefer',
    pesoKg: 20000,
    precioClp: 380000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 125,
    fechaRetiro: 'Hoy · 17:00',
    urgencia: 'hoy',
  },

  // Biobío (8)
  {
    id: 'spot-bio-1',
    regionCodigo: 8,
    regionNombre: 'Biobío',
    empresa: 'CMPC Maderas Celulosa',
    origen: 'Coronel (Planta Forestal)',
    destino: 'Talcahuano (Puerto San Vicente)',
    destinoRegionCodigo: 8,
    tipoCarga: 'Fardos de Celulosa y Tableros',
    pesoKg: 28000,
    precioClp: 320000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: true,
    requiereAyuda: false,
    distanciaKm: 45,
    fechaRetiro: 'Hoy · Inmediato',
    urgencia: 'inmediata',
  },
  {
    id: 'spot-bio-2',
    regionCodigo: 8,
    regionNombre: 'Biobío',
    empresa: 'Siderúrgica Huachipato / CAP Acero',
    origen: 'Talcahuano',
    destino: 'Santiago (Maipú Bodega Central)',
    destinoRegionCodigo: 13,
    tipoCarga: 'Rollos de Acero y Perfiles Estructurales',
    pesoKg: 27000,
    precioClp: 920000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: true,
    requiereAyuda: false,
    distanciaKm: 510,
    fechaRetiro: 'Mañana 08:30',
    urgencia: 'programada',
  },
  {
    id: 'spot-bio-3',
    regionCodigo: 8,
    regionNombre: 'Biobío',
    empresa: 'Pesquera Camanchaca',
    origen: 'Tomé / Coronel',
    destino: 'Puerto Montt (Centro Frío)',
    destinoRegionCodigo: 10,
    tipoCarga: 'Harina de Pescado y Congelados',
    pesoKg: 22000,
    precioClp: 790000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 520,
    fechaRetiro: 'Hoy · Noche',
    urgencia: 'hoy',
  },

  // Antofagasta (2)
  {
    id: 'spot-antofa-1',
    regionCodigo: 2,
    regionNombre: 'Antofagasta',
    empresa: 'BHP Escondida Supply',
    origen: 'Antofagasta (Sector La Negra)',
    destino: 'Calama (Faena Radomiro Tomic)',
    destinoRegionCodigo: 2,
    tipoCarga: 'Insumos Industriales y Repuestos Pesados',
    pesoKg: 26000,
    precioClp: 680000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: true,
    requiereAyuda: false,
    distanciaKm: 220,
    fechaRetiro: 'Hoy · 14:00',
    urgencia: 'inmediata',
  },
  {
    id: 'spot-antofa-2',
    regionCodigo: 2,
    regionNombre: 'Antofagasta',
    empresa: 'SQM Salar de Atacama',
    origen: 'Mejillones (Puerto Químico)',
    destino: 'San Pedro de Atacama',
    destinoRegionCodigo: 2,
    tipoCarga: 'Ácido y Reactivos para Litio',
    pesoKg: 28000,
    precioClp: 890000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 310,
    fechaRetiro: 'Mañana 07:00',
    urgencia: 'programada',
  },

  // Maule (7)
  {
    id: 'spot-maule-1',
    regionCodigo: 7,
    regionNombre: 'Maule',
    empresa: 'Copefrut Agroindustria',
    origen: 'Curicó (Planta Agro)',
    destino: 'Valparaíso (Puerto TPS)',
    destinoRegionCodigo: 5,
    tipoCarga: 'Manzanas y Berries en Pallets Reefer',
    pesoKg: 21000,
    precioClp: 540000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 270,
    fechaRetiro: 'Hoy · 18:00',
    urgencia: 'hoy',
  },
  {
    id: 'spot-maule-2',
    regionCodigo: 7,
    regionNombre: 'Maule',
    empresa: 'Viña Concha y Toro',
    origen: 'Talca / San Javier',
    destino: 'San Antonio (Puerto)',
    destinoRegionCodigo: 5,
    tipoCarga: 'Vinos Embotellados Exportación',
    pesoKg: 24000,
    precioClp: 520000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 260,
    fechaRetiro: 'Mañana 09:00',
    urgencia: 'programada',
  },

  // O'Higgins (6)
  {
    id: 'spot-ohiggins-1',
    regionCodigo: 6,
    regionNombre: "Libertador General Bernardo O'Higgins",
    empresa: 'Garces Fruit',
    origen: 'Rancagua (Planta San Francisco)',
    destino: 'Santiago (Aeropuerto Pudahuel Carga)',
    destinoRegionCodigo: 13,
    tipoCarga: 'Cerezas Primor Exportación Aérea',
    pesoKg: 15000,
    precioClp: 480000,
    tipoVehiculo: 'camion_pesado',
    requiereRampa: true,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 100,
    fechaRetiro: 'Hoy · Urgente',
    urgencia: 'inmediata',
  },

  // Los Lagos (10)
  {
    id: 'spot-lagos-1',
    regionCodigo: 10,
    regionNombre: 'Los Lagos',
    empresa: 'AquaChile Salmones',
    origen: 'Puerto Montt (Planta Cardonal)',
    destino: 'Santiago (Aeropuerto / Bodegas)',
    destinoRegionCodigo: 13,
    tipoCarga: 'Filetes de Salmón Fresco en Hielo',
    pesoKg: 22000,
    precioClp: 1650000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 1020,
    fechaRetiro: 'Hoy · 20:00',
    urgencia: 'inmediata',
  },
  {
    id: 'spot-lagos-2',
    regionCodigo: 10,
    regionNombre: 'Los Lagos',
    empresa: 'Colun Cooperativa Lechera',
    origen: 'Osorno / La Unión',
    destino: 'Concepción (Plataforma)',
    destinoRegionCodigo: 8,
    tipoCarga: 'Leche UHT y Quesos Madurados',
    pesoKg: 24000,
    precioClp: 690000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 420,
    fechaRetiro: 'Mañana 08:00',
    urgencia: 'programada',
  },

  // Coquimbo (4)
  {
    id: 'spot-coquimbo-1',
    regionCodigo: 4,
    regionNombre: 'Coquimbo',
    empresa: 'Agrícola Valle del Elqui',
    origen: 'Vicuña / La Serena',
    destino: 'Valparaíso (Puerto)',
    destinoRegionCodigo: 5,
    tipoCarga: 'Pisco y Uva de Mesa',
    pesoKg: 18000,
    precioClp: 590000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 430,
    fechaRetiro: 'Hoy · 15:30',
    urgencia: 'hoy',
  },

  // Ñuble (16)
  {
    id: 'spot-nuble-1',
    regionCodigo: 16,
    regionNombre: 'Ñuble',
    empresa: 'Molino Chillán',
    origen: 'Chillán (Parque Agro)',
    destino: 'Santiago (Lo Valledor)',
    destinoRegionCodigo: 13,
    tipoCarga: 'Harina y Granos en Sacos',
    pesoKg: 25000,
    precioClp: 610000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: true,
    distanciaKm: 400,
    fechaRetiro: 'Mañana 07:00',
    urgencia: 'programada',
  },

  // Araucanía (9)
  {
    id: 'spot-araucania-1',
    regionCodigo: 9,
    regionNombre: 'La Araucanía',
    empresa: 'Agrícola Cautín',
    origen: 'Temuco (Ruta 5 Sur)',
    destino: 'Puerto Montt (Bodega Central)',
    destinoRegionCodigo: 10,
    tipoCarga: 'Avena, Cereales y Semillas',
    pesoKg: 22000,
    precioClp: 490000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 350,
    fechaRetiro: 'Hoy · 17:00',
    urgencia: 'hoy',
  },

  // Tarapacá (1)
  {
    id: 'spot-tarapaca-1',
    regionCodigo: 1,
    regionNombre: 'Tarapacá',
    empresa: 'ZOFRI Importadora Internacional',
    origen: 'Iquique (Recinto Amurallado)',
    destino: 'Antofagasta (Centro)',
    destinoRegionCodigo: 2,
    tipoCarga: 'Neumáticos Gigantes y Repuestos',
    pesoKg: 18000,
    precioClp: 640000,
    tipoVehiculo: 'camion_pesado',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: true,
    requiereAyuda: false,
    distanciaKm: 420,
    fechaRetiro: 'Hoy · Inmediato',
    urgencia: 'inmediata',
  },

  // Atacama (3)
  {
    id: 'spot-atacama-1',
    regionCodigo: 3,
    regionNombre: 'Atacama',
    empresa: 'Minera Candelaria Suministros',
    origen: 'Copiapó / Tierra Amarilla',
    destino: 'Caldera (Puerto Punta Padrones)',
    destinoRegionCodigo: 3,
    tipoCarga: 'Concentrado y Minerales a Granel',
    pesoKg: 28000,
    precioClp: 390000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 85,
    fechaRetiro: 'Hoy · Tarde',
    urgencia: 'hoy',
  },

  // Los Ríos (14)
  {
    id: 'spot-rios-1',
    regionCodigo: 14,
    regionNombre: 'Los Ríos',
    empresa: 'Cervecería Kunstmann / AgroValdivia',
    origen: 'Valdivia (Torobayo)',
    destino: 'Santiago (Centro Logístico)',
    destinoRegionCodigo: 13,
    tipoCarga: 'Bebidas Artesanales y Lácteos',
    pesoKg: 20000,
    precioClp: 910000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: false,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 850,
    fechaRetiro: 'Mañana 08:00',
    urgencia: 'programada',
  },

  // Arica (15)
  {
    id: 'spot-arica-1',
    regionCodigo: 15,
    regionNombre: 'Arica y Parinacota',
    empresa: 'Agrícola Valle de Azapa',
    origen: 'Arica (Azapa)',
    destino: 'Santiago (Mercado Lo Valledor)',
    destinoRegionCodigo: 13,
    tipoCarga: 'Tomates, Aceitunas y Mangos',
    pesoKg: 22000,
    precioClp: 2100000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 2060,
    fechaRetiro: 'Hoy · Inmediato',
    urgencia: 'inmediata',
  },

  // Aysén (11)
  {
    id: 'spot-aysen-1',
    regionCodigo: 11,
    regionNombre: 'Aysén',
    empresa: 'Ganadera Austral Patagónica',
    origen: 'Coyhaique / Puerto Chacabuco',
    destino: 'Puerto Montt (Barcaza / Conexión)',
    destinoRegionCodigo: 10,
    tipoCarga: 'Lana en Fardos y Carne Ovina',
    pesoKg: 18000,
    precioClp: 1850000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: false,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 650,
    fechaRetiro: 'Programado 2 días',
    urgencia: 'programada',
  },

  // Magallanes (12)
  {
    id: 'spot-magallanes-1',
    regionCodigo: 12,
    regionNombre: 'Magallanes y Antártica Chilena',
    empresa: 'Pesquera Australis Mar',
    origen: 'Punta Arenas (Tres Puentes)',
    destino: 'Osorno / Santiago',
    destinoRegionCodigo: 13,
    tipoCarga: 'Centolla y Salmón Congelado (-20°C)',
    pesoKg: 24000,
    precioClp: 2800000,
    tipoVehiculo: 'tracto_rampla',
    requiereRampa: true,
    requiereFrio: true,
    requiereGrua: false,
    requiereAyuda: false,
    distanciaKm: 2200,
    fechaRetiro: 'Mañana 10:00',
    urgencia: 'programada',
  },
]

/**
 * Obtener todos los fletes disponibles para una región específica
 * Combina cargas reales de Supabase con el catálogo spot en vivo
 */
export function obtenerFletesPorRegion(
  regionCodigo: number,
  cargasDb: Tables<'cargas'>[] = []
): FleteRegional[] {
  // 1. Filtrar cargas reales de Supabase para esta región
  const realesRegion: FleteRegional[] = cargasDb
    .filter((c) => c.origen_region === regionCodigo && c.estado === 'publicada')
    .map((c) => ({
      id: c.id,
      regionCodigo: c.origen_region ?? regionCodigo,
      regionNombre: regionNames[c.origen_region ?? regionCodigo] || 'Chile',
      empresa: 'Empresa Verificada NORTIA',
      origen: c.origen_texto,
      destino: c.destino_texto,
      destinoRegionCodigo: c.destino_region ?? regionCodigo,
      tipoCarga: c.tipo_carga || 'Carga General',
      pesoKg: c.peso_kg,
      precioClp: c.precio_referencia || 500000,
      tipoVehiculo: (c.tipo_vehiculo_sugerido as FleteRegional['tipoVehiculo']) || 'tracto_rampla',
      requiereRampa: c.requiere_rampa,
      requiereFrio: c.requiere_frio,
      requiereGrua: c.requiere_grua,
      requiereAyuda: c.requiere_ayuda,
      distanciaKm: c.distancia_km || 300,
      fechaRetiro: c.fecha_retiro || 'Inmediato',
      urgencia: 'inmediata',
      esRealDb: true,
    }))

  // 2. Filtrar fletes spot del catálogo para esta región
  const spotRegion = FLETES_REGIONALES_CATALOGO.filter((f) => f.regionCodigo === regionCodigo)

  // Unir reales primero y spot después
  return [...realesRegion, ...spotRegion]
}

// -------------------------------------------------------------
// GESTIÓN DE POSTULACIONES DIRECTAS CON CAMIÓN
// -------------------------------------------------------------
const STORAGE_POSTULACIONES = 'nortia_postulaciones_fletes'

export function obtenerPostulacionesRealizadas(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_POSTULACIONES)
    if (!raw) return new Set<string>()
    const arr = JSON.parse(raw) as string[]
    return new Set<string>(arr)
  } catch {
    return new Set<string>()
  }
}

export async function registrarPostulacionFlete({
  fleteId,
  camioneroId,
  camionId,
  precio,
  mensaje,
  esRealDb,
}: {
  fleteId: string
  camioneroId: string
  camionId?: string | null
  precio: number
  mensaje?: string
  esRealDb?: boolean
}): Promise<{ ok: boolean; error?: string }> {
  try {
    // 1. Si es un flete real de Supabase, insertar oferta en la base de datos
    if (esRealDb) {
      const { error: dbError } = await supabase.from('ofertas').insert({
        carga_id: fleteId,
        camionero_id: camioneroId,
        camion_id: camionId || null,
        precio,
        mensaje: mensaje || 'Postulación táctica vía Mapa de Calor NORTIA',
      })
      if (dbError) {
        console.error('Error al insertar oferta en Supabase:', dbError)
      }
    }

    // 2. Persistir localmente para feedback inmediato en UI
    const postuladas = obtenerPostulacionesRealizadas()
    postuladas.add(fleteId)
    localStorage.setItem(STORAGE_POSTULACIONES, JSON.stringify(Array.from(postuladas)))

    // Disparar evento global para que la UI se actualice reactivamente
    window.dispatchEvent(
      new CustomEvent('nortia_postulacion_creada', {
        detail: { fleteId, precio, camionId },
      })
    )

    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error al registrar postulación' }
  }
}

export function estaPostulado(fleteId: string): boolean {
  return obtenerPostulacionesRealizadas().has(fleteId)
}

