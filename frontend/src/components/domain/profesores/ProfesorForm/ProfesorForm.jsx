import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";

const ProfesorForm = ({ profesor, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    rut: "",
    email: "",
    numero: "",
    password: "",
    fechaContrato: new Date(),
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profesor) {
      setIsEditing(true);
      setFormData({
        nombre: profesor.nombre || "",
        apellidos: profesor.apellidos || "",
        rut: profesor.rut || "",
        email: profesor.email || "",
        numero: profesor.numero || "",
        password: "", // No mostrar contraseña existente

        fechaContrato: profesor.fechaContrato ? new Date(profesor.fechaContrato) : new Date(),
        activo: profesor.activo !== undefined ? profesor.activo : true,
      });
    }
  }, [profesor]);

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios";
    } else if (formData.apellidos.length < 2) {
      newErrors.apellidos = "Los apellidos deben tener al menos 2 caracteres";
    }

    // Validar RUT
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    if (!formData.rut.trim()) {
      newErrors.rut = "El RUT es obligatorio";
    } else if (!rutRegex.test(formData.rut)) {
      newErrors.rut = "El RUT debe tener el formato 12.345.678-9";
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    // Validar número
    const numeroRegex = /^\+?\d{9,15}$/;
    if (!formData.numero.trim()) {
      newErrors.numero = "El número de teléfono es obligatorio";
    } else if (!numeroRegex.test(formData.numero)) {
      newErrors.numero = "El teléfono debe contener solo números y puede iniciar con +";
    }

    // Validar contraseña (solo para nuevos profesores o si se está cambiando)
    if (!isEditing || formData.password) {
      if (!formData.password) {
        newErrors.password = "La contraseña es obligatoria";
      } else if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }
    }



    // Validar fecha de contrato
    if (!formData.fechaContrato) {
      newErrors.fechaContrato = "La fecha de contrato es obligatoria";
    } else if (formData.fechaContrato > new Date()) {
      newErrors.fechaContrato = "La fecha de contrato no puede ser futura";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        fechaContrato: formData.fechaContrato.toISOString(),
      };

      // Si es edición y no se cambió la contraseña, no enviarla
      if (isEditing && !formData.password) {
        delete submitData.password;
      }

      onSubmit(submitData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const formatRut = (value) => {
    // Eliminar todos los caracteres no numéricos excepto k y K
    let rut = value.replace(/[^0-9kK]/g, "");
    
    // Si no hay dígito verificador, no formatear
    if (rut.length <= 1) return rut;
    
    // Separar número y dígito verificador
    const dv = rut.slice(-1);
    const numero = rut.slice(0, -1);
    
    // Formatear número con puntos
    let numeroFormateado = "";
    for (let i = numero.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) {
        numeroFormateado = "." + numeroFormateado;
      }
      numeroFormateado = numero[i] + numeroFormateado;
    }
    
    return numeroFormateado + "-" + dv;
  };

  const handleRutChange = (e) => {
    const formattedRut = formatRut(e.target.value);
    handleChange("rut", formattedRut);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEditing ? "Editar Profesor" : "Crear Nuevo Profesor"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Nombre */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                error={!!errors.nombre}
                helperText={errors.nombre}
                required
              />
            </Grid>

            {/* Apellidos */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellidos"
                value={formData.apellidos}
                onChange={(e) => handleChange("apellidos", e.target.value)}
                error={!!errors.apellidos}
                helperText={errors.apellidos}
                required
              />
            </Grid>

            {/* RUT */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUT"
                value={formData.rut}
                onChange={handleRutChange}
                error={!!errors.rut}
                helperText={errors.rut || "Formato: 12.345.678-9"}
                required
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            {/* Número de teléfono */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de teléfono"
                value={formData.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                error={!!errors.numero}
                helperText={errors.numero || "Ej: +56912345678"}
                required
              />
            </Grid>

            {/* Contraseña */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                required={!isEditing}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>



            {/* Fecha de contrato */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de contrato"
                value={formData.fechaContrato}
                onChange={(newValue) => handleChange("fechaContrato", newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.fechaContrato}
                    helperText={errors.fechaContrato}
                    required
                  />
                )}
              />
            </Grid>

            {/* Estado activo */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.activo}
                  onChange={(e) => handleChange("activo", e.target.value)}
                  label="Estado"
                >
                  <MenuItem value={true}>Activo</MenuItem>
                  <MenuItem value={false}>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Botones */}
          <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear")}
            </Button>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ProfesorForm; 