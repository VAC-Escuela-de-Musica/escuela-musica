import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";

const CarouselManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(() => {
    const saved = localStorage.getItem("carousel_openDialog");
    return saved === "true";
  });
  const [editingImage, setEditingImage] = useState(() => {
    const saved = localStorage.getItem("carousel_editingImage");
    return saved ? JSON.parse(saved) : null;
  });
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    image: null,
  });

  const API_URL = `${import.meta.env.VITE_API_URL}/carousel`;

  // Cargar imágenes al montar el componente
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar las imágenes");
      }

      const data = await response.json();
      // ...existing code...
      // Asegúrate de que siempre sea un array
      setImages(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError("Error al cargar las imágenes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("descripcion", formData.descripcion);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const url = editingImage 
        ? `${API_URL}/${editingImage._id}`
        : `${API_URL}/upload`;

      const method = editingImage ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          ...(editingImage && { "Content-Type": "application/json" }),
        },
        body: editingImage ? JSON.stringify(formData) : formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Error al guardar la imagen");
      }

      setOpenDialog(false);
      setEditingImage(null);
      setFormData({ titulo: "", descripcion: "", image: null });
      fetchImages();
    } catch (err) {
      setError("Error al guardar la imagen: " + err.message);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la imagen");
      }

      fetchImages();
    } catch (err) {
      setError("Error al eliminar la imagen: " + err.message);
    }
  };

  const handleToggleStatus = async (imageId) => {
    try {
      const response = await fetch(`${API_URL}/${imageId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cambiar el estado");
      }

      fetchImages();
    } catch (err) {
      setError("Error al cambiar el estado: " + err.message);
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      titulo: image.titulo,
      descripcion: image.descripcion || "",
      image: null,
    });
    setOpenDialog(true);
    localStorage.setItem("carousel_editingImage", JSON.stringify(image));
    localStorage.setItem("carousel_openDialog", "true");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingImage(null);
    setFormData({ titulo: "", descripcion: "", image: null });
    localStorage.setItem("carousel_editingImage", JSON.stringify(null));
    localStorage.setItem("carousel_openDialog", "false");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#222222", minHeight: "100vh", color: "white" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión del Carrusel
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ backgroundColor: "#4CAF50" }}
        >
          Agregar Imagen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(images) && images.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image._id}>
            <Card sx={{ backgroundColor: "#333333", color: "white" }}>
              <CardMedia
                component="img"
                height="200"
                image={image.url}
                alt={image.titulo}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {image.titulo}
                </Typography>
                <Typography variant="body2" color="gray" mb={2}>
                  {image.descripcion}
                </Typography>
                <Typography variant="caption" display="block" mb={1}>
                  Orden: {image.orden}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={image.activo}
                        onChange={() => handleToggleStatus(image._id)}
                        color="primary"
                      />
                    }
                    label={image.activo ? "Activo" : "Inactivo"}
                    sx={{ color: "white" }}
                  />
                  <Box>
                    <IconButton
                      onClick={() => handleEdit(image)}
                      sx={{ color: "white" }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(image._id)}
                      sx={{ color: "red" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para agregar/editar imagen */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#333333", color: "white" }}>
          {editingImage ? "Editar Imagen" : "Agregar Nueva Imagen"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#333333", color: "white" }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Título"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: "white" } }}
              InputLabelProps={{ sx: { color: "gray" } }}
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: "white" } }}
              InputLabelProps={{ sx: { color: "gray" } }}
            />
            {!editingImage && (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                style={{ marginBottom: "16px" }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#333333" }}>
          <Button onClick={handleCloseDialog} sx={{ color: "white" }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: "#4CAF50" }}>
            {editingImage ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarouselManager; 