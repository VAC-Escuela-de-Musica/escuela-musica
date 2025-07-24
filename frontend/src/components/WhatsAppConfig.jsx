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
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Settings as SettingsIcon,
  QrCode as QrCodeIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import messagingService from '../services/messagingService.js';

const WhatsAppConfig = () => {
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });
  const [showQRDialog, setShowQRDialog] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Frontend: Cargando estado...');
      const response = await messagingService.getWhatsAppWebStatus();
      console.log('📊 Frontend: Estado recibido:', response);
      
      if (response.success) {
        setStatus(response.data);
        console.log('✅ Frontend: Estado configurado');
        
        // Si hay código QR disponible, cargarlo también
        if (response.data.qrCode && !qrCode) {
          console.log('📱 Frontend: QR encontrado en estado, configurando...');
          setQrCode(response.data.qrCode);
          setQrCodeImage(response.data.qrCodeImage);
          console.log('🖼️ Frontend: Imagen QR configurada desde estado:', !!response.data.qrCodeImage);
        }
      }
    } catch (error) {
      console.error('❌ Frontend: Error cargando estado:', error);
      setAlertInfo({ type: 'error', message: 'Error cargando estado de WhatsApp Web' });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWhatsApp = async () => {
    try {
      setIsLoading(true);
      setAlertInfo({ type: 'info', message: 'Inicializando WhatsApp Web...' });
      
      const response = await messagingService.initializeWhatsAppWeb();
      if (response.success) {
        setAlertInfo({ type: 'success', message: 'WhatsApp Web inicializado correctamente' });
        await loadStatus();
      } else {
        setAlertInfo({ type: 'error', message: 'Error inicializando WhatsApp Web: ' + response.message });
      }
    } catch (error) {
      console.error('Error inicializando:', error);
      setAlertInfo({ type: 'error', message: 'Error inicializando WhatsApp Web' });
    } finally {
      setIsLoading(false);
    }
  };

  const getQRCode = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Frontend: Obteniendo código QR...');
      const response = await messagingService.getWhatsAppWebQR();
      console.log('📱 Frontend: Respuesta completa recibida:', response);
      
      if (response.success && response.data?.qrCode) {
        console.log('✅ Frontend: QR disponible, configurando estado...');
        setQrCode(response.data.qrCode);
        setQrCodeImage(response.data.qrCodeImage);
        setShowQRDialog(true);
        setAlertInfo({ type: 'success', message: 'Código QR generado. Escanea con WhatsApp para autenticar.' });
      } else {
        console.log('❌ Frontend: No hay QR disponible');
        setAlertInfo({ type: 'warning', message: response.data?.message || 'No hay código QR disponible' });
      }
    } catch (error) {
      console.error('❌ Frontend: Error obteniendo QR:', error);
      setAlertInfo({ type: 'error', message: 'Error obteniendo código QR' });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      setAlertInfo({ type: 'warning', message: 'Por favor completa el número y mensaje de prueba' });
      return;
    }

    try {
      setIsLoading(true);
      setAlertInfo({ type: 'info', message: 'Enviando mensaje de prueba...' });
      
      const response = await messagingService.sendWhatsAppMessage(testPhone, testMessage);
      if (response.success) {
        setAlertInfo({ type: 'success', message: 'Mensaje de prueba enviado exitosamente!' });
        setTestPhone('');
        setTestMessage('');
      } else {
        setAlertInfo({ type: 'error', message: 'Error enviando mensaje: ' + response.message });
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setAlertInfo({ type: 'error', message: 'Error enviando mensaje de prueba' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusChip = () => {
    if (!status) {
      return <Chip label="Desconocido" color="default" size="small" />;
    }
    if (status.ready) {
      return <Chip label="Conectado y Listo" color="success" icon={<CheckCircleIcon />} />;
    }
    if (status.initialized) {
      return <Chip label="Necesita Autenticación" color="warning" icon={<QrCodeIcon />} />;
    }
    return <Chip label="No Inicializado" color="error" icon={<ErrorIcon />} />;
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#222222', minHeight: '100vh', color: '#ffffff' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <WhatsAppIcon sx={{ fontSize: 40, color: '#25D366' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
            Configuración de WhatsApp Web
          </Typography>
          <Typography variant="body2" sx={{ color: '#cccccc' }}>
            Configura WhatsApp Web para enviar mensajes reales sin costos adicionales
          </Typography>
        </Box>
      </Box>

      {/* Status Alert */}
      {alertInfo.message && (
        <Alert 
          severity={alertInfo.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlertInfo({ type: '', message: '' })}
        >
          {alertInfo.message}
        </Alert>
      )}

      <Grid container columns={12} spacing={3}>
        {/* Estado Actual */}
        <Grid span={4}>
          <Paper sx={{ p: 3, backgroundColor: '#333333', color: '#ffffff', height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SettingsIcon sx={{ color: '#25D366' }} />
              <Typography variant="h6">Estado Actual</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {getStatusChip()}
              
              {status && (
                <Box sx={{ mt: 2 }}>
                  <Grid container columns={12} spacing={1}>
                    <Grid span={6}>
                      <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
                        Inicializado:
                      </Typography>
                      <Chip 
                        label={status.initialized ? 'Sí' : 'No'} 
                        color={status.initialized ? 'success' : 'error'} 
                        size="small" 
                      />
                    </Grid>
                    <Grid span={6}>
                      <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
                        Conectado:
                      </Typography>
                      <Chip 
                        label={status.ready ? 'Sí' : 'No'} 
                        color={status.ready ? 'success' : 'error'} 
                        size="small" 
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Button
                variant="outlined"
                onClick={loadStatus}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                sx={{
                  borderColor: '#25D366',
                  color: '#25D366',
                  '&:hover': { 
                    borderColor: '#128C7E',
                    backgroundColor: 'rgba(37, 211, 102, 0.1)' 
                  }
                }}
              >
                Actualizar Estado
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Configuración Principal */}
        <Grid span={8}>
          <Paper sx={{ p: 3, backgroundColor: '#333333', color: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <WhatsAppIcon sx={{ color: '#25D366' }} />
              <Typography variant="h6">Configuración de WhatsApp Web</Typography>
            </Box>

            {/* Inicialización */}
            <Accordion 
              sx={{ 
                backgroundColor: '#444444',
                '&:before': { display: 'none' },
                mb: 2
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cccccc' }} />}>
                <Typography sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon sx={{ color: '#25D366' }} />
                  Inicialización del Servicio
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#cccccc', mb: 3 }}>
                  Inicia el servicio de WhatsApp Web. Esto preparará el sistema para generar códigos QR.
                </Typography>
                <Button
                  variant="contained"
                  onClick={initializeWhatsApp}
                  disabled={isLoading || (status && status.initialized)}
                  startIcon={isLoading ? <CircularProgress size={16} /> : <SettingsIcon />}
                  sx={{
                    backgroundColor: '#25D366',
                    '&:hover': { backgroundColor: '#128C7E' }
                  }}
                >
                  {isLoading ? 'Inicializando...' : 'Inicializar WhatsApp Web'}
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Código QR */}
            <Accordion 
              sx={{ 
                backgroundColor: '#444444',
                '&:before': { display: 'none' },
                mb: 2
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cccccc' }} />}>
                <Typography sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCodeIcon sx={{ color: '#25D366' }} />
                  Autenticación QR
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#cccccc', mb: 3 }}>
                  Obtiene el código QR para autenticar WhatsApp Web desde tu teléfono.
                </Typography>
                <Button
                  variant="contained"
                  onClick={getQRCode}
                  disabled={isLoading || !status?.initialized}
                  startIcon={isLoading ? <CircularProgress size={16} /> : <QrCodeIcon />}
                  sx={{
                    backgroundColor: '#25D366',
                    '&:hover': { backgroundColor: '#128C7E' }
                  }}
                >
                  {isLoading ? 'Obteniendo...' : 'Obtener Código QR'}
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Mensaje de Prueba */}
            <Accordion 
              sx={{ 
                backgroundColor: '#444444',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cccccc' }} />}>
                <Typography sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SendIcon sx={{ color: '#25D366' }} />
                  Enviar Mensaje de Prueba
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#cccccc', mb: 3 }}>
                  Prueba la funcionalidad enviando un mensaje de WhatsApp.
                </Typography>
                <Grid container columns={12} spacing={2}>
                  <Grid span={6}>
                    <TextField
                      fullWidth
                      label="Número de Teléfono"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+34612345678"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ color: '#cccccc', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#555555' },
                          '&:hover fieldset': { borderColor: '#25D366' },
                          '&.Mui-focused fieldset': { borderColor: '#25D366' }
                        },
                        '& .MuiInputLabel-root': { color: '#cccccc' },
                        '& .MuiInputBase-input': { color: '#ffffff' }
                      }}
                    />
                  </Grid>
                  <Grid span={6}>
                    <TextField
                      fullWidth
                      label="Mensaje de Prueba"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Mensaje de prueba desde GPS"
                      InputProps={{
                        startAdornment: <MessageIcon sx={{ color: '#cccccc', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#555555' },
                          '&:hover fieldset': { borderColor: '#25D366' },
                          '&.Mui-focused fieldset': { borderColor: '#25D366' }
                        },
                        '& .MuiInputLabel-root': { color: '#cccccc' },
                        '& .MuiInputBase-input': { color: '#ffffff' }
                      }}
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  onClick={sendTestMessage}
                  disabled={isLoading || !status?.ready || !testPhone || !testMessage}
                  startIcon={isLoading ? <CircularProgress size={16} /> : <SendIcon />}
                  sx={{
                    mt: 2,
                    backgroundColor: '#25D366',
                    '&:hover': { backgroundColor: '#128C7E' }
                  }}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Mensaje de Prueba'}
                </Button>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Información */}
        <Grid span={12}>
          <Paper sx={{ p: 3, backgroundColor: '#333333', color: '#ffffff' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#25D366' }}>
              ℹ️ Información Importante
            </Typography>
            <Grid container columns={12} spacing={3}>
              <Grid span={6}>
                <Box sx={{ p: 2, backgroundColor: '#444444', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: '#4CAF50', mb: 1 }}>
                    ✅ Ventajas
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#cccccc' }}>
                    <li>100% Gratuito</li>
                    <li>Mensajes reales de WhatsApp</li>
                    <li>Desde tu número personal</li>
                    <li>Sin límites de envío</li>
                  </ul>
                </Box>
              </Grid>
              <Grid span={6}>
                <Box sx={{ p: 2, backgroundColor: '#444444', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: '#FF9800', mb: 1 }}>
                    ⚠️ Consideraciones
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#cccccc' }}>
                    <li>Necesita sesión activa</li>
                    <li>Un número por servidor</li>
                    <li>Dependiente de WhatsApp Web</li>
                    <li>Requiere autenticación inicial</li>
                  </ul>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog para mostrar QR */}
      <Dialog 
        open={showQRDialog} 
        onClose={() => setShowQRDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#333333', color: '#ffffff' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <QrCodeIcon sx={{ fontSize: 40, color: '#25D366', mb: 1 }} />
          <Typography variant="h6">Código QR para Autenticación</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#cccccc' }}>
            Sigue estos pasos para autenticar WhatsApp Web:
          </Typography>
          <ol style={{ textAlign: 'left', color: '#cccccc', marginBottom: '20px' }}>
            <li>Abre WhatsApp en tu teléfono</li>
            <li>Ve a Configuración → Dispositivos Vinculados</li>
            <li>Escanea el código QR que aparece abajo</li>
            <li>Confirma la vinculación en tu teléfono</li>
          </ol>
          
          {qrCodeImage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>
                <img 
                  src={qrCodeImage} 
                  alt="Código QR WhatsApp" 
                  style={{ width: '250px', height: '250px', imageRendering: 'pixelated' }}
                  onLoad={() => console.log('🖼️ Frontend: Imagen QR cargada correctamente')}
                  onError={(e) => console.error('❌ Frontend: Error cargando imagen QR:', e)}
                />
              </Box>
            </Box>
          )}
          
          {!qrCodeImage && qrCode && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Imagen QR no disponible, pero código QR sí está presente
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowQRDialog(false)}
            sx={{ color: '#25D366' }}
          >
            Cerrar
          </Button>
          <Button 
            onClick={getQRCode}
            variant="contained"
            sx={{ backgroundColor: '#25D366', '&:hover': { backgroundColor: '#128C7E' } }}
          >
            Actualizar QR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WhatsAppConfig;