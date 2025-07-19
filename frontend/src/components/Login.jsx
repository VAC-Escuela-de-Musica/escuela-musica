import { useState, useEffect } from "react";
import { useAuth } from './AuthContextProvider.jsx';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await login(email, password);
    
    if (result.success) {
      console.log("Login exitoso:", result.data);
    }
  };

  // Limpiar errores cuando cambian los inputs
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError]);

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50' }}>
        🎵 Iniciar Sesión
      </h2>
      <div style={{marginBottom:15}}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Email:
        </label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width:"100%",
            padding:'10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>
      <div style={{marginBottom:15}}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Contraseña:
        </label>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            width:"100%",
            padding:'10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>
      {error && (
        <div style={{
          color:"#e74c3c",
          marginBottom:15,
          padding: '10px',
          backgroundColor: '#fdf2f2',
          border: '1px solid #e74c3c',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      <button 
        type="submit" 
        disabled={loading} 
        style={{
          width:"100%",
          padding:'12px',
          backgroundColor: loading ? '#95a5a6' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {loading ? "Ingresando..." : "Iniciar Sesión"}
      </button>
    </form>
  );
}

export default Login;
