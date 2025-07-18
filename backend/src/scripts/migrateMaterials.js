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
let action = "check"; // Por defecto solo comprueba

/**
 * Migra un solo material
 */
async function migrateMaterial(material) {
  try {
    // Si ya tiene filename, es posible que ya esté usando el nuevo formato
    if (material.filename) {
      migrationLog.push(`ℹ️ Material ${material._id} - ${material.nombre} ya tiene filename: ${material.filename}`);
      
      // Marcar como migrado
      if (action === "migrate") {
        material.migrado = true;
        material.migracionFecha = new Date();
        await material.save();
        successCount++;
        migrationLog.push(`✅ Marcado como migrado: ${material._id} - ${material.nombre}`);
      } else if (action === "check") {
        successCount++;
        migrationLog.push(`✓ Verificado: ${material._id} - ${material.nombre} - Ya tiene formato nuevo`);
      }
      return true;
    }
    
    // Verificar si tiene ruta
    if (!material.ruta) {
      throw new Error(`Material no tiene ruta definida. Necesita asignación manual.`);
    }
    
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
    
    if (action === "check") {
      // Solo comprobar, no hacer cambios
      successCount++;
      migrationLog.push(`✓ Verificado: ${material._id} - ${material.nombre} - Listo para migrar`);
      return true;
    }
    
    if (action === "migrate") {
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
    }
    
    if (action === "rollback" && material.migrado) {
      // Hacer rollback de la migración
      material.migrado = false;
      material.migracionFecha = null;
      await material.save();
      
      successCount++;
      migrationLog.push(`↩️ Rollback: ${material._id} - ${material.nombre}`);
      return true;
    }
    
    return true;
  } catch (error) {
    errorCount++;
    migrationLog.push(`❌ Error en ${material._id}: ${error.message}`);
    return false;
  }
}

/**
 * Crea un registro manual para un material
 * Útil cuando el material original no existe o no tiene ruta
 */
async function createManualMigrationRecord(materialId) {
  try {
    // Buscar el material por ID
    const material = await Material.findById(materialId);
    if (!material) {
      console.log(`❌ Error: Material con ID ${materialId} no encontrado`);
      return false;
    }
    
    // Generar nuevo filename
    const extension = path.extname(material.nombreArchivo || "").substring(1) || "bin";
    const newKey = `${uuidv4()}.${extension}`;
    
    // Actualizar material con formato nuevo
    material.filename = newKey;
    material.bucketTipo = material.publico ? 'publico' : 'privado';
    material.migrado = false; // Se marca como no migrado para subida manual
    material.pendienteMigracionManual = true;
    
    await material.save();
    console.log(`✅ Material ${materialId} preparado para migración manual`);
    console.log(`   Nuevo filename: ${newKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al crear registro manual: ${error.message}`);
    return false;
  }
}

/**
 * Función principal para ejecutar la migración
 */
async function runMigration() {
  try {
    // Procesar parámetros
    action = process.argv[2] || "check";
    
    // Modo de creación manual para un material específico
    if (action === "manual" && process.argv[3]) {
      await setupDB();
      await createManualMigrationRecord(process.argv[3]);
      await mongoose.disconnect();
      process.exit(0);
    }
    
    if (!["check", "migrate", "rollback", "manual"].includes(action)) {
      console.log("Acción no válida. Uso: node migrateMaterials.js [check|migrate|rollback|manual <id>]");
      process.exit(1);
    }
    
    console.log(`🚀 Iniciando ${action === "check" ? "verificación" : action === "migrate" ? "migración" : "rollback"} de materiales...`);
    
    // Conectar a MongoDB
    await setupDB();
    console.log("✅ Conexión a MongoDB establecida");
    
    // Obtener materiales según la acción
    let materialsQuery = {};
    if (action === "migrate" || action === "check") {
      materialsQuery = { migrado: { $ne: true } };
    } else if (action === "rollback") {
      materialsQuery = { migrado: true };
    }
    
    const materialsToProcess = await Material.find(materialsQuery);
    
    console.log(`📦 Total de materiales a procesar: ${materialsToProcess.length}`);
    
    if (materialsToProcess.length === 0) {
      console.log(`✅ No hay materiales para ${action}`);
      process.exit(0);
    }
    
    // Procesar todos los materiales
    for (const material of materialsToProcess) {
      await migrateMaterial(material);
    }
    
    // Mostrar resultados
    console.log("\n======= RESULTADO =======");
    console.log(`✅ Procesados con éxito: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log("\n======= LOG DETALLADO =======");
    migrationLog.forEach(log => console.log(log));
    
  } catch (error) {
    console.error("Error durante el proceso:", error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Ejecutar migración
runMigration();
