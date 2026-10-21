import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import { Icon } from '../components/Icon'
import { NortiaLogo } from '../components/NortiaLogo'

// Componente de Estrella de 4 Puntas (✦)
function Star4Point({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
    </svg>
  )
}

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  async function handleGoogleLogin() {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    })
    if (error) {
      setLoading(false)
      setError(error.message)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/restablecer-contrasena`,
      })
      setLoading(false)
      if (error) {
        setError(getErrorMessage(error))
        return
      }
      setResetSent(true)
      return
    }

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setLoading(false)
        setError(error.message)
        return
      }
      if (!data.session) {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)
        if (loginErr) {
          setError(loginErr.message)
          return
        }
      } else {
        setLoading(false)
      }
      navigate('/onboarding/rol')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      navigate('/home')
    }
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
      {/* Fondo de Video y Mesh Gradient Translúcido */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'cover',
            opacity: 0.18,
            filter: 'saturate(1.2) contrast(1.15)',
          }}
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-driving-on-a-highway-at-night-41566-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradiente Radial Azul Oscuro */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 25%, rgba(2, 132, 199, 0.22) 0%, rgba(7, 14, 27, 0.90) 65%, #070E1B 100%)',
          }}
        />

        {/* Cuadrícula de puntos Stitch */}
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

      {/* Enlace para volver a la Landing */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          marginBottom: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12.5,
          color: '#94A3B8',
          transition: 'color 0.2s',
        }}
        onClick={() => navigate('/landing')}
      >
        <Star4Point size={12} color="#38BDF8" />
        <span>Volver a la página principal (nortia.cl)</span>
      </div>

      {/* Tarjeta Glassmorphic de Autenticación */}
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
        {/* Logo Oficial NORTIA */}
        <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <NortiaLogo variant="isotipo" size={52} />
          <NortiaLogo variant="logotipo" size={40} lightText={true} />
        </div>

        {/* Toggle de Pestañas (Crear Cuenta vs Iniciar Sesión) */}
        {mode !== 'forgot' && !resetSent && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: 999,
              padding: '4px',
              marginBottom: 24,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              style={{
                background: mode === 'signup' ? '#FFFFFF' : 'transparent',
                color: mode === 'signup' ? '#070E1B' : '#94A3B8',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => {
                setMode('signup')
                setError(null)
              }}
            >
              Crear Cuenta
            </button>

            <button
              type="button"
              style={{
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#070E1B' : '#94A3B8',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => {
                setMode('login')
                setError(null)
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        {/* Formulario o Mensaje de Recuperación */}
        {resetSent ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10B981',
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="check" size={24} strokeWidth={2.5} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: '#FFFFFF' }}>
              Revisa tu Correo
            </div>
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 24 }}>
              Te hemos enviado un enlace seguro para restablecer tu contraseña a <b>{email}</b>.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', background: '#FFFFFF', color: '#070E1B', borderRadius: 12, fontWeight: 800 }}
              onClick={() => {
                setResetSent(false)
                setMode('login')
              }}
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        ) : (
          <>
            {mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    background: '#FFFFFF',
                    color: '#1F2937',
                    borderRadius: 14,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                    transition: 'all 0.2s ease',
                    marginBottom: 18,
                  }}
                >
                  <GoogleIcon size={18} />
                  <span>{mode === 'signup' ? 'Registrarse con Google' : 'Continuar con Google'}</span>
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 18,
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.12)' }} />
                  <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    o con correo electrónico
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.12)' }} />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                CORREO ELECTRÓNICO
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuempresa@ejemplo.cl"
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

            {mode !== 'forgot' && (
              <div style={{ marginBottom: 16 }}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8' }}>
                    CONTRASEÑA
                  </label>
                  {mode === 'login' && (
                    <span
                      style={{ fontSize: 11.5, color: '#38BDF8', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setMode('forgot')}
                    >
                      ¿Olvidaste tu contraseña?
                    </span>
                  )}
                </div>
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
            )}

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
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)',
                marginTop: 8,
              }}
            >
              {loading
                ? 'Procesando…'
                : mode === 'signup'
                  ? 'Crear Cuenta'
                  : mode === 'forgot'
                    ? 'Enviar Link de Recuperación'
                    : 'Ingresar a NORTIA'}
              {!loading && <Icon name="arrowR" size={16} strokeWidth={2.5} />}
            </button>
          </form>
        </>
      )}

      {/* Footer de la tarjeta */}
        {mode === 'forgot' && !resetSent && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span
              style={{ fontSize: 12.5, color: '#38BDF8', cursor: 'pointer', fontWeight: 700 }}
              onClick={() => setMode('login')}
            >
              ← Volver a iniciar sesión
            </span>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 10, marginTop: 24, fontSize: 11, color: '#64748B', textAlign: 'center' }}>
        Plataforma Protegida por Encriptación SSL · NORTIA SpA Chile
      </div>
    </div>
  )
}
