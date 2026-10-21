import {
  calcularGastosEmpresa,
} from '../lib/businessAnalyticsService'
import type { Tables } from '../lib/database.types'

interface GastosLogisticaModalProps {
  isOpen: boolean
  cargas?: Tables<'cargas'>[]
  empresaNombre?: string
  onClose: () => void
}

export function GastosLogisticaModal({
  isOpen,
  cargas = [],
  empresaNombre = 'Mi Empresa',
  onClose,
}: GastosLogisticaModalProps) {
  if (!isOpen) return null

  const gastos = calcularGastosEmpresa(cargas)

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 480, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 24 }}>📊</span>
            <div>
              <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
                Inteligencia Financiera
              </div>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                Gastos Logísticos & Ahorro
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

        <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px' }}>
          Resumen de inversión en transporte de carga para <b>{empresaNombre}</b> y métricas de optimización.
        </p>

        {/* Tarjeta Principal de Gasto */}
        <div
          className="navy-panel"
          style={{
            borderRadius: 20,
            padding: '20px',
            marginBottom: 14,
            boxShadow: 'var(--shadow-lift)',
          }}
        >
          <div className="between">
            <div>
              <div className="eyebrow on-navy" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                Inversión en Fletes este Mes
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                ${gastos.totalGastadoMesClp.toLocaleString('es-CL')} CLP
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                {gastos.fletesCompletados} despachos completados a nivel nacional
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '6px 12px',
                borderRadius: 12,
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Acumulado Año</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
                ${gastos.totalGastadoAnioClp.toLocaleString('es-CL')}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Destacada de Ahorro NORTIA */}
        <div
          className="card flat"
          style={{
            background: '#ECFDF5',
            border: '1.5px solid #10B981',
            padding: '14px 16px',
            borderRadius: 16,
            marginBottom: 14,
          }}
        >
          <div className="between">
            <div className="row" style={{ gap: 10 }}>
              <span style={{ fontSize: 24 }}>💰</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: '#065F46' }}>
                  Ahorro Estimado con NORTIA
                </div>
                <div style={{ fontSize: 11, color: '#047857' }}>
                  Ahorraste aprox. un <b>22%</b> vs tarifas de agencias tradicionales
                </div>
              </div>
            </div>

            <div style={{ fontWeight: 900, fontSize: 16, color: '#059669' }}>
              +${gastos.ahorroEstimadoClp.toLocaleString('es-CL')}
            </div>
          </div>
        </div>

        {/* Métricas Operativas */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Volumen & Costos Unitarios
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div className="card flat" style={{ padding: '12px', margin: 0, border: '1px solid var(--line)', background: '#FFFFFF' }}>
            <div style={{ fontSize: 11, color: 'var(--slate)' }}>📦 Toneladas Movidas</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)', marginTop: 2 }}>
              {gastos.toneladasMovidas} Ton
            </div>
            <div style={{ fontSize: 10, color: 'var(--slate-light)' }}>{gastos.palletsMovidos} pallets totales</div>
          </div>

          <div className="card flat" style={{ padding: '12px', margin: 0, border: '1px solid var(--line)', background: '#FFFFFF' }}>
            <div style={{ fontSize: 11, color: 'var(--slate)' }}>📈 Costo Promedio / Ton</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginTop: 2 }}>
              ${gastos.costoPromedioTonClp.toLocaleString('es-CL')}
            </div>
            <div style={{ fontSize: 10, color: 'var(--slate-light)' }}>~${gastos.costoPromedioKmClp}/km en ruta</div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--navy)' }}
          onClick={onClose}
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
