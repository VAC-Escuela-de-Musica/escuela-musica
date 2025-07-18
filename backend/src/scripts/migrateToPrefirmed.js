/**
 * [OBSOLETO] Script para migrar materiales desde el sistema legacy al sistema basado en URLs pre-firmadas
 * Este script ya no es necesario ya que la migración se completó, pero se mantiene como referencia histórica.
 */

import mongoose from "mongoose";
import Material from "../models/material.entity.js";
import { minioClient, BUCKET } from "../config/minio.config.js";
import { setupDB } from "../config/configDB.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const migrationLog = [];
let errorCount = 0;
let successCount = 0;

/**
 * Migra un solo material
 */
async function migrateMaterial(material) {
  try {
    const sourceKey = material.ruta;
    const extension = path.extname(material.nombreArchivo || "").substring(1) || "bin";
    const newKey = `${uuidv4()}.${extension}`;
    const bucket = material.publico ? 
      (process.env.MINIO_PUBLIC_BUCKET || 'imagenes-publicas') : 
      BUCKET;
    
    // Verificar si el archivo existe en MinIO
    try {
      await minioClient.statObject(BUCKET, sourceKey);
    } catch (err) {
      throw new Error(`Archivo original no existe en MinIO: ${sourceKey}`);
    }
    
    // Copia el archivo al nuevo bucket con nuevo nombre
    await minioClient.copyObject(
      bucket,
      newKey,
      `/${BUCKET}/${sourceKey}`,
      null
    );
    
    // Actualizar datos del material
    material.filename = newKey;
    material.bucketTipo = material.publico ? 'publico' : 'privado';
    material.migrado = true;
    material.migracionFecha = new Date();
    
    await material.save();
    
    successCount++;
    migrationLog.push(`✅ Migrado: ${material._id} - ${material.nombre}`);
    return true;
  } catch (error) {
    errorCount++;
    migrationLog.push(`❌ Error migrando ${material._id}: ${error.message}`);
    return false;
  }
}

/**
 * Función principal para ejecutar la migración
 */
async function runMigration() {
  try {
    console.log("🚀 Iniciando migración de materiales...");
    
    // Conectar a MongoDB
    await setupDB();
    console.log("✅ Conexión a MongoDB establecida");
    
    // Obtener materiales no migrados
    const materialsToMigrate = await Material.find({ 
      migrado: { $ne: true }
    });
    
    console.log(`📦 Total de materiales a migrar: ${materialsToMigrate.length}`);
    
    if (materialsToMigrate.length === 0) {
      console.log("✅ No hay materiales para migrar");
      process.exit(0);
    }
    
    // Migrar todos los materiales
    for (const material of materialsToMigrate) {
      await migrateMaterial(material);
    }
    
    // Mostrar resultados
    console.log("\n======= RESULTADO DE LA MIGRACIÓN =======");
    console.log(`✅ Migrados con éxito: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log("\n======= LOG DE MIGRACIÓN =======");
    migrationLog.forEach(log => console.log(log));
    
  } catch (error) {
    console.error("Error durante la migración:", error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Ejecutar migración
runMigration();
