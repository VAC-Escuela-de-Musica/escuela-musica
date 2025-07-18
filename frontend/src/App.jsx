import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ListaMateriales from './components/ListaMateriales'
import SubirMultiplesMateriales from './components/SubirMultiplesMateriales'
import Login from './components/Login'
import authService from './services/auth.service.js'

function App() {
  const [count, setCount] = useState(0)
  const [isLogged, setIsLogged] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Inicializar el servicio de autenticación
    authService.init();
    
    // Verificar si hay una sesión activa
    if (authService.isAuthenticated()) {
      setIsLogged(true);
      setUser(authService.getUser());
    }
    
    // Configurar interceptor para peticiones automáticas
    authService.createAuthInterceptor();
  }, []);

  const handleLogin = () => {
    setIsLogged(true);
    setUser(authService.getUser());
  };
  
  const handleLogout = async () => {
    await authService.logout();
    setIsLogged(false);
    setUser(null);
  };

  return (
    <>
      {/* Login y funcionalidad protegida */}
      {!isLogged ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <span>Bienvenido, {user?.username || user?.email || 'Usuario'}</span>
            <button onClick={handleLogout} style={{ marginLeft: 20, padding: '5px 10px' }}>
              Cerrar sesión
            </button>
          </div>
          <SubirMultiplesMateriales />
          <ListaMateriales />
        </>
      )}
    </>
  )
}

export default App
