# Backend - Escuela de Música

## Descripción
API REST para la gestión de materiales educativos, usuarios y recursos de una escuela de música. Construido con Node.js, Express y MongoDB (Mongoose), implementa una arquitectura feature-based con control de acceso por roles (usuario, profesor, administrador). Incluye autenticación JWT, almacenamiento de archivos con MinIO, logging estructurado y validaciones exhaustivas.

---

## Arquitectura

La aplicación utiliza una arquitectura feature-based organizando el código por dominios de negocio en lugar de por capas técnicas. Esta estructura facilita el mantenimiento, la escalabilidad y la comprensión del código al agrupar funcionalidades relacionadas.

### Estructura del Proyecto

```
src/
├── core/                           # Infraestructura compartida
│   ├── config/                     # Configuraciones de la aplicación
│   │   ├── configDB.js            # Configuración de base de datos
│   │   ├── configEnv.js           # Variables de entorno
│   │   ├── initialSetup.js        # Setup inicial de roles y usuarios
│   │   ├── minio.config.js        # Configuración MinIO
│   │   └── index.js               # Exports centralizados
│   ├── constants/                  # Constantes globales
│   │   ├── app.constants.js       # Constantes de aplicación
│   │   ├── roles.constants.js     # Constantes de roles y permisos
│   │   └── index.js
│   ├── models/                     # Modelos de base de datos
│   │   ├── user.model.js          # Modelo de usuarios
│   │   ├── role.model.js          # Modelo de roles
│   │   ├── material.model.js      # Modelo de materiales educativos
│   │   ├── file.model.js          # Modelo de archivos
│   │   ├── alumnos.model.js       # Modelo de estudiantes
│   │   ├── galeria.model.js       # Modelo de galería
│   │   ├── cardsProfesores.model.js # Modelo de cards de profesores
│   │   ├── carousel.entity.js     # Modelo de carousel
│   │   └── emailTemplate.model.js # Modelo de plantillas de email
│   ├── repositories/               # Repositorios base
│   │   ├── BaseRepository.js      # Clase base para todos los repositorios
│   │   └── index.js
│   ├── schemas/                    # Esquemas de validación
│   │   ├── auth.schema.js         # Validaciones de autenticación
│   │   ├── user.schema.js         # Validaciones de usuarios
│   │   ├── common.schema.js       # Validaciones comunes
│   │   ├── alumnos.schema.js      # Validaciones de estudiantes
│   │   └── galeria.schema.js      # Validaciones de galería
│   ├── services/                   # Servicios base
│   │   └── base.service.js        # Servicio base reutilizable
│   └── utils/                      # Utilidades de infraestructura
│       ├── auth.util.js           # Utilidades de autenticación
│       ├── errorHandler.util.js   # Manejo centralizado de errores
│       ├── logger.util.js         # Sistema de logging (Winston)
│       ├── responseHandler.util.js # Respuestas HTTP consistentes
│       ├── health.util.js         # Utilidades de health check
│       ├── validation.util.js     # Validaciones reutilizables
│       └── errorWrapper.util.js   # Wrapper para errores async
│
├── features/                       # Funcionalidades por dominio
│   ├── authentication/            # Autenticación y autorización
│   │   ├── controllers/           # auth.controller.js
│   │   ├── middlewares/           # JWT, role, user middlewares
│   │   │   ├── jwt.middleware.js  # Validación de tokens JWT
│   │   │   ├── role.middleware.js # Control de acceso por roles
│   │   │   ├── user.middleware.js # Middlewares de usuario
│   │   │   └── optional.middleware.js # Auth opcional
│   │   ├── routes/                # auth.routes.js
│   │   └── services/              # authentication, authorization services
│   │       ├── authentication.service.js
│   │       └── authorization.service.js
│   │
│   ├── communication/             # Mensajería y notificaciones
│   │   ├── controllers/           # emailConfig, messaging controllers
│   │   │   ├── emailConfig.controller.js
│   │   │   └── messaging.controller.js
│   │   ├── routes/                # messaging.routes.js
│   │   └── services/              # messaging, whatsappWeb services
│   │       ├── messaging.service.js
│   │       └── whatsappWeb.service.js
│   │
│   ├── content-management/        # Gestión de materiales educativos
│   │   ├── controllers/           # material, galeria, upload, admin controllers
│   │   │   ├── material.controller.js
│   │   │   ├── galeria.controller.js
│   │   │   ├── upload.controller.js
│   │   │   └── admin.controller.js
│   │   ├── repositories/          # MaterialRepository.js
│   │   ├── routes/                # material, galeria routes
│   │   │   ├── material.routes.js
│   │   │   └── galeria.routes.js
│   │   └── services/              # material, galeria services
│   │       ├── material.service.js
│   │       └── galeria.service.js
│   │
│   ├── file-system/              # Sistema de archivos y storage
│   │   ├── controllers/           # file, download, serve, system controllers
│   │   │   ├── file.controller.js
│   │   │   ├── download.controller.js
│   │   │   ├── serve.controller.js
│   │   │   └── system.controller.js
│   │   ├── middlewares/           # access, file middlewares
│   │   │   ├── access.middleware.js
│   │   │   └── file.middleware.js
│   │   ├── routes/                # file.routes.js
│   │   └── services/              # file, minio services
│   │       ├── file.service.js
│   │       └── minio.service.js
│   │
│   ├── monitoring/               # Auditoría y monitoreo
│   │   └── services/              # audit.service.js
│   │
│   ├── student-management/       # Gestión de estudiantes
│   │   ├── controllers/           # alumnos.controller.js
│   │   ├── routes/                # alumnos.routes.js
│   │   └── services/              # alumnos.service.js
│   │
│   ├── user-management/          # Gestión de usuarios y roles
│   │   ├── controllers/           # user, role controllers
│   │   │   ├── user.controller.js
│   │   │   └── role.controller.js
│   │   ├── repositories/          # UserRepository.js
│   │   ├── routes/                # user, role routes
│   │   │   ├── user.routes.js
│   │   │   └── role.routes.js
│   │   └── services/              # user.service.js
│   │
│   └── website-content/          # Contenido del sitio web
│       ├── controllers/           # cardsProfesores, carousel controllers
│       │   ├── cardsProfesores.controller.js
│       │   └── carousel.controller.js
│       ├── routes/                # cardsProfesores, carousel routes
│       │   ├── cardsProfesores.routes.js
│       │   └── carousel.routes.js
│       └── services/              # cardsProfesores, carousel services
│           ├── cardsProfesores.service.js
│           └── carousel.service.js
│
├── middlewares/                   # Middlewares globales
│   ├── common.middleware.js       # Middlewares comunes (CORS, etc)
│   ├── error/                     # Manejo global de errores
│   │   └── error.middleware.js
│   └── validation/                # Validaciones globales
│       ├── enhanced.middleware.js
│       └── schema.middleware.js
│
├── patterns/                      # Patrones reutilizables
│   ├── Result.js                  # Patrón Result para manejo de respuestas
│   └── index.js
│
├── routes/                        # Enrutamiento principal
│   ├── index.routes.js            # Enrutador maestro
│   └── admin.routes.js            # Rutas administrativas
│
├── app.js                         # Configuración de Express
└── server.js                      # Punto de entrada del servidor
```

