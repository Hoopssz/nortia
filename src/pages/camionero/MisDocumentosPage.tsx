import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { uploadToBucket, sanitizeFileName, getSignedDocumentUrl } from '../../lib/uploadFile'
import { getErrorMessage } from '../../lib/errors'
import {
  obtenerDocumentosBoveda,
  actualizarFechaDoc,
  type DocumentoVencimiento,
  type EstadoSemaforo,
} from '../../lib/docExpiryService'
import type { Tables } from '../../lib/database.types'

type Camion = Tables<'camiones'>

const SEMAFORO_BADGE: Record<EstadoSemaforo, { label: string; cls: string }> = {
  vigente: { label: 'Vigente', cls: 'pill-green' },
  por_vencer: { label: 'Por Vencer (≤30 días)', cls: 'pill-navy' },
  vencido: { label: 'Vencido', cls: 'pill-danger' },
  sin_fecha: { label: 'Permanente', cls: 'pill-green' },
}

function getDocIcon(tipo: DocumentoVencimiento['tipoDoc']) {
  switch (tipo) {
    case 'revision_tecnica':
      return <Icon name="truck" size={20} strokeWidth={1.8} />
    case 'permiso_circulacion':
      return <Icon name="file" size={20} strokeWidth={1.8} />
    case 'soap':
      return <Icon name="shield" size={20} strokeWidth={1.8} />
    case 'licencia':
      return <Icon name="user" size={20} strokeWidth={1.8} />
    case 'padron':
    default:
      return <Icon name="check" size={20} strokeWidth={1.8} />
  }
}

export function MisDocumentosPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [camion, setCamion] = useState<Camion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})

  // Bóveda de Documentos con Semáforo
  const [bovedaDocs, setBovedaDocs] = useState<DocumentoVencimiento[]>([])
  const [editingDocId, setEditingDocId] = useState<string | null>(null)
  const [tempFecha, setTempFecha] = useState('')

  useEffect(() => {
    if (!session?.user.id) return
    let active = true

    async function load() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('camiones')
          .select('*')
          .eq('perfil_id', session!.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (fetchErr) throw fetchErr

        if (active) {
          setCamion(data)
          if (data) {
            const vault = obtenerDocumentosBoveda(data.id)
            setBovedaDocs(vault)

            // Cargar URLs firmadas
            const urls: Record<string, string> = {}
            if (data.permiso_circulacion_url) {
              const url = await getSignedDocumentUrl(data.permiso_circulacion_url)
              if (url) urls['permiso_circulacion'] = url
            }
            if (data.revision_tecnica_url) {
              const url = await getSignedDocumentUrl(data.revision_tecnica_url)
              if (url) urls['revision_tecnica'] = url
            }
            if (data.soap_url) {
              const url = await getSignedDocumentUrl(data.soap_url)
              if (url) urls['soap'] = url
            }
            setPreviewUrls(urls)
          }
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [session])

  async function handleFileChange(tipoDoc: DocumentoVencimiento['tipoDoc'], file: File | null) {
    if (!file || !camion || !session?.user.id) return
    setUploadingDoc(tipoDoc)
    setError(null)

    try {
      const stamp = Date.now()
      const path = `${session.user.id}/${tipoDoc}-${stamp}-${sanitizeFileName(file.name)}`
      const uploadedPath = await uploadToBucket('documentos', path, file)

      const updateData: {
        permiso_circulacion_url?: string
        revision_tecnica_url?: string
        soap_url?: string
      } = {}

      if (tipoDoc === 'permiso_circulacion') updateData.permiso_circulacion_url = uploadedPath
      if (tipoDoc === 'revision_tecnica') updateData.revision_tecnica_url = uploadedPath
      if (tipoDoc === 'soap') updateData.soap_url = uploadedPath

      if (Object.keys(updateData).length > 0) {
        const { error: updateErr } = await supabase
          .from('camiones')
          .update(updateData)
          .eq('id', camion.id)
        if (updateErr) throw updateErr
      }

      const signedUrl = await getSignedDocumentUrl(uploadedPath)
      if (signedUrl) {
        setPreviewUrls((prev) => ({ ...prev, [tipoDoc]: signedUrl }))
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUploadingDoc(null)
    }
  }

  function handleGuardarFecha(docId: string) {
    if (!camion || !tempFecha) return
    const actualizados = actualizarFechaDoc(camion.id, docId, tempFecha)
    setBovedaDocs(actualizados)
    setEditingDocId(null)
    setTempFecha('')
  }

  const docsCriticosVencidos = bovedaDocs.filter((d) => d.estadoSemaforo === 'vencido')
  const docsPorVencer = bovedaDocs.filter((d) => d.estadoSemaforo === 'por_vencer')
  const docsVigentes = bovedaDocs.filter((d) => d.estadoSemaforo === 'vigente' || d.estadoSemaforo === 'sin_fecha')

  return (
    <WebPlatformLayout activeTab="Documentación">
      <div className="web-platform-container">
        {/* Header con migas y botón volver */}
        <div className="between" style={{ marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Cumplimiento & Normativa Nacional</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              Bóveda de Documentos del Transporte
            </div>
          </div>

          <button
            type="button"
            className="chip"
            style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
            onClick={() => navigate('/camionero')}
          >
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Panel Operativo</span>
          </button>
        </div>

        <div className="sub" style={{ marginBottom: 20, maxWidth: 800 }}>
          Mantén los certificados de tu camión y chofer al día para circular con total tranquilidad, respaldo legal y acreditación inmediata ante fiscalizadores del Ministerio de Transportes y Carabineros de Chile.
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate)' }}>
            Cargando bóveda documental segura…
          </div>
        )}

        {!loading && error && (
          <div className="card flat" style={{ background: 'var(--danger-soft)', marginBottom: 20, padding: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>{error}</div>
          </div>
        )}

        {!loading && !camion && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--navy-tint)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="truck" size={26} strokeWidth={1.8} />
            </div>
            <div className="h3" style={{ margin: '0 0 8px' }}>Camión no registrado</div>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 20px' }}>
              Debes asociar tu camión y patente primero para gestionar la bóveda documental y habilitar fletes.
            </p>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => navigate('/onboarding/camion?agregar=1')}>
              Registrar camión ahora
            </button>
          </div>
        )}

        {!loading && camion && (
          <div className="two-col-grid" style={{ alignItems: 'start' }}>
            {/* Columna 1: Semáforo y Lista de Certificados */}
            <div>
              {/* Banner de Estado General */}
              {docsCriticosVencidos.length > 0 ? (
                <div
                  className="card"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1.5px solid #EF4444',
                    padding: '16px 18px',
                    marginBottom: 16,
                  }}
                >
                  <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ color: '#DC2626', marginTop: 2 }}>
                      <Icon name="alert" size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#DC2626' }}>
                        {docsCriticosVencidos.length} documento(s) con vigencia vencida
                      </div>
                      <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 3, lineHeight: 1.4 }}>
                        Renueva tus certificados lo antes posible para evitar infracciones de tránsito o paralizaciones en ruta.
                      </div>
                    </div>
                  </div>
                </div>
              ) : docsPorVencer.length > 0 ? (
                <div
                  className="card"
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1.5px solid #F59E0B',
                    padding: '16px 18px',
                    marginBottom: 16,
                  }}
                >
                  <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ color: '#D97706', marginTop: 2 }}>
                      <Icon name="info" size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#D97706' }}>
                        {docsPorVencer.length} documento(s) próximo(s) a vencer
                      </div>
                      <div style={{ fontSize: 12, color: '#B45309', marginTop: 3, lineHeight: 1.4 }}>
                        Planifica con anticipación tu renovación municipal o visita a la planta de revisión técnica.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1.5px solid #10B981',
                    padding: '16px 18px',
                    marginBottom: 16,
                  }}
                >
                  <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ color: '#059669', marginTop: 2 }}>
                      <Icon name="check" size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#059669' }}>
                        Toda tu documentación está al día
                      </div>
                      <div style={{ fontSize: 12, color: '#047857', marginTop: 3, lineHeight: 1.4 }}>
                        Tu unidad ({camion.patente}) cuenta con el Sello de Verificación NORTIA habilitado.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--navy)' }}>
                Certificados del Camión & Chofer ({bovedaDocs.length})
              </div>

              {/* Lista de Documentos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bovedaDocs.map((doc) => {
                  const semaforo = SEMAFORO_BADGE[doc.estadoSemaforo]
                  const previewUrl = previewUrls[doc.tipoDoc]
                  const isUploading = uploadingDoc === doc.tipoDoc
                  const isEditing = editingDocId === doc.id

                  return (
                    <div
                      key={doc.id}
                      className="card"
                      style={{
                        padding: '16px 18px',
                        margin: 0,
                        border:
                          doc.estadoSemaforo === 'vencido'
                            ? '1.5px solid #EF4444'
                            : doc.estadoSemaforo === 'por_vencer'
                              ? '1.5px solid #F59E0B'
                              : '1px solid var(--card-glass-border)',
                      }}
                    >
                      <div className="between" style={{ alignItems: 'flex-start', marginBottom: 12, gap: 10 }}>
                        <div className="row" style={{ gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: 'var(--navy-tint)',
                              color: 'var(--navy)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getDocIcon(doc.tipoDoc)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>{doc.titulo}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>{doc.subtitulo}</div>
                          </div>
                        </div>

                        <span className={`pill ${semaforo.cls}`} style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          ✦ {semaforo.label}
                        </span>
                      </div>

                      {/* Estado de Vencimiento y Botón para Editar Fecha */}
                      <div
                        className="card flat"
                        style={{
                          background: 'var(--paper)',
                          padding: '10px 14px',
                          borderRadius: 12,
                          marginBottom: 12,
                        }}
                      >
                        {isEditing ? (
                          <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              type="date"
                              value={tempFecha}
                              onChange={(e) => setTempFecha(e.target.value)}
                              style={{
                                fontSize: 12,
                                padding: '6px 10px',
                                borderRadius: 10,
                                border: '1px solid var(--line)',
                                background: 'var(--surface)',
                                color: 'var(--ink)',
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ width: 'auto', padding: '6px 12px', fontSize: 11, borderRadius: 8 }}
                              onClick={() => handleGuardarFecha(doc.id)}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ width: 'auto', padding: '6px 8px', fontSize: 11 }}
                              onClick={() => setEditingDocId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="between" style={{ alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 10.5, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Fecha de Vencimiento:</div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>
                                {doc.fechaVencimiento
                                  ? new Date(doc.fechaVencimiento + 'T12:00:00').toLocaleDateString('es-CL', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })
                                  : 'Vigencia Indefinida'}
                              </div>
                              {doc.fechaVencimiento && (
                                <div style={{ fontSize: 11, fontWeight: 600, color: doc.diasRestantes! < 0 ? '#EF4444' : doc.diasRestantes! <= 30 ? '#F59E0B' : 'var(--slate)', marginTop: 2 }}>
                                  {doc.diasRestantes! < 0
                                    ? `Venció hace ${Math.abs(doc.diasRestantes!)} días`
                                    : `Vence en ${doc.diasRestantes} días`}
                                </div>
                              )}
                            </div>

                            {doc.fechaVencimiento && (
                              <button
                                type="button"
                                className="chip"
                                style={{ fontSize: 11, padding: '5px 10px', cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
                                onClick={() => {
                                  setEditingDocId(doc.id)
                                  setTempFecha(doc.fechaVencimiento || '')
                                }}
                              >
                                <span>Modificar</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acciones de Archivo */}
                      <div className="row" style={{ gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {previewUrl && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '7px 14px', fontSize: 12, borderRadius: 10, width: 'auto' }}
                            onClick={() => window.open(previewUrl, '_blank')}
                          >
                            <Icon name="eye" size={13} strokeWidth={2} />
                            <span>Ver Copia Digital</span>
                          </button>
                        )}

                        <label
                          className="btn btn-primary"
                          style={{
                            padding: '7px 16px',
                            fontSize: 12,
                            borderRadius: 10,
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            opacity: isUploading ? 0.7 : 1,
                            margin: 0,
                            width: 'auto',
                            background: 'var(--navy)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {isUploading ? (
                            'Subiendo…'
                          ) : previewUrl ? (
                            <>
                              <Icon name="refresh" size={12} strokeWidth={2} />
                              <span>Actualizar Archivo</span>
                            </>
                          ) : (
                            <>
                              <Icon name="upload" size={12} strokeWidth={2} />
                              <span>Subir Documento</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            disabled={isUploading}
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(doc.tipoDoc, e.target.files?.[0] ?? null)}
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Columna 2: Ficha Técnica, Ley de Tránsito y Respaldo NORTIA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Ficha de la Unidad */}
              <div className="card" style={{ padding: '20px' }}>
                <div className="between" style={{ alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>
                    Ficha Técnica de la Unidad
                  </div>
                  <span className="pill pill-navy" style={{ fontSize: 11, fontWeight: 700 }}>
                    Patente: {camion.patente}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                  <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--slate)' }}>Tipo de Camión</span>
                    <b style={{ color: 'var(--ink)' }}>{camion.tipo || 'Carga General'}</b>
                  </div>
                  <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--slate)' }}>Capacidad de Carga</span>
                    <b style={{ color: 'var(--ink)' }}>{camion.carga_max_kg ? `${camion.carga_max_kg.toLocaleString('es-CL')} kg` : 'No especificada'}</b>
                  </div>
                  <div className="between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--slate)' }}>Certificados en Bóveda</span>
                    <b style={{ color: 'var(--ink)' }}>{bovedaDocs.length} documentos</b>
                  </div>
                  <div className="between">
                    <span style={{ color: 'var(--slate)' }}>Documentos Vigentes</span>
                    <b style={{ color: '#059669' }}>{docsVigentes.length} al día</b>
                  </div>
                </div>
              </div>

              {/* Protocolo Bóveda Segura NORTIA */}
              <div
                className="card"
                style={{
                  background: 'var(--navy-tint)',
                  borderColor: 'rgba(30, 58, 138, 0.15)',
                  padding: '18px 20px',
                }}
              >
                <div className="row" style={{ gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ color: 'var(--navy)', marginTop: 2 }}>
                    <Icon name="shield" size={20} strokeWidth={2} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>
                    Bóveda Segura NORTIA
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--navy-700)', lineHeight: 1.55 }}>
                  Tus certificados están cifrados y respaldados en la nube. Puedes acceder a ellos y presentarlos en cualquier control de carretera ante Carabineros o fiscalizadores del MTT incluso sin conexión física a carpetas de papel.
                </div>
              </div>

              {/* Normativa Chilena */}
              <div className="card" style={{ padding: '18px 20px' }}>
                <div className="row" style={{ gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ color: 'var(--navy)' }}>
                    <Icon name="file" size={18} strokeWidth={2} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                    Marco Regulatorio (Ley 18.290)
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.5 }}>
                  En Chile, transitar con la Revisión Técnica o el SOAP vencido constituye una falta grave que faculta el retiro inmediato de circulación del vehículo por la autoridad competente. Mantener tus fechas actualizadas protege tus viajes garantizados por NORTIA Escrow.
                </div>
              </div>

              {/* Acceso Rápido a Choferes */}
              <div
                className="card between"
                style={{
                  padding: '14px 18px',
                  cursor: 'pointer',
                  background: 'var(--card-glass-bg)',
                  borderColor: 'var(--card-glass-border)',
                }}
                onClick={() => navigate('/camionero/choferes')}
              >
                <div className="row" style={{ gap: 10 }}>
                  <div style={{ color: 'var(--navy)' }}>
                    <Icon name="user" size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                      Gestionar Choferes de Flota
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                      Vincular nómina o buscar conductores con licencia A5
                    </div>
                  </div>
                </div>
                <Icon name="chevR" size={16} strokeWidth={2} />
              </div>
            </div>
          </div>
        )}
      </div>
    </WebPlatformLayout>
  )
}
