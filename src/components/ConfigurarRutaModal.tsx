import { useState } from 'react'
import { regionNames, regionOrder } from '../lib/chileRegions'
import { guardarRutaFavorita, type RutaFavorita } from '../lib/savedLanesService'

interface ConfigurarRutaModalProps {
  isOpen: boolean
  camioneroId: string
  onClose: () => void
  onSaved: (ruta: RutaFavorita) => void
}

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function ConfigurarRutaModal({
  isOpen,
  camioneroId,
  onClose,
  onSaved,
}: ConfigurarRutaModalProps) {
  const [nombre, setNombre] = useState('')
  const [origenRegion, setOrigenRegion] = useState<number>(13) // RM
  const [destinoRegion, setDestinoRegion] = useState<number>(8) // Biobío
  const [tarifaMinima, setTarifaMinima] = useState('')
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(['Lun', 'Mié', 'Vie'])
  const [alertas, setAlertas] = useState(true)

  if (!isOpen) return null

  function toggleDia(d: string) {
    if (diasSeleccionados.includes(d)) {
      setDiasSeleccionados(diasSeleccionados.filter((x) => x !== d))
    } else {
      setDiasSeleccionados([...diasSeleccionados, d])
    }
  }

  function handleGuardar() {
    const nombreFinal =
      nombre.trim() || `${regionNames[origenRegion]} ↔ ${regionNames[destinoRegion]}`

    const nueva = guardarRutaFavorita(camioneroId, {
      nombre: nombreFinal,
      origenRegion,
      destinoRegion,
      diasSemana: diasSeleccionados,
      tarifaMinimaClp: Number(tarifaMinima) || 0,
      alertasActivas: alertas,
    })

    onSaved(nueva)
    onClose()
  }

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-sheet" style={{ maxWidth: 440, padding: '22px' }}>
        <div className="between" style={{ marginBottom: 14 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
              Corredores NORTIA
            </div>
            <div className="h2" style={{ fontSize: 18, margin: 0 }}>
              Guardar Ruta Favorita
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

        <div style={{ fontSize: 12.5, color: 'var(--slate)', marginBottom: 16 }}>
          Configura tus tramos habituales para recibir alertas prioritarias cuando salgan cargas en tu recorrido.
        </div>

        {/* Nombre de la Ruta */}
        <div className="field">
          <label>Nombre del Corredor (Opcional)</label>
          <input
            placeholder="Ej. Ruta Frutera Curicó - Santiago"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* Origen y Destino */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Región Origen</label>
            <select value={origenRegion} onChange={(e) => setOrigenRegion(Number(e.target.value))}>
              {regionOrder.map((r) => (
                <option key={r} value={r}>
                  {regionNames[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label>Región Destino</label>
            <select value={destinoRegion} onChange={(e) => setDestinoRegion(Number(e.target.value))}>
              {regionOrder.map((r) => (
                <option key={r} value={r}>
                  {regionNames[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Días Habituales */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--slate)', display: 'block', marginBottom: 6 }}>
            Días que frecuentas esta ruta:
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DIAS.map((d) => {
              const on = diasSeleccionados.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  className={`chip ${on ? 'on' : ''}`}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11.5,
                    background: on ? 'var(--navy)' : '#FFFFFF',
                    color: on ? '#FFFFFF' : 'var(--ink)',
                  }}
                  onClick={() => toggleDia(d)}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tarifa Mínima Opcional */}
        <div className="field">
          <label>Tarifa mínima requerida ($ CLP, opcional)</label>
          <input
            type="number"
            placeholder="Ej. 300000"
            value={tarifaMinima}
            onChange={(e) => setTarifaMinima(e.target.value)}
          />
        </div>

        {/* Toggle Alertas Prioritarias */}
        <div className="card flat" style={{ background: 'var(--paper)', padding: '12px 14px', borderRadius: 14, marginBottom: 18 }}>
          <div className="between">
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>🔔 Alertas Prioritarias</div>
              <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                Avisarme de inmediato cuando se publique carga en este tramo
              </div>
            </div>
            <div className={`toggle ${alertas ? 'on' : ''}`} onClick={() => setAlertas(!alertas)}>
              <div className="knob" />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', borderRadius: 14 }}
          onClick={handleGuardar}
        >
          🎯 Guardar Corredor Favorito
        </button>
      </div>
    </div>
  )
}
