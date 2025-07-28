import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationService from './src/features/communication/services/notification.service.js';
import Clase from './src/features/clases-management/models/clase.entity.js';
import User from './src/core/models/user.model.js';
import Alumno from './src/core/models/alumnos.model.js';
import Role from './src/core/models/role.model.js';

dotenv.config();

async function testCambioHorarioNotification() {
  try {
    console.log('🔧 Conectando a MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión exitosa a MongoDB');

    // Buscar un usuario administrador
    const adminUser = await User.findOne().populate('roles');
    if (!adminUser) {
      console.error('❌ No se encontró ningún usuario administrador');
      return;
    }
    console.log('👤 Usuario administrador encontrado:', adminUser.email);

    // Buscar una clase con estudiantes y profesor asignado
    const clase = await Clase.findOne({
      'estudiantes.0': { $exists: true },
      profesor: { $exists: true, $ne: null },
      estado: 'programada'
    }).populate('estudiantes.alumno').populate('profesor');

    if (!clase) {
      console.error('❌ No se encontró ninguna clase con estudiantes y profesor');
      return;
    }

    console.log('📚 Clase encontrada:', {
      id: clase._id,
      titulo: clase.titulo,
      estudiantes: clase.estudiantes.length,
      profesor: clase.profesor ? clase.profesor.email : 'No asignado'
    });

    // Mostrar información de los estudiantes
    console.log('👥 Estudiantes en la clase:');
    clase.estudiantes.forEach((estudiante, index) => {
      console.log(`  ${index + 1}. ${estudiante.alumno.nombreAlumno} (${estudiante.alumno.rutAlumno})`);
      console.log(`     📧 Email: ${estudiante.alumno.email || 'No disponible'}`);
      console.log(`     📱 Teléfono: ${estudiante.alumno.telefono || 'No disponible'}`);
    });

    // Simular cambio de horario
    const horaAnterior = "10:00 - 11:00";
    const horaNueva = "14:00 - 15:00";

    console.log('\n🔔 Probando notificación de cambio de horario...');
    console.log(`📅 Cambio: ${horaAnterior} → ${horaNueva}`);

    const resultado = await notificationService.notifyClassTimeChange(
      clase,
      horaAnterior,
      horaNueva,
      adminUser._id
    );

    if (resultado.success) {
      console.log('✅ Notificación de cambio de horario enviada correctamente');
      console.log('📊 Resultados:', resultado.results);
      
      // Mostrar estadísticas detalladas
      const stats = resultado.results;
      console.log('\n📈 Estadísticas de envío:');
      console.log(`   • Mensajes internos: ${stats.internos.enviados}/${stats.internos.enviados + stats.internos.errores}`);
      console.log(`   • WhatsApp: ${stats.whatsapp.enviados}/${stats.whatsapp.enviados + stats.whatsapp.errores}`);
      console.log(`   • Email: ${stats.email.enviados}/${stats.email.enviados + stats.email.errores}`);
      console.log(`   • Errores totales: ${stats.internos.errores + stats.whatsapp.errores + stats.email.errores}`);
      
      // Mostrar detalles por estudiante
      console.log('\n📋 Detalles por estudiante:');
      stats.detalles.forEach((detalle, index) => {
        console.log(`   ${index + 1}. ${detalle.estudiante} (${detalle.rut}):`);
        console.log(`      ✅ Interno: ${detalle.internos ? 'Enviado' : 'Error'}`);
        console.log(`      📱 WhatsApp: ${detalle.whatsapp ? 'Enviado' : 'Error'}`);
        console.log(`      📧 Email: ${detalle.email ? 'Enviado' : 'Error'}`);
        if (detalle.errores.length > 0) {
          console.log(`      ❌ Errores: ${detalle.errores.join(', ')}`);
        }
      });
    } else {
      console.error('❌ Error en notificación:', resultado.error);
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la prueba
testCambioHorarioNotification(); 