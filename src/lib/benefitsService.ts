/**
 * Servicio de NORTIA Pro - Club de Beneficios y Descuentos en Carretera para Camioneros de Chile
 */

export interface BeneficioClub {
  id: string
  categoria: 'neumaticos' | 'paradores' | 'repuestos' | 'alimentacion' | 'legal'
  titulo: string
  proveedor: string
  descuento: string
  descripcion: string
  icono: string
  codigoCupon: string
  activo: boolean
  requisitoNivel: 'todos' | 'pro_plata' | 'pro_oro'
}

export const BENEFICIOS_NORTIA_PRO: BeneficioClub[] = [
  {
    id: 'ben-neumaticos',
    categoria: 'neumaticos',
    titulo: 'Neumáticos de Carga y Vulcanización 24h',
    proveedor: 'Red de Vulcanizaciones Ruta 5',
    descuento: '15% Descuento',
    descripcion: 'Descuento en parchado térmico, rotación y asistencia 24 horas en talleres adheridos a lo largo de Chile.',
    icono: '🛞',
    codigoCupon: 'VULCA-NORTIA-15',
    activo: true,
    requisitoNivel: 'todos',
  },
  {
    id: 'ben-duchas-paradores',
    categoria: 'paradores',
    titulo: 'Duchas con Agua Caliente & Estacionamiento Seguro',
    proveedor: 'Paradores y Hostales de Carretera',
    descuento: 'Tarifa Preferencial / 2x1',
    descripcion: 'Acceso a duchas limpias, zonas de descanso y estacionamiento custodiado mostrando tu app NORTIA activa.',
    icono: '🚿',
    codigoCupon: 'DESCANSO-NORTIA',
    activo: true,
    requisitoNivel: 'todos',
  },
  {
    id: 'ben-repuestos',
    categoria: 'repuestos',
    titulo: 'Lubricantes, Filtros y Repuestos Pesados',
    proveedor: 'Talleres Mecánicos y Repuesteras Regionales',
    descuento: '12% Descuento',
    descripcion: 'Aceites 15W40, tambores de freno, ampolletas y correas en distribuidores mecánicos de carretera.',
    icono: '🔧',
    codigoCupon: 'MECANICA-NORTIA-12',
    activo: true,
    requisitoNivel: 'todos',
  },
  {
    id: 'ben-comida',
    categoria: 'alimentacion',
    titulo: 'Menú Camionero & Desayunos en Ruta',
    proveedor: 'Picadas Tradicionales Ruta 5',
    descuento: 'Bebida o Café Gratis',
    descripcion: 'En picadas y restoranes típicos de carretera presentando tu app NORTIA con viaje en curso.',
    icono: '☕',
    codigoCupon: 'PICADA-NORTIA',
    activo: true,
    requisitoNivel: 'todos',
  },
  {
    id: 'ben-legal',
    categoria: 'legal',
    titulo: 'Asesoría Legal y Apelación de Partes MTT',
    proveedor: 'Defensa Jurídica del Transporte',
    descuento: '1ª Consulta Gratis',
    descripcion: 'Orientación jurídica telefónica especializada en normativa de transporte, pesos por eje y partes de tránsito.',
    icono: '⚖️',
    codigoCupon: 'LEGAL-NORTIA-PRO',
    activo: true,
    requisitoNivel: 'todos',
  },
]

export function obtenerBeneficios(): BeneficioClub[] {
  return BENEFICIOS_NORTIA_PRO
}
