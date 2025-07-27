import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  QrCode as QrCodeIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  PowerSettingsNew as PowerIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { API_ENDPOINTS, API_HEADERS } from '../../../config/api.js';
import QRCode from 'qrcode';
import { useAuth } from '../../../context/AuthContext.jsx';
import UnauthorizedAccess from '../../common/UnauthorizedAccess.jsx';

const WhatsAppConfig = () => {
  const { isAdmin, isAssistant } = useAuth();

  // Verificar permisos de acceso (solo admin y asistente pueden configurar WhatsApp)
  if (!isAdmin() && !isAssistant()) {
    return (
      <UnauthorizedAccess 
        title="Configuración Restringida"
        message="Solo administradores y asistentes pueden configurar WhatsApp."
        suggestion="Contacta al administrador para cambios de configuración."
        icon={<WhatsAppIcon fontSize="large" />}
        color="error"
      />
    );
  }

  const [status, setStatus] = useState('not_initialized');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [hasQR, setHasQR] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(API_ENDPOINTS.whatsapp.status, {
        method: 'GET',
        headers: API_HEADERS.authOnly()
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
        setConnectionInfo(data.info);
        setHasQR(data.hasQR || false);
      } else {
        setError(data.message || 'Error al verificar estado');
      }
    } catch (err) {
      setError('Error de conexión al verificar estado');
      console.error('Error checking WhatsApp status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWhatsApp = async () => {
    try {
      setIsInitializing(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(API_ENDPOINTS.whatsapp.initialize, {
        method: 'POST',
        headers: API_HEADERS.authOnly()
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        setStatus(data.status);
        
        // Verificar estado después de un breve delay
        setTimeout(() => {
          checkStatus();
        }, 2000);
      } else {
        setError(data.message || 'Error al inicializar WhatsApp');
      }
    } catch (err) {
      setError('Error de conexión al inicializar WhatsApp');
      console.error('Error initializing WhatsApp:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const getQRCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(API_ENDPOINTS.whatsapp.qr, {
        method: 'GET',
        headers: API_HEADERS.authOnly()
      });

      const data = await response.json();
      
      if (data.success && data.qr) {
        // Generar imagen QR
        const qrImage = await QRCode.toDataURL(data.qr, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCode(qrImage);
        setShowQRDialog(true);
      } else {
        setError(data.message || 'No hay código QR disponible');
      }
    } catch (err) {
      setError('Error de conexión al obtener código QR');
      console.error('Error getting QR code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(API_ENDPOINTS.whatsapp.disconnect, {
        method: 'POST',
        headers: API_HEADERS.authOnly()
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        setStatus('not_initialized');
        setConnectionInfo(null);
      } else {
        setError(data.message || 'Error al desconectar WhatsApp');
      }
    } catch (err) {
      setError('Error de conexión al desconectar WhatsApp');
      console.error('Error disconnecting WhatsApp:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setIsSendingTest(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(API_ENDPOINTS.whatsapp.test, {
        method: 'POST',
        headers: {
          ...API_HEADERS.authOnly(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testPhone,
          testMessage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Mensaje de prueba enviado correctamente');
        setTestPhone('');
        setTestMessage('');
      } else {
        setError(data.message || 'Error al enviar mensaje de prueba');
      }
    } catch (err) {
      setError('Error de conexión al enviar mensaje de prueba');
      console.error('Error sending test message:', err);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'initializing':
        return 'warning';
      case 'not_initialized':
        return 'default';
      default:
        return 'error';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon />;
      case 'initializing':
        return <CircularProgress size={20} />;
      case 'not_initialized':
        return <PowerIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'Conectado';
      case 'initializing':
        return 'Inicializando...';
      case 'not_initialized':
        return 'No inicializado';
      default:
        return 'Error';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WhatsAppIcon color="success" />
        Configuración de WhatsApp
      </Typography>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Estado de conexión */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de Conexión
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  icon={getStatusIcon()}
                  label={getStatusText()}
                  color={getStatusColor()}
                  variant="outlined"
                />
                
                <Tooltip title="Actualizar estado">
                  <IconButton onClick={checkStatus} disabled={isLoading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {connectionInfo && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Número:</strong> {connectionInfo.wid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Plataforma:</strong> {connectionInfo.platform}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nombre:</strong> {connectionInfo.pushname}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {status === 'not_initialized' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={initializeWhatsApp}
                    disabled={isInitializing}
                  >
                    {isInitializing ? 'Inicializando...' : 'Inicializar WhatsApp'}
                  </Button>
                )}

                {status === 'initializing' && hasQR && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<QrCodeIcon />}
                    onClick={getQRCode}
                    disabled={isLoading}
                  >
                    Ver Código QR
                  </Button>
                )}

                {status === 'ready' && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<PowerIcon />}
                    onClick={disconnectWhatsApp}
                    disabled={isLoading}
                  >
                    Desconectar
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mensaje de prueba */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mensaje de Prueba
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Envía un mensaje de prueba para verificar que WhatsApp funciona correctamente.
              </Typography>

              <TextField
                fullWidth
                label="Número de teléfono"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+56912345678"
                sx={{ mb: 2 }}
                disabled={status !== 'ready'}
              />

              <TextField
                fullWidth
                label="Mensaje"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Mensaje de prueba"
                multiline
                rows={3}
                sx={{ mb: 2 }}
                disabled={status !== 'ready'}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={sendTestMessage}
                disabled={status !== 'ready' || isSendingTest || !testPhone || !testMessage}
                fullWidth
              >
                {isSendingTest ? 'Enviando...' : 'Enviar Mensaje de Prueba'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instrucciones */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Instrucciones de Configuración
          </Typography>
          
          <Typography variant="body2" paragraph>
            1. <strong>Inicializar WhatsApp:</strong> Haz clic en "Inicializar WhatsApp" para comenzar el proceso de conexión.
          </Typography>
          
          <Typography variant="body2" paragraph>
            2. <strong>Escaneo de QR:</strong> Si es la primera vez, se generará un código QR que deberás escanear con tu WhatsApp.
          </Typography>
          
          <Typography variant="body2" paragraph>
            3. <strong>Autenticación:</strong> Una vez escaneado, WhatsApp se conectará automáticamente y mostrará "Conectado".
          </Typography>
          
          <Typography variant="body2" paragraph>
            4. <strong>Prueba:</strong> Usa la sección de mensaje de prueba para verificar que todo funciona correctamente.
          </Typography>
          
                     <Alert severity="info" sx={{ mt: 2 }}>
             <strong>Nota:</strong> El número de teléfono debe incluir el código de país (+56 para Chile) y no debe incluir espacios ni guiones.
           </Alert>
         </CardContent>
       </Card>

       {/* Dialog para mostrar QR */}
       <Dialog 
         open={showQRDialog} 
         onClose={() => setShowQRDialog(false)}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle sx={{ textAlign: 'center' }}>
           <QrCodeIcon sx={{ fontSize: 40, color: '#25D366', mb: 1 }} />
           <Typography variant="h6" component="span">
             Código QR para Autenticación
           </Typography>
         </DialogTitle>
         <DialogContent sx={{ textAlign: 'center' }}>
           <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
             Sigue estos pasos para autenticar WhatsApp Web:
           </Typography>
           <ol style={{ textAlign: 'left', marginBottom: '20px' }}>
             <li>Abre WhatsApp en tu teléfono</li>
             <li>Ve a Configuración → Dispositivos Vinculados</li>
             <li>Escanea el código QR que aparece abajo</li>
             <li>Confirma la vinculación en tu teléfono</li>
           </ol>
           
           {qrCode && (
             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
               <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2, border: '2px solid #25D366' }}>
                 <img 
                   src={qrCode} 
                   alt="Código QR WhatsApp" 
                   style={{ width: '250px', height: '250px' }}
                 />
               </Box>
             </Box>
           )}
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setShowQRDialog(false)}>
             Cerrar
           </Button>
           <Button 
             onClick={getQRCode}
             variant="contained"
             color="primary"
           >
             Actualizar QR
           </Button>
         </DialogActions>
       </Dialog>
     </Box>
   );
 };

export default WhatsAppConfig;