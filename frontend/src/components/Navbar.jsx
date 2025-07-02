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

export default function ButtonAppBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="absolute"
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
            onClick={toggleDrawer(true)} // ✅ Abrir Drawer
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VAC Escuela de Música
          </Typography>

          <Button color="inherit">Inicio</Button>
          <Button color="inherit">Novedades</Button>
          <Button color="inherit">Nuestro Profesores</Button>
          <Button color="inherit">Galería</Button>
          <Button color="inherit">Reseñas</Button>
          <Button color="inherit">Iniciar</Button>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>

            {/* Botón de acceso */}
            <ListItem disablePadding>
              <ListItemButton>
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
                href="https://www.google.com/maps/place/VAC+Escuela+de+M%C3%BAsica/data=!4m2!3m1!1s0x0:0x79c67075a6aab5e3?sa=X&ved=1t:2428&ictx=111"
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
          <Divider sx={{ my: 2 }} />

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
