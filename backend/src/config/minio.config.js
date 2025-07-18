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
  port: parseInt(process.env.MINIO_PORT), // Puerto S3
  useSSL: false, // Cambia a true solo si tu MinIO tiene SSL
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const BUCKET = process.env.MINIO_BUCKET;

export { minioClient, BUCKET };
