/**
 * escrowService.ts
 * Gestión del ciclo de vida del Escrow / Custodia de Pagos NORTIA.
 *
 * Flujo completo:
 *   1. Empresa paga → viajes.pagado = true  (fondos "en custodia")
 *   2. Camión entrega → viajes.estado = 'entregado'
 *   3. Empresa confirma recepción → liberarEscrow()  (fondos disponibles para camionero)
 *
 * El estado de liberación se persiste en localStorage mientras no exista
 * una columna dedicada en Supabase.
 */

const ESCROW_PREFIX = 'nortia_escrow_'
const ESCROW_EVENT  = 'nortia_escrow_liberado'

export interface EscrowState {
  liberado: boolean
  fechaLiberacion: string | null   // ISO 8601
  liberadoPor: string | null       // userId del cliente que liberó
}

/** Lee el estado de escrow para un viaje. */
export function obtenerEscrow(viajeId: string): EscrowState {
  try {
    const raw = localStorage.getItem(ESCROW_PREFIX + viajeId)
    if (!raw) return { liberado: false, fechaLiberacion: null, liberadoPor: null }
    return JSON.parse(raw) as EscrowState
  } catch {
    return { liberado: false, fechaLiberacion: null, liberadoPor: null }
  }
}

/** Libera los fondos del escrow. Emite un evento para actualizar vistas en tiempo real. */
export function liberarEscrow(viajeId: string, userId: string): EscrowState {
  const state: EscrowState = {
    liberado: true,
    fechaLiberacion: new Date().toISOString(),
    liberadoPor: userId,
  }
  localStorage.setItem(ESCROW_PREFIX + viajeId, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(ESCROW_EVENT, { detail: { viajeId } }))
  return state
}

/** Escucha cambios de escrow (útil para componentes que se deben re-renderizar). */
export function onEscrowLiberado(
  viajeId: string,
  callback: () => void,
): () => void {
  const handler = (e: Event) => {
    const ev = e as CustomEvent<{ viajeId: string }>
    if (ev.detail?.viajeId === viajeId) callback()
  }
  window.addEventListener(ESCROW_EVENT, handler)
  return () => window.removeEventListener(ESCROW_EVENT, handler)
}

/** Formatea una fecha ISO como string legible en español. */
export function formatFechaEscrow(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
