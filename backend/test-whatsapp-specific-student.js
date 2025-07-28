import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationService from './src/features/communication/services/notification.service.js';
import Clase from './src/features/clases-management/models/clase.entity.js';
import User from './src/core/models/user.model.js';
import Role from './src/core/models/role.model.js';
import Alumno from './src/core/models/alumnos.model.js';

dotenv.config();

async function testWhatsAppSpecificStudent() {
  try {
    console.log('🔧 Conectando a MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión exitosa a MongoDB');

    // Buscar específicamente al alumno "prueba whatsapp"
    const alumno = await Alumno.findOne({ 
      nombreAlumno: { $regex: /prueba whatsapp/i } 
    });

    if (!alumno) {
      console.error('❌ No se encontró el alumno "prueba whatsapp"');
      return;
    }

    console.log('👤 Alumno encontrado:', {
      nombre: alumno.nombreAlumno,
      rut: alumno.rutAlumno,
      telefono: alumno.telefono,
      email: alumno.email
    });

    // Buscar una clase donde esté este alumno
    const clase = await Clase.findOne({
      'estudiantes.alumno': alumno._id,
      estado: 'programada'
    }).populate('estudiantes.alumno').populate('profesor');

    if (!clase) {
      console.log('⚠️ El alumno no está asignado a ninguna clase');
      console.log('💡 Asignando el alumno a una clase existente...');
      
      // Buscar una clase existente
      const claseExistente = await Clase.findOne({ estado: 'programada' });
      if (!claseExistente) {
        console.error('❌ No hay clases disponibles para asignar');
        return;
      }

      // Asignar el alumno a la clase
      claseExistente.estudiantes.push({
        alumno: alumno._id,
        fechaAsignacion: new Date(),
        estado: 'activo'
      });

      await claseExistente.save();
      console.log('✅ Alumno asignado a la clase:', claseExistente.titulo);
      
      // Recargar la clase con el alumno
      const claseActualizada = await Clase.findById(claseExistente._id)
        .populate('estudiantes.alumno').populate('profesor');
      
      return await testNotificationWithClass(claseActualizada);
    }

    return await testNotificationWithClass(clase);

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

async function testNotificationWithClass(clase) {
  try {
    // Buscar un usuario administrador
    const adminUser = await User.findOne().populate('roles');
    if (!adminUser) {
      console.error('❌ No se encontró ningún usuario administrador');
      return;
    }
    console.log('👤 Usuario administrador:', adminUser.email);

    console.log('📚 Clase:', {
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
      console.log(`     📱 Teléfono: ${estudiante.alumno.telefonoAlumno || 'No disponible'}`);
    });

    // Verificar si el alumno "prueba whatsapp" tiene teléfono
    const alumnoPrueba = clase.estudiantes.find(
      e => e.alumno.nombreAlumno.toLowerCase().includes('prueba whatsapp')
    );

    if (!alumnoPrueba || !alumnoPrueba.alumno.telefonoAlumno) {
      console.log('⚠️ El alumno "prueba whatsapp" no tiene teléfono configurado');
      console.log('💡 Configura un número de teléfono válido para este alumno');
      return;
    }

    console.log(`✅ Alumno "prueba whatsapp" tiene teléfono: ${alumnoPrueba.alumno.telefonoAlumno}`);

    // Simular cambio de horario
    const horaAnterior = "10:00 - 11:00";
    const horaNueva = "14:00 - 15:00";

    console.log('\n🔔 Probando notificación de cambio de horario con WhatsApp real...');
    console.log(`📅 Cambio: ${horaAnterior} → ${horaNueva}`);
    console.log(`📱 Enviando a: ${alumnoPrueba.alumno.telefonoAlumno}`);

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

      // Verificar si WhatsApp funcionó
      if (stats.whatsapp.enviados > 0) {
        console.log('\n🎉 ¡WhatsApp funcionó correctamente!');
        console.log(`📱 Se enviaron ${stats.whatsapp.enviados} mensajes de WhatsApp`);
        console.log(`📱 Número de destino: ${alumnoPrueba.alumno.telefono}`);
      } else {
        console.log('\n⚠️ WhatsApp no envió mensajes');
        console.log('💡 Posibles causas:');
        console.log('   • WhatsApp Web no está autenticado');
        console.log('   • El número de teléfono no está en formato correcto');
        console.log('   • WhatsApp Web no está inicializado');
        console.log(`   • Número probado: ${alumnoPrueba.alumno.telefonoAlumno}`);
      }
    } else {
      console.error('❌ Error en notificación:', resultado.error);
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

// Ejecutar la prueba
testWhatsAppSpecificStudent(); 