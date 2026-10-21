import {
  EMERGENCIAS_CHILE,
  generarMensajeSeguridadFamilia,
} from '../lib/safetyService'

interface SafetyToolkitModalProps {
  isOpen: boolean
  origenTexto: string
  destinoTexto: string
  patente: string
  viajeId: string
  onClose: () => void
}

export function SafetyToolkitModal({
  isOpen,
  origenTexto,
  destinoTexto,
  patente,
  viajeId,
  onClose,
}: SafetyToolkitModalProps) {
  if (!isOpen) return null

  const mensajeFamilia = generarMensajeSeguridadFamilia(
    origenTexto,
    destinoTexto,
    patente,
    viajeId
  )

  const urlWhatsapp = `https://wa.me/?text=${encodeURIComponent(mensajeFamilia)}`

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 440, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 24 }}>🛡️</span>
            <div>
              <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
                Safety Toolkit
              </div>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                Seguridad & Tranquilidad Familiar
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 16px' }}>
          Herramientas de protección en carretera para viajar comunicado con tus seres queridos y ante cualquier emergencia.
        </p>

        {/* Botón Destacado: Compartir con la Familia */}
        <a
          href={urlWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '16px',
            background: '#15803D',
            color: '#FFFFFF',
            fontSize: 13.5,
            borderRadius: 16,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 8px 20px -6px rgba(21, 128, 61, 0.5)',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 20 }}>💬</span>
          <span>Compartir Viaje en Vivo por WhatsApp</span>
        </a>

        {/* Números de Emergencia Nacional */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Llamadas Rápidas de Emergencia
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {EMERGENCIAS_CHILE.map((em) => (
            <a
              key={em.numero}
              href={`tel:${em.numero}`}
              className="card flat selectable"
              style={{
                padding: '10px 12px',
                margin: 0,
                background: '#FFFFFF',
                border: '1px solid var(--line)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div className="row" style={{ gap: 6 }}>
                <span style={{ fontSize: 18 }}>{em.icono}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--ink)' }}>{em.nombre}</div>
                  <div style={{ fontSize: 10.5, color: '#DC2626', fontWeight: 800 }}>Marcación: {em.numero}</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Protocolo de Seguridad en Carretera */}
        <div
          className="card flat"
          style={{
            background: 'var(--navy-tint)',
            border: 'none',
            padding: '12px 14px',
            borderRadius: 14,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--navy)', marginBottom: 4 }}>
            💡 Protocolo de Pana o Detención Nocturna
          </div>
          <div style={{ fontSize: 11, color: 'var(--navy-700)', lineHeight: 1.4 }}>
            Enciende luces de advertencia, colócate el chaleco reflectante antes de bajar y ubícate siempre detrás de la barrera de contención (bionda).
          </div>
        </div>
      </div>
    </div>
  )
}
