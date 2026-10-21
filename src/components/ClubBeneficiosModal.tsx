import { useState } from 'react'
import {
  obtenerBeneficios,
  type BeneficioClub,
} from '../lib/benefitsService'

interface ClubBeneficiosModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ClubBeneficiosModal({
  isOpen,
  onClose,
}: ClubBeneficiosModalProps) {
  const [categoria, setCategoria] = useState<string>('todos')
  const [copiadoId, setCopiadoId] = useState<string | null>(null)

  if (!isOpen) return null

  const beneficios = obtenerBeneficios()
  const filtrados = beneficios.filter((b) =>
    categoria === 'todos' ? true : b.categoria === categoria
  )

  function handleCopiar(b: BeneficioClub) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(b.codigoCupon)
    }
    setCopiadoId(b.id)
    setTimeout(() => setCopiadoId(null), 3000)
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 480, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
                Club NORTIA Pro
              </div>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                Beneficios en Carretera
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
          Convenios en vulcanizaciones, paradores de descanso, repuestos mecánicos y asesoría legal en ruta.
        </p>

        {/* Categorías */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 6,
            marginBottom: 14,
            whiteSpace: 'nowrap',
          }}
        >
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'neumaticos', label: '🛞 Vulcanizaciones' },
            { key: 'paradores', label: '🚿 Paradores & Duchas' },
            { key: 'repuestos', label: '🔧 Repuestos & Aceites' },
            { key: 'alimentacion', label: '☕ Menú Camionero' },
            { key: 'legal', label: '⚖️ Asesoría MTT' },
          ].map((c) => (
            <button
              key={c.key}
              type="button"
              className="chip"
              style={{
                fontSize: 11.5,
                padding: '6px 12px',
                background: categoria === c.key ? 'var(--navy)' : '#FFFFFF',
                color: categoria === c.key ? '#FFFFFF' : 'var(--ink)',
                flexShrink: 0,
              }}
              onClick={() => setCategoria(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Lista de Beneficios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '60vh', overflowY: 'auto' }}>
          {filtrados.map((b) => {
            const copiado = copiadoId === b.id
            return (
              <div
                key={b.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  margin: 0,
                  border: '1.5px solid var(--navy-tint-2)',
                  background: '#FFFFFF',
                }}
              >
                <div className="between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{b.icono}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--navy)' }}>
                        {b.titulo}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 1 }}>
                        {b.proveedor}
                      </div>
                    </div>
                  </div>

                  <span className="pill pill-green" style={{ fontSize: 11, fontWeight: 800 }}>
                    {b.descuento}
                  </span>
                </div>

                <div style={{ fontSize: 11.5, color: 'var(--slate)', lineHeight: 1.4, marginBottom: 12 }}>
                  {b.descripcion}
                </div>

                <div
                  className="card flat"
                  style={{
                    background: 'var(--paper)',
                    padding: '8px 12px',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--slate-light)', display: 'block' }}>
                      CÓDIGO DE CONVENIO:
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 12, color: 'var(--navy)' }}>
                      {b.codigoCupon}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      width: 'auto',
                      padding: '6px 12px',
                      fontSize: 11,
                      borderRadius: 8,
                      background: copiado ? '#10B981' : 'var(--navy)',
                    }}
                    onClick={() => handleCopiar(b)}
                  >
                    {copiado ? '✓ Copiado' : 'Copiar Cupón'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
