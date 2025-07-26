import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Pagination,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { CONFIG } from '../../../config/constants.js';
import { logger } from '../../../utils/logger.js';
import apiService from '../../../services/api.service.js';

/**
 * Componente genérico para listas de datos
 * Elimina duplicación de código en componentes de listado
 */
const DataList = ({
  // Configuración de datos
  apiEndpoint,
  itemKeyField = '_id',
  itemNameField = 'title',
  itemDescriptionField = 'description',
  
  // Configuración de display
  title = 'Lista de Datos',
  showSearch = true,
  showFilters = true,
  showPagination = true,
  showActions = true,
  
  // Configuración de filtros
  filterOptions = [],
  sortOptions = CONFIG.FILTER.SORT_OPTIONS,
  
  // Configuración de acciones
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  allowDownload = false,
  
  // Componentes personalizados
  CustomItemCard = null,
  CustomFilters = null,
  CustomActions = null,
  
  // Callbacks
  onItemClick = null,
  onItemCreate = null,
  onItemEdit = null,
  onItemDelete = null,
  onItemDownload = null,
  
  // Props adicionales
  refreshTrigger = 0,
  initialFilters = {},
  ...props
}) => {
  // Estado del componente
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estado de paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Estado de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState(sortOptions[0]?.value || '');
  
  // Estado de diálogos
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [filterDialog, setFilterDialog] = useState(false);

  // Cargar datos
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        page,
        limit: pageSize,
        search: searchTerm,
        sort: sortBy,
        ...filters
      };
      
      logger.data('Loading data with params:', queryParams);
      
      const response = await apiService.get(apiEndpoint, { queryParams });
      
      if (response.success) {
        setItems(response.data);
        setTotalItems(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 0);
        logger.success('Data loaded successfully:', response.data.length);
      } else {
        throw new Error(response.error || 'Error loading data');
      }
    } catch (err) {
      logger.error('Error loading data:', err);
      setError(err.message || CONFIG.MESSAGES.ERROR.NETWORK);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, page, pageSize, searchTerm, sortBy, filters]);

  // Efectos
  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  // Handlers
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRefresh = useCallback(() => {
    loadData();
    setSuccess(CONFIG.MESSAGES.INFO.LOADING);
  }, [loadData]);

  const handleDeleteClick = useCallback((item) => {
    setDeleteDialog({ open: true, item });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const { item } = deleteDialog;
    setLoading(true);
    
    try {
      if (onItemDelete) {
        await onItemDelete(item);
      } else {
        await apiService.delete(`${apiEndpoint}/${item[itemKeyField]}`);
      }
      
      setSuccess(CONFIG.MESSAGES.SUCCESS.DELETE);
      await loadData();
    } catch (err) {
      logger.error('Error deleting item:', err);
      setError(err.message || CONFIG.MESSAGES.ERROR.DELETE);
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, item: null });
    }
  }, [deleteDialog, onItemDelete, apiEndpoint, itemKeyField, loadData]);

  const handleEditClick = useCallback((item) => {
    if (onItemEdit) {
      onItemEdit(item);
    } else {
      logger.warn('Edit handler not implemented');
    }
  }, [onItemEdit]);

  const handleCreateClick = useCallback(() => {
    if (onItemCreate) {
      onItemCreate();
    } else {
      logger.warn('Create handler not implemented');
    }
  }, [onItemCreate]);

  const handleDownloadClick = useCallback(async (item) => {
    try {
      if (onItemDownload) {
        await onItemDownload(item);
      } else {
        const blob = await apiService.downloadFileById(item[itemKeyField]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item[itemNameField] || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      setSuccess(CONFIG.MESSAGES.SUCCESS.DOWNLOAD);
    } catch (err) {
      logger.error('Error downloading item:', err);
      setError(err.message || CONFIG.MESSAGES.ERROR.DOWNLOAD);
    }
  }, [onItemDownload, itemKeyField, itemNameField]);

  // Renderizado de componentes
  const renderSearchBar = () => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        fullWidth
        placeholder={`Buscar ${title.toLowerCase()}...`}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
        }}
        size="small"
      />
      {showFilters && (
        <IconButton onClick={() => setFilterDialog(true)}>
          <FilterIcon />
        </IconButton>
      )}
      <IconButton onClick={handleRefresh}>
        <RefreshIcon />
      </IconButton>
    </Box>
  );

  const renderToolbar = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {allowCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Crear
          </Button>
        )}
        {CustomActions && <CustomActions />}
      </Box>
    </Box>
  );

  const renderSort = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {totalItems} elementos encontrados
      </Typography>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Ordenar por</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          label="Ordenar por"
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  const renderDefaultItemCard = (item) => (
    <Card key={item[itemKeyField]}>
      <CardContent>
        <Typography variant="h6" component="h2" noWrap>
          {item[itemNameField]}
        </Typography>
        {item[itemDescriptionField] && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {item[itemDescriptionField]}
          </Typography>
        )}
        {item.type && (
          <Chip
            label={item.type}
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
      {showActions && (
        <CardActions>
          {allowEdit && (
            <IconButton size="small" onClick={() => handleEditClick(item)}>
              <EditIcon />
            </IconButton>
          )}
          {allowDownload && (
            <IconButton size="small" onClick={() => handleDownloadClick(item)}>
              <DownloadIcon />
            </IconButton>
          )}
          {allowDelete && (
            <IconButton size="small" onClick={() => handleDeleteClick(item)}>
              <DeleteIcon />
            </IconButton>
          )}
        </CardActions>
      )}
    </Card>
  );

  const renderItems = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (items.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {CONFIG.MESSAGES.INFO.NO_DATA}
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item[itemKeyField]}>
            {CustomItemCard ? (
              <CustomItemCard
                item={item}
                onEdit={allowEdit ? handleEditClick : null}
                onDelete={allowDelete ? handleDeleteClick : null}
                onDownload={allowDownload ? handleDownloadClick : null}
                onClick={onItemClick}
              />
            ) : (
              renderDefaultItemCard(item)
            )}
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderPagination = () => (
    showPagination && totalPages > 1 && (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    )
  );

  const renderDialogs = () => (
    <>
      {/* Diálogo de eliminación */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar "{deleteDialog.item?.[itemNameField]}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de filtros */}
      <Dialog open={filterDialog} onClose={() => setFilterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          {CustomFilters ? (
            <CustomFilters
              filters={filters}
              onChange={handleFilterChange}
              options={filterOptions}
            />
          ) : (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Filtros personalizados no implementados
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialog(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  const renderNotifications = () => (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        {renderToolbar()}
        {showSearch && renderSearchBar()}
        {renderSort()}
        {renderItems()}
        {renderPagination()}
      </Paper>
      {renderDialogs()}
      {renderNotifications()}
    </Box>
  );
};

export default DataList;
