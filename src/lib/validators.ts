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

export function validarRut(rutRaw: string): boolean {
  const clean = rutRaw.replace(/[.\s-]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  return digitoVerificador(body) === dv
}

export function validarPatente(patenteRaw: string): boolean {
  const clean = patenteRaw.replace(/[\s-]/g, '').toUpperCase()
  return /^[A-Z]{2}\d{4}$/.test(clean) || /^[A-Z]{4}\d{2}$/.test(clean)
}
