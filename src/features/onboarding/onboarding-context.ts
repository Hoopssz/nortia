import { createContext } from 'react'
import type { Enums } from '../../lib/database.types'

export interface CamionDraft {
  tipo: Enums<'tipo_vehiculo'>
  carroceria: Enums<'tipo_carroceria'> | ''
  largo_m: string
  ancho_m: string
  alto_m: string
  volumen_m3: string
  carga_max_kg: string
  pallets: string
  tiene_rampa: boolean
  tiene_pulpo: boolean
  tiene_grua: boolean
  tiene_refrigeracion: boolean
  ayuda_carga: boolean
  patente: string
  marca: string
  modelo: string
  anio: string
  fotoFile: File | null
  permisoFile: File | null
  revisionFile: File | null
  soapFile: File | null
  licenciaFile: File | null
}

export interface OnboardingState {
  nombre: string
  telefono: string
  rol: Enums<'rol_usuario'> | null
  regiones: number[]
  razonSocial: string
  rut: string
  rubro: string
  emiteFactura: boolean
  camion: CamionDraft
}

export const initialCamionDraft: CamionDraft = {
  tipo: 'camion',
  carroceria: '',
  largo_m: '',
  ancho_m: '',
  alto_m: '',
  volumen_m3: '',
  carga_max_kg: '',
  pallets: '',
  tiene_rampa: false,
  tiene_pulpo: false,
  tiene_grua: false,
  tiene_refrigeracion: false,
  ayuda_carga: false,
  patente: '',
  marca: '',
  modelo: '',
  anio: '',
  fotoFile: null,
  permisoFile: null,
  revisionFile: null,
  soapFile: null,
  licenciaFile: null,
}

export const initialOnboardingState: OnboardingState = {
  nombre: '',
  telefono: '',
  rol: null,
  regiones: [],
  razonSocial: '',
  rut: '',
  rubro: '',
  emiteFactura: false,
  camion: initialCamionDraft,
}

export interface OnboardingContextValue {
  state: OnboardingState
  update: (patch: Partial<OnboardingState>) => void
  updateCamion: (patch: Partial<CamionDraft>) => void
}

export const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)
