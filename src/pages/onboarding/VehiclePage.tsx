import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { ThemeTogglePill } from '../../components/ThemeTogglePill'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { getErrorMessage } from '../../lib/errors'
import { formatearRut } from '../../lib/validators'
import type { Enums } from '../../lib/database.types'

const TIPOS: { value: Enums<'tipo_vehiculo'>; label: string; desc: string }[] = [
  { value: 'camioneta', label: 'Camioneta', desc: 'Hasta 1.500 kilos' },
  { value: 'tres_cuartos', label: 'Camión 3/4', desc: 'De 2.000 a 5.000 kilos' },
  { value: 'camion', label: 'Camión Simple', desc: 'De 6.000 a 14.000 kilos' },
  { value: 'rampla', label: 'Rampla / Tracto', desc: 'Hasta 28.000 kilos (28 Ton)' },
  { value: 'refrigerado', label: 'Camión Refrigerado', desc: 'Con equipo de frío' },
  { value: 'plano', label: 'Plano / Cama Baja', desc: 'Madera, fierro o maquinaria' },
]

const PESOS_RAPIDOS = [
  { kg: '1500', label: '1.500 kg (Camioneta)' },
  { kg: '5000', label: '5.000 kg (5 Toneladas)' },
  { kg: '10000', label: '10.000 kg (10 Toneladas)' },
  { kg: '28000', label: '28.000 kg (Rampla 28 Ton)' },
]

