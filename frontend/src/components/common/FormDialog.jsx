import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';

/**
 * Dialog genérico para formularios CRUD
 * Acepta cualquier componente de formulario como children
 */
const FormDialog = ({
  open = false,
  onClose,
  title = 'Formulario',
  FormComponent,
  formData = {},
  onSubmit,
  onInputChange,
  isEditing = false,
  loading = false,
  maxWidth = 'sm',
  fullWidth = true
}) => {
  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (onSubmit) {
      const result = await onSubmit(formData);
      // El cierre del dialog lo maneja el componente padre según el resultado
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {title}
        </DialogTitle>
        
        <DialogContent>
          {FormComponent ? (
            <FormComponent
              data={formData}
              onChange={onInputChange}
              isEditing={isEditing}
              loading={loading}
            />
          ) : (
            <Box py={2}>
              <p>No se ha especificado un componente de formulario</p>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormDialog;