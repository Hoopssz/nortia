import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { supabase } from '../../lib/supabase'
import { getSignedDocumentUrl } from '../../lib/uploadFile'
import { getErrorMessage } from '../../lib/errors'
import type { Tables } from '../../lib/database.types'

type Perfil = Tables<'perfiles'>
type Camion = Tables<'camiones'>

interface DriverVerificationItem {
  perfil: Perfil
  camion: Camion | null
  signedUrls: {
    permiso?: string
    revision?: string
    soap?: string
  }
}

export function AdminVerificacionPage() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState<DriverVerificationItem[]>([])
  const [filter, setFilter] = useState<'pendientes' | 'verificados' | 'todos'>('pendientes')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    loadDrivers()
  }, [])

  async function loadDrivers() {
    setLoading(true)
    setError(null)
    try {
      // 1. Obtener perfiles de camioneros
      const { data: perfilesData, error: pErr } = await supabase
        .from('perfiles')
        .select('*')
        .eq('rol', 'camionero')
        .order('created_at', { ascending: false })

      if (pErr) throw pErr

      // 2. Obtener camiones asociados
      const { data: camionesData, error: cErr } = await supabase
        .from('camiones')
        .select('*')

      if (cErr) throw cErr

      const items: DriverVerificationItem[] = []

      for (const p of perfilesData || []) {
        const c = camionesData?.find((cam) => cam.perfil_id === p.id) || null
        const signedUrls: DriverVerificationItem['signedUrls'] = {}

        if (c) {
          if (c.permiso_circulacion_url) {
            const url = await getSignedDocumentUrl(c.permiso_circulacion_url)
            if (url) signedUrls.permiso = url
          }
          if (c.revision_tecnica_url) {
            const url = await getSignedDocumentUrl(c.revision_tecnica_url)
            if (url) signedUrls.revision = url
          }
          if (c.soap_url) {
            const url = await getSignedDocumentUrl(c.soap_url)
            if (url) signedUrls.soap = url
          }
        }

        items.push({
          perfil: p,
          camion: c,
          signedUrls,
        })
      }

      setDrivers(items)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleAprobar(item: DriverVerificationItem) {
    setProcessingId(item.perfil.id)
    setError(null)
    setSuccessMsg(null)

    try {
      // 1. Marcar perfil como verificado
      const { error: pErr } = await supabase
        .from('perfiles')
        .update({ verificado: true })
        .eq('id', item.perfil.id)

      if (pErr) throw pErr

      // 2. Marcar documentos del camión al día
      if (item.camion) {
        const { error: cErr } = await supabase
          .from('camiones')
          .update({ documentos_al_dia: true })
          .eq('id', item.camion.id)

        if (cErr) throw cErr
      }

      setDrivers((prev) =>
        prev.map((d) =>
          d.perfil.id === item.perfil.id
            ? {
                ...d,
                perfil: { ...d.perfil, verificado: true },
                camion: d.camion ? { ...d.camion, documentos_al_dia: true } : null,
              }
            : d
        )
      )

      setSuccessMsg(`Transportista ${item.perfil.nombre || 'conductor'} verificado con éxito.`)
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setProcessingId(null)
    }
  }

  async function handleRechazar(item: DriverVerificationItem) {
    setProcessingId(item.perfil.id)
    setError(null)
    setSuccessMsg(null)

    try {
      const { error: pErr } = await supabase
        .from('perfiles')
        .update({ verificado: false })
        .eq('id', item.perfil.id)

      if (pErr) throw pErr

      if (item.camion) {
        const { error: cErr } = await supabase
          .from('camiones')
          .update({ documentos_al_dia: false })
          .eq('id', item.camion.id)

        if (cErr) throw cErr
      }

      setDrivers((prev) =>
        prev.map((d) =>
          d.perfil.id === item.perfil.id
            ? {
                ...d,
                perfil: { ...d.perfil, verificado: false },
                camion: d.camion ? { ...d.camion, documentos_al_dia: false } : null,
              }
            : d
        )
      )

      setSuccessMsg(`Estado de verificación revocado para ${item.perfil.nombre || 'conductor'}.`)
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setProcessingId(null)
    }
  }

  const filteredDrivers = drivers.filter((d) => {
    if (filter === 'pendientes') {
      return !d.perfil.verificado
    }
    if (filter === 'verificados') {
      return d.perfil.verificado
    }
    return true
  })

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 50, maxWidth: 540, margin: '0 auto', width: '100%' }}>
      <div className="row" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => navigate('/home')}>
        <Icon name="arrowL" size={18} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Volver a la app</span>
      </div>

      <div className="between">
        <div>
          <span className="pill pill-navy" style={{ marginBottom: 8 }}>
            <Icon name="shield" size={13} strokeWidth={1.9} /> BACKOFFICE NORTIA
          </span>
          <div className="h2" style={{ marginTop: 4 }}>
            Verificación de Conductores
          </div>
          <div className="sub">
            Revisa los certificados del camión (RUT, Permiso, Revisión, SOAP) y aprueba el Sello de Verificación.
          </div>
        </div>
      </div>

      {successMsg && (
        <div
          className="card flat"
          style={{
            background: '#ECFDF5',
            border: '1.5px solid #10B981',
            color: '#065F46',
            marginTop: 14,
            padding: 12,
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          <Icon name="check" size={14} strokeWidth={2.5} /> {successMsg}
        </div>
      )}

      {error && (
        <div className="card flat" style={{ background: 'var(--danger-soft)', marginTop: 14, padding: 12, color: 'var(--danger)', fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {/* Selector de filtros */}
      <div className="row" style={{ gap: 8, marginTop: 16 }}>
        {(
          [
            ['pendientes', 'Pendientes'],
            ['verificados', 'Verificados'],
            ['todos', 'Todos'],
          ] as const
        ).map(([fKey, fLabel]) => (
          <span
            key={fKey}
            className={`chip ${filter === fKey ? 'on' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setFilter(fKey)}
          >
            {fLabel}
          </span>
        ))}
      </div>

      {loading && <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 20 }}>Cargando solicitudes…</p>}

      {!loading && filteredDrivers.length === 0 && (
        <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 30, marginTop: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>
            {filter === 'pendientes' ? 'No hay solicitudes pendientes de revisión.' : 'No hay conductores en esta lista.'}
          </p>
        </div>
      )}

      {!loading &&
        filteredDrivers.map((item) => {
          const isProcessing = processingId === item.perfil.id
          const hasPermiso = Boolean(item.camion?.permiso_circulacion_url)
          const hasRevision = Boolean(item.camion?.revision_tecnica_url)
          const hasSoap = Boolean(item.camion?.soap_url)
          const totalDocs = [hasPermiso, hasRevision, hasSoap].filter(Boolean).length

          return (
            <div
              key={item.perfil.id}
              className="card"
              style={{
                marginTop: 14,
                border: item.perfil.verificado ? '1.5px solid #10B981' : '1.5px solid var(--line)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="between" style={{ alignItems: 'flex-start' }}>
                <div className="row" style={{ gap: 12 }}>
                  <div
                    className="ic-chip ic-navy"
                    style={{ width: 44, height: 44, borderRadius: 14, fontSize: 16, fontWeight: 800 }}
                  >
                    {(item.perfil.nombre || 'TR').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="row" style={{ gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{item.perfil.nombre || 'Conductor sin nombre'}</span>
                      {item.perfil.verificado && (
                        <span className="verified">
                          <Icon name="check" size={11} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>
                      {item.perfil.telefono ? `Tel: ${item.perfil.telefono}` : 'Sin teléfono'} · RUT: {item.perfil.rut || 'No registrado'}
                    </div>
                  </div>
                </div>

                <span className={`pill ${item.perfil.verificado ? 'pill-green' : 'pill-navy'}`}>
                  {item.perfil.verificado ? 'Verificado' : 'Por revisar'}
                </span>
              </div>

              {/* Datos del camión */}
              {item.camion ? (
                <div
                  className="card flat"
                  style={{
                    background: 'var(--paper)',
                    marginTop: 12,
                    padding: '10px 12px',
                    fontSize: 12,
                  }}
                >
                  <div className="between">
                    <span>
                      <b>Vehículo:</b> {item.camion.tipo} ({item.camion.patente})
                    </span>
                    <span>
                      <b>Capacidad:</b> {(item.camion.carga_max_kg / 1000).toFixed(1)} TON
                    </span>
                  </div>
                  {item.camion.marca && (
                    <div style={{ color: 'var(--slate)', marginTop: 4 }}>
                      {item.camion.marca} {item.camion.modelo} ({item.camion.anio || 'Año no especificado'})
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 8, fontStyle: 'italic' }}>
                  Aún no ha registrado las especificaciones del camión.
                </div>
              )}

              {/* Lista de Documentos */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate)', marginBottom: 6 }}>
                  Documentos adjuntos ({totalDocs}/3)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Permiso de circulación */}
                  <div className="between" style={{ padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 12 }}>Permiso de circulación</span>
                    {hasPermiso && item.signedUrls.permiso ? (
                      <a
                        href={item.signedUrls.permiso}
                        target="_blank"
                        rel="noreferrer"
                        className="pill pill-navy"
                        style={{ textDecoration: 'none', cursor: 'pointer', fontSize: 11 }}
                      >
                        <Icon name="eye" size={12} strokeWidth={2} /> Ver archivo
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--slate)' }}>No subido</span>
                    )}
                  </div>

                  {/* Revisión técnica */}
                  <div className="between" style={{ padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 12 }}>Revisión técnica</span>
                    {hasRevision && item.signedUrls.revision ? (
                      <a
                        href={item.signedUrls.revision}
                        target="_blank"
                        rel="noreferrer"
                        className="pill pill-navy"
                        style={{ textDecoration: 'none', cursor: 'pointer', fontSize: 11 }}
                      >
                        <Icon name="eye" size={12} strokeWidth={2} /> Ver archivo
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--slate)' }}>No subido</span>
                    )}
                  </div>

                  {/* SOAP */}
                  <div className="between" style={{ padding: '4px 0' }}>
                    <span style={{ fontSize: 12 }}>Seguro SOAP</span>
                    {hasSoap && item.signedUrls.soap ? (
                      <a
                        href={item.signedUrls.soap}
                        target="_blank"
                        rel="noreferrer"
                        className="pill pill-navy"
                        style={{ textDecoration: 'none', cursor: 'pointer', fontSize: 11 }}
                      >
                        <Icon name="eye" size={12} strokeWidth={2} /> Ver archivo
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--slate)' }}>No subido</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción para el equipo NORTIA */}
              <div className="row" style={{ gap: 8, marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                {!item.perfil.verificado ? (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '9px 14px', fontSize: 12.5 }}
                    disabled={isProcessing}
                    onClick={() => handleAprobar(item)}
                  >
                    {isProcessing ? 'Validando…' : (
                      <>
                        <Icon name="check" size={14} strokeWidth={2.6} /> Aprobar y Activar Sello
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '9px 14px', fontSize: 12.5, color: 'var(--danger)' }}
                    disabled={isProcessing}
                    onClick={() => handleRechazar(item)}
                  >
                    {isProcessing ? 'Actualizando…' : 'Revocar verificación'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
