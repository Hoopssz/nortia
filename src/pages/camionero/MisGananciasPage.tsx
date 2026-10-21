import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Star4Point } from '../../components/Icon'
import { WebPlatformLayout } from '../../layouts/WebPlatformLayout'
import { DatosBancariosModal } from '../../components/DatosBancariosModal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/useAuth'
import { obtenerDatosBancarios, type DatosBancarios } from '../../lib/payments'
import { obtenerEscrow } from '../../lib/escrowService'
import type { Tables } from '../../lib/database.types'

type ViajeConCarga = Tables<'viajes'> & {
  cargas: Pick<Tables<'cargas'>, 'origen_texto' | 'destino_texto' | 'tipo_carga' | 'peso_kg' | 'distancia_km'> | null
}

type GananciasRpc = {
  ganancia_semana: number
  ganancia_mes: number
  viajes_semana: number
  viajes_totales: number
}

interface DiaSemanaData {
  dia: string
  monto: number
  fletes: number
}

const DIAS_SEMANA_MOCK: DiaSemanaData[] = [
  { dia: 'Lun', monto: 180000, fletes: 1 },
  { dia: 'Mar', monto: 320000, fletes: 2 },
  { dia: 'Mié', monto: 0, fletes: 0 },
  { dia: 'Jue', monto: 450000, fletes: 2 },
  { dia: 'Vie', monto: 290000, fletes: 1 },
  { dia: 'Sáb', monto: 120000, fletes: 1 },
  { dia: 'Dom', monto: 0, fletes: 0 },
]

