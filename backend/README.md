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

## Features

### Authentication
- **Responsabilidad**: Manejo de autenticación y autorización
- **Endpoints**: `/api/auth/login`, `/api/auth/register`
- **Componentes**: JWT middleware, role middleware, authentication service
- **Funcionalidades**: Login, registro, validación de tokens, control de roles

### Content Management
- **Responsabilidad**: Gestión de materiales educativos y galería
- **Endpoints**: `/api/materials/*`, `/api/galeria/*`
- **Componentes**: MaterialRepository, material service, upload controller
- **Funcionalidades**: CRUD de materiales, gestión de galería, subida de archivos

### File System
- **Responsabilidad**: Manejo de archivos y almacenamiento
- **Endpoints**: `/api/files/*`
- **Componentes**: MinIO service, access middleware, file controller
- **Funcionalidades**: Upload/download de archivos, control de acceso, serving de archivos

### User Management
- **Responsabilidad**: Gestión de usuarios y roles
- **Endpoints**: `/api/users/*`, `/api/roles/*`
- **Componentes**: UserRepository, user service, role controller
- **Funcionalidades**: CRUD de usuarios, asignación de roles, gestión de perfiles

### Communication
- **Responsabilidad**: Sistema de mensajería y notificaciones
- **Endpoints**: `/api/messaging/*`
- **Componentes**: Messaging service, WhatsApp service, email config
- **Funcionalidades**: Envío de emails, integración WhatsApp Web, notificaciones

### Student Management
- **Responsabilidad**: Gestión específica de estudiantes
- **Endpoints**: `/api/alumnos/*`
- **Componentes**: Alumnos controller, alumnos service
- **Funcionalidades**: CRUD de estudiantes, datos académicos

### Website Content
- **Responsabilidad**: Gestión de contenido del sitio web
- **Endpoints**: `/api/cards-profesores/*`, `/api/carousel/*`
- **Componentes**: Cards profesores controller, carousel service
- **Funcionalidades**: Gestión de contenido dinámico, carousel de imágenes

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
NODE_ENV=development
PORT=80
JWT_SECRET=tu_jwt_secret_muy_seguro
MONGODB_URI=mongodb://localhost:27017/escuela_musica
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=tu_access_key
MINIO_SECRET_KEY=tu_secret_key
MINIO_BUCKET_PRIVATE=materiales-privados
MINIO_BUCKET_PUBLIC=materiales-publicos
MINIO_BUCKET_GALERY=galeria-imagenes
```

## Scripts Disponibles

### NPM Scripts
```bash
npm run dev      # Ejecutar en modo desarrollo con nodemon
npm start        # Ejecutar en producción
npm run lint     # Ejecutar ESLint con corrección automática
npm test         # Ejecutar tests con Jest
npm run test:watch    # Ejecutar tests en modo watch
npm run test:coverage # Generar reporte de cobertura
```

### Scripts de Utilidad
```bash
# Verificar configuración de MinIO
node scripts/check-minio.js

# Crear roles por defecto en la base de datos
node scripts/createDefaultRoles.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios
- `POST /api/auth/refresh` - Renovar token JWT
- `POST /api/auth/logout` - Logout de usuarios

### Materials
- `GET /api/materials` - Listar materiales con paginación
- `POST /api/materials` - Crear nuevo material
- `GET /api/materials/:id` - Obtener material por ID
- `PUT /api/materials/:id` - Actualizar material
- `DELETE /api/materials/:id` - Eliminar material

### Files
- `POST /api/files/upload` - Subir archivo
- `GET /api/files/:id/download` - Descargar archivo
- `GET /api/files/:id/serve` - Servir archivo
- `DELETE /api/files/:id` - Eliminar archivo

### Users (Admin only)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Roles (Admin only)
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol

## Middleware

### Globales
- **CORS**: Configurado para permitir requests del frontend
- **Body Parser**: JSON y URL-encoded
- **Compression**: Compresión gzip de responses
- **Request Logging**: Log de todas las requests con Winston

### Autenticación
- **JWT Middleware**: Validación de tokens en rutas protegidas
- **Role Middleware**: Control de acceso basado en roles
- **Optional Auth**: Autenticación opcional para endpoints públicos

### Validación
- **Schema Validation**: Validación con Joi de request bodies
- **File Validation**: Validación de tipos y tamaños de archivos
- **Enhanced Validation**: Validaciones complejas con reglas de negocio

### Error Handling
- **Global Error Handler**: Captura y formatea todos los errores
- **Async Error Wrapper**: Wrapper para funciones async
- **Custom Error Types**: Errores específicos del dominio

## Base de Datos

### Modelos Principales
- **User**: Usuarios del sistema con roles y permisos
- **Role**: Roles disponibles (usuario, profesor, administrador)
- **Material**: Materiales educativos con metadatos
- **File**: Referencias a archivos almacenados en MinIO
- **Alumnos**: Información de estudiantes
- **Galeria**: Imágenes de la galería del sitio

### Relaciones
- User → Roles (Many-to-Many)
- Material → User (Many-to-One)
- File → User (Many-to-One)
- Material → File (One-to-Many)

## Logging

### Configuración
- **Transporte**: Archivos y consola
- **Niveles**: error, warn, info, debug
- **Formato**: JSON estructurado con timestamps
- **Rotación**: Archivos de log rotan diariamente

### Archivos de Log
- `logs/error.log`: Solo errores
- `logs/combined.log`: Todos los niveles
- `src/core/logs/`: Logs específicos del core

## Seguridad

### Autenticación
- JWT tokens con expiración configurable
- Refresh tokens para renovación automática
- Hash de contraseñas con bcryptjs

### Autorización
- Control de acceso basado en roles (RBAC)
- Middleware de autorización por endpoint
- Validación de permisos granulares

### Validación
- Validación de entrada con Joi
- Sanitización de datos
- Validación de tipos de archivo

### Headers de Seguridad
- CORS configurado apropiadamente
- Rate limiting en endpoints sensibles
- Sanitización de responses

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

**Versión**: 2.0.0  
**Última actualización**: 2025-07-24