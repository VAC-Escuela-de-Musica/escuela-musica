import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    console.log("🔍 [FRONTEND-LOGIN] Iniciando login para:", formData.email);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
          credentials: "include",
        }
      );
      
      console.log("🔍 [FRONTEND-LOGIN] Respuesta login status:", response.status);
      console.log("🔍 [FRONTEND-LOGIN] Respuesta login ok:", response.ok);
      
      const data = await response.json();
      console.log("🔍 [FRONTEND-LOGIN] Datos de login completos:", data);
      
      if (!response.ok) {
        console.error("❌ [FRONTEND-LOGIN] Error en login:", data);
        setError(data.message || "Error al iniciar sesión");
        return;
      }
      
      console.log("✅ [FRONTEND-LOGIN] Login exitoso, guardando token");
      localStorage.setItem("token", data.data.accessToken);
      
      try {
        console.log("🔍 [FRONTEND-LOGIN] Iniciando verificación del usuario");
        console.log("🔍 [FRONTEND-LOGIN] Token recibido:", data.data.accessToken?.substring(0, 20) + "...");
        console.log("🔍 [FRONTEND-LOGIN] URL verify:", `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify`);
        
        const verifyRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${data.data.accessToken}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        console.log("🔍 [FRONTEND-LOGIN] Respuesta verify status:", verifyRes.status);
        console.log("🔍 [FRONTEND-LOGIN] Respuesta verify ok:", verifyRes.ok);
        
        const verifyData = await verifyRes.json();
        console.log("🔍 [FRONTEND-LOGIN] Datos de verify completos:", verifyData);
        console.log("🔍 [FRONTEND-LOGIN] verifyData.success:", verifyData.success);
        console.log("🔍 [FRONTEND-LOGIN] verifyData.data:", verifyData.data);
        console.log("🔍 [FRONTEND-LOGIN] verifyData.data?.user:", verifyData.data?.user);
        
        if (verifyData.success && verifyData.data?.user) {
          console.log("✅ [FRONTEND-LOGIN] Usuario verificado exitosamente:", verifyData.data.user);
          localStorage.setItem("user", JSON.stringify(verifyData.data.user));
          setUser(verifyData.data.user);
          navigate("/dashboard", { replace: true });
        } else {
          console.error("❌ [FRONTEND-LOGIN] Fallo en verificación:");
          console.error("  - success:", verifyData.success);
          console.error("  - data:", verifyData.data);
          console.error("  - error:", verifyData.error);
          setError("No se pudo obtener el usuario");
        }
      } catch (err) {
        console.error("💥 [FRONTEND-LOGIN] Error verificando usuario:", err);
        setError("Error verificando usuario tras login");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error de red o del servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#444444",
          display: "flex",
          justifyContent: "center",
          py: 2,
          mb: 3,
        }}
      >
        <img
          src="/logo_blanco.svg"
          alt="Logo"
          style={{ height: 112, objectFit: "contain" }}
        />
      </Box>
      
      <Box
        sx={{
          background: "#222222",
          display: "flex",
          justifyContent: "center",
          mt: 4,
          mb: 12,
        }}
      >
        <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label="Usuario"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              fullWidth
              variant="outlined"
              size="small"
              margin="normal"
              required
            >
              <InputLabel htmlFor="password">Contraseña</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                label="Contraseña"
              />
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  size="small"
                />
              }
              label="Recordarme"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 1 }}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ mt: 1, mb: 1 }}
              onClick={handleGoHome}
            >
              Volver a inicio
            </Button>
          </form>
        </Paper>
      </Box>
    </>
  );
}