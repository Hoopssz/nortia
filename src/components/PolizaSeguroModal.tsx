import { PLANES_SEGURO, type PolizaSeguro } from '../lib/insuranceService'

interface PolizaSeguroModalProps {
  isOpen: boolean
  poliza: PolizaSeguro
  onClose: () => void
}

export function PolizaSeguroModal({
  isOpen,
  poliza,
  onClose,
}: PolizaSeguroModalProps) {
  if (!isOpen) return null

  const planInfo = PLANES_SEGURO[poliza.plan]

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 440 }}>
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: '#265370', margin: 0 }}>Certificado Oficial de Cobertura</div>
            <div className="h2" style={{ fontSize: 20, marginTop: 2 }}>Póliza NORTIA Seguros</div>
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

        {/* Tarjeta de la Póliza */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0B192C 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: 18,
            padding: '18px 16px',
            marginBottom: 16,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div className="between" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#38BDF8', fontWeight: 800 }}>
              PÓLIZA DE TRANSPORTE TERRESTRE
            </span>
            <span className="pill pill-green" style={{ fontSize: 10, fontWeight: 700 }}>
              Vigente
            </span>
          </div>

          <div style={{ fontSize: 18, fontWeight: 900, color: '#F8FAFC', marginBottom: 6 }}>
            {poliza.numeroPoliza}
          </div>

          <div style={{ fontSize: 12, color: '#94A3B8' }}>
            Plan: <b style={{ color: '#FFFFFF' }}>{planInfo.nombre}</b>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
            Monto Asegurado: <b style={{ color: '#38BDF8' }}>${poliza.montoAsegurado.toLocaleString('es-CL')} CLP</b>
          </div>
        </div>

        {/* Detalle del Asegurado */}
        <div className="card flat" style={{ background: 'var(--paper)', padding: '12px 14px', borderRadius: 16, marginBottom: 14 }}>
          <div className="between" style={{ padding: '3px 0', fontSize: 12 }}>
            <span style={{ color: 'var(--slate)' }}>Asegurado:</span>
            <span style={{ fontWeight: 700 }}>{poliza.aseguradoNombre || 'Titular de la Carga'}</span>
          </div>
          {poliza.aseguradoRut && (
            <div className="between" style={{ padding: '3px 0', fontSize: 12 }}>
              <span style={{ color: 'var(--slate)' }}>RUT Asegurado:</span>
              <span style={{ fontWeight: 700 }}>{poliza.aseguradoRut}</span>
            </div>
          )}
          <div className="between" style={{ padding: '3px 0', fontSize: 12 }}>
            <span style={{ color: 'var(--slate)' }}>Vigencia:</span>
            <span>{poliza.fechaEmision} hasta {poliza.vigenciaHasta}</span>
          </div>
        </div>

        {/* Coberturas Incluidas */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', marginBottom: 8 }}>
            Coberturas Incluidas en Ruta:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {planInfo.caracteristicas.map((c, i) => (
              <div key={i} className="row" style={{ gap: 8, fontSize: 12, color: 'var(--ink)' }}>
                <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asistencia de Siniestros 24/7 */}
        <div
          style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 16,
            fontSize: 12,
            color: '#92400E',
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 2 }}>🚨 En caso de Siniestro o Accidente en Ruta:</div>
          <div>Comunícate de inmediato al <b>800 600 NORTIA</b> o a través del botón SOS en la app dentro de las primeras 24 horas del evento.</div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', padding: '13px', background: '#265370' }}
          onClick={onClose}
        >
          Cerrar Certificado
        </button>
      </div>
    </div>
  )
}