### Flujo de Datos

```
HTTP Request → Global Middlewares → Feature Routes → Feature Middlewares → Controllers
                                                                              ↓
Core Utils ← Core Models ← Feature Repositories ← Feature Services ←──────────┘
```

## 🏢 Features del Sistema

### 🔑 Authentication & Authorization
- **Responsabilidad**: Sistema completo de autenticación y autorización
- **Endpoints**: `/api/auth/*`
- **Componentes**: JWT middleware con refresh tokens, control granular de roles
- **Funcionalidades**: 
  - Login/logout con sesión persistente
  - Refresh tokens automáticos (7d)
  - Verificación de tokens en tiempo real
  - Rate limiting por IP y endpoint
  - Control de acceso por roles (administrador, profesor, asistente)

### 📚 Content Management
- **Responsabilidad**: Gestión avanzada de materiales educativos y galería
- **Endpoints**: `/api/materials/*`, `/api/galeria/*`
- **Componentes**: MaterialRepository, MinIO integration, upload controller
- **Funcionalidades**: 
  - Upload de múltiples formatos (PDF, imágenes, audio, video)
  - URLs pre-firmadas para seguridad (5min TTL)
  - Control de acceso privado/público por material
  - Metadatos completos (categoría, nivel, instrumento, tags)
  - Galería de imágenes para sitio web
  - Versionado y auditoría de cambios

### 💾 File System
- **Responsabilidad**: Manejo seguro de archivos con MinIO
- **Endpoints**: `/api/files/*`
- **Componentes**: MinIO service, access middleware, cache system
- **Funcionalidades**: 
  - 4 buckets especializados (privados, públicos, galería, temporal)
  - URLs pre-firmadas con expiración configurable
  - Control de acceso granular por usuario y rol
  - Cache inteligente para optimización
  - Health checks automáticos
  - Limpieza automática de archivos temporales

### 👥 User Management
- **Responsabilidad**: Administración completa de usuarios y roles
- **Endpoints**: `/api/users/*`, `/api/roles/*`
- **Componentes**: UserRepository, role controller, RBAC system
- **Funcionalidades**: 
  - CRUD completo de usuarios con validaciones
  - Sistema de roles jerárquico (administrador > profesor > asistente)
  - Asignación múltiple de roles por usuario
  - Gestión de perfiles con datos académicos
  - Validación de RUT chileno
  - Hash seguro de contraseñas con bcrypt

### 📱 Communication System
- **Responsabilidad**: Sistema de mensajería multi-canal avanzado
- **Endpoints**: `/api/messaging/*`
- **Componentes**: Messaging service, WhatsApp integration, email templates
- **Funcionalidades**: 
  - **WhatsApp**: 3 proveedores (Web, Business API, Callmebot)
  - **Email**: Configuración dinámica con plantillas HTML
  - **Código QR**: Generación automática para WhatsApp Web
  - **Plantillas**: Sistema de plantillas personalizables
  - **Logs**: Tracking completo de mensajes enviados
  - **Fallback**: Sistema de respaldo entre proveedores

