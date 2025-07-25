import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  School as ProfessorIcon,
  Support as AssistantIcon
} from '@mui/icons-material';

/**
 * Tabla específica para usuarios con funcionalidades avanzadas
 * Mantiene toda la funcionalidad del UserManager original con tema oscuro
 */
const UserTable = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  specificLogic 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar datos basado en búsqueda
  const filteredData = data.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rut?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Datos paginados
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Configuración de colores por rol
  const roleConfig = {
    'administrador': {
      color: '#f44336',
      bgcolor: '#ffebee',
      icon: <AdminIcon sx={{ fontSize: 16 }} />,
      label: 'Admin'
    },
    'profesor': {
      color: '#2196f3',
      bgcolor: '#e3f2fd',
      icon: <ProfessorIcon sx={{ fontSize: 16 }} />,
      label: 'Profesor'
    },
    'asistente': {
      color: '#4caf50',
      bgcolor: '#e8f5e8',
      icon: <AssistantIcon sx={{ fontSize: 16 }} />,
      label: 'Asistente'
    }
  };

  // Manejo de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando usuarios...</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No hay usuarios registrados
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Haz clic en "Nuevo usuario" para agregar el primer usuario
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        backgroundColor: specificLogic?.tableProps?.theme === 'dark' ? '#1e1e1e' : 'background.paper',
        color: specificLogic?.tableProps?.theme === 'dark' ? '#ffffff' : 'text.primary'
      }}
    >
      {/* Barra de búsqueda */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por usuario, email o RUT..."
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
              backgroundColor: specificLogic?.tableProps?.theme === 'dark' ? '#2d2d2d' : 'background.paper',
              color: specificLogic?.tableProps?.theme === 'dark' ? '#ffffff' : 'text.primary'
            }
          }}
        />
      </Box>

      {/* Tabla */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#333', color: '#fff' }}>Usuario</TableCell>
              <TableCell sx={{ backgroundColor: '#333', color: '#fff' }}>Email</TableCell>
              <TableCell sx={{ backgroundColor: '#333', color: '#fff' }}>RUT</TableCell>
              <TableCell sx={{ backgroundColor: '#333', color: '#fff' }}>Rol</TableCell>
              <TableCell sx={{ backgroundColor: '#333', color: '#fff' }}>Estado</TableCell>
              <TableCell sx={{ backgroundColor: '#333', color: '#fff' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((user) => {
              const roleInfo = roleConfig[user.role] || roleConfig['asistente'];
              
              return (
                <TableRow 
                  key={user.id}
                  hover
                  sx={{
                    backgroundColor: specificLogic?.tableProps?.theme === 'dark' ? '#2d2d2d' : 'background.paper',
                    '&:hover': {
                      backgroundColor: specificLogic?.tableProps?.theme === 'dark' ? '#3d3d3d' : 'action.hover'
                    }
                  }}
                >
                  {/* Username */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="medium">
                        {user.username}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>

                  {/* RUT */}
                  <TableCell>
                    <Typography variant="body2">
                      {user.rut || '-'}
                    </Typography>
                  </TableCell>

                  {/* Rol */}
                  <TableCell>
                    <Chip
                      icon={roleInfo.icon}
                      label={roleInfo.label}
                      size="small"
                      sx={{
                        color: roleInfo.color,
                        backgroundColor: roleInfo.bgcolor,
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Chip
                      label={user.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={user.activo ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Editar usuario">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(user)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar usuario">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(user.id, user)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        sx={{
          backgroundColor: specificLogic?.tableProps?.theme === 'dark' ? '#1e1e1e' : 'background.paper',
          color: specificLogic?.tableProps?.theme === 'dark' ? '#ffffff' : 'text.primary'
        }}
      />
    </Paper>
  );
};

export default UserTable;