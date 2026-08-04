import { useContext } from 'react'
import { OnboardingContext } from './onboarding-context'

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding debe usarse dentro de OnboardingLayout')
  return ctx
}
