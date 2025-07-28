import internalMessageService from './internalMessage.service.js'
import messagingService from './messaging.service.js'
import Alumno from '../../../core/models/alumnos.model.js'
import User from '../../../core/models/user.model.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

class NotificationService {
  /**
   * Envía notificaciones automáticas cuando se cancela una clase
   * @param {Object} clase - Objeto de la clase cancelada
   * @param {string} motivo - Motivo de la cancelación
   * @param {string} canceladoPor - ID del usuario que canceló la clase
   * @returns {Promise<Object>} - Resultado de las notificaciones
   */
  async notifyClassCancellation(clase, motivo = '', canceladoPor = null) {
    try {
      console.log('🔔 Iniciando notificaciones de cancelación de clase:', clase._id)
      
      // Obtener información completa de la clase
      const claseCompleta = await this.getClaseWithDetails(clase._id)
      if (!claseCompleta) {
        return { success: false, error: 'No se pudo obtener información de la clase' }
      }

      // Obtener información del profesor (opcional, para registro interno)
      let profesor = null
      if (claseCompleta.profesor) {
        profesor = await User.findById(claseCompleta.profesor)
      }

      // Obtener información de quién canceló la clase
      let canceladoPorInfo = null
      if (canceladoPor) {
        canceladoPorInfo = await User.findById(canceladoPor)
      }

      // Preparar mensajes (sin incluir información del profesor en los mensajes a estudiantes)
      const mensajes = this.prepareCancellationMessages(claseCompleta, motivo, canceladoPorInfo)
      
      // Enviar notificaciones a cada estudiante
      const resultados = await this.sendNotificationsToStudents(claseCompleta.estudiantes, mensajes)
      
      // Crear mensaje interno para registro (solo si hay profesor)
      if (profesor) {
        await this.createInternalMessage(claseCompleta, profesor, motivo, canceladoPorInfo, resultados)
      }
      
      console.log('✅ Notificaciones de cancelación completadas')
      return {
        success: true,
        message: 'Notificaciones enviadas correctamente',
        results: resultados
      }
      
    } catch (error) {
      handleError(error, 'notification.service -> notifyClassCancellation')
      return { success: false, error: error.message }
    }
  }

  /**
   * Notifica a los estudiantes sobre un cambio de horario
   * @param {Object} clase - Objeto de la clase
   * @param {string} horaAnterior - Horario anterior (ej: "10:00 - 11:00")
   * @param {string} horaNueva - Horario nuevo (ej: "12:00 - 13:00")
   * @param {string} actualizadoPor - ID del usuario que actualizó
   * @returns {Promise<Object>} - Resultado de las notificaciones
   */
  async notifyClassTimeChange(clase, horaAnterior, horaNueva, actualizadoPor = null) {
    let resultados = null;
    try {
      console.log('🔔 Iniciando notificaciones de cambio de horario:', clase._id)
      
      // Obtener información completa de la clase
      const claseCompleta = await this.getClaseWithDetails(clase._id);
      if (!claseCompleta) {
        return { success: false, error: 'No se pudo obtener información de la clase' };
      }
      
      // El profesor puede ser null, pero continuamos
      const profesor = claseCompleta.profesor;
      
      // Obtener información de quien actualizó
      let actualizadoPorInfo = null;
      if (actualizadoPor) {
        actualizadoPorInfo = await User.findById(actualizadoPor);
      }
      
      // Preparar información adicional
      const fechaClase = this.formatClaseDate(claseCompleta.horarios[0]);
      const salaClase = claseCompleta.sala || 'No especificada';
      const profesorNombre = profesor ? profesor.username || profesor.email : 'No asignado';
      
      // Mensaje interno
      const mensaje = `🕐 **CAMBIO DE HORARIO**

📚 **Clase:** ${claseCompleta.titulo}
📅 **Fecha:** ${fechaClase}
📍 **Sala:** ${salaClase}
⏰ **Cambio:** ${horaAnterior} → ${horaNueva}

Por favor, toma nota del nuevo horario. Si tienes alguna pregunta, contacta a tu profesor o administración.`;

      // Mensaje WhatsApp
      const mensajeWhatsApp = `🕐 *CAMBIO DE HORARIO*

📚 *Clase:* ${claseCompleta.titulo}
📅 *Fecha:* ${fechaClase}
📍 *Sala:* ${salaClase}
⏰ *Cambio:* ${horaAnterior} → ${horaNueva}

Por favor, toma nota del nuevo horario. Si tienes alguna pregunta, contacta a tu profesor o administración.`;

      // Email
      const mensajeEmail = {
        subject: `Cambio de horario: ${claseCompleta.titulo}`,
        content: `
          <h2>🕐 Cambio de Horario</h2>
          <p><strong>Clase:</strong> ${claseCompleta.titulo}</p>
          <p><strong>Fecha:</strong> ${fechaClase}</p>
          <p><strong>Sala:</strong> ${salaClase}</p>
          <p><strong>Cambio de horario:</strong> ${horaAnterior} → ${horaNueva}</p>
          <p>Por favor, toma nota del nuevo horario. Si tienes alguna pregunta, contacta a tu profesor o administración.</p>
        `
      };
      
      // Enviar notificaciones a cada estudiante
      resultados = await this.sendNotificationsToStudents(claseCompleta.estudiantes, {
        interno: mensaje,
        whatsapp: mensajeWhatsApp,
        email: mensajeEmail
      });
      
      // Crear mensaje interno para registro (solo si hay profesor)
      if (profesor) {
        await this.createInternalMessage(
          claseCompleta,
          profesor,
          `Cambio de horario de ${horaAnterior} a ${horaNueva}`,
          actualizadoPorInfo,
          resultados
        );
      }
      
      console.log('✅ Notificaciones de cambio de horario completadas')
      return {
        success: true,
        message: 'Notificaciones de cambio de horario enviadas correctamente',
        results: resultados
      };
    } catch (error) {
      console.error('❌ Error en notifyClassTimeChange:', error);
      return { 
        success: false, 
        error: error.message,
        results: resultados || { internos: { enviados: 0, errores: 0 }, whatsapp: { enviados: 0, errores: 0 }, email: { enviados: 0, errores: 0 }, detalles: [] }
      };
    }
  }

