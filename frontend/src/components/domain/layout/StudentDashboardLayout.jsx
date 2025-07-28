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
  Badge,
  useTheme,
  useMediaQuery,
  Fab,
  SwipeableDrawer
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  School as SchoolIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import './StudentDashboardLayout.css';

const drawerWidth = 280;

const StudentDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <>
      {/* Header del drawer */}
      <Box sx={{ 
        p: 2, 
        textAlign: 'center', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          🎓 VAC Música
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Panel de Estudiante
        </Typography>
      </Box>

      {/* Información del usuario */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'secondary.main',
              fontSize: '1.2rem'
            }}
          >
            {getInitials(user?.username)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.username || user?.email || 'Estudiante'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menú de navegación */}
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActiveRoute(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
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
                    fontWeight: isActiveRoute(item.path) ? 600 : 400,
                    fontSize: '0.95rem'
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
            borderRadius: 2,
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
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }} className="student-dashboard-layout">
      <CssBaseline />
      
      {/* AppBar superior */}
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <SchoolIcon sx={{ mr: 2, fontSize: { xs: 24, sm: 28 } }} />
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Área Estudiantil
          </Typography>
          
          {/* Información del usuario en el header - solo en desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'white', display: { xs: 'none', md: 'block' } }}>
                {user?.username || user?.email || 'Estudiante'}
              </Typography>
              <Avatar
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '0.875rem'
                }}
              >
                {getInitials(user?.username)}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para desktop */}
      {!isMobile && (
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
          {drawerContent}
        </Drawer>
      )}

      {/* Drawer móvil */}
      {isMobile && (
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={() => setMobileOpen(true)}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en móvil
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
            },
          }}
        >
          <Toolbar />
          {drawerContent}
        </SwipeableDrawer>
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          backgroundColor: 'background.default',
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar /> {/* Espacio para el AppBar */}
        <Outlet />
      </Box>

      {/* FAB para navegación móvil */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="menu"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          <MenuIcon />
        </Fab>
      )}
    </Box>
  );
};

export default StudentDashboardLayout; 