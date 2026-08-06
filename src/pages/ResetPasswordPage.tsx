import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import { Icon } from '../components/Icon'

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

  if (done) {
    return (
      <div className="px" style={{ paddingTop: 36, textAlign: 'center' }}>
        <div className="h2">Contraseña actualizada</div>
        <p className="sub" style={{ marginBottom: 22 }}>Ya puedes seguir usando NORTIA.</p>
        <button className="btn btn-primary" onClick={() => navigate('/home')}>
          Continuar <Icon name="arrowR" size={18} strokeWidth={2} />
        </button>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="px" style={{ paddingTop: 36, textAlign: 'center' }}>
        <p className="sub">
          Este link de recuperación no es válido o ya expiró. Pide uno nuevo desde{' '}
          <b style={{ color: 'var(--navy)', cursor: 'pointer' }} onClick={() => navigate('/login')}>
            la pantalla de inicio de sesión
          </b>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="px" style={{ paddingTop: 36, maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <div className="h2" style={{ textAlign: 'center', marginBottom: 6 }}>
        Elige tu nueva contraseña
      </div>
      <p className="sub" style={{ textAlign: 'center', marginBottom: 26 }}>
        Escríbela dos veces para confirmar.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Nueva contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="field">
          <label>Confirma tu contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 14 }}>{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar contraseña'} {!loading && <Icon name="check" size={18} strokeWidth={2} />}
        </button>
      </form>
    </div>
  )
}
