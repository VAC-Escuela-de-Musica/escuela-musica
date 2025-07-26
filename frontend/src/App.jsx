import DashboardLayout from "./components/domain/layout/DashboardLayout";
import StudentDashboardLayout from "./components/domain/layout/StudentDashboardLayout";
import ProtectedRoute from "./components/domain/auth/ProtectedRoute";
import StudentProtectedRoute from "./components/domain/auth/StudentProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import React, { Suspense, lazy, useEffect } from "react";
const HomePage = lazy(() => import("./pages/Homepage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const InicioUsuario = lazy(() => import("./pages/paginaUsuario"));
const AlumnosPage = lazy(() => import("./pages/AlumnosPage"));
const ProfesoresPage = lazy(() => import("./pages/ProfesoresPage"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentLoginPage = lazy(() => import("./pages/StudentLoginPage"));
const StudentGalleryPage = lazy(() => import("./pages/StudentGalleryPage"));
const StudentProfilePage = lazy(() => import("./pages/StudentProfilePage"));
const StudentMessagesPage = lazy(() => import("./pages/StudentMessagesPage"));
const InternalMessageManager = lazy(() => import("./pages/InternalMessageManager"));
const GaleriaManager = lazy(() => import("./components/domain/galeria/GaleriaManager"));

import Navbar from "./components/domain/layout/Navbar";
import Loader from "./components/domain/layout/Loader";
import { AuthProvider } from "./context/AuthContext";

function App() {
  // Inicializar el tema
  useTheme();


  return (
    <AuthProvider>
      <Routes>
        {/* Landing page pública */}
        <Route path="/" element={
          <Suspense fallback={<Loader />}>
            <HomePage />
          </Suspense>
        } />

        {/* Ruta pública - Login administrativo */}
        <Route path="/login" element={
          <Suspense fallback={<Loader />}>
            <LoginPage />
          </Suspense>
        } />

        {/* Ruta pública - Login de estudiantes */}
        <Route path="/login-estudiante" element={
          <Suspense fallback={<Loader />}>
            <StudentLoginPage />
          </Suspense>
        } />

        {/* Rutas protegidas bajo /dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadPage />} />

          <Route path="galeria" element={
            <Suspense fallback={<Loader />}>
              <GaleriaManager />
            </Suspense>
          } />
          <Route path="alumnos" element={
            <Suspense fallback={<Loader />}>
              <AlumnosPage />
            </Suspense>
          } />
          <Route path="profesores" element={
            <Suspense fallback={<Loader />}>
              <ProfesoresPage />
            </Suspense>
          } />
          <Route path="mensajes-internos" element={
            <Suspense fallback={<Loader />}>
              <InternalMessageManager />
            </Suspense>
          } />
        </Route>

        {/* Ruta protegida - Panel de administración */}
        <Route path="/usuario" element={
          <ProtectedRoute>
            <Suspense fallback={<Loader />}>
              <InicioUsuario />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Rutas protegidas para estudiantes bajo /estudiante */}
        <Route path="/estudiante" element={
          <StudentProtectedRoute>
            <StudentDashboardLayout />
          </StudentProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="galeria" element={
            <Suspense fallback={<Loader />}>
              <StudentGalleryPage />
            </Suspense>
          } />
          <Route path="mensajes" element={
            <Suspense fallback={<Loader />}>
              <StudentMessagesPage />
            </Suspense>
          } />
          <Route path="perfil" element={
            <Suspense fallback={<Loader />}>
              <StudentProfilePage />
            </Suspense>
          } />
        </Route>

        {/* Ruta catch-all - redirige a la landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Fin de las rutas */}
    </AuthProvider>
  )
}

export default App;