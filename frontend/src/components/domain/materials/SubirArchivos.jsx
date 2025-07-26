import { useState, useEffect, useRef } from "react";
import { API_ENDPOINTS, API_HEADERS } from '../../../config/api.js';
import { logger } from '../../../utils/logger.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { 
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  Divider,
  LinearProgress,
  Paper,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Container,
  Chip,
  Avatar
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Description as DocIcon,
  AttachFile as FileIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

// Tema oscuro personalizado
const darkTheme = {
  primary: '#333333',      // AppBar color
  background: '#222222',   // Fondo principal
  surface: '#2A2A2A',      // Cards y surfaces
  text: '#FFFFFF',         // Texto principal
  textSecondary: '#B0B0B0', // Texto secundario
  divider: '#3F4147',      // Dividers
  accent: '#1976d2'        // Accent color
};

// Componente para mostrar tiempo transcurrido
function TiempoTranscurrido({ inicio }) {
  const [tiempo, setTiempo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempo(Math.floor((Date.now() - inicio) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [inicio]);

  const minutos = Math.floor(tiempo / 60);
  const segundos = tiempo % 60;

  return (
    <Box sx={{ color: darkTheme.textSecondary, mt: 1, textAlign: 'center' }}>
      <Typography variant="body2">
        ⏱️ Tiempo transcurrido: {minutos}:{segundos.toString().padStart(2, '0')}
      </Typography>
      {tiempo > 30 && (
        <Typography variant="body2" sx={{ color: '#ff9800', mt: 1 }}>
          ⚠️ Subida tomando más tiempo del esperado
        </Typography>
      )}
    </Box>
  );
}

function SubirArchivos({ onSuccess, onError, onClose }) {
  // Auth context
  const { isAdmin } = useAuth();
  
  // Estados principales
  const [archivos, setArchivos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  
  // Estados de progreso
  const [progreso, setProgreso] = useState('');
  const [tiempoInicio, setTiempoInicio] = useState(null);
  
  // Estados de notificaciones
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const fileInputRef = useRef(null);

  // Utilidades
  const getFileExtension = (fileName) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toUpperCase() : '';
  };

  const getFileIcon = (fileName) => {
    const extension = getFileExtension(fileName).toLowerCase();
    const iconProps = { fontSize: "medium", sx: { mr: 1 } };
    
    switch (extension) {
      case 'pdf':
        return <PdfIcon {...iconProps} sx={{ ...iconProps.sx, color: '#ff5722' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon {...iconProps} sx={{ ...iconProps.sx, color: '#2196f3' }} />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <AudioIcon {...iconProps} sx={{ ...iconProps.sx, color: '#9c27b0' }} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <VideoIcon {...iconProps} sx={{ ...iconProps.sx, color: '#00bcd4' }} />;
      case 'docx':
      case 'doc':
        return <DocIcon {...iconProps} sx={{ ...iconProps.sx, color: '#2196f3' }} />;
      default:
        return <FileIcon {...iconProps} sx={{ ...iconProps.sx, color: darkTheme.textSecondary }} />;
    }
  };

  const getFileTypeColor = (fileName) => {
    const extension = getFileExtension(fileName).toLowerCase();
    switch (extension) {
      case 'pdf': return '#ff5722';
      case 'jpg':
      case 'jpeg':
      case 'png': return '#2196f3';
      case 'mp3':
      case 'wav': return '#9c27b0';
      case 'mp4':
      case 'avi': return '#00bcd4';
      case 'docx': return '#2196f3';
      default: return darkTheme.textSecondary;
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const resetForm = () => {
    setArchivos([]);
    setMateriales([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manejadores de eventos
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const nuevosArchivos = files.map(file => {
      const nombreSinExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      return {
        file,
        nombre: nombreSinExtension,
        descripcion: '',
        bucketTipo: 'privado'
      };
    });

    const todosLosArchivos = [...archivos, ...nuevosArchivos];
    const todosMateriales = [...materiales, ...nuevosArchivos.map(a => ({
      ...a,
      nombre: a.nombre,
      descripcion: a.descripcion
    }))];

    setArchivos(todosLosArchivos);
    setMateriales(todosMateriales);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const message = nuevosArchivos.length === 1 
      ? `Archivo "${nuevosArchivos[0].file.name}" agregado` 
      : `${nuevosArchivos.length} archivos agregados`;
    showSnackbar(message, 'info');
  };

  const handleMaterialChange = (index, field, value) => {
    const nuevosMateriales = [...materiales];
    nuevosMateriales[index][field] = value;
    setMateriales(nuevosMateriales);
  };

  const removeFile = (index) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    const nuevosMateriales = materiales.filter((_, i) => i !== index);
    
    setArchivos(nuevosArchivos);
    setMateriales(nuevosMateriales);
    
    if (nuevosArchivos.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    showSnackbar('Archivo eliminado', 'warning');
  };

  const clearAllFiles = () => {
    resetForm();
    showSnackbar('Archivos limpiados', 'info');
  };

  // Funciones de subida (manteniendo la lógica original)
  const getPresignedUrl = async (archivo, materialData) => {
    const extension = archivo.file.name.split('.').pop();
    
    logger.request('Solicitando URL pre-firmada...');
    logger.data('Datos enviados:', {
      extension,
      contentType: archivo.file.type,
      nombre: materialData.nombre,
      descripcion: materialData.descripcion,
      bucketTipo: materialData.bucketTipo
    });

    const response = await fetch(API_ENDPOINTS.materials.uploadUrl, {
      method: 'POST',
      headers: API_HEADERS.withAuth(),
      body: JSON.stringify({
        extension,
        contentType: archivo.file.type,
        nombre: materialData.nombre,
        descripcion: materialData.descripcion,
        bucketTipo: materialData.bucketTipo
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Error en URL response:', errorData);
      throw new Error(`Error obteniendo URL de subida: ${response.status} - ${errorData}`);
    }

    const responseData = await response.json();
    logger.structure('Respuesta completa del servidor:', responseData);
    
    const { uploadUrl, materialId, filename } = responseData.data || responseData;
    logger.success('URL pre-firmada obtenida:', { uploadUrl, materialId, filename });

    if (!uploadUrl || !materialId || !filename) {
      logger.error('Datos incompletos:', { uploadUrl: !!uploadUrl, materialId: !!materialId, filename: !!filename });
      throw new Error(`Datos incompletos del servidor: uploadUrl=${!!uploadUrl}, materialId=${!!materialId}, filename=${!!filename}`);
    }

    return { uploadUrl, materialId, filename };
  };

  const uploadToMinio = async (archivo, uploadUrl) => {
    logger.upload('Subiendo archivo a MinIO...');
    logger.url('URL de subida:', uploadUrl);
    logger.file('Archivo info:', {
      name: archivo.file.name,
      size: archivo.file.size,
      type: archivo.file.type
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000);

    try {
      const originalFetch = window.fetch.__originalFetch || window.fetch;
      
      const uploadResponse = await originalFetch(uploadUrl, {
        method: 'PUT',
        body: archivo.file,
        headers: {
          'Content-Type': archivo.file.type
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      logger.data('Upload response status:', uploadResponse.status);
      logger.headers('Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        logger.error('Error en upload response:', errorText);
        throw new Error(`Error subiendo archivo a MinIO: ${uploadResponse.status} - ${errorText}`);
      }
      
      logger.success('Archivo subido a MinIO exitosamente');
    } catch (uploadError) {
      clearTimeout(timeoutId);
      
      if (uploadError.name === 'AbortError') {
        throw new Error(`Timeout: La subida del archivo "${archivo.file.name}" tardó más de 60 segundos. Verifica tu conexión y el tamaño del archivo.`);
      } else if (uploadError.message.includes('fetch')) {
        throw new Error(`Error de red al subir "${archivo.file.name}". Verifica que MinIO esté disponible.`);
      } else {
        throw uploadError;
      }
    }
  };

  const confirmUpload = async (materialId, materialData) => {
    logger.success('Confirmando subida...');
    
    const confirmResponse = await fetch(API_ENDPOINTS.materials.confirmUpload, {
      method: 'POST',
      headers: API_HEADERS.withAuth(),
      body: JSON.stringify({
        materialId,
        nombre: materialData.nombre,
        descripcion: materialData.descripcion
      })
    });

    logger.data('Confirm response status:', confirmResponse.status);

    if (!confirmResponse.ok) {
      const errorData = await confirmResponse.text();
      logger.error('Error en confirm response:', errorData);
      throw new Error(`Error confirmando subida: ${confirmResponse.status} - ${errorData}`);
    }

    const confirmData = await confirmResponse.json();
    logger.success('Confirmación exitosa:', confirmData);
    
    return confirmData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      showSnackbar('No hay token de autenticación. Por favor, inicia sesión.', 'error');
      if (onError) onError('No hay token de autenticación.');
      return;
    }

    setSubiendo(true);
    setTiempoInicio(Date.now());
    setProgreso('Iniciando subida...');

    try {
      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const materialData = materiales[i];
        
        setProgreso(`Procesando archivo ${i + 1}/${archivos.length}: ${archivo.file.name}`);
        logger.upload(`Subiendo archivo ${i + 1}/${archivos.length}: ${archivo.file.name}`);
        
        // 1. Obtener URL pre-firmada
        setProgreso(`Obteniendo URL de subida para: ${archivo.file.name}`);
        const { uploadUrl, materialId } = await getPresignedUrl(archivo, materialData);

        // 2. Subir archivo a MinIO
        setProgreso(`Subiendo archivo a MinIO: ${archivo.file.name}`);
        await uploadToMinio(archivo, uploadUrl);

        // 3. Confirmar subida
        setProgreso(`Confirmando subida: ${archivo.file.name}`);
        await confirmUpload(materialId, materialData);
        
        logger.success(`Archivo completado: ${archivo.file.name}`);
      }

      setProgreso('¡Todos los archivos subidos exitosamente!');
      showSnackbar(`Todos los archivos (${archivos.length}) subidos exitosamente`, 'success');
      resetForm();
      
      if (onSuccess) onSuccess();
    } catch (error) {
      setProgreso(`Error: ${error.message}`);
      showSnackbar(`Error: ${error.message}`, 'error');
      if (onError) onError(error.message);
    } finally {
      setSubiendo(false);
      setTiempoInicio(null);
      setTimeout(() => {
        setProgreso('');
      }, 3000);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: darkTheme.background,
      color: darkTheme.text
    }}>
      {/* Header principal con tema oscuro */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: darkTheme.primary }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: darkTheme.accent, mr: 2 }}>
            <StorageIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Subir Archivos
            </Typography>
            <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
              Gestiona y sube nuevos materiales educativos
            </Typography>
          </Box>
          {onClose && (
            <Tooltip title="Cerrar" arrow>
              <IconButton
                onClick={onClose}
                sx={{ color: darkTheme.text }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Sección de selección de archivos mejorada */}
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 4, 
            p: 4, 
            bgcolor: darkTheme.surface,
            borderRadius: 3,
            border: `1px solid ${darkTheme.divider}`
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" color={darkTheme.text} mb={2}>
              Seleccionar Archivos
            </Typography>
            
            <Box sx={{
              p: 4,
              border: `2px dashed ${darkTheme.accent}`,
              borderRadius: 3,
              bgcolor: 'rgba(25, 118, 210, 0.05)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                borderColor: darkTheme.accent,
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                transform: 'translateY(-2px)',
              }
            }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: darkTheme.accent, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" color={darkTheme.accent} mb={1}>
                Arrastra archivos aquí o haz clic para seleccionar
              </Typography>
              
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  bgcolor: darkTheme.accent,
                  '&:hover': {
                    bgcolor: '#1565c0',
                  }
                }}
                disabled={subiendo}
                size="large"
              >
                Seleccionar archivos
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.mp3,.mp4"
                  hidden
                />
              </Button>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <InfoIcon sx={{ color: darkTheme.accent }} fontSize="small" />
              <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                Formatos soportados: PDF, JPG, PNG, DOCX, MP3, MP4
              </Typography>
            </Box>
            
            {archivos.length > 0 && (
              <Paper 
                elevation={1} 
                sx={{ 
                  mt: 3,
                  p: 3,
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  border: `1px solid #4caf50`,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <CheckIcon sx={{ color: '#4caf50' }} />
                  <Typography variant="h6" sx={{ color: '#4caf50' }} fontWeight="bold">
                    {archivos.length} archivo{archivos.length !== 1 ? 's' : ''} seleccionado{archivos.length !== 1 ? 's' : ''}
                  </Typography>
                  <Tooltip title="Limpiar todos los archivos" arrow>
                    <IconButton
                      onClick={clearAllFiles}
                      disabled={subiendo}
                      size="small"
                      sx={{ color: '#f44336' }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            )}
          </Box>
        </Paper>

        {/* Sección de configuración de materiales */}
        {archivos.length > 0 && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: darkTheme.surface,
              borderRadius: 3,
              border: `1px solid ${darkTheme.divider}`
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center" color={darkTheme.text}>
              Configurar Materiales
            </Typography>
            <Divider sx={{ mb: 4, borderColor: darkTheme.divider }} />
            
            <Grid container spacing={3}>
              {archivos.map((archivo, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      bgcolor: darkTheme.background,
                      border: `1px solid ${darkTheme.divider}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: darkTheme.accent,
                        boxShadow: `0 8px 24px rgba(25, 118, 210, 0.15)`,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header del archivo */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        mb: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                          {getFileIcon(archivo.file.name)}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="subtitle2" 
                              fontWeight="bold" 
                              sx={{ 
                                color: getFileTypeColor(archivo.file.name),
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {archivo.file.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                              {getFileExtension(archivo.file.name)} • {(archivo.file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </Box>
                        <Tooltip title="Eliminar archivo" arrow>
                          <IconButton 
                            onClick={() => removeFile(index)} 
                            disabled={subiendo}
                            size="small"
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Campos de configuración */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="Nombre del material"
                          value={materiales[index]?.nombre || ''}
                          onChange={(e) => handleMaterialChange(index, 'nombre', e.target.value)}
                          fullWidth
                          variant="outlined"
                          disabled={subiendo}
                          inputProps={{ maxLength: 60 }}
                          sx={{
                            '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                            '& .MuiOutlinedInput-root': {
                              color: darkTheme.text,
                              '& fieldset': { borderColor: darkTheme.divider },
                              '&:hover fieldset': { borderColor: darkTheme.accent },
                              '&.Mui-focused fieldset': { borderColor: darkTheme.accent },
                            }
                          }}
                          helperText={`${materiales[index]?.nombre?.length || 0}/60 caracteres`}
                        />
                        
                        <TextField
                          label="Descripción (opcional)"
                          value={materiales[index]?.descripcion || ''}
                          onChange={(e) => handleMaterialChange(index, 'descripcion', e.target.value)}
                          fullWidth
                          variant="outlined"
                          multiline
                          rows={3}
                          disabled={subiendo}
                          inputProps={{ maxLength: 120 }}
                          sx={{
                            '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                            '& .MuiOutlinedInput-root': {
                              color: darkTheme.text,
                              '& fieldset': { borderColor: darkTheme.divider },
                              '&:hover fieldset': { borderColor: darkTheme.accent },
                              '&.Mui-focused fieldset': { borderColor: darkTheme.accent },
                            }
                          }}
                          helperText={`${materiales[index]?.descripcion?.length || 0}/120 caracteres`}
                          placeholder="Agrega una descripción para ayudar a otros usuarios..."
                        />
                        
                        <Box>
                          <Typography variant="body2" color={darkTheme.text} fontWeight="medium" mb={1}>
                            Tipo de acceso
                          </Typography>
                          <Select
                            value={materiales[index]?.bucketTipo || 'privado'}
                            onChange={(e) => handleMaterialChange(index, 'bucketTipo', e.target.value)}
                            fullWidth
                            disabled={subiendo}
                            sx={{
                              color: darkTheme.text,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.divider },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.accent },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.accent },
                              '& .MuiSvgIcon-root': { color: darkTheme.textSecondary }
                            }}
                          >
                            <MenuItem value="privado">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LockIcon sx={{ mr: 1, color: '#ff9800' }} fontSize="small" />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">Privado</Typography>
                                  <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                                    Solo miembros registrados
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                            {isAdmin() && (
                              <MenuItem value="publico">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PublicIcon sx={{ mr: 1, color: '#4caf50' }} fontSize="small" />
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">Público</Typography>
                                    <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                                      Visible para todos
                                    </Typography>
                                  </Box>
                                </Box>
                              </MenuItem>
                            )}
                          </Select>
                          
                          {!isAdmin() && (
                            <Paper 
                              elevation={0}
                              sx={{ 
                                mt: 1, 
                                p: 1.5, 
                                bgcolor: 'rgba(255, 152, 0, 0.1)', 
                                border: `1px solid #ff9800`,
                                borderRadius: 1
                              }}
                            >
                              <Typography variant="caption" sx={{ color: '#ff9800' }} fontWeight="medium">
                                ⚠️ Solo usuarios admin pueden subir contenido público
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Botón de subida mejorado */}
        {archivos.length > 0 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={subiendo ? null : <CloudUploadIcon />}
              disabled={subiendo || archivos.length === 0}
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 3,
                minWidth: 280,
                bgcolor: darkTheme.accent,
                '&:hover': {
                  bgcolor: '#1565c0',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  opacity: 0.7,
                }
              }}
            >
              {subiendo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }}
                  />
                  Subiendo archivos...
                </Box>
              ) : (
                `🚀 Subir ${archivos.length} archivo${archivos.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </Box>
        )}

        {/* Indicador de progreso */}
        {(subiendo || progreso) && (
          <Paper 
            elevation={3}
            sx={{ 
              mt: 4, 
              p: 3,
              bgcolor: darkTheme.surface,
              borderRadius: 2,
              border: `1px solid ${darkTheme.divider}`
            }}
          >
            <LinearProgress 
              color={progreso.includes('Error') ? 'error' : 'primary'} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                mb: 2,
                '& .MuiLinearProgress-bar': {
                  bgcolor: progreso.includes('Error') ? '#f44336' : darkTheme.accent
                }
              }} 
            />
            <Typography 
              variant="body1" 
              color={progreso.includes('Error') ? '#f44336' : darkTheme.text} 
              sx={{ textAlign: 'center', fontWeight: 'medium' }}
            >
              {progreso || 'Subiendo archivos... Por favor, no cierres esta ventana.'}
            </Typography>
            {tiempoInicio && (
              <TiempoTranscurrido inicio={tiempoInicio} />
            )}
            {subiendo && (
              <Paper 
                elevation={0}
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: 'rgba(33, 150, 243, 0.1)', 
                  border: `1px solid ${darkTheme.accent}`,
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" sx={{ color: darkTheme.accent }} fontWeight="medium" mb={1}>
                  Si la subida tarda mucho, verifica:
                </Typography>
                <Box component="ul" sx={{ 
                  margin: 0, 
                  paddingLeft: 3,
                  '& li': {
                    color: darkTheme.textSecondary,
                    fontSize: '0.875rem',
                    mb: 0.5
                  }
                }}>
                  <li>Que el backend esté corriendo</li>
                  <li>El tamaño del archivo (archivos grandes tardan más)</li>
                  <li>Tu conexión a internet</li>
                </Box>
              </Paper>
            )}
          </Paper>
        )}
      </Container>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbarSeverity} 
          onClose={() => setSnackbarOpen(false)} 
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': { color: darkTheme.text }
          }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SubirArchivos;