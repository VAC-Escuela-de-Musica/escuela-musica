import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Login from '../components/Login';
import { useAuth } from '../components/AuthProvider.jsx';

/**
 * Página de login
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      // Redirigir a donde estaba antes o al dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate, location]);

  // Si ya está autenticado y inicializado, no mostrar el login
  if (isAuthenticated && isInitialized) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: '#2c3e50',
          fontSize: '2rem'
        }}>
          🎵 Escuela de Música
        </h1>
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
