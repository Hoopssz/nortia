import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import {
  OnboardingContext,
  initialOnboardingState,
  type OnboardingState,
  type CamionDraft,
} from './onboarding-context'

function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialOnboardingState)

  function update(patch: Partial<OnboardingState>) {
    setState((prev) => ({ ...prev, ...patch }))
  }

  function updateCamion(patch: Partial<CamionDraft>) {
    setState((prev) => ({ ...prev, camion: { ...prev.camion, ...patch } }))
  }

  return (
    <OnboardingContext.Provider value={{ state, update, updateCamion }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Outlet />
    </OnboardingProvider>
  )
}
