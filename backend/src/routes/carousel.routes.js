import { Router } from "express";
import multer from "multer";
import {
  uploadImage,
  getImages,
  getAllImages,
  updateImage,
  deleteImage,
  updateOrder,
  toggleStatus,
} from "../controllers/carousel.controller.js";
import verifyJWT from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";

const router = Router();

// Configurar multer para manejar archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen"), false);
    }
  },
});

// Rutas públicas
router.get("/", getImages); // Obtener imágenes activas del carrusel

// Rutas protegidas (requieren autenticación)
router.use(verifyJWT);

// Rutas de administrador
router.get("/admin", isAdmin, getAllImages); // Obtener todas las imágenes (admin)
router.post("/upload", isAdmin, upload.single("image"), uploadImage); // Subir imagen
router.put("/:id", isAdmin, updateImage); // Actualizar imagen
router.delete("/:id", isAdmin, deleteImage); // Eliminar imagen
router.put("/order/update", isAdmin, updateOrder); // Actualizar orden
router.patch("/:id/toggle", isAdmin, toggleStatus); // Cambiar estado activo/inactivo

export default router;
