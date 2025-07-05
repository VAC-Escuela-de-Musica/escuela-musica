import React, { useState } from 'react';
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
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Email: ${formData.email}\nPassword: ${formData.password}\nRemember: ${formData.remember}`);
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#444444',
        display: 'flex',
        justifyContent: 'center',
        py: 2,
        mb: 3,
      }}
    >
        <img
        src="/logo_blanco.svg"
        alt="Logo"
        style={{ height: 112, objectFit: 'contain' }}
      />
      </Box>
      <Box
  sx={{
    background: '#222222',
    display: 'flex',
    justifyContent: 'center',
    mt: 4,
    mb: 12,
  }}
>
        <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Iniciar Sesión
          </Typography>

          <Alert severity="warning" sx={{ mb: 2 }}>
            Estamos investigando una interrupción del servicio.
          </Alert>

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

            <FormControl fullWidth variant="outlined" size="small" margin="normal" required>
              <InputLabel htmlFor="password">Contraseña</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
            >
              Iniciar Sesión
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
    </>
  );
}
