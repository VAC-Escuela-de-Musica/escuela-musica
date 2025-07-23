import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  variables: [{
    name: String,
    description: String,
    example: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
emailTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para procesar variables en la plantilla
emailTemplateSchema.methods.processTemplate = function(variables = {}) {
  let processedContent = this.content;
  let processedSubject = this.subject;

  // Reemplazar variables en el contenido
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, variables[key]);
    processedSubject = processedSubject.replace(regex, variables[key]);
  });

  return {
    subject: processedSubject,
    content: processedContent
  };
};

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

export default EmailTemplate; 