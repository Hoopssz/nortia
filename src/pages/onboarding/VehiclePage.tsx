import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { ThemeTogglePill } from '../../components/ThemeTogglePill'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { uploadToBucket, sanitizeFileName } from '../../lib/uploadFile'
import { getErrorMessage } from '../../lib/errors'
import { validarPatente, validarRut, formatearRut } from '../../lib/validators'
import type { Enums } from '../../lib/database.types'

const TIPOS: { value: Enums<'tipo_vehiculo'>; label: string }[] = [
  { value: 'camioneta', label: 'Camioneta' },
  { value: 'tres_cuartos', label: 'Camión ¾' },
  { value: 'camion', label: 'Camión' },
  { value: 'rampla', label: 'Rampla' },
  { value: 'refrigerado', label: 'Refrigerado' },
  { value: 'plano', label: 'Plano' },
]

const CARROCERIAS: { value: Enums<'tipo_carroceria'>; label: string }[] = [
  { value: 'cerrada', label: 'Cerrada' },
  { value: 'abierta', label: 'Abierta' },
  { value: 'toldo', label: 'Toldo' },
]

const TITLES = ['¿Qué camión tienes?', 'Capacidad y equipamiento', 'Documentos y patente']
const SUBS = [
  'Con esto filtramos las cargas exactas que le calzan a tu vehículo',
  'Cuánto soporta tu equipo y con qué implementos cuentas',
  'Verificación oficial para dar confianza y asignarte fletes inmediatos',
]

function FileField({
  label,
  hint,
  file,
  onChange,
  accept,
}: {
  label: string
  hint: string
  file: File | null
  onChange: (file: File | null) => void
  accept: string
}) {
  return (
    <div
      className="glow-card between"
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        cursor: 'pointer',
        background: file ? 'var(--navy-tint)' : 'var(--card-glass-bg)',
        borderColor: file ? 'var(--navy)' : 'var(--card-glass-border)',
        boxShadow: file ? '0 0 14px -2px var(--navy-tint-2)' : 'none',
        transition: 'all 0.16s ease',
      }}
      onClick={() => document.getElementById(`file-${label}`)?.click()}
    >
      <div className="row" style={{ gap: 10, minWidth: 0, flex: 1 }}>
        <span style={{ color: 'var(--navy)', flexShrink: 0 }}>
          <Icon name="doc" size={18} strokeWidth={1.8} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {file ? file.name : hint}
          </div>
        </div>
      </div>
      <span
        className={`pill ${file ? 'pill-green' : 'pill-navy'}`}
        style={{
          flexShrink: 0,
          marginLeft: 8,
          fontSize: 10.5,
          padding: '3px 8px',
          boxShadow: file ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
        }}
      >
        {file ? (
          <>
            <Icon name="check" size={11} strokeWidth={2.8} /> Subido
          </>
        ) : (
          'Subir'
        )}
      </span>
      <input
        id={`file-${label}`}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

