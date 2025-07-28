import dotenv from 'dotenv';
import mongoose from 'mongoose';
import claseService from './src/features/clases-management/services/clase.service.js';
import Clase from './src/features/clases-management/models/clase.entity.js';
import User from './src/core/models/user.model.js';
import Role from './src/core/models/role.model.js';
import Alumno from './src/core/models/alumnos.model.js';

dotenv.config();

async function testFrontendHorarioChange() {
  try {
    console.log('🔧 PRUEBA: Simulando cambio de horario desde frontend');
    console.log('=====================================================\n');

    // Conectar a MongoDB
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión exitosa a MongoDB');

    // Buscar un usuario administrador
    const adminUser = await User.findOne().populate('roles');
    if (!adminUser) {
      console.error('❌ No se encontró ningún usuario administrador');
      return;
    }
    console.log('👤 Usuario administrador:', adminUser.email);

    // Buscar una clase con estudiantes
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
      horarioActual: clase.horarios[0]
    });

    // Mostrar estudiantes
    console.log('\n👥 Estudiantes en la clase:');
    clase.estudiantes.forEach((estudiante, index) => {
      console.log(`  ${index + 1}. ${estudiante.alumno.nombreAlumno} (${estudiante.alumno.rutAlumno})`);
      console.log(`     📱 Teléfono: ${estudiante.alumno.telefonoAlumno || 'No disponible'}`);
      console.log(`     📧 Email: ${estudiante.alumno.email || 'No disponible'}`);
    });

    // Simular datos de actualización como vendrían del frontend
    const horarioActual = clase.horarios[0];
    const nuevoHorario = {
      ...horarioActual,
      horaInicio: '15:00', // Cambiar hora de inicio
      horaFin: '16:00'     // Cambiar hora de fin
    };

    const datosActualizacion = {
      titulo: clase.titulo,
      descripcion: clase.descripcion,
      profesor: clase.profesor,
      sala: clase.sala,
      horarios: [nuevoHorario]
    };

    console.log('\n🔄 Simulando actualización desde frontend...');
    console.log(`📅 Horario actual: ${horarioActual.horaInicio} - ${horarioActual.horaFin}`);
    console.log(`📅 Nuevo horario: ${nuevoHorario.horaInicio} - ${nuevoHorario.horaFin}`);

    // Verificar si se detectará como cambio de horario
    const hOld = horarioActual;
    const hNew = nuevoHorario;
    const cambioHorario = hOld.dia === hNew.dia && 
                         (hOld.horaInicio !== hNew.horaInicio || hOld.horaFin !== hNew.horaFin);
    
    console.log('\n🔍 ANÁLISIS DE DETECCIÓN DE CAMBIO:');
    console.log('=====================================');
    console.log(`• Día igual: ${hOld.dia === hNew.dia}`);
    console.log(`• Hora inicio diferente: ${hOld.horaInicio !== hNew.horaInicio}`);
    console.log(`• Hora fin diferente: ${hOld.horaFin !== hNew.horaFin}`);
    console.log(`• ¿Se detectará cambio?: ${cambioHorario ? '✅ SÍ' : '❌ NO'}`);

    if (!cambioHorario) {
      console.log('\n⚠️ PROBLEMA: No se detectará como cambio de horario');
      console.log('💡 Esto explica por qué no se envían las notificaciones');
      return;
    }

    console.log('\n✅ Se detectará como cambio de horario. Procediendo con actualización...');

    // Actualizar la clase
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

    // Esperar un poco para que las notificaciones se procesen
    console.log('\n⏳ Esperando procesamiento de notificaciones...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n📋 VERIFICACIÓN:');
    console.log('================');
    console.log('• Si WhatsApp está conectado, deberías recibir mensajes');
    console.log('• Los mensajes internos deberían aparecer en la plataforma');
    console.log('• Los emails deberían haberse enviado');

    console.log('\n💡 Para verificar que funcionó:');
    console.log('   1. Revisa si recibiste mensajes de WhatsApp');
    console.log('   2. Revisa los mensajes internos en la plataforma');
    console.log('   3. Revisa tu email');

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la prueba
testFrontendHorarioChange(); 