import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { NortiaLogo } from '../components/NortiaLogo'
import { WebPlatformLayout } from '../layouts/WebPlatformLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/useAuth'
import { obtenerEscrow } from '../lib/escrowService'
import { obtenerFacturaComision, generarFacturaComision, type FacturaComisionNortia } from '../lib/invoiceService'
import type { Tables } from '../lib/database.types'

type Viaje = Tables<'viajes'> & {
  cargas: Pick<Tables<'cargas'>, 'origen_texto' | 'destino_texto' | 'tipo_carga' | 'peso_kg' | 'distancia_km' | 'fecha_retiro'> | null
  contraparte: Pick<Tables<'perfiles'>, 'nombre' | 'razon_social' | 'rut'> | null
}

type FiltroEstado = 'todos' | 'entregado' | 'en_ruta' | 'asignado' | 'cancelado'

function formatCLP(n: number) {
  return `$${n.toLocaleString('es-CL')} CLP`
}
function formatFecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Componente Factura para imprimir/descargar PDF ──────────────────────────
function FacturaPrintView({ factura, viajeData }: { factura: FacturaComisionNortia; viajeData: Viaje }) {
  return (
    <div
      id="nortia-factura-print"
      style={{ fontFamily: 'Arial, sans-serif', padding: 32, maxWidth: 680, margin: '0 auto', color: '#0F172A', fontSize: 12 }}
    >
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #DC2626', paddingBottom: 16, marginBottom: 16 }}>
        <div>
          <div style={{ marginBottom: 6 }}>
            <NortiaLogo variant="both" size={28} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#265370' }}>NORTIA SPA</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Plataforma Tecnológica de Transporte Terrestre</div>
          <div style={{ fontSize: 10, color: '#64748B' }}>Av. Apoquindo 4500, Las Condes · pagos@nortia.cl</div>
          <div style={{ fontSize: 10, color: '#64748B' }}>R.U.T.: 77.892.340-K · Giro: Servicios de Tecnología e Intermediación</div>
        </div>
        <div style={{ border: '2.5px solid #DC2626', padding: '8px 16px', textAlign: 'center', borderRadius: 6, background: '#FEF2F2' }}>
          <div style={{ fontWeight: 800, fontSize: 11, color: '#DC2626' }}>FACTURA ELECTRÓNICA</div>
          <div style={{ fontWeight: 900, fontSize: 20, color: '#DC2626' }}>N° {factura.folio}</div>
          <div style={{ fontSize: 9, color: '#DC2626' }}>S.I.I. - SANTIAGO CENTRO</div>
        </div>
      </div>

      {/* Receptor */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 11 }}>
        <tbody>
          <tr>
            <td style={{ padding: '3px 0', fontWeight: 700, width: 120 }}>SEÑOR(ES):</td>
            <td>{factura.clienteNombre}</td>
            <td style={{ fontWeight: 700, width: 100 }}>R.U.T.:</td>
            <td>{factura.clienteRut}</td>
          </tr>
          <tr>
            <td style={{ padding: '3px 0', fontWeight: 700 }}>GIRO:</td>
            <td>{factura.clienteGiro}</td>
            <td style={{ fontWeight: 700 }}>FECHA EMISIÓN:</td>
            <td>{factura.fechaEmision}</td>
          </tr>
          <tr>
            <td style={{ padding: '3px 0', fontWeight: 700 }}>FLETE:</td>
            <td colSpan={3}>{factura.origenTexto} → {factura.destinoTexto}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700 }}>FECHA ENTREGA:</td>
            <td colSpan={3}>{formatFecha(viajeData.fecha_entrega)}</td>
          </tr>
        </tbody>
      </table>

      {/* Detalle */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#F1F5F9', borderBottom: '1.5px solid #CBD5E1' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, fontWeight: 800, color: '#475569' }}>DESCRIPCIÓN</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', fontSize: 10, fontWeight: 800, color: '#475569' }}>VALOR</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
            <td style={{ padding: '8px 8px' }}>
              <div style={{ fontWeight: 700 }}>Comisión de Servicio NORTIA (12%)</div>
              <div style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>
                Intermediación flete {factura.origenTexto} → {factura.destinoTexto}<br />
                Valor flete: {formatCLP(factura.montoFleteTotal)} · N° Op.: {viajeData.id.slice(0,8).toUpperCase()}
              </div>
            </td>
            <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700 }}>{formatCLP(factura.totalComision)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totales */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <table style={{ width: 220, fontSize: 12 }}>
          <tbody>
            <tr><td style={{ padding: '2px 0', color: '#475569' }}>MONTO NETO:</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCLP(factura.montoNetoComision)}</td></tr>
            <tr><td style={{ padding: '2px 0', color: '#475569' }}>I.V.A. (19%):</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCLP(factura.ivaComision)}</td></tr>
            <tr style={{ borderTop: '2px solid #0F172A' }}>
              <td style={{ padding: '4px 0', fontWeight: 900, fontSize: 14 }}>TOTAL:</td>
              <td style={{ textAlign: 'right', fontWeight: 900, fontSize: 14, color: '#1E3A8A' }}>{formatCLP(factura.totalComision)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Timbre */}
      <div style={{ border: '1.5px solid #94A3B8', borderRadius: 6, padding: '8px 12px', textAlign: 'center', background: '#F8FAFC', marginBottom: 10 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, color: '#0F172A', fontWeight: 800 }}>
          |||||| | |||||||| || |||||| | |||||||||||||||| ||| ||||||
        </div>
        <div style={{ fontSize: 8.5, color: '#475569', marginTop: 3 }}>
          Timbre Electrónico S.I.I. · Res. N° 80 del 2014 · Código: {factura.codigoAutorizacionSii} · Verifique en www.sii.cl
        </div>
      </div>
      <div style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>
        Documento generado por NORTIA SPA · nortia.cl · Representación impresa de un DTE
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function HistorialPage() {
  const navigate = useNavigate()
  const { session, perfil } = useAuth()

  const [viajes, setViajes] = useState<Viaje[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [facturaViaje, setFacturaViaje] = useState<{ viaje: Viaje; factura: FacturaComisionNortia } | null>(null)
  const [imprimiendo, setImprimiendo] = useState(false)

  const esCamionero = perfil?.rol === 'camionero'

  useEffect(() => {
    if (!session?.user.id) return
    let active = true

    async function load() {
      const campoId = esCamionero ? 'camionero_id' : 'cliente_id'
      const contraparteField = esCamionero
        ? 'contraparte:cliente_id(nombre, razon_social, rut)'
        : 'contraparte:camionero_id(nombre, razon_social, rut)'

      const { data } = await supabase
        .from('viajes')
        .select(`*, cargas:carga_id(origen_texto, destino_texto, tipo_carga, peso_kg, distancia_km, fecha_retiro), ${contraparteField}`)
        .eq(campoId, session!.user.id)
        .order('created_at', { ascending: false })

      if (!active) return
      setViajes((data as Viaje[]) ?? [])
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [session, esCamionero])

  function handleVerFactura(viaje: Viaje) {
    let factura = obtenerFacturaComision(viaje.id)
    if (!factura) {
      const cp = viaje.contraparte
      factura = generarFacturaComision(
        viaje.id,
        cp?.razon_social || cp?.nombre || 'Cliente NORTIA',
        cp?.rut || '76.000.000-0',
        viaje.cargas?.origen_texto || '—',
        viaje.cargas?.destino_texto || '—',
        viaje.precio_final,
      )
    }
    setFacturaViaje({ viaje, factura })
  }

  function handleImprimir() {
    setImprimiendo(true)
    setTimeout(() => { window.print(); setImprimiendo(false) }, 150)
  }

  const filtrados = viajes.filter((v) => filtro === 'todos' || v.estado === filtro)
  const entregados = viajes.filter((v) => v.estado === 'entregado')
  const totalBruto = entregados.reduce((a, v) => a + v.precio_final, 0)
  const totalComision = entregados.reduce((a, v) => a + (v.comision_monto ?? Math.round(v.precio_final * 0.12)), 0)
  const totalLiquido = totalBruto - totalComision
  const totalLiberado = entregados.filter((v) => obtenerEscrow(v.id).liberado)
    .reduce((a, v) => a + (v.precio_final - (v.comision_monto ?? Math.round(v.precio_final * 0.12))), 0)

  const FILTROS: { key: FiltroEstado; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'entregado', label: '✅ Entregados' },
    { key: 'en_ruta', label: '🛣️ En ruta' },
    { key: 'asignado', label: '📋 Asignados' },
    { key: 'cancelado', label: '❌ Cancelados' },
  ]

  return (
    <WebPlatformLayout activeTab="Historial">
      {/* Capa de impresión — solo visible al hacer print() */}
      {facturaViaje && (
        <div className="print-only">
          <FacturaPrintView factura={facturaViaje.factura} viajeData={facturaViaje.viaje} />
        </div>
      )}

      <div className="web-platform-container" style={{ maxWidth: 860 }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 20, alignItems: 'flex-start' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)' }}>
              {esCamionero ? 'MIS FLETES' : 'HISTORIAL DE OPERACIONES'}
            </div>
            <div className="h2" style={{ margin: 0 }}>📋 Historial & Facturación</div>
          </div>
          <button type="button" className="chip" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Volver</span>
          </button>
        </div>

        {/* Resumen financiero */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Fletes completados', value: String(entregados.length), color: 'var(--navy)' },
            { label: 'Monto bruto total', value: formatCLP(totalBruto), color: 'var(--navy)' },
            { label: esCamionero ? 'Comisión NORTIA' : 'Comisión pagada', value: formatCLP(totalComision), color: '#DC2626' },
            { label: esCamionero ? 'Líquido recibido' : 'Fondos liberados', value: formatCLP(esCamionero ? totalLiquido : totalLiberado), color: '#16A34A' },
          ].map((stat) => (
            <div key={stat.label} className="card flat" style={{ padding: '14px 16px', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 10.5, color: 'var(--slate)', marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="row" style={{ gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTROS.map((f) => (
            <button
              key={f.key} type="button" className="chip"
              style={{ fontSize: 11.5, padding: '6px 12px', cursor: 'pointer', background: filtro === f.key ? 'var(--navy)' : undefined, color: filtro === f.key ? '#fff' : undefined }}
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--slate)', alignSelf: 'center' }}>
            {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Lista */}
        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--slate)', textAlign: 'center', padding: 32 }}>Cargando historial…</p>
        ) : filtrados.length === 0 ? (
          <div className="card flat" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Sin registros</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>
              {filtro === 'todos' ? 'Aún no tienes fletes registrados.' : `No hay fletes con estado "${filtro}".`}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtrados.map((v) => {
              const comision = v.comision_monto ?? Math.round(v.precio_final * 0.12)
              const liquido = v.precio_final - comision
              const esc = obtenerEscrow(v.id)
              const badge = esc.liberado
                ? { label: '💰 Pago Liberado', bg: '#16A34A' }
                : v.pagado
                  ? { label: '🔒 En Custodia', bg: '#854D0E' }
                  : v.estado === 'entregado' ? { label: '✅ Entregado', bg: '#15803D' }
                  : v.estado === 'en_ruta'   ? { label: '🛣️ En Ruta', bg: '#265370' }
                  : v.estado === 'cancelado' ? { label: '❌ Cancelado', bg: '#DC2626' }
                  : { label: '📋 Asignado', bg: '#64748B' }

              return (
                <div key={v.id} className="card" style={{ padding: '14px 16px', border: '1px solid var(--line)' }}>
                  <div className="between" style={{ marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)', marginBottom: 2 }}>
                        {v.cargas?.origen_texto || '—'} → {v.cargas?.destino_texto || '—'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                        {v.cargas?.tipo_carga && `${v.cargas.tipo_carga} · `}
                        {v.cargas?.peso_kg ? `${(v.cargas.peso_kg / 1000).toFixed(1)} ton · ` : ''}
                        {v.cargas?.distancia_km ? `${v.cargas.distancia_km} km · ` : ''}
                        {formatFecha(v.fecha_entrega || v.created_at)}
                        {v.contraparte && ` · ${v.contraparte.razon_social || v.contraparte.nombre}`}
                      </div>
                    </div>
                    <span className="pill" style={{ fontSize: 10.5, fontWeight: 700, background: badge.bg, color: '#fff', flexShrink: 0, marginLeft: 10 }}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="between" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                    <div className="row" style={{ gap: 14, fontSize: 12, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--slate)' }}>Bruto: <strong style={{ color: 'var(--ink)' }}>{formatCLP(v.precio_final)}</strong></span>
                      <span style={{ color: 'var(--slate)' }}>Com.: <strong style={{ color: '#DC2626' }}>-{formatCLP(comision)}</strong></span>
                      <span style={{ color: 'var(--slate)' }}>{esCamionero ? 'Líquido' : 'Neto'}: <strong style={{ color: '#166534', fontSize: 13 }}>{formatCLP(liquido)}</strong></span>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <button type="button" className="chip" style={{ fontSize: 11, padding: '5px 10px', cursor: 'pointer' }} onClick={() => navigate(`/viajes/${v.id}`)}>
                        Ver detalle
                      </button>
                      {v.estado === 'entregado' && (
                        <button type="button" className="chip" style={{ fontSize: 11, padding: '5px 10px', cursor: 'pointer', background: '#1E3A8A', color: '#fff' }} onClick={() => handleVerFactura(v)}>
                          📄 Factura
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Factura */}
      {facturaViaje && (
        <div className="apple-modal-overlay">
          <div className="apple-modal-sheet" style={{ maxWidth: 640, padding: 0, overflow: 'hidden' }}>
            <div className="between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <div className="eyebrow" style={{ margin: 0, color: '#DC2626' }}>DTE · FACTURA ELECTRÓNICA</div>
              <button type="button" onClick={() => setFacturaViaje(null)} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              <FacturaPrintView factura={facturaViaje.factura} viajeData={facturaViaje.viaje} />
            </div>
            <div className="row" style={{ gap: 10, padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '11px', justifyContent: 'center' }} onClick={() => setFacturaViaje(null)}>Cerrar</button>
              <button type="button" className="btn btn-primary" style={{ flex: 2, padding: '11px', justifyContent: 'center', background: '#DC2626', borderColor: '#DC2626' }} disabled={imprimiendo} onClick={handleImprimir}>
                {imprimiendo ? 'Preparando…' : '📥 Descargar / Imprimir PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </WebPlatformLayout>
  )
}