  /**
   * Obtiene información completa de una clase
   * @param {string} claseId - ID de la clase
   * @returns {Promise<Object>} - Clase con información completa
   */
  async getClaseWithDetails(claseId) {
    try {
      const Clase = (await import('../../clases-management/models/clase.entity.js')).default
      const clase = await Clase.findById(claseId)
        .populate('estudiantes.alumno', 'nombreAlumno rutAlumno email telefono')
        .populate('profesor', 'username email')
      
      return clase
    } catch (error) {
      handleError(error, 'notification.service -> getClaseWithDetails')
      return null
    }
  }

  /**
   * Prepara los mensajes de cancelación
   * @param {Object} clase - Clase cancelada
   * @param {Object} profesor - Información del profesor
   * @param {string} motivo - Motivo de la cancelación
   * @param {Object} canceladoPor - Información de quién canceló
   * @returns {Object} - Mensajes preparados
   */
  prepareCancellationMessages(clase, motivo, canceladoPor) {
    const fechaClase = this.formatClaseDate(clase.horarios[0])
    const horaClase = this.formatClaseTime(clase.horarios[0])
    
    const mensajeInterno = `🚫 **CLASE CANCELADA**

📚 **Clase:** ${clase.titulo}
📅 **Fecha:** ${fechaClase}
🕐 **Hora:** ${horaClase}
📍 **Sala:** ${clase.sala}
${motivo ? `📝 **Motivo:** ${motivo}` : ''}
${canceladoPor ? `❌ **Cancelado por:** ${canceladoPor.username}` : ''}

La clase ha sido cancelada. Te notificaremos cuando se reprograme.`

    const mensajeWhatsApp = `🚫 *CLASE CANCELADA*

📚 *Clase:* ${clase.titulo}
📅 *Fecha:* ${fechaClase}
🕐 *Hora:* ${horaClase}
📍 *Sala:* ${clase.sala}
${motivo ? `📝 *Motivo:* ${motivo}` : ''}

La clase ha sido cancelada. Te notificaremos cuando se reprograme.`

    const mensajeEmail = {
      subject: `Clase Cancelada: ${clase.titulo}`,
      content: `
        <h2>🚫 Clase Cancelada</h2>
        <p><strong>Clase:</strong> ${clase.titulo}</p>
        <p><strong>Fecha:</strong> ${fechaClase}</p>
        <p><strong>Hora:</strong> ${horaClase}</p>
        <p><strong>Sala:</strong> ${clase.sala}</p>
        ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
        <p>La clase ha sido cancelada. Te notificaremos cuando se reprograme.</p>
      `
    }

    return {
      interno: mensajeInterno,
      whatsapp: mensajeWhatsApp,
      email: mensajeEmail
    }
  }

