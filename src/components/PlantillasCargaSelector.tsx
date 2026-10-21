import { useState, useEffect } from 'react'
import {
  obtenerPlantillas,
  eliminarPlantilla,
  incrementarUsoPlantilla,
  type PlantillaCarga,
} from '../lib/cargaTemplatesService'

interface PlantillasCargaSelectorProps {
  clienteId: string
  onSelectPlantilla: (plantilla: PlantillaCarga) => void
}

export function PlantillasCargaSelector({
  clienteId,
  onSelectPlantilla,
}: PlantillasCargaSelectorProps) {
  const [plantillas, setPlantillas] = useState<PlantillaCarga[]>([])
  const [showModal, setShowModal] = useState(false)

  function cargar() {
    if (!clienteId) return
    const lista = obtenerPlantillas(clienteId)
    setPlantillas(lista)
  }

  useEffect(() => {
    cargar()

    function onUpdated() {
      cargar()
    }
    window.addEventListener('nortia_templates_updated', onUpdated)
    return () => window.removeEventListener('nortia_templates_updated', onUpdated)
  }, [clienteId])

  if (plantillas.length === 0) return null

  function handleUsar(p: PlantillaCarga) {
    incrementarUsoPlantilla(clienteId, p.id)
    onSelectPlantilla(p)
    setShowModal(false)
  }

  function handleEliminar(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    eliminarPlantilla(clienteId, id)
    cargar()
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div className="between" style={{ marginBottom: 6 }}>
        <span className="eyebrow" style={{ margin: 0, color: 'var(--navy)' }}>
          ⚡ Publicación Rápida con Plantillas
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
          Ver todas ({plantillas.length})
        </button>
      </div>

      {/* Chips Rápidos Horizontales */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 4,
          whiteSpace: 'nowrap',
        }}
      >
        {plantillas.slice(0, 3).map((p) => (
          <button
            key={p.id}
            type="button"
            className="chip"
            style={{
              fontSize: 11.5,
              padding: '6px 12px',
              background: 'var(--navy-tint)',
              color: 'var(--navy)',
              border: '1px solid var(--navy-tint-2)',
              fontWeight: 700,
              flexShrink: 0,
            }}
            onClick={() => handleUsar(p)}
          >
            ⚡ {p.nombrePlantilla}
          </button>
        ))}
      </div>

      {/* Modal Completo de Gestión de Plantillas */}
      {showModal && (
        <div className="apple-modal-overlay">
          <div className="apple-modal-sheet" style={{ maxWidth: 460, padding: '22px' }}>
            <div className="between" style={{ marginBottom: 12 }}>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 22 }}>⚡</span>
                <div>
                  <div className="eyebrow" style={{ color: 'var(--navy)', margin: 0 }}>
                    Plantillas Recurrentes
                  </div>
                  <div className="h2" style={{ fontSize: 18, margin: 0 }}>
                    Cargas Frecuentes
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--slate)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px' }}>
              Selecciona una plantilla para rellenar todo el formulario de publicación en 1 solo clic.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
              {plantillas.map((p) => (
                <div
                  key={p.id}
                  className="card selectable"
                  style={{ padding: '14px', margin: 0, border: '1.5px solid var(--navy-tint-2)' }}
                  onClick={() => handleUsar(p)}
                >
                  <div className="between" style={{ marginBottom: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--navy)' }}>
                      {p.nombrePlantilla}
                    </div>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--slate-light)', cursor: 'pointer' }}
                      title="Eliminar plantilla"
                      onClick={(e) => handleEliminar(p.id, e)}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 4 }}>
                    📍 {p.origenTexto} → {p.destinoTexto}
                  </div>

                  <div className="between" style={{ fontSize: 11, color: 'var(--slate)' }}>
                    <span>
                      📦 {p.tipoCarga} · {p.pesoKg.toLocaleString('es-CL')} kg
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
                      Usada {p.usadaVeces || 1} veces · Aplicar →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
