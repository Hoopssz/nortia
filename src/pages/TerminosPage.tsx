import { useNavigate } from 'react-router-dom'

export function TerminosPage() {
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
          <div className="eyebrow" style={{ color: 'var(--navy)' }}>Marco Legal Oficial · Chile</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy)', margin: '4px 0 16px' }}>
            Términos y Condiciones de Uso de NORTIA
          </h1>
          <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 24 }}>
            Última actualización: 1 de Septiembre de 2026 · Conforme al Código de Comercio de Chile (Art. 166+) y Ley N° 19.496.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                1. Naturaleza del Servicio
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                NORTIA SpA opera como una plataforma tecnológica de intermediación y corretaje mercantil digital entre empresas o personas generadoras de carga ("Clientes") y transportistas debidamente inscritos y verificados ("Transportistas"). NORTIA facilita la cotización, asignación, seguimiento y comprobación digital de servicios de transporte terrestre de carga en el territorio de la República de Chile.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                2. Custodia de Fondos (Escrow) y Pagos
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                Al aceptar una cotización, el Cliente transfiere los fondos acordados a la cuenta de custodia segura de NORTIA. Dichos fondos permanecen retenidos y protegidos hasta que el receptor en destino estampa su firma digital y cédula de identidad en el Comprobante de Entrega Digital (POD). Una vez verificado el POD, NORTIA transfiere los fondos correspondientes al Transportista dentro de las 24 horas hábiles siguientes.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                3. Facturación y Comisión por Servicio (DTE 33 SII)
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                Por el servicio de intermediación tecnológica, soporte 24/7 y gestión de pagos, NORTIA cobra una comisión del 12% sobre el valor final del flete, emitiendo la correspondiente Factura Electrónica (DTE 33) ante el Servicio de Impuestos Internos (SII) de Chile.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                4. Compensación por Demoras en Andén (Estadía / Detention Pay)
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                Se establece un plazo estándar de 2 (dos) horas de cortesía gratuita para las faenas de carga y descarga en andén o bodega. Superadas las 2 horas, el sistema registrará la estadía con estampa GPS a razón de $18.000 CLP por hora adicional o fracción, la cual será cobrada al Cliente para compensar al Transportista por el tiempo de detención forzada.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                5. Seguro de Carga y Responsabilidad
              </h3>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                Las cargas que contraten la póliza de seguro complementario de NORTIA contarán con cobertura ante robo con violencia, volcamiento, colisión e incendio durante el tránsito en rutas nacionales. Casos fortuitos o de fuerza mayor (cortes de ruta no imputables, cierres de pasos fronterizos por nieve o catástrofes) se regirán por las disposiciones del Código de Comercio chileno.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
