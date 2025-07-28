import { useState, useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { ArrowCircleLeftOutlined } from '@mui/icons-material';

const API_URL = `${import.meta.env.VITE_API_URL}/api/clases`;

const ClasesCanceladas = ({ setActiveModule = null }) => {
  const [canceledClases, setCanceledClases] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState("todas");
  const [nombresProfesores, setNombresProfesores] = useState({});

  const fetchAutenticado = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    return response;
  };

  const obtenerNombreProfesor = async (id) => {
    if (!id || nombresProfesores[id]) return;
    try {
      const response = await fetchAutenticado(`${API_URL}/profesor/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNombresProfesores(prev => ({ ...prev, [id]: data.data.nombreCompleto }));
      }
    } catch (error) {
      console.error("Error al obtener nombre del profesor:", error);
    }
  };

  const fetchCanceledClasses = async () => {
    try {
      const response = await fetchAutenticado(`${API_URL}/canceled_all`);
      if (!response.ok) {
        throw new Error("Error al obtener las clases canceladas.");
      }
      const data = await response.json();
      setCanceledClases(data.data);
      data.data.forEach(clase => obtenerNombreProfesor(clase.profesor));
    } catch (error) {
      console.error(error);
      setCanceledClases([]);
    }
  };

  const fetchPreviousCanceledClasses = async () => {
    try {
      const response = await fetchAutenticado(`${API_URL}/canceled_previous`);
      if (!response.ok) {
        throw new Error("Error al obtener las clases canceladas anteriores.");
      }
      const data = await response.json();
      setCanceledClases(data.data);
      data.data.forEach(clase => obtenerNombreProfesor(clase.profesor));
    } catch (error) {
      console.error(error);
      setCanceledClases([]);
    }
  };

  const fetchTodayCanceledClasses = async () => {
    try {
      const response = await fetchAutenticado(`${API_URL}/canceled_today`);
      if (!response.ok) {
        throw new Error("Error al obtener las clases canceladas de hoy.");
      }
      const data = await response.json();
      setCanceledClases(data.data);
      data.data.forEach(clase => obtenerNombreProfesor(clase.profesor));
    } catch (error) {
      console.error(error);
      setCanceledClases([]);
    }
  };

  const fetchNextCanceledClasses = async () => {
    try {
      const response = await fetchAutenticado(`${API_URL}/canceled_next`);
      if (!response.ok) {
        throw new Error("Error al obtener las clases canceladas próximas.");
      }
      const data = await response.json();
      setCanceledClases(data.data);
      data.data.forEach(clase => obtenerNombreProfesor(clase.profesor));
    } catch (error) {
      console.error(error);
      setCanceledClases([]);
    }
  };

  useEffect(() => {
    switch (filtroActivo) {
      case "anteriores":
        fetchPreviousCanceledClasses();
        break;
      case "hoy":
        fetchTodayCanceledClasses();
        break;
      case "proximas":
        fetchNextCanceledClasses();
        break;
      default:
        fetchCanceledClasses();
    }
  }, [filtroActivo]);

  return (
    <Box sx={{ color: "white", marginLeft: 3, marginRight: 3 }}>
      <Typography variant="h4" gutterBottom>
        Clases Canceladas
      </Typography>

      <Box display={"flex"} justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" gutterBottom>
          {filtroActivo === "anteriores" && "Listado de clases canceladas anteriores"}
          {filtroActivo === "hoy" && "Listado de clases canceladas de hoy"}
          {filtroActivo === "proximas" && "Listado de clases canceladas próximas"}
          {filtroActivo === "todas" && "Listado de todas las clases canceladas"}
        </Typography>
        <Box display={"flex"} gap={1}>
          <Button
            variant="outlined"
            onClick={() => {
              setFiltroActivo("anteriores");
              fetchPreviousCanceledClasses();
            }}
            disabled={filtroActivo === "anteriores"}
            sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
          >
            Anteriores
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setFiltroActivo("hoy");
              fetchTodayCanceledClasses();
            }}
            disabled={filtroActivo === "hoy"}
            sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
          >
            Hoy
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setFiltroActivo("proximas");
              fetchNextCanceledClasses();
            }}
            disabled={filtroActivo === "proximas"}
            sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
          >
            Próximas
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setFiltroActivo("todas");
              fetchCanceledClasses();
            }}
            disabled={filtroActivo === "todas"}
            sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
          >
            Todas
          </Button>
        </Box>
      </Box>

      <Box>
        {canceledClases.length === 0 ? (
          <Typography>
            {filtroActivo === "anteriores" && "No hay clases canceladas anteriores."}
            {filtroActivo === "hoy" && "No hay clases canceladas hoy."}
            {filtroActivo === "proximas" && "No hay clases canceladas próximas."}
            {filtroActivo === "todas" && "No hay clases canceladas."}
          </Typography>
        ) : (
          canceledClases.map((clase, index) => (
            <Box
              display={"flex"}
              justifyContent="space-between"
              alignItems="center"
              key={index}
              sx={{ mb: 2, p: 2, border: "1px solid #F75C03", borderRadius: 1 }}
            >
              <Box>
                <Typography><strong>Título:</strong> {clase.titulo}</Typography>
                <Typography><strong>Descripción:</strong> {clase.descripcion}</Typography>
                <Typography><strong>Estado:</strong> {clase.estado}</Typography>
                <Typography><strong>Profesor:</strong> {nombresProfesores[clase.profesor] }</Typography>
                <Typography><strong>Sala:</strong> {clase.sala}</Typography>
                <Typography><strong>Fecha:</strong> {clase.horarios[0].dia}</Typography>
                <Typography><strong>Hora Inicio:</strong> {clase.horarios[0].horaInicio}</Typography>
                <Typography><strong>Hora Fin:</strong> {clase.horarios[0].horaFin}</Typography>
                
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ClasesCanceladas;