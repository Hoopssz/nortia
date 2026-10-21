import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { NortiaLogo } from '../components/NortiaLogo'
import { useAuth } from '../contexts/useAuth'
import {
  calcularDistanciaKm,
  estimarTiempoViaje,
  calcularPrecioReferenciaSugerido,
} from '../lib/chileLocations'

const CIUDADES_CHILE = [
  { nombre: 'Arica (XV Región)', lat: -18.4783, lng: -70.3126 },
  { nombre: 'Iquique (I Región)', lat: -20.2167, lng: -70.1500 },
  { nombre: 'Antofagasta (II Región)', lat: -23.6500, lng: -70.4000 },
  { nombre: 'Calama (II Región)', lat: -22.4544, lng: -68.9294 },
  { nombre: 'Copiapó (III Región)', lat: -27.3667, lng: -70.3333 },
  { nombre: 'La Serena / Coquimbo (IV Región)', lat: -29.9027, lng: -71.2519 },
  { nombre: 'Valparaíso (Puerto)', lat: -33.0472, lng: -71.6127 },
  { nombre: 'San Antonio (Puerto)', lat: -33.5833, lng: -71.6167 },
  { nombre: 'Santiago (Región Metropolitana)', lat: -33.4489, lng: -70.6693 },
  { nombre: 'Rancagua (VI Región)', lat: -34.1708, lng: -70.7444 },
  { nombre: 'Curicó (VII Región)', lat: -34.9828, lng: -71.2394 },
  { nombre: 'Talca (VII Región)', lat: -35.4264, lng: -71.6554 },
  { nombre: 'Chillán (XVI Región)', lat: -36.6067, lng: -72.1033 },
  { nombre: 'Concepción / Talcahuano (VIII Región)', lat: -36.8270, lng: -73.0503 },
  { nombre: 'Los Ángeles (VIII Región)', lat: -37.4697, lng: -72.3537 },
  { nombre: 'Temuco (IX Región)', lat: -38.7359, lng: -72.5904 },
  { nombre: 'Valdivia (XIV Región)', lat: -39.8142, lng: -73.2459 },
  { nombre: 'Osorno (X Región)', lat: -40.5739, lng: -73.1335 },
  { nombre: 'Puerto Montt (X Región)', lat: -41.4693, lng: -72.9424 },
  { nombre: 'Punta Arenas (XII Región)', lat: -53.1638, lng: -70.9171 },
]

