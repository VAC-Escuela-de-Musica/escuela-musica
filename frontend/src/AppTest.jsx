import React, { useState, useEffect } from 'react';
import './App.css';
import SimpleTest from './components/SimpleTest.jsx';

function AppTest() {
  const [message, setMessage] = useState('Cargando...');
  const [backendStatus, setBackendStatus] = useState('Probando...');

  useEffect(() => {
    // Test básico de React
    setMessage('✅ React funcionando correctamente');
    
    // Test de conexión con backend
    const testBackend = async () => {
      try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
          setBackendStatus('✅ Backend conectado');
        } else {
          setBackendStatus('❌ Backend no responde');
        }
      } catch (error) {
        setBackendStatus('❌ Error de conexión: ' + error.message);
      }
    };

    testBackend();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#2c3e50',
          marginBottom: '30px'
        }}>
          🎵 Escuela de Música - Test Mode
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#34495e' }}>Estado del Sistema:</h2>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            <strong>React:</strong> {message}
          </p>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            <strong>Backend:</strong> {backendStatus}
          </p>
        </div>

        <SimpleTest />

        <div style={{ 
          marginTop: '30px', 
          padding: '20px',
          backgroundColor: '#e9ecef',
          borderRadius: '6px'
        }}>
          <h3 style={{ color: '#495057' }}>🔍 Diagnóstico:</h3>
          <p>
            Si puedes ver esta página, significa que:
          </p>
          <ul style={{ lineHeight: '1.6' }}>
            <li>✅ React está funcionando correctamente</li>
            <li>✅ Los componentes se están renderizando</li>
            <li>✅ El servidor de desarrollo está corriendo</li>
            <li>✅ Los archivos se están compilando sin errores</li>
          </ul>
          <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
            El problema de la "pantalla gris" probablemente está en:
          </p>
          <ul style={{ lineHeight: '1.6' }}>
            <li>🔍 Configuración del router</li>
            <li>🔍 Lógica de autenticación</li>
            <li>🔍 Estados de carga infinitos</li>
            <li>🔍 Errores en componentes complejos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AppTest;
