/**
 * Servicio de Chat, Mensajería y Notas de Voz en NORTIA
 * Soporta textos, audios nativos grabados desde el dispositivo y registro de conversaciones.
 */

export interface MensajeChat {
  id: string
  viajeId: string
  conversacionId?: string
  remitenteId: string
  remitenteNombre: string
  remitenteRol: 'cliente' | 'camionero' | 'proveedor' | 'soporte'
  tipo?: 'texto' | 'audio'
  texto: string
  audioUrl?: string
  duracionSegundos?: number
  fechaHora: string
  timestamp: number
  leido?: boolean
}

export interface ConversacionItem {
  id: string
  titulo: string
  subtitulo: string
  tipo: 'flete' | 'directo' | 'soporte'
  otraParteId: string
  otraParteNombre: string
  otraParteRol: 'cliente' | 'camionero' | 'proveedor' | 'soporte'
  ultimoMensaje: string
  ultimoTimestamp: number
  unreadCount: number
}

const STORAGE_KEY_CHAT = 'nortia_chat_viaje_'
const STORAGE_KEY_CONVS = 'nortia_conversaciones_index'

export function obtenerMensajesChat(conversacionId: string): MensajeChat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT + conversacionId)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function enviarMensajeChat(
  conversacionId: string,
  remitenteId: string,
  remitenteNombre: string,
  remitenteRol: 'cliente' | 'camionero' | 'proveedor' | 'soporte',
  texto: string
): MensajeChat {
  const mensajes = obtenerMensajesChat(conversacionId)
  const ahora = new Date()
  const nuevoMensaje: MensajeChat = {
    id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    viajeId: conversacionId,
    conversacionId,
    remitenteId,
    remitenteNombre,
    remitenteRol,
    tipo: 'texto',
    texto: texto.trim(),
    fechaHora: ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    timestamp: ahora.getTime(),
    leido: true,
  }

  const actualizados = [...mensajes, nuevoMensaje]
  try {
    localStorage.setItem(STORAGE_KEY_CHAT + conversacionId, JSON.stringify(actualizados))
    actualizarIndiceConversacion(conversacionId, texto.trim(), ahora.getTime())
    window.dispatchEvent(new CustomEvent('nortia_chat_updated', { detail: { conversacionId } }))
  } catch (err) {
    console.error('Error guardando mensaje:', err)
  }

  return nuevoMensaje
}

export function enviarMensajeAudio(
  conversacionId: string,
  remitenteId: string,
  remitenteNombre: string,
  remitenteRol: 'cliente' | 'camionero' | 'proveedor' | 'soporte',
  audioBase64: string,
  duracionSegundos: number
): MensajeChat {
  const mensajes = obtenerMensajesChat(conversacionId)
  const ahora = new Date()
  const minutos = Math.floor(duracionSegundos / 60)
  const segundos = Math.floor(duracionSegundos % 60).toString().padStart(2, '0')
  const duracionTexto = `${minutos}:${segundos}`

  const nuevoMensaje: MensajeChat = {
    id: `AUDIO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    viajeId: conversacionId,
    conversacionId,
    remitenteId,
    remitenteNombre,
    remitenteRol,
    tipo: 'audio',
    texto: `🎤 Nota de voz (${duracionTexto})`,
    audioUrl: audioBase64,
    duracionSegundos: Math.max(1, Math.round(duracionSegundos)),
    fechaHora: ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    timestamp: ahora.getTime(),
    leido: true,
  }

  const actualizados = [...mensajes, nuevoMensaje]
  try {
    localStorage.setItem(STORAGE_KEY_CHAT + conversacionId, JSON.stringify(actualizados))
    actualizarIndiceConversacion(conversacionId, `🎤 Nota de voz (${duracionTexto})`, ahora.getTime())
    window.dispatchEvent(new CustomEvent('nortia_chat_updated', { detail: { conversacionId } }))
  } catch (err) {
    console.error('Error guardando nota de voz:', err)
  }

  return nuevoMensaje
}

function actualizarIndiceConversacion(conversacionId: string, ultimoMensaje: string, timestamp: number) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVS)
    const lista: ConversacionItem[] = raw ? JSON.parse(raw) : []
    const idx = lista.findIndex((c) => c.id === conversacionId)
    if (idx >= 0) {
      lista[idx].ultimoMensaje = ultimoMensaje
      lista[idx].ultimoTimestamp = timestamp
      localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(lista))
    }
  } catch (err) {
    console.error('Error actualizando índice:', err)
  }
}

export function registrarConversacion(item: ConversacionItem) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVS)
    const lista: ConversacionItem[] = raw ? JSON.parse(raw) : []
    const idx = lista.findIndex((c) => c.id === item.id)
    if (idx >= 0) {
      lista[idx] = { ...lista[idx], ...item }
    } else {
      lista.unshift(item)
    }
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(lista))
  } catch (err) {
    console.error('Error registrando conversación:', err)
  }
}

export function obtenerConversaciones(miRol: string): ConversacionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVS)
    let lista: ConversacionItem[] = raw ? JSON.parse(raw) : []

    if (lista.length === 0) {
      const base: ConversacionItem[] = [
        {
          id: 'soporte_nortia',
          titulo: 'Mesa de Operaciones NORTIA',
          subtitulo: 'Soporte oficial 24/7 & Verificaciones',
          tipo: 'soporte',
          otraParteId: 'soporte_system',
          otraParteNombre: 'Mesa de Ayuda NORTIA',
          otraParteRol: 'soporte',
          ultimoMensaje: 'Bienvenido al canal oficial. Aquí puedes enviar audios y mensajes.',
          ultimoTimestamp: Date.now() - 3600000,
          unreadCount: 0,
        },
        {
          id: 'flete_valparaiso_1024',
          titulo: miRol === 'camionero' ? 'Frutícola San Felipe' : 'Transportes Andinos Chile',
          subtitulo: 'Flete #1024 · Valparaíso → Santiago',
          tipo: 'flete',
          otraParteId: 'user_contacto_1024',
          otraParteNombre: miRol === 'camionero' ? 'Frutícola San Felipe' : 'Hernán Paredes',
          otraParteRol: miRol === 'camionero' ? 'cliente' : 'camionero',
          ultimoMensaje: 'Camión en posición de carga según itinerario acordado.',
          ultimoTimestamp: Date.now() - 7200000,
          unreadCount: 1,
        },
      ]
      localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(base))
      lista = base
    }

    return lista.sort((a, b) => b.ultimoTimestamp - a.ultimoTimestamp)
  } catch {
    return []
  }
}
