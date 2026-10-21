import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import { NortiaLogo } from '../components/NortiaLogo'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const active = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) setReady(true)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setDone(true)
  }

  return (
    <div
      style={{
        background: '#070E1B',
        color: '#FFFFFF',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        overflow: 'hidden',
      }}
    >
      {/* Fondo de video y mesh gradient */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 25%, rgba(2, 132, 199, 0.22) 0%, rgba(7, 14, 27, 0.90) 65%, #070E1B 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.35,
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 440,
          width: '100%',
          background: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 60px -15px rgba(38, 83, 112, 0.3), 0 0 40px rgba(0,0,0,0.6)',
          borderRadius: 24,
          padding: '36px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <NortiaLogo variant="isotipo" size={52} />

          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#FFFFFF' }}>
            {done ? 'Contraseña Actualizada' : 'Restablecer Contraseña'}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
            {done ? 'Tu clave ha sido guardada exitosamente.' : 'Ingresa y confirma tu nueva clave de acceso.'}
          </div>
        </div>

        {done ? (
          <button
            type="button"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 14,
              fontWeight: 800,
              background: '#FFFFFF',
              color: '#070E1B',
              borderRadius: 18,
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/home')}
          >
            Continuar a NORTIA →
          </button>
        ) : !ready ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#FCA5A5', marginBottom: 20 }}>
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <button
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 13,
                fontWeight: 800,
                background: '#FFFFFF',
                color: '#070E1B',
                borderRadius: 18,
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/login')}
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                NUEVA CONTRASEÑA
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 13.5,
                  background: 'rgba(30, 41, 59, 0.85)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                CONFIRMA LA CONTRASEÑA
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 13.5,
                  background: 'rgba(30, 41, 59, 0.85)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#FCA5A5',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 14,
                fontWeight: 900,
                background: '#FFFFFF',
                color: '#070E1B',
                borderRadius: 18,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Guardando…' : 'Guardar Nueva Contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
