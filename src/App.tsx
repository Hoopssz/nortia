import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { RequireAuth } from './routes/RequireAuth'
import { RoleGate } from './routes/RoleGate'
import { HomeRedirect } from './routes/HomeRedirect'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SplashPage } from './pages/SplashPage'
import { LoginPage } from './pages/LoginPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { OnboardingLayout } from './features/onboarding/OnboardingProvider'
import { OfflineIndicator } from './components/OfflineIndicator'
import { PwaInstallBanner } from './components/PwaInstallBanner'

const RolePage = lazy(() => import('./pages/onboarding/RolePage').then((m) => ({ default: m.RolePage })))
const RegionsPage = lazy(() => import('./pages/onboarding/RegionsPage').then((m) => ({ default: m.RegionsPage })))
const OnboardingPerfilPage = lazy(() => import('./pages/onboarding/PerfilPage').then((m) => ({ default: m.PerfilPage })))
const VehiclePage = lazy(() => import('./pages/onboarding/VehiclePage').then((m) => ({ default: m.VehiclePage })))
const NegocioHomePage = lazy(() => import('./pages/negocio/NegocioHomePage').then((m) => ({ default: m.NegocioHomePage })))
const PublishCargaPage = lazy(() => import('./pages/negocio/PublishCargaPage').then((m) => ({ default: m.PublishCargaPage })))
const CargaDetailPage = lazy(() => import('./pages/negocio/CargaDetailPage').then((m) => ({ default: m.CargaDetailPage })))
const CamioneroHomePage = lazy(() => import('./pages/camionero/CamioneroHomePage').then((m) => ({ default: m.CamioneroHomePage })))
const MapaCalorPage = lazy(() => import('./pages/camionero/MapaCalorPage').then((m) => ({ default: m.MapaCalorPage })))
const BuscarCargaPage = lazy(() => import('./pages/camionero/BuscarCargaPage').then((m) => ({ default: m.BuscarCargaPage })))
const CargaOfertaPage = lazy(() => import('./pages/camionero/CargaOfertaPage').then((m) => ({ default: m.CargaOfertaPage })))
const MisFletesPage = lazy(() => import('./pages/camionero/MisFletesPage').then((m) => ({ default: m.MisFletesPage })))
const MisGananciasPage = lazy(() => import('./pages/camionero/MisGananciasPage').then((m) => ({ default: m.MisGananciasPage })))
const RetornoVacioPage = lazy(() => import('./pages/camionero/RetornoVacioPage').then((m) => ({ default: m.RetornoVacioPage })))
const MisDocumentosPage = lazy(() => import('./pages/camionero/MisDocumentosPage').then((m) => ({ default: m.MisDocumentosPage })))
const MisChoferesPage = lazy(() => import('./pages/camionero/MisChoferesPage').then((m) => ({ default: m.MisChoferesPage })))
const AdminVerificacionPage = lazy(() => import('./pages/admin/AdminVerificacionPage').then((m) => ({ default: m.AdminVerificacionPage })))
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage })))
const ViajeDetailPage = lazy(() => import('./pages/ViajeDetailPage').then((m) => ({ default: m.ViajeDetailPage })))
const MiCuentaPage = lazy(() => import('./pages/MiCuentaPage').then((m) => ({ default: m.MiCuentaPage })))
const MensajesPage = lazy(() => import('./pages/MensajesPage').then((m) => ({ default: m.MensajesPage })))
const HistorialPage = lazy(() => import('./pages/HistorialPage').then((m) => ({ default: m.HistorialPage })))
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const TerminosPage = lazy(() => import('./pages/TerminosPage').then((m) => ({ default: m.TerminosPage })))
const PrivacidadPage = lazy(() => import('./pages/PrivacidadPage').then((m) => ({ default: m.PrivacidadPage })))
const AppSimulatorPage = lazy(() => import('./pages/AppSimulatorPage').then((m) => ({ default: m.AppSimulatorPage })))
const ProveedorHomePage = lazy(() => import('./pages/proveedor/ProveedorHomePage').then((m) => ({ default: m.ProveedorHomePage })))
const PublishProductoPage = lazy(() => import('./pages/proveedor/PublishProductoPage').then((m) => ({ default: m.PublishProductoPage })))
const MercadoB2BPage = lazy(() => import('./pages/negocio/MercadoB2BPage').then((m) => ({ default: m.MercadoB2BPage })))

function RouteFallback() {
  return (
    <div className="px" style={{ paddingTop: 24 }}>
      <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>
    </div>
  )
}

function App() {
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    if (isNative) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
      StatusBar.setBackgroundColor({ color: '#070E1B' }).catch(() => {})
      SplashScreen.hide().catch(() => {})
    }
  }, [isNative])

  return (
    <>
      <OfflineIndicator />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              isNative ? (
                <RequireAuth>
                  <HomeRedirect />
                </RequireAuth>
              ) : (
                <LandingPage />
              )
            }
          />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
          <Route path="/simulator" element={<AppSimulatorPage />} />

        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomeRedirect />
            </RequireAuth>
          }
        />
        <Route
          path="/app"
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
          path="/negocio/mercado"
          element={
            <RequireAuth>
              <MercadoB2BPage />
            </RequireAuth>
          }
        />
        <Route
          path="/mercado-b2b"
          element={
            <RequireAuth>
              <MercadoB2BPage />
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
          path="/camionero/mapa-calor"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <MapaCalorPage />
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
          path="/camionero/ganancias"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <MisGananciasPage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/camionero/retorno"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <RetornoVacioPage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/camionero/documentos"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <MisDocumentosPage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/camionero/choferes"
          element={
            <RequireAuth>
              <RoleGate rol="camionero">
                <MisChoferesPage />
              </RoleGate>
            </RequireAuth>
          }
        />

        <Route
          path="/proveedor"
          element={
            <RequireAuth>
              <RoleGate rol="proveedor">
                <ProveedorHomePage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/proveedor/publicar-producto"
          element={
            <RequireAuth>
              <RoleGate rol="proveedor">
                <PublishProductoPage />
              </RoleGate>
            </RequireAuth>
          }
        />
        <Route
          path="/proveedor/publicar"
          element={
            <RequireAuth>
              <RoleGate rol="proveedor">
                <PublishProductoPage />
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
        <Route
          path="/cuenta"
          element={
            <RequireAuth>
              <MiCuentaPage />
            </RequireAuth>
          }
        />
        <Route
          path="/mensajes"
          element={
            <RequireAuth>
              <MensajesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/historial"
          element={
            <RequireAuth>
              <HistorialPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/verificacion"
          element={
            <RequireAuth>
              <AdminVerificacionPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<PlaceholderPage title="Página no encontrada" />} />
      </Routes>
    </Suspense>
    {!isNative && <PwaInstallBanner />}
  </>
  )
}

export default App
