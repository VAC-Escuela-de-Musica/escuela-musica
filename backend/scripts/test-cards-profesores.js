"use strict";
import { setupDB } from "../src/config/configDB.js";
import CardsProfesores from "../src/models/cardsProfesores.entity.js";

async function testCardsProfesores() {
  try {
    console.log("🔧 Iniciando prueba de tarjetas de profesores...");
    
    // Conectar a la base de datos
    await setupDB();
    
    // Crear algunas tarjetas de prueba
    const tarjetasPrueba = [
      {
        nombre: "María López",
        especialidad: "Canto Lírico y Técnica Vocal",
        descripcion: "Especialista en canto lírico y técnica vocal. Con más de 10 años de experiencia en la enseñanza musical, María ha formado a numerosos estudiantes que han destacado en competencias nacionales e internacionales.",
        imagen: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60",
      },
      {
        nombre: "Carlos Pérez",
        especialidad: "Guitarra Clásica y Eléctrica",
        descripcion: "Profesor de guitarra clásica y eléctrica. Músico profesional con amplia experiencia en diferentes géneros musicales, desde clásico hasta rock y jazz.",
        imagen: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60",
      },
      {
        nombre: "Ana Rodríguez",
        especialidad: "Piano Clásico",
        descripcion: "Pianista clásica y profesora de piano. Graduada del Conservatorio Nacional con especialización en pedagogía musical para niños y jóvenes.",
        imagen: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60",
      },
    ];

    console.log("📝 Creando tarjetas de prueba...");
    
    for (const tarjeta of tarjetasPrueba) {
      const nuevaTarjeta = new CardsProfesores(tarjeta);
      await nuevaTarjeta.save();
      console.log(`✅ Tarjeta creada: ${tarjeta.nombre}`);
    }

    // Obtener todas las tarjetas
    console.log("\n📋 Obteniendo todas las tarjetas...");
    const todasLasTarjetas = await CardsProfesores.find({ activo: true });
    console.log(`✅ Se encontraron ${todasLasTarjetas.length} tarjetas activas`);

    // Mostrar detalles de las tarjetas
    todasLasTarjetas.forEach((tarjeta, index) => {
      console.log(`\n--- Tarjeta ${index + 1} ---`);
      console.log(`ID: ${tarjeta._id}`);
      console.log(`Nombre: ${tarjeta.nombre}`);
      console.log(`Especialidad: ${tarjeta.especialidad}`);
      console.log(`Descripción: ${tarjeta.descripcion.substring(0, 50)}...`);
      console.log(`Imagen: ${tarjeta.imagen}`);
      console.log(`Activo: ${tarjeta.activo}`);
      console.log(`Creado: ${tarjeta.createdAt}`);
    });

    console.log("\n🎉 Prueba completada exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la prueba:", error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testCardsProfesores(); 