import { useState, useEffect } from 'react'
import {
  obtenerRutasFavoritas,
  type RutaFavorita,
} from '../lib/savedLanesService'
import { ConfigurarRutaModal } from './ConfigurarRutaModal'

interface RutasFavoritasBarProps {
  camioneroId: string
  rutaActivaId: string | null
  onSelectRuta: (ruta: RutaFavorita | null) => void
}

export function RutasFavoritasBar({
  camioneroId,
  rutaActivaId,
  onSelectRuta,
}: RutasFavoritasBarProps) {
  const [rutas, setRutas] = useState<RutaFavorita[]>([])
  const [showModal, setShowModal] = useState(false)

  function cargar() {
    if (!camioneroId) return
    const lista = obtenerRutasFavoritas(camioneroId)
    setRutas(lista)
  }

  useEffect(() => {
    cargar()

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_lanes_updated', onUpdated)
    return () => window.removeEventListener('nortia_lanes_updated', onUpdated)
  }, [camioneroId])

  return (
    <div style={{ marginBottom: 14 }}>
      <div className="between" style={{ marginBottom: 6 }}>
        <span className="eyebrow" style={{ margin: 0 }}>
          Mis Corredores Favoritos
        </span>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--navy)',
            fontSize: 11.5,
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onClick={() => setShowModal(true)}
        >
          + Agregar Corredor
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 4,
          whiteSpace: 'nowrap',
        }}
      >
        {/* Botón Todas las Cargas */}
        <button
          type="button"
          className="chip"
          style={{
            fontSize: 11.5,
            padding: '6px 12px',
            background: rutaActivaId === null ? 'var(--navy)' : '#FFFFFF',
            color: rutaActivaId === null ? '#FFFFFF' : 'var(--ink)',
            flexShrink: 0,
          }}
          onClick={() => onSelectRuta(null)}
        >
          🇨🇱 Todas las Cargas
        </button>

        {/* Chips de Rutas Favoritas */}
        {rutas.map((r) => {
          const isSelected = rutaActivaId === r.id
          return (
            <button
              key={r.id}
              type="button"
              className="chip"
              style={{
                fontSize: 11.5,
                padding: '6px 12px',
                background: isSelected ? 'var(--navy)' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : 'var(--ink)',
                border: isSelected ? '1.5px solid var(--navy)' : '1px solid var(--line)',
                flexShrink: 0,
              }}
              onClick={() => onSelectRuta(isSelected ? null : r)}
            >
              🎯 {r.nombre}
            </button>
          )
        })}
      </div>

      {/* Modal para configurar nuevo corredor */}
      {showModal && (
        <ConfigurarRutaModal
          isOpen={showModal}
          camioneroId={camioneroId}
          onClose={() => setShowModal(false)}
          onSaved={() => cargar()}
        />
      )}
    </div>
  )
}
