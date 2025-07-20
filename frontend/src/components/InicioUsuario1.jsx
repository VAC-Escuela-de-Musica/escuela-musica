import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

import coverImage from "../assets/cover.png";
import { Link } from "react-router-dom";

import CarouselManager from "./CarouselManager";
import UserManager from "./UserManager";
import Clases from "./Clases";
import ClasesCrear from "./ClasesCrear";
import ClasesCanceladas from "./ClasesCanceladas";
import Horario from "./Horario";

const drawerWidth = 240;

export default function ClippedDrawer() {
  const [activeModule, setActiveModule] = React.useState("inicio");

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
                      if (text === "Horario") setActiveModule("horario");
                      /* if (text === "Estudiantes") setActiveModule("estudiantes");
                      if (text === "Profesores") setActiveModule("profesores"); */
                      if (text === "Clases") setActiveModule("clases");
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
              "Imágenes Carrusel",
              "Presentación Prof.",
              "Gestionar Reseñas",
            ].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (text === "Imágenes Carrusel")
                      setActiveModule("carrusel");
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
            {["Repositorio Prof.", "Credenciales", "modulo2"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (text === "Credenciales") setActiveModule("credenciales");
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
          }}
        >
          Volver al inicio
        </Link>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, backgroundColor: "#222222", color: "#ffffff" }}
      >
        <Toolbar />
        {activeModule === "inicio" && (
          <>
            <Typography sx={{ marginBottom: 2 }}>
              {/* Aquí tu texto de bienvenida o dashboard */}
              Bienvenido al panel de administración.
            </Typography>
          </>
        )}
        {activeModule === "carrusel" && <CarouselManager />}
        {activeModule === "credenciales" && <UserManager />}
        {activeModule === "horario" && <Horario setActiveModule={setActiveModule} />}
        {activeModule === "clases" && <Clases setActiveModule={setActiveModule} />}
        {activeModule === "clasesCanceladas" && <ClasesCanceladas setActiveModule={setActiveModule} />}
        {activeModule === "clasesCrear" && <ClasesCrear setActiveModule={setActiveModule} />}
        {/* Puedes agregar más módulos así */}
      </Box>
    </Box>
  );
}
