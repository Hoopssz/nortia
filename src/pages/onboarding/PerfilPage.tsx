import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { ThemeTogglePill } from '../../components/ThemeTogglePill'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { formatearRut } from '../../lib/validators'
import { getErrorMessage } from '../../lib/errors'

const RUBROS_RAPIDOS = [
  'Frutas, Verduras o Agrícola',
  'Madera y Forestal',
  'Materiales de Construcción',
  'Alimentos y Abarrotes',
  'Carga General / Pallets',
]

export function PerfilPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const agregarRol = searchParams.get('agregar')
  const agregando = agregarRol === 'negocio' || agregarRol === 'proveedor'
  const { state, update } = useOnboarding()
  const { session, refreshPerfil, completeLocalProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const esProveedor = agregando ? agregarRol === 'proveedor' : state.rol === 'proveedor'

  useEffect(() => {
    if (agregando) return
    if (!state.rol || state.regiones.length === 0) navigate('/onboarding/rol', { replace: true })
  }, [agregando, state.rol, state.regiones, navigate])

  const canSubmit = state.razonSocial.trim().length > 0

  async function handleSubmit() {
    if (!agregando && !state.rol) return
    setSaving(true)
    setError(null)

    const targetRol = (agregando ? agregarRol! : state.rol!) as 'negocio' | 'proveedor'
    const finalRubro = state.rubro.trim() || 'Carga General'
    const finalRut = state.rut.trim() || '76.000.000-0'

    if (localStorage.getItem('nortia_active_user_email')) {
      completeLocalProfile(
        {
          nombre: state.nombre,
          telefono: state.telefono,
          regiones: state.regiones,
          razon_social: state.razonSocial.trim(),
          rut: finalRut,
          rubro: finalRubro,
          emite_factura: state.emiteFactura,
        },
        targetRol,
        agregando,
      )
      setSaving(false)
      navigate('/home')
      return
    }

    try {
      const { error } = agregando
        ? await supabase.rpc('agregar_rol', {
            p_rol: agregarRol!,
            p_razon_social: state.razonSocial.trim(),
            p_rut: finalRut,
            p_rubro: finalRubro,
          })
        : await supabase.rpc('completar_registro', {
            p_rol: state.rol!,
            p_nombre: state.nombre,
            p_telefono: state.telefono,
            p_regiones: state.regiones,
            p_razon_social: state.razonSocial.trim(),
            p_rut: finalRut,
            p_rubro: finalRubro,
          })

      if (error) {
        const msg = getErrorMessage(error)
        if (msg.toLowerCase().includes('load failed') || msg.toLowerCase().includes('fetch')) {
          completeLocalProfile(
            {
              nombre: state.nombre,
              telefono: state.telefono,
              regiones: state.regiones,
              razon_social: state.razonSocial.trim(),
              rut: finalRut,
              rubro: finalRubro,
              emite_factura: state.emiteFactura,
            },
            targetRol,
            agregando,
          )
          setSaving(false)
          navigate('/home')
          return
        }
        setSaving(false)
        setError(msg)
        return
      }

      if (!esProveedor && session?.user.id) {
        await supabase.from('perfiles').update({ emite_factura: state.emiteFactura }).eq('id', session.user.id)
      }

      await refreshPerfil()
      navigate('/home')
    } catch {
      completeLocalProfile(
        {
          nombre: state.nombre,
          telefono: state.telefono,
          regiones: state.regiones,
          razon_social: state.razonSocial.trim(),
          rut: finalRut,
          rubro: finalRubro,
          emite_factura: state.emiteFactura,
        },
        targetRol,
        agregando,
      )
      setSaving(false)
      navigate('/home')
    }
  }

  return (
    <div
      className="px"
      style={{
        paddingTop: 20,
        paddingBottom: 36,
        maxWidth: 580,
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Barra superior */}
      <div className="between" style={{ marginBottom: 10, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star4Point size={15} color="var(--navy)" />
          <span className="eyebrow" style={{ margin: 0, fontSize: 13 }}>
            Paso 3 de 3 · Datos de tu negocio
          </span>
        </div>
        <ThemeTogglePill />
      </div>

      {/* Barra de progreso */}
      <div className="steps" style={{ margin: '6px 0 18px', height: 8 }}>
        <span className="on" />
        <span className="on" />
        <span className="on" />
      </div>

      {/* Título grande y claro */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="h2" style={{ margin: '0 0 6px', fontSize: 26, lineHeight: 1.25 }}>
          Datos de tu empresa o negocio
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: 'var(--slate)', lineHeight: 1.45 }}>
          Completa el nombre de tu negocio para empezar a publicar cargas de inmediato:
        </p>
      </div>

      {/* 1. Nombre del Negocio */}
      <div className="field" style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
          1. Nombre de tu negocio o empresa
        </label>
        <input
          value={state.razonSocial}
          onChange={(e) => update({ razonSocial: e.target.value })}
          placeholder="Ej. Agrícola San Pedro / Comercial Muñoz"
          style={{
            fontSize: 17,
            padding: '14px 16px',
            borderRadius: 14,
            background: 'var(--surface)',
            border: '2px solid var(--line)',
          }}
        />
      </div>

      {/* 2. RUT */}
      <div className="field" style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
          2. RUT de la empresa o personal (opcional)
        </label>
        <input
          value={state.rut}
          onChange={(e) => update({ rut: formatearRut(e.target.value) })}
          placeholder="Ej. 76.123.456-K"
          maxLength={12}
          style={{
            fontSize: 17,
            padding: '14px 16px',
            borderRadius: 14,
            background: 'var(--surface)',
            border: '2px solid var(--line)',
          }}
        />
      </div>

      {/* 3. Tipo de carga con botones grandes para tocar sin escribir */}
      <div className="field" style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
          3. ¿Qué tipo de carga mueves principalmente? (Toca una opción)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {RUBROS_RAPIDOS.map((item) => {
            const active = state.rubro === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => update({ rubro: item })}
                style={{
                  padding: '13px 16px',
                  borderRadius: 14,
                  border: `2px solid ${active ? 'var(--navy)' : 'var(--line)'}`,
                  background: active ? 'var(--navy)' : 'var(--surface)',
                  color: active ? '#FFFFFF' : 'var(--ink)',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <span>{item}</span>
                <span>{active ? '✓ Elegido' : 'Tocar'}</span>
              </button>
            )
          })}
        </div>
        <input
          value={state.rubro}
          onChange={(e) => update({ rubro: e.target.value })}
          placeholder="O escribe aquí otro rubro..."
          style={{
            fontSize: 16,
            padding: '13px 16px',
            borderRadius: 14,
            background: 'var(--surface)',
            border: '2px solid var(--line)',
          }}
        />
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: 15, marginBottom: 14 }}>{error}</p>}

      {/* Botones inferiores */}
      <div style={{ display: 'flex', gap: 12 }}>
        {!agregando && (
          <button
            type="button"
            onClick={() => navigate('/onboarding/regiones')}
            style={{
              padding: '16px 20px',
              borderRadius: 18,
              border: '2px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="arrowL" size={18} strokeWidth={2.5} />
            <span>Volver</span>
          </button>
        )}

        <button
          className="btn btn-primary"
          style={{
            flex: 1,
            padding: '16px 24px',
            fontSize: 17,
            fontWeight: 800,
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: canSubmit && !saving ? 1 : 0.5,
            cursor: canSubmit && !saving ? 'pointer' : 'not-allowed',
          }}
          disabled={!canSubmit || saving}
          onClick={handleSubmit}
        >
          <span>{saving ? 'Entrando a NORTIA…' : '✓ Terminar y Entrar'}</span>
        </button>
      </div>
    </div>
  )
}
