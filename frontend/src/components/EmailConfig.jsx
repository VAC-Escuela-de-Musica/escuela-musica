import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Email as EmailIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import messagingService from '../services/messagingService';

const EmailConfig = () => {
  const [emailConfig, setEmailConfig] = useState({
    enabled: false,
    provider: 'gmail',
    host: '',
    port: '',
    secure: true,
    user: '',
    password: '',
    fromName: '',
    fromEmail: ''
  });

  const [emailTemplates, setEmailTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: ''
  });
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadEmailConfig();
    loadEmailTemplates();
  }, []);

  const loadEmailConfig = async () => {
    try {
      const response = await messagingService.getEmailConfig();
      if (response.success) {
        setEmailConfig(response.data);
      }
    } catch (error) {
      console.error('Error cargando configuración de email:', error);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const response = await messagingService.getEmailTemplates();
      if (response.success) {
        setEmailTemplates(response.data);
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    }
  };

  const handleConfigChange = (field, value) => {
    setEmailConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProviderChange = (provider) => {
    const configs = {
      gmail: { host: 'smtp.gmail.com', port: '587', secure: true },
      outlook: { host: 'smtp-mail.outlook.com', port: '587', secure: true },
      yahoo: { host: 'smtp.mail.yahoo.com', port: '587', secure: true },
      custom: { host: '', port: '', secure: true }
    };

    setEmailConfig(prev => ({
      ...prev,
      provider,
      ...configs[provider]
    }));
  };

  const saveEmailConfig = async () => {
    setIsLoading(true);
    try {
      const response = await messagingService.saveEmailConfig(emailConfig);
      if (response.success) {
        setStatus({ type: 'success', message: 'Configuración guardada correctamente' });
      } else {
        setStatus({ type: 'error', message: response.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error guardando configuración' });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConfig = async () => {
    if (!testEmail) {
      setStatus({ type: 'error', message: 'Ingresa un email para la prueba' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await messagingService.testEmailConfig({
        to: testEmail,
        subject: 'Prueba de Configuración - GPS',
        content: 'Este es un mensaje de prueba para verificar que la configuración de email funciona correctamente.'
      });

      if (response.success) {
        setStatus({ type: 'success', message: 'Email de prueba enviado correctamente' });
        setTestEmail('');
      } else {
        setStatus({ type: 'error', message: response.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error enviando email de prueba' });
    } finally {
      setIsLoading(false);
    }
  };

  const addEmailTemplate = () => {
    setEditingTemplate(null);
    setNewTemplate({ name: '', subject: '', content: '' });
    setOpenTemplateDialog(true);
  };

  const editEmailTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate(template);
    setOpenTemplateDialog(true);
  };

  const deleteEmailTemplate = async (templateId) => {
    try {
      const response = await messagingService.deleteEmailTemplate(templateId);
      if (response.success) {
        loadEmailTemplates();
        setStatus({ type: 'success', message: 'Plantilla eliminada correctamente' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error eliminando plantilla' });
    }
  };

  const saveEmailTemplate = async () => {
    try {
      const response = editingTemplate
        ? await messagingService.updateEmailTemplate(editingTemplate.id, newTemplate)
        : await messagingService.addEmailTemplate(newTemplate);

      if (response.success) {
        setOpenTemplateDialog(false);
        loadEmailTemplates();
        setStatus({ type: 'success', message: 'Plantilla guardada correctamente' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error guardando plantilla' });
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#222222', minHeight: '100vh', color: '#ffffff' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <EmailIcon sx={{ fontSize: 40, color: '#2196F3' }} />
        <Typography variant="h4" component="h1">
          Configuración de Email
        </Typography>
      </Box>

      {/* Alert de estado */}
      {status.message && (
        <Alert 
          severity={status.type} 
          sx={{ mb: 3 }}
          onClose={() => setStatus({ type: '', message: '' })}
        >
          {status.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Configuración de SMTP */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: '#333333' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
              <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Configuración SMTP
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={emailConfig.enabled}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2196F3' } }}
                />
              }
              label="Habilitar envío de emails"
              sx={{ color: '#ffffff', mb: 2 }}
            />

            {emailConfig.enabled && (
              <>
                <TextField
                  select
                  fullWidth
                  label="Proveedor de Email"
                  value={emailConfig.provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook/Hotmail</option>
                  <option value="yahoo">Yahoo</option>
                  <option value="custom">Personalizado</option>
                </TextField>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Servidor SMTP"
                      value={emailConfig.host}
                      onChange={(e) => handleConfigChange('host', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Puerto"
                      value={emailConfig.port}
                      onChange={(e) => handleConfigChange('port', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
                    />
                  </Grid>
                </Grid>

                <FormControlLabel
                  control={
                    <Switch
                      checked={emailConfig.secure}
                      onChange={(e) => handleConfigChange('secure', e.target.checked)}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2196F3' } }}
                    />
                  }
                  label="Conexión segura (TLS/SSL)"
                  sx={{ color: '#ffffff', mt: 1 }}
                />

                <Divider sx={{ my: 2, borderColor: '#666666' }} />

                <TextField
                  fullWidth
                  label="Email"
                  value={emailConfig.user}
                  onChange={(e) => handleConfigChange('user', e.target.value)}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Contraseña de aplicación"
                  value={emailConfig.password}
                  onChange={(e) => handleConfigChange('password', e.target.value)}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
                />

                <TextField
                  fullWidth
                  label="Nombre del remitente"
                  value={emailConfig.fromName}
                  onChange={(e) => handleConfigChange('fromName', e.target.value)}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
                />

                <TextField
                  fullWidth
                  label="Email del remitente"
                  value={emailConfig.fromEmail}
                  onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
                />

                <Button
                  variant="contained"
                  onClick={saveEmailConfig}
                  disabled={isLoading}
                  sx={{ 
                    backgroundColor: '#2196F3',
                    '&:hover': { backgroundColor: '#1976D2' }
                  }}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Prueba de configuración */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: '#333333' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
              <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Prueba de Configuración
            </Typography>

            <TextField
              fullWidth
              label="Email de prueba"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="destinatario@email.com"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
            />

            <Button
              variant="contained"
              onClick={testEmailConfig}
              disabled={!emailConfig.enabled || !testEmail || isLoading}
              sx={{ 
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#45a049' }
              }}
            >
              {isLoading ? 'Enviando...' : 'Enviar Email de Prueba'}
            </Button>

            <Box sx={{ mt: 2, p: 2, backgroundColor: '#444444', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: '#cccccc' }}>
                💡 Para Gmail, usa una contraseña de aplicación en lugar de tu contraseña normal.
                <br />
                🔒 La contraseña de aplicación es más segura y necesaria si tienes 2FA habilitado.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Plantillas de Email */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, backgroundColor: '#333333' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#ffffff' }}>
                Plantillas de Email
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addEmailTemplate}
                sx={{ 
                  backgroundColor: '#FF9800',
                  '&:hover': { backgroundColor: '#F57C00' }
                }}
              >
                Agregar Plantilla
              </Button>
            </Box>

            <List>
              {emailTemplates.map((template) => (
                <ListItem key={template.id} sx={{ border: '1px solid #666666', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={template.name}
                    secondary={`Asunto: ${template.subject}`}
                    sx={{ color: '#ffffff' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => editEmailTemplate(template)}
                      sx={{ color: '#2196F3', mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteEmailTemplate(template.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {emailTemplates.length === 0 && (
              <Typography variant="body2" sx={{ color: '#cccccc', textAlign: 'center', py: 3 }}>
                No hay plantillas configuradas. Crea una nueva plantilla para empezar.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog para plantillas */}
      <Dialog 
        open={openTemplateDialog} 
        onClose={() => setOpenTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#333333', color: '#ffffff' }}>
          {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#333333', color: '#ffffff' }}>
          <TextField
            fullWidth
            label="Nombre de la plantilla"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            sx={{ mb: 2, mt: 1, '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
          />
          <TextField
            fullWidth
            label="Asunto del email"
            value={newTemplate.subject}
            onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Contenido del email"
            value={newTemplate.content}
            onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
            placeholder="Escribe el contenido del email aquí..."
            sx={{ '& .MuiOutlinedInput-root': { color: '#ffffff' } }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#333333' }}>
          <Button 
            onClick={() => setOpenTemplateDialog(false)}
            sx={{ color: '#ffffff' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={saveEmailTemplate}
            variant="contained"
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45a049' }
            }}
          >
            Guardar Plantilla
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailConfig; 