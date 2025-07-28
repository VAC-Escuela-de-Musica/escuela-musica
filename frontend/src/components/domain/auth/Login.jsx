import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, API_HEADERS } from "../../../config/api";
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
  Link,
  Alert,
  Divider,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import School from '@mui/icons-material/School';
import Notification from '../../common/Notification';

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'error' });
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
    setNotification({ ...notification, open: false });
    setLoading(true);
    
    try {
      console.log("[Login] Enviando login", formData.email);
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: API_HEADERS.basic,
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: "include",
      });
      
      const data = await response.json();
      console.log("[Login] Respuesta login:", data);
      
      if (!response.ok) {
        setNotification({
          open: true,
          message: data.message || "Error al iniciar sesión",
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      localStorage.setItem("token", data.data.accessToken);
      console.log("[Login] Token guardado en localStorage:", data.data.accessToken);
      
      try {
        const verifyHeaders = API_HEADERS.withAuth();
        console.log("[Login] Headers para /api/auth/verify:", verifyHeaders);
        const verifyRes = await fetch(API_ENDPOINTS.auth.verify, {
          method: "GET",
          headers: verifyHeaders,
          credentials: "include"
        });
        
        const verifyData = await verifyRes.json();
        console.log("[Login] Respuesta de /api/auth/verify:", verifyData);
        
        if (verifyData.success && verifyData.data?.user) {
          const user = verifyData.data.user;
          console.log("[Login] Usuario verificado:", user);
          
          // Verificar si el usuario es un estudiante
          const isStudent = user.roles?.some(role => 
            typeof role === 'string' ? 
              role === 'student' || role === 'estudiante' : 
              role.name === 'student' || role.name === 'estudiante'
          );
          
          if (isStudent) {
            setNotification({
              open: true,
              message: "Acceso denegado. Los estudiantes deben usar el acceso de estudiantes. Por favor, ve a la página de acceso de estudiantes.",
              severity: 'warning'
            });
            localStorage.removeItem("token");
            console.warn("[Login] Usuario es estudiante, acceso denegado:", user.roles);
            setLoading(false);
            return;
          }
          
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
          navigate("/usuario", { replace: true });
        } else {
          setNotification({
            open: true,
            message: "No se pudo obtener el usuario",
            severity: 'error'
          });
          console.error("[Login] Error verificando usuario tras login:", verifyData);
        }
      } catch (err) {
        setNotification({
          open: true,
          message: "Error verificando usuario tras login",
          severity: 'error'
        });
        console.error("[Login] Error en fetch /api/auth/verify:", err);
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Error de red o del servidor",
        severity: 'error'
      });
      console.error("[Login] Error de red o servidor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoToStudentLogin = () => {
    navigate("/login-estudiante");
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
            Acceso Administrativo
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tus credenciales para acceder al área administrativa
          </Typography>

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
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                O
              </Typography>
            </Divider>
            
            <Button
              type="button"
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mb: 1 }}
              onClick={handleGoToStudentLogin}
              startIcon={<School />}
            >
              Acceso Estudiantes
            </Button>
            
            <Button
              type="button"
              variant="text"
              color="primary"
              fullWidth
              onClick={handleGoHome}
            >
              Volver a inicio
            </Button>
          </form>
        </Paper>
      </Box>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </>
  );
}