### 🎼 Student Management
- **Responsabilidad**: Gestión especializada de estudiantes
- **Endpoints**: `/api/alumnos/*`
- **Componentes**: Alumnos controller con validaciones complejas
- **Funcionalidades**: 
  - Datos completos (estudiante + apoderado + académicos)
  - Información musical (instrumentos, estilos, nivel)
  - Datos médicos y condiciones especiales
  - Validación de RUT, emails y teléfonos
  - Historial académico y progreso
  - Gestión de contactos múltiples

### 🌐 Website Content
- **Responsabilidad**: Gestión de contenido dinámico del sitio web
- **Endpoints**: `/api/cards-profesores/*`, `/api/carousel/*`
- **Componentes**: Content controllers, image management
- **Funcionalidades**: 
  - Carousel de imágenes con orden personalizable
  - Cards de profesores con información detallada
  - Gestión de imágenes de alta calidad
  - SEO optimizado para contenido dinámico
  - Cache inteligente para rendimiento

### 📈 Monitoring & Audit
- **Responsabilidad**: Monitoreo y auditoría del sistema
- **Componentes**: Audit service, structured logging
- **Funcionalidades**: 
  - Logging estructurado con Winston
  - Auditoría de todas las acciones críticas
  - Métricas de uso y rendimiento
  - Health checks automáticos
  - Alertas configurables
  - Rotación automática de logs

## Patrones de Diseño

### Repository Pattern
- **BaseRepository**: Clase base con operaciones CRUD genéricas
- **Feature Repositories**: Repositorios específicos que extienden BaseRepository
- **Abstracción**: Separa la lógica de acceso a datos de la lógica de negocio

### Result Pattern
- **Propósito**: Manejo consistente de respuestas y errores
- **Métodos**: `Result.success(data)`, `Result.error(message, code)`, `Result.notFound()`
- **Ventajas**: Elimina excepciones no controladas, API consistente

### Service Layer
- **Responsabilidad**: Encapsula la lógica de negocio
- **Interacción**: Servicios → Repositorios → Modelos
- **Reutilización**: Servicios base para funcionalidades comunes

## Instalación y Configuración

### Prerrequisitos
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 4.4
- MinIO Server

### Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las configuraciones correspondientes

# Crear roles por defecto
node scripts/createDefaultRoles.js

# Verificar configuración de MinIO (opcional)
node scripts/check-minio.js

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

### Variables de Entorno
```env
# Configuración del servidor
NODE_ENV=development
PORT=80
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Base de datos
MONGODB_URI=mongodb://localhost:27017/escuela_musica

# MinIO Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=tu_access_key
MINIO_SECRET_KEY=tu_secret_key
MINIO_BUCKET_PRIVATE=materiales-privados
MINIO_BUCKET_PUBLIC=materiales-publicos
MINIO_BUCKET_GALERY=galeria-imagenes
MINIO_BUCKET_TEMP=temporal-uploads

# Configuración de email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=escuela@musica.com

# WhatsApp (opcional)
WHATSAPP_BUSINESS_TOKEN=tu_business_token
WHATSAPP_PHONE_ID=tu_phone_id
CALLMEBOT_API_KEY=tu_callmebot_key

# Logging
LOG_LEVEL=info
LOG_MAX_FILES=5
LOG_MAX_SIZE=20971520
```

## Scripts Disponibles

### NPM Scripts
```bash
npm run dev           # Ejecutar backend en modo desarrollo con nodemon
npm run server        # Alias para npm run dev
npm run cliente       # Ejecutar frontend desde backend
npm start             # Ejecutar backend + frontend concurrentemente
npm run lint          # Ejecutar Standard JS linter
npm run check-minio   # Verificar conexión y configuración MinIO
npm run test-whatsapp # Probar integración WhatsApp Web
```

### Scripts de Utilidad (Carpeta /scripts)
```bash
# Configuración y diagnóstico
node scripts/check-minio.js              # Verificar MinIO y buckets
node scripts/check-users.js              # Listar usuarios y roles
node scripts/createDefaultRoles.js       # Crear roles por defecto

# Migración y mantenimiento
node scripts/migrate-images.js           # Migrar imágenes entre buckets
node scripts/cleanup-old-bucket.js       # Limpiar buckets obsoletos
node scripts/update-profesor-images.js   # Actualizar imágenes de profesores

# Debug y testing
node scripts/debug-roles.js              # Debug del sistema de roles
node scripts/debug-delete-material.js    # Debug eliminación de materiales
node scripts/test-user-passwords.js      # Verificar hashes de contraseñas
node scripts/test-delete-permission.js   # Probar permisos de eliminación
node scripts/test-material-ownership.js  # Verificar ownership de materiales
node scripts/list-bucket-contents.js     # Listar contenido de buckets
```