// Componente de Estrella de 4 Puntas (4-Pointed Star Motif ✦)
function Star4Point({ size = 16, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
    </svg>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const { session, perfil } = useAuth()

  // Estados del Simulador de Fletes
  const [origenIdx, setOrigenIdx] = useState(8) // Santiago por defecto
  const [destinoIdx, setDestinoIdx] = useState(13) // Concepción por defecto
  const [tipoCarga, setTipoCarga] = useState('general')
  const [pesoTon, setPesoTon] = useState(12)
  const [requiereFrio, setRequiereFrio] = useState(false)

  // FAQ Acordeón
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null)

  // Cálculo en vivo de la cotización
  const cotizacion = useMemo(() => {
    const o = CIUDADES_CHILE[origenIdx]
    const d = CIUDADES_CHILE[destinoIdx]
    if (origenIdx === destinoIdx) {
      return { km: 35, tiempo: '1h 15m', precioSugerido: 95000, ahorro: 21000 }
    }
    const km = calcularDistanciaKm(o.lat, o.lng, d.lat, d.lng)
    const tiempo = estimarTiempoViaje(km)
    let precioBase = calcularPrecioReferenciaSugerido(km, pesoTon * 1000)
    if (requiereFrio) precioBase = Math.round(precioBase * 1.22)
    const ahorroEstimado = Math.round(precioBase * 0.22)

    return {
      km,
      tiempo: tiempo.texto,
      precioSugerido: precioBase,
      ahorro: ahorroEstimado,
    }
  }, [origenIdx, destinoIdx, pesoTon, requiereFrio])

  function handleCotizarDirecto() {
    navigate('/login')
  }

  const faqs = [
    {
      q: '¿Cómo funciona la custodia de fondos (Escrow)?',
      a: 'Al contratar un flete, la empresa transfiere el dinero a la cuenta de custodia protegida de NORTIA. El transportista tiene la certeza de que el pago está 100% garantizado antes de encender el motor, y la empresa sabe que el dinero solo se libera cuando el receptor firma el comprobante en destino.',
    },
    {
      q: '¿Cómo se emite la Factura Electrónica ante el SII?',
      a: 'NORTIA emite automáticamente la Factura Electrónica (DTE 33) por el 12% de comisión de intermediación con IVA desglosado para la contabilidad de tu empresa.',
    },
    {
      q: '¿Qué ocurre si hay demoras en el andén de descarga?',
      a: 'NORTIA incluye 2 horas de cortesía gratis. Pasado ese tiempo, el sistema activa automáticamente el Reloj de Estadía a razón de $18.000 CLP/hora para compensar justamente al transportista.',
    },
    {
      q: '¿Cuenta la carga con seguro de transporte?',
      a: 'Sí. Todos los fletes gestionados por NORTIA cuentan con opción de póliza de seguro complementario con cobertura ante colisión, volcamiento, incendio y robo en carretera.',
    },
  ]

  return (
    <div
      style={{
        background: '#070E1B',
        color: '#FFFFFF',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans)',
        overflowX: 'hidden',
      }}
    >
      {/* 1. NAVBAR TRANSLÚCIDA CON ESTILO STITCH */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(7, 14, 27, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo Oficial NORTIA */}
          <div
            className="row"
            style={{ cursor: 'pointer', alignItems: 'center' }}
            onClick={() => navigate('/')}
          >
            <NortiaLogo variant="both" size={34} lightText={true} />
          </div>

          {/* Links de Navegación de Escritorio */}
          <nav style={{ display: 'none', gap: 24, alignItems: 'center' }} className="desktop-nav">
            <a href="#simulador" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Simulador</a>
            <a href="#empresas" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Empresas</a>
            <a href="#transportistas" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Transportistas</a>
            <a href="#faq" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Preguntas</a>
            <span
              onClick={() => navigate('/simulator')}
              style={{
                color: '#38BDF8',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
                borderRadius: 999,
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 0 14px rgba(56, 189, 248, 0.2)',
              }}
            >
              📱 Simulador App Móvil
            </span>
          </nav>

          {/* Botones de Acción */}
          <div className="row" style={{ gap: 10 }}>
            {session ? (
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: 'auto',
                  padding: '9px 20px',
                  fontSize: 12.5,
                  background: 'linear-gradient(135deg, #265370 0%, #1C3E54 100%)',
                  color: '#FFFFFF',
                  borderRadius: 18,
                  fontWeight: 700,
                  boxShadow: '0 4px 18px rgba(38, 83, 112, 0.45)',
                  border: 'none',
                }}
                onClick={() => navigate('/app')}
              >
                🚀 Abrir mi App ({perfil?.rol === 'camionero' ? 'Camionero' : 'Empresa'}) →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{
                    width: 'auto',
                    padding: '9px 16px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 18,
                  }}
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    width: 'auto',
                    padding: '9px 18px',
                    fontSize: 12.5,
                    background: 'linear-gradient(135deg, #265370 0%, #1C3E54 100%)',
                    color: '#FFFFFF',
                    borderRadius: 18,
                    fontWeight: 700,
                    boxShadow: '0 4px 18px rgba(38, 83, 112, 0.4)',
                    border: 'none',
                  }}
                  onClick={() => navigate('/login')}
                >
                  📲 Entrar a la App
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION ATMOSFÉRICA (Fondo de Video / Gradiente Translúcido) */}
      <section
        style={{
          position: 'relative',
          padding: '70px 20px 60px',
          overflow: 'hidden',
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* Video / Loop de Fondo con Gradiente Translúcido */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {/* Video de fondo con baja opacidad y autoplay loop */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover',
              opacity: 0.22,
              filter: 'saturate(1.2) contrast(1.15)',
            }}
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-driving-on-a-highway-at-night-41566-large.mp4"
              type="video/mp4"
            />
          </video>

          {/* Mesh Gradient Radial para el brillo azul profundo / cielo estrellado */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 18%, rgba(2, 132, 199, 0.28) 0%, rgba(7, 14, 27, 0.85) 60%, #070E1B 100%)',
            }}
          />

          {/* Patrón de cuadrícula de puntos estilo Stitch */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              opacity: 0.4,
            }}
          />
        </div>

        {/* Contenido Central del Hero */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto' }}>
          {/* Badge Translúcido con Estrella de 4 Puntas */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11.5,
              fontWeight: 800,
              padding: '6px 16px',
              borderRadius: 999,
              background: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38BDF8',
              marginBottom: 24,
              boxShadow: '0 0 24px rgba(2, 132, 199, 0.2)',
              letterSpacing: 0.5,
            }}
          >
            <Star4Point size={13} color="#38BDF8" />
            <span>EL NUEVO HORIZONTE DEL TRANSPORTE DE CARGA EN CHILE</span>
          </div>

          {/* Título Principal Editorial */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(34px, 6vw, 62px)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#FFFFFF',
              margin: '0 auto 20px',
              letterSpacing: -0.5,
              maxWidth: 860,
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}
          >
            Cada Carga Encuentra su Norte.
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: 680,
              margin: '0 auto 36px',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Conectamos empresas generadoras de carga con más de <b>1.500 transportistas verificados</b> en las 16 regiones de Chile. Con custodia de fondos en tiempo real, facturación DTE 33 SII y cero comisiones abusivas.
          </p>

          {/* Botones de Llamado a la Acción Hero */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 14,
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: 'auto',
                padding: '14px 28px',
                fontSize: 14,
                background: 'linear-gradient(135deg, #265370 0%, #1C3E54 100%)',
                color: '#FFFFFF',
                borderRadius: 18,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: 'none',
                boxShadow: '0 8px 30px rgba(38, 83, 112, 0.45)',
              }}
              onClick={() => navigate('/app')}
            >
              <span>📲</span>
              {session ? 'Abrir mi App NORTIA →' : 'Entrar a la App NORTIA →'}
            </button>

            <a
              href="#simulador"
              className="btn btn-primary"
              style={{
                width: 'auto',
                padding: '14px 28px',
                fontSize: 14,
                background: '#FFFFFF',
                color: '#265370',
                borderRadius: 18,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(255, 255, 255, 0.3)',
              }}
            >
              <Star4Point size={15} color="#265370" />
              Simular Cotización en Vivo
            </a>

            <button
              type="button"
              className="btn btn-ghost"
              style={{
                width: 'auto',
                padding: '14px 24px',
                fontSize: 14,
                color: '#FFFFFF',
                borderRadius: 18,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}
              onClick={() => navigate('/login')}
            >
              Registrar Empresa o Camión →
            </button>
          </div>
        </div>
      </section>

      {/* 3. SIMULADOR TRANSLÚCIDO (GLASSMORPHIC) */}
      <section id="simulador" style={{ padding: '30px 20px 80px', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto',
            borderRadius: 28,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 20px 60px -15px rgba(2, 132, 199, 0.25), 0 0 40px rgba(0,0,0,0.5)',
            padding: '32px 28px',
          }}
        >
          {/* Header del Simulador */}
          <div className="between" style={{ marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
            <div className="row" style={{ gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'rgba(2, 132, 199, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                }}
              >
                <Star4Point size={18} color="#38BDF8" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>
                  Simulador de Tarifas en Tiempo Real
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>
                  Algoritmo oficial con peajes de la Ruta 5 y distancias interurbanas
                </div>
              </div>
            </div>

            <span
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#34D399',
                fontSize: 11,
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              Tarifas 2026
            </span>
          </div>

          {/* Formulario de Cotización */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
            {/* Origen */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                ORIGEN (PUNTO DE CARGA)
              </label>
              <select
                value={origenIdx}
                onChange={(e) => setOrigenIdx(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 13,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  outline: 'none',
                }}
              >
                {CIUDADES_CHILE.map((c, i) => (
                  <option key={c.nombre} value={i} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Destino */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                DESTINO (PUNTO DE ENTREGA)
              </label>
              <select
                value={destinoIdx}
                onChange={(e) => setDestinoIdx(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 13,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  outline: 'none',
                }}
              >
                {CIUDADES_CHILE.map((c, i) => (
                  <option key={c.nombre} value={i} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
            {/* Peso */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                PESO ESTIMADO
              </label>
              <select
                value={pesoTon}
                onChange={(e) => setPesoTon(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 13,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  outline: 'none',
                }}
              >
                <option value={2} style={{ background: '#0F172A' }}>Hasta 2 Ton (Camioneta/¾)</option>
                <option value={5} style={{ background: '#0F172A' }}>5 Ton (Camión Mediano)</option>
                <option value={12} style={{ background: '#0F172A' }}>12 Ton (Camión Simple)</option>
                <option value={24} style={{ background: '#0F172A' }}>24 Ton (Rampla / Tracto)</option>
                <option value={28} style={{ background: '#0F172A' }}>28 Ton (Rampla Pesada)</option>
              </select>
            </div>

            {/* Tipo de Mercadería */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                TIPO DE MERCADERÍA
              </label>
              <select
                value={tipoCarga}
                onChange={(e) => setTipoCarga(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 13,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  outline: 'none',
                }}
              >
                <option value="general" style={{ background: '#0F172A' }}>Carga General / Pallets</option>
                <option value="fruta" style={{ background: '#0F172A' }}>Fruta / Agroindustria</option>
                <option value="construccion" style={{ background: '#0F172A' }}>Materiales Construcción</option>
                <option value="retail" style={{ background: '#0F172A' }}>Abarrotes & Retail</option>
                <option value="maquinaria" style={{ background: '#0F172A' }}>Maquinaria & Equipos</option>
              </select>
            </div>

            {/* Checkbox Frío */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input
                type="checkbox"
                id="frioCheck"
                checked={requiereFrio}
                onChange={(e) => setRequiereFrio(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#265370' }}
              />
              <label htmlFor="frioCheck" style={{ fontSize: 12.5, fontWeight: 700, color: '#E2E8F0', cursor: 'pointer', margin: 0 }}>
                Control Frío (Reefer)
              </label>
            </div>
          </div>

          {/* Tarjeta de Resultado Translúcida */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 20,
              padding: '22px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 800, letterSpacing: 1 }}>
                TARIFA SUGERIDA DE MERCADO
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, margin: '2px 0' }}>
                ${cotizacion.precioSugerido.toLocaleString('es-CL')}{' '}
                <span style={{ fontSize: 16, fontWeight: 600, color: '#38BDF8' }}>CLP</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star4Point size={11} color="#38BDF8" />
                <span>{cotizacion.km.toLocaleString('es-CL')} km de recorrido · {cotizacion.tiempo} aprox.</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.6)',
                  color: '#6EE7B7',
                  fontSize: 11.5,
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: 999,
                  display: 'inline-block',
                  marginBottom: 10,
                }}
              >
                Ahorras ~${cotizacion.ahorro.toLocaleString('es-CL')} (-22%)
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{
                  background: '#FFFFFF',
                  color: '#070E1B',
                  fontWeight: 900,
                  fontSize: 13.5,
                  padding: '12px 22px',
                  borderRadius: 999,
                  display: 'block',
                  width: '100%',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)',
                }}
                onClick={handleCotizarDirecto}
              >
                Publicar este Flete →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN EDITORIAL (BENTO GRID - ESTILO STITCH LIGHT/DARK HYBRID) */}
      <section
        id="empresas"
        style={{
          background: '#0B1528',
          padding: '80px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header de Sección Editorial */}
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1,
                color: '#38BDF8',
                marginBottom: 12,
              }}
            >
              <Star4Point size={12} color="#38BDF8" />
              VENTAJAS DE LA RED NORTIA
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '0 0 14px',
                letterSpacing: -0.5,
              }}
            >
              Diseñado para Ambos Lados de la Carretera
            </h2>
            <p style={{ fontSize: 15, color: '#94A3B8', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
              Una arquitectura transparente que elimina fricciones comerciales y rentabiliza cada kilómetro recorrido.
            </p>
          </div>

          {/* Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Tarjeta Empresas */}
            <div
              style={{
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: 'rgba(2, 132, 199, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                    marginBottom: 20,
                  }}
                >
                  <Icon name="building" size={22} />
                </div>

                <div style={{ fontWeight: 800, fontSize: 20, color: '#FFFFFF', marginBottom: 4 }}>
                  Para Empresas & Generadores
                </div>
                <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 24 }}>
                  Agroindustria, viñas, madereras, retail y construcción
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Star4Point size={14} color="#10B981" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#F1F5F9' }}>Ahorro Real del ~22%</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
                        Sin sobrecostos del 35% de comisionistas e intermediarios antiguos.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Star4Point size={14} color="#10B981" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#F1F5F9' }}>Custodia Segura Escrow</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
                        El pago se libera únicamente cuando recibes la mercadería conforme en destino.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Star4Point size={14} color="#10B981" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#F1F5F9' }}>Facturación Electrónica SII</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
                        DTE 33 oficial con IVA del 12% sobre comisión para tu contabilidad.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: 32,
                  padding: '13px',
                  background: '#FFFFFF',
                  color: '#070E1B',
                  borderRadius: 12,
                  fontWeight: 800,
                }}
                onClick={() => navigate('/login')}
              >
                Registrar Empresa Gratis
              </button>
            </div>

            {/* Tarjeta Transportistas */}
            <div
              id="transportistas"
              style={{
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                    marginBottom: 20,
                  }}
                >
                  <Icon name="truck" size={22} />
                </div>

                <div style={{ fontWeight: 800, fontSize: 20, color: '#FFFFFF', marginBottom: 4 }}>
                  Para Transportistas & Choferes
                </div>
                <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 24 }}>
                  Dueños de camión, flotas medianas y transportistas autónomos
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Star4Point size={14} color="#38BDF8" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#F1F5F9' }}>Cero Retornos Vacíos</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
                        Cargas compatibles en tu ruta de vuelta para no gastar petróleo sin ingresos.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Star4Point size={14} color="#38BDF8" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#F1F5F9' }}>Pago Inmediato a Cuenta RUT / Banco</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
                        Liquidación en menos de 24 horas tras la entrega, sin cheques a 60 o 90 días.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Star4Point size={14} color="#38BDF8" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#F1F5F9' }}>Compensación de Estadía ($18.000/hr)</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
                        Si te hacen esperar más de 2 horas en bodega, recibes compensación por demora.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  marginTop: 32,
                  padding: '13px',
                  borderRadius: 12,
                  fontWeight: 800,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                onClick={() => navigate('/login')}
              >
                Inscribir mi Camión
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PREGUNTAS FRECUENTES (FAQ ACORDEÓN) */}
      <section id="faq" style={{ padding: '80px 20px', maxWidth: 840, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              color: '#38BDF8',
              marginBottom: 10,
            }}
          >
            <Star4Point size={12} color="#38BDF8" />
            TRANSPARENCIA TOTAL
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Preguntas Frecuentes
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => {
            const isOpen = faqAbierto === i
            return (
              <div
                key={faq.q}
                style={{
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '18px 22px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setFaqAbierto(isOpen ? null : i)}
              >
                <div className="between" style={{ gap: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: isOpen ? '#38BDF8' : '#FFFFFF' }}>
                    {faq.q}
                  </div>
                  <span style={{ fontSize: 18, color: '#94A3B8', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
                    +
                  </span>
                </div>
                {isOpen && (
                  <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 12, lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 6. FOOTER CORPORATIVO CON ESTRELLAS DE 4 PUNTAS */}
      <footer
        style={{
          background: '#040810',
          color: '#FFFFFF',
          padding: '60px 20px 30px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ marginBottom: 14 }}>
                <NortiaLogo variant="both" size={32} lightText={true} />
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                Plataforma Tecnológica de Transporte Terrestre de Carga de Chile. Conectividad, seguridad y custodia de fondos.
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 10 }}>
                Santiago · Valparaíso · Concepción · Puerto Montt
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#F1F5F9', marginBottom: 12 }}>Plataforma</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#94A3B8' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Publicar Cargas</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Buscar Fletes</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Club NORTIA Pro</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Calculadora Ruta 5</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#F1F5F9', marginBottom: 12 }}>Marco Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#94A3B8' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/terminos')}>Términos y Condiciones</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/privacidad')}>Política de Privacidad</span>
                <span>Facturación DTE 33 SII</span>
                <span>Código del Trabajo Art. 25 bis</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#F1F5F9', marginBottom: 12 }}>Central de Soporte 24/7</div>
              <div style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.6 }}>
                <div>WhatsApp: +56 9 8765 4321</div>
                <div>Central Telefónica: +56 2 2987 6543</div>
                <div>Email: contacto@nortia.cl</div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: 20,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 11.5,
              color: '#64748B',
            }}
          >
            <div>© 2026 NORTIA SpA. Todos los derechos reservados. Chile.</div>
            <div className="row" style={{ gap: 16 }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/terminos')}>Términos</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/privacidad')}>Privacidad</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Acceso a la App</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
