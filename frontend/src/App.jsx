import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import React, { Suspense, lazy, useEffect } from "react";
const HomePage = lazy(() => import("./pages/Homepage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const InicioUsuario = lazy(() => import("./pages/paginaUsuario"));
const AlumnosPage = lazy(() => import("./pages/AlumnosPage"));

import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
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

        {/* Ruta pública - Login */}
        <Route path="/login" element={
          <Suspense fallback={<Loader />}>
            <LoginPage />
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
        </Route>

        {/* Ruta protegida - Panel de administración */}
        <Route path="/usuario" element={
          <ProtectedRoute>
            <Suspense fallback={<Loader />}>
              <InicioUsuario />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Ruta catch-all - redirige a la landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Fin de las rutas */}
    </AuthProvider>
  )
}

export default App;