### Tests Disponibles (Carpeta /test)
```bash
# Pruebas específicas de WhatsApp
node test/test-whatsapp-complete.js      # Test completo WhatsApp Web
node test/test-qr-debug.js               # Debug códigos QR
node test/run-whatsapp-tests.js          # Suite completa WhatsApp

# Pruebas de API
node test/test-post-complete.js          # Test endpoints POST
node test/test-alumnos-post.js           # Test específico alumnos
node test/test-final.js                  # Test integral del sistema

# Debug y diagnóstico
node test/debug-auth.js                  # Debug autenticación
node test/debug-auth-status.js           # Estado de autenticación
node test/debug-token-status.js          # Estado de tokens JWT
node test/debug-middleware-flow.js       # Flujo de middlewares
```

## 🚀 API Endpoints Completos

### 🔑 Authentication Endpoints
```http
# Autenticación básica
POST   /api/auth/login           # Login con username/email y password
POST   /api/auth/logout          # Logout y revocación de tokens
POST   /api/auth/refresh         # Renovar access token con refresh token
GET    /api/auth/verify          # Verificar validez del token actual

# Headers requeridos para rutas protegidas:
# Authorization: Bearer <access_token>
```

### 👥 User Management Endpoints
```http
# Gestión de usuarios (Admin/Profesor)
GET    /api/users                # Listar usuarios con paginación
POST   /api/users                # Crear nuevo usuario
GET    /api/users/:id            # Obtener usuario por ID
PUT    /api/users/:id            # Actualizar usuario
DELETE /api/users/:id            # Eliminar usuario (soft delete)

# Gestión de roles (Solo Admin)
GET    /api/roles                # Listar roles disponibles
POST   /api/roles                # Crear nuevo rol
PUT    /api/roles/:id            # Actualizar rol
GET    /api/roles/:id/users      # Usuarios con rol específico
```

### 📚 Materials & Content Endpoints
```http
# Materiales educativos
GET    /api/materials                    # Listar materiales (con filtros)
POST   /api/materials/upload-url         # Generar URL pre-firmada para subida
POST   /api/materials/confirm-upload     # Confirmar subida y crear registro
GET    /api/materials/:id                # Obtener detalles del material
GET    /api/materials/:id/download-url   # Generar URL de descarga temporal
PUT    /api/materials/:id                # Actualizar metadatos del material
DELETE /api/materials/:id                # Eliminar material y archivo

# Parámetros de consulta para GET /api/materials:
# ?page=1&limit=20&category=partitura&level=beginner&instrument=piano
# &search=escalas&owner=user_id&public=true&sort=createdAt&order=desc

# Galería de imágenes
GET    /api/galeria                      # Listar imágenes de galería
POST   /api/galeria/upload-url           # URL para subir imagen a galería
POST   /api/galeria/confirm-upload       # Confirmar subida de imagen
DELETE /api/galeria/:id                 # Eliminar imagen de galería
PUT    /api/galeria/:id/order            # Cambiar orden en galería
```

### 💾 File System Endpoints
```http
# Sistema de archivos
GET    /api/files/health                 # Health check del sistema de archivos
GET    /api/files/:bucket/:filename      # Descargar archivo directo (con auth)
DELETE /api/files/:bucket/:filename      # Eliminar archivo del bucket
GET    /api/files/buckets/info           # Información de buckets y uso
```

### 🎼 Student Management Endpoints
```http
# Gestión de alumnos
GET    /api/alumnos                      # Listar alumnos con filtros
POST   /api/alumnos                      # Crear nuevo alumno
GET    /api/alumnos/:id                  # Obtener alumno por ID
PUT    /api/alumnos/:id                  # Actualizar datos del alumno
DELETE /api/alumnos/:id                  # Eliminar alumno
GET    /api/alumnos/search/:term         # Búsqueda por nombre/RUT
GET    /api/alumnos/stats                # Estadísticas de alumnos

# Parámetros de consulta para GET /api/alumnos:
# ?instrument=piano&level=beginner&active=true&age_min=5&age_max=18
```

### 📱 Communication Endpoints
```http
# Sistema de mensajería
POST   /api/messaging/send-whatsapp      # Enviar mensaje por WhatsApp
POST   /api/messaging/send-email         # Enviar email
GET    /api/messaging/config-status      # Estado de configuraciones
GET    /api/messaging/templates          # Plantillas disponibles

# WhatsApp Web específico
GET    /api/messaging/whatsapp-web/qr    # Obtener código QR para conexión
GET    /api/messaging/whatsapp-web/status # Estado de la conexión
POST   /api/messaging/whatsapp-web/disconnect # Desconectar sesión

# Configuración de email
GET    /api/messaging/email-config       # Obtener configuración actual
PUT    /api/messaging/email-config       # Actualizar configuración
POST   /api/messaging/email-config/test  # Probar configuración
```

