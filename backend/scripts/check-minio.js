import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configurar dotenv para cargar desde la raíz del backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

import { setupMinIO } from "../src/config/minio.config.js";
import minioClient, { MINIO_BUCKET_NAME } from "../src/config/minio.config.js";

async function checkMinIO() {
  try {
    console.log("🔍 Verificando configuración de MinIO...");
    
    // Verificar variables de entorno
    const requiredEnvVars = [
      'MINIO_ENDPOINT',
      'MINIO_PORT', 
      'MINIO_ACCESS_KEY',
      'MINIO_SECRET_KEY',
      'MINIO_BUCKET_NAME'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error("❌ Variables de entorno faltantes:", missingVars);
      console.log("📝 Crea un archivo .env en la carpeta backend con las siguientes variables:");
      console.log(`
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=gps-vac-images
      `);
      return;
    }
    
    console.log("✅ Variables de entorno configuradas correctamente");
    
    // Verificar conectividad con MinIO
    console.log("🔗 Verificando conectividad con MinIO...");
    await setupMinIO();
    
    // Verificar si el bucket existe
    const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    if (bucketExists) {
      console.log(`✅ Bucket "${MINIO_BUCKET_NAME}" existe y es accesible`);
    } else {
      console.log(`❌ Bucket "${MINIO_BUCKET_NAME}" no existe`);
    }
    
    console.log("🎉 MinIO está configurado correctamente!");
    
  } catch (error) {
    console.error("❌ Error al verificar MinIO:", error.message);
    console.log("\n🔧 Soluciones posibles:");
    console.log("1. Asegúrate de que MinIO esté ejecutándose en el puerto 9000");
    console.log("2. Verifica que las credenciales sean correctas");
    console.log("3. Crea un archivo .env con las variables necesarias");
  }
}

checkMinIO(); 