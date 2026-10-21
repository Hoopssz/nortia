import { useState, useEffect } from 'react'
import {
  obtenerEstadoTacografo,
  actualizarEstadoTacografo,
  MAX_CONDUCCION_SEGUNDOS,
  type EstadoTacografo,
} from '../lib/tacografoService'

interface TacografoDigitalModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TacografoDigitalModal({
  isOpen,
  onClose,
}: TacografoDigitalModalProps) {
  const [tacografo, setTacografo] = useState<EstadoTacografo>(obtenerEstadoTacografo())

  function cargar() {
    setTacografo(obtenerEstadoTacografo())
  }

  useEffect(() => {
    if (!isOpen) return
    cargar()

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_tacografo_updated', onUpdated)
    return () => window.removeEventListener('nortia_tacografo_updated', onUpdated)
  }, [isOpen])

  if (!isOpen) return null

  const horas = Math.floor(tacografo.segundosConduccion / 3600)
  const minutos = Math.floor((tacografo.segundosConduccion % 3600) / 60)
  const pctConduccion = Math.min(100, Math.round((tacografo.segundosConduccion / MAX_CONDUCCION_SEGUNDOS) * 100))

  const esAlerta = tacografo.segundosConduccion >= 4.5 * 3600
  const esExcedido = tacografo.segundosConduccion >= MAX_CONDUCCION_SEGUNDOS

  function cambiarEstado(nuevoEstado: EstadoTacografo['estado']) {
    const act: EstadoTacografo = {
      ...tacografo,
      estado: nuevoEstado,
      iniciadoEn: new Date().toISOString(),
    }
    actualizarEstadoTacografo(act)
    setTacografo(act)
  }

  function reiniciarJornada() {
    const act: EstadoTacografo = {
      estado: 'detenido',
      segundosConduccion: 0,
      segundosDescanso: 0,
      iniciadoEn: null,
    }
    actualizarEstadoTacografo(act)
    setTacografo(act)
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 460, padding: '22px' }}>
        {/* Header */}
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 24 }}>⏱️</span>
            <div>
              <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
                Seguridad Vial & Descanso
              </div>
              <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                Tacógrafo Digital de Cabina
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px' }}>
          Control de tiempo continuo al volante para prevenir fatiga y cumplir con el <b>Art. 25 bis del Código del Trabajo</b>.
        </p>

        {/* Panel de Tacógrafo Principal */}
        <div
          className="card flat"
          style={{
            background: esExcedido ? '#FEF2F2' : esAlerta ? '#FFFBEB' : 'var(--navy-tint)',
            border: `1.5px solid ${esExcedido ? '#F87171' : esAlerta ? '#FCD34D' : 'var(--navy-tint-2)'}`,
            padding: '18px 20px',
            borderRadius: 20,
            textAlign: 'center',
            marginBottom: 14,
          }}
        >
          <div className="between" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)' }}>
              TIEMPO CONTINUO AL VOLANTE
            </span>
            <span
              className={`pill ${esExcedido ? 'pill-red' : esAlerta ? 'pill-navy' : 'pill-green'}`}
              style={{ fontSize: 10.5, fontWeight: 800 }}
            >
              {esExcedido ? '🔴 Límite Legal Excedido' : esAlerta ? '🟡 Parada Próxima Requerida' : '🟢 Conducción Normal'}
            </span>
          </div>

          <div style={{ fontSize: 36, fontWeight: 900, color: esExcedido ? '#DC2626' : 'var(--navy)', margin: '6px 0' }}>
            {horas}h {minutos < 10 ? `0${minutos}` : minutos}m
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate)', marginLeft: 6 }}>
              / 5h 00m máx
            </span>
          </div>

          {/* Barra de Progreso */}
          <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 10, height: 10, overflow: 'hidden', margin: '12px 0 6px' }}>
            <div
              style={{
                width: `${pctConduccion}%`,
                height: '100%',
                background: esExcedido ? '#DC2626' : esAlerta ? '#F59E0B' : '#10B981',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <div className="between" style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>
            <span>0 horas</span>
            <span>{pctConduccion}% del límite continuo</span>
            <span>5 horas máx</span>
          </div>
        </div>

        {/* Botones de Control de Conducción / Descanso */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              padding: '12px',
              fontSize: 12,
              borderRadius: 12,
              background: tacografo.estado === 'conduciendo' ? '#10B981' : 'var(--navy)',
            }}
            onClick={() => cambiarEstado('conduciendo')}
          >
            {tacografo.estado === 'conduciendo' ? '🟢 Conduciendo…' : '▶️ Iniciar Conducción'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '12px',
              fontSize: 12,
              borderRadius: 12,
              background: tacografo.estado === 'descansando' ? '#FEF3C7' : '#FFFFFF',
              color: tacografo.estado === 'descansando' ? '#D97706' : 'var(--ink)',
              fontWeight: 700,
            }}
            onClick={() => cambiarEstado('descansando')}
          >
            {tacografo.estado === 'descansando' ? '☕ Descansando…' : '☕ Pausar / Descanso 2h'}
          </button>
        </div>

        <button
          type="button"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            fontSize: 11.5,
            color: 'var(--slate)',
            cursor: 'pointer',
            padding: '6px',
            marginBottom: 12,
          }}
          onClick={reiniciarJornada}
        >
          🔄 Reiniciar contador de jornada
        </button>

        {/* Nota Legal Art. 25 bis */}
        <div
          className="card flat"
          style={{
            background: 'var(--paper)',
            padding: '10px 12px',
            borderRadius: 12,
            fontSize: 11,
            color: 'var(--slate)',
            lineHeight: 1.4,
          }}
        >
          ⚖️ <b>Normativa Legal Chilena:</b> En ningún caso el chofer de carga interurbana puede manejar más de 5 horas continuas, tras las cuales debe tener un descanso mínimo e ininterrumpido de 2 horas.
        </div>
      </div>
    </div>
  )
}