export function VehiclePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const agregando = searchParams.get('agregar') === '1'
  const { state, update, updateCamion } = useOnboarding()
  const { session, refreshPerfil, completeLocalProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const c = state.camion

  useEffect(() => {
    if (agregando) return
    if (!state.rol || state.regiones.length === 0) navigate('/onboarding/rol', { replace: true })
  }, [agregando, state.rol, state.regiones, navigate])

  const canFinish = c.tipo.length > 0 && Number(c.carga_max_kg) > 0 && c.patente.trim().length >= 4

  function saveLocalCamionAndProfile() {
    const finalRut = state.rut.trim() || '12.345.678-9'
    completeLocalProfile(
      {
        nombre: state.nombre,
        telefono: state.telefono,
        regiones: state.regiones,
        rut: finalRut,
      },
      'camionero',
      agregando,
    )
    try {
      const userId = session?.user.id || 'local-user'
      localStorage.setItem(
        `nortia_local_camion_${userId}`,
        JSON.stringify({
          id: 'cam-' + Math.random().toString(36).slice(2, 9),
          perfil_id: userId,
          tipo: c.tipo,
          carroceria: c.carroceria || 'cerrada',
          patente: c.patente.trim().toUpperCase(),
          marca: c.marca || null,
          modelo: c.modelo || null,
          anio: c.anio ? Number(c.anio) : null,
          carga_max_kg: Number(c.carga_max_kg),
          pallets: c.pallets ? Number(c.pallets) : null,
          tiene_rampa: c.tiene_rampa,
          tiene_pulpo: c.tiene_pulpo,
          tiene_grua: c.tiene_grua,
          tiene_refrigeracion: c.tipo === 'refrigerado' || c.tiene_refrigeracion,
          ayuda_carga: c.ayuda_carga,
        }),
      )
    } catch {}
    setSaving(false)
    navigate('/home')
  }

  async function finalizar() {
    if (!session?.user.id) return
    if (!agregando && !state.rol) return
    setSaving(true)
    setError(null)

    if (localStorage.getItem('nortia_active_user_email')) {
      saveLocalCamionAndProfile()
      return
    }

    const finalRut = state.rut.trim() || '12.345.678-9'

    try {
      if (agregando) {
        const { error: rpcError } = await supabase.rpc('agregar_rol', {
          p_rol: 'camionero',
          p_rut: finalRut,
        })
        if (rpcError) throw rpcError
      } else {
        const { error: rpcError } = await supabase.rpc('completar_registro', {
          p_rol: state.rol!,
          p_nombre: state.nombre,
          p_telefono: state.telefono,
          p_regiones: state.regiones,
          p_rut: finalRut,
        })
        if (rpcError) throw rpcError
      }

      const userId = session.user.id
      const { error: insertError } = await supabase.from('camiones').insert({
        perfil_id: userId,
        tipo: c.tipo,
        carroceria: c.carroceria || 'cerrada',
        patente: c.patente.trim().toUpperCase(),
        marca: c.marca || null,
        modelo: c.modelo || null,
        anio: c.anio ? Number(c.anio) : null,
        carga_max_kg: Number(c.carga_max_kg),
        tiene_refrigeracion: c.tipo === 'refrigerado' || c.tiene_refrigeracion,
      })
      if (insertError) throw insertError

      await refreshPerfil()
      navigate('/home')
    } catch (err) {
      const msg = getErrorMessage(err)
      if (msg.toLowerCase().includes('load failed') || msg.toLowerCase().includes('fetch')) {
        saveLocalCamionAndProfile()
        return
      }
      setError(msg)
      setSaving(false)
    }
  }

  return (
    <div
      className="px"
      style={{
        paddingTop: 20,
        paddingBottom: 40,
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {/* Barra superior */}
      <div className="between" style={{ marginBottom: 10, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star4Point size={15} color="var(--navy)" />
          <span className="eyebrow" style={{ margin: 0, fontSize: 13 }}>
            Paso 3 de 3 · Datos de tu camión
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
          ¿Qué camión manejas?
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: 'var(--slate)', lineHeight: 1.45 }}>
          Responde estas 3 preguntas simples para mostrarte las cargas disponibles:
        </p>
      </div>

      {/* PREGUNTA 1: Tipo de camión */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
          1. Toca el tipo de tu vehículo:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {TIPOS.map((t) => {
            const active = c.tipo === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  const defaultKg =
                    t.value === 'camioneta'
                      ? '1500'
                      : t.value === 'tres_cuartos'
                        ? '5000'
                        : t.value === 'rampla'
                          ? '28000'
                          : '10000'
                  updateCamion({
                    tipo: t.value,
                    carga_max_kg: c.carga_max_kg || defaultKg,
                  })
                }}
                style={{
                  padding: '15px 16px',
                  borderRadius: 16,
                  border: `2px solid ${active ? 'var(--navy)' : 'var(--line)'}`,
                  background: active ? 'var(--navy)' : 'var(--surface)',
                  color: active ? '#FFFFFF' : 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{t.label}</div>
                  <div style={{ fontSize: 13.5, opacity: active ? 0.9 : 0.75, marginTop: 2 }}>{t.desc}</div>
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: active ? '2px solid #FFFFFF' : '2px solid var(--slate)',
                    background: active ? '#10B981' : 'transparent',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {active ? '✓' : ''}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* PREGUNTA 2: Peso máximo */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
          2. ¿Cuántos kilos aguanta tu camión?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginBottom: 10 }}>
          {PESOS_RAPIDOS.map((p) => {
            const active = String(c.carga_max_kg) === p.kg
            return (
              <button
                key={p.kg}
                type="button"
                onClick={() => updateCamion({ carga_max_kg: p.kg })}
                style={{
                  padding: '13px 14px',
                  borderRadius: 14,
                  border: `2px solid ${active ? 'var(--navy)' : 'var(--line)'}`,
                  background: active ? 'var(--navy)' : 'var(--surface)',
                  color: active ? '#FFFFFF' : 'var(--ink)',
                  fontSize: 15.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{p.label}</span>
                <span>{active ? '✓' : ''}</span>
              </button>
            )
          })}
        </div>
        <div className="field" style={{ margin: 0 }}>
          <input
            type="number"
            min={100}
            value={c.carga_max_kg}
            onChange={(e) => updateCamion({ carga_max_kg: e.target.value })}
            placeholder="O escribe aquí los kilos exactos (ej. 8000)"
            style={{
              fontSize: 17,
              padding: '14px 16px',
              borderRadius: 14,
              background: 'var(--surface)',
              border: '2px solid var(--line)',
            }}
          />
        </div>
      </div>

      {/* PREGUNTA 3: Patente y RUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 26 }}>
        <div className="field" style={{ margin: 0 }}>
          <label style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
            3. Patente de tu camión
          </label>
          <input
            placeholder="Ej. ABCD12"
            value={c.patente}
            onChange={(e) => updateCamion({ patente: e.target.value.toUpperCase() })}
            maxLength={8}
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1,
              padding: '14px 16px',
              borderRadius: 14,
              background: 'var(--surface)',
              border: '2px solid var(--line)',
              textTransform: 'uppercase',
            }}
          />
        </div>

        <div className="field" style={{ margin: 0 }}>
          <label style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
            4. Tu RUT (opcional)
          </label>
          <input
            placeholder="Ej. 12.345.678-9"
            value={state.rut}
            maxLength={12}
            onChange={(e) => update({ rut: formatearRut(e.target.value) })}
            style={{
              fontSize: 17,
              padding: '14px 16px',
              borderRadius: 14,
              background: 'var(--surface)',
              border: '2px solid var(--line)',
            }}
          />
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: 15, marginBottom: 14 }}>{error}</p>}

      {/* Botones Grandes Inferiores */}
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
          type="button"
          className="btn btn-primary"
          disabled={!canFinish || saving}
          onClick={finalizar}
          style={{
            flex: 1,
            padding: '16px 24px',
            borderRadius: 18,
            fontSize: 17,
            fontWeight: 800,
            opacity: canFinish && !saving ? 1 : 0.5,
            cursor: canFinish && !saving ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span>{saving ? 'Entrando a NORTIA…' : '✓ Terminar y Ver Cargas'}</span>
        </button>
      </div>
    </div>
  )
}
