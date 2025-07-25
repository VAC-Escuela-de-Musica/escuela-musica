import React, { useState, useEffect } from 'react';
import { useMaterials } from '../../../hooks/useMaterials.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { formatDate, formatFileSize, getFileTypeFromExtension, getFileTypeIcon } from '../../../utils/helpers.js';
import ImageViewer from './ImageViewer.jsx';
import SubirMaterial from './SubirMaterial.jsx';
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions,
  IconButton, 
  Box, 
  Typography, 
  Toolbar, 
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  Avatar,
  Link,
  Pagination,
  Stack,
  Divider,
  Grid
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  Close as CloseIcon, 
  ViewList as ViewListIcon, 
  ViewModule as ViewModuleIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  AttachFile as FileIcon,
  Public as PublicIcon,
  Lock as PrivateIcon
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import './ListaMateriales.css';

const ListaMateriales = () => {
  const { user, isAdmin, isTeacher } = useAuth();
  const { materials, loading, error, pagination, fetchMaterials, deleteMaterial, prevPage, nextPage } = useMaterials();
  
  // Estados para modales
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Estado para vista de lista vs grid
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'grid'
  const [expandedRows, setExpandedRows] = useState(new Set());
    // Callback para subida exitosa
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchMaterials();
    setSnackbarMsg('Materiales subidos correctamente');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Callback para error de subida
  const handleUploadError = (msg = 'Error al subir materiales') => {
    setSnackbarMsg(msg);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };
  // Feedback visual para subida
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Función para determinar si el usuario puede eliminar un material
  const canDeleteMaterial = (material) => {
    // Admin puede eliminar todo
    if (isAdmin()) return true;
    
    // El propietario puede eliminar su propio material
    if (material.usuario === user?.email) return true;
    
    // Nadie más puede eliminar
    return false;
  };

  // Funciones para manejo de vistas
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const toggleRowExpansion = (materialId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedRows(newExpanded);
  };

  useEffect(() => {
    if (user) {
      fetchMaterials();
    }
  }, [user]); // Removemos fetchMaterials de las dependencias para evitar loops

  // Manejar vista previa de imagen
  const handleImagePreview = (material) => {
    // Verificar si es una imagen usando ambos campos (compatibilidad)
    const mimeType = material.mimeType || material.tipoContenido;
    const imageUrl = material.viewUrl;
    
    if (imageUrl && mimeType && 
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
      setSelectedImage({
        url: imageUrl,
        title: material.title || material.nombre,
        description: material.description || material.descripcion,
        fileName: material.title || material.nombre,
        fileSize: material.fileSize || material.tamaño
      });
    } else {
      console.log('No se puede previsualizar:', { 
        imageUrl, 
        mimeType, 
        isImage: mimeType && mimeType.startsWith('image/') 
      });
    }
  };

  // Manejar eliminación
  const handleDeleteClick = (material) => {
    setDeleteConfirmation(material);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation) {
      try {
        const result = await deleteMaterial(deleteConfirmation._id);
        if (result.success) {
          setDeleteConfirmation(null);
          // El hook ya recarga los materiales automáticamente
        } else {
          console.error('Error al eliminar material:', result.error);
          alert('Error al eliminar el material. Por favor, inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al eliminar material:', error);
        alert('Error al eliminar el material. Por favor, inténtalo de nuevo.');
      }
    }
  };

  // Obtener icono de tipo de archivo con Material UI
  const getFileIconComponent = (mimeType, title) => {
    const type = getFileTypeFromExtension(title);
    const iconProps = { sx: { mr: 1 } };
    
    switch (type) {
      case 'PDF':
        return <PdfIcon color="error" {...iconProps} />;
      case 'Imagen':
        return <ImageIcon color="primary" {...iconProps} />;
      case 'Audio':
        return <AudioIcon color="secondary" {...iconProps} />;
      case 'Video':
        return <VideoIcon color="info" {...iconProps} />;
      default:
        return <FileIcon color="action" {...iconProps} />;
    }
  };

  // Estados de carga y error con Material UI
  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Acceso Restringido
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Debes iniciar sesión para ver los materiales.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Cargando materiales...
          </Typography>
          <Box sx={{ mt: 2 }}>
            {/* Aquí puedes agregar un CircularProgress de MUI si quieres */}
          </Box>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error al cargar materiales
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={fetchMaterials}>
            Reintentar
          </Button>
        </Paper>
      </Box>
    );
  }


  return (
    <Box className="dark-theme" sx={{ p: 3, backgroundColor: '#222222', minHeight: '100vh', color: '#fff' }}>
      {/* Header con Material UI */}
      <Paper elevation={1} sx={{ mb: 2, backgroundColor: 'var(--surface-dark)', color: 'var(--text-dark)', borderRadius: 3, px: { xs: 2, md: 6 }, py: 3 }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 2, backgroundColor: 'transparent', minHeight: 80, justifyContent: 'center' }}>
          <Box sx={{ width: '100%', textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              sx={{
                color: 'var(--heading-color)',
                letterSpacing: '0.03em',
                mb: 1,
                mt: 1,
                fontSize: { xs: '2rem', md: '2.5rem' },
                lineHeight: 1.1,
                textShadow: '0 2px 8px rgba(0,0,0,0.12)',
                textAlign: 'center',
              }}
            >
              Repositorio de Materiales
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary-dark)', mb: 1, fontWeight: 400, textAlign: 'center' }}>
              {pagination?.totalCount || materials?.length || 0} materiales disponibles
            </Typography>
          </Box>
          {(isAdmin() || isTeacher()) && (
            <Tooltip title="Subir nuevos materiales" arrow>
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={() => setShowUploadModal(true)}
                sx={{
                  boxShadow: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  transition: 'background 0.2s',
                  backgroundColor: 'var(--accent-dark)',
                  color: 'var(--text-dark)',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
              >
                Subir Material
              </Button>
            </Tooltip>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 180 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary-dark)' }}>
              Hola, {user?.nombre || user?.username || user?.email}
            </Typography>
          </Box>
        </Toolbar>
      </Paper>

      {/* Barra de filtros y vista */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Filtros:
              </Typography>
              {/* Aquí se pueden agregar más filtros en el futuro */}
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(event, newView) => {
                if (newView !== null) {
                  setViewMode(newView);
                }
              }}
              aria-label="vista de materiales"
              size="small"
            >
              <ToggleButton value="list" aria-label="vista de lista">
                <ViewListIcon /> Lista
              </ToggleButton>
              <ToggleButton value="grid" aria-label="vista de tarjetas">
                <ViewModuleIcon /> Tarjetas
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de materiales con Material UI */}
      {materials?.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 3 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No hay materiales disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Los materiales aparecerán aquí cuando estén disponibles.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Vista de Lista con Material UI Table */}
          {viewMode === 'list' && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Archivo</TableCell>
                    <TableCell>Tamaño</TableCell>
                    <TableCell>Fecha de subida</TableCell>
                    {isAdmin() && <TableCell>Acceso</TableCell>}
                    {(isAdmin() || isTeacher()) && <TableCell align="center">Acciones</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials?.map((material) => (
                    <TableRow key={material._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getFileIconComponent(material.mimeType || material.tipoContenido, material.title)}
                          <Link 
                            href={material.downloadUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            color="primary"
                            underline="hover"
                            sx={{ fontWeight: 500 }}
                          >
                            {material.title}
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {material.fileSize ? formatFileSize(material.fileSize) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(material.createdAt)}
                        </Typography>
                      </TableCell>
                      {isAdmin() && (
                        <TableCell>
                          <Chip
                            icon={material.isPublic ? <PublicIcon /> : <PrivateIcon />}
                            label={material.isPublic ? 'Público' : 'Privado'}
                            color={material.isPublic ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      )}
                      {(isAdmin() || isTeacher()) && (
                        <TableCell align="center">
                          {canDeleteMaterial(material) && (
                            <Tooltip title="Eliminar material" arrow>
                              <IconButton
                                onClick={() => handleDeleteClick(material)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Vista de Tarjetas mejorada */}
          {viewMode === 'grid' && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {materials?.map((material) => (
                <Grid item xs={12} sm={6} md={4} key={material._id}>
                  <Card sx={{
                    height: 400,
                    minHeight: 260,
                    maxHeight: 260,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--surface-dark)',
                    color: 'var(--text-dark)',
                    borderRadius: 3,
                    boxShadow: 3,
                  }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getFileIconComponent(material.mimeType || material.tipoContenido, material.title)}
                        <Typography variant="h6" fontWeight="bold" sx={{ ml: 1, color: 'var(--heading-color)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                          {material.title}
                        </Typography>
                      </Box>
                      {/* Vista previa de imagen usando la API de MinIO */}
                      {material.mimeType?.startsWith('image/') && material.viewUrl && (
                        <Box sx={{ width: '100%', height: 120, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 2, background: '#111' }}>
                          <img src={material.viewUrl} alt={material.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        </Box>
                      )}
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary-dark)', mb: 1 }}>
                        {material.description || 'Sin descripción'}
                      </Typography>
                      <Divider sx={{ my: 1, borderColor: 'var(--divider-dark)' }} />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary-dark)' }}>
                          <strong>Tipo:</strong> {getFileTypeFromExtension(material.title) || 'Archivo'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary-dark)' }}>
                          <strong>Subido:</strong> {formatDate(material.createdAt)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary-dark)' }}>
                          <strong>Tamaño:</strong> {material.fileSize ? formatFileSize(material.fileSize) : 'N/A'}
                        </Typography>
                        {isAdmin() && (
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary-dark)' }}>
                            <strong>Acceso:</strong> {material.isPublic ? 'Público' : 'Privado'}
                          </Typography>
                        )}
                        {isAdmin() && (
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary-dark)' }}>
                            <strong>Propietario:</strong> {material.usuario || '-'}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', px: 2, pb: 2 }}>
                      {material.downloadUrl && (
                        <Button
                          href={material.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          color="primary"
                          size="medium"
                          startIcon={<DownloadIcon />}
                          sx={{ backgroundColor: 'var(--accent-dark)', color: 'var(--text-dark)', fontWeight: 'bold', borderRadius: 2, px: 2, py: 1, fontSize: '1rem', boxShadow: 2, '&:hover': { backgroundColor: '#1565c0' } }}
                        >
                          DESCARGAR
                        </Button>
                      )}
                      {(isAdmin() || isTeacher()) && canDeleteMaterial(material) && (
                        <Tooltip title="Eliminar material" arrow>
                          <IconButton
                            onClick={() => handleDeleteClick(material)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                disabled={!pagination.hasPrevPage}
                onClick={prevPage}
              >
                ← Anterior
              </Button>
              <Typography variant="body2" color="text.secondary">
                Página {pagination.page} de {pagination.totalPages} | {pagination.totalCount} materiales en total
              </Typography>
              <Button
                variant="outlined"
                disabled={!pagination.hasNextPage}
                onClick={nextPage}
              >
                Siguiente →
              </Button>
            </Stack>
          )}
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmation && (
        <Dialog open={!!deleteConfirmation} onClose={() => setDeleteConfirmation(null)}>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <Typography>¿Estás seguro de que deseas eliminar este material?</Typography>
            <Typography fontWeight="bold" color="error" sx={{ mt: 1 }}>{deleteConfirmation.title}</Typography>
            <Typography variant="caption" color="warning.main" sx={{ mt: 2 }}>Esta acción no se puede deshacer.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmation(null)} color="primary" variant="outlined">
              Cancelar
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Modal de vista de imagen */}
      {selectedImage && (
        <ImageViewer
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          image={selectedImage}
        />
      )}

      {/* Modal de subir materiales con Material UI */}
      <Dialog 
        open={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { minHeight: '60vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', pb: 1 }}>
          <IconButton onClick={() => setShowUploadModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, width: '100%', overflowY: 'auto', maxHeight: '70vh' }}>
          <SubirMaterial 
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
          />
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListaMateriales;
