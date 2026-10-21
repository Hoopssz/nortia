import { useState } from 'react'
import {
  calcularCostosRuta,
  PRECIO_DIESEL_LITRO,
} from '../lib/tollService'

interface CalculadoraRutaCardProps {
  distanciaKm: number
  tarifaFleteClp: number
  tipoVehiculo?: string
}

export function CalculadoraRutaCard({
  distanciaKm,
  tarifaFleteClp,
  tipoVehiculo = 'camion',
}: CalculadoraRutaCardProps) {
  const [tipo, setTipo] = useState(tipoVehiculo)
  const [showDetalle, setShowDetalle] = useState(false)

  const estimacion = calcularCostosRuta(distanciaKm, tipo, tarifaFleteClp)

  return (
    <div
      className="card"
      style={{
        padding: '16px',
        border: '1.5px solid var(--navy-tint-2)',
        borderRadius: 18,
        background: 'var(--paper)',
        marginBottom: 14,
      }}
    >
      <div className="between" style={{ marginBottom: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <span style={{ fontSize: 20 }}>⛽</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--navy)' }}>
              Costos de Ruta & Ganancia Líquida
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate)' }}>
              Estimador de petróleo y peajes para {distanciaKm} km
            </div>
          </div>
        </div>

        <button
          type="button"
          className="chip"
          style={{ fontSize: 11, padding: '4px 8px', background: '#FFFFFF' }}
          onClick={() => setShowDetalle(!showDetalle)}
        >
          {showDetalle ? 'Ocultar' : 'Ajustar'}
        </button>
      </div>

      {/* Selector de vehículo para simulación */}
      {showDetalle && (
        <div style={{ marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', display: 'block', marginBottom: 6 }}>
            Tipo de Vehículo para cálculo de rendimiento:
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'camioneta', label: 'Camioneta' },
              { key: 'tres_cuartos', label: 'Camión ¾' },
              { key: 'camion', label: 'Camión Simple' },
              { key: 'rampla', label: 'Rampla' },
              { key: 'refrigerado', label: 'Refrigerado' },
            ].map((v) => (
              <button
                key={v.key}
                type="button"
                className="chip"
                style={{
                  fontSize: 11,
                  padding: '4px 8px',
                  background: tipo === v.key ? 'var(--navy)' : '#FFFFFF',
                  color: tipo === v.key ? '#FFFFFF' : 'var(--ink)',
                }}
                onClick={() => setTipo(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Métricas de Costos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid var(--line)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--slate)' }}>⛽ Petróleo Diésel</div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)', marginTop: 2 }}>
            ~{estimacion.litrosDiesel} Litros
          </div>
          <div style={{ fontSize: 10, color: 'var(--slate-light)' }}>
            ${estimacion.costoDieselClp.toLocaleString('es-CL')} (@ ${PRECIO_DIESEL_LITRO}/L)
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid var(--line)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--slate)' }}>🛣️ Peajes Troncales</div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)', marginTop: 2 }}>
            ${estimacion.peajesEstimadosClp.toLocaleString('es-CL')}
          </div>
          <div style={{ fontSize: 10, color: 'var(--slate-light)' }}>
            ~{estimacion.cantidadPeajes} peajes en ruta
          </div>
        </div>
      </div>

      {/* Ganancia Líquida Neta */}
      {tarifaFleteClp > 0 && (
        <div
          style={{
            background: 'var(--green-soft)',
            border: '1.5px solid var(--green)',
            borderRadius: 14,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase' }}>
              💵 Ganancia Líquida en Bolsillo
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--slate)', marginTop: 1 }}>
              Tarifa menos combustible, peajes y comisión (12%)
            </div>
          </div>

          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--green)' }}>
            ${estimacion.gananciaLiquidaClp.toLocaleString('es-CL')}
          </div>
        </div>
      )}
    </div>
  )
}
