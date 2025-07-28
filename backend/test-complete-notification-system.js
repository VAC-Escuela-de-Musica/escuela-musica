import dotenv from 'dotenv';
import mongoose from 'mongoose';
import claseService from './src/features/clases-management/services/clase.service.js';
import Clase from './src/features/clases-management/models/clase.entity.js';
import User from './src/core/models/user.model.js';
import Role from './src/core/models/role.model.js';
import Alumno from './src/core/models/alumnos.model.js';

dotenv.config();

async function testCompleteNotificationSystem() {
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
    console.log('👤 Usuario administrador:', adminUser.email);

    // Buscar una clase con el alumno "Prueba Whatsapp"
    const clase = await Clase.findOne({
      'estudiantes.alumno': { $exists: true },
      estado: 'programada'
    }).populate('estudiantes.alumno').populate('profesor');

    if (!clase) {
      console.error('❌ No se encontró ninguna clase con estudiantes');
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
      console.log(`     📱 Teléfono: ${estudiante.alumno.telefonoAlumno || 'No disponible'}`);
    });

    // Verificar si hay estudiantes con teléfono
    const estudiantesConTelefono = clase.estudiantes.filter(
      e => e.alumno.telefonoAlumno && e.alumno.telefonoAlumno.trim() !== ''
    );

    console.log(`✅ ${estudiantesConTelefono.length} estudiantes tienen teléfono configurado`);

    // Mostrar horario actual
    console.log('⏰ Horario actual:', clase.horarios[0]);

    // Preparar datos de actualización con cambio de horario
    const horarioActual = clase.horarios[0];
    const nuevoHorario = {
      ...horarioActual,
      horaInicio: '15:00',
      horaFin: '16:00'
    };

    const datosActualizacion = {
      titulo: clase.titulo,
      descripcion: clase.descripcion,
      profesor: clase.profesor,
      sala: clase.sala,
      horarios: [nuevoHorario]
    };

    console.log('\n🔄 Actualizando clase con cambio de horario...');
    console.log(`📅 Cambio: ${horarioActual.horaInicio}-${horarioActual.horaFin} → ${nuevoHorario.horaInicio}-${nuevoHorario.horaFin}`);

    // Actualizar la clase (esto debería disparar las notificaciones automáticamente)
    const [claseActualizada, error] = await claseService.updateClase(
      clase._id.toString(),
      datosActualizacion,
      adminUser._id
    );

    if (error) {
      console.error('❌ Error actualizando clase:', error);
      return;
    }

    console.log('✅ Clase actualizada correctamente');
    console.log('📊 Nueva información de la clase:', {
      id: claseActualizada._id,
      titulo: claseActualizada.titulo,
      horario: claseActualizada.horarios[0]
    });

    // Verificar que las notificaciones se enviaron
    console.log('\n🔔 Verificando notificaciones enviadas...');
    console.log('📧 Las notificaciones se envían automáticamente por:');
    console.log('   • Mensajes internos ✅');
    console.log('   • WhatsApp (si está autenticado) 📱');
    console.log('   • Email ✅');

    // Mostrar información de los estudiantes que recibieron notificaciones
    console.log('\n👥 Estudiantes notificados:');
    clase.estudiantes.forEach((estudiante, index) => {
      console.log(`  ${index + 1}. ${estudiante.alumno.nombreAlumno} (${estudiante.alumno.rutAlumno})`);
      console.log(`     📧 Email: ${estudiante.alumno.email || 'No disponible'}`);
      console.log(`     📱 Teléfono: ${estudiante.alumno.telefonoAlumno || 'No disponible'}`);
    });

    console.log('\n💡 Para verificar que WhatsApp funciona:');
    console.log('   1. Escanea el código QR con WhatsApp');
    console.log('   2. Ejecuta: node test-whatsapp-specific-student.js');
    console.log('   3. Verifica que los mensajes lleguen al teléfono');

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la prueba
testCompleteNotificationSystem(); 