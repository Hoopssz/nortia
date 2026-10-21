import { useState, useEffect, useRef } from 'react'
import {
  obtenerMensajesChat,
  enviarMensajeChat,
  enviarMensajeAudio,
  type MensajeChat,
} from '../lib/chatService'
import { AudioVoiceRecorder } from './AudioVoiceRecorder'
import { AudioPlayerBubble } from './AudioPlayerBubble'
import { notifNuevoMensaje } from '../lib/pushService'

interface ChatModalProps {
  isOpen: boolean
  viajeId: string
  miUsuarioId: string
  miNombre: string
  miRol: 'cliente' | 'camionero'
  otraParteNombre: string
  otraParteId?: string        // para notificar al receptor
  onClose: () => void
}

const RESPUESTAS_RAPIDAS = [
  '📍 Llegando al punto de carga',
  '⏳ En ruta / en camino',
  '📦 Carga estibada y asegurada',
  '🏢 Bodega lista para recibir',
  '📞 ¿Me puedes confirmar la dirección exacta?',
]

export function ChatModal({
  isOpen,
  viajeId,
  miUsuarioId,
  miNombre,
  miRol,
  otraParteNombre,
  otraParteId,
  onClose,
}: ChatModalProps) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [texto, setTexto] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  function cargarMensajes() {
    const msgs = obtenerMensajesChat(viajeId)
    setMensajes(msgs)
  }

  useEffect(() => {
    if (!isOpen) return
    cargarMensajes()

    const onUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ conversacionId?: string }>
      if (!custom.detail || custom.detail.conversacionId === viajeId) {
        cargarMensajes()
      }
    }
    window.addEventListener('nortia_chat_updated', onUpdated)
    return () => window.removeEventListener('nortia_chat_updated', onUpdated)
  }, [isOpen, viajeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  if (!isOpen) return null

  function handleEnviar(contenido?: string) {
    const textoAEnviar = (contenido || texto).trim()
    if (!textoAEnviar) return

    const nuevoMsg = enviarMensajeChat(
      viajeId,
      miUsuarioId,
      miNombre,
      miRol,
      textoAEnviar
    )

    // Notificar a la otra parte
    if (otraParteId) {
      notifNuevoMensaje(otraParteId, miNombre, textoAEnviar, `/viajes/${viajeId}`)
    }

    setMensajes((prev) => [...prev, nuevoMsg])
    setTexto('')
  }

  function handleEnviarAudio(audioBase64: string, duracionSegundos: number) {
    const nuevoMsg = enviarMensajeAudio(
      viajeId,
      miUsuarioId,
      miNombre,
      miRol,
      audioBase64,
      duracionSegundos
    )

    // Notificar a la otra parte que recibió un audio
    if (otraParteId) {
      notifNuevoMensaje(otraParteId, miNombre, '🎙️ Nota de voz', `/viajes/${viajeId}`)
    }

    setMensajes((prev) => [...prev, nuevoMsg])
  }

  return (
    <div className="apple-modal-overlay">
      <div
        className="apple-modal-sheet"
        style={{
          height: '82vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        }}
      >
        {/* Header Chat */}
        <div className="between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 12 }}>
          <div className="row" style={{ gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--navy)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {otraParteNombre.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--navy)' }}>
                {otraParteNombre}
              </div>
              <div style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Canal Oficial de Coordinación
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--slate)', cursor: 'pointer', padding: 4 }}
          >
            ✕
          </button>
        </div>

        {/* Historial de Mensajes */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingRight: 4,
            paddingBottom: 8,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--slate)',
              background: 'var(--paper)',
              padding: '6px 12px',
              borderRadius: 12,
              alignSelf: 'center',
              margin: '6px 0',
            }}
          >
            🔒 Los mensajes en este chat quedan registrados para tu seguridad y respaldo del flete.
          </div>

          {mensajes.map((m) => {
            const esMio = m.remitenteId === miUsuarioId
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: esMio ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: esMio ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    background: esMio ? 'var(--navy)' : '#F1F5F9',
                    color: esMio ? '#FFFFFF' : 'var(--ink)',
                    padding: m.tipo === 'audio' ? '8px 12px' : '10px 14px',
                    borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: 13,
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
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
                <span style={{ fontSize: 10, color: 'var(--slate)', marginTop: 2, padding: '0 4px' }}>
                  {m.fechaHora}
                </span>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Respuestas Rápidas */}
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
          {RESPUESTAS_RAPIDAS.map((r, i) => (
            <button
              key={i}
              type="button"
              className="chip"
              style={{ fontSize: 11, padding: '4px 8px', cursor: 'pointer', background: 'var(--paper)', flexShrink: 0 }}
              onClick={() => handleEnviar(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Input de Mensaje y Grabador de Notas de Voz */}
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
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
              placeholder="Escribe un mensaje aquí…"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 14,
                border: '1.5px solid var(--line)',
                fontSize: 13,
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0 16px', borderRadius: 14, background: 'var(--navy)' }}
              disabled={!texto.trim()}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
