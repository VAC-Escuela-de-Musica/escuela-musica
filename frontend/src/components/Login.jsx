import { useState } from "react";
import authService from '../services/auth.service.js';

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        console.log("Login exitoso:", result.data);
        if (onLogin) onLogin();
      } else {
        setError(result.error || "Error en el inicio de sesión");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:400,margin:"2rem auto",padding:20,border:"1px solid #ccc",borderRadius:8}}>
      <h2>Iniciar sesión</h2>
      <div style={{marginBottom:10}}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{width:"100%",padding:8}}
        />
      </div>
      <div style={{marginBottom:10}}>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{width:"100%",padding:8}}
        />
      </div>
      {error && <div style={{color:"red",marginBottom:10}}>{error}</div>}
      <button type="submit" disabled={loading} style={{width:"100%",padding:10}}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

export default Login;
