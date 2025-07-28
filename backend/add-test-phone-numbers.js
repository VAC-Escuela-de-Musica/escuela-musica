import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Alumno from './src/core/models/alumnos.model.js';

dotenv.config();

async function addTestPhoneNumbers() {
  try {
    console.log('🔧 Conectando a MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión exitosa a MongoDB');

    // Buscar estudiantes sin teléfono
    const estudiantesSinTelefono = await Alumno.find({
      $or: [
        { telefono: { $exists: false } },
        { telefono: null },
        { telefono: '' }
      ]
    });

    console.log(`📊 Encontrados ${estudiantesSinTelefono.length} estudiantes sin teléfono`);

    if (estudiantesSinTelefono.length === 0) {
      console.log('✅ Todos los estudiantes ya tienen teléfono configurado');
      return;
    }

    // Números de teléfono de prueba (reemplaza con números reales)
    const telefonosPrueba = [
      '+56912345678',
      '+56987654321',
      '+56911223344',
      '+56955667788',
      '+56999887766'
    ];

    let actualizados = 0;
    for (let i = 0; i < Math.min(estudiantesSinTelefono.length, telefonosPrueba.length); i++) {
      const estudiante = estudiantesSinTelefono[i];
      const telefono = telefonosPrueba[i];
      
      try {
        await Alumno.findByIdAndUpdate(estudiante._id, {
          telefono: telefono
        });
        
        console.log(`✅ ${estudiante.nombreAlumno} (${estudiante.rutAlumno}): ${telefono}`);
        actualizados++;
      } catch (error) {
        console.error(`❌ Error actualizando ${estudiante.nombreAlumno}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   • Estudiantes procesados: ${actualizados}`);
    console.log(`   • Números agregados: ${actualizados}`);

    if (actualizados > 0) {
      console.log('\n💡 Ahora puedes probar las notificaciones de WhatsApp:');
      console.log('   node test-whatsapp-real-notifications.js');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar script
addTestPhoneNumbers(); 