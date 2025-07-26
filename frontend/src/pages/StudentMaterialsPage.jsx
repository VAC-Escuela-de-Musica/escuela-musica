import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';

const StudentMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.materials.getAll, {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar los materiales');
      }

      const data = await response.json();
      setMaterials(data.data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('No se pudieron cargar los materiales');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileTypeIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return '🎵';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎬';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Biblioteca de Materiales
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Explora todos los materiales de estudio disponibles
        </Typography>
        
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/estudiante">
            Inicio
          </Link>
          <Typography color="text.primary">Materiales</Typography>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar materiales por título, descripción o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
            }
          }}
        />
      </Box>

      {/* Resultados */}
      {filteredMaterials.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No se encontraron materiales que coincidan con tu búsqueda' : 'No hay materiales disponibles'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredMaterials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    color: '#666'
                  }}
                >
                  {getFileTypeIcon(material.archivo)}
                </CardMedia>
                
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {material.titulo}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {material.descripcion || 'Sin descripción disponible'}
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                    {material.categoria && (
                      <Chip 
                        label={material.categoria} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(material.tamano)}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        {new Date(material.fechaCreacion).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Estadísticas */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Estadísticas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total de materiales
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {materials.length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Categorías únicas
                </Typography>
                <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold' }}>
                  {new Set(materials.map(m => m.categoria).filter(Boolean)).size}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Materiales encontrados
                </Typography>
                <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {filteredMaterials.length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Tamaño total
                </Typography>
                <Typography variant="h5" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {formatFileSize(materials.reduce((acc, m) => acc + (m.tamano || 0), 0))}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default StudentMaterialsPage; 