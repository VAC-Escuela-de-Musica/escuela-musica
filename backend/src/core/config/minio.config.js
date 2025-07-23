import { Client } from "minio";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "url";

// Obtener __filename y __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto
const envFilePath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envFilePath });

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT, // IP o dominio de MinIO
  port: parseInt(process.env.MINIO_PORT || '9000'), // Puerto S3
  useSSL: process.env.MINIO_USE_SSL === 'true', // Cambia a true solo si tu MinIO tiene SSL
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const BUCKET_PRIVATE = process.env.MINIO_BUCKET_PRIVATE;
const BUCKET_PUBLIC = process.env.MINIO_BUCKET_PUBLIC;
const BUCKET_GALERY = process.env.MINIO_BUCKET_GALERY;


// Función para inicializar MinIO y crear buckets
async function setupMinIO() {
  try {
    console.log("🔧 Inicializando MinIO...");
    
    const buckets = [
      { name: BUCKET_PRIVATE, label: "Materiales Privados" },
      { name: BUCKET_PUBLIC, label: "Materiales Públicos" },
      { name: BUCKET_GALERY, label: "Galería de Imágenes" }
    ];
    
    for (const bucket of buckets) {
      const bucketExists = await minioClient.bucketExists(bucket.name);
      if (!bucketExists) {
        await minioClient.makeBucket(bucket.name, 'us-east-1');
        console.log(`✅ Bucket "${bucket.name}" (${bucket.label}) creado exitosamente`);
      } else {
        console.log(`✅ Bucket "${bucket.name}" (${bucket.label}) ya existe`);
      }
    }
    
    console.log("🎉 MinIO inicializado correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error inicializando MinIO:", error.message);
    return false;
  }
}

export { minioClient, BUCKET_PRIVATE, BUCKET_PUBLIC, BUCKET_GALERY, setupMinIO };
