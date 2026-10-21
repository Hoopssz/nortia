import { useState, useEffect } from 'react'
import { Icon } from './Icon'
import { BANCOS_CHILE, type DatosBancarios, guardarDatosBancarios, obtenerDatosBancarios } from '../lib/payments'
import { validarRut, formatearRut } from '../lib/validators'

interface DatosBancariosModalProps {
  isOpen: boolean
  userId: string
  onClose: () => void
  onSaved: (datos: DatosBancarios) => void
}

export function DatosBancariosModal({
  isOpen,
  userId,
  onClose,
  onSaved,
}: DatosBancariosModalProps) {
  const [banco, setBanco] = useState(BANCOS_CHILE[0])
  const [tipoCuenta, setTipoCuenta] = useState<DatosBancarios['tipoCuenta']>('cuenta_rut')
  const [numeroCuenta, setNumeroCuenta] = useState('')
  const [rutTitular, setRutTitular] = useState('')
  const [nombreTitular, setNombreTitular] = useState('')
  const [emailNotificacion, setEmailNotificacion] = useState('')
  const [saving, setSaving] = useState(false)
  const [guardadoExito, setGuardadoExito] = useState(false)

  useEffect(() => {
    if (!userId) return
    const prev = obtenerDatosBancarios(userId)
    if (prev) {
      setBanco(prev.banco)
      setTipoCuenta(prev.tipoCuenta)
      setNumeroCuenta(prev.numeroCuenta)
      setRutTitular(prev.rutTitular)
      setNombreTitular(prev.nombreTitular)
      setEmailNotificacion(prev.emailNotificacion)
    }
  }, [userId, isOpen])

  if (!isOpen) return null

  const rutValido = validarRut(rutTitular)
  const canSave =
    numeroCuenta.trim().length >= 4 &&
    rutValido &&
    nombreTitular.trim().length >= 3 &&
    emailNotificacion.includes('@')

  function handleSave() {
    if (!canSave) return
    setSaving(true)

    const datos: DatosBancarios = {
      banco,
      tipoCuenta,
      numeroCuenta,
      rutTitular,
      nombreTitular,
      emailNotificacion,
    }

    guardarDatosBancarios(userId, datos)
    setGuardadoExito(true)

    setTimeout(() => {
      setGuardadoExito(false)
      setSaving(false)
      onSaved(datos)
      onClose()
    }, 1200)
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 440 }}>
        <div className="between" style={{ marginBottom: 14 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>Transferencias NORTIA</div>
            <div className="h2" style={{ fontSize: 20, marginTop: 2 }}>Cuenta para recibir pagos</div>
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

        <p style={{ fontSize: 12.5, color: 'var(--slate)', marginBottom: 16 }}>
          Aquí transferiremos el 88% líquido de tus fletes completados.
        </p>

        {guardadoExito ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Icon name="check" size={30} strokeWidth={2.8} />
            </div>
            <div className="h2" style={{ fontSize: 18, color: '#065F46' }}>Datos bancarios actualizados</div>
          </div>
        ) : (
          <>
            <div className="field">
              <label>Banco</label>
              <select value={banco} onChange={(e) => setBanco(e.target.value)}>
                {BANCOS_CHILE.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Tipo de Cuenta</label>
              <select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value as any)}>
                <option value="cuenta_rut">CuentaRUT (BancoEstado)</option>
                <option value="cuenta_corriente">Cuenta Corriente</option>
                <option value="cuenta_vista">Cuenta Vista</option>
                <option value="cuenta_ahorro">Cuenta de Ahorro</option>
              </select>
            </div>

            <div className="field">
              <label>Número de Cuenta</label>
              <input
                placeholder={tipoCuenta === 'cuenta_rut' ? 'Sin puntos ni guión (ej. 18234567)' : '123456789'}
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="field">
              <label>RUT del Titular</label>
              <input
                placeholder="18.234.567-8"
                value={rutTitular}
                maxLength={12}
                onChange={(e) => setRutTitular(formatearRut(e.target.value))}
              />
              {rutTitular.length > 0 && !rutValido && (
                <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>RUT inválido</div>
              )}
            </div>

            <div className="field">
              <label>Nombre Completo del Titular</label>
              <input
                placeholder="Juan Pérez González"
                value={nombreTitular}
                onChange={(e) => setNombreTitular(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Email de Notificación de Transferencia</label>
              <input
                type="email"
                placeholder="juan.perez@gmail.com"
                value={emailNotificacion}
                onChange={(e) => setEmailNotificacion(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8, padding: '12px' }}
              disabled={!canSave || saving}
              onClick={handleSave}
            >
              {saving ? 'Guardando datos…' : 'Guardar datos bancarios'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
