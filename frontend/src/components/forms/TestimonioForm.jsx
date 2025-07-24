import React from 'react';
import { TextField, Box } from '@mui/material';

/**
 * Formulario específico para testimonios
 * Componente reutilizable que puede ser usado en cualquier contexto
 */
const TestimonioForm = ({ 
  data = {}, 
  onChange, 
  isEditing = false, 
  loading = false 
}) => {
  // Manejador de cambios en los inputs
  const handleInputChange = (field, value) => {
    if (onChange) {
      onChange({ [field]: value });
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Nombre"
        value={data.nombre || ''}
        onChange={(e) => handleInputChange('nombre', e.target.value)}
        margin="normal"
        required
        disabled={loading}
        placeholder="Nombre de la persona"
      />
      
      <TextField
        fullWidth
        label="Cargo"
        value={data.cargo || ''}
        onChange={(e) => handleInputChange('cargo', e.target.value)}
        margin="normal"
        disabled={loading}
        placeholder="Cargo o profesión"
      />
      
      <TextField
        fullWidth
        label="Opinión"
        value={data.opinion || ''}
        onChange={(e) => handleInputChange('opinion', e.target.value)}
        margin="normal"
        multiline
        rows={4}
        required
        disabled={loading}
        placeholder="Escribe aquí la opinión o testimonio..."
      />
      
      <TextField
        fullWidth
        label="URL de Foto"
        value={data.foto || ''}
        onChange={(e) => handleInputChange('foto', e.target.value)}
        margin="normal"
        type="url"
        disabled={loading}
        placeholder="https://ejemplo.com/imagen.jpg"
        helperText="URL de la imagen del perfil (opcional)"
      />
      
      <TextField
        fullWidth
        label="Calificación"
        value={data.rating || ''}
        onChange={(e) => handleInputChange('rating', parseInt(e.target.value) || '')}
        margin="normal"
        type="number"
        inputProps={{ min: 1, max: 5 }}
        disabled={loading}
        placeholder="1-5"
        helperText="Calificación del 1 al 5 (opcional)"
      />
    </Box>
  );
};

export default TestimonioForm;