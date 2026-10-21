function digitoVerificador(rutBody: string): string {
  let sum = 0
  let multiplier = 2
  for (let i = rutBody.length - 1; i >= 0; i--) {
    sum += Number(rutBody[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const remainder = 11 - (sum % 11)
  if (remainder === 11) return '0'
  if (remainder === 10) return 'K'
  return String(remainder)
}

/**
 * Valida RUT chileno estricto (personas y empresas) con algoritmo Módulo 11.
 * Soporta formatos con o sin puntos y guión (ej: 12.345.678-5, 12345678-5, 76123456K).
 */
export function validarRut(rutRaw: string): boolean {
  if (!rutRaw || typeof rutRaw !== 'string') return false
  const clean = rutRaw.replace(/[.\s-]/g, '').toUpperCase()
  if (clean.length < 7 || clean.length > 9) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  if (!/^[\dK]$/.test(dv)) return false
  const bodyNum = parseInt(body, 10)
  if (bodyNum < 1000000 || bodyNum > 99999999) return false
  return digitoVerificador(body) === dv
}

/**
 * Formatea un RUT chileno en tiempo real con puntos y guión (ej: 12.345.678-K).
 */
export function formatearRut(rutRaw: string): string {
  if (!rutRaw || typeof rutRaw !== 'string') return ''
  const clean = rutRaw.replace(/[^\dKk]/g, '').toUpperCase().slice(0, 9)
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  let formatted = ''
  let count = 0
  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body[i] + formatted
    count++
    if (count === 3 && i > 0) {
      formatted = '.' + formatted
      count = 0
    }
  }
  return `${formatted}-${dv}`
}

/**
 * Limpia el RUT dejando solo dígitos y DV en mayúscula (ej: 12345678K).
 */
export function limpiarRut(rutRaw: string): string {
  if (!rutRaw || typeof rutRaw !== 'string') return ''
  return rutRaw.replace(/[.\s-]/g, '').toUpperCase()
}

export function formatearPatente(patenteRaw: string): string {
  return patenteRaw.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

export function validarPatente(patenteRaw: string): boolean {
  const clean = formatearPatente(patenteRaw)
  const viejo = /^[A-Z]{2}\d{4}$/
  const nuevo = /^[BCDFGHJKLPRSTVWXYZ]{4}\d{2}$/i
  return viejo.test(clean) || nuevo.test(clean)
}
