import { useState } from 'react'
import { Icon } from './Icon'
import {
  type MetodoPago,
  detectarMarcaTarjeta,
  formatearNumeroTarjeta,
  formatearExpiracion,
  validarExpiracion,
  procesarPagoNortia,
  DATOS_TRANSFERENCIA_NORTIA,
} from '../lib/payments'

interface PaymentModalProps {
  isOpen: boolean
  monto: number
  descripcionCarga: string
  viajeId?: string
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({
  isOpen,
  monto,
  descripcionCarga,
  viajeId = 'temp',
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta')
  const [numeroTarjeta, setNumeroTarjeta] = useState('')
  const [nombreTitular, setNombreTitular] = useState('')
  const [expiracion, setExpiracion] = useState('')
  const [cvv, setCvv] = useState('')
  const [cuotas, setCuotas] = useState(1)
  const [procesando, setProcesando] = useState(false)
  const [recibo, setRecibo] = useState<{ transaccionId: string; autorizacion: string; medio: string; fecha: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const marca = detectarMarcaTarjeta(numeroTarjeta)
  const tarjetaValida = numeroTarjeta.replace(/\D/g, '').length >= 15
  const expValida = validarExpiracion(expiracion)
  const cvvValido = cvv.length >= 3
  const nombreValido = nombreTitular.trim().length >= 3

  const canPay = metodo === 'tarjeta' ? (tarjetaValida && expValida && cvvValido && nombreValido) : true

  async function handlePagar() {
    if (!canPay) return
    setProcesando(true)
    setError(null)

    try {
      const res = await procesarPagoNortia({
        metodo,
        monto,
        tarjetaNumero: numeroTarjeta,
        nombreTitular,
        expiracion,
        cvv,
        cuotas,
        viajeId,
      })

      setRecibo(res)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago')
      setProcesando(false)
    }
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 440, position: 'relative' }}>
        {recibo ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Icon name="check" size={34} strokeWidth={2.8} />
            </div>
            <div className="h2" style={{ fontSize: 22, color: '#065F46' }}>¡Pago aprobado!</div>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '6px 0 16px' }}>
              Fondos retenidos en custodia segura NORTIA.
            </p>

            <div
              className="card flat"
              style={{
                background: 'var(--paper)',
                padding: '12px 14px',
                textAlign: 'left',
                fontSize: 12,
                borderRadius: 14,
                marginBottom: 10,
              }}
            >
              <div className="between" style={{ padding: '3px 0' }}>
                <span style={{ color: 'var(--slate)' }}>Comprobante:</span>
                <span style={{ fontWeight: 700 }}>{recibo.transaccionId}</span>
              </div>
              <div className="between" style={{ padding: '3px 0' }}>
                <span style={{ color: 'var(--slate)' }}>Código autorización:</span>
                <span style={{ fontWeight: 700 }}>{recibo.autorizacion}</span>
              </div>
              <div className="between" style={{ padding: '3px 0' }}>
                <span style={{ color: 'var(--slate)' }}>Medio:</span>
                <span style={{ fontWeight: 600 }}>{recibo.medio}</span>
              </div>
              <div className="between" style={{ padding: '3px 0', borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 4 }}>
                <span style={{ color: 'var(--slate)' }}>Total cargado:</span>
                <span style={{ fontWeight: 800, color: 'var(--navy)' }}>${monto.toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="between" style={{ marginBottom: 14 }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>Mercado Pago & Webpay</div>
                <div className="h2" style={{ fontSize: 20, marginTop: 2 }}>Pagar flete</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={procesando}
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

            {/* Pestañas de Métodos de Pago */}
            <div className="row" style={{ gap: 6, marginBottom: 16 }}>
              <button
                type="button"
                className="chip"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  fontSize: 11.5,
                  padding: '8px 4px',
                  cursor: 'pointer',
                  background: metodo === 'tarjeta' ? 'var(--navy)' : undefined,
                  color: metodo === 'tarjeta' ? '#fff' : undefined,
                }}
                onClick={() => setMetodo('tarjeta')}
              >
                💳 Tarjeta / Webpay
              </button>
              <button
                type="button"
                className="chip"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  fontSize: 11.5,
                  padding: '8px 4px',
                  cursor: 'pointer',
                  background: metodo === 'mercadopago' ? '#009EE3' : undefined,
                  color: metodo === 'mercadopago' ? '#fff' : undefined,
                }}
                onClick={() => setMetodo('mercadopago')}
              >
                🟡 Mercado Pago
              </button>
              <button
                type="button"
                className="chip"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  fontSize: 11.5,
                  padding: '8px 4px',
                  cursor: 'pointer',
                  background: metodo === 'transferencia' ? 'var(--navy)' : undefined,
                  color: metodo === 'transferencia' ? '#fff' : undefined,
                }}
                onClick={() => setMetodo('transferencia')}
              >
                🏦 Transferencia
              </button>
            </div>

            {metodo === 'tarjeta' && (
              <>
                {/* Simulación Visual de Tarjeta de Débito/Crédito */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #265370 100%)',
                    borderRadius: 18,
                    padding: '18px 20px',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 16px rgba(38, 83, 112, 0.35)',
                    marginBottom: 16,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div className="between" style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 30,
                          height: 20,
                          background: '#FBBF24',
                          borderRadius: 4,
                          opacity: 0.9,
                        }}
                      />
                      <span style={{ fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>
                        WEBPAY · DÉBITO / CRÉDITO
                      </span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                      {marca}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 17,
                      letterSpacing: 2.2,
                      marginBottom: 14,
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    }}
                  >
                    {numeroTarjeta ? formatearNumeroTarjeta(numeroTarjeta) : '•••• •••• •••• ••••'}
                  </div>

                  <div className="between" style={{ fontSize: 10.5, textTransform: 'uppercase', opacity: 0.9 }}>
                    <div>
                      <div style={{ fontSize: 7.5, opacity: 0.7 }}>TITULAR</div>
                      <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>
                        {nombreTitular || 'NOMBRE DEL TITULAR'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 7.5, opacity: 0.7 }}>EXPIRA</div>
                      <div style={{ fontWeight: 700 }}>{expiracion || 'MM/AA'}</div>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Número de Tarjeta</label>
                  <input
                    type="tel"
                    placeholder="4500 1234 5678 9010"
                    maxLength={19}
                    value={formatearNumeroTarjeta(numeroTarjeta)}
                    onChange={(e) => setNumeroTarjeta(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Nombre en la tarjeta</label>
                  <input
                    placeholder="JUAN PEREZ"
                    value={nombreTitular}
                    onChange={(e) => setNombreTitular(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="row" style={{ gap: 10 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Vencimiento</label>
                    <input
                      placeholder="MM/AA"
                      maxLength={5}
                      value={formatearExpiracion(expiracion)}
                      onChange={(e) => setExpiracion(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>CVV / Clave</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={cvv.replace(/\D/g, '')}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Cuotas</label>
                  <select value={cuotas} onChange={(e) => setCuotas(Number(e.target.value))}>
                    <option value={1}>1 cuota de ${monto.toLocaleString('es-CL')} (Sin interés)</option>
                    <option value={3}>3 cuotas de ${Math.round(monto / 3).toLocaleString('es-CL')} (Sin interés)</option>
                    <option value={6}>6 cuotas de ${Math.round(monto / 6).toLocaleString('es-CL')}</option>
                    <option value={12}>12 cuotas de ${Math.round(monto / 12).toLocaleString('es-CL')}</option>
                  </select>
                </div>
              </>
            )}

            {metodo === 'mercadopago' && (
              <div className="card flat" style={{ background: '#F0F9FF', border: '1.5px solid #009EE3', padding: 16, borderRadius: 16, marginBottom: 14 }}>
                <div className="row" style={{ gap: 10, marginBottom: 10 }}>
                  <div style={{ background: '#009EE3', color: '#fff', padding: '6px 10px', borderRadius: 8, fontWeight: 800, fontSize: 13 }}>
                    Mercado Pago
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0369A1' }}>
                    Checkout Rápido con 1 toque
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#0369A1', margin: '0 0 10px' }}>
                  Paga con tu saldo en Mercado Pago, tarjetas guardadas o dinero en cuenta con acreditación instantánea.
                </p>
                <div className="card flat" style={{ background: '#FFFFFF', padding: 10, fontSize: 12 }}>
                  <div className="between">
                    <span>Monto a debitar de tu cuenta MP:</span>
                    <span style={{ fontWeight: 800, color: 'var(--navy)' }}>${monto.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>
              </div>
            )}

            {metodo === 'transferencia' && (
              <div className="card flat" style={{ background: 'var(--paper)', border: '1.5px solid var(--line)', padding: 16, borderRadius: 16, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', marginBottom: 8 }}>
                  Datos para Transferencia Electrónica
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink)' }}>
                  <div className="between" style={{ padding: '3px 0' }}>
                    <span style={{ color: 'var(--slate)' }}>Banco:</span>
                    <span style={{ fontWeight: 600 }}>{DATOS_TRANSFERENCIA_NORTIA.banco}</span>
                  </div>
                  <div className="between" style={{ padding: '3px 0' }}>
                    <span style={{ color: 'var(--slate)' }}>Tipo Cuenta:</span>
                    <span style={{ fontWeight: 600 }}>{DATOS_TRANSFERENCIA_NORTIA.tipoCuenta}</span>
                  </div>
                  <div className="between" style={{ padding: '3px 0' }}>
                    <span style={{ color: 'var(--slate)' }}>N° Cuenta:</span>
                    <span style={{ fontWeight: 700 }}>{DATOS_TRANSFERENCIA_NORTIA.numeroCuenta}</span>
                  </div>
                  <div className="between" style={{ padding: '3px 0' }}>
                    <span style={{ color: 'var(--slate)' }}>RUT:</span>
                    <span style={{ fontWeight: 600 }}>{DATOS_TRANSFERENCIA_NORTIA.rut}</span>
                  </div>
                  <div className="between" style={{ padding: '3px 0' }}>
                    <span style={{ color: 'var(--slate)' }}>Titular:</span>
                    <span style={{ fontWeight: 600 }}>{DATOS_TRANSFERENCIA_NORTIA.titular}</span>
                  </div>
                  <div className="between" style={{ padding: '3px 0' }}>
                    <span style={{ color: 'var(--slate)' }}>Email:</span>
                    <span style={{ fontWeight: 600 }}>{DATOS_TRANSFERENCIA_NORTIA.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen Financiero */}
            <div
              className="card flat"
              style={{
                background: 'var(--navy-tint)',
                border: '1px solid var(--navy-tint-2)',
                padding: '12px 14px',
                marginBottom: 16,
                borderRadius: 14,
              }}
            >
              <div className="between" style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 4 }}>
                <span>Flete: {descripcionCarga}</span>
                <span>${monto.toLocaleString('es-CL')}</span>
              </div>
              <div className="between" style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>
                <span>🛡️ Protección y Custodia NORTIA</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>Incluido</span>
              </div>
              <div className="between" style={{ paddingTop: 6, borderTop: '1px solid var(--navy-tint-2)', fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Total a Pagar</span>
                <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--navy)' }}>
                  ${monto.toLocaleString('es-CL')} CLP
                </span>
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15 }}
              disabled={!canPay || procesando}
              onClick={handlePagar}
            >
              {procesando ? (
                'Procesando pago seguro…'
              ) : (
                <>
                  <Icon name="shield" size={17} strokeWidth={2.4} /> Pagar ${monto.toLocaleString('es-CL')} CLP
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--slate)' }}>
              🔒 Mercado Pago & Webpay Plus · Encriptación SSL 256-bit
            </div>
          </>
        )}
      </div>
    </div>
  )
}
