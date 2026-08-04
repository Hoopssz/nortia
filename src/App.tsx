import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RequireAuth } from './routes/RequireAuth'
import { RoleGate } from './routes/RoleGate'
import { HomeRedirect } from './routes/HomeRedirect'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SplashPage } from './pages/SplashPage'
import { LoginPage } from './pages/LoginPage'
import { OnboardingLayout } from './features/onboarding/OnboardingProvider'

const RolePage = lazy(() => import('./pages/onboarding/RolePage').then((m) => ({ default: m.RolePage })))
const RegionsPage = lazy(() => import('./pages/onboarding/RegionsPage').then((m) => ({ default: m.RegionsPage })))
const OnboardingPerfilPage = lazy(() => import('./pages/onboarding/PerfilPage').then((m) => ({ default: m.PerfilPage })))
const VehiclePage = lazy(() => import('./pages/onboarding/VehiclePage').then((m) => ({ default: m.VehiclePage })))
const NegocioHomePage = lazy(() => import('./pages/negocio/NegocioHomePage').then((m) => ({ default: m.NegocioHomePage })))
const PublishCargaPage = lazy(() => import('./pages/negocio/PublishCargaPage').then((m) => ({ default: m.PublishCargaPage })))
const CargaDetailPage = lazy(() => import('./pages/negocio/CargaDetailPage').then((m) => ({ default: m.CargaDetailPage })))
const CamioneroHomePage = lazy(() => import('./pages/camionero/CamioneroHomePage').then((m) => ({ default: m.CamioneroHomePage })))
const BuscarCargaPage = lazy(() => import('./pages/camionero/BuscarCargaPage').then((m) => ({ default: m.BuscarCargaPage })))
const CargaOfertaPage = lazy(() => import('./pages/camionero/CargaOfertaPage').then((m) => ({ default: m.CargaOfertaPage })))
const MisFletesPage = lazy(() => import('./pages/camionero/MisFletesPage').then((m) => ({ default: m.MisFletesPage })))
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage })))
const ViajeDetailPage = lazy(() => import('./pages/ViajeDetailPage').then((m) => ({ default: m.ViajeDetailPage })))

function RouteFallback() {
  return (
    <div className="px" style={{ paddingTop: 24 }}>
      <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomeRedirect />
            </RequireAuth>
          }
        />

        <Route
          element={
            <RequireAuth>
              <OnboardingLayout />
            </RequireAuth>
          }
        >
          <Route path="/onboarding/rol" element={<RolePage />} />
          <Route path="/onboarding/regiones" element={<RegionsPage />} />
          <Route path="/onboarding/perfil" element={<OnboardingPerfilPage />} />
          <Route path="/onboarding/camion" element={<VehiclePage />} />
        </Route>

        <Route
          path="/negocio"
          element={
            <RequireAuth>
              <RoleGate rol="negocio">
                <NegocioHomePage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/negocio/publicar"
          element={
            <RequireAuth>
              <RoleGate rol="negocio">
                <PublishCargaPage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/negocio/cargas/:id"
          element={
            <RequireAuth>
              <RoleGate rol="negocio">
                <CargaDetailPage />
              </RoleGate>
            </RequireAuth>
          }
        />

        <Route
          path="/camionero"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <CamioneroHomePage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/camionero/buscar"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <BuscarCargaPage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/camionero/cargas/:id"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <CargaOfertaPage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/camionero/fletes"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <MisFletesPage />
              </RoleGate>
            </RequireAuth>
          }
        />

        <Route
          path="/proveedor"
          element={
            <RequireAuth>
              <RoleGate rol="proveedor">
                <NegocioHomePage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/proveedor/publicar"
          element={
            <RequireAuth>
              <RoleGate rol="proveedor">
                <PublishCargaPage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/proveedor/cargas/:id"
          element={
            <RequireAuth>
              <RoleGate rol="proveedor">
                <CargaDetailPage />
              </RoleGate>
            </RequireAuth>
          }
        />

        <Route
          path="/perfil/:id"
          element={
            <RequireAuth>
              <PublicProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/viajes/:id"
          element={
            <RequireAuth>
              <ViajeDetailPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<PlaceholderPage title="Página no encontrada" />} />
      </Routes>
    </Suspense>
  )
}

export default App
