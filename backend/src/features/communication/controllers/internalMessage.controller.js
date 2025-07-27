import internalMessageService from '../services/internalMessage.service.js'
import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

class InternalMessageController {
  /**
   * Crea un nuevo mensaje interno
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createMessage (req, res) {
    try {
      const { subject, content, recipientType, recipient, filters, type, priority, delivery, scheduledFor } = req.body
      const senderId = req.user.id

      // Validar campos requeridos
      if (!subject || !content) {
        return respondError(req, res, 400, 'Asunto y contenido son requeridos')
      }

      // Validar tipo de destinatario
      if (!['all_students', 'specific_student', 'specific_class'].includes(recipientType)) {
        return respondError(req, res, 400, 'Tipo de destinatario inválido')
      }

      // Validar destinatario específico
      if (recipientType === 'specific_student' && !recipient) {
        return respondError(req, res, 400, 'Estudiante es requerido para mensajes a estudiantes específicos')
      }

      // Validar clase específica
      if (recipientType === 'specific_class' && !recipient) {
        return respondError(req, res, 400, 'Clase es requerida para mensajes a clases específicas')
      }

      const messageData = {
        subject,
        content,
        recipientType,
        recipient: recipientType === 'all_students' ? null : recipient,
        type: type || 'notification',
        priority: priority || 'medium',
        delivery: { sendInternal: true, sendEmail: false, sendWhatsApp: false },
        scheduledFor: scheduledFor || null
      }

      const [message, error] = await internalMessageService.createMessage(messageData, senderId)

      if (error) {
        return respondError(req, res, 400, error)
      }

      respondSuccess(req, res, 201, message, 'Mensaje creado correctamente')
    } catch (error) {
      handleError(error, 'internalMessage.controller -> createMessage')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Obtiene todos los mensajes (para admins)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllMessages (req, res) {
    try {
      const { type, status, priority, sender, recipientType } = req.query
      const filters = { type, status, priority, sender, recipientType }

      const [messages, error] = await internalMessageService.getAllMessages(filters)

      if (error) {
        return respondError(req, res, 400, error)
      }

      respondSuccess(req, res, 200, messages)
    } catch (error) {
      handleError(error, 'internalMessage.controller -> getAllMessages')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Obtiene mensajes de un estudiante específico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getStudentMessages (req, res) {
    try {
      const { studentId } = req.params
      const { unreadOnly, limit, skip } = req.query
      const options = {
        unreadOnly: unreadOnly === 'true',
        limit: parseInt(limit) || 50,
        skip: parseInt(skip) || 0
      }

      const [messages, error] = await internalMessageService.getStudentMessages(studentId, options)

      if (error) {
        return respondError(req, res, 400, error)
      }

      respondSuccess(req, res, 200, messages)
    } catch (error) {
      handleError(error, 'internalMessage.controller -> getStudentMessages')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Obtiene mensajes no leídos de un estudiante
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUnreadMessages (req, res) {
    try {
      const { studentId } = req.params

      const [messages, error] = await internalMessageService.getUnreadMessages(studentId)

      if (error) {
        return respondError(req, res, 400, error)
      }

      respondSuccess(req, res, 200, messages)
    } catch (error) {
      handleError(error, 'internalMessage.controller -> getUnreadMessages')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Marca un mensaje como leído
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async markAsRead (req, res) {
    try {
      const { messageId } = req.params
      const studentId = req.user.id

      const [message, error] = await internalMessageService.markAsRead(messageId, studentId)

      if (error) {
        return respondError(req, res, 400, error)
      }

      respondSuccess(req, res, 200, message, 'Mensaje marcado como leído')
    } catch (error) {
      handleError(error, 'internalMessage.controller -> markAsRead')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Envía un mensaje
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendMessage (req, res) {
    try {
      const { messageId } = req.params

      const [message, error] = await internalMessageService.sendMessage(messageId)

      if (error) {
        return respondError(req, res, 400, error)
      }

      respondSuccess(req, res, 200, message, 'Mensaje enviado correctamente')
    } catch (error) {
      handleError(error, 'internalMessage.controller -> sendMessage')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Obtiene estadísticas de mensajes
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getMessageStats (req, res) {
    try {
      const [stats, error] = await internalMessageService.getMessageStats()

      if (error) {
        return respondError(req, res, 400, error)
      }

      respondSuccess(req, res, 200, stats)
    } catch (error) {
      handleError(error, 'internalMessage.controller -> getMessageStats')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Elimina un mensaje (solo borradores)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteMessage (req, res) {
    try {
      const { messageId } = req.params

      const [result, error] = await internalMessageService.deleteMessage(messageId)

      if (error) {
        return respondError(req, res, 400, error)
      }

      respondSuccess(req, res, 200, null, 'Mensaje eliminado correctamente')
    } catch (error) {
      handleError(error, 'internalMessage.controller -> deleteMessage')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Obtiene un mensaje específico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getMessageById (req, res) {
    try {
      const { messageId } = req.params

      const [message, error] = await internalMessageService.getMessageById(messageId)

      if (error) {
        return respondError(req, res, 404, error)
      }

      respondSuccess(req, res, 200, message)
    } catch (error) {
      handleError(error, 'internalMessage.controller -> getMessageById')
      respondError(req, res, 500, 'Error interno del servidor')
    }
  }
}

export default new InternalMessageController()
