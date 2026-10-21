import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { ChileLocationInput } from '../../components/ChileLocationInput'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'
import { regionNames, regionOrder } from '../../lib/chileRegions'
import {
  calcularDistanciaKm,
  estimarTiempoViaje,
  calcularPrecioReferenciaSugerido,
} from '../../lib/chileLocations'
import { PLANES_SEGURO, generarPoliza, calcularPrimaSeguro, type TipoSeguro } from '../../lib/insuranceService'
import { PlantillasCargaSelector } from '../../components/PlantillasCargaSelector'
import { guardarPlantilla, type PlantillaCarga } from '../../lib/cargaTemplatesService'
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
  const [origenLat, setOrigenLat] = useState<number | null>(null)
  const [origenLng, setOrigenLng] = useState<number | null>(null)
  const [destinoTexto, setDestinoTexto] = useState('')
  const [destinoRegion, setDestinoRegion] = useState('')
  const [destinoLat, setDestinoLat] = useState<number | null>(null)
  const [destinoLng, setDestinoLng] = useState<number | null>(null)
  const [fechaRetiro, setFechaRetiro] = useState('')
  const [precioReferencia, setPrecioReferencia] = useState('')
  const [tipoVehiculo, setTipoVehiculo] = useState<Enums<'tipo_vehiculo'> | ''>('')
  const [requiereFrio, setRequiereFrio] = useState(false)
  const [requiereRampa, setRequiereRampa] = useState(false)
  const [requiereGrua, setRequiereGrua] = useState(false)
  const [requiereAyuda, setRequiereAyuda] = useState(false)
  const [planSeguro, setPlanSeguro] = useState<TipoSeguro>('ninguno')
  const [valorComercial, setValorComercial] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardarComoPlantilla, setGuardarComoPlantilla] = useState(false)
  const [nombreNuevaPlantilla, setNombreNuevaPlantilla] = useState('')

  function handleAplicarPlantilla(p: PlantillaCarga) {
    if (p.tipoCarga) setTipoCarga(p.tipoCarga)
    if (p.descripcion) setDescripcion(p.descripcion)
    if (p.pesoKg) setPesoKg(String(p.pesoKg))
    if (p.volumenM3) setVolumenM3(String(p.volumenM3))
    if (p.pallets) setPallets(String(p.pallets))
    if (p.origenTexto) setOrigenTexto(p.origenTexto)
    if (p.origenRegion) setOrigenRegion(String(p.origenRegion))
    if (p.origenLat != null) setOrigenLat(p.origenLat)
    if (p.origenLng != null) setOrigenLng(p.origenLng)
    if (p.destinoTexto) setDestinoTexto(p.destinoTexto)
    if (p.destinoRegion) setDestinoRegion(String(p.destinoRegion))
    if (p.destinoLat != null) setDestinoLat(p.destinoLat)
    if (p.destinoLng != null) setDestinoLng(p.destinoLng)
    if (p.tipoVehiculo) setTipoVehiculo(p.tipoVehiculo as Enums<'tipo_vehiculo'>)
    setRequiereFrio(Boolean(p.requiereFrio))
    setRequiereRampa(Boolean(p.requiereRampa))
    setRequiereGrua(Boolean(p.requiereGrua))
    setRequiereAyuda(Boolean(p.requiereAyuda))
    if (p.precioReferencia) setPrecioReferencia(String(p.precioReferencia))
  }

  // Cálculo automático de distancia, tiempo y tarifa de referencia
  const estimacionRuta = useMemo(() => {
    if (origenLat != null && origenLng != null && destinoLat != null && destinoLng != null) {
      const km = calcularDistanciaKm(origenLat, origenLng, destinoLat, destinoLng)
      if (km > 0) {
        const tiempo = estimarTiempoViaje(km)
        const sugerido = calcularPrecioReferenciaSugerido(km, Number(pesoKg) || 1000)
        return { km, tiempo, sugerido }
      }
    }
    return null
  }, [origenLat, origenLng, destinoLat, destinoLng, pesoKg])

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
        origen_lat: origenLat,
        origen_lng: origenLng,
        destino_texto: destinoTexto,
        destino_region: destinoRegion ? Number(destinoRegion) : null,
        destino_lat: destinoLat,
        destino_lng: destinoLng,
        distancia_km: estimacionRuta?.km || null,
        fecha_retiro: fechaRetiro ? new Date(fechaRetiro).toISOString() : null,
        precio_referencia: precioReferencia ? Number(precioReferencia) : estimacionRuta?.sugerido || null,
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

    // Generar póliza de seguro si fue contratada
    if (data?.id && planSeguro !== 'ninguno') {
      generarPoliza(
        data.id,
        planSeguro,
        Number(valorComercial) || 5000000,
        perfil?.nombre || perfil?.razon_social || 'Cliente NORTIA',
        perfil?.rut || ''
      )
    }

    // Guardar como plantilla si el usuario lo marcó
    if (guardarComoPlantilla && session?.user.id) {
      guardarPlantilla(session.user.id, {
        clienteId: session.user.id,
        nombrePlantilla: nombreNuevaPlantilla.trim() || `${tipoCarga || 'Carga'} (${origenTexto} → ${destinoTexto})`,
        tipoCarga: tipoCarga || 'Carga General',
        descripcion: descripcion || '',
        pesoKg: Number(pesoKg),
        volumenM3: volumenM3 ? Number(volumenM3) : undefined,
        pallets: pallets ? Number(pallets) : undefined,
        origenTexto,
        origenRegion: Number(origenRegion) || 13,
        origenLat: origenLat || undefined,
        origenLng: origenLng || undefined,
        destinoTexto,
        destinoRegion: Number(destinoRegion) || 13,
        destinoLat: destinoLat || undefined,
        destinoLng: destinoLng || undefined,
        tipoVehiculo: tipoVehiculo || 'camion',
        requiereFrio,
        requiereRampa,
        requiereGrua,
        requiereAyuda,
        precioReferencia: precioReferencia ? Number(precioReferencia) : undefined,
      })
    }

    navigate(`${basePath}/cargas/${data.id}`)
  }

  return (
    <WebPlatformLayout activeTab="Publicar Carga">
      <div className="web-platform-container">
        {/* Header con botón Volver y Título */}
        <div className="between" style={{ marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Generación de Carga & Solicitud de Flete</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              Publicar Carga en Red Nacional
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              Mientras más claros sean los detalles, más rápidas y competitivas serán las ofertas de los transportistas verificados.
            </div>
          </div>

          <button
            type="button"
            className="chip"
            style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
            onClick={() => navigate(basePath)}
          >
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Panel de Cargas</span>
          </button>
        </div>

        {/* Grilla de 2 Columnas */}
        <div className="two-col-grid">
          {/* COLUMNA 1: DETALLES DE LA CARGA, VOLUMEN Y RUTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Selector de Plantillas Recurrentes */}
            {session?.user.id && (
              <PlantillasCargaSelector
                clienteId={session.user.id}
                onSelectPlantilla={handleAplicarPlantilla}
              />
            )}

            <div className="card" style={{ padding: '22px', margin: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 14 }}>
                1. Especificaciones de la Carga
              </div>

              <div className="field">
                <label>Tipo de carga</label>
                <input value={tipoCarga} onChange={(e) => setTipoCarga(e.target.value)} placeholder="Ej. Materiales de construcción, Frutas, Pallets..." />
              </div>

              <div className="field">
                <label>Descripción detallada (opcional)</label>
                <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles de embalaje, fragilidad, horario de atención..." />
              </div>

              <div className="field">
                <label>Peso total (kg)</label>
                <input type="number" min={1} value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} placeholder="Ej. 5000" />
              </div>

              <div className="field">
                <div className="row" style={{ gap: 10 }}>
                  <input placeholder="Volumen (m³)" value={volumenM3} onChange={(e) => setVolumenM3(e.target.value)} />
                  <input placeholder="Cantidad de Pallets" value={pallets} onChange={(e) => setPallets(e.target.value)} />
                </div>
              </div>

              <div className="field" style={{ marginTop: 12 }}>
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
            </div>

            {/* Tarjeta de Origen y Destino */}
            <div className="card" style={{ padding: '22px', margin: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 14 }}>
                2. Origen, Destino y Retiro
              </div>

              {/* Selector interactivo de Origen */}
              <ChileLocationInput
                label="Origen de la carga (Retiro)"
                placeholder="Comuna, calle o sector de retiro en Chile"
                value={origenTexto}
                selectedRegion={origenRegion ? Number(origenRegion) : null}
                required
                onChange={(data) => {
                  setOrigenTexto(data.texto)
                  if (data.regionCodigo) setOrigenRegion(String(data.regionCodigo))
                  if (data.lat != null) setOrigenLat(data.lat)
                  if (data.lng != null) setOrigenLng(data.lng)
                }}
              />
              <div className="field" style={{ marginTop: -4, marginBottom: 14 }}>
                <select value={origenRegion} onChange={(e) => setOrigenRegion(e.target.value)} required>
                  <option value="">Región de origen (obligatoria)</option>
                  {regionOrder.map((codigo) => (
                    <option key={codigo} value={codigo}>
                      {regionNames[codigo]}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>
                  Los transportistas de esta región recibirán una notificación prioritaria.
                </div>
              </div>

              {/* Selector interactivo de Destino */}
              <ChileLocationInput
                label="Destino de la carga (Entrega)"
                placeholder="Comuna, calle o sector de entrega en Chile"
                value={destinoTexto}
                selectedRegion={destinoRegion ? Number(destinoRegion) : null}
                required
                onChange={(data) => {
                  setDestinoTexto(data.texto)
                  if (data.regionCodigo) setDestinoRegion(String(data.regionCodigo))
                  if (data.lat != null) setDestinoLat(data.lat)
                  if (data.lng != null) setDestinoLng(data.lng)
                }}
              />
              <div className="field" style={{ marginTop: -4, marginBottom: 14 }}>
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
                <label>Fecha y hora de retiro programado</label>
                <input type="datetime-local" value={fechaRetiro} onChange={(e) => setFechaRetiro(e.target.value)} />
              </div>
            </div>
          </div>

          {/* COLUMNA 2: ESTIMACIÓN, REQUERIMIENTOS, SEGURO Y PUBLICACIÓN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Estimación Automática de Ruta, Distancia y Tarifa Justa */}
            {estimacionRuta ? (
              <div
                className="card flat"
                style={{
                  background: 'var(--navy-tint)',
                  border: '1.5px solid var(--navy-tint-2)',
                  padding: '18px 20px',
                  borderRadius: 18,
                  margin: 0,
                }}
              >
                <div className="between" style={{ marginBottom: 8 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ color: 'var(--navy)' }}>
                      <Icon name="route" size={18} strokeWidth={2} />
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)' }}>
                      Ruta y Distancia Estimada
                    </span>
                  </div>
                  <span className="pill pill-navy" style={{ fontSize: 11.5, fontWeight: 700 }}>
                    {estimacionRuta.km.toLocaleString('es-CL')} km
                  </span>
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--slate)', marginBottom: 12 }}>
                  ⏱️ <b>Tiempo en carretera:</b> {estimacionRuta.tiempo.texto}
                </div>

                <div
                  className="between"
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid var(--navy-tint-2)',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>Tarifa sugerida de mercado</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>
                      ${estimacionRuta.sugerido.toLocaleString('es-CL')} CLP
                    </div>
                  </div>
                  <button
                    type="button"
                    className="chip"
                    style={{
                      background: 'var(--navy)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '8px 14px',
                      border: 'none',
                    }}
                    onClick={() => setPrecioReferencia(String(estimacionRuta.sugerido))}
                  >
                    Usar sugerido
                  </button>
                </div>
              </div>
            ) : (
              <div className="card flat" style={{ background: 'var(--card-glass-bg)', border: '1px dashed var(--line)', padding: '18px 20px', borderRadius: 18, margin: 0, textAlign: 'center' }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>📍</span>
                <span style={{ fontSize: 13, color: 'var(--slate)' }}>Ingresa origen y destino para ver el kilometraje y tarifa sugerida en tiempo real.</span>
              </div>
            )}

            {/* Precio de Referencia que ofrece el cliente */}
            <div className="card" style={{ padding: '20px', margin: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)', marginBottom: 10 }}>
                Tarifa o Presupuesto de Referencia
              </div>
              <div className="field">
                <input
                  type="number"
                  value={precioReferencia}
                  onChange={(e) => setPrecioReferencia(e.target.value)}
                  placeholder={estimacionRuta ? `$${estimacionRuta.sugerido.toLocaleString('es-CL')}` : '$50.000'}
                  style={{ fontSize: 16, fontWeight: 700, padding: '12px 14px' }}
                />
                <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 6 }}>
                  Monto referencial en pesos chilenos. Los transportistas podrán aceptar o realizar contraofertas.
                </div>
              </div>
            </div>

            {/* Requerimientos de equipamiento */}
            <div className="card" style={{ padding: '8px 20px', margin: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)', padding: '12px 0 6px' }}>
                Requerimientos de Equipamiento
              </div>
              {(
                [
                  [requiereFrio, setRequiereFrio, 'snow', 'Requiere equipo de frío', 'Filtrar solo a camiones con refrigeración'],
                  [requiereRampa, setRequiereRampa, 'ruler', 'Requiere rampa hidráulica', 'Plataforma para subir carga pesada'],
                  [requiereGrua, setRequiereGrua, 'boxes', 'Requiere grúa pluma', 'Para izaje y carga/descarga'],
                  [requiereAyuda, setRequiereAyuda, 'user', 'Requiere peoneta / ayuda', 'El conductor o peoneta apoya en la estiba'],
                ] as const
              ).map(([value, setter, icon, title, sub], idx, arr) => (
                <div
                  key={title}
                  className="between"
                  style={{ padding: '12px 0', borderBottom: idx < arr.length - 1 ? '1px solid var(--line)' : 'none' }}
                >
                  <div className="row" style={{ gap: 10 }}>
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

            {/* Selector de Seguro de Carga NORTIA */}
            <div className="card" style={{ padding: '20px', margin: 0 }}>
              <div className="between" style={{ marginBottom: 12 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ fontSize: 22 }}>🛡️</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>
                      Seguro de Carga NORTIA por Viaje
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>
                      Protege tu mercadería ante robos, volcamientos o siniestros en ruta.
                    </div>
                  </div>
                </div>
              </div>

              <div className="field" style={{ marginTop: 8 }}>
                <label>Valor comercial estimado de la carga ($ CLP)</label>
                <input
                  type="number"
                  placeholder="Ej. $5.000.000"
                  value={valorComercial}
                  onChange={(e) => setValorComercial(e.target.value)}
                />
              </div>

              {/* Planes de Seguro Dinámicos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {(['ninguno', 'basico', 'premium'] as TipoSeguro[]).map((tipo) => {
                  const plan = PLANES_SEGURO[tipo]
                  const isSelected = planSeguro === tipo
                  const primaCalculada = calcularPrimaSeguro(tipo, Number(valorComercial) || 5000000)

                  return (
                    <div
                      key={tipo}
                      onClick={() => setPlanSeguro(tipo)}
                      style={{
                        border: `1.5px solid ${isSelected ? 'var(--navy)' : 'var(--line)'}`,
                        background: isSelected ? 'var(--navy-tint)' : 'var(--paper)',
                        borderRadius: 14,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="between">
                        <div className="row" style={{ gap: 8 }}>
                          <input type="radio" checked={isSelected} onChange={() => setPlanSeguro(tipo)} style={{ margin: 0 }} />
                          <span style={{ fontWeight: 700, fontSize: 13, color: isSelected ? 'var(--navy)' : 'var(--ink)' }}>
                            {plan.nombre}
                          </span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 13, color: isSelected ? 'var(--navy)' : 'var(--slate)' }}>
                          {tipo === 'ninguno'
                            ? 'Gratis'
                            : `+$${primaCalculada.toLocaleString('es-CL')} CLP`}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4, paddingLeft: 24 }}>
                        {plan.descripcion} {tipo !== 'ninguno' && `· Prima al ${(plan.tasaPct * 100).toFixed(2)}%`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Opción de Guardar como Plantilla Recurrente */}
            <div
              className="card flat"
              style={{
                background: 'var(--card-glass-bg)',
                padding: '16px',
                borderRadius: 16,
                margin: 0,
                border: '1px solid var(--line)',
              }}
            >
              <div className="between">
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⚡</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>Guardar como plantilla recurrente</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                      Reutiliza estos datos para publicar este flete en 1 clic en el futuro.
                    </div>
                  </div>
                </div>

                <div
                  className={`toggle ${guardarComoPlantilla ? 'on' : ''}`}
                  onClick={() => setGuardarComoPlantilla(!guardarComoPlantilla)}
                >
                  <div className="knob" />
                </div>
              </div>

              {guardarComoPlantilla && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', display: 'block', marginBottom: 4 }}>
                    Nombre de la Plantilla:
                  </label>
                  <input
                    placeholder="Ej. Despacho Fruta San Antonio - Santiago"
                    value={nombreNuevaPlantilla}
                    onChange={(e) => setNombreNuevaPlantilla(e.target.value)}
                    style={{ fontSize: 12.5, padding: '8px 12px' }}
                  />
                </div>
              )}
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, margin: 0 }}>{error}</p>}

            <button
              className="btn btn-primary"
              style={{ padding: '16px', fontSize: 15, fontWeight: 800, borderRadius: 14 }}
              disabled={!canSubmit || saving}
              onClick={handleSubmit}
            >
              {saving ? 'Publicando en NORTIA…' : 'Publicar Carga Ahora'} {!saving && <Icon name="arrowR" size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  )
}

