import mongoose from "mongoose";
import { DB_URL } from "../src/config/configEnv.js";

async function checkDatabase() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(DB_URL);
    console.log("✅ Conectado a MongoDB");

    // Obtener todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log("\n📋 Colecciones en la base de datos:");
    console.log("=====================================");
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`${collectionName}: ${count} documentos`);
      
      // Mostrar algunos documentos de ejemplo para colecciones no vacías
      if (count > 0 && count <= 5) {
        const documents = await mongoose.connection.db.collection(collectionName).find({}).limit(3).toArray();
        console.log(`   Ejemplos:`, documents.map(doc => ({ id: doc._id, ...(doc.nombre && { nombre: doc.nombre }), ...(doc.email && { email: doc.email }) })));
      } else if (count > 5) {
        console.log(`   (${count} documentos total)`);
      }
      console.log("---");
    }

    console.log("\n🔍 Verificación específica:");
    console.log("============================");
    
    const collectionsToCheck = ["cardsprofesores", "testimonios", "users", "galerias"];
    
    for (const collectionName of collectionsToCheck) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`${collectionName}: ${count} documentos`);
        
        if (count > 0) {
          const sample = await mongoose.connection.db.collection(collectionName).findOne({});
          console.log(`   Ejemplo:`, { id: sample._id, ...(sample.nombre && { nombre: sample.nombre }), ...(sample.email && { email: sample.email }) });
        }
      } catch (error) {
        console.log(`${collectionName}: Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Desconectado de MongoDB");
  }
}

// Ejecutar el script
checkDatabase(); 