  /**
   * Envía notificaciones a los estudiantes
   * @param {Array} estudiantes - Lista de estudiantes
   * @param {Object} mensajes - Mensajes preparados
   * @returns {Promise<Object>} - Resultados del envío
   */
  async sendNotificationsToStudents(estudiantes, mensajes) {
    const resultados = {
      internos: { enviados: 0, errores: 0 },
      whatsapp: { enviados: 0, errores: 0 },
      email: { enviados: 0, errores: 0 },
      detalles: []
    }

    for (const estudianteInfo of estudiantes) {
      const estudiante = estudianteInfo.alumno
      if (!estudiante) continue

      const resultado = {
        estudiante: estudiante.nombreAlumno,
        rut: estudiante.rutAlumno,
        internos: false,
        whatsapp: false,
        email: false,
        errores: []
      }

      // Enviar mensaje interno
      try {
        await this.sendInternalMessage(estudiante._id, mensajes.interno)
        resultado.internos = true
        resultados.internos.enviados++
      } catch (error) {
        resultado.errores.push(`Interno: ${error.message}`)
        resultados.internos.errores++
      }

      // Enviar WhatsApp si tiene teléfono
      if (estudiante.telefonoAlumno) {
        try {
          await this.sendWhatsAppMessage(estudiante.telefonoAlumno, mensajes.whatsapp)
          resultado.whatsapp = true
          resultados.whatsapp.enviados++
        } catch (error) {
          resultado.errores.push(`WhatsApp: ${error.message}`)
          resultados.whatsapp.errores++
        }
      }

      // Enviar email si tiene email
      if (estudiante.email) {
        try {
          await this.sendEmailMessage(estudiante.email, mensajes.email)
          resultado.email = true
          resultados.email.enviados++
        } catch (error) {
          resultado.errores.push(`Email: ${error.message}`)
          resultados.email.errores++
        }
      }

      resultados.detalles.push(resultado)
    }

    return resultados
  }

  /**
   * Envía mensaje interno a un estudiante
   * @param {string} estudianteId - ID del estudiante
   * @param {string} mensaje - Contenido del mensaje
   * @returns {Promise<void>}
   */
  async sendInternalMessage(estudianteId, mensaje) {
    try {
      // Buscar un usuario administrador para usar como remitente del sistema
      const adminUser = await User.findOne()
      const systemUserId = adminUser ? adminUser._id : null
      
      if (!systemUserId) {
        console.warn('⚠️ No se encontró usuario administrador para mensaje del sistema')
        return
      }
      
      const messageData = {
        subject: 'Cambio de Horario',
        content: mensaje,
        recipientType: 'specific_student',
        recipient: estudianteId,
        type: 'notification',
        priority: 'high',
        delivery: {
          sendInternal: true,
          sendEmail: false,
          sendWhatsApp: false
        }
      }

      const [message, error] = await internalMessageService.createMessage(messageData, systemUserId)
      if (error) throw new Error(error)
      
      // Enviar inmediatamente
      await internalMessageService.sendMessage(message._id)
    } catch (error) {
      console.error('❌ Error enviando mensaje interno:', error)
    }
  }

