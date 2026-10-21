import { useState, useEffect } from 'react'
import { validarRut, formatearRut } from '../lib/validators'
import { uploadToBucket, sanitizeFileName, getSignedDocumentUrl } from '../lib/uploadFile'
import { useAuth } from '../contexts/useAuth'
import { guardarGuiaDespacho, obtenerGuiaDespacho, type GuiaDespachoData } from '../lib/guiaDespachoService'

interface GuiaDespachoModalProps {
  isOpen: boolean
  cargaId: string
  viajeId?: string
  esEmisor: boolean // true si es el negocio/cliente, false si es el chofer
  onClose: () => void
  onGuiaActualizada?: (guia: GuiaDespachoData) => void
}

export function GuiaDespachoModal({
  isOpen,
  cargaId,
  viajeId,
  esEmisor,
  onClose,
  onGuiaActualizada,
}: GuiaDespachoModalProps) {
  const { session } = useAuth()

  const [guia, setGuia] = useState<GuiaDespachoData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Formulario
  const [folio, setFolio] = useState('')
  const [emisorRazonSocial, setEmisorRazonSocial] = useState('')
  const [emisorRut, setEmisorRut] = useState('')
  const [archivoUrl, setArchivoUrl] = useState<string | null>(null)
  const [tipoArchivo, setTipoArchivo] = useState<'pdf' | 'imagen'>('pdf')
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardadoExito, setGuardadoExito] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const guardada = obtenerGuiaDespacho(cargaId)
    if (guardada) {
      setGuia(guardada)
      setFolio(guardada.folio)
      setEmisorRazonSocial(guardada.emisorRazonSocial)
      setEmisorRut(guardada.emisorRut)
      setArchivoUrl(guardada.archivoUrl)
      setTipoArchivo(guardada.tipoArchivo)
      setIsEditing(false)
    } else {
      setIsEditing(esEmisor)
    }
  }, [isOpen, cargaId, esEmisor])

  if (!isOpen) return null

  async function handleFileUpload(file: File) {
    if (!session?.user.id) return
    setError(null)
    setSubiendoArchivo(true)

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    setTipoArchivo(isPdf ? 'pdf' : 'imagen')

    try {
      if (navigator.onLine) {
        const path = `${session.user.id}/guia_${cargaId}_${Date.now()}_${sanitizeFileName(file.name)}`
        const uploadedPath = await uploadToBucket('documentos', path, file)
        const signedUrl = await getSignedDocumentUrl(uploadedPath)
        setArchivoUrl(signedUrl || uploadedPath)
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setArchivoUrl(reader.result)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      // Fallback a FileReader si hay error
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setArchivoUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setSubiendoArchivo(false)
    }
  }

  const rutValido = validarRut(emisorRut)
  const canSave = folio.trim().length >= 1 && emisorRazonSocial.trim().length >= 2 && rutValido && archivoUrl

  function handleGuardar() {
    if (!canSave || !archivoUrl) return

    const nuevaGuia: GuiaDespachoData = {
      cargaId,
      viajeId,
      folio: folio.trim(),
      emisorRazonSocial: emisorRazonSocial.trim(),
      emisorRut: emisorRut.trim(),
      archivoUrl,
      tipoArchivo,
      fechaEmision: new Date().toLocaleDateString('es-CL'),
    }

    guardarGuiaDespacho(cargaId, nuevaGuia)
    setGuia(nuevaGuia)
    setIsEditing(false)
    setGuardadoExito(true)
    setTimeout(() => setGuardadoExito(false), 4000)
    if (onGuiaActualizada) onGuiaActualizada(nuevaGuia)
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 460 }}>
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: '#265370', margin: 0 }}>Documentación Tributaria SII</div>
            <div className="h2" style={{ fontSize: 20, marginTop: 2 }}>Guía de Despacho (DTE 52)</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: 'var(--slate)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Vista para el Chofer / Fiscalización */}
        {!isEditing && guia ? (
          <div>
            {/* Banner de Validez Fiscal */}
            <div
              style={{
                background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                color: '#FFFFFF',
                borderRadius: 16,
                padding: '14px 16px',
                marginBottom: 14,
                boxShadow: '0 4px 6px -1px rgba(6, 95, 70, 0.2)',
              }}
            >
              <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>🇨🇱</span>
                <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>
                  DOCUMENTO OFICIAL PARA TRANSPORTE
                </span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                Válido para controles de Carabineros de Chile y Ministerio de Transportes / SII.
              </div>
            </div>

            {/* Datos de la Guía */}
            <div className="card flat" style={{ background: 'var(--paper)', padding: '14px', borderRadius: 16, marginBottom: 14 }}>
              <div className="between" style={{ padding: '3px 0' }}>
                <span style={{ fontSize: 12, color: 'var(--slate)' }}>Folio Guía SII:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)' }}>N° {guia.folio}</span>
              </div>
              <div className="between" style={{ padding: '3px 0' }}>
                <span style={{ fontSize: 12, color: 'var(--slate)' }}>Emisor:</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{guia.emisorRazonSocial}</span>
              </div>
              <div className="between" style={{ padding: '3px 0' }}>
                <span style={{ fontSize: 12, color: 'var(--slate)' }}>RUT Emisor:</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{guia.emisorRut}</span>
              </div>
              <div className="between" style={{ padding: '3px 0' }}>
                <span style={{ fontSize: 12, color: 'var(--slate)' }}>Fecha Emisión:</span>
                <span style={{ fontSize: 12, color: 'var(--slate)' }}>{guia.fechaEmision}</span>
              </div>
            </div>

            {/* Previsualización del Documento o Timbre */}
            <div
              style={{
                border: '1.5px solid var(--line)',
                borderRadius: 16,
                padding: 12,
                textAlign: 'center',
                background: '#F8FAFC',
                marginBottom: 14,
              }}
            >
              {guia.tipoArchivo === 'imagen' ? (
                <div>
                  <img
                    src={guia.archivoUrl}
                    alt="Guía de Despacho"
                    style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 6 }}>
                    Vista previa de la Guía de Despacho con Timbre Fiscal SII
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px 8px' }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>📄</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                    Documento PDF - Guía de Despacho Electrónica
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>
                    Contiene el timbre fiscal electrónico (PDF417)
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={guia.archivoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: 13.5, background: '#265370', justifyContent: 'center', textDecoration: 'none' }}
              >
                🔍 Abrir Documento Completo en Pantalla
              </a>

              {esEmisor && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '10px', fontSize: 12 }}
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Modificar o Reemplazar Guía
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Formulario de Carga de Guía (Emisor / Negocio) */
          <div>
            <p style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 0, marginBottom: 14 }}>
              Adjunta la Guía de Despacho Electrónica para que el transportista pueda transitar y ser fiscalizado sin multas en carretera.
            </p>

            <div className="field">
              <label>Número de Folio Guía SII</label>
              <input
                placeholder="Ej. 10542"
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Razón Social del Emisor</label>
              <input
                placeholder="Ej. Agrícola y Comercial del Sur SpA"
                value={emisorRazonSocial}
                onChange={(e) => setEmisorRazonSocial(e.target.value)}
              />
            </div>

            <div className="field">
              <label>RUT del Emisor</label>
              <input
                placeholder="76.123.456-7"
                maxLength={12}
                value={emisorRut}
                onChange={(e) => setEmisorRut(formatearRut(e.target.value))}
              />
              {emisorRut.length > 0 && !rutValido && (
                <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 3 }}>RUT inválido</div>
              )}
            </div>

            {/* Subida de Archivo PDF o Foto */}
            <div className="field">
              <label>Archivo Guía de Despacho (PDF o Foto del Timbre Fiscal)</label>
              <label
                style={{
                  border: '1.5px dashed var(--line)',
                  borderRadius: 14,
                  padding: '18px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: archivoUrl ? '#ECFDF5' : 'var(--card)',
                }}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
                  }}
                />
                <span style={{ fontSize: 24, marginBottom: 4 }}>{archivoUrl ? '✅' : '📄'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: archivoUrl ? '#065F46' : 'var(--navy)' }}>
                  {subiendoArchivo
                    ? 'Subiendo archivo…'
                    : archivoUrl
                      ? '✓ Documento cargado correctamente'
                      : 'Seleccionar archivo PDF o Foto de Guía'}
                </span>
                <span style={{ fontSize: 10.5, color: 'var(--slate)', marginTop: 2 }}>
                  PDF con timbre fiscal o fotografía legible
                </span>
              </label>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            {guardadoExito && (
              <div className="pill pill-green" style={{ width: '100%', justifyContent: 'center', marginBottom: 10, padding: 8 }}>
                ✓ Guía de Despacho guardada exitosamente
              </div>
            )}

            <div className="row" style={{ gap: 8, marginTop: 14 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '14px', fontSize: 13.5, background: '#265370' }}
                disabled={!canSave || subiendoArchivo}
                onClick={handleGuardar}
              >
                💾 Guardar Guía para el Chofer
              </button>

              {guia && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '14px' }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
