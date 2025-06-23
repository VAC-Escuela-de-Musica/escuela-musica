import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="absolute" 
        elevation={0}
        sx={{  backgroundColor: 'transparent',
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
    </Box>
  );
}