### 🌐 Website Content Endpoints
```http
# Carousel de imágenes
GET    /api/carousel                     # Obtener imágenes del carousel
POST   /api/carousel/upload-url          # URL para subir imagen al carousel
POST   /api/carousel/confirm-upload      # Confirmar subida al carousel
PUT    /api/carousel/:id/order           # Cambiar orden en carousel
DELETE /api/carousel/:id                # Eliminar imagen del carousel

# Cards de profesores
GET    /api/cards-profesores             # Listar cards de profesores
POST   /api/cards-profesores             # Crear card de profesor
PUT    /api/cards-profesores/:id         # Actualizar card de profesor
DELETE /api/cards-profesores/:id         # Eliminar card de profesor
POST   /api/cards-profesores/:id/image   # Subir imagen del profesor
```

### 📈 Admin & Monitoring Endpoints
```http
# Administración
GET    /api/admin/stats                  # Estadísticas generales del sistema
GET    /api/admin/logs                   # Últimos logs del sistema
GET    /api/admin/health                 # Health check completo
POST   /api/admin/maintenance            # Activar modo mantenimiento

# Auditoría
GET    /api/admin/audit                  # Logs de auditoría
GET    /api/admin/audit/user/:id         # Auditoría por usuario
GET    /api/admin/audit/actions          # Acciones auditadas
```

## 🛡️ Middleware y Seguridad

### 🌐 Middlewares Globales
```javascript
// Configuración de seguridad
app.use(helmet())                    // Headers de seguridad
app.use(cors({                       // CORS configurado
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))    // Parser JSON con límite
app.use(express.urlencoded({ extended: true })) // Parser URL-encoded
app.use(compression())               // Compresión gzip
app.use(morgan('combined'))          // Logging de requests
app.use(lusca.csrf())               // Protección CSRF
```

### 🔐 Middlewares de Autenticación
```javascript
// JWT Authentication
const authenticateJWT = (req, res, next) => {
  // Verificación de token en header Authorization
  // Extracción de payload y verificación de expiración
  // Inyección de user data en req.user
}

// Control de Roles
const requireRole = (roles) => (req, res, next) => {
  // Verificación de roles del usuario
  // Support para roles múltiples: ['admin', 'profesor']
  // Jerarquía de roles: admin > profesor > asistente
}

// Autenticación Opcional
const optionalAuth = (req, res, next) => {
  // Permite acceso sin token pero inyecta user si existe
  // Usado para endpoints públicos con funcionalidad extra
}
```

### ✅ Middlewares de Validación
```javascript
// Validación de Schemas
const validateRequest = (schema) => (req, res, next) => {
  // Validación con Joi de body, params, query
  // Sanitización automática de datos
  // Respuestas de error estandarizadas
}

// Validación de Archivos
const validateFile = {
  type: ['image/jpeg', 'image/png', 'application/pdf'],
  size: 50 * 1024 * 1024, // 50MB
  required: true
}

// Validación Avanzada
const enhancedValidation = {
  rutValidation: (rut) => { /* Validación RUT chileno */ },
  emailValidation: (email) => { /* Validación email */ },
  phoneValidation: (phone) => { /* Validación teléfono */ }
}
```

### 🚨 Error Handling
```javascript
// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {
  // Logging estructurado del error
  // Clasificación de errores (validation, auth, server)
  // Respuestas consistentes sin exposición de internals
  // Rate limiting para prevenir spam
}

// Async Error Wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Custom Error Types
class ValidationError extends Error { /* */ }
class AuthenticationError extends Error { /* */ }
class AuthorizationError extends Error { /* */ }
class NotFoundError extends Error { /* */ }
```

### 📁 Middlewares de Archivos
```javascript
// Control de Acceso a Archivos
const fileAccessMiddleware = async (req, res, next) => {
  // Verificación de ownership del archivo
  // Control de acceso público/privado
  // Rate limiting para descargas
  // Logging de accesos
}

// Cache de Archivos
const fileCacheMiddleware = (req, res, next) => {
  // Headers de cache apropiados
  // ETags para archivos estáticos
  // Compresión condicional
}
```

### 🔒 Rate Limiting
```javascript
// Rate Limiting por Endpoint
const rateLimits = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 },     // 5 intentos/15min
  upload: { windowMs: 60 * 1000, max: 10 },       // 10 uploads/min
  api: { windowMs: 15 * 60 * 1000, max: 100 },    // 100 requests/15min
  download: { windowMs: 60 * 1000, max: 50 }      // 50 descargas/min
}
```

## 🗄️ Base de Datos y Modelos

### 📊 Esquema de Base de Datos

