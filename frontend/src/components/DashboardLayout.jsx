import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContextProvider.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import './DashboardLayout.css';

/**
 * Layout principal para páginas autenticadas
 */
const DashboardLayout = () => {
  const { user, logout, isAdmin, isTeacher } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <h1 className="header-title">
            <span className="music-icon">🎼</span> Escuela de Música
          </h1>
          
          <nav className="header-nav">
            <div className="nav-section">
              <Link to="/dashboard" className="nav-link">
                <span className="nav-icon">📚</span> Biblioteca
              </Link>
              
              {/* Solo mostrar para admins y profesores */}
              {(isAdmin() || isTeacher()) && (
                <Link to="/upload" className="nav-link">
                  <span className="nav-icon">📤</span> Cargar
                </Link>
              )}
            </div>
            
            <div className="user-info">
              <ThemeToggle />
              <div className="user-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <span className="user-name">
                {user?.username || user?.email || 'Usuario'}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Salir
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
