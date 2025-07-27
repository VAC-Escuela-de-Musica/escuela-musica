import mongoose from 'mongoose'

const internalMessageSchema = new mongoose.Schema({
  // Remitente (solo admins y profesores pueden enviar)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Destinatario (estudiante específico o todos los estudiantes)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno',
    required: false // Puede ser null para mensajes generales
  },

  // Tipo de destinatario
  recipientType: {
    type: String,
    enum: ['all_students', 'specific_student', 'specific_class'],
    default: 'all_students',
    required: true
  },

  // Filtros para mensajes masivos
  filters: {
    instrument: {
      type: String,
      required: false
    },
    level: {
      type: String,
      required: false
    },
    activeOnly: {
      type: Boolean,
      default: true
    }
  },

  // Contenido del mensaje
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },

  content: {
    type: String,
    required: true,
    maxlength: 2000
  },

  // Tipo de mensaje
  type: {
    type: String,
    enum: ['notification', 'announcement', 'reminder', 'event', 'info'],
    default: 'notification'
  },

  // Prioridad del mensaje
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Estado del mensaje
  status: {
    type: String,
    enum: ['draft', 'sent', 'delivered', 'read'],
    default: 'draft'
  },

  // Estado de lectura por destinatario
  readBy: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumno'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Estado de entrega por destinatario
  deliveredTo: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumno'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    },
    deliveryMethod: {
      type: String,
      enum: ['internal', 'email', 'whatsapp'],
      default: 'internal'
    }
  }],

  // Configuración de entrega
  delivery: {
    sendEmail: {
      type: Boolean,
      default: false
    },
    sendWhatsApp: {
      type: Boolean,
      default: false
    },
    sendInternal: {
      type: Boolean,
      default: true
    }
  },

  // Programación de envío
  scheduledFor: {
    type: Date,
    required: false
  },

  // Fecha de envío real
  sentAt: {
    type: Date,
    required: false
  },

  // Archivos adjuntos
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],

  // Metadatos
  metadata: {
    tags: [String],
    category: String,
    template: String
  },

  // Auditoría
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Índices para optimizar consultas
internalMessageSchema.index({ sender: 1, createdAt: -1 })
internalMessageSchema.index({ recipient: 1, createdAt: -1 })
internalMessageSchema.index({ status: 1, scheduledFor: 1 })
internalMessageSchema.index({ type: 1, priority: 1 })
internalMessageSchema.index({ 'readBy.student': 1 })
internalMessageSchema.index({ 'deliveredTo.student': 1 })

// Virtual para contar destinatarios totales
internalMessageSchema.virtual('totalRecipients').get(function () {
  if (this.recipientType === 'individual' && this.recipient) {
    return 1
  }
  // Para mensajes masivos, se calcula dinámicamente
  return 0
})

// Virtual para contar lecturas
internalMessageSchema.virtual('readCount').get(function () {
  return this.readBy.length
})

// Virtual para contar entregas
internalMessageSchema.virtual('deliveredCount').get(function () {
  return this.deliveredTo.length
})

// Método para marcar como leído
internalMessageSchema.methods.markAsRead = function (studentId) {
  const existingRead = this.readBy.find(read => read.student.toString() === studentId.toString())
  if (!existingRead) {
    this.readBy.push({
      student: studentId,
      readAt: new Date()
    })
  }
  return this.save()
}

// Método para marcar como entregado
internalMessageSchema.methods.markAsDelivered = function (studentId, method = 'internal') {
  const existingDelivery = this.deliveredTo.find(delivery => delivery.student.toString() === studentId.toString())
  if (!existingDelivery) {
    this.deliveredTo.push({
      student: studentId,
      deliveredAt: new Date(),
      deliveryMethod: method
    })
  }
  return this.save()
}

// Método estático para obtener mensajes no leídos de un estudiante
internalMessageSchema.statics.getUnreadMessages = function (studentId) {
  return this.find({
    $or: [
      { recipient: studentId },
      { recipientType: 'all_students' },
      {
        recipientType: 'by_instrument',
        'filters.instrument': { $exists: true }
      },
      {
        recipientType: 'by_level',
        'filters.level': { $exists: true }
      }
    ],
    status: 'sent',
    'readBy.student': { $ne: studentId }
  }).sort({ createdAt: -1 })
}

// Método estático para obtener mensajes de un estudiante
internalMessageSchema.statics.getStudentMessages = function (studentId, options = {}) {
  const query = {
    $or: [
      { recipient: studentId },
      { recipientType: 'all_students' },
      {
        recipientType: 'specific_class',
        recipient: { $exists: true }
      }
    ],
    status: 'sent'
  }

  if (options.unreadOnly) {
    query['readBy.student'] = { $ne: studentId }
  }

  return this.find(query)
    .populate('sender', 'username email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0)
}

const InternalMessage = mongoose.model('InternalMessage', internalMessageSchema)

export default InternalMessage
