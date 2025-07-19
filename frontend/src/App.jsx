import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './components/AuthContextProvider.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import { useTheme } from './hooks/useTheme.js'

function App() {
  // Inicializar el tema
  useTheme();

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Ruta por defecto redirige al dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard principal */}
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Página de subida */}
            <Route path="upload" element={<UploadPage />} />
          </Route>
          
          {/* Ruta catch-all - redirige al dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
