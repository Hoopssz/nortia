import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { NortiaLogo } from '../components/NortiaLogo'

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
          'radial-gradient(520px 320px at 50% 34%, rgba(38,83,112,0.06), transparent 70%), #fff',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <NortiaLogo variant="isotipo" size={72} />
        <NortiaLogo variant="logotipo" size={54} />
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            letterSpacing: 0.8,
            color: 'var(--slate)',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
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
        Ingresar a la App <Icon name="arrowR" size={18} strokeWidth={2} />
      </button>

      <button
        type="button"
        className="btn btn-ghost"
        style={{ maxWidth: 320, marginTop: 12, fontSize: 13, color: 'var(--navy)', fontWeight: 700 }}
        onClick={() => navigate('/landing')}
      >
        Ver Simulador y Portal Web →
      </button>
    </div>
  )
}
