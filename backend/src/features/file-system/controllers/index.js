// Controlador principal de archivos - Re-exporta todos los controladores específicos
export { 
  serveFile 
} from './serve.controller.js';

export { 
  getDownloadUrl, 
  downloadFile 
} from './download.controller.js';

export { 
  healthCheck, 
  systemDiagnostics 
} from './system.controller.js';
