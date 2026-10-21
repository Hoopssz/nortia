interface PasePorteriaModalProps {
  isOpen: boolean
  viajeId: string
  conductorNombre: string
  conductorRut: string
  patente: string
  empresaCliente: string
  origenTexto: string
  destinoTexto: string
  onClose: () => void
}

export function PasePorteriaModal({
  isOpen,
  viajeId,
  conductorNombre,
  conductorRut,
  patente,
  empresaCliente,
  origenTexto,
  destinoTexto,
  onClose,
}: PasePorteriaModalProps) {
  if (!isOpen) return null

  // URL del pase para el código QR
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `NORTIA-PASS:${viajeId}:${conductorRut}:${patente}`
  )}`

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 440, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
              Control de Acceso
            </div>
            <div className="h2" style={{ fontSize: 18, margin: 0 }}>
              Pase de Portería Digital
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

        <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px' }}>
          Muestra esta credencial digital al guardia o control de acceso del centro de distribución para validar el ingreso.
        </p>

        {/* Tarjeta de Credencial Oficial */}
        <div
          className="navy-panel"
          style={{
            borderRadius: 20,
            padding: '20px',
            marginBottom: 14,
            boxShadow: 'var(--shadow-lift)',
            color: '#FFFFFF',
          }}
        >
          {/* Encabezado de la Credencial */}
          <div className="between" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 12, marginBottom: 14 }}>
            <div className="row" style={{ gap: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#FFFFFF',
                  color: 'var(--navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 15,
                }}
              >
                N
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, letterSpacing: 0.5 }}>PASE AUTORIZADO</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>NORTIA Red Logística Chile</div>
              </div>
            </div>

            <span
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: 8,
              }}
            >
              AUTORIZADO
            </span>
          </div>

          {/* Código QR Central */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 14px' }}>
            <div
              style={{
                background: '#FFFFFF',
                padding: '10px',
                borderRadius: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}
            >
              <img
                src={qrDataUrl}
                alt="Código QR Pase de Portería"
                width={150}
                height={150}
                style={{ display: 'block', borderRadius: 8 }}
              />
            </div>
          </div>

          {/* Datos del Conductor y Camión */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            <div className="between">
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Conductor:</span>
              <span style={{ fontWeight: 800 }}>{conductorNombre}</span>
            </div>
            <div className="between">
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>RUT Conductor:</span>
              <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{conductorRut}</span>
            </div>
            <div className="between">
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Patente Camión:</span>
              <span style={{ fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6 }}>
                {patente}
              </span>
            </div>
            <div className="between">
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Empresa / Mandante:</span>
              <span style={{ fontWeight: 700 }}>{empresaCliente}</span>
            </div>
            <div className="between" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 6, marginTop: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Flete:</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)' }}>{origenTexto} → {destinoTexto}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--navy)' }}
          onClick={onClose}
        >
          Cerrar Pase
        </button>
      </div>
    </div>
  )
}
