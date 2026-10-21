import { useNavigate } from 'react-router-dom'

export function PrivacidadPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '6px 12px', marginBottom: 16, fontSize: 12.5 }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <div className="card" style={{ padding: '32px 28px', borderRadius: 24, background: '#FFFFFF', border: '1px solid var(--line)' }}>
          <div className="eyebrow" style={{ color: 'var(--navy)' }}>Privacidad y Protección de Datos</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy)', margin: '4px 0 16px' }}>
            Política de Privacidad de NORTIA
          </h1>
          <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 24 }}>
            Última actualización: 1 de Septiembre de 2026 · Cumplimiento de la Ley N° 19.628 de Chile y directrices de App Store y Google Play.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                1. Información que Recopilamos
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                Recopilamos datos estrictamente necesarios para la prestación del servicio logístico: Nombre, RUT, datos de contacto, información del vehículo de transporte (patente, tipo de camión, capacidad en toneladas), documentos de idoneidad (padrón, licencia, SOAP, revisión técnica) y ubicación geográfica en tiempo real durante la ejecución activa de un flete.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                2. Uso de la Geolocalización (GPS)
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                El acceso a la ubicación del dispositivo móvil se utiliza exclusivamente para: (a) compartir la posición del camión con la empresa generadora de carga durante el trayecto, (b) registrar la llegada exacta al andén de carga/descarga para el cálculo de estadía, y (c) ofrecer asistencia en carretera y alertas de seguridad. NORTIA no rastrea la ubicación cuando no hay un flete activo.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                3. Uso de la Cámara y Almacenamiento
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                El acceso a la cámara y galería de imágenes se solicita únicamente para capturar fotografías de la guía de despacho timbrada, el estado de la carga o evidencia de daños en el Comprobante de Entrega Digital (POD).
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                4. Eliminación de Datos y Derecho al Olvido (Apple Guideline 5.1.1(v))
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                Cualquier usuario puede solicitar en cualquier momento la baja de su cuenta y la eliminación completa de sus datos personales directamente desde la sección "Mi Cuenta &gt; Solicitar eliminación o baja de mi cuenta" dentro de la aplicación, o escribiendo a privacidad@nortia.cl.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
