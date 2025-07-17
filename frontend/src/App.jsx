import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ListaMateriales from './components/ListaMateriales'
import SubirMultiplesMateriales from './components/SubirMultiplesMateriales'
import Login from './components/Login'

function App() {
  const [count, setCount] = useState(0)
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('token'))

  const handleLogin = () => setIsLogged(true)
  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLogged(false)
  }

  return (
    <>
      {/* Login y funcionalidad protegida */}
      {!isLogged ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <button onClick={handleLogout} style={{ marginBottom: 20 }}>
            Cerrar sesión
          </button>
          <SubirMultiplesMateriales />
          <ListaMateriales />
        </>
      )}
    </>
  )
}

export default App
