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
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link
} from '@mui/material';
import {
  Email as EmailIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import messagingService from '../../../services/messagingService.js';

const EmailConfig = () => {
  const [emailConfig, setEmailConfig] = useState({
    enabled: false,
    provider: 'gmail',
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Configuraciones automáticas por proveedor
  const providerConfigs = {
    gmail: {
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: '587',
      secure: false,
      requireTLS: true,
      instructions: 'Usa tu contraseña de aplicación de Gmail (no tu contraseña normal)',
      helpUrl: 'https://support.google.com/accounts/answer/185833'
    },
    outlook: {
      name: 'Outlook/Hotmail',
      host: 'smtp-mail.outlook.com',
      port: '587',
      secure: false,
      requireTLS: true,
      instructions: 'Usa tu contraseña de aplicación de Microsoft',
      helpUrl: 'https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944'
    },
    yahoo: {
      name: 'Yahoo Mail',
      host: 'smtp.mail.yahoo.com',
      port: '587',
      secure: false,
      requireTLS: true,
      instructions: 'Usa tu contraseña de aplicación de Yahoo',
      helpUrl: 'https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html'
    },
    custom: {
      name: 'Otro proveedor',
      host: '',
      port: '',
      secure: true,
      instructions: 'Configuración manual para otros proveedores',
      helpUrl: ''
    }
  };

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
    const config = providerConfigs[provider];
    setEmailConfig(prev => ({
      ...prev,
      provider,
      host: config.host,
      port: config.port,
      secure: config.secure
    }));
  };

  const saveEmailConfig = async () => {
    if (!emailConfig.user || !emailConfig.password || !emailConfig.fromName || !emailConfig.fromEmail) {
      setStatus({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
      return;
    }

    setIsLoading(true);
    try {
      const configToSave = {
        ...emailConfig,
        ...providerConfigs[emailConfig.provider]
      };
      
      const response = await messagingService.saveEmailConfig(configToSave);
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

  const currentProvider = providerConfigs[emailConfig.provider];

  return (
    <Box sx={{ p: 3, backgroundColor: '#222222', minHeight: '100vh', color: '#ffffff' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <EmailIcon sx={{ fontSize: 40, color: '#2196F3' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
            Configuración de Email
          </Typography>
          <Typography variant="body2" sx={{ color: '#cccccc' }}>
            Configura el envío de emails desde tu cuenta
          </Typography>
        </Box>
      </Box>

      {/* Status Alert */}
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
        {/* Configuración Principal */}
        <Grid>
          <Paper sx={{ p: 3, backgroundColor: '#333333', color: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SettingsIcon sx={{ color: '#2196F3' }} />
              <Typography variant="h6">Configuración Básica</Typography>
            </Box>

            {/* Habilitar/Deshabilitar */}
            <FormControlLabel
              control={
                <Switch
                  checked={emailConfig.enabled}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2196F3' } }}
                />
              }
              label="Habilitar envío de emails"
              sx={{ mb: 3 }}
            />

            {emailConfig.enabled && (
              <>
                {/* Proveedor de Email */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: '#cccccc' }}>Proveedor de Email</InputLabel>
                  <Select
                    value={emailConfig.provider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    sx={{ 
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555555' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                    }}
                  >
                    <MenuItem value="gmail">Gmail</MenuItem>
                    <MenuItem value="outlook">Outlook/Hotmail</MenuItem>
                    <MenuItem value="yahoo">Yahoo Mail</MenuItem>
                    <MenuItem value="custom">Otro proveedor</MenuItem>
                  </Select>
                </FormControl>

                {/* Información del proveedor */}
                <Card sx={{ mb: 3, backgroundColor: '#444444' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <SecurityIcon sx={{ color: '#FF9800' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {currentProvider.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#cccccc', mb: 2 }}>
                      {currentProvider.instructions}
                    </Typography>
                    {currentProvider.helpUrl && (
                      <Link 
                        href={currentProvider.helpUrl} 
                        target="_blank" 
                        rel="noopener"
                        sx={{ color: '#2196F3', textDecoration: 'none' }}
                      >
                        📖 Ver instrucciones paso a paso
                      </Link>
                    )}
                  </CardContent>
                </Card>

                {/* Campos de configuración */}
                <Grid container spacing={2}>
                  <Grid>
                    <TextField
                      fullWidth
                      label="Email del remitente"
                      value={emailConfig.user}
                      onChange={(e) => handleConfigChange('user', e.target.value)}
                      placeholder="tu-email@gmail.com"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#555555' },
                          '&:hover fieldset': { borderColor: '#2196F3' },
                          '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                        },
                        '& .MuiInputLabel-root': { color: '#cccccc' },
                        '& .MuiInputBase-input': { color: '#ffffff' }
                      }}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      label="Contraseña de aplicación"
                      type="password"
                      value={emailConfig.password}
                      onChange={(e) => handleConfigChange('password', e.target.value)}
                      placeholder="Contraseña de aplicación"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#555555' },
                          '&:hover fieldset': { borderColor: '#2196F3' },
                          '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                        },
                        '& .MuiInputLabel-root': { color: '#cccccc' },
                        '& .MuiInputBase-input': { color: '#ffffff' }
                      }}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      label="Nombre del remitente"
                      value={emailConfig.fromName}
                      onChange={(e) => handleConfigChange('fromName', e.target.value)}
                      placeholder="Tu Nombre"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#555555' },
                          '&:hover fieldset': { borderColor: '#2196F3' },
                          '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                        },
                        '& .MuiInputLabel-root': { color: '#cccccc' },
                        '& .MuiInputBase-input': { color: '#ffffff' }
                      }}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      label="Email de respuesta"
                      value={emailConfig.fromEmail}
                      onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
                      placeholder="respuesta@tudominio.com"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#555555' },
                          '&:hover fieldset': { borderColor: '#2196F3' },
                          '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                        },
                        '& .MuiInputLabel-root': { color: '#cccccc' },
                        '& .MuiInputBase-input': { color: '#ffffff' }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Configuración avanzada */}
                <Accordion 
                  sx={{ 
                    mt: 3, 
                    backgroundColor: '#444444',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cccccc' }} />}>
                    <Typography sx={{ color: '#ffffff' }}>
                      ⚙️ Configuración Avanzada (Opcional)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: '#cccccc', mb: 2 }}>
                      Solo modifica estos valores si tu proveedor lo requiere específicamente.
                    </Typography>
                    <Grid container spacing={2}>
                  <Grid>
                        <TextField
                          fullWidth
                          label="Servidor SMTP"
                          value={currentProvider.host}
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#555555' }
                            },
                            '& .MuiInputLabel-root': { color: '#cccccc' },
                            '& .MuiInputBase-input': { color: '#888888' }
                          }}
                        />
                      </Grid>
                  <Grid>
                        <TextField
                          fullWidth
                          label="Puerto"
                          value={currentProvider.port}
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#555555' }
                            },
                            '& .MuiInputLabel-root': { color: '#cccccc' },
                            '& .MuiInputBase-input': { color: '#888888' }
                          }}
                        />
                      </Grid>
                  <Grid>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={currentProvider.secure}
                              disabled
                              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2196F3' } }}
                            />
                          }
                          label="Conexión segura (SSL/TLS)"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Botones de acción */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
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
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Panel de Prueba */}
        <Grid>
          <Paper sx={{ p: 3, backgroundColor: '#333333', color: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SendIcon sx={{ color: '#4CAF50' }} />
              <Typography variant="h6">Probar Configuración</Typography>
            </Box>

            <TextField
              fullWidth
              label="Email de prueba"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555555' },
                  '&:hover fieldset': { borderColor: '#4CAF50' },
                  '&.Mui-focused fieldset': { borderColor: '#4CAF50' }
                },
                '& .MuiInputLabel-root': { color: '#cccccc' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={testEmailConfig}
              disabled={isLoading || !emailConfig.enabled}
              sx={{
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#388E3C' },
                '&:disabled': { backgroundColor: '#666666' }
              }}
            >
              {isLoading ? 'Enviando...' : 'Enviar Email de Prueba'}
            </Button>

            {!emailConfig.enabled && (
              <Typography variant="body2" sx={{ color: '#FF9800', mt: 1, textAlign: 'center' }}>
                Habilita el email primero para poder probar
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Plantillas de Email */}
      <Paper sx={{ p: 3, mt: 3, backgroundColor: '#333333', color: '#ffffff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ color: '#FF9800' }} />
            <Typography variant="h6">Plantillas de Email</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addEmailTemplate}
            sx={{
              backgroundColor: '#FF9800',
              '&:hover': { backgroundColor: '#F57C00' }
            }}
          >
            Nueva Plantilla
          </Button>
        </Box>

        {emailTemplates.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#cccccc', textAlign: 'center', py: 4 }}>
            No hay plantillas configuradas. Crea una para empezar.
          </Typography>
        ) : (
          <List>
            {emailTemplates.map((template) => (
              <ListItem
                key={template.id}
                sx={{
                  backgroundColor: '#444444',
                  mb: 1,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: '#555555' }
                }}
              >
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
        )}
      </Paper>

      {/* Dialog para Plantillas */}
      <Dialog 
        open={openTemplateDialog} 
        onClose={() => setOpenTemplateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#333333', color: '#ffffff' }
        }}
      >
        <DialogTitle>
          {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid>
              <TextField
                fullWidth
                label="Nombre de la plantilla"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#555555' },
                    '&:hover fieldset': { borderColor: '#2196F3' },
                    '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                  },
                  '& .MuiInputLabel-root': { color: '#cccccc' },
                  '& .MuiInputBase-input': { color: '#ffffff' }
                }}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                label="Asunto del email"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#555555' },
                    '&:hover fieldset': { borderColor: '#2196F3' },
                    '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                  },
                  '& .MuiInputLabel-root': { color: '#cccccc' },
                  '& .MuiInputBase-input': { color: '#ffffff' }
                }}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Contenido del email"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Escribe el contenido del email aquí. Puedes usar variables como {{nombre}}, {{email}}, etc."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#555555' },
                    '&:hover fieldset': { borderColor: '#2196F3' },
                    '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                  },
                  '& .MuiInputLabel-root': { color: '#cccccc' },
                  '& .MuiInputBase-input': { color: '#ffffff' }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenTemplateDialog(false)}
            sx={{ color: '#cccccc' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={saveEmailTemplate}
            variant="contained"
            sx={{
              backgroundColor: '#2196F3',
              '&:hover': { backgroundColor: '#1976D2' }
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