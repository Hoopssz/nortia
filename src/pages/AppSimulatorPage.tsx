import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NortiaLogo } from '../components/NortiaLogo'
import { obtenerTemaEfectivo } from '../lib/themeService'

export function AppSimulatorPage() {
  const navigate = useNavigate()
  const [device, setDevice] = useState<'iphone' | 'android'>('iphone')
  const [currentUrl, setCurrentUrl] = useState('/camionero')
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [zoomLevel, setZoomLevel] = useState<'auto' | 0.8 | 0.9 | 1.0>('auto')
  const [scale, setScale] = useState(1)

  useEffect(() => {
    setTheme(obtenerTemaEfectivo())
    const onTheme = (e: Event) => {
      const c = e as CustomEvent<'dark' | 'light'>
      if (c.detail) setTheme(c.detail)
      else setTheme(obtenerTemaEfectivo())
    }
    window.addEventListener('nortia_theme_changed', onTheme)
    return () => window.removeEventListener('nortia_theme_changed', onTheme)
  }, [])

  // Cálculo de escala proporcional que NUNCA distorsiona la relación de aspecto del iPhone
  useEffect(() => {
    function calculateScale() {
      if (typeof zoomLevel === 'number') {
        setScale(zoomLevel)
        return
      }
      // Altura disponible en la ventana restando barra superior (aprox 120px)
      const availableHeight = window.innerHeight - 130
      const phoneHeight = 874 // Altura física del chasis iPhone 15 Pro
      const computedScale = Math.min(1, Math.max(0.65, availableHeight / phoneHeight))
      setScale(computedScale)
    }

    calculateScale()
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [zoomLevel])

  const isDark = theme === 'dark'
  const isIphone = device === 'iphone'

  // Dimensiones físicas exactas de hardware
  // iPhone 15 Pro: Chasis 415 x 874 mm/px | Pantalla interna 393 x 852 px (Apple CAD Specs)
  const chassisWidth = isIphone ? 415 : 412
  const chassisHeight = isIphone ? 874 : 880
  const screenRadius = isIphone ? 46 : 16
  const chassisRadius = isIphone ? 56 : 24

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 15%, #0d1b2e 0%, #070E1B 65%, #030712 100%)',
        color: '#FFFFFF',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 20px 30px',
        overflowX: 'hidden',
      }}
    >
      {/* Barra de Control Superior */}
      <header
        style={{
          width: '100%',
          maxWidth: 1120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <NortiaLogo variant="both" size={32} lightText={true} />
          <div style={{ fontSize: 9.5, color: '#38BDF8', fontWeight: 800, marginLeft: 4 }}>
            SIMULADOR MÓVIL EN VIVO
          </div>
        </div>

        {/* Selector de Dispositivo y Escala */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Dispositivo */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 12,
              padding: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={() => setDevice('iphone')}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: isIphone ? 800 : 600,
                background: isIphone ? '#FFFFFF' : 'transparent',
                color: isIphone ? '#070E1B' : 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                borderRadius: 9,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>📱</span> iPhone 15 Pro
            </button>
            <button
              type="button"
              onClick={() => setDevice('android')}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: !isIphone ? 800 : 600,
                background: !isIphone ? '#FFFFFF' : 'transparent',
                color: !isIphone ? '#070E1B' : 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                borderRadius: 9,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>🤖</span> Android Galaxy
            </button>
          </div>

          {/* Selector de Zoom / Escala */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 10,
              padding: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 11,
            }}
          >
            {[
              { label: 'Auto', val: 'auto' as const },
              { label: '85%', val: 0.85 as const },
              { label: '100%', val: 1.0 as const },
            ].map((z) => (
              <button
                key={z.label}
                type="button"
                onClick={() => setZoomLevel(z.val as any)}
                style={{
                  padding: '4px 8px',
                  fontSize: 10.5,
                  fontWeight: zoomLevel === z.val ? 800 : 600,
                  background: zoomLevel === z.val ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: zoomLevel === z.val ? '#38BDF8' : 'rgba(255, 255, 255, 0.6)',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                }}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Acceso Rápido de Roles y Pruebas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: '🚚 Transportista', url: '/camionero' },
            { label: '🏢 Negocio / Empresa', url: '/negocio' },
            { label: '🛒 Mercado Mayorista', url: '/negocio/mercado' },
            { label: '🗺️ Mapa de Fletes', url: '/camionero/mapa-calor' },
            { label: '💬 Mensajes', url: '/mensajes' },
          ].map((sc) => {
            const active = currentUrl === sc.url
            return (
              <button
                key={sc.url}
                type="button"
                onClick={() => setCurrentUrl(sc.url)}
                style={{
                  padding: '5px 12px',
                  fontSize: 11.5,
                  fontWeight: active ? 800 : 600,
                  background: active ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: active ? '#38BDF8' : 'rgba(255, 255, 255, 0.75)',
                  border: active ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 9,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {sc.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Contenedor con Escala Proporcional fija (Bloquea distorsiones de aspecto) */}
      <div
        style={{
          width: chassisWidth * scale,
          height: chassisHeight * scale,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          position: 'relative',
        }}
      >
        {/* Chasis Físico Realista (Titanio Natural con Botones Laterales) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            width: chassisWidth,
            height: chassisHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            borderRadius: chassisRadius,
            background: isIphone
              ? 'linear-gradient(145deg, #444347 0%, #2c2b2f 30%, #1b1a1c 60%, #38373b 100%)'
              : 'linear-gradient(145deg, #374151 0%, #1f2937 100%)',
            padding: 11, // Borde ultra fino uniforme de titanio
            boxSizing: 'border-box',
            boxShadow: isIphone
              ? '0 0 0 1px rgba(255, 255, 255, 0.18), 0 0 0 2.5px #181719, 0 0 0 4px rgba(255, 255, 255, 0.06), 0 35px 90px -15px rgba(0, 0, 0, 0.95), 0 0 60px rgba(2, 132, 199, 0.22)'
              : '0 0 0 2px #374151, 0 30px 80px rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            userSelect: 'none',
          }}
        >
          {/* Botones Físicos de Hardware en el Contorno (Detallado Real Apple) */}
          {isIphone && (
            <>
              {/* Auricular micro-ranura en el borde superior */}
              <div
                style={{
                  position: 'absolute',
                  top: 5,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 46,
                  height: 3,
                  background: '#0a0a0c',
                  borderRadius: 3,
                  boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
                  zIndex: 200,
                }}
              />

              {/* Botón de Acción (Izquierda) */}
              <div
                style={{
                  position: 'absolute',
                  left: -3.5,
                  top: 110,
                  width: 3.5,
                  height: 26,
                  background: 'linear-gradient(to right, #2c2b2f, #4a494d)',
                  borderRadius: '3px 0 0 3px',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
                }}
              />

              {/* Volumen Arriba (Izquierda) */}
              <div
                style={{
                  position: 'absolute',
                  left: -3.5,
                  top: 154,
                  width: 3.5,
                  height: 48,
                  background: 'linear-gradient(to right, #2c2b2f, #4a494d)',
                  borderRadius: '3px 0 0 3px',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
                }}
              />

              {/* Volumen Abajo (Izquierda) */}
              <div
                style={{
                  position: 'absolute',
                  left: -3.5,
                  top: 214,
                  width: 3.5,
                  height: 48,
                  background: 'linear-gradient(to right, #2c2b2f, #4a494d)',
                  borderRadius: '3px 0 0 3px',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
                }}
              />

              {/* Botón de Encendido / Lateral (Derecha) */}
              <div
                style={{
                  position: 'absolute',
                  right: -3.5,
                  top: 172,
                  width: 3.5,
                  height: 74,
                  background: 'linear-gradient(to left, #2c2b2f, #4a494d)',
                  borderRadius: '0 3px 3px 0',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
                }}
              />

              {/* Bandas de Antena de Titanio sutiles */}
              <div style={{ position: 'absolute', left: -1, top: 78, width: 2, height: 4, background: '#19181b' }} />
              <div style={{ position: 'absolute', right: -1, top: 78, width: 2, height: 4, background: '#19181b' }} />
              <div style={{ position: 'absolute', left: -1, bottom: 78, width: 2, height: 4, background: '#19181b' }} />
              <div style={{ position: 'absolute', right: -1, bottom: 78, width: 2, height: 4, background: '#19181b' }} />
            </>
          )}

          {/* Pantalla Interna de Vidrio OLED (393 x 852 Exacto) */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: screenRadius,
              overflow: 'hidden',
              background: isDark ? '#070E1B' : '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.5)',
            }}
          >
            {/* Barra de Estado Nativa de iOS (52px con Isla Dinámica Real) */}
            <div
              style={{
                height: isIphone ? 52 : 38,
                background: isDark ? '#070E1B' : '#FFFFFF',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isIphone ? '0 28px' : '0 18px',
                zIndex: 100,
                flexShrink: 0,
                userSelect: 'none',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'}`,
                transition: 'background 0.3s ease',
              }}
            >
              {/* Hora en la izquierda (Estilo Apple SF Pro Text) */}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  letterSpacing: -0.3,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}
              >
                9:41
              </span>

              {/* Isla Dinámica de Hardware Real (Apple Authentic Proportions) */}
              {isIphone ? (
                <div
                  style={{
                    width: 124,
                    height: 33,
                    background: '#000000',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 11px',
                    boxShadow: isDark
                      ? '0 0 0 1px rgba(255,255,255,0.1)'
                      : '0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Lente Óptica Cámara TrueDepth con reflejo zafiro */}
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle at 40% 40%, #0a1f33 0%, #03080e 70%, #000 100%)',
                      border: '1px solid #1c1c1e',
                      boxShadow: 'inset 0 0 2px rgba(56, 189, 248, 0.4)',
                    }}
                  />

                  {/* Sensor FaceID y Micrófono */}
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#070b12',
                      border: '1px solid #141416',
                    }}
                  />
                </div>
              ) : (
                /* Cámara perforada Android */
                <div
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    background: '#000000',
                    border: '1.5px solid #222222',
                  }}
                />
              )}

              {/* Íconos Nativos: Señal (4 barras), Wi-Fi y Cápsula de Batería */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                {/* 4 Barras de Señal 5G */}
                <svg width="16" height="11" viewBox="0 0 17 12" fill="currentColor">
                  <rect x="0" y="8" width="3" height="4" rx="0.8" />
                  <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.8" />
                  <rect x="9" y="3" width="3" height="9" rx="0.8" />
                  <rect x="13.5" y="0" width="3" height="12" rx="0.8" />
                </svg>

                {/* Wi-Fi Wave */}
                <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor">
                  <path
                    d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11C9.5 11.83 8.83 12.5 8 12.5C7.17 12.5 6.5 11.83 6.5 11C6.5 10.17 7.17 9.5 8 9.5ZM8 5.5C10.07 5.5 11.96 6.33 13.36 7.74L14.77 6.33C13.02 4.58 10.63 3.5 8 3.5C5.37 3.5 2.98 4.58 1.23 6.33L2.64 7.74C4.04 6.33 5.93 5.5 8 5.5ZM8 1.5C11.18 1.5 14.1 2.77 16.24 4.91L17.65 3.5C15.15 1 11.75 -0.5 8 -0.5C4.25 -0.5 0.85 1 -1.65 3.5L-0.24 4.91C1.9 2.77 4.82 1.5 8 1.5Z"
                    transform="translate(0, -1) scale(0.85)"
                  />
                </svg>

                {/* Cápsula de Batería Apple con terminal */}
                <div
                  style={{
                    width: 23,
                    height: 12,
                    borderRadius: 4,
                    border: `1.5px solid ${isDark ? '#FFFFFF' : '#0F172A'}`,
                    padding: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  <div style={{ width: '85%', height: '100%', background: isDark ? '#FFFFFF' : '#0F172A', borderRadius: 1.5 }} />
                  <div
                    style={{
                      position: 'absolute',
                      right: -3.5,
                      width: 2,
                      height: 5,
                      background: isDark ? '#FFFFFF' : '#0F172A',
                      borderRadius: '0 1.5px 1.5px 0',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Ventana de la App (iFrame 100% despejado y fluido) */}
            <div style={{ flex: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
              <iframe
                key={currentUrl}
                src={currentUrl}
                title="NORTIA Mobile App"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: isDark ? '#070E1B' : '#F8FAFC',
                }}
              />
            </div>

            {/* Barra de Inicio Home Indicator (Gesto de Deslizar iOS) */}
            {isIphone && (
              <div
                style={{
                  height: 20,
                  width: '100%',
                  background: isDark ? '#070E1B' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: 138,
                    height: 5,
                    borderRadius: 100,
                    background: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.32)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: '#64748B', textAlign: 'center' }}>
        ✦ Chasis auténtico iPhone 15 Pro (Titanio, Relación 19.5:9 exacta, Isla Dinámica integrada y Safe Areas)
      </div>
    </div>
  )
}
