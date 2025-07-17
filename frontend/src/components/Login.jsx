import { useState } from "react";

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
      const res = await fetch("http://localhost:1230/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      const token = (data && data.accessToken) || (data && data.data && data.data.accessToken) || (data && data.data && data.data.token);
      console.log("Respuesta login:", data, "Token detectado:", token);
      if (!res.ok || !token) {
        setError(data.message || "Credenciales incorrectas");
      } else {
        localStorage.setItem("token", token);
        if (onLogin) onLogin();
      }
    } catch (err) {
      setError("Error de red");
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
