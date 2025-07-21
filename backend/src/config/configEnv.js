"use strict";
// Import the 'path' module to get the absolute path of the .env file
import path from "node:path";
import { fileURLToPath } from "url";

// Obtener __filename y __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Get the absolute path of the .env file. */
const envFilePath = path.resolve(__dirname, "../../.env");
// Load environment variables from the .env file
// ...existing code...
import dotenv from "dotenv";
const result = dotenv.config({ path: envFilePath });
if (result.error) {
  // eslint-disable-next-line no-console
  console.error("[dotenv] Error cargando .env:", result.error);
  // ...existing code...
} else {
  // eslint-disable-next-line no-console
  console.log("[dotenv] Variables de entorno cargadas correctamente");
  // eslint-disable-next-line no-console
  console.log("[dotenv] DB_URL:", process.env.DB_URL);
  // eslint-disable-next-line no-console
  console.log("[dotenv] MINIO_ENDPOINT:", process.env.MINIO_ENDPOINT);
  // ...existing code...
}
dotenv.config({ path: envFilePath });


// Logs de depuración para todas las variables de entorno importantes
console.log("[DEBUG] DB_URL:", process.env.DB_URL);
console.log("[DEBUG] PORT:", process.env.PORT);
console.log("[DEBUG] HOST:", process.env.HOST);
console.log("[DEBUG] ACCESS_JWT_SECRET:", process.env.ACCESS_JWT_SECRET);
console.log("[DEBUG] REFRESH_JWT_SECRET:", process.env.REFRESH_JWT_SECRET);
console.log("[DEBUG] MINIO_ENDPOINT:", process.env.MINIO_ENDPOINT);
console.log("[DEBUG] MINIO_PORT:", process.env.MINIO_PORT);
console.log("[DEBUG] MINIO_ACCESS_KEY:", process.env.MINIO_ACCESS_KEY);
console.log("[DEBUG] MINIO_SECRET_KEY:", process.env.MINIO_SECRET_KEY);
console.log("[DEBUG] MINIO_BUCKET:", process.env.MINIO_BUCKET);
console.log("[DEBUG] MINIO_PUBLIC_BUCKET:", process.env.MINIO_PUBLIC_BUCKET);

/** Server port */
export const PORT = process.env.PORT;
/** Server host */
export const HOST = process.env.HOST;
/** Database URL */
export const DB_URL = process.env.DB_URL;
/** Access token secret */
export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;
/** Refresh token secret */
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;

/** MinIO Configuration */
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
export const MINIO_PORT = parseInt(process.env.MINIO_PORT) || 9000;
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET || "carousel-images";
