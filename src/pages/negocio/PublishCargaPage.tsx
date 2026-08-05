import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { regionNames, regionOrder } from '../../lib/chileRegions'
import type { Enums } from '../../lib/database.types'

const TIPOS_VEHICULO: { value: Enums<'tipo_vehiculo'>; label: string }[] = [
  { value: 'camioneta', label: 'Camioneta' },
  { value: 'tres_cuartos', label: 'Camión ¾' },
  { value: 'camion', label: 'Camión' },
  { value: 'rampla', label: 'Rampla' },
  { value: 'refrigerado', label: 'Refrigerado' },
  { value: 'plano', label: 'Plano' },
]

export function PublishCargaPage() {
  const navigate = useNavigate()
  const { session, perfil } = useAuth()
  const basePath = perfil?.rol === 'proveedor' ? '/proveedor' : '/negocio'

  const [tipoCarga, setTipoCarga] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [pesoKg, setPesoKg] = useState('')
  const [volumenM3, setVolumenM3] = useState('')
  const [pallets, setPallets] = useState('')
  const [origenTexto, setOrigenTexto] = useState('')
  const [origenRegion, setOrigenRegion] = useState('')
  const [destinoTexto, setDestinoTexto] = useState('')
  const [destinoRegion, setDestinoRegion] = useState('')
  const [fechaRetiro, setFechaRetiro] = useState('')
  const [precioReferencia, setPrecioReferencia] = useState('')
  const [tipoVehiculo, setTipoVehiculo] = useState<Enums<'tipo_vehiculo'> | ''>('')
  const [requiereFrio, setRequiereFrio] = useState(false)
  const [requiereRampa, setRequiereRampa] = useState(false)
  const [requiereGrua, setRequiereGrua] = useState(false)
  const [requiereAyuda, setRequiereAyuda] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    origenTexto.trim().length > 0 &&
    destinoTexto.trim().length > 0 &&
    Number(pesoKg) > 0 &&
    origenRegion.trim().length > 0

  async function handleSubmit() {
    if (!session?.user.id) return
    setSaving(true)
    setError(null)

    const { data, error } = await supabase
      .from('cargas')
      .insert({
        cliente_id: session.user.id,
        tipo_carga: tipoCarga || null,
        descripcion: descripcion || null,
        peso_kg: Number(pesoKg),
        volumen_m3: volumenM3 ? Number(volumenM3) : null,
        pallets: pallets ? Number(pallets) : null,
        origen_texto: origenTexto,
        origen_region: origenRegion ? Number(origenRegion) : null,
        destino_texto: destinoTexto,
        destino_region: destinoRegion ? Number(destinoRegion) : null,
        fecha_retiro: fechaRetiro ? new Date(fechaRetiro).toISOString() : null,
        precio_referencia: precioReferencia ? Number(precioReferencia) : null,
        tipo_vehiculo_sugerido: tipoVehiculo || null,
        requiere_frio: requiereFrio,
        requiere_rampa: requiereRampa,
        requiere_grua: requiereGrua,
        requiere_ayuda: requiereAyuda,
        estado: 'publicada',
      })
      .select('id')
      .single()

    if (error) {
      setSaving(false)
      setError(error.message)
      return
    }

    navigate(`${basePath}/cargas/${data.id}`)
  }

  return (
    <div className="px" style={{ paddingTop: 18, paddingBottom: 90, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="eyebrow">Nueva carga</div>
      <div className="h2">Publicar carga</div>
      <div className="sub">Mientras más claro, mejores ofertas recibes.</div>

      <div className="field">
        <label>Tipo de carga</label>
        <input value={tipoCarga} onChange={(e) => setTipoCarga(e.target.value)} placeholder="Materiales de construcción" />
      </div>
      <div className="field">
        <label>Descripción (opcional)</label>
        <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles adicionales" />
      </div>
      <div className="field">
        <label>Peso (kg)</label>
        <input type="number" min={1} value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} placeholder="5000" />
      </div>
      <div className="field">
        <div className="row" style={{ gap: 8 }}>
          <input placeholder="Volumen (m³)" value={volumenM3} onChange={(e) => setVolumenM3(e.target.value)} />
          <input placeholder="Pallets" value={pallets} onChange={(e) => setPallets(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Origen</label>
        <div style={{ position: 'relative' }}>
          <input
            value={origenTexto}
            onChange={(e) => setOrigenTexto(e.target.value)}
            placeholder="Av. Libertad 450, Chillán"
            style={{ paddingRight: 42 }}
          />
          <span style={{ position: 'absolute', right: 14, top: 13, color: 'var(--navy)' }}>
            <Icon name="pin" size={17} strokeWidth={1.7} />
          </span>
        </div>
      </div>
      <div className="field">
        <select value={origenRegion} onChange={(e) => setOrigenRegion(e.target.value)} required>
          <option value="">Región de origen (obligatoria)</option>
          {regionOrder.map((codigo) => (
            <option key={codigo} value={codigo}>
              {regionNames[codigo]}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 5 }}>
          Sin esto, ningún camionero podrá ver tu carga.
        </div>
      </div>

      <div className="field">
        <label>Destino</label>
        <div style={{ position: 'relative' }}>
          <input
            value={destinoTexto}
            onChange={(e) => setDestinoTexto(e.target.value)}
            placeholder="San Carlos, Ñuble"
            style={{ paddingRight: 42 }}
          />
          <span style={{ position: 'absolute', right: 14, top: 13, color: 'var(--navy)' }}>
            <Icon name="pin" size={17} strokeWidth={1.7} />
          </span>
        </div>
      </div>
      <div className="field">
        <select value={destinoRegion} onChange={(e) => setDestinoRegion(e.target.value)}>
          <option value="">Región de destino</option>
          {regionOrder.map((codigo) => (
            <option key={codigo} value={codigo}>
              {regionNames[codigo]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Fecha y hora de retiro</label>
        <input type="datetime-local" value={fechaRetiro} onChange={(e) => setFechaRetiro(e.target.value)} />
      </div>
      <div className="field">
        <label>Precio de referencia (opcional)</label>
        <input
          type="number"
          value={precioReferencia}
          onChange={(e) => setPrecioReferencia(e.target.value)}
          placeholder="$50.000"
        />
      </div>

      <div className="field">
        <label>Tipo de vehículo sugerido</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TIPOS_VEHICULO.map((t) => (
            <span
              key={t.value}
              className={`chip ${tipoVehiculo === t.value ? 'on' : ''}`}
              onClick={() => setTipoVehiculo(tipoVehiculo === t.value ? '' : t.value)}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '6px 16px' }}>
        {(
          [
            [requiereFrio, setRequiereFrio, 'snow', 'Requiere frío', 'Cadena de frío'],
            [requiereRampa, setRequiereRampa, 'ruler', 'Requiere rampa', 'Para carga pesada'],
            [requiereGrua, setRequiereGrua, 'boxes', 'Requiere grúa', 'Carga/descarga con pluma'],
            [requiereAyuda, setRequiereAyuda, 'user', 'Necesito ayuda', 'Apoyo en carga/descarga'],
          ] as const
        ).map(([value, setter, icon, title, sub], idx, arr) => (
          <div
            key={title}
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
            <div className={`toggle ${value ? 'on' : ''}`} onClick={() => setter(!value)}>
              <div className="knob" />
            </div>
          </div>
        ))}
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 14 }}>{error}</p>}

      <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={!canSubmit || saving} onClick={handleSubmit}>
        {saving ? 'Publicando…' : 'Publicar carga'} {!saving && <Icon name="arrowR" size={18} strokeWidth={2} />}
      </button>
    </div>
  )
}
