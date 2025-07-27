import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
  Box,
  Drawer,
  AppBar,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Badge
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const StudentDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login-estudiante');
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const menuItems = [
    {
      text: 'Inicio',
      icon: <HomeIcon />,
      path: '/estudiante',
      badge: null
    },
    {
      text: 'Mensajes',
      icon: <MessageIcon />,
      path: '/estudiante/mensajes',
      badge: 3 // Ejemplo de mensajes no leídos
    },
    {
      text: 'Mi Perfil',
      icon: <PersonIcon />,
      path: '/estudiante/perfil',
      badge: null
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* AppBar superior */}
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main'
        }}
      >
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Área Estudiantil
          </Typography>
          
          {/* Información del usuario en el header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {user?.username || user?.email || 'Estudiante'}
            </Typography>
            <Avatar
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'secondary.main',
                fontSize: '0.875rem'
              }}
            >
              {getInitials(user?.username)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        <Toolbar /> {/* Espacio para el AppBar */}
        
        {/* Logo o título del sidebar */}
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            🎓 VAC Música
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Panel de Estudiante
          </Typography>
        </Box>

        {/* Menú de navegación */}
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isActiveRoute(item.path)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      }
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActiveRoute(item.path) ? 'primary.main' : 'inherit',
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isActiveRoute(item.path) ? 600 : 400
                    }}
                  />
                  {item.badge && (
                    <Badge 
                      badgeContent={item.badge} 
                      color="error"
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Sección inferior con logout */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              backgroundColor: 'error.light',
              color: 'error.contrastText',
              '&:hover': {
                backgroundColor: 'error.main',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Cerrar Sesión" 
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Espacio para el AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default StudentDashboardLayout; 