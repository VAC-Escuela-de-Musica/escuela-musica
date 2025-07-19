import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
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

// Configurar rate limiter para rutas protegidas
const protectedRoutesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por ventana
  message: "Demasiadas solicitudes desde esta IP, por favor inténtelo de nuevo más tarde.",
});

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
router.use(protectedRoutesLimiter, verifyJWT);

// Rutas de administrador
router.get("/admin", isAdmin, getAllImages); // Obtener todas las imágenes (admin)
router.post("/upload", isAdmin, upload.single("image"), uploadImage); // Subir imagen
router.put("/:id", isAdmin, updateImage); // Actualizar imagen
router.delete("/:id", isAdmin, deleteImage); // Eliminar imagen
router.put("/order/update", isAdmin, updateOrder); // Actualizar orden
router.patch("/:id/toggle", isAdmin, toggleStatus); // Cambiar estado activo/inactivo

export default router;
