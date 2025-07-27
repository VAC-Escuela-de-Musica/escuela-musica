import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Link,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { API_ENDPOINTS, API_HEADERS } from '../../../config/api.js';

const GmailConfig = () => {
  const [config, setConfig] = useState({
    enabled: false,
    user: '',
    password: '',
    fromName: '',
    fromEmail: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.emailConfig.get, {
        headers: API_HEADERS.authOnly(),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setConfig({
            enabled: data.data.enabled || false,
            user: data.data.user || '',
            password: data.data.password || '',
            fromName: data.data.fromName || '',
            fromEmail: data.data.fromEmail || data.data.user || ''
          });
        }
      } else if (response.status === 403) {
        setStatus({ type: 'error', message: 'No tienes permisos de administrador o asistente para ver la configuración de email.' });
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      if (error.message.includes('403')) {
        setStatus({ type: 'error', message: 'No tienes permisos de administrador o asistente para ver la configuración de email.' });
      }
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveConfig = async () => {
    if (!config.user || !config.password || !config.fromName) {
      setStatus({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const configToSave = {
        enabled: config.enabled,
        provider: 'gmail',
        user: config.user,
        password: config.password,
        fromName: config.fromName,
        fromEmail: config.fromEmail,
        host: 'smtp.gmail.com',
        port: '587',
        secure: false,
        requireTLS: true,
        name: 'Gmail',
        instructions: 'Usa tu contraseña de aplicación de Gmail (no tu contraseña normal)',
        helpUrl: 'https://support.google.com/accounts/answer/185833'
      };

      const response = await fetch(API_ENDPOINTS.emailConfig.save, {
        method: 'POST',
        headers: {
          ...API_HEADERS.authOnly(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(configToSave)
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ type: 'success', message: 'Configuración guardada correctamente' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: data.message || 'Error guardando configuración' });
      }
    } catch (error) {
      if (error.message.includes('403')) {
        setStatus({ type: 'error', message: 'No tienes permisos de administrador o asistente para configurar el email. Contacta al administrador del sistema.' });
      } else {
        setStatus({ type: 'error', message: 'Error de conexión' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testConfig = async () => {
    if (!testEmail) {
      setStatus({ type: 'error', message: 'Ingresa un email para la prueba' });
      return;
    }

    setIsTesting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(API_ENDPOINTS.emailConfig.test, {
        method: 'POST',
        headers: {
          ...API_HEADERS.authOnly(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          to: testEmail,
          subject: 'Prueba de Configuración - VAC Escuela de Música',
          content: 'Este es un mensaje de prueba para verificar que la configuración de Gmail funciona correctamente. Si recibes este email, la configuración está funcionando perfectamente.'
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ type: 'success', message: 'Email de prueba enviado correctamente. Revisa tu bandeja de entrada.' });
        setTestEmail('');
      } else {
        setStatus({ type: 'error', message: data.message || 'Error enviando email de prueba' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error de conexión al enviar prueba' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#333333', borderRadius: 2, p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#ffffff', textAlign: 'center' }}>
        📧 Configuración de Gmail
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>🔐 Permisos requeridos:</strong> Solo los administradores y asistentes pueden configurar el servicio de email. 
          Si no puedes ver o modificar la configuración, contacta al administrador del sistema.
        </Typography>
      </Alert>

      <Card sx={{ backgroundColor: '#444444', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            Configuración Básica
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enabled}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" sx={{ color: '#ffffff' }}>
                  Habilitar envío por email
                </Typography>
              }
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email de Gmail"
              value={config.user}
              onChange={(e) => handleConfigChange('user', e.target.value)}
              placeholder="tuemail@gmail.com"
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#666666' },
                  '&:hover fieldset': { borderColor: '#888888' },
                  '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                }
              }}
            />

            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Contraseña de Aplicación"
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => handleConfigChange('password', e.target.value)}
                placeholder="Tu contraseña de aplicación"
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: '#666666' },
                    '&:hover fieldset': { borderColor: '#888888' },
                    '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                  }
                }}
              />
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#ffffff'
                }}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>

            <TextField
              label="Nombre del Remitente"
              value={config.fromName}
              onChange={(e) => handleConfigChange('fromName', e.target.value)}
              placeholder="VAC Escuela de Música"
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#666666' },
                  '&:hover fieldset': { borderColor: '#888888' },
                  '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                }
              }}
            />

            <TextField
              label="Email del Remitente"
              value={config.fromEmail}
              onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
              placeholder="tuemail@gmail.com"
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#666666' },
                  '&:hover fieldset': { borderColor: '#888888' },
                  '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                }
              }}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveConfig}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SettingsIcon />}
              sx={{ minWidth: 150 }}
            >
              {isLoading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>

            <Tooltip title="¿Cómo obtener una contraseña de aplicación?">
              <Button
                variant="outlined"
                color="info"
                component={Link}
                href="https://support.google.com/accounts/answer/185833"
                target="_blank"
                startIcon={<HelpIcon />}
                sx={{ color: '#2196F3', borderColor: '#2196F3' }}
              >
                Ayuda
              </Button>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ backgroundColor: '#444444' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SendIcon />
            Probar Configuración
          </Typography>

          <Typography variant="body2" sx={{ color: '#cccccc', mb: 2 }}>
            Envía un email de prueba para verificar que la configuración funciona correctamente
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Email de prueba"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              sx={{
                flex: 1,
                minWidth: 250,
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#666666' },
                  '&:hover fieldset': { borderColor: '#888888' },
                  '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                }
              }}
            />

            <Button
              variant="contained"
              color="success"
              onClick={testConfig}
              disabled={isTesting || !config.enabled}
              startIcon={isTesting ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ minWidth: 150 }}
            >
              {isTesting ? 'Enviando...' : 'Enviar Prueba'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {status.message && (
        <Alert 
          severity={status.type} 
          sx={{ mt: 2 }}
          icon={status.type === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
        >
          {status.message}
        </Alert>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>💡 Importante:</strong> Para usar Gmail, necesitas generar una 
          <strong> contraseña de aplicación</strong>. No uses tu contraseña normal de Gmail.
          Haz clic en "Ayuda" para ver cómo generarla.
        </Typography>
      </Alert>
    </Box>
  );
};

export default GmailConfig; 