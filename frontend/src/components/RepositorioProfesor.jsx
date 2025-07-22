import React, { useState, useEffect, useCallback } from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatFileSize, getFileTypeFromExtension, getFileTypeIcon } from '../utils/helpers';
import ImageViewer from './ImageViewer';
import SubirArchivos from './SubirArchivos';

// Material-UI Imports
import {
  Box,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Grid,
  Paper,
  Stack,
  Toolbar,
  AppBar,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  Skeleton,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Switch,
  FormControlLabel,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel
} from '@mui/material';

// Material-UI Icons - Solo los necesarios
import {
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewComfy as ViewComfyIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Description as DocIcon,
  AttachFile as FileIcon,
  FolderOpen as FolderOpenIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

// Material-UI System
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

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

const RepositorioProfesor = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAdmin, isTeacher } = useAuth();
  const { materials, loading, error, pagination, fetchMaterials, deleteMaterial, prevPage, nextPage } = useMaterials();

  // Estados principales
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'list', 'grid', 'compact'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');
  const [currentTab, setCurrentTab] = useState(0);

  // Estados de UI
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Estados de notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Funciones de utilidad
  const showNotification = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const getFileIcon = (material) => {
    const type = getFileTypeFromExtension(material.title || material.nombre);
    const iconProps = { fontSize: 'medium' };
    
    switch (type) {
      case 'PDF':
        return <PdfIcon color="error" {...iconProps} />;
      case 'Imagen':
        return <ImageIcon color="primary" {...iconProps} />;
      case 'Audio':
        return <AudioIcon color="secondary" {...iconProps} />;
      case 'Video':
        return <VideoIcon color="info" {...iconProps} />;
      case 'Documento':
        return <DocIcon color="primary" {...iconProps} />;
      default:
        return <FileIcon color="action" {...iconProps} />;
    }
  };

  const canDeleteMaterial = (material) => {
    if (isAdmin()) return true;
    if (material.usuario === user?.email) return true;
    return false;
  };

  const getAccessIcon = (isPublic) => {
    return isPublic ? (
      <PublicIcon color="success" fontSize="small" />
    ) : (
      <LockIcon color="warning" fontSize="small" />
    );
  };

  // Filtrado y búsqueda
  const filteredMaterials = materials?.filter(material => {
    const matchesSearch = !searchTerm || 
      material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
      getFileTypeFromExtension(material.title) === filterType;
    
    const matchesAccess = filterAccess === 'all' || 
      (filterAccess === 'public' && material.isPublic) ||
      (filterAccess === 'private' && !material.isPublic);

    return matchesSearch && matchesType && matchesAccess;
  }) || [];

  // Handlers de eventos
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleMaterialSelect = (materialId) => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId);
    } else {
      newSelected.add(materialId);
    }
    setSelectedMaterials(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMaterials.size === filteredMaterials.length) {
      setSelectedMaterials(new Set());
    } else {
      setSelectedMaterials(new Set(filteredMaterials.map(m => m._id)));
    }
  };

  const handleDeleteClick = (material) => {
    setDeleteConfirmation(material);
    setAnchorEl(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation) {
      try {
        const result = await deleteMaterial(deleteConfirmation._id);
        if (result.success) {
          showNotification('Material eliminado correctamente', 'success');
        } else {
          showNotification('Error al eliminar el material', 'error');
        }
      } catch (error) {
        showNotification('Error al eliminar el material', 'error');
      }
      setDeleteConfirmation(null);
    }
  };

  const handleImagePreview = (material) => {
    const mimeType = material.mimeType || material.tipoContenido;
    const imageUrl = material.viewUrl;
    
    if (imageUrl && mimeType && mimeType.startsWith('image/')) {
      setSelectedImage({
        url: imageUrl,
        title: material.title || material.nombre,
        description: material.description || material.descripcion,
        fileName: material.title || material.nombre,
        fileSize: material.fileSize || material.tamaño
      });
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchMaterials();
    showNotification('Materiales subidos correctamente', 'success');
  };

  const handleUploadError = (msg = 'Error al subir materiales') => {
    showNotification(msg, 'error');
  };

  const handleMenuClick = (event, material) => {
    setAnchorEl(event.currentTarget);
    setSelectedMaterial(material);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMaterial(null);
  };

  // Efectos
  useEffect(() => {
    if (user) {
      fetchMaterials();
    }
  }, [user, fetchMaterials]);

  // Estados de carga y error
  if (!user) {
    return (
      <Box sx={{ p: 3, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', maxWidth: 500 }}>
          <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
            <LockIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
            Acceso Restringido
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Debes iniciar sesión para acceder al repositorio de materiales.
          </Typography>
          <Button variant="contained" color="primary" size="large">
            Iniciar Sesión
          </Button>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Skeleton del header */}
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Toolbar>
            <Skeleton variant="text" width={200} height={40} />
            <Box sx={{ flexGrow: 1 }} />
            <Skeleton variant="rectangular" width={150} height={36} />
          </Toolbar>
        </Paper>
        
        {/* Skeleton del contenido */}
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardHeader
                  avatar={<Skeleton variant="circular" width={40} height={40} />}
                  title={<Skeleton variant="text" width="60%" />}
                  subheader={<Skeleton variant="text" width="40%" />}
                />
                <CardContent>
                  <Skeleton variant="rectangular" height={100} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={80} height={32} />
                  <Skeleton variant="rectangular" width={80} height={32} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', maxWidth: 500 }}>
          <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
            <ErrorIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
            Error al cargar materiales
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={fetchMaterials}
            startIcon={<RefreshIcon />}
          >
            Reintentar
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: darkTheme.background }}>
      {/* Header principal mejorado */}
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 0, bgcolor: darkTheme.surface }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: darkTheme.primary }}>
          <Toolbar sx={{ minHeight: 80 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar sx={{ bgcolor: darkTheme.accent, mr: 2, width: 48, height: 48 }}>
                <StorageIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: darkTheme.text }}>
                  Repositorio de Materiales
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {filteredMaterials.length} de {materials?.length || 0} materiales
                </Typography>
              </Box>
            </Box>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  avatar={<Avatar sx={{ bgcolor: darkTheme.accent }}>{user?.username?.[0]?.toUpperCase()}</Avatar>}
                  label={user?.username || user?.email}
                  variant="outlined"
                  sx={{ 
                    color: darkTheme.text,
                    borderColor: darkTheme.divider
                  }}
                />
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Barra de búsqueda y filtros */}
        <Box sx={{ p: 2, bgcolor: darkTheme.surface, borderTop: 1, borderColor: darkTheme.divider }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar materiales..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: darkTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                  '& .MuiOutlinedInput-root': {
                    color: darkTheme.text,
                    bgcolor: darkTheme.background,
                    '& fieldset': { borderColor: darkTheme.divider },
                    '&:hover fieldset': { borderColor: darkTheme.accent },
                    '&.Mui-focused fieldset': { borderColor: darkTheme.accent },
                  },
                  '& input::placeholder': { 
                    color: darkTheme.textSecondary,
                    opacity: 1
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Autocomplete
                  size="small"
                  options={['all', 'PDF', 'Imagen', 'Audio', 'Video', 'Documento']}
                  getOptionLabel={(option) => option === 'all' ? 'Todos los tipos' : option}
                  value={filterType}
                  onChange={(_, newValue) => setFilterType(newValue || 'all')}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Tipo" sx={{ 
                      minWidth: 120,
                      '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      '& .MuiOutlinedInput-root': {
                        color: darkTheme.text,
                        bgcolor: darkTheme.background,
                        '& fieldset': { borderColor: darkTheme.divider },
                        '&:hover fieldset': { borderColor: darkTheme.accent },
                        '&.Mui-focused fieldset': { borderColor: darkTheme.accent },
                      },
                      '& .MuiSvgIcon-root': { color: darkTheme.textSecondary }
                    }} />
                  )}
                  sx={{
                    '& .MuiPaper-root': {
                      bgcolor: darkTheme.surface,
                      color: darkTheme.text,
                      border: `1px solid ${darkTheme.divider}`,
                    }
                  }}
                />
                
                <Autocomplete
                  size="small"
                  options={['all', 'public', 'private']}
                  getOptionLabel={(option) => 
                    option === 'all' ? 'Todos' : 
                    option === 'public' ? 'Públicos' : 'Privados'
                  }
                  value={filterAccess}
                  onChange={(_, newValue) => setFilterAccess(newValue || 'all')}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Acceso" sx={{ 
                      minWidth: 120,
                      '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      '& .MuiOutlinedInput-root': {
                        color: darkTheme.text,
                        bgcolor: darkTheme.background,
                        '& fieldset': { borderColor: darkTheme.divider },
                        '&:hover fieldset': { borderColor: darkTheme.accent },
                        '&.Mui-focused fieldset': { borderColor: darkTheme.accent },
                      },
                      '& .MuiSvgIcon-root': { color: darkTheme.textSecondary }
                    }} />
                  )}
                  sx={{
                    '& .MuiPaper-root': {
                      bgcolor: darkTheme.surface,
                      color: darkTheme.text,
                      border: `1px solid ${darkTheme.divider}`,
                    }
                  }}
                />

                <ToggleButtonGroup
                  size="small"
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setViewMode(newMode)}
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: darkTheme.textSecondary,
                      borderColor: darkTheme.divider,
                      '&:hover': {
                        bgcolor: alpha(darkTheme.accent, 0.1),
                        borderColor: darkTheme.accent,
                      },
                      '&.Mui-selected': {
                        bgcolor: darkTheme.accent,
                        color: darkTheme.text,
                        '&:hover': {
                          bgcolor: darkTheme.accent,
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="list">
                    <ViewListIcon />
                  </ToggleButton>
                  <ToggleButton value="grid">
                    <ViewModuleIcon />
                  </ToggleButton>
                  <ToggleButton value="compact">
                    <ViewComfyIcon />
                  </ToggleButton>
                </ToggleButtonGroup>

                <IconButton 
                  onClick={fetchMaterials}
                  disabled={loading}
                  size="small"
                  sx={{ 
                    color: darkTheme.textSecondary,
                    '&:hover': {
                      bgcolor: alpha(darkTheme.accent, 0.1),
                      color: darkTheme.accent,
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Contenido principal */}
      <Box sx={{ p: 3 }}>
        {filteredMaterials.length === 0 ? (
          <Paper elevation={1} sx={{ p: 8, textAlign: 'center', bgcolor: darkTheme.surface, border: `1px solid ${darkTheme.divider}` }}>
            <Avatar sx={{ bgcolor: darkTheme.accent, mx: 'auto', mb: 3, width: 80, height: 80 }}>
              <FolderOpenIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: darkTheme.text }}>
              {searchTerm || filterType !== 'all' || filterAccess !== 'all' 
                ? 'No se encontraron materiales' 
                : 'No hay materiales disponibles'
              }
            </Typography>
            <Typography variant="body1" sx={{ color: darkTheme.textSecondary, mb: 4 }}>
              {searchTerm || filterType !== 'all' || filterAccess !== 'all'
                ? 'Intenta cambiar los filtros de búsqueda.'
                : 'Los materiales aparecerán aquí cuando se suban.'
              }
            </Typography>
            {(isAdmin() || isTeacher()) && (
              <Button
                variant="contained"
                size="large"
                startIcon={<UploadIcon />}
                onClick={() => setShowUploadModal(true)}
                sx={{
                  bgcolor: darkTheme.accent,
                  '&:hover': {
                    bgcolor: '#1565c0',
                  }
                }}
              >
                Subir Primer Material
              </Button>
            )}
          </Paper>
        ) : (
          <>
            {/* Vista en Grid mejorada */}
            {viewMode === 'grid' && (
              <Grid container spacing={3}>
                {filteredMaterials.map((material) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={material._id}>
                    <Card
                      elevation={2}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        border: selectedMaterials.has(material._id) ? 2 : 1,
                        borderColor: selectedMaterials.has(material._id) ? darkTheme.accent : darkTheme.divider,
                        bgcolor: darkTheme.surface,
                        '&:hover': {
                          elevation: 6,
                          transform: 'translateY(-4px)',
                          borderColor: darkTheme.accent,
                        }
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: alpha(darkTheme.accent, 0.1) }}>
                            {getFileIcon(material)}
                          </Avatar>
                        }
                        action={
                          <IconButton
                            onClick={(e) => handleMenuClick(e, material)}
                            size="small"
                            sx={{ color: darkTheme.textSecondary }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                        title={
                          <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ color: darkTheme.text }}>
                            {material.title || material.nombre}
                          </Typography>
                        }
                        subheader={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            {getAccessIcon(material.isPublic)}
                            <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                              {material.isPublic ? 'Público' : 'Privado'}
                            </Typography>
                          </Box>
                        }
                        sx={{ pb: 1 }}
                      />
                      
                      <CardContent sx={{ flex: 1, pt: 0 }}>
                        <Typography variant="body2" sx={{ mb: 2, color: darkTheme.textSecondary }}>
                          {material.descripcion || 'Sin descripción'}
                        </Typography>
                        
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                              Tamaño:
                            </Typography>
                            <Typography variant="caption" fontWeight="medium" sx={{ color: darkTheme.text }}>
                              {material.fileSize ? formatFileSize(material.fileSize) : 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                              Subido:
                            </Typography>
                            <Typography variant="caption" fontWeight="medium" sx={{ color: darkTheme.text }}>
                              {formatDate(material.createdAt)}
                            </Typography>
                          </Box>
                          
                          {isAdmin() && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                                Propietario:
                              </Typography>
                              <Typography variant="caption" fontWeight="medium" sx={{ color: darkTheme.text }}>
                                {material.usuario?.split('@')[0] || 'N/A'}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                      
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          href={material.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                          sx={{
                            bgcolor: darkTheme.accent,
                            '&:hover': {
                              bgcolor: '#1565c0',
                            }
                          }}
                        >
                          Descargar
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Vista en Lista */}
            {viewMode === 'list' && (
              <TableContainer component={Paper} elevation={2} sx={{ bgcolor: darkTheme.surface, border: `1px solid ${darkTheme.divider}` }}>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(darkTheme.primary, 0.1) }}>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ color: darkTheme.text, borderColor: darkTheme.divider }}>
                        <Switch
                          checked={selectedMaterials.size === filteredMaterials.length && filteredMaterials.length > 0}
                          onChange={handleSelectAll}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: darkTheme.text, borderColor: darkTheme.divider }}>
                        <TableSortLabel
                          active={sortBy === 'title'}
                          direction={sortBy === 'title' ? sortOrder : 'asc'}
                          onClick={() => handleSortChange('title')}
                          sx={{ color: darkTheme.text }}
                        >
                          Archivo
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: darkTheme.text, borderColor: darkTheme.divider }}>Tipo</TableCell>
                      <TableCell sx={{ color: darkTheme.text, borderColor: darkTheme.divider }}>
                        <TableSortLabel
                          active={sortBy === 'fileSize'}
                          direction={sortBy === 'fileSize' ? sortOrder : 'asc'}
                          onClick={() => handleSortChange('fileSize')}
                          sx={{ color: darkTheme.text }}
                        >
                          Tamaño
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: darkTheme.text, borderColor: darkTheme.divider }}>
                        <TableSortLabel
                          active={sortBy === 'createdAt'}
                          direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                          onClick={() => handleSortChange('createdAt')}
                          sx={{ color: darkTheme.text }}
                        >
                          Fecha
                        </TableSortLabel>
                      </TableCell>
                      {isAdmin() && <TableCell sx={{ color: darkTheme.text, borderColor: darkTheme.divider }}>Acceso</TableCell>}
                      <TableCell align="center" sx={{ color: darkTheme.text, borderColor: darkTheme.divider }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow
                        key={material._id}
                        hover
                        selected={selectedMaterials.has(material._id)}
                      >
                        <TableCell padding="checkbox">
                          <Switch
                            checked={selectedMaterials.has(material._id)}
                            onChange={() => handleMaterialSelect(material._id)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {getFileIcon(material)}
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {material.title || material.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {material.descripcion}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getFileTypeFromExtension(material.title) || 'Archivo'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {material.fileSize ? formatFileSize(material.fileSize) : 'N/A'}
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
                              icon={getAccessIcon(material.isPublic)}
                              label={material.isPublic ? 'Público' : 'Privado'}
                              size="small"
                              color={material.isPublic ? 'success' : 'default'}
                            />
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, material)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Vista Compacta */}
            {viewMode === 'compact' && (
              <Stack spacing={1}>
                {filteredMaterials.map((material) => (
                  <Paper
                    key={material._id}
                    elevation={1}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        elevation: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      {getFileIcon(material)}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {material.title || material.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(material.createdAt)} • {material.fileSize ? formatFileSize(material.fileSize) : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getAccessIcon(material.isPublic)}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={material.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Descargar
                      </Button>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, material)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}

            {/* Paginación mejorada */}
            {pagination && pagination.totalPages > 1 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(_, page) => {
                    // Aquí puedes implementar la navegación a página específica
                    console.log('Navigate to page:', page);
                  }}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Speed Dial para acciones rápidas */}
      {(isAdmin() || isTeacher()) && !isMobile && (
        <SpeedDial
          ariaLabel="Acciones rápidas"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onOpen={() => setSpeedDialOpen(true)}
          onClose={() => setSpeedDialOpen(false)}
        >
          <SpeedDialAction
            icon={<CloudUploadIcon />}
            tooltipTitle="Subir Material"
            onClick={() => {
              setShowUploadModal(true);
              setSpeedDialOpen(false);
            }}
          />
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Actualizar"
            onClick={() => {
              fetchMaterials();
              setSpeedDialOpen(false);
            }}
          />
        </SpeedDial>
      )}

      {/* FAB para móviles */}
      {(isAdmin() || isTeacher()) && isMobile && (
        <Fab
          color="primary"
          aria-label="subir material"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setShowUploadModal(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component="a"
          href={selectedMaterial?.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Descargar</ListItemText>
        </MenuItem>
        
        {selectedMaterial?.viewUrl && (
          <MenuItem onClick={() => {
            handleImagePreview(selectedMaterial);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Vista previa</ListItemText>
          </MenuItem>
        )}
        
        {canDeleteMaterial(selectedMaterial) && (
          <MenuItem onClick={() => handleDeleteClick(selectedMaterial)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <WarningIcon />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Confirmar eliminación
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el material "{deleteConfirmation?.title}"?
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteConfirmation(null)} 
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de subida de materiales */}
      <Dialog
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '70vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudUploadIcon />
            <Typography variant="h6" fontWeight="bold">
              Subir Nuevos Materiales
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setShowUploadModal(false)} 
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <SubirArchivos
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            onClose={() => setShowUploadModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de vista de imagen */}
      {selectedImage && (
        <ImageViewer
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          image={selectedImage}
        />
      )}

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RepositorioProfesor;