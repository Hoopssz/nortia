import { useState, useRef, useEffect } from 'react'
import { Icon } from './Icon'

interface AudioVoiceRecorderProps {
  onAudioRecorded: (audioBase64: string, duracionSegundos: number) => void
  disabled?: boolean
}

export function AudioVoiceRecorder({ onAudioRecorded, disabled }: AudioVoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const secondsRef = useRef(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function startRecording() {
    if (disabled) return
    setErrorMsg(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Tu navegador o dispositivo no soporta grabación de voz.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      let mimeType = ''
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        const totalDuration = secondsRef.current

        if (totalDuration >= 1 && chunksRef.current.length > 0) {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64data = reader.result as string
            onAudioRecorded(base64data, totalDuration)
          }
          reader.readAsDataURL(audioBlob)
        }

        // Limpiar pistas del micrófono
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      recorder.start(200)
      setRecording(true)
      setSeconds(0)
      secondsRef.current = 0

      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1
          secondsRef.current = next
          return next
        })
      }, 1000)
    } catch (err) {
      console.warn('Error accediendo al micrófono:', err)
      setErrorMsg('No se pudo acceder al micrófono. Por favor verifica los permisos en tu navegador.')
      setRecording(false)
    }
  }

  function stopAndSend() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }

  function cancelRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      // Limpiar chunks para que onstop no envíe nada
      chunksRef.current = []
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setRecording(false)
    setSeconds(0)
    secondsRef.current = 0
  }

  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toString().padStart(2, '0')

  if (recording) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: 14,
          padding: '8px 14px',
          width: '100%',
          animation: 'appleFadeIn 0.2s ease',
        }}
      >
        {/* Indicador de Grabación Pulsante */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              boxShadow: '0 0 10px #EF4444',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', fontVariantNumeric: 'tabular-nums' }}>
            {mins}:{secs}
          </span>
        </div>

        {/* Onda de Audio Simulada */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, height: 16 }}>
          {[4, 12, 8, 16, 10, 14, 6, 12, 8].map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: `${h}px`,
                backgroundColor: '#EF4444',
                borderRadius: 2,
                opacity: (i + seconds) % 2 === 0 ? 0.9 : 0.4,
                transition: 'all 0.2s ease',
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: '#B91C1C', marginLeft: 4 }}>
            Grabando nota de voz…
          </span>
        </div>

        {/* Botón Descartar */}
        <button
          type="button"
          onClick={cancelRecording}
          title="Descartar audio"
          style={{
            background: 'none',
            border: 'none',
            color: '#DC2626',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="trash" size={17} strokeWidth={2} />
        </button>

        {/* Botón Enviar Audio */}
        <button
          type="button"
          onClick={stopAndSend}
          title="Enviar nota de voz"
          style={{
            background: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Enviar</span>
          <Icon name="arrowR" size={14} strokeWidth={2.5} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {errorMsg && (
        <span style={{ fontSize: 11, color: '#DC2626', marginRight: 8 }}>
          {errorMsg}
        </span>
      )}
      <button
        type="button"
        onClick={startRecording}
        disabled={disabled}
        title="Grabar nota de voz"
        style={{
          background: 'var(--paper)',
          border: '1.5px solid var(--line)',
          color: 'var(--ink)',
          borderRadius: 12,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--navy)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
      >
        <Icon name="mic" size={18} strokeWidth={2} color="var(--navy)" />
      </button>
    </div>
  )
}