#### 👤 User Model
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  rut: String (unique, required, validated),
  email: String (unique, required),
  password: String (hashed with bcrypt),
  roles: [ObjectId] (ref: 'Role'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  refreshTokens: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### 🏷️ Role Model
```javascript
{
  _id: ObjectId,
  name: String (enum: ['administrador', 'profesor', 'asistente']),
  permissions: [String],
  hierarchy: Number, // 1=admin, 2=profesor, 3=asistente
  createdAt: Date
}
```

#### 📚 Material Model
```javascript
{
  _id: ObjectId,
  nombre: String (required),
  descripcion: String,
  categoria: String (enum: categories),
  nivel: String (enum: ['beginner', 'intermediate', 'advanced']),
  instrumento: String,
  tags: [String],
  owner: ObjectId (ref: 'User'),
  isPublic: Boolean (default: false),
  bucketTipo: String (enum: ['privado', 'publico']),
  filename: String (MinIO filename),
  originalName: String,
  mimeType: String,
  size: Number,
  downloadCount: Number (default: 0),
  metadata: {
    duration: Number, // Para archivos de audio/video
    pages: Number,    // Para PDFs
    dimensions: { width: Number, height: Number } // Para imágenes
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 🎓 Alumno Model
```javascript
{
  _id: ObjectId,
  // Datos del estudiante
  nombre: String (required),
  apellidoPaterno: String (required),
  apellidoMaterno: String,
  rut: String (unique, required, validated),
  fechaNacimiento: Date,
  telefono: String,
  email: String,
  
  // Datos del apoderado
  nombreApoderado: String (required),
  rutApoderado: String (required, validated),
  telefonoApoderado: String (required),
  emailApoderado: String (required),
  relacionApoderado: String (enum: ['padre', 'madre', 'tutor', 'otro']),
  
  // Datos académicos
  instrumentos: [String],
  estilosMusicales: [String],
  nivelExperiencia: String (enum: ['principiante', 'intermedio', 'avanzado']),
  profesor: ObjectId (ref: 'User'),
  horarioClases: String,
  fechaIngreso: Date (default: Date.now),
  
  // Información médica
  condicionesMedicas: String,
  medicamentos: String,
  contactoEmergencia: {
    nombre: String,
    telefono: String,
    relacion: String
  },
  
  // Estado
  activo: Boolean (default: true),
  observaciones: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 🖼️ Galeria Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  filename: String (MinIO filename),
  originalName: String,
  mimeType: String,
  size: Number,
  order: Number (for carousel ordering),
  isActive: Boolean (default: true),
  uploadedBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

#### 👨‍🏫 CardsProfesores Model
```javascript
{
  _id: ObjectId,
  nombre: String (required),
  apellido: String (required),
  especialidad: [String], // instrumentos que enseña
  descripcion: String,
  experiencia: String,
  imageFilename: String (MinIO filename),
  email: String,
  telefono: String,
  horarios: String,
  tarifa: Number,
  orden: Number,
  activo: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### 🎠 Carousel Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageFilename: String (MinIO filename),
  link: String, // URL opcional
  order: Number (required),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### 📧 EmailTemplate Model
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  subject: String (required),
  htmlBody: String (required),
  textBody: String,
  variables: [String], // Variables disponibles: {{nombre}}, {{fecha}}
  category: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 🔗 Relaciones y Referencias
```
Users ──┐
        ├──→ Materials (owner)
        ├──→ Alumnos (profesor)
        ├──→ Galeria (uploadedBy)
        └──→ CardsProfesores (referenced)

Roles ←──── Users (Many-to-Many)

Materials ──→ MinIO Files (filename reference)
Galeria   ──→ MinIO Files (filename reference)
Carousel  ──→ MinIO Files (imageFilename reference)
```

### 📈 Índices de Base de Datos
```javascript
// Usuarios
User.index({ username: 1 }, { unique: true })
User.index({ email: 1 }, { unique: true })
User.index({ rut: 1 }, { unique: true })

// Materiales
Material.index({ owner: 1 })
Material.index({ categoria: 1, nivel: 1 })
Material.index({ tags: 1 })
Material.index({ isPublic: 1 })
Material.index({ createdAt: -1 })

// Alumnos
Alumno.index({ rut: 1 }, { unique: true })
Alumno.index({ rutApoderado: 1 })
Alumno.index({ profesor: 1 })
Alumno.index({ activo: 1 })

// Galería y Carousel
Galeria.index({ order: 1 })
Carousel.index({ order: 1, isActive: 1 })
```

## 📋 Logging y Monitoreo

### 🗂️ Configuración de Logging
```javascript
// Winston Configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.colorize({ all: true })
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 20971520, // 20MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 20971520,
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```

### 📊 Categorías de Logs
- **📡 Request Logs**: Todas las peticiones HTTP con tiempos de respuesta
- **🔐 Auth Logs**: Intentos de login, renovación de tokens, accesos denegados
- **📁 File Logs**: Subidas, descargas, eliminaciones de archivos
- **💬 Communication Logs**: Envío de emails, WhatsApp, errores de conectividad
- **⚠️ Error Logs**: Errores del sistema, excepciones no controladas
- **🔍 Audit Logs**: Cambios en datos críticos, acciones administrativas

### 📁 Archivos de Log
```
logs/
├── error.log          # Solo errores críticos
├── combined.log       # Todos los niveles de log
├── access.log         # Logs de acceso HTTP (Morgan)
└── audit.log          # Logs de auditoría

src/core/logs/
├── combined.log       # Logs específicos del core
└── error.log          # Errores del core
```

### 🔍 Estructura de Logs
```javascript
{
  "timestamp": "2025-01-24T10:30:00.000Z",
  "level": "info",
  "message": "User authenticated successfully",
  "service": "authentication",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "action": "login",
  "resource": "/api/auth/login",
  "duration": 250,
  "metadata": {
    "username": "admin",
    "roles": ["administrador"]
  }
}
```

## 🔒 Seguridad y Protección

### 🔐 Autenticación JWT
```javascript
// Configuración JWT
const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    algorithm: 'HS256'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  }
}

