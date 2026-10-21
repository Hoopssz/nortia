import { useState } from 'react'
import {
  obtenerFacturaComision,
  generarFacturaComision,
  type FacturaComisionNortia,
} from '../lib/invoiceService'

interface FacturaComisionModalProps {
  isOpen: boolean
  viajeId: string
  clienteNombre: string
  clienteRut: string
  origenTexto: string
  destinoTexto: string
  montoFleteTotal: number
  onClose: () => void
}

export function FacturaComisionModal({
  isOpen,
  viajeId,
  clienteNombre,
  clienteRut,
  origenTexto,
  destinoTexto,
  montoFleteTotal,
  onClose,
}: FacturaComisionModalProps) {
  const [descargando, setDescargando] = useState(false)
  const [descargaExitosa, setDescargaExitosa] = useState(false)

  if (!isOpen) return null

  let factura: FacturaComisionNortia | null = obtenerFacturaComision(viajeId)
  if (!factura) {
    factura = generarFacturaComision(
      viajeId,
      clienteNombre,
      clienteRut,
      origenTexto,
      destinoTexto,
      montoFleteTotal
    )
  }

  function handleDescargar() {
    setDescargando(true)
    setTimeout(() => {
      setDescargando(false)
      setDescargaExitosa(true)
      setTimeout(() => setDescargaExitosa(false), 4000)
    }, 1000)
  }

  function handleImprimir() {
    window.print()
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 480, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 14 }}>
          <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
            Tributación SII · DTE 33
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {descargaExitosa && (
          <div className="pill pill-green" style={{ width: '100%', justifyContent: 'center', marginBottom: 12, padding: '10px' }}>
            ✓ Factura PDF descargada exitosamente para tu contabilidad
          </div>
        )}

        {/* Factura Electrónica Oficial */}
        <div
          style={{
            border: '2px solid #DC2626',
            borderRadius: 12,
            padding: '16px',
            background: '#FFFFFF',
            color: '#0F172A',
            marginBottom: 16,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Encabezado SII */}
          <div className="between" style={{ alignItems: 'flex-start', borderBottom: '1.5px solid #E2E8F0', paddingBottom: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#1E3A8A' }}>NORTIA SPA</div>
              <div style={{ fontSize: 10.5, color: '#475569', marginTop: 2 }}>
                Plataforma Tecnológica de Transporte Terrestre
              </div>
              <div style={{ fontSize: 10, color: '#64748B' }}>
                Av. Apoquindo 4500, Las Condes · Santiago
              </div>
            </div>

            {/* Recuadro Rojo Oficial SII */}
            <div
              style={{
                border: '2.5px solid #DC2626',
                padding: '6px 12px',
                textAlign: 'center',
                borderRadius: 6,
                background: '#FEF2F2',
                minWidth: 160,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 11.5, color: '#DC2626' }}>R.U.T.: 77.892.340-K</div>
              <div style={{ fontWeight: 900, fontSize: 12, color: '#DC2626', margin: '2px 0' }}>
                FACTURA ELECTRÓNICA
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#DC2626' }}>N° {factura.folio}</div>
              <div style={{ fontSize: 8.5, color: '#DC2626', fontWeight: 700 }}>S.I.I. - SANTIAGO CENTRO</div>
            </div>
          </div>

          {/* Datos del Receptor / Cliente */}
          <div style={{ fontSize: 11, color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
            <div>
              <b>SEÑOR(ES):</b> {factura.clienteNombre}
            </div>
            <div>
              <b>R.U.T.:</b> {factura.clienteRut}
            </div>
            <div>
              <b>GIRO:</b> {factura.clienteGiro}
            </div>
            <div>
              <b>FECHA EMISIÓN:</b> {factura.fechaEmision}
            </div>
          </div>

          {/* Tabla de Detalle del Servicio */}
          <div style={{ borderTop: '1px solid #CBD5E1', borderBottom: '1px solid #CBD5E1', padding: '8px 0', marginBottom: 12 }}>
            <div className="between" style={{ fontSize: 10.5, fontWeight: 800, color: '#64748B', marginBottom: 4 }}>
              <span>DESCRIPCIÓN DEL SERVICIO</span>
              <span>TOTAL</span>
            </div>
            <div className="between" style={{ fontSize: 11.5 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Comisión de Servicio NORTIA (12%)</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>
                  Flete {factura.origenTexto} a {factura.destinoTexto} (Valor flete: ${factura.montoFleteTotal.toLocaleString('es-CL')})
                </div>
              </div>
              <span style={{ fontWeight: 800 }}>${factura.totalComision.toLocaleString('es-CL')}</span>
            </div>
          </div>

          {/* Totales y Liquidación */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <div style={{ width: 170, fontSize: 11.5 }}>
              <div className="between" style={{ marginBottom: 2 }}>
                <span style={{ color: '#64748B' }}>MONTO NETO:</span>
                <span style={{ fontWeight: 600 }}>${factura.montoNetoComision.toLocaleString('es-CL')}</span>
              </div>
              <div className="between" style={{ marginBottom: 2 }}>
                <span style={{ color: '#64748B' }}>I.V.A. 19%:</span>
                <span style={{ fontWeight: 600 }}>${factura.ivaComision.toLocaleString('es-CL')}</span>
              </div>
              <div className="between" style={{ borderTop: '1.5px solid #0F172A', paddingTop: 3, fontWeight: 900, fontSize: 13 }}>
                <span>TOTAL:</span>
                <span style={{ color: '#1E3A8A' }}>${factura.totalComision.toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
          </div>

          {/* Timbre Electrónico SII */}
          <div
            style={{
              border: '1.5px solid #94A3B8',
              borderRadius: 6,
              padding: '6px 10px',
              textAlign: 'center',
              background: '#F8FAFC',
            }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: 9.5, letterSpacing: 2, color: '#0F172A', fontWeight: 800 }}>
              |||||| | |||||||| || |||||| | |||||||||||||||| ||| ||||||
            </div>
            <div style={{ fontSize: 8.5, color: '#475569', marginTop: 2 }}>
              Timbre Electrónico S.I.I. · Res. N° 80 del 2014 · Verifique documento en www.sii.cl
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
            onClick={handleImprimir}
          >
            🖨️ Imprimir
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={descargando}
            style={{ flex: 1.5, padding: '12px', justifyContent: 'center', background: 'var(--navy)' }}
            onClick={handleDescargar}
          >
            {descargando ? 'Generando PDF…' : '📥 Descargar Factura PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
