/**
 * Módulo de Resiliencia Offline y Sincronización en Carretera (NORTIA)
 */

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export interface AccionOffline {
  id: string
  tipo: 'iniciar_ruta' | 'marcar_entregado' | 'guardar_oferta'
  payload: Record<string, any>
  timestamp: number
}

const STORAGE_KEY_QUEUE = 'nortia_offline_queue'
const STORAGE_KEY_TRIPS = 'nortia_cached_trips_'

/**
 * Hook para monitorear el estado de red en tiempo real
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [sincronizando, setSincronizando] = useState(false)
  const [ultimoSyncExito, setUltimoSyncExito] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      // Procesar cola pendiente al reconectar
      procesarColaOffline().then((procesados) => {
        if (procesados > 0) {
          setUltimoSyncExito(true)
          setTimeout(() => setUltimoSyncExito(false), 4000)
        }
      })
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, sincronizando, setSincronizando, ultimoSyncExito }
}

/**
 * Guarda copia de seguridad del viaje en caché local
 */
export function guardarViajeOffline(viajeId: string, data: any): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRIPS + viajeId, JSON.stringify({
      data,
      timestamp: Date.now(),
    }))
  } catch (err) {
    console.error('Error guardando viaje offline:', err)
  }
}

/**
 * Obtiene copia de seguridad del viaje en caché local
 */
export function obtenerViajeOffline(viajeId: string): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIPS + viajeId)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.data
  } catch {
    return null
  }
}

/**
 * Encola una acción para ser enviada cuando se recupere la señal móvil
 */
export function encolarAccionOffline(accion: Omit<AccionOffline, 'id' | 'timestamp'>): void {
  try {
    const cola: AccionOffline[] = JSON.parse(localStorage.getItem(STORAGE_KEY_QUEUE) || '[]')
    cola.push({
      ...accion,
      id: `ACCION-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    })
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(cola))
  } catch (err) {
    console.error('Error encolando acción offline:', err)
  }
}

/**
 * Procesa todas las acciones pendientes acumuladas sin señal
 */
export async function procesarColaOffline(): Promise<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUEUE)
    if (!raw) return 0
    const cola: AccionOffline[] = JSON.parse(raw)
    if (cola.length === 0) return 0

    let procesadas = 0
    const pendientes: AccionOffline[] = []

    for (const item of cola) {
      try {
        if (item.tipo === 'iniciar_ruta') {
          const nowIso = new Date().toISOString()
          await supabase.from('viajes').update({ estado: 'en_ruta', fecha_inicio: nowIso }).eq('id', item.payload.viajeId)
          if (item.payload.cargaId) {
            await supabase.from('cargas').update({ estado: 'en_ruta' }).eq('id', item.payload.cargaId)
          }
          procesadas++
        } else if (item.tipo === 'marcar_entregado') {
          await supabase.rpc('marcar_entregado', { p_viaje_id: item.payload.viajeId })
          procesadas++
        }
      } catch (err) {
        console.error(`Error procesando acción offline ${item.id}:`, err)
        pendientes.push(item) // reintentar luego
      }
    }

    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(pendientes))
    return procesadas
  } catch (err) {
    console.error('Error en procesarColaOffline:', err)
    return 0
  }
}
