import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { validarRut } from '../../lib/validators'

export function PerfilPage() {
  const navigate = useNavigate()
  const { state, update } = useOnboarding()
  const { session, refreshPerfil } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const esProveedor = state.rol === 'proveedor'

  useEffect(() => {
    if (!state.rol || state.regiones.length === 0) navigate('/onboarding/rol', { replace: true })
  }, [state.rol, state.regiones, navigate])

  const rutValido = validarRut(state.rut)
  const canSubmit = state.razonSocial.trim().length > 0 && rutValido && state.rubro.trim().length > 0

  async function handleSubmit() {
    if (!state.rol) return
    setSaving(true)
    setError(null)

    const { error } = await supabase.rpc('completar_registro', {
      p_rol: state.rol,
      p_nombre: state.nombre,
      p_telefono: state.telefono,
      p_regiones: state.regiones,
      p_razon_social: state.razonSocial,
      p_rut: state.rut,
      p_rubro: state.rubro,
    })

    if (error) {
      setSaving(false)
      setError(error.message)
      return
    }

    if (!esProveedor && session?.user.id) {
      await supabase.from('perfiles').update({ emite_factura: state.emiteFactura }).eq('id', session.user.id)
    }

    await refreshPerfil()
    navigate('/home')
  }

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 90, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <span className="pill pill-navy" style={{ marginBottom: 12 }}>
        <Icon name={esProveedor ? 'package' : 'building'} size={13} strokeWidth={1.9} />
        {esProveedor ? ' SOLO PROVEEDOR' : ' SOLO NEGOCIO'}
      </span>
      <div className="eyebrow">Paso 3 de 3 · {esProveedor ? 'Tu operación' : 'Tu empresa'}</div>
      <div className="h2">{esProveedor ? 'Cuéntanos qué distribuyes' : 'Cuéntanos de tu negocio'}</div>
      <div className="sub">
        {esProveedor
          ? 'Definimos tus rutas y requisitos para calzar camiones.'
          : 'Esto le da confianza al camionero para tomar tu carga.'}
      </div>

      <div className="field">
        <label>Razón social</label>
        <input value={state.razonSocial} onChange={(e) => update({ razonSocial: e.target.value })} placeholder="Constructora Ñuble" />
      </div>
      <div className="field">
        <label>RUT</label>
        <input value={state.rut} onChange={(e) => update({ rut: e.target.value })} placeholder="76.XXX.XXX-X" />
        {state.rut.trim().length > 0 && !rutValido && (
          <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 5 }}>RUT inválido. Revisa el número y el dígito verificador.</div>
        )}
      </div>
      <div className="field">
        <label>{esProveedor ? 'Tipo de producto' : 'Rubro'}</label>
        <input
          value={state.rubro}
          onChange={(e) => update({ rubro: e.target.value })}
          placeholder={esProveedor ? 'Alimentos frescos' : 'Construcción'}
        />
      </div>

      {!esProveedor && (
        <div className="card between">
          <div className="row">
            <span style={{ color: 'var(--navy)' }}>
              <Icon name="doc" size={18} strokeWidth={1.7} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>¿Emites factura?</span>
          </div>
          <div
            className={`toggle ${state.emiteFactura ? 'on' : ''}`}
            onClick={() => update({ emiteFactura: !state.emiteFactura })}
          >
            <div className="knob" />
          </div>
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 14 }}>{error}</p>}

      <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={!canSubmit || saving} onClick={handleSubmit}>
        {saving ? 'Guardando…' : 'Finalizar registro'} {!saving && <Icon name="arrowR" size={18} strokeWidth={2} />}
      </button>
    </div>
  )
}