// Hash de contraseñas
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### 🛡️ Medidas de Seguridad Implementadas
- **🔑 Refresh Tokens**: Renovación automática sin re-login
- **🚫 Token Blacklist**: Revocación inmediata de tokens comprometidos
- **⏰ Expiración Automática**: Tokens con TTL configurable
- **🔒 HTTPS Only**: Cookies y tokens solo por HTTPS en producción
- **🌐 CORS Restringido**: Solo dominios autorizados
- **🛡️ Helmet.js**: Headers de seguridad automáticos
- **🚨 Rate Limiting**: Protección contra ataques de fuerza bruta
- **🧹 Input Sanitization**: Limpieza automática de entrada

### 👥 Control de Acceso (RBAC)
```javascript
// Jerarquía de roles
const roleHierarchy = {
  administrador: 1,  // Acceso total
  profesor: 2,       // Gestión de materiales y alumnos
  asistente: 3       // Solo lectura y tareas básicas
}

// Permisos por rol
const permissions = {
  administrador: ['*'],
  profesor: ['materials:*', 'alumnos:*', 'messaging:send'],
  asistente: ['materials:read', 'alumnos:read']
}
```

### 🔒 Validaciones de Seguridad
```javascript
// Validación RUT chileno
const validateRUT = (rut) => {
  // Algoritmo de validación del dígito verificador
  // Formato: 12.345.678-9 o 12345678-9
}

// Sanitización de entrada
const sanitizeInput = (data) => {
  // Eliminación de scripts maliciosos
  // Escape de caracteres HTML
  // Normalización de strings
}

// Validación de archivos
const fileValidation = {
  allowedTypes: [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword',
    'audio/mpeg', 'video/mp4'
  ],
  maxSize: 50 * 1024 * 1024, // 50MB
  scanForMalware: true
}
```

### 📱 Sistema de Comunicación WhatsApp

#### 🔧 Configuración Multi-Proveedor
```javascript
// 3 Proveedores de WhatsApp
const whatsappProviders = {
  web: {
    service: 'WhatsApp Web',
    requires: 'QR Code scan',
    status: 'Connected/Disconnected',
    limitations: 'Browser dependency'
  },
  business: {
    service: 'WhatsApp Business API',
    requires: 'API Token + Phone ID',
    status: 'Active',
    limitations: 'Requires approval'
  },
  callmebot: {
    service: 'CallMeBot API',
    requires: 'API Key',
    status: 'Available',
    limitations: 'Rate limited'
  }
}
```

#### 📨 Sistema de Plantillas
```javascript
// Plantillas de mensajes
const messageTemplates = {
  welcome: {
    subject: 'Bienvenido a Escuela de Música',
    body: 'Hola {{nombre}}, bienvenido a nuestra escuela...',
    variables: ['nombre', 'fecha', 'instructor']
  },
  reminder: {
    subject: 'Recordatorio de Clase',
    body: 'Recordamos tu clase de {{instrumento}} el {{fecha}}...',
    variables: ['nombre', 'instrumento', 'fecha', 'hora']
  }
}
```

#### 🎯 Funcionalidades de Mensajería
- **📱 Múltiples Canales**: WhatsApp Web, Business API, CallMeBot, Email
- **🔄 Sistema de Fallback**: Cambio automático entre proveedores
- **📋 Plantillas Dinámicas**: Variables personalizables
- **📊 Tracking Completo**: Estado de envío y entrega
- **⚡ Envío Masivo**: Mensajes a múltiples destinatarios
- **🔐 Autenticación QR**: Conexión segura WhatsApp Web

## Testing

### Estructura
```
tests/
├── unit/           # Tests unitarios por feature
├── integration/    # Tests de integración
├── fixtures/       # Datos de prueba
└── helpers/        # Utilidades de testing
```

### Configuración
- **Framework**: Jest
- **Mocking**: Mongoose mocks, MinIO mocks
- **Coverage**: Reporte de cobertura automático
- **CI**: Tests ejecutados en cada push

## Desarrollo

### Agregar Nueva Feature
1. Crear directorio en `src/features/nueva-feature/`
2. Implementar controladores, servicios, repositorios y rutas
3. Agregar tests correspondientes
4. Registrar rutas en `src/routes/index.routes.js`
5. Documentar endpoints y funcionalidades

### Convenciones de Código
- **Naming**: camelCase para variables, PascalCase para clases
- **Files**: kebab-case para archivos, feature.type.js
- **Imports**: Paths absolutos desde src/
- **Comments**: JSDoc para funciones públicas

