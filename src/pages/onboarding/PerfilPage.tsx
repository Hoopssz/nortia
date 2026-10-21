import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { ThemeTogglePill } from '../../components/ThemeTogglePill'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { validarRut, formatearRut } from '../../lib/validators'
import { getErrorMessage } from '../../lib/errors'

export function PerfilPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const agregarRol = searchParams.get('agregar')
  const agregando = agregarRol === 'negocio' || agregarRol === 'proveedor'
  const { state, update } = useOnboarding()
  const { session, refreshPerfil } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const esProveedor = agregando ? agregarRol === 'proveedor' : state.rol === 'proveedor'

  useEffect(() => {
    if (agregando) return
    if (!state.rol || state.regiones.length === 0) navigate('/onboarding/rol', { replace: true })
  }, [agregando, state.rol, state.regiones, navigate])

  const rutValido = validarRut(state.rut)
  const canSubmit = state.razonSocial.trim().length > 0 && rutValido && state.rubro.trim().length > 0

  async function handleSubmit() {
    if (!agregando && !state.rol) return
    setSaving(true)
    setError(null)

    const { error } = agregando
      ? await supabase.rpc('agregar_rol', {
          p_rol: agregarRol!,
          p_razon_social: state.razonSocial,
          p_rut: state.rut,
          p_rubro: state.rubro,
        })
      : await supabase.rpc('completar_registro', {
          p_rol: state.rol!,
          p_nombre: state.nombre,
          p_telefono: state.telefono,
          p_regiones: state.regiones,
          p_razon_social: state.razonSocial,
          p_rut: state.rut,
          p_rubro: state.rubro,
        })

    if (error) {
      setSaving(false)
      setError(getErrorMessage(error))
      return
    }

    if (!esProveedor && session?.user.id) {
      await supabase.from('perfiles').update({ emite_factura: state.emiteFactura }).eq('id', session.user.id)
    }

    await refreshPerfil()
    navigate('/home')
  }

  return (
    <div
      className="px"
      style={{
        paddingTop: 16,
        paddingBottom: 24,
        maxWidth: 540,
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Barra superior con Paso y ThemeTogglePill */}
      <div className="between" style={{ marginBottom: 6, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Star4Point size={13} color="var(--navy)" />
          <span className="eyebrow" style={{ margin: 0 }}>
            Paso 3 de 3 · {esProveedor ? 'Tu operación' : 'Tu empresa'}
          </span>
        </div>
        <ThemeTogglePill />
      </div>

      {/* Barra de progreso de 3 pasos (todos completos con resplandor) */}
      <div className="steps" style={{ margin: '4px 0 14px' }}>
        <span className="on" style={{ boxShadow: '0 0 10px var(--navy)' }} />
        <span className="on" style={{ boxShadow: '0 0 10px var(--navy)' }} />
        <span className="on" style={{ boxShadow: '0 0 10px var(--navy)' }} />
      </div>

      {/* Badge de modo activo */}
      <div style={{ marginBottom: 10 }}>
        <span className="pill pill-glow">
          <Icon name={esProveedor ? 'package' : 'building'} size={13} strokeWidth={2} />
          {agregando
            ? `Agregando modo ${esProveedor ? 'Proveedor' : 'Negocio'}`
            : esProveedor
              ? 'Perfil Proveedor'
              : 'Perfil Negocio'}
        </span>
      </div>

      {/* Título y subtítulo */}
      <div style={{ marginBottom: 14 }}>
        <div className="h2" style={{ margin: '0 0 4px', fontSize: 22 }}>
          {esProveedor ? 'Cuéntanos qué distribuyes' : 'Cuéntanos de tu negocio'}
        </div>
        <div className="sub" style={{ margin: 0, fontSize: 13 }}>
          {esProveedor
            ? 'Definimos tus rutas y requisitos para calzar camiones ideales.'
            : 'Esto le da confianza al transportista para tomar tu carga con rapidez.'}
        </div>
      </div>

      {/* Formulario con estética translúcida */}
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Razón social de la empresa</label>
        <input
          value={state.razonSocial}
          onChange={(e) => update({ razonSocial: e.target.value })}
          placeholder="Ej. Distribuidora Central SpA"
          style={{
            background: 'var(--card-glass-bg)',
            borderColor: 'var(--card-glass-border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label>RUT de la empresa</label>
        <input
          value={state.rut}
          onChange={(e) => update({ rut: formatearRut(e.target.value) })}
          placeholder="76.123.456-K"
          maxLength={12}
          style={{
            background: 'var(--card-glass-bg)',
            borderColor: state.rut.trim().length > 0 && !rutValido ? 'var(--danger)' : 'var(--card-glass-border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />
        {state.rut.trim().length > 0 && !rutValido && (
          <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
            RUT inválido. Revisa el número y el dígito verificador.
          </div>
        )}
        {rutValido && (
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--green)',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: 600,
            }}
          >
            <Star4Point size={10} color="var(--green)" />
            <Icon name="check" size={12} strokeWidth={2.8} /> RUT válido y verificado para facturación
          </div>
        )}
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <label>{esProveedor ? 'Tipo de producto que distribuyes' : 'Rubro de la empresa'}</label>
        <input
          value={state.rubro}
          onChange={(e) => update({ rubro: e.target.value })}
          placeholder={esProveedor ? 'Ej. Alimentos refrigerados, frutas' : 'Ej. Construcción, ferretería, retail'}
          style={{
            background: 'var(--card-glass-bg)',
            borderColor: 'var(--card-glass-border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />
      </div>

      {!esProveedor && (
        <div
          className="glow-card between"
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderRadius: 14,
            background: 'var(--card-glass-bg)',
            border: '1px solid var(--card-glass-border)',
          }}
        >
          <div className="row" style={{ gap: 10 }}>
            <span style={{ color: 'var(--navy)' }}>
              <Icon name="doc" size={18} strokeWidth={1.8} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>¿Emites factura electrónica?</div>
              <div style={{ fontSize: 11, color: 'var(--slate)' }}>Permite pagos con IVA y respaldo SII</div>
            </div>
          </div>
          <div
            className={`toggle ${state.emiteFactura ? 'on' : ''}`}
            onClick={() => update({ emiteFactura: !state.emiteFactura })}
          >
            <div className="knob" />
          </div>
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

      <button
        className="btn btn-primary"
        style={{
          padding: '13px 0',
          fontSize: 15,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: canSubmit && !saving ? '0 8px 24px -4px var(--navy)' : 'none',
          transition: 'all 0.2s ease',
        }}
        disabled={!canSubmit || saving}
        onClick={handleSubmit}
      >
        <span>{saving ? 'Guardando perfil…' : 'Finalizar registro'}</span>
        {!saving && <Icon name="arrowR" size={16} strokeWidth={2.4} />}
      </button>
    </div>
  )
}
