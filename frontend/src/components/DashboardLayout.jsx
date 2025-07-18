import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';

/**
 * Layout principal para páginas autenticadas
 */
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#2c3e50', 
        color: 'white', 
        padding: '1rem 2rem',
        borderBottom: '3px solid #34495e'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            🎵 Escuela de Música
          </h1>
          
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link 
              to="/dashboard" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              📚 Materiales
            </Link>
            
            <Link 
              to="/upload" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#34495e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              📤 Subir Material
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.9rem' }}>
                👤 {user?.username || user?.email || 'Usuario'}
              </span>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: '#e74c3c', 
                  color: 'white', 
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '2rem auto', 
        padding: '0 2rem' 
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
