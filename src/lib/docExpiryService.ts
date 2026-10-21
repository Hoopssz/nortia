/**
 * Servicio de Bóveda de Documentos y Semáforo de Vencimiento (NORTIA Doc Vault)
 */

export type EstadoSemaforo = 'vigente' | 'por_vencer' | 'vencido' | 'sin_fecha'

export interface DocumentoVencimiento {
  id: string
  titulo: string
  subtitulo: string
  icono: string
  fechaVencimiento: string | null // YYYY-MM-DD
  urlDocumento?: string | null
  diasRestantes?: number
  estadoSemaforo: EstadoSemaforo
  tipoDoc: 'revision_tecnica' | 'permiso_circulacion' | 'soap' | 'licencia' | 'padron'
}

const STORAGE_KEY_DOCS = 'nortia_doc_vault_'

export function calcularEstadoSemaforo(fechaIso: string | null): {
  estado: EstadoSemaforo
  dias: number
} {
  if (!fechaIso) return { estado: 'sin_fecha', dias: 0 }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const fechaDoc = new Date(fechaIso)
  fechaDoc.setHours(0, 0, 0, 0)

  const diffMs = fechaDoc.getTime() - hoy.getTime()
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias < 0) {
    return { estado: 'vencido', dias: diffDias }
  }
  if (diffDias <= 30) {
    return { estado: 'por_vencer', dias: diffDias }
  }
  return { estado: 'vigente', dias: diffDias }
}

export function obtenerDocumentosBoveda(camionId: string): DocumentoVencimiento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCS + camionId)
    if (raw) return JSON.parse(raw)
  } catch {}

  // Fechas iniciales por defecto calculadas
  const anioActual = new Date().getFullYear()
  const hoy = new Date()

  // Revisión técnica en 4 meses
  const fechaPRT = new Date(hoy.getFullYear(), hoy.getMonth() + 4, 15).toISOString().split('T')[0]
  // Permiso circulación en 8 meses
  const fechaPermiso = new Date(anioActual + 1, 4, 31).toISOString().split('T')[0]
  // SOAP en 7 meses
  const fechaSoap = new Date(anioActual + 1, 2, 31).toISOString().split('T')[0]
  // Licencia A5 en 2 años
  const fechaLicencia = new Date(anioActual + 2, 7, 20).toISOString().split('T')[0]

  const docsPorDefecto: DocumentoVencimiento[] = [
    {
      id: 'doc-prt',
      titulo: 'Revisión Técnica y Gases (PRT)',
      subtitulo: 'Planta de Revisión Técnica autorizada por MTT',
      icono: '🔧',
      tipoDoc: 'revision_tecnica',
      fechaVencimiento: fechaPRT,
      ...calcularEstadoSemaforo(fechaPRT),
      estadoSemaforo: calcularEstadoSemaforo(fechaPRT).estado,
      diasRestantes: calcularEstadoSemaforo(fechaPRT).dias,
    },
    {
      id: 'doc-permiso',
      titulo: 'Permiso de Circulación',
      subtitulo: 'Municipalidad al día (Padrón vigente)',
      icono: '🏛️',
      tipoDoc: 'permiso_circulacion',
      fechaVencimiento: fechaPermiso,
      ...calcularEstadoSemaforo(fechaPermiso),
      estadoSemaforo: calcularEstadoSemaforo(fechaPermiso).estado,
      diasRestantes: calcularEstadoSemaforo(fechaPermiso).dias,
    },
    {
      id: 'doc-soap',
      titulo: 'Seguro Obligatorio (SOAP)',
      subtitulo: 'Póliza anual de accidentes personales',
      icono: '🛡️',
      tipoDoc: 'soap',
      fechaVencimiento: fechaSoap,
      ...calcularEstadoSemaforo(fechaSoap),
      estadoSemaforo: calcularEstadoSemaforo(fechaSoap).estado,
      diasRestantes: calcularEstadoSemaforo(fechaSoap).dias,
    },
    {
      id: 'doc-licencia',
      titulo: 'Licencia de Conducir (A5 / A4)',
      subtitulo: 'Licencia profesional para transporte de carga pesada',
      icono: '🪪',
      tipoDoc: 'licencia',
      fechaVencimiento: fechaLicencia,
      ...calcularEstadoSemaforo(fechaLicencia),
      estadoSemaforo: calcularEstadoSemaforo(fechaLicencia).estado,
      diasRestantes: calcularEstadoSemaforo(fechaLicencia).dias,
    },
    {
      id: 'doc-padron',
      titulo: 'Padrón del Vehículo (CAV)',
      subtitulo: 'Certificado de Anotaciones Vigentes Registro Civil',
      icono: '📋',
      tipoDoc: 'padron',
      fechaVencimiento: null,
      estadoSemaforo: 'vigente',
      diasRestantes: 9999,
    },
  ]

  return docsPorDefecto
}

export function guardarDocumentosBoveda(camionId: string, docs: DocumentoVencimiento[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DOCS + camionId, JSON.stringify(docs))
    window.dispatchEvent(new Event('nortia_docs_updated'))
  } catch (err) {
    console.error('Error guardando documentos en bóveda:', err)
  }
}

export function actualizarFechaDoc(
  camionId: string,
  docId: string,
  nuevaFechaIso: string
): DocumentoVencimiento[] {
  const docs = obtenerDocumentosBoveda(camionId)
  const calc = calcularEstadoSemaforo(nuevaFechaIso)

  const actualizados = docs.map((d) =>
    d.id === docId
      ? {
          ...d,
          fechaVencimiento: nuevaFechaIso,
          estadoSemaforo: calc.estado,
          diasRestantes: calc.dias,
        }
      : d
  )

  guardarDocumentosBoveda(camionId, actualizados)
  return actualizados
}
