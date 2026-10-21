import { useState, useRef, useEffect } from 'react'
import { Icon } from './Icon'

interface AudioPlayerBubbleProps {
  audioUrl: string
  duracionSegundos?: number
  esMio?: boolean
}

export function AudioPlayerBubble({
  audioUrl,
  duracionSegundos = 0,
  esMio = false,
}: AudioPlayerBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(duracionSegundos)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoaded = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration))
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch((err) => {
        console.warn('Error reproduciendo audio:', err)
      })
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = newProgress * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 2px',
        minWidth: 210,
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Botón Play / Pause */}
      <button
        type="button"
        onClick={togglePlay}
        title={isPlaying ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          backgroundColor: esMio ? '#FFFFFF' : 'var(--navy)',
          color: esMio ? 'var(--navy)' : '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.15s ease',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Icon name={isPlaying ? 'pause' : 'play'} size={18} strokeWidth={2.5} />
      </button>

      {/* Barra de Progreso y Ondas de Audio */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          onClick={handleSeek}
          style={{
            height: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            position: 'relative',
          }}
          title="Saltar a este punto del audio"
        >
          {/* Visualizador de Barras de Onda */}
          {[6, 12, 18, 10, 14, 20, 15, 8, 14, 18, 12, 16, 10, 14, 8].map((h, i) => {
            const barProgress = (i / 15) * 100
            const active = progress >= barProgress
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}px`,
                  borderRadius: 2,
                  backgroundColor: esMio
                    ? active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)'
                    : active ? 'var(--navy)' : 'rgba(10, 25, 47, 0.2)',
                  transition: 'background-color 0.1s ease',
                }}
              />
            )
          })}
        </div>

        {/* Tiempo Transcurrido / Duración Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10.5,
            fontWeight: 700,
            color: esMio ? 'rgba(255, 255, 255, 0.85)' : 'var(--slate)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
