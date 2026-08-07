import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { useOnboarding } from '../../features/onboarding/useOnboarding'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { uploadToBucket, sanitizeFileName } from '../../lib/uploadFile'
import { getErrorMessage } from '../../lib/errors'
import { validarPatente } from '../../lib/validators'
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

const TITLES = ['¿Qué camión tienes?', 'Capacidad y equipo', 'Documentos y patente']
const SUBS = [
  'Con esto filtramos las cargas que te calzan',
  'Cuánto soporta y con qué cuentas',
  'Para verificarte y dar confianza al cliente',
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
      className="card between flat"
      style={{ border: '1.5px solid var(--line)', marginBottom: 8, cursor: 'pointer' }}
      onClick={() => document.getElementById(`file-${label}`)?.click()}
    >
      <div className="row">
        <span style={{ color: 'var(--navy)' }}>
          <Icon name="doc" size={18} strokeWidth={1.7} />
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--slate)' }}>{file ? file.name : hint}</div>
        </div>
      </div>
      <span className={`pill ${file ? 'pill-green' : 'pill-navy'}`}>
        {file ? (
          <>
            <Icon name="check" size={12} strokeWidth={2.6} /> Subido
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
  const { state, updateCamion } = useOnboarding()
  const { session, refreshPerfil } = useAuth()
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
  const step3Valid = validarPatente(c.patente)

  async function finalizar() {
    if (!session?.user.id) return
    if (!agregando && !state.rol) return
    setSaving(true)
    setError(null)

    try {
      if (agregando) {
        const { error: rpcError } = await supabase.rpc('agregar_rol', { p_rol: 'camionero' })
        if (rpcError) throw rpcError
      } else {
        const { error: rpcError } = await supabase.rpc('completar_registro', {
          p_rol: state.rol!,
          p_nombre: state.nombre,
          p_telefono: state.telefono,
          p_regiones: state.regiones,
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
      const isDuplicatePatente =
        typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === '23505'
      setError(isDuplicatePatente ? 'Esa patente ya está registrada por otro camión.' : getErrorMessage(err))
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
    <div className="px" style={{ paddingTop: 16, paddingBottom: 90, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <span className="pill pill-navy" style={{ marginBottom: 12 }}>
        <Icon name="truck" size={13} strokeWidth={1.9} /> {agregando ? 'AGREGANDO MODO CAMIONERO' : 'SOLO CAMIONERO'}
      </span>
      <div className="steps">
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= step ? 'on' : ''} />
        ))}
      </div>
      <div className="eyebrow">Tu vehículo · Paso {step} de 3</div>
      <div className="h2">{TITLES[step - 1]}</div>
      <div className="sub">{SUBS[step - 1]}</div>

      {step === 1 && (
        <>
          <div className="field">
            <label>Tipo de vehículo</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TIPOS.map((t) => (
                <span
                  key={t.value}
                  className={`chip ${c.tipo === t.value ? 'on' : ''}`}
                  onClick={() => updateCamion({ tipo: t.value })}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Carrocería</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CARROCERIAS.map((t) => (
                <span
                  key={t.value}
                  className={`chip ${c.carroceria === t.value ? 'on' : ''}`}
                  onClick={() => updateCamion({ carroceria: t.value })}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Dimensiones del pañol de carga</label>
            <div className="row" style={{ gap: 8 }}>
              <input placeholder="Largo (m)" value={c.largo_m} onChange={(e) => updateCamion({ largo_m: e.target.value })} />
              <input placeholder="Ancho (m)" value={c.ancho_m} onChange={(e) => updateCamion({ ancho_m: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <div className="row" style={{ gap: 8 }}>
              <input placeholder="Alto (m)" value={c.alto_m} onChange={(e) => updateCamion({ alto_m: e.target.value })} />
              <input
                placeholder="Volumen (m³)"
                value={c.volumen_m3}
                onChange={(e) => updateCamion({ volumen_m3: e.target.value })}
              />
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="field">
            <label>Carga máxima (kg)</label>
            <input
              type="number"
              min={1}
              value={c.carga_max_kg}
              onChange={(e) => updateCamion({ carga_max_kg: e.target.value })}
              placeholder="5000"
            />
          </div>
          <div className="field">
            <label>Pallets que caben</label>
            <input placeholder="Ej. 6" value={c.pallets} onChange={(e) => updateCamion({ pallets: e.target.value })} />
          </div>
          <div className="card" style={{ padding: '6px 16px' }}>
            {(
              [
                ['tiene_rampa', 'ruler', 'Rampa / plataforma', 'Para subir carga pesada'],
                ['tiene_pulpo', 'boxes', 'Pulpo / amarras', 'Para asegurar la carga'],
                ['tiene_grua', 'boxes', 'Grúa / pluma', 'Carga y descarga'],
                ['tiene_refrigeracion', 'snow', 'Refrigeración', 'Cadena de frío'],
                ['ayuda_carga', 'user', 'Ayuda en carga/descarga', 'Tú apoyas físicamente'],
              ] as const
            ).map(([key, icon, title, sub], idx, arr) => (
              <div
                key={key}
                className="between"
                style={{ padding: '12px 0', borderBottom: idx < arr.length - 1 ? '1px solid var(--line)' : 'none' }}
              >
                <div className="row">
                  <span style={{ color: 'var(--navy)' }}>
                    <Icon name={icon} size={18} strokeWidth={1.7} />
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>{sub}</div>
                  </div>
                </div>
                <div className={`toggle ${c[key] ? 'on' : ''}`} onClick={() => updateCamion({ [key]: !c[key] })}>
                  <div className="knob" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="field">
            <label>Patente</label>
            <input placeholder="Ej. AB1234 o BBCD12" value={c.patente} onChange={(e) => updateCamion({ patente: e.target.value })} />
            {c.patente.trim().length > 0 && !validarPatente(c.patente) && (
              <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 5 }}>
                Formato de patente no reconocido (ej. AB1234 o BBCD12).
              </div>
            )}
          </div>
          <div className="field">
            <label>Marca / modelo / año (opcional)</label>
            <div className="row" style={{ gap: 8 }}>
              <input placeholder="Marca" value={c.marca} onChange={(e) => updateCamion({ marca: e.target.value })} />
              <input placeholder="Modelo" value={c.modelo} onChange={(e) => updateCamion({ modelo: e.target.value })} />
              <input placeholder="Año" value={c.anio} onChange={(e) => updateCamion({ anio: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Documentos del vehículo</label>
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
          </div>
          <div className="field">
            <label>Foto del camión</label>
            <div
              style={{
                border: '1.5px dashed var(--navy-tint-2)',
                borderRadius: 14,
                padding: 22,
                textAlign: 'center',
                color: 'var(--slate)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('file-foto')?.click()}
            >
              <div style={{ color: 'var(--navy)', display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                <Icon name="camera" size={24} strokeWidth={1.6} />
              </div>
              <span style={{ fontSize: 12 }}>{c.fotoFile ? c.fotoFile.name : 'Tomar o subir foto'}</span>
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

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 14 }}>{error}</p>}

      <button
        className="btn btn-primary"
        style={{ marginTop: 18 }}
        disabled={saving || (step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)}
        onClick={handleNext}
      >
        {saving ? 'Guardando…' : step === 3 ? 'Finalizar registro' : 'Continuar'}
        {!saving && <Icon name={step === 3 ? 'check' : 'arrowR'} size={18} strokeWidth={2} />}
      </button>
    </div>
  )
}
