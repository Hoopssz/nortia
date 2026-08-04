import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'

export function SplashPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(520px 320px at 50% 34%, rgba(38,83,112,0.05), transparent 70%), #fff',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: 0.5,
            color: 'var(--navy)',
          }}
        >
          NORTIA.
        </span>
        <div
          style={{
            marginTop: 12,
            fontSize: 12.5,
            letterSpacing: 1,
            color: 'var(--slate-light)',
            fontWeight: 600,
          }}
        >
          Mueve tu carga con confianza
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ maxWidth: 320, marginTop: 40 }}
        onClick={() => navigate('/login')}
      >
        Comenzar <Icon name="arrowR" size={18} strokeWidth={2} />
      </button>
    </div>
  )
}
