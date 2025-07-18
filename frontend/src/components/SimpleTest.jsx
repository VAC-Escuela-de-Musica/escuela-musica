import React from 'react';

/**
 * Componente simple para probar renderizado
 */
const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      border: '2px solid #007bff',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h1 style={{ color: '#007bff' }}>✅ React Component Test</h1>
      <p style={{ fontSize: '18px', color: '#333' }}>
        Si puedes ver este mensaje, React está funcionando correctamente.
      </p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => alert('¡Botón funcionando!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Probar Interacción
        </button>
      </div>
    </div>
  );
};

export default SimpleTest;
