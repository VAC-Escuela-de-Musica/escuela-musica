import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Alumno from './src/core/models/alumnos.model.js';

dotenv.config();

async function addPhoneToPruebaWhatsapp() {
  try {
    console.log('🔧 Conectando a MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión exitosa a MongoDB');

    // Buscar al alumno "Prueba Whatsapp"
    const alumno = await Alumno.findOne({ 
      nombreAlumno: { $regex: /prueba whatsapp/i } 
    });

    if (!alumno) {
      console.error('❌ No se encontró el alumno "Prueba Whatsapp"');
      return;
    }

    console.log('👤 Alumno encontrado:', {
      nombre: alumno.nombreAlumno,
      rut: alumno.rutAlumno,
      telefono: alumno.telefonoAlumno || 'No configurado',
      email: alumno.email
    });

    // Número de teléfono de prueba (reemplaza con un número real)
    const telefonoPrueba = '+56964257112'; // Cambia este número por uno real

    // Actualizar el teléfono
    await Alumno.findByIdAndUpdate(alumno._id, {
      telefonoAlumno: telefonoPrueba
    });

    console.log(`✅ Teléfono agregado: ${telefonoPrueba}`);

    // Verificar la actualización
    const alumnoActualizado = await Alumno.findById(alumno._id);
    console.log('📱 Alumno actualizado:', {
      nombre: alumnoActualizado.nombreAlumno,
      rut: alumnoActualizado.rutAlumno,
      telefono: alumnoActualizado.telefonoAlumno,
      email: alumnoActualizado.email
    });

    console.log('\n💡 Ahora puedes probar las notificaciones de WhatsApp:');
    console.log('   node test-whatsapp-specific-student.js');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar script
addPhoneToPruebaWhatsapp(); 