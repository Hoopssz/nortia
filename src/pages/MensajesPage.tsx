import { useState, useEffect, useRef } from 'react'
import { WebPlatformLayout } from '../layouts/WebPlatformLayout'
import { useAuth } from '../contexts/useAuth'
import {
  obtenerConversaciones,
  obtenerMensajesChat,
  enviarMensajeChat,
  enviarMensajeAudio,
  type ConversacionItem,
  type MensajeChat,
} from '../lib/chatService'
import { AudioVoiceRecorder } from '../components/AudioVoiceRecorder'
import { AudioPlayerBubble } from '../components/AudioPlayerBubble'
import { Icon, Star4Point } from '../components/Icon'

export function MensajesPage() {
  const { perfil, session } = useAuth()
  const rol = perfil?.rol || 'camionero'
  const miUsuarioId = session?.user.id || 'usuario_actual'
  const miNombre = perfil?.nombre || perfil?.razon_social || 'Usuario NORTIA'

  const [conversaciones, setConversaciones] = useState<ConversacionItem[]>([])
  const [conversacionActiva, setConversacionActiva] = useState<ConversacionItem | null>(null)
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [texto, setTexto] = useState('')
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  function cargarConversaciones() {
    const list = obtenerConversaciones(rol)
    setConversaciones(list)
    if (!conversacionActiva && list.length > 0) {
      setConversacionActiva(list[0])
    }
  }

  function cargarMensajes(convId: string) {
    const msgs = obtenerMensajesChat(convId)
    setMensajes(msgs)
  }

  useEffect(() => {
    cargarConversaciones()

    const onChatUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ conversacionId?: string }>
      cargarConversaciones()
      if (conversacionActiva && (!custom.detail || custom.detail.conversacionId === conversacionActiva.id)) {
        cargarMensajes(conversacionActiva.id)
      }
    }

    window.addEventListener('nortia_chat_updated', onChatUpdated)
    return () => window.removeEventListener('nortia_chat_updated', onChatUpdated)
  }, [rol])

  useEffect(() => {
    if (conversacionActiva) {
      cargarMensajes(conversacionActiva.id)
    }
  }, [conversacionActiva])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  function handleSelectConversacion(c: ConversacionItem) {
    setConversacionActiva(c)
    setMobileThreadOpen(true)
  }

  function handleEnviar(contenido?: string) {
    if (!conversacionActiva) return
    const textoAEnviar = (contenido || texto).trim()
    if (!textoAEnviar) return

    const nuevoMsg = enviarMensajeChat(
      conversacionActiva.id,
      miUsuarioId,
      miNombre,
      rol as 'cliente' | 'camionero' | 'proveedor' | 'soporte',
      textoAEnviar
    )

    setMensajes((prev) => [...prev, nuevoMsg])
    setTexto('')
  }

  function handleEnviarAudio(audioBase64: string, duracionSegundos: number) {
    if (!conversacionActiva) return

    const nuevoMsg = enviarMensajeAudio(
      conversacionActiva.id,
      miUsuarioId,
      miNombre,
      rol as 'cliente' | 'camionero' | 'proveedor' | 'soporte',
      audioBase64,
      duracionSegundos
    )

    setMensajes((prev) => [...prev, nuevoMsg])
  }

  const respuestasRapidas = rol === 'camionero'
    ? [
        '📍 Llegando al punto de carga',
        '⏳ En ruta hacia destino',
        '📦 Carga asegurada y estibada',
        '🏢 Llegando a portería / recepción',
        '📞 ¿Me confirmas los datos de entrega?',
      ]
    : [
        '🏢 Bodega lista para recibir tu camión',
        '✅ Documentación tributaria y guía lista',
        '⏳ ¿Cuál es tu hora estimada de llegada?',
        '📦 Carga lista en andén para estiba',
        '📞 Contactar a encargado de bodega en destino',
      ]

  return (
    <WebPlatformLayout activeTab="Mensajes">
      <div className="web-platform-container" style={{ paddingBottom: 24 }}>
        {/* Header Superior del Centro de Mensajes */}
        <div className="between" style={{ marginBottom: 12, alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Canal NORTIA</span>
              <Star4Point size={10} color="var(--navy)" />
              <span className="pill pill-green">
                Audios & Textos
              </span>
            </div>
            <div className="h1" style={{ margin: '2px 0 0' }}>
              Mensajes & Notas de Voz
            </div>
          </div>

          <div
            className="hide-on-mobile"
            style={{
              fontSize: 11.5,
              color: 'var(--slate)',
              background: 'var(--card-glass-bg)',
              border: '1px solid var(--card-glass-border)',
              padding: '5px 10px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="shield" size={13} color="#10B981" />
            <span>Respaldado por el sistema de arbitraje Escrow</span>
          </div>
        </div>

        {/* Layout Principal de Mensajes: Split Grid Responsive */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
            gap: 16,
            height: 'calc(82vh - 60px)',
            minHeight: 560,
          }}
          id="mensajes-split-layout"
        >
          {/* Columna Izquierda: Bandeja de Conversaciones */}
          <div
            className={`glow-card ${mobileThreadOpen ? 'mobile-hidden' : ''}`}
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              overflowY: 'auto',
            }}
            id="conversaciones-col"
          >
            <div className="between" style={{ alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>
                Conversaciones Activas
              </div>
              <span className="pill pill-navy" style={{ fontSize: 10.5 }}>
                {conversaciones.length} chats
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {conversaciones.map((conv) => {
                const isActive = conversacionActiva?.id === conv.id
                const iniciales = conv.otraParteNombre.slice(0, 2).toUpperCase()

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversacion(conv)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 11px',
                      borderRadius: 12,
                      background: isActive ? 'var(--navy-tint)' : 'var(--card-glass-bg)',
                      border: isActive ? '1.5px solid var(--navy)' : '1px solid var(--line)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 0 10px -2px var(--navy-tint-2)' : 'none',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: conv.tipo === 'soporte'
                          ? 'linear-gradient(135deg, #265370 0%, #1C3E54 100%)'
                          : 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {conv.tipo === 'soporte' ? '🛡️' : iniciales}
                    </div>

                    {/* Texto de Conversación */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="between" style={{ alignItems: 'center', marginBottom: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.titulo}
                        </span>
                        <span style={{ fontSize: 9.5, color: 'var(--slate)', flexShrink: 0 }}>
                          {new Date(conv.ultimoTimestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                        {conv.subtitulo}
                      </div>

                      <div style={{ fontSize: 11.5, color: isActive ? 'var(--navy)' : 'var(--slate-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400 }}>
                        {conv.ultimoMensaje}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Columna Derecha: Hilo de Chat Activo */}
          {conversacionActiva ? (
            <div
              className={`glow-card ${!mobileThreadOpen ? 'mobile-hidden-thread' : ''}`}
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 480,
                position: 'relative',
              }}
              id="chat-thread-col"
            >
              {/* Header de la Conversación */}
              <div
                className="between"
                style={{
                  borderBottom: '1px solid var(--line)',
                  paddingBottom: 12,
                  marginBottom: 12,
                  alignItems: 'center',
                }}
              >
                <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                  {/* Botón Volver (solo visible en pantallas móviles) */}
                  <button
                    type="button"
                    className="chip mobile-only-btn"
                    onClick={() => setMobileThreadOpen(false)}
                    style={{ padding: '6px 10px', fontSize: 12 }}
                  >
                    ← Chats
                  </button>

                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {conversacionActiva.otraParteNombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--navy)' }}>
                      {conversacionActiva.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                      <span>{conversacionActiva.subtitulo} · Canal Protegido</span>
                    </div>
                  </div>
                </div>

                <div className="row" style={{ gap: 6 }}>
                  <span className="pill pill-glow" style={{ fontSize: 10.5, fontWeight: 700 }}>
                    🔒 NORTIA Escrow
                  </span>
                </div>
              </div>

              {/* Mensajes del Chat */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  paddingRight: 6,
                  paddingBottom: 8,
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    color: 'var(--slate)',
                    background: 'var(--paper)',
                    padding: '8px 14px',
                    borderRadius: 14,
                    alignSelf: 'center',
                    margin: '4px 0 10px',
                    maxWidth: '85%',
                    lineHeight: 1.4,
                  }}
                >
                  🔒 <b>Canal Oficial NORTIA:</b> Las notas de voz y textos intercambiados aquí quedan registrados para auditoría, seguro de carga y respaldo del pago en custodia Escrow.
                </div>

                {mensajes.map((m) => {
                  const esMio = m.remitenteId === miUsuarioId
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: esMio ? 'flex-end' : 'flex-start',
                        maxWidth: '78%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: esMio ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          background: esMio ? 'var(--navy)' : 'var(--card-glass-bg)',
                          color: esMio ? '#FFFFFF' : 'var(--ink)',
                          border: esMio ? 'none' : '1px solid var(--line)',
                          padding: m.tipo === 'audio' ? '8px 12px' : '11px 16px',
                          borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          fontSize: 13.5,
                          lineHeight: 1.45,
                          wordBreak: 'break-word',
                          boxShadow: esMio
                            ? '0 2px 10px -2px rgba(10, 25, 47, 0.4)'
                            : '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        {m.tipo === 'audio' && m.audioUrl ? (
                          <AudioPlayerBubble
                            audioUrl={m.audioUrl}
                            duracionSegundos={m.duracionSegundos}
                            esMio={esMio}
                          />
                        ) : (
                          m.texto
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3, padding: '0 4px' }}>
                        {m.remitenteNombre} · {m.fechaHora}
                      </span>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Respuestas Rápidas 1-Tap */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  padding: '8px 0',
                  borderTop: '1px solid var(--line)',
                  whiteSpace: 'nowrap',
                }}
              >
                {respuestasRapidas.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    className="chip"
                    style={{ fontSize: 11, padding: '5px 9px', cursor: 'pointer', background: 'var(--paper)', flexShrink: 0 }}
                    onClick={() => handleEnviar(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Barra de Entrada de Audio y Texto */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <AudioVoiceRecorder onAudioRecorded={handleEnviarAudio} />

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleEnviar()
                  }}
                  style={{ display: 'flex', gap: 8, flex: 1 }}
                >
                  <input
                    type="text"
                    placeholder="Escribe un mensaje o graba una nota de voz…"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: '1.5px solid var(--line)',
                      fontSize: 13,
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '0 20px', borderRadius: 14, background: 'var(--navy)' }}
                    disabled={!texto.trim()}
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div
              className="glow-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--slate)',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <Icon name="message" size={32} strokeWidth={1.5} color="var(--slate-light)" />
              <span>Selecciona una conversación de la izquierda para comenzar</span>
            </div>
          )}
        </div>
      </div>
    </WebPlatformLayout>
  )
}