### Git Workflow
- **main**: Rama de producción
- **dev**: Rama de desarrollo
- **feature/***: Ramas de características
- **hotfix/***: Ramas de correcciones urgentes

## Troubleshooting

### Problemas Comunes

#### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté ejecutándose
systemctl status mongod

# Verificar variables de entorno
echo $MONGODB_URI
```

#### Error de conexión a MinIO
```bash
# Ejecutar script de diagnóstico
node scripts/check-minio.js

# Verificar configuración en .env
```

#### Errores de permisos de archivos
```bash
# Verificar permisos del directorio de logs
chmod 755 logs/

# Verificar permisos de MinIO buckets
```

### Logs de Debug
```bash
# Ejecutar con logs de debug
DEBUG=* npm run dev

# Ver logs en tiempo real
tail -f logs/combined.log
```

## Despliegue

### Producción
```bash
# Build del proyecto
npm run build

# Configurar variables de entorno de producción
export NODE_ENV=production
export MONGODB_URI=mongodb://prod-server:27017/escuela_musica

# Ejecutar con PM2
pm2 start ecosystem.config.js

# Verificar estado
pm2 status
```

### Docker
```bash
# Build de imagen
docker build -t escuela-musica-backend .

# Ejecutar contenedor
docker run -p 80:80 --env-file .env escuela-musica-backend
```

## Contacto

Para consultas técnicas sobre la arquitectura, implementación de nuevas features o problemas de desarrollo, contactar al equipo de desarrollo.

---

## 🚀 Información de Despliegue

### 📦 Preparación para Producción
```bash
# Variables de entorno requeridas
export NODE_ENV=production
export JWT_SECRET="tu_jwt_secret_muy_seguro_en_produccion"
export MONGODB_URI="mongodb://prod-server:27017/escuela_musica"
export MINIO_ENDPOINT="minio.tudominio.com"

# Instalación y build
npm ci --only=production
npm run lint

# Verificar configuración
node scripts/check-minio.js
node scripts/check-users.js
```

### 🐳 Docker Deployment
```dockerfile
# Dockerfile optimizado para producción
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
EXPOSE 80
CMD ["npm", "start"]
```

### ⚙️ PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'escuela-musica-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 80
    }
  }]
}
```

---

## 📈 Mejoras y Características Avanzadas

### ✨ Características Implementadas
- **🔄 Hot Reload**: Desarrollo con nodemon
- **📊 Structured Logging**: Winston con rotación automática
- **🔐 Multi-Provider Auth**: JWT + Refresh tokens
- **📱 Multi-Channel Messaging**: WhatsApp + Email integrados
- **💾 Intelligent Caching**: URLs pre-firmadas con TTL
- **🛡️ Security Headers**: Helmet.js + CORS + Rate limiting
- **📁 Advanced File Management**: MinIO con 4 buckets especializados
- **🎯 Role-Based Access Control**: Jerarquía de permisos granular
- **📈 Health Monitoring**: Health checks automáticos
- **🔍 Comprehensive Auditing**: Tracking de todas las acciones críticas

### 🚧 Roadmap de Mejoras
1. **📊 API Documentation**: Implementar Swagger/OpenAPI
2. **🧪 Testing Suite**: Tests unitarios e integración con Jest
3. **⚡ Redis Caching**: Cache distribuido para mejor performance
4. **📈 Metrics & Monitoring**: Prometheus + Grafana
5. **🔄 CI/CD Pipeline**: Automated deployment with GitHub Actions
6. **🌐 CDN Integration**: CloudFront para archivos estáticos
7. **🔒 Advanced Security**: 2FA + OAuth integration
8. **📱 Push Notifications**: Firebase Cloud Messaging
9. **🤖 AI Integration**: Chatbot para soporte automático
10. **📊 Analytics Dashboard**: Métricas de uso en tiempo real

---

## 👥 Equipo de Desarrollo

### 🎯 Contribuidores Principales
- **Brian Cabezas** - Full Stack Developer
- **Bairon Sanhueza** - Backend Developer  
- **Victor Alguilera** - Frontend Developer
- **Gerardo Cadin** - System Architect
- **Cristian Torres** - DevOps Engineer

### 📞 Contacto y Soporte
Para consultas técnicas, reportes de bugs o contribuciones:
- **Email**: dev-team@escuela-musica.com
- **GitHub Issues**: [Repositorio del proyecto]
- **Documentación**: [Wiki del proyecto]

---

## 📜 Licencia y Términos

Este proyecto está licenciado bajo **ISC License**.

### 🔒 Consideraciones de Seguridad
- **Datos Sensibles**: Nunca commite credenciales al repositorio
- **Producción**: Usa HTTPS y certificados SSL válidos
- **Backups**: Realiza backups regulares de MongoDB y MinIO
- **Monitoring**: Implementa alertas para errores críticos

---

**🎵 Escuela de Música - Backend API**  
**Versión**: 3.0.0  
**Última actualización**: 2025-01-24  
**Node.js**: 16+ | **Express**: 5.1.0 | **MongoDB**: 4.4+ | **MinIO**: Storage