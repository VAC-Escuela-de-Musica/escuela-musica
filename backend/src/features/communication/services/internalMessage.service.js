import InternalMessage from '../../../core/models/internalMessage.model.js'
import Alumno from '../../../core/models/alumnos.model.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'
import messagingService from './messaging.service.js'

class InternalMessageService {
  /**
   * Crea un nuevo mensaje interno
   * @param {Object} messageData - Datos del mensaje
   * @param {string} senderId - ID del remitente
   * @returns {Promise<Array>} - [mensaje, error]
   */
  async createMessage (messageData, senderId) {
    try {
      const message = new InternalMessage({
        ...messageData,
        sender: senderId,
        createdBy: senderId
      })

      await message.save()
      return [message, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> createMessage')
      return [null, error.message]
    }
  }

  /**
   * Obtiene todos los mensajes (para admins)
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>} - [mensajes, error]
   */
  async getAllMessages (filters = {}) {
    try {
      const query = {}

      if (filters.type) query.type = filters.type
      if (filters.status) query.status = filters.status
      if (filters.priority) query.priority = filters.priority
      if (filters.sender) query.sender = filters.sender
      if (filters.recipientType) query.recipientType = filters.recipientType

      const messages = await InternalMessage.find(query)
        .populate('sender', 'username email')
        .populate('recipient', 'nombreAlumno email')
        .sort({ createdAt: -1 })

      return [messages, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> getAllMessages')
      return [null, error.message]
    }
  }

  /**
   * Obtiene mensajes de un estudiante específico
   * @param {string} studentId - ID del estudiante
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} - [mensajes, error]
   */
  async getStudentMessages (studentId, options = {}) {
    try {
      const messages = await InternalMessage.getStudentMessages(studentId, options)
      return [messages, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> getStudentMessages')
      return [null, error.message]
    }
  }

  /**
   * Obtiene mensajes no leídos de un estudiante
   * @param {string} studentId - ID del estudiante
   * @returns {Promise<Array>} - [mensajes, error]
   */
  async getUnreadMessages (studentId) {
    try {
      const messages = await InternalMessage.getUnreadMessages(studentId)
      return [messages, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> getUnreadMessages')
      return [null, error.message]
    }
  }

  /**
   * Marca un mensaje como leído
   * @param {string} messageId - ID del mensaje
   * @param {string} studentId - ID del estudiante
   * @returns {Promise<Array>} - [mensaje, error]
   */
  async markAsRead (messageId, studentId) {
    try {
      const message = await InternalMessage.findById(messageId)
      if (!message) {
        return [null, 'Mensaje no encontrado']
      }

      await message.markAsRead(studentId)
      return [message, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> markAsRead')
      return [null, error.message]
    }
  }

  /**
   * Marca un mensaje como entregado
   * @param {string} messageId - ID del mensaje
   * @param {string} studentId - ID del estudiante
   * @param {string} method - Método de entrega
   * @returns {Promise<Array>} - [mensaje, error]
   */
  async markAsDelivered (messageId, studentId, method = 'internal') {
    try {
      const message = await InternalMessage.findById(messageId)
      if (!message) {
        return [null, 'Mensaje no encontrado']
      }

      await message.markAsDelivered(studentId, method)
      return [message, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> markAsDelivered')
      return [null, error.message]
    }
  }

  /**
   * Envía un mensaje (cambia estado a 'sent' y programa entrega)
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<Array>} - [mensaje, error]
   */
  async sendMessage (messageId) {
    try {
      const message = await InternalMessage.findById(messageId)
      if (!message) {
        return [null, 'Mensaje no encontrado']
      }

      // Actualizar estado
      message.status = 'sent'
      message.sentAt = new Date()
      await message.save()

      // Obtener destinatarios según el tipo
      const recipients = await this.getRecipients(message)

      // Enviar por canales configurados
      for (const recipient of recipients) {
        await this.deliverMessage(message, recipient)
      }

      return [message, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> sendMessage')
      return [null, error.message]
    }
  }

  /**
   * Obtiene los destinatarios de un mensaje
   * @param {Object} message - Mensaje
   * @returns {Promise<Array>} - Lista de destinatarios
   */
  async getRecipients (message) {
    try {
      let recipients = []

      switch (message.recipientType) {
        case 'specific_student':
          if (message.recipient) {
            const student = await Alumno.findById(message.recipient)
            if (student) recipients.push(student)
          }
          break

        case 'all_students':
          recipients = await Alumno.find({ estado: 'activo' })
          break

        case 'specific_class':
          if (message.recipient) {
            // Obtener estudiantes de la clase específica
            const Clase = (await import('../../../core/models/clase.model.js')).default
            const clase = await Clase.findById(message.recipient).populate('estudiantes.alumno')
            if (clase && clase.estudiantes) {
              for (const estudianteClase of clase.estudiantes) {
                if (estudianteClase.estado === 'activo' && estudianteClase.alumno) {
                  recipients.push(estudianteClase.alumno)
                }
              }
            }
          }
          break
      }

      return recipients
    } catch (error) {
      handleError(error, 'internalMessage.service -> getRecipients')
      return []
    }
  }

  /**
   * Entrega un mensaje a un destinatario por los canales configurados
   * @param {Object} message - Mensaje
   * @param {Object} recipient - Destinatario
   * @returns {Promise<void>}
   */
  async deliverMessage (message, recipient) {
    try {
      // Marcar como entregado internamente
      await this.markAsDelivered(message._id, recipient._id, 'internal')

      // Enviar por email si está configurado
      if (message.delivery.sendEmail && recipient.email) {
        try {
          await messagingService.sendEmail(
            recipient.email,
            message.subject,
            this.formatEmailContent(message.content, recipient)
          )
          await this.markAsDelivered(message._id, recipient._id, 'email')
        } catch (error) {
          console.error('Error enviando email:', error)
        }
      }

      // Enviar por WhatsApp si está configurado
      if (message.delivery.sendWhatsApp && recipient.telefono) {
        try {
          await messagingService.sendWhatsAppMessage(
            recipient.telefono,
            this.formatWhatsAppContent(message.content, recipient)
          )
          await this.markAsDelivered(message._id, recipient._id, 'whatsapp')
        } catch (error) {
          console.error('Error enviando WhatsApp:', error)
        }
      }
    } catch (error) {
      handleError(error, 'internalMessage.service -> deliverMessage')
    }
  }

  /**
   * Formatea el contenido para email
   * @param {string} content - Contenido original
   * @param {Object} recipient - Destinatario
   * @returns {string} - Contenido formateado
   */
  formatEmailContent (content, recipient) {
    let formattedContent = content

    // Reemplazar variables
    formattedContent = formattedContent.replace(/\{\{nombre\}\}/g, recipient.nombreAlumno || 'Estudiante')
    formattedContent = formattedContent.replace(/\{\{email\}\}/g, recipient.email || '')
    formattedContent = formattedContent.replace(/\{\{instrumento\}\}/g, recipient.instrumento || '')

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Escuela de Música VAC</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
          ${formattedContent.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Este mensaje fue enviado desde el sistema interno de la escuela.
        </p>
      </div>
    `
  }

  /**
   * Formatea el contenido para WhatsApp
   * @param {string} content - Contenido original
   * @param {Object} recipient - Destinatario
   * @returns {string} - Contenido formateado
   */
  formatWhatsAppContent (content, recipient) {
    let formattedContent = content

    // Reemplazar variables
    formattedContent = formattedContent.replace(/\{\{nombre\}\}/g, recipient.nombreAlumno || 'Estudiante')
    formattedContent = formattedContent.replace(/\{\{email\}\}/g, recipient.email || '')
    formattedContent = formattedContent.replace(/\{\{instrumento\}\}/g, recipient.instrumento || '')

    return `🎵 *Escuela de Música VAC*\n\n${formattedContent}\n\n_Enviado desde el sistema interno de la escuela._`
  }

  /**
   * Obtiene un mensaje específico por ID
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<Array>} - [mensaje, error]
   */
  async getMessageById (messageId) {
    try {
      const message = await InternalMessage.findById(messageId)
        .populate('sender', 'username email')
        .populate('recipient', 'nombreAlumno email')

      if (!message) {
        return [null, 'Mensaje no encontrado']
      }

      return [message, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> getMessageById')
      return [null, error.message]
    }
  }

  /**
   * Obtiene estadísticas de mensajes
   * @returns {Promise<Array>} - [estadísticas, error]
   */
  async getMessageStats () {
    try {
      const stats = await InternalMessage.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            byType: {
              $push: {
                type: '$type',
                priority: '$priority'
              }
            }
          }
        }
      ])

      return [stats[0] || {}, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> getMessageStats')
      return [null, error.message]
    }
  }

  /**
   * Elimina un mensaje (solo borradores)
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<Array>} - [resultado, error]
   */
  async deleteMessage (messageId) {
    try {
      const message = await InternalMessage.findById(messageId)
      if (!message) {
        return [null, 'Mensaje no encontrado']
      }

      if (message.status !== 'draft') {
        return [null, 'Solo se pueden eliminar borradores']
      }

      await InternalMessage.findByIdAndDelete(messageId)
      return [true, null]
    } catch (error) {
      handleError(error, 'internalMessage.service -> deleteMessage')
      return [null, error.message]
    }
  }
}

export default new InternalMessageService()
