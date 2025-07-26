import React, { Suspense } from "react";
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
  CircularProgress,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import coverImage from "../assets/cover.png";
import { Link } from "react-router-dom";

const UserManager = React.lazy(() => import("./domain/users/UserManager"));
const CardsProfesoresManager = React.lazy(() => import("./domain/profesores/CardsProfesoresManager"));
const RepositorioProfesor = React.lazy(() => import("./domain/materials/RepositorioProfesor"));
const MensajeriaManager = React.lazy(() => import("./domain/messaging/MensajeriaManager"));
const AlumnosList = React.lazy(() => import("./domain/alumnos/AlumnosList"));
const TestimoniosManager = React.lazy(() => import("./domain/testimonios/TestimoniosManager"));
const GaleriaManager = React.lazy(() => import("./domain/galeria/GaleriaManager"));
const drawerWidth = 240;

// Professional loading component
const LoadingFallback = ({ message }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '300px',
      color: '#ffffff',
      backgroundColor: '#222222'
    }}
  >
    <CircularProgress sx={{ color: '#2196F3', mb: 2 }} size={40} />
    <Typography variant="h6" sx={{ color: '#ffffff' }}>
      {message}
    </Typography>
  </Box>
);

export default function ClippedDrawer() {
  const [activeModule, setActiveModule] = React.useState("inicio");
  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.email);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Limpiar el token del localStorage
    localStorage.removeItem("token");
    // Redirigir al login
    window.location.href = "/login";
  };

  return (
    <Box
      sx={{ display: "flex", backgroundColor: "#222222", minHeight: "100vh" }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ backgroundColor: "#333333" }}>
          <Typography variant="h6" noWrap component="div">
            Menú de Navegación
          </Typography>
          <img 
            src={coverImage}
            alt="Cover"
            style={{ width: "40%", height: "auto", marginLeft: "auto" }}
          />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#222222",
            color: "#FFFFFF",
          },
        }}
      >
        <Toolbar />
        <img
          src="/logo_blanco.svg"
          alt="Logo"
          style={{
            width: "50%",
            height: "auto",
            padding: "10px 0",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <Divider sx={{ borderColor: "#3F4147" }} />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {["Horario", "Estudiantes", "Profesores", "Clases"].map(
              (text, index) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      if (text === "Estudiantes") setActiveModule("alumnos");
                    }}
                  >
                    <ListItemIcon sx={{ color: "#FFFFFF" }}>
                      {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              )
            )}
          </List>
          <Divider sx={{ borderColor: "#3F4147" }} />
          <List>
            {[
              "Imágenes Galería",
              "Presentación Prof.",
              "Gestionar Reseñas",
            ].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (text === "Imágenes Galería") setActiveModule("galeria");
                    if (text === "Presentación Prof.")
                      setActiveModule("presentacion");
                    if (text === "Gestionar Reseñas")
                      setActiveModule("resenas");
                  }}
                >
                  <ListItemIcon sx={{ color: "#FFFFFF" }}>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ borderColor: "#3F4147" }} />
          <List>
            {["Repositorio Prof.", "Credenciales", "Mensajería"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (text === "Repositorio Prof.") setActiveModule("repositorio");
                    if (text === "Credenciales") setActiveModule("credenciales");
                    if (text === "Mensajería") setActiveModule("mensajeria");
                  }}
                >
                  <ListItemIcon sx={{ color: "#FFFFFF" }}>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <Link
          to="/"
          style={{
            display: "inline-block",
            width: "100%",
            padding: "10px",
            backgroundColor: "#333333",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            textAlign: "center",
            textDecoration: "none",
            marginBottom: "10px",
          }}
        >
          Volver al inicio
        </Link>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "10px",
            backgroundColor: "#d32f2f",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            textAlign: "center",
            textDecoration: "none",
            gap: "8px",
          }}
        >
          <LogoutIcon style={{ fontSize: "20px" }} />
          Cerrar Sesión
        </button>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, backgroundColor: "#222222", color: "#ffffff" }}
      >
        <Toolbar />
        {activeModule === "inicio" && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 }}>
              <AccountCircleIcon sx={{ fontSize: 40 }} />
              <Typography variant="h5">
                Bienvenido(a), {userName}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              Panel de administración de VAC Escuela de Música
            </Typography>
          </>
        )}
        {activeModule === "galeria" && (
          <Suspense fallback={<LoadingFallback message="Cargando Galería..." />}>
            <GaleriaManager />
          </Suspense>
        )}
        {activeModule === "credenciales" && (
          <Suspense fallback={<LoadingFallback message="Cargando Credenciales..." />}>
            <UserManager />
          </Suspense>
        )}
        {activeModule === "presentacion" && (
          <Suspense fallback={<LoadingFallback message="Cargando Presentación..." />}>
            <CardsProfesoresManager />
          </Suspense>
        )}
        {activeModule === "resenas" && (
          <Suspense fallback={<LoadingFallback message="Cargando Reseñas..." />}>
            <TestimoniosManager />
          </Suspense>
        )}
        {activeModule === "repositorio" && (
          <Suspense fallback={<LoadingFallback message="Cargando Repositorio..." />}>
            <RepositorioProfesor />
          </Suspense>
        )}
        {activeModule === "mensajeria" && (
          <Suspense fallback={<LoadingFallback message="Cargando Mensajería..." />}>
            <MensajeriaManager />
          </Suspense>
        )}
        {activeModule === "alumnos" && (
          <Suspense fallback={<LoadingFallback message="Cargando Estudiantes..." />}>
            <AlumnosList />
          </Suspense>
        )}
        {/* Puedes agregar más módulos así */}
      </Box>
    </Box>
  );
}

