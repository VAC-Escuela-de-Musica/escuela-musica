import multer from "multer";
import path from "path";

// Configuración común - almacenamiento en memoria para ambos tipos
const storage = multer.memoryStorage();

// Filtro para imágenes
const imageFilter = (req, file, cb) => {
  // Solo permitir imágenes
  const allowedTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp, svg)"), false);
  }
};

// Filtro para materiales educativos
const materialFilter = (req, file, cb) => {
  // Solo permitir ciertos tipos de archivos
  const allowedTypes = [".pdf", ".docx", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

// Middleware para subir imágenes (con límites específicos)
const uploadImage = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10 MB para imágenes
    files: 1 // Solo un archivo a la vez
  },
  fileFilter: imageFilter
});

// Middleware para subir materiales educativos
const uploadMaterial = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB para materiales
  fileFilter: materialFilter
});

export { uploadImage, uploadMaterial };
