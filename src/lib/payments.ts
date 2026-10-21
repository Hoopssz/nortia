/**
 * Módulo de Pagos NORTIA - Integración Mercado Pago & Webpay Plus Chile
 */

export interface TarjetaCredito {
  id: string
  numeroEnmascarado: string
  marca: 'visa' | 'mastercard' | 'amex' | 'redcompra'
  nombreTitular: string
  mesExp: string
  anioExp: string
  esDefault?: boolean
}

export interface DatosBancarios {
  banco: string
  tipoCuenta: 'cuenta_corriente' | 'cuenta_vista' | 'cuenta_rut' | 'cuenta_ahorro'
  numeroCuenta: string
  rutTitular: string
  nombreTitular: string
  emailNotificacion: string
}

export type MetodoPago = 'tarjeta' | 'mercadopago' | 'transferencia'

export const BANCOS_CHILE = [
  'BancoEstado (CuentaRUT)',
  'Banco de Chile / Edwards',
  'Banco Santander Chile',
  'Banco BCI / MACH',
  'Scotiabank Chile',
  'Banco Itaú Chile',
  'Banco Falabella',
  'Banco BICE',
  'Banco Security',
  'Banco Consorcio',
  'Tenpo Prepago',
  'Mercado Pago',
  'Coopeuch',
]

export const DATOS_TRANSFERENCIA_NORTIA = {
  titular: 'NORTIA Logística SpA',
  rut: '77.892.341-2',
  banco: 'Banco Santander Chile',
  tipoCuenta: 'Cuenta Corriente',
  numeroCuenta: '0-000-847291-0',
  email: 'pagos@nortia.cl',
}

/**
 * Detecta la marca de la tarjeta según los primeros dígitos
 */
export function detectarMarcaTarjeta(numero: string): 'visa' | 'mastercard' | 'amex' | 'redcompra' {
  const limpio = numero.replace(/\D/g, '')
  if (limpio.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(limpio) || /^2[2-7]/.test(limpio)) return 'mastercard'
  if (/^3[47]/.test(limpio)) return 'amex'
  return 'redcompra'
}

/**
 * Formatea número de tarjeta en bloques de 4 dígitos
 */
export function formatearNumeroTarjeta(valor: string): string {
  const limpio = valor.replace(/\D/g, '').slice(0, 16)
  const bloques = limpio.match(/.{1,4}/g)
  return bloques ? bloques.join(' ') : limpio
}

/**
 * Formatea fecha de expiración MM/AA
 */
export function formatearExpiracion(valor: string): string {
  const limpio = valor.replace(/\D/g, '').slice(0, 4)
  if (limpio.length >= 2) {
    return `${limpio.slice(0, 2)}/${limpio.slice(2)}`
  }
  return limpio
}

/**
 * Valida fecha de expiración futura
 */
export function validarExpiracion(exp: string): boolean {
  const partes = exp.split('/')
  if (partes.length !== 2) return false
  const mes = parseInt(partes[0], 10)
  const anio = parseInt('20' + partes[1], 10)
  if (isNaN(mes) || isNaN(anio) || mes < 1 || mes > 12) return false

  const hoy = new Date()
  const expDate = new Date(anio, mes, 0) // fin de mes
  return expDate >= hoy
}

/**
 * Procesa el pago a través de Mercado Pago / Webpay Plus
 */
export async function procesarPagoNortia(params: {
  metodo: MetodoPago
  monto: number
  tarjetaNumero?: string
  nombreTitular?: string
  expiracion?: string
  cvv?: string
  cuotas?: number
  viajeId: string
}): Promise<{
  exitoso: boolean
  transaccionId: string
  autorizacion: string
  medio: string
  fecha: string
}> {
  // Simular latencia de pasarela bancaria chilena
  await new Promise((resolve) => setTimeout(resolve, params.metodo === 'mercadopago' ? 1000 : 1400))

  return {
    exitoso: true,
    transaccionId: `MP-NORTIA-${Date.now().toString().slice(-8)}`,
    autorizacion: `${Math.floor(100000 + Math.random() * 900000)}`,
    medio: params.metodo === 'mercadopago' ? 'Mercado Pago Wallet' : params.metodo === 'tarjeta' ? 'Webpay Plus / Débito-Crédito' : 'Transferencia Directa B2B',
    fecha: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  }
}

// Almacenamiento local de datos bancarios del usuario
const BANK_STORAGE_KEY = 'nortia_datos_bancarios_'

export function guardarDatosBancarios(userId: string, datos: DatosBancarios): void {
  try {
    localStorage.setItem(BANK_STORAGE_KEY + userId, JSON.stringify(datos))
  } catch (err) {
    console.error('Error guardando datos bancarios:', err)
  }
}

export function obtenerDatosBancarios(userId: string): DatosBancarios | null {
  try {
    const raw = localStorage.getItem(BANK_STORAGE_KEY + userId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
