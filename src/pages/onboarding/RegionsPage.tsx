import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { ChileMap } from '../../components/ChileMap'
import { regionNames, regionOrder, NUBLE_CODE } from '../../lib/chileRegions'
import { useOnboarding } from '../../features/onboarding/useOnboarding'

export function RegionsPage() {
  const navigate = useNavigate()
  const { state, update } = useOnboarding()
  const [selected, setSelected] = useState<Set<number>>(new Set(state.regiones.length ? state.regiones : [NUBLE_CODE]))

  useEffect(() => {
    if (!state.rol) navigate('/onboarding/rol', { replace: true })
  }, [state.rol, navigate])

  function toggle(codigo: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(codigo)) {
        next.delete(codigo)
      } else {
        next.add(codigo)
      }
      return next
    })
  }

  function handleContinue() {
    update({ regiones: [...selected] })
    navigate(state.rol === 'camionero' ? '/onboarding/camion' : '/onboarding/perfil')
  }

  return (
    <div className="px" style={{ paddingTop: 16, paddingBottom: 24, maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="steps">
        <span className="on" />
        <span className="on" />
        <span />
      </div>
      <div className="eyebrow">Paso 2 de 3 · Zona</div>
      <div className="h2">¿Dónde quieres operar?</div>
      <div className="sub" style={{ marginBottom: 6 }}>
        Toca una o más regiones en el mapa. Se pintan en azul y se sincronizan con la lista.
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 100, flexShrink: 0 }}>
          <ChileMap selected={selected} onToggle={toggle} height={420} />
        </div>
        <div style={{ flex: 1, maxHeight: 420, overflowY: 'auto', paddingRight: 2, minWidth: 0 }}>
          {regionOrder.map((codigo) => {
            const on = selected.has(codigo)
            return (
              <div
                key={codigo}
                className="between"
                style={{ padding: '9px 4px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                onClick={() => toggle(codigo)}
              >
                <div className="row" style={{ gap: 9 }}>
                  <div className={`check-sq ${on ? 'on' : ''}`} style={{ width: 20, height: 20 }}>
                    {on && <Icon name="check" size={12} strokeWidth={2.6} />}
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: on ? 700 : 500, color: on ? 'var(--navy)' : 'var(--ink)' }}>
                    {regionNames[codigo]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={selected.size === 0} onClick={handleContinue}>
        Continuar
        <span className="pill" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
          {selected.size}
        </span>
      </button>
    </div>
  )
}