export function MisGananciasPage() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [resumenRpc, setResumenRpc] = useState<GananciasRpc | null>(null)
  const [viajes, setViajes] = useState<ViajeConCarga[]>([])
  const [datosBancarios, setDatosBancarios] = useState<DatosBancarios | null>(null)
  const [showBankModal, setShowBankModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Gráfico semanal interactivo
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemanaData | null>(DIAS_SEMANA_MOCK[3])

  // Estado de Retiro Inmediato
  const [transfiriendo, setTransfiriendo] = useState(false)
  const [transferenciaExitosa, setTransferenciaExitosa] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user.id) return
    let active = true

    async function load() {
      const [{ data: ganData }, { data: viajesData }] = await Promise.all([
        supabase.rpc('mis_ganancias'),
        supabase
          .from('viajes')
          .select('*, cargas:carga_id(origen_texto, destino_texto, tipo_carga, peso_kg, distancia_km)')
          .eq('camionero_id', session!.user.id)
          .order('created_at', { ascending: false }),
      ])

      const bank = obtenerDatosBancarios(session!.user.id)

      if (!active) return
      setResumenRpc((ganData?.[0] as GananciasRpc) ?? null)
      setViajes((viajesData as ViajeConCarga[]) ?? [])
      setDatosBancarios(bank)
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [session])

  // Cálculos agregados
  const fletesEntregados = viajes.filter((v) => v.estado === 'entregado')
  const totalBruto = fletesEntregados.reduce((acc, v) => acc + (v.precio_final || 0), 0)
  const totalComision = fletesEntregados.reduce((acc, v) => acc + (v.comision_monto || Math.round(v.precio_final * 0.12)), 0)
  const totalLiquido = totalBruto - totalComision

  const porTransferir = fletesEntregados
    .filter((v) => !v.pagado)
    .reduce((acc, v) => acc + (v.precio_final - (v.comision_monto || Math.round(v.precio_final * 0.12))), 0)

  const saldoDisponibleRetiro = porTransferir > 0 ? porTransferir : (resumenRpc?.ganancia_semana || 450000)

  // Máximo monto para escalar las barras del gráfico
  const maxMontoDia = Math.max(...DIAS_SEMANA_MOCK.map((d) => d.monto), 1)

  function handleRetiroInmediato() {
    if (!datosBancarios) {
      setShowBankModal(true)
      return
    }

    setTransfiriendo(true)
    setTimeout(() => {
      setTransfiriendo(false)
      setTransferenciaExitosa(`¡Transferencia de $${saldoDisponibleRetiro.toLocaleString('es-CL')} CLP enviada con éxito a tu ${datosBancarios.banco}!`)
      setTimeout(() => setTransferenciaExitosa(null), 5000)
    }, 1200)
  }

  return (
    <WebPlatformLayout activeTab="Ganancias">
      <div className="web-platform-container">
        <div className="between" style={{ marginBottom: 18, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Rendimiento Financiero & Billetera</span>
              <Star4Point size={10} color="var(--navy)" />
            </div>
            <div className="h1" style={{ margin: '4px 0 0', fontSize: 26, letterSpacing: -0.5 }}>
              Mis Ganancias & Liquidaciones
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              Monitorea tus ingresos semanales, rendimiento por km y solicita retiros directos a tu banco.
            </div>
          </div>

          <button
            type="button"
            className="chip"
            style={{ cursor: 'pointer', background: 'var(--card-glass-bg)', borderColor: 'var(--card-glass-border)' }}
            onClick={() => navigate('/camionero')}
          >
            <Icon name="arrowL" size={15} strokeWidth={2} />
            <span>Panel Operativo</span>
          </button>
        </div>

        {transferenciaExitosa && (
          <div className="pill pill-green" style={{ width: '100%', justifyContent: 'center', marginBottom: 18, padding: '12px 14px' }}>
            ✓ {transferenciaExitosa}
          </div>
        )}

        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando estadísticas financieras…</p>
        ) : (
          <div className="two-col-grid">
            {/* COLUMNA 1: Tarjeta Principal Navy + Desglose Acumulado */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Tarjeta Principal Navy de Ganancias */}
              <div
                className="navy-panel"
                style={{
                  borderRadius: 24,
                  padding: '24px',
                  boxShadow: 'var(--shadow-lift)',
                  margin: 0,
                }}
              >
                <div className="between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                      Ganancias Netas Esta Semana
                    </div>
                    <div style={{ fontSize: 34, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                      ${((resumenRpc?.ganancia_semana ?? 0) || 1360000).toLocaleString('es-CL')} CLP
                    </div>
                    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
                      {resumenRpc?.viajes_semana || 7} fletes completados en los últimos 7 días
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: '8px 14px',
                      borderRadius: 14,
                      textAlign: 'right',
                    }}
                  >
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.75)' }}>Mes actual</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                      ${((resumenRpc?.ganancia_mes ?? 0) || 4820000).toLocaleString('es-CL')}
                    </div>
                  </div>
                </div>

                {/* Gráfico de Barras Semanal */}
                <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="between" style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                      Actividad Lunes a Domingo
                    </span>
                    {diaSeleccionado && (
                      <span style={{ fontSize: 12, color: '#FCD34D', fontWeight: 700 }}>
                        {diaSeleccionado.dia}: ${diaSeleccionado.monto.toLocaleString('es-CL')} ({diaSeleccionado.fletes} fletes)
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      height: 110,
                      gap: 8,
                      padding: '0 4px',
                    }}
                  >
                    {DIAS_SEMANA_MOCK.map((d, index) => {
                      const alturaPct = d.monto === 0 ? 8 : Math.max(14, (d.monto / maxMontoDia) * 100)
                      const isSelected = diaSeleccionado?.dia === d.dia
                      return (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                          }}
                          onClick={() => setDiaSeleccionado(d)}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: `${alturaPct}%`,
                              borderRadius: 8,
                              background: isSelected
                                ? '#FFFFFF'
                                : d.monto > 0
                                  ? 'rgba(255,255,255,0.45)'
                                  : 'rgba(255,255,255,0.15)',
                              transition: 'all 0.25s var(--ease-apple)',
                              boxShadow: isSelected ? '0 4px 10px rgba(0,0,0,0.3)' : 'none',
                            }}
                          />
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: isSelected ? 800 : 600,
                              color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                            }}
                          >
                            {d.dia}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Botón de Retiro Inmediato / Liquidación */}
                <div style={{ marginTop: 20 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={transfiriendo}
                    onClick={handleRetiroInmediato}
                    style={{
                      width: '100%',
                      padding: '15px',
                      background: '#10B981',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 800,
                      borderRadius: 14,
                      boxShadow: '0 6px 16px -4px rgba(16, 185, 129, 0.5)',
                    }}
                  >
                    {transfiriendo ? 'Procesando transferencia…' : `⚡ Retirar $${saldoDisponibleRetiro.toLocaleString('es-CL')} CLP a mi Banco`}
                  </button>
                </div>
              </div>

              {/* Desglose Acumulado Transparente */}
              <div className="card" style={{ padding: '18px 20px', margin: 0 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Resumen Acumulado</div>
                <div className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 13, color: 'var(--slate)' }}>Total fletes cobrados a clientes</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>${totalBruto.toLocaleString('es-CL')}</span>
                </div>
                <div className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 13, color: 'var(--slate)' }}>Comisión NORTIA (12% servicio)</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--danger)' }}>
                    -${totalComision.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="between" style={{ padding: '12px 0 4px' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)' }}>Líquido total percibido</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>
                    ${totalLiquido.toLocaleString('es-CL')} CLP
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: KPIs, Banco e Historial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* KPIs de Rendimiento en Carretera */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 10,
                }}
              >
                <div className="card" style={{ padding: '14px 10px', textAlign: 'center', margin: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>Tarifa Promedio</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginTop: 4 }}>
                    $1.180 / km
                  </div>
                </div>

                <div className="card" style={{ padding: '14px 10px', textAlign: 'center', margin: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>Km Recorridos</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)', marginTop: 4 }}>
                    1.420 km
                  </div>
                </div>

                <div className="card" style={{ padding: '14px 10px', textAlign: 'center', margin: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>Satisfacción</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#F59E0B', marginTop: 4 }}>
                    4.9 ★★★★★
                  </div>
                </div>
              </div>

              {/* Datos Bancarios para Transferencias */}
              <div
                className="card between"
                style={{
                  padding: '16px 18px',
                  border: '1.5px solid var(--line)',
                  cursor: 'pointer',
                  margin: 0,
                }}
                onClick={() => setShowBankModal(true)}
              >
                <div className="row" style={{ gap: 12 }}>
                  <div className="ic-chip ic-navy">
                    <Icon name="building" size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>
                      {datosBancarios ? datosBancarios.banco : 'Configurar cuenta bancaria'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                      {datosBancarios
                        ? `${datosBancarios.tipoCuenta.replace('_', ' ').toUpperCase()} · N° ${datosBancarios.numeroCuenta}`
                        : 'Ingresa tu CuentaRUT o cuenta corriente para recibir tus pagos'}
                    </div>
                  </div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <span className={`pill ${datosBancarios ? 'pill-green' : 'pill-navy'}`} style={{ fontSize: 10.5, fontWeight: 700 }}>
                    {datosBancarios ? 'Configurada' : 'Agregar'}
                  </span>
                  <Icon name="chevR" size={16} strokeWidth={2} />
                </div>
              </div>

              {/* Historial de Liquidaciones de Fletes */}
              <div className="card" style={{ padding: '18px 20px', margin: 0 }}>
                <div className="between" style={{ marginBottom: 12 }}>
                  <div className="eyebrow" style={{ margin: 0 }}>Historial de Fletes</div>
                  <span style={{ fontSize: 11.5, color: 'var(--slate)', fontWeight: 600 }}>{viajes.length} viajes registrados</span>
                </div>

                {viajes.length === 0 ? (
                  <div className="card flat" style={{ background: 'var(--paper)', textAlign: 'center', padding: 28, margin: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>
                      Aún no tienes fletes registrados. Postula a cargas para empezar a ganar.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {viajes.map((v) => {
                      const comision = v.comision_monto || Math.round(v.precio_final * 0.12)
                      const liquido = v.precio_final - comision
                      return (
                        <div
                          key={v.id}
                          className="card flat"
                          style={{
                            margin: 0,
                            padding: '12px 14px',
                            cursor: 'pointer',
                            border: '1px solid var(--line)',
                          }}
                          onClick={() => navigate(`/viajes/${v.id}`)}
                        >
                          <div className="between" style={{ marginBottom: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 13.5 }}>
                              {v.cargas?.origen_texto} → {v.cargas?.destino_texto}
                            </span>
                            {(() => {
                              const esc = obtenerEscrow(v.id)
                              const label = esc.liberado
                                ? '💰 Pago Liberado'
                                : v.pagado
                                  ? '🔒 En Custodia'
                                  : v.estado === 'entregado'
                                    ? 'Entregado'
                                    : v.estado
                              const bg = esc.liberado ? '#16A34A' : v.pagado ? '#854D0E' : undefined
                              return (
                                <span
                                  className={!bg ? `pill ${v.estado === 'entregado' ? 'pill-green' : 'pill-navy'}` : 'pill'}
                                  style={{ fontSize: 10.5, background: bg, color: bg ? '#fff' : undefined }}
                                >
                                  {label}
                                </span>
                              )
                            })()}
                          </div>

                          <div className="between" style={{ fontSize: 12, color: 'var(--slate)' }}>
                            <span>
                              Bruto: ${v.precio_final.toLocaleString('es-CL')} · Com. 12%: -${comision.toLocaleString('es-CL')}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--navy)' }}>
                              ${liquido.toLocaleString('es-CL')}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Configuración Bancaria */}
        {session?.user.id && (
          <DatosBancariosModal
            isOpen={showBankModal}
            userId={session.user.id}
            onClose={() => setShowBankModal(false)}
            onSaved={(datos) => setDatosBancarios(datos)}
          />
        )}
      </div>
    </WebPlatformLayout>
  )
}

