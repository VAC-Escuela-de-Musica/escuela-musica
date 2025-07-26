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
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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
      // Redirige al usuario
      window.location.href = "/usuario";
    } catch {
      setNotification({
        open: true,
        message: "Error de red o del servidor",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
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
            Iniciar Sesión
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
            
            <Button
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 1 }}
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