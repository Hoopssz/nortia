import { useState, useRef, useEffect } from 'react'
import { validarRut, formatearRut } from '../lib/validators'
import { uploadToBucket, sanitizeFileName, getSignedDocumentUrl } from '../lib/uploadFile'
import { useAuth } from '../contexts/useAuth'
import { Icon } from './Icon'
import { guardarComprobanteEntrega, type ComprobanteEntrega } from '../lib/podService'

interface ProofOfDeliveryModalProps {
  isOpen: boolean
  viajeId: string
  destinoTexto: string
  onClose: () => void
  onSuccess: (pod: ComprobanteEntrega) => void
}

export function ProofOfDeliveryModal({
  isOpen,
  viajeId,
  destinoTexto,
  onClose,
  onSuccess,
}: ProofOfDeliveryModalProps) {
  const { session } = useAuth()

  const [nombreReceptor, setNombreReceptor] = useState('')
  const [rutReceptor, setRutReceptor] = useState('')
  const [tipoRecepcion, setTipoRecepcion] = useState<'conforme' | 'con_novedades'>('conforme')
  const [bultosRechazados, setBultosRechazados] = useState('')
  const [detalleDano, setDetalleDano] = useState('')
  const [fotoDanoUrl, setFotoDanoUrl] = useState<string | null>(null)
  const [uploadingDano, setUploadingDano] = useState(false)
  const [observaciones, setObservaciones] = useState('')

  const [fotoEntregaUrl, setFotoEntregaUrl] = useState<string | null>(null)
  const [fotoGuiaUrl, setFotoGuiaUrl] = useState<string | null>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [uploadingGuia, setUploadingGuia] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Canvas para firma digital
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0B192C'
  }, [isOpen])

  if (!isOpen) return null

  // Manejo de firma táctil y con mouse
  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  function stopDrawing() {
    setIsDrawing(false)
  }

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  async function handleFotoUpload(file: File, tipo: 'entrega' | 'guia' | 'dano') {
    if (!session?.user.id) return
    setError(null)
    if (tipo === 'entrega') setUploadingFoto(true)
    else if (tipo === 'guia') setUploadingGuia(true)
    else setUploadingDano(true)

    try {
      if (navigator.onLine) {
        const path = `${session.user.id}/pod_${tipo}_${Date.now()}_${sanitizeFileName(file.name)}`
        const uploadedPath = await uploadToBucket('documentos', path, file)
        const signedUrl = await getSignedDocumentUrl(uploadedPath)
        const finalUrl = signedUrl || uploadedPath
        if (tipo === 'entrega') setFotoEntregaUrl(finalUrl)
        else if (tipo === 'guia') setFotoGuiaUrl(finalUrl)
        else setFotoDanoUrl(finalUrl)
      } else {
        // Modo offline: convertir a DataURL local
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            if (tipo === 'entrega') setFotoEntregaUrl(reader.result)
            else if (tipo === 'guia') setFotoGuiaUrl(reader.result)
            else setFotoDanoUrl(reader.result)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      // Fallback a FileReader si falla el bucket
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (tipo === 'entrega') setFotoEntregaUrl(reader.result)
          else if (tipo === 'guia') setFotoGuiaUrl(reader.result)
          else setFotoDanoUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      if (tipo === 'entrega') setUploadingFoto(false)
      else if (tipo === 'guia') setUploadingGuia(false)
      else setUploadingDano(false)
    }
  }

  const rutValido = validarRut(rutReceptor)
  const canSubmit = nombreReceptor.trim().length >= 3 && rutValido && (hasSignature || fotoEntregaUrl || fotoGuiaUrl)

  async function handleSubmit() {
    if (!canSubmit) return
    setGuardando(true)
    setError(null)

    try {
      let firmaBase64: string | null = null
      if (hasSignature && canvasRef.current) {
        firmaBase64 = canvasRef.current.toDataURL('image/png')
      }

      const podData: ComprobanteEntrega = {
        viajeId,
        nombreReceptor,
        rutReceptor,
        tipoRecepcion,
        bultosRechazados: bultosRechazados ? Number(bultosRechazados) : undefined,
        detalleDano: detalleDano || undefined,
        fotoEntregaUrl,
        fotoGuiaUrl,
        fotoDanoUrl,
        firmaBase64,
        observaciones: observaciones || null,
        fechaHora: new Date().toLocaleDateString('es-CL', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      guardarComprobanteEntrega(viajeId, podData)
      onSuccess(podData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar comprobante')
      setGuardando(false)
    }
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 440 }}>
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: '#059669', margin: 0 }}>Comprobante de Entrega (POD)</div>
            <div className="h2" style={{ fontSize: 20, marginTop: 2 }}>Recepción de Carga</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
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

        <div
          className="card flat"
          style={{
            background: 'var(--paper)',
            padding: '10px 12px',
            borderRadius: 12,
            marginBottom: 14,
            fontSize: 12,
          }}
        >
          <span style={{ color: 'var(--slate)' }}>Destino:</span> <b>{destinoTexto}</b>
        </div>

        {/* 1. Datos del Receptor */}
        <div className="field">
          <label>Nombre de quien recibe en destino</label>
          <input
            placeholder="Ej. Carlos Valenzuela (Jefe de Bodega)"
            value={nombreReceptor}
            onChange={(e) => setNombreReceptor(e.target.value)}
          />
        </div>

        <div className="field">
          <label>RUT de quien recibe</label>
          <input
            placeholder="15.892.341-K"
            maxLength={12}
            value={rutReceptor}
            onChange={(e) => setRutReceptor(formatearRut(e.target.value))}
          />
          {rutReceptor.length > 0 && !rutValido && (
            <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 3 }}>RUT inválido</div>
          )}
        </div>

        {/* 2. Condición de la Recepción */}
        <div className="eyebrow" style={{ marginTop: 12, marginBottom: 8 }}>Condición de Recepción</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div
            className="card flat"
            style={{
              padding: '10px 12px',
              margin: 0,
              cursor: 'pointer',
              border: `1.5px solid ${tipoRecepcion === 'conforme' ? '#10B981' : 'var(--line)'}`,
              background: tipoRecepcion === 'conforme' ? '#ECFDF5' : '#FFFFFF',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onClick={() => setTipoRecepcion('conforme')}
          >
            <input type="radio" checked={tipoRecepcion === 'conforme'} onChange={() => setTipoRecepcion('conforme')} style={{ margin: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 12, color: tipoRecepcion === 'conforme' ? '#065F46' : 'var(--ink)' }}>
                Recepción Conforme
              </div>
              <div style={{ fontSize: 10, color: 'var(--slate)' }}>Sin daños ni faltantes</div>
            </div>
          </div>

          <div
            className="card flat"
            style={{
              padding: '10px 12px',
              margin: 0,
              cursor: 'pointer',
              border: `1.5px solid ${tipoRecepcion === 'con_novedades' ? '#F59E0B' : 'var(--line)'}`,
              background: tipoRecepcion === 'con_novedades' ? '#FFFBEB' : '#FFFFFF',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onClick={() => setTipoRecepcion('con_novedades')}
          >
            <input type="radio" checked={tipoRecepcion === 'con_novedades'} onChange={() => setTipoRecepcion('con_novedades')} style={{ margin: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 12, color: tipoRecepcion === 'con_novedades' ? '#B45309' : 'var(--ink)' }}>
                Con Merma / Daño
              </div>
              <div style={{ fontSize: 10, color: 'var(--slate)' }}>Rechazo parcial</div>
            </div>
          </div>
        </div>

        {/* Campos adicionales si hay daño o rechazo */}
        {tipoRecepcion === 'con_novedades' && (
          <div className="card flat" style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', padding: '12px 14px', borderRadius: 14, marginBottom: 14 }}>
            <div className="eyebrow" style={{ color: '#B45309', marginBottom: 6 }}>Acta de Merma / Rechazo</div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Cantidad de Bultos / Pallets Rechazados</label>
              <input
                type="number"
                min={1}
                placeholder="Ej. 2 pallets dañados"
                value={bultosRechazados}
                onChange={(e) => setBultosRechazados(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Causa del Rechazo o Descripción del Daño</label>
              <input
                placeholder="Ej. Cajas rotas en base del pallet por frenada"
                value={detalleDano}
                onChange={(e) => setDetalleDano(e.target.value)}
              />
            </div>

            <label
              style={{
                border: '1.5px dashed #F59E0B',
                borderRadius: 12,
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                background: fotoDanoUrl ? '#FEF3C7' : '#FFFFFF',
              }}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFotoUpload(e.target.files[0], 'dano')
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                {uploadingDano ? 'Subiendo foto del daño…' : fotoDanoUrl ? '✓ Foto de Daño Adjuntada' : '+ Adjuntar Foto de Evidencia de Daño'}
              </span>
            </label>
          </div>
        )}

        {/* 3. Fotos de Respaldo */}
        <div className="eyebrow" style={{ marginTop: 12, marginBottom: 8 }}>Fotos de Respaldo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {/* Foto de la Carga */}
          <div>
            <label
              style={{
                border: '1.5px dashed var(--line)',
                borderRadius: 14,
                padding: '14px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                background: fotoEntregaUrl ? '#ECFDF5' : 'var(--card)',
                height: 100,
              }}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFotoUpload(e.target.files[0], 'entrega')
                }}
              />
              <div style={{ marginBottom: 4, color: fotoEntregaUrl ? '#065F46' : 'var(--navy)' }}>
                <Icon name="camera" size={22} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: fotoEntregaUrl ? '#065F46' : 'var(--navy)' }}>
                {uploadingFoto ? 'Subiendo…' : fotoEntregaUrl ? '✓ Foto Carga OK' : 'Foto de Carga'}
              </span>
            </label>
          </div>

          {/* Foto de Guía de Despacho */}
          <div>
            <label
              style={{
                border: '1.5px dashed var(--line)',
                borderRadius: 14,
                padding: '14px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                background: fotoGuiaUrl ? '#ECFDF5' : 'var(--card)',
                height: 100,
              }}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFotoUpload(e.target.files[0], 'guia')
                }}
              />
              <div style={{ marginBottom: 4, color: fotoGuiaUrl ? '#065F46' : 'var(--navy)' }}>
                <Icon name="doc" size={22} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: fotoGuiaUrl ? '#065F46' : 'var(--navy)' }}>
                {uploadingGuia ? 'Subiendo…' : fotoGuiaUrl ? '✓ Guía Timbrada OK' : 'Guía Timbrada'}
              </span>
            </label>
          </div>
        </div>

        {/* 3. Firma Digital Táctil */}
        <div className="between" style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Firma digital del receptor</label>
          {hasSignature && (
            <button
              type="button"
              onClick={clearSignature}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >
              Limpiar firma
            </button>
          )}
        </div>

        <div
          style={{
            border: '1.5px solid var(--line)',
            borderRadius: 14,
            background: '#F8FAFC',
            overflow: 'hidden',
            marginBottom: 12,
            touchAction: 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            width={380}
            height={110}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ width: '100%', height: 110, display: 'block', cursor: 'crosshair' }}
          />
          {!hasSignature && (
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--slate)', paddingBottom: 6 }}>
              Firme con el dedo o lápiz táctil aquí
            </div>
          )}
        </div>

        {/* 4. Observaciones */}
        <div className="field">
          <label>Observaciones (Opcional)</label>
          <input
            placeholder="Ej. Sin novedades, pallets sellados conforme."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 10 }}>{error}</p>}

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: 14, background: '#059669' }}
          disabled={!canSubmit || guardando}
          onClick={handleSubmit}
        >
          {guardando ? 'Emitiendo comprobante…' : 'Confirmar y Finalizar Entrega'}
        </button>
      </div>
    </div>
  )
}