export function VehiclePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const agregando = searchParams.get('agregar') === '1'
  const { state, update, updateCamion } = useOnboarding()
  const { session, refreshPerfil, completeLocalProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const c = state.camion

  useEffect(() => {
    if (agregando) return
    if (!state.rol || state.regiones.length === 0) navigate('/onboarding/rol', { replace: true })
  }, [agregando, state.rol, state.regiones, navigate])

  const step1Valid = c.tipo.length > 0
  const step2Valid = Number(c.carga_max_kg) > 0
  const rutValido = validarRut(state.rut)
  const step3Valid = validarPatente(c.patente) && rutValido

  function saveLocalCamionAndProfile() {
    completeLocalProfile(
      {
        nombre: state.nombre,
        telefono: state.telefono,
        regiones: state.regiones,
        rut: state.rut,
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
          carroceria: c.carroceria || null,
          patente: c.patente.trim().toUpperCase(),
          marca: c.marca || null,
          modelo: c.modelo || null,
          anio: c.anio ? Number(c.anio) : null,
          carga_max_kg: Number(c.carga_max_kg),
          pallets: c.pallets ? Number(c.pallets) : null,
          tiene_rampa: c.tiene_rampa,
          tiene_pulpo: c.tiene_pulpo,
          tiene_grua: c.tiene_grua,
          tiene_refrigeracion: c.tiene_refrigeracion,
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

    try {
      if (agregando) {
        const { error: rpcError } = await supabase.rpc('agregar_rol', {
          p_rol: 'camionero',
          p_rut: state.rut,
        })
        if (rpcError) throw rpcError
      } else {
        const { error: rpcError } = await supabase.rpc('completar_registro', {
          p_rol: state.rol!,
          p_nombre: state.nombre,
          p_telefono: state.telefono,
          p_regiones: state.regiones,
          p_rut: state.rut,
        })
        if (rpcError) throw rpcError
      }

      const userId = session.user.id
      const stamp = Date.now()

      const fotoUrl = c.fotoFile
        ? await uploadToBucket('camiones', `${userId}/foto-${stamp}-${sanitizeFileName(c.fotoFile.name)}`, c.fotoFile)
        : null
      const permisoUrl = c.permisoFile
        ? await uploadToBucket('documentos', `${userId}/permiso-${stamp}-${sanitizeFileName(c.permisoFile.name)}`, c.permisoFile)
        : null
      const revisionUrl = c.revisionFile
        ? await uploadToBucket('documentos', `${userId}/revision-${stamp}-${sanitizeFileName(c.revisionFile.name)}`, c.revisionFile)
        : null
      const soapUrl = c.soapFile
        ? await uploadToBucket('documentos', `${userId}/soap-${stamp}-${sanitizeFileName(c.soapFile.name)}`, c.soapFile)
        : null

      if (c.licenciaFile) {
        await uploadToBucket('documentos', `${userId}/licencia-${stamp}-${sanitizeFileName(c.licenciaFile.name)}`, c.licenciaFile)
      }

      const { error: insertError } = await supabase.from('camiones').insert({
        perfil_id: userId,
        tipo: c.tipo,
        carroceria: c.carroceria || null,
        patente: c.patente.trim().toUpperCase(),
        marca: c.marca || null,
        modelo: c.modelo || null,
        anio: c.anio ? Number(c.anio) : null,
        largo_m: c.largo_m ? Number(c.largo_m) : null,
        ancho_m: c.ancho_m ? Number(c.ancho_m) : null,
        alto_m: c.alto_m ? Number(c.alto_m) : null,
        volumen_m3: c.volumen_m3 ? Number(c.volumen_m3) : null,
        carga_max_kg: Number(c.carga_max_kg),
        pallets: c.pallets ? Number(c.pallets) : null,
        tiene_rampa: c.tiene_rampa,
        tiene_pulpo: c.tiene_pulpo,
        tiene_grua: c.tiene_grua,
        tiene_refrigeracion: c.tiene_refrigeracion,
        ayuda_carga: c.ayuda_carga,
        foto_url: fotoUrl,
        permiso_circulacion_url: permisoUrl,
        revision_tecnica_url: revisionUrl,
        soap_url: soapUrl,
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
      const isDuplicatePatente =
        typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === '23505'
      setError(isDuplicatePatente ? 'Esa patente ya está registrada por otro camión.' : msg)
      setSaving(false)
    }
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1)
    } else {
      finalizar()
    }
  }

  return (
    <div
      className="px"
      style={{
        paddingTop: 16,
        paddingBottom: 24,
        maxWidth: 620,
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
            Tu vehículo · Paso {step} de 3
          </span>
        </div>
        <ThemeTogglePill />
      </div>

      {/* Barra de progreso de 3 pasos con resplandor */}
      <div className="steps" style={{ margin: '4px 0 12px' }}>
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= step ? 'on' : ''} style={i <= step ? { boxShadow: '0 0 10px var(--navy)' } : undefined} />
        ))}
      </div>

      {/* Badge de modo activo */}
      <div style={{ marginBottom: 10 }}>
        <span className="pill pill-glow">
          <Icon name="truck" size={13} strokeWidth={2} />
          {agregando ? 'Agregando modo Camionero' : 'Perfil Camionero'}
        </span>
      </div>

      {/* Título y subtítulo */}
      <div style={{ marginBottom: 14 }}>
        <div className="h2" style={{ margin: '0 0 4px', fontSize: 21 }}>
          {TITLES[step - 1]}
        </div>
        <div className="sub" style={{ margin: 0, fontSize: 13 }}>
          {SUBS[step - 1]}
        </div>
      </div>

      {step === 1 && (
        <>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Tipo de vehículo</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TIPOS.map((t) => {
                const on = c.tipo === t.value
                return (
                  <span
                    key={t.value}
                    className={`chip ${on ? 'on' : ''}`}
                    style={{
                      background: on ? 'var(--navy)' : 'var(--card-glass-bg)',
                      color: on ? '#fff' : 'var(--ink)',
                      borderColor: on ? 'var(--navy)' : 'var(--card-glass-border)',
                      boxShadow: on ? '0 0 14px -2px var(--navy)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      padding: '7px 14px',
                      fontSize: 12.5,
                    }}
                    onClick={() => updateCamion({ tipo: t.value })}
                  >
                    {on && <Star4Point size={10} color="#fff" />}
                    {t.label}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Tipo de carrocería</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CARROCERIAS.map((t) => {
                const on = c.carroceria === t.value
                return (
                  <span
                    key={t.value}
                    className={`chip ${on ? 'on' : ''}`}
                    style={{
                      background: on ? 'var(--navy)' : 'var(--card-glass-bg)',
                      color: on ? '#fff' : 'var(--ink)',
                      borderColor: on ? 'var(--navy)' : 'var(--card-glass-border)',
                      boxShadow: on ? '0 0 14px -2px var(--navy)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      padding: '7px 14px',
                      fontSize: 12.5,
                    }}
                    onClick={() => updateCamion({ carroceria: t.value })}
                  >
                    {on && <Star4Point size={10} color="#fff" />}
                    {t.label}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Dimensiones del pañol de carga (metros y m³)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <input
                placeholder="Largo (m)"
                value={c.largo_m}
                onChange={(e) => updateCamion({ largo_m: e.target.value })}
                style={{
                  background: 'var(--card-glass-bg)',
                  borderColor: 'var(--card-glass-border)',
                  fontSize: 13,
                  padding: '11px 10px',
                }}
              />
              <input
                placeholder="Ancho (m)"
                value={c.ancho_m}
                onChange={(e) => updateCamion({ ancho_m: e.target.value })}
                style={{
                  background: 'var(--card-glass-bg)',
                  borderColor: 'var(--card-glass-border)',
                  fontSize: 13,
                  padding: '11px 10px',
                }}
              />
              <input
                placeholder="Alto (m)"
                value={c.alto_m}
                onChange={(e) => updateCamion({ alto_m: e.target.value })}
                style={{
                  background: 'var(--card-glass-bg)',
                  borderColor: 'var(--card-glass-border)',
                  fontSize: 13,
                  padding: '11px 10px',
                }}
              />
              <input
                placeholder="Volumen (m³)"
                value={c.volumen_m3}
                onChange={(e) => updateCamion({ volumen_m3: e.target.value })}
                style={{
                  background: 'var(--card-glass-bg)',
                  borderColor: 'var(--card-glass-border)',
                  fontSize: 13,
                  padding: '11px 10px',
                }}
              />
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Carga máxima soportada (kg)</label>
              <input
                type="number"
                min={1}
                value={c.carga_max_kg}
                onChange={(e) => updateCamion({ carga_max_kg: e.target.value })}
                placeholder="Ej. 5000"
                style={{
                  background: 'var(--card-glass-bg)',
                  borderColor: 'var(--card-glass-border)',
                }}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Capacidad en pallets estándar</label>
              <input
                placeholder="Ej. 6 pallets"
                value={c.pallets}
                onChange={(e) => updateCamion({ pallets: e.target.value })}
                style={{
                  background: 'var(--card-glass-bg)',
                  borderColor: 'var(--card-glass-border)',
                }}
              />
            </div>
          </div>

          <div
            className="glow-card"
            style={{
              padding: '6px 14px',
              borderRadius: 14,
              background: 'var(--card-glass-bg)',
              border: '1px solid var(--card-glass-border)',
              marginBottom: 14,
            }}
          >
            {(
              [
                ['tiene_rampa', 'ruler', 'Rampa / plataforma hidráulica', 'Para subir carga pesada'],
                ['tiene_pulpo', 'boxes', 'Pulpo / amarras de seguridad', 'Para asegurar la carga'],
                ['tiene_grua', 'boxes', 'Grúa / pluma autocargable', 'Carga y descarga autónoma'],
                ['tiene_refrigeracion', 'snow', 'Equipo de refrigeración', 'Mantiene cadena de frío'],
                ['ayuda_carga', 'user', 'Ayuda física en carga/descarga', 'Tú apoyas directamente'],
              ] as const
            ).map(([key, icon, title, sub], idx, arr) => (
              <div
                key={key}
                className="between"
                style={{ padding: '10px 0', borderBottom: idx < arr.length - 1 ? '1px solid var(--line)' : 'none' }}
              >
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ color: 'var(--navy)' }}>
                    <Icon name={icon} size={17} strokeWidth={1.8} />
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>{sub}</div>
                  </div>
                </div>
                <div
                  className={`toggle ${c[key] ? 'on' : ''}`}
                  onClick={() => updateCamion({ [key]: !c[key] })}
                  style={c[key] ? { boxShadow: '0 0 10px var(--navy)' } : undefined}
                >
                  <div className="knob" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 12 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>RUT del transportista</label>
              <input
                placeholder="12.345.678-5"
                value={state.rut}
                maxLength={12}
                onChange={(e) => update({ rut: formatearRut(e.target.value) })}
                style={{
                  background: 'var(--card-glass-bg)',
                  borderColor: state.rut.trim().length > 0 && !rutValido ? 'var(--danger)' : 'var(--card-glass-border)',
                }}
              />
              {state.rut.trim().length > 0 && !rutValido && (
                <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>RUT inválido.</div>
              )}
              {rutValido && (
                <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <Star4Point size={10} color="var(--green)" />
                  <Icon name="check" size={12} strokeWidth={2.8} /> RUT verificado
                </div>
              )}
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Patente del camión</label>
              <input
                placeholder="Ej. AB1234 o BBCD12"
                value={c.patente}
                onChange={(e) => updateCamion({ patente: e.target.value })}
                style={{
                  background: 'var(--card-glass-bg)',
                  borderColor: c.patente.trim().length > 0 && !validarPatente(c.patente) ? 'var(--danger)' : 'var(--card-glass-border)',
                }}
              />
              {c.patente.trim().length > 0 && !validarPatente(c.patente) && (
                <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Formato de patente no reconocido.</div>
              )}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Marca / modelo / año (opcional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <input
                placeholder="Marca (ej. Volvo)"
                value={c.marca}
                onChange={(e) => updateCamion({ marca: e.target.value })}
                style={{ background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)', fontSize: 13, padding: '10px 10px' }}
              />
              <input
                placeholder="Modelo (ej. FH)"
                value={c.modelo}
                onChange={(e) => updateCamion({ modelo: e.target.value })}
                style={{ background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)', fontSize: 13, padding: '10px 10px' }}
              />
              <input
                placeholder="Año (ej. 2021)"
                value={c.anio}
                onChange={(e) => updateCamion({ anio: e.target.value })}
                style={{ background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)', fontSize: 13, padding: '10px 10px' }}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Documentación del vehículo</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
              <FileField
                label="Permiso de circulación"
                hint="Vigente"
                file={c.permisoFile}
                accept="image/*,application/pdf"
                onChange={(f) => updateCamion({ permisoFile: f })}
              />
              <FileField
                label="Revisión técnica"
                hint="Al día"
                file={c.revisionFile}
                accept="image/*,application/pdf"
                onChange={(f) => updateCamion({ revisionFile: f })}
              />
              <FileField
                label="Seguro obligatorio (SOAP)"
                hint="Vigente"
                file={c.soapFile}
                accept="image/*,application/pdf"
                onChange={(f) => updateCamion({ soapFile: f })}
              />
              <FileField
                label="Licencia profesional"
                hint="Clase A4 / A5 vigente"
                file={c.licenciaFile}
                accept="image/*,application/pdf"
                onChange={(f) => updateCamion({ licenciaFile: f })}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Fotografía del camión</label>
            <div
              className="glow-card"
              style={{
                border: '1.5px dashed var(--navy-tint-2)',
                borderRadius: 12,
                padding: '16px',
                textAlign: 'center',
                color: 'var(--slate)',
                cursor: 'pointer',
                background: 'var(--card-glass-bg)',
                transition: 'all 0.18s ease',
              }}
              onClick={() => document.getElementById('file-foto')?.click()}
            >
              <div style={{ color: 'var(--navy)', display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                <Icon name="camera" size={22} strokeWidth={1.7} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                {c.fotoFile ? c.fotoFile.name : 'Tomar foto o subir desde tu dispositivo'}
              </span>
              <input
                id="file-foto"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => updateCamion({ fotoFile: e.target.files?.[0] ?? null })}
              />
            </div>
          </div>
        </>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

      {/* Botones de navegación */}
      <div className="row" style={{ gap: 10 }}>
        {step > 1 && (
          <button
            type="button"
            className="chip"
            style={{
              padding: '12px 18px',
              fontSize: 14,
              cursor: 'pointer',
              background: 'var(--card-glass-bg)',
              borderColor: 'var(--card-glass-border)',
            }}
            onClick={() => setStep(step - 1)}
          >
            <Icon name="arrowL" size={15} strokeWidth={2.4} /> Volver
          </button>
        )}

        <button
          className="btn btn-primary"
          style={{
            flex: 1,
            padding: '13px 0',
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow:
              saving || (step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)
                ? 'none'
                : '0 8px 24px -4px var(--navy)',
            transition: 'all 0.2s ease',
          }}
          disabled={saving || (step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)}
          onClick={handleNext}
        >
          <span>{saving ? 'Guardando…' : step === 3 ? 'Finalizar registro' : 'Continuar'}</span>
          {!saving && <Icon name={step === 3 ? 'check' : 'arrowR'} size={16} strokeWidth={2.4} />}
        </button>
      </div>
    </div>
  )
}
