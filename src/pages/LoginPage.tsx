import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import { Icon } from '../components/Icon'

export function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)
  const [resetSent, setResetSent] = useState(false)

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
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      if (!data.session) {
        setCheckEmail(true)
        return
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

  if (checkEmail) {
    return (
      <div className="px" style={{ paddingTop: 36, textAlign: 'center' }}>
        <div className="h2">Revisa tu correo</div>
        <p className="sub">
          Te enviamos un link de confirmación a <b>{email}</b>. Ábrelo para activar tu cuenta.
        </p>
      </div>
    )
  }

  if (resetSent) {
    return (
      <div className="px" style={{ paddingTop: 36, textAlign: 'center' }}>
        <div className="h2">Revisa tu correo</div>
        <p className="sub">
          Te enviamos un link para restablecer tu contraseña a <b>{email}</b>.
        </p>
      </div>
    )
  }

  return (
    <div className="px" style={{ paddingTop: 36, maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color: 'var(--navy)' }}
        >
          NORTIA.
        </span>
      </div>
      <p className="sub" style={{ textAlign: 'center', marginBottom: 26 }}>
        {mode === 'signup'
          ? 'Crea tu cuenta para empezar a mover o transportar carga.'
          : mode === 'forgot'
            ? 'Te enviamos un link para que elijas una nueva contraseña.'
            : 'Inicia sesión para continuar.'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tunombre@correo.com"
          />
        </div>
        {mode !== 'forgot' && (
          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        )}

        {mode === 'login' && (
          <p style={{ textAlign: 'right', fontSize: 12, color: 'var(--slate)', marginTop: -8, marginBottom: 14 }}>
            <span style={{ color: 'var(--navy)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setMode('forgot')}>
              ¿Olvidaste tu contraseña?
            </span>
          </p>
        )}

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 14 }}>{error}</p>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading
            ? 'Espera…'
            : mode === 'signup'
              ? 'Crear cuenta'
              : mode === 'forgot'
                ? 'Enviar link de recuperación'
                : 'Iniciar sesión'}
          {!loading && <Icon name="arrowR" size={18} strokeWidth={2} />}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--slate)', marginTop: 18 }}>
        {mode === 'signup' && (
          <>
            ¿Ya tienes cuenta?{' '}
            <b style={{ color: 'var(--navy)', cursor: 'pointer' }} onClick={() => setMode('login')}>
              Inicia sesión
            </b>
          </>
        )}
        {mode === 'login' && (
          <>
            ¿Aún no tienes cuenta?{' '}
            <b style={{ color: 'var(--navy)', cursor: 'pointer' }} onClick={() => setMode('signup')}>
              Crea una
            </b>
          </>
        )}
        {mode === 'forgot' && (
          <b style={{ color: 'var(--navy)', cursor: 'pointer' }} onClick={() => setMode('login')}>
            Volver a iniciar sesión
          </b>
        )}
      </p>
    </div>
  )
}
