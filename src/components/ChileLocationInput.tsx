import { useState, useEffect, useRef } from 'react'
import { Icon } from './Icon'
import {
  type ChileLocation,
  buscarComunasLocales,
  geocodificarDireccionChile,
} from '../lib/chileLocations'

interface ChileLocationInputProps {
  label: string
  placeholder?: string
  value: string
  selectedRegion?: number | null
  onChange: (data: {
    texto: string
    regionCodigo: number | null
    lat?: number | null
    lng?: number | null
  }) => void
  required?: boolean
  presetComunas?: string[]
}

const PRESETS_DEFAULT = ['Santiago', 'Valparaíso', 'Concepción', 'Chillán', 'Puerto Montt', 'Antofagasta']

export function ChileLocationInput({
  label,
  placeholder = 'Comuna, calle o sector en cualquier región de Chile',
  value,
  selectedRegion,
  onChange,
  required = false,
  presetComunas = PRESETS_DEFAULT,
}: ChileLocationInputProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<ChileLocation[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar sugerencias con debounce
  useEffect(() => {
    if (!isOpen) return
    let active = true

    if (query.trim().length === 0) {
      setSuggestions(buscarComunasLocales('', 6))
      setLoading(false)
      return
    }

    setLoading(true)
    const timeoutId = setTimeout(async () => {
      const results = await geocodificarDireccionChile(query)
      if (active) {
        setSuggestions(results)
        setLoading(false)
      }
    }, 280)

    return () => {
      active = false
      clearTimeout(timeoutId)
    }
  }, [query, isOpen])

  function handleSelect(loc: ChileLocation) {
    const formatted = loc.tipo === 'calle' ? loc.nombre : `${loc.nombre}, ${loc.regionNombre}`
    setQuery(formatted)
    onChange({
      texto: formatted,
      regionCodigo: loc.regionCodigo,
      lat: loc.lat,
      lng: loc.lng,
    })
    setIsOpen(false)
  }

  function handlePresetClick(comunaName: string) {
    const match = buscarComunasLocales(comunaName, 1)[0]
    if (match) {
      handleSelect(match)
    } else {
      setQuery(comunaName)
      onChange({ texto: comunaName, regionCodigo: selectedRegion ?? null })
    }
  }

  return (
    <div className="field" ref={containerRef} style={{ position: 'relative' }}>
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </span>
        {selectedRegion && (
          <span style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 700 }}>
            Región detectada ({selectedRegion})
          </span>
        )}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onFocus={() => {
            setIsOpen(true)
            if (!query) setSuggestions(buscarComunasLocales('', 6))
          }}
          onChange={(e) => {
            const val = e.target.value
            setQuery(val)
            onChange({ texto: val, regionCodigo: selectedRegion ?? null })
            setIsOpen(true)
          }}
          placeholder={placeholder}
          style={{ paddingRight: 40 }}
        />
        <span
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--navy)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon name="pin" size={18} strokeWidth={1.8} />
        </span>
      </div>

      {/* Chips de acceso rápido para comunas clave */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
        {presetComunas.map((c) => (
          <span
            key={c}
            className="chip"
            style={{
              fontSize: 11,
              padding: '3px 9px',
              cursor: 'pointer',
              background: query.includes(c) ? 'var(--navy-tint)' : undefined,
              borderColor: query.includes(c) ? 'var(--navy)' : undefined,
            }}
            onClick={() => handlePresetClick(c)}
          >
            📍 {c}
          </span>
        ))}
      </div>

      {/* Dropdown de Autocompletado */}
      {isOpen && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: 4,
            maxHeight: 260,
            overflowY: 'auto',
            padding: 6,
            boxShadow: 'var(--shadow-lift)',
            border: '1.5px solid var(--line)',
            background: '#FFFFFF',
          }}
        >
          {loading && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--slate)' }}>
              Buscando direcciones en Chile…
            </div>
          )}

          {!loading && suggestions.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--slate)' }}>
              No se encontraron coincidencias directas. Puedes escribir la dirección manualmente.
            </div>
          )}

          {!loading &&
            suggestions.map((loc, idx) => (
              <div
                key={`${loc.lat}-${loc.lng}-${idx}`}
                className="row"
                style={{
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  borderBottom: idx < suggestions.length - 1 ? '1px solid var(--line)' : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => handleSelect(loc)}
              >
                <span style={{ color: 'var(--navy)', flexShrink: 0 }}>
                  <Icon name={loc.tipo === 'logistica' ? 'package' : 'pin'} size={16} strokeWidth={1.8} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {loc.nombre}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 1 }}>
                    {loc.comuna} · {loc.regionNombre}
                  </div>
                </div>
                <span className="pill pill-navy" style={{ fontSize: 10, padding: '2px 6px', flexShrink: 0 }}>
                  {loc.regionCodigo === 16 ? 'Ñuble' : `R${loc.regionCodigo}`}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
