import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Clase from './src/features/clases-management/models/clase.entity.js';
import User from './src/core/models/user.model.js';
import Role from './src/core/models/role.model.js';
import Alumno from './src/core/models/alumnos.model.js';

dotenv.config();

async function debugStudentPhoneNumbers() {
  try {
    console.log('🔧 DEBUG: Verificando números de teléfono de estudiantes');
    console.log('=====================================================\n');

    // Conectar a MongoDB
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión exitosa a MongoDB');

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
      estudiantes: clase.estudiantes.length
    });

    // Analizar cada estudiante
    console.log('\n👥 ANÁLISIS DETALLADO DE ESTUDIANTES:');
    console.log('=====================================');

    clase.estudiantes.forEach((estudianteInfo, index) => {
      const estudiante = estudianteInfo.alumno;
      console.log(`\n${index + 1}. ${estudiante.nombreAlumno} (${estudiante.rutAlumno})`);
      
      // Verificar todos los campos posibles de teléfono
      console.log('   📱 Campos de teléfono:');
      console.log(`      • telefonoAlumno: "${estudiante.telefonoAlumno}" (${typeof estudiante.telefonoAlumno})`);
      console.log(`      • telefono: "${estudiante.telefono}" (${typeof estudiante.telefono})`);
      console.log(`      • phone: "${estudiante.phone}" (${typeof estudiante.phone})`);
      console.log(`      • celular: "${estudiante.celular}" (${typeof estudiante.celular})`);
      
      // Verificar si tiene email
      console.log(`   📧 Email: "${estudiante.email}" (${typeof estudiante.email})`);
      
      // Mostrar todo el objeto del estudiante
      console.log('   📋 Objeto completo del estudiante:');
      console.log('      ', JSON.stringify(estudiante, null, 2));
    });

    // Verificar el esquema de Alumno
    console.log('\n📋 ESQUEMA DE ALUMNO:');
    console.log('====================');
    const alumnoSchema = Alumno.schema.obj;
    console.log('Campos del esquema:', Object.keys(alumnoSchema));
    
    // Buscar específicamente el campo de teléfono en el esquema
    if (alumnoSchema.telefonoAlumno) {
      console.log('✅ Campo telefonoAlumno encontrado en esquema');
      console.log('   Tipo:', alumnoSchema.telefonoAlumno.type);
      console.log('   Requerido:', alumnoSchema.telefonoAlumno.required);
    } else {
      console.log('❌ Campo telefonoAlumno NO encontrado en esquema');
    }

    // Buscar otros campos de teléfono
    const phoneFields = Object.keys(alumnoSchema).filter(key => 
      key.toLowerCase().includes('telefono') || 
      key.toLowerCase().includes('phone') || 
      key.toLowerCase().includes('celular')
    );
    
    console.log('📱 Campos relacionados con teléfono en esquema:', phoneFields);

    // Probar la lógica del servicio de notificaciones
    console.log('\n🧪 PRUEBA DE LÓGICA DE NOTIFICACIONES:');
    console.log('=====================================');

    clase.estudiantes.forEach((estudianteInfo, index) => {
      const estudiante = estudianteInfo.alumno;
      console.log(`\n${index + 1}. ${estudiante.nombreAlumno}:`);
      
      // Simular la lógica del servicio de notificaciones
      const hasPhone = estudiante.telefonoAlumno && estudiante.telefonoAlumno.trim() !== '';
      console.log(`   • ¿Tiene telefonoAlumno?: ${hasPhone}`);
      console.log(`   • Valor: "${estudiante.telefonoAlumno}"`);
      console.log(`   • Longitud: ${estudiante.telefonoAlumno ? estudiante.telefonoAlumno.length : 0}`);
      console.log(`   • ¿Es string?: ${typeof estudiante.telefonoAlumno === 'string'}`);
      console.log(`   • ¿Está vacío?: ${estudiante.telefonoAlumno === ''}`);
      console.log(`   • ¿Es null?: ${estudiante.telefonoAlumno === null}`);
      console.log(`   • ¿Es undefined?: ${estudiante.telefonoAlumno === undefined}`);
      
      if (hasPhone) {
        console.log(`   ✅ WhatsApp se enviaría a: ${estudiante.telefonoAlumno}`);
      } else {
        console.log(`   ❌ WhatsApp NO se enviaría (sin teléfono)`);
      }
    });

    // Verificar si hay estudiantes con teléfono
    const estudiantesConTelefono = clase.estudiantes.filter(
      e => e.alumno.telefonoAlumno && e.alumno.telefonoAlumno.trim() !== ''
    );

    console.log(`\n📊 RESUMEN:`);
    console.log(`   • Total estudiantes: ${clase.estudiantes.length}`);
    console.log(`   • Con teléfono: ${estudiantesConTelefono.length}`);
    console.log(`   • Sin teléfono: ${clase.estudiantes.length - estudiantesConTelefono.length}`);

    if (estudiantesConTelefono.length === 0) {
      console.log('\n⚠️ PROBLEMA DETECTADO: Ningún estudiante tiene teléfono configurado');
      console.log('💡 Solución: Ejecutar add-phone-to-prueba-whatsapp.js para agregar teléfonos');
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el debug
debugStudentPhoneNumbers(); 