  /**
   * Envía mensaje de WhatsApp
   * @param {string} telefono - Número de teléfono
   * @param {string} mensaje - Contenido del mensaje
   * @returns {Promise<void>}
   */
  async sendWhatsAppMessage(telefono, mensaje) {
    try {
      // Intentar primero con WhatsApp Web
      const result = await messagingService.sendWhatsAppWeb(telefono, mensaje)
      if (result.success) {
        console.log('✅ WhatsApp Web enviado correctamente a:', telefono)
        return
      }
      
      // Si WhatsApp Web no está disponible, usar el método alternativo
      console.log('⚠️ WhatsApp Web no disponible, usando método alternativo')
      const altResult = await messagingService.sendWhatsAppMessage(telefono, mensaje)
      if (!altResult.success) {
        throw new Error(altResult.error || 'Error enviando WhatsApp')
      }
    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error.message)
      throw new Error(`Error enviando WhatsApp: ${error.message}`)
    }
  }

  /**
   * Envía mensaje de email
   * @param {string} email - Dirección de email
   * @param {Object} mensaje - Objeto con subject y content
   * @returns {Promise<void>}
   */
  async sendEmailMessage(email, mensaje) {
    const result = await messagingService.sendEmail(email, mensaje.subject, mensaje.content)
    if (!result.success) {
      throw new Error(result.error || 'Error enviando email')
    }
  }

  /**
   * Crea mensaje interno para registro de la cancelación
   * @param {Object} clase - Clase cancelada
   * @param {Object} profesor - Información del profesor
   * @param {string} motivo - Motivo de la cancelación
   * @param {Object} canceladoPor - Información de quién canceló
   * @param {Object} resultados - Resultados del envío
   * @returns {Promise<void>}
   */
  async createInternalMessage(clase, profesor, motivo, canceladoPor, resultados) {
    try {
      const resumen = this.createNotificationSummary(resultados)
      
      // Buscar un usuario administrador para usar como remitente del sistema
      const adminUser = await User.findOne().populate('roles')
      const systemUserId = adminUser ? adminUser._id : null
      
      if (!systemUserId) {
        console.warn('⚠️ No se encontró usuario administrador para mensaje del sistema')
        return
      }
      
      const messageData = {
        subject: `Registro: Cancelación de Clase - ${clase.titulo}`,
        content: `
📊 **RESUMEN DE NOTIFICACIONES DE CANCELACIÓN**

📚 **Clase:** ${clase.titulo}
👨‍🏫 **Profesor:** ${profesor.username || profesor.email || 'No especificado'}
📅 **Fecha:** ${this.formatClaseDate(clase.horarios[0])}
📍 **Sala:** ${clase.sala}
📝 **Motivo:** ${motivo || 'No especificado'}
${canceladoPor ? `❌ **Cancelado por:** ${canceladoPor.username || canceladoPor.email || 'No especificado'}` : ''}

📈 **Estadísticas de envío:**
• Mensajes internos: ${resumen.internos}
• WhatsApp: ${resumen.whatsapp}
• Email: ${resumen.email}
• Errores: ${resumen.errores}

${resumen.detalles}
        `,
        recipientType: 'all_students',
        type: 'info',
        priority: 'medium',
        delivery: {
          sendInternal: true,
          sendEmail: false,
          sendWhatsApp: false
        }
      }

      const [message, error] = await internalMessageService.createMessage(messageData, systemUserId)
      if (!error) {
        await internalMessageService.sendMessage(message._id)
      }
    } catch (error) {
      console.error('❌ Error creando mensaje interno:', error)
    }
  }

  /**
   * Crea resumen de las notificaciones enviadas
   * @param {Object} resultados - Resultados del envío
   * @returns {Object} - Resumen formateado
   */
  createNotificationSummary(resultados) {
    const totalEstudiantes = resultados.detalles.length
    const totalEnviados = resultados.internos.enviados + resultados.whatsapp.enviados + resultados.email.enviados
    const totalErrores = resultados.internos.errores + resultados.whatsapp.errores + resultados.email.errores

    let detalles = '📋 **Detalles por estudiante:**\n'
    resultados.detalles.forEach(detalle => {
      const canales = []
      if (detalle.internos) canales.push('✅ Interno')
      if (detalle.whatsapp) canales.push('✅ WhatsApp')
      if (detalle.email) canales.push('✅ Email')
      
      detalles += `• ${detalle.estudiante} (${detalle.rut}): ${canales.join(', ')}\n`
      if (detalle.errores.length > 0) {
        detalles += `  ❌ Errores: ${detalle.errores.join(', ')}\n`
      }
    })

    return {
      internos: `${resultados.internos.enviados}/${totalEstudiantes}`,
      whatsapp: `${resultados.whatsapp.enviados}/${totalEstudiantes}`,
      email: `${resultados.email.enviados}/${totalEstudiantes}`,
      errores: totalErrores,
      detalles
    }
  }

  /**
   * Formatea la fecha de la clase
   * @param {Object} horario - Horario de la clase
   * @returns {string} - Fecha formateada
   */
  formatClaseDate(horario) {
    if (!horario || !horario.dia) return 'Fecha no especificada'
    
    // Asumiendo que horario.dia está en formato DD-MM-YYYY
    const [dia, mes, año] = horario.dia.split('-')
    const fecha = new Date(año, mes - 1, dia)
    
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Formatea la hora de la clase
   * @param {Object} horario - Horario de la clase
   * @returns {string} - Hora formateada
   */
  formatClaseTime(horario) {
    if (!horario) return 'Hora no especificada'
    return `${horario.horaInicio} - ${horario.horaFin}`
  }
}

// Crear instancia singleton
const notificationService = new NotificationService()

export default notificationService