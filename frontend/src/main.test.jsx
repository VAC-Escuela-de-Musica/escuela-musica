import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppTest from './AppTest.jsx'

// Usar AppTest en lugar de App para diagnosticar problemas
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppTest />
  </StrictMode>,
)
