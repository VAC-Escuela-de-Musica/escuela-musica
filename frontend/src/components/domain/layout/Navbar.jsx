import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useNavigate } from 'react-router-dom';

export default function ButtonAppBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleAccesoClick = () => {
    setDrawerOpen(false);
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <img
            src="/logo_blanco.svg"
            alt="Logo de la escuela"
            style={{ width: 50, height: 50, marginRight: 16 }}
          />

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VAC Escuela de Música
          </Typography>

          <Button color="inherit" component="a" href='#inicio'>Inicio</Button>
          <Button color="inherit" component="a" href="#carrusel">Novedades</Button>
          <Button color="inherit" component="a" href='#profesores'>Nuestro Profesores</Button>
          <Button color="inherit" component="a" href='#galeria'>Galería</Button>
          <Button color="inherit" component="a" href='#testimonios'>Reseñas</Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#323232',
            color: '#fff',
          },
        }}
      >
        <Box
          sx={{ 
            width: 250,
            '& .MuiListItemButton-root': {
              '&:hover': {
                backgroundColor: '#374151',
              }
            }
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {/* Botón de acceso */}
            <ListItem disablePadding>
              <ListItemButton onClick={handleAccesoClick}>
                <ListItemText primary="Acceso" />
              </ListItemButton>
            </ListItem>

            {/* Contacto */}
            <ListItem disablePadding>
              <ListItemButton component="a" href="mailto:contacto@vacmusica.cl">
                <ListItemText primary="Contacto" />
              </ListItemButton>
            </ListItem>

            {/* Ubicación */}
            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href="https://www.google.com/maps/place/VAC+Escuela+de+M%C3%BAsica/"
                target="_blank"
              >
                <ListItemText primary="Ubicación" />
              </ListItemButton>
            </ListItem>

            {/* Redes Sociales */}
            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href="https://www.instagram.com/vac_escuela_de_musica/"
                target="_blank"
              >
                <InstagramIcon sx={{ mr: 1 }} />
                <ListItemText primary="Instagram" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href="https://www.facebook.com/escuelademusicavac/"
                target="_blank"
              >
                <FacebookIcon sx={{ mr: 1 }} />
                <ListItemText primary="Facebook" />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Divisor */}
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Botones de usuario (después de login) */}
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="User Button 1" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="User Button 2" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="User Button 3" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
