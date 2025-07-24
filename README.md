# Sistema de Gestión - Escuela de Música

## Descripción
Sistema completo para la gestión de materiales educativos, usuarios y recursos en escuelas de música. Compuesto por una aplicación web React y una API REST Node.js/Express con arquitectura feature-based, control de acceso por roles y almacenamiento seguro de archivos.

---

## Arquitectura General

```
escuela-musica/
├── frontend/   # Aplicación React con Vite
├── backend/    # API REST Node.js/Express
├── docs/       # Documentación técnica
└── scripts/    # Scripts de utilidad
```

### Stack Tecnológico

**Frontend**
- React 18 + Vite
- React Router DOM para navegación
- Context API para estado global
- CSS Modules para estilos
- Vitest + React Testing Library

**Backend**
- Node.js + Express
- MongoDB con Mongoose
- MinIO para almacenamiento de archivos
- JWT para autenticación
- Winston para logging

---

## Estructura del Proyecto

### Frontend
```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Páginas principales
│   ├── services/        # Servicios de API
│   ├── utils/           # Utilidades
│   └── contexts/        # Contextos de React
├── public/              # Assets estáticos
└── dist/                # Build de producción
```

### Backend (Arquitectura Feature-based)
```
backend/
├── src/
│   ├── core/                    # Infraestructura compartida
│   │   ├── config/             # Configuraciones
│   │   ├── constants/          # Constantes globales
│   │   ├── models/             # Modelos de base de datos
│   │   ├── repositories/       # Repositorios base
│   │   ├── schemas/            # Esquemas de validación
│   │   ├── services/           # Servicios base
│   │   └── utils/              # Utilidades de infraestructura
│   ├── features/               # Funcionalidades por dominio
│   │   ├── authentication/    # Autenticación y autorización
│   │   ├── communication/     # Mensajería y notificaciones
│   │   ├── content-management/# Gestión de materiales
│   │   ├── file-system/       # Sistema de archivos
│   │   ├── monitoring/        # Auditoría y monitoreo
│   │   ├── student-management/# Gestión de estudiantes
│   │   ├── user-management/   # Gestión de usuarios
│   │   └── website-content/   # Contenido del sitio
│   ├── middlewares/           # Middlewares globales
│   ├── patterns/              # Patrones reutilizables
│   └── routes/                # Enrutamiento principal
├── scripts/                   # Scripts de utilidad
└── logs/                      # Archivos de logs
```

---

## Funcionalidades

### Gestión de Materiales
- Subida y descarga de archivos educativos
- Organización por categorías y tags
- Control de acceso por tipo de usuario
- Búsqueda y filtrado avanzado
- Gestión de galería de imágenes

### Sistema de Usuarios
- Registro y autenticación con JWT
- Tres niveles de acceso: usuario, profesor, administrador
- Gestión de perfiles y preferencias
- Sistema de roles y permisos granulares

### Gestión de Estudiantes
- Registro de información académica
- Seguimiento de progreso
- Gestión de datos personales
- Historial académico

### Comunicación
- Sistema de mensajería interno
- Integración con WhatsApp Web
- Plantillas de email configurables
- Notificaciones automáticas

### Contenido Web
- Gestión de contenido dinámico del sitio
- Administración de carousel de imágenes
- Gestión de perfiles de profesores
- CMS integrado para contenido estático

---

## Instalación y Configuración

### Prerrequisitos
```bash
node >= 16.0.0
npm >= 8.0.0
MongoDB >= 4.4
MinIO Server
```

### Configuración del Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las configuraciones necesarias

# Crear roles por defecto
node scripts/createDefaultRoles.js

# Verificar MinIO (opcional)
node scripts/check-minio.js

# Ejecutar servidor
npm run dev
```

### Configuración del Frontend
```bash
cd frontend
npm install
npm run dev
```

### Variables de Entorno Backend
```env
NODE_ENV=development
PORT=80
JWT_SECRET=tu_jwt_secret_seguro
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

---

## API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Materiales
- `GET /api/materials` - Listar materiales
- `POST /api/materials` - Crear material
- `GET /api/materials/:id` - Obtener material
- `PUT /api/materials/:id` - Actualizar material
- `DELETE /api/materials/:id` - Eliminar material

### Archivos
- `POST /api/files/upload` - Subir archivo
- `GET /api/files/:id/download` - Descargar archivo
- `GET /api/files/:id/serve` - Servir archivo

### Usuarios (Solo administradores)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Estudiantes
- `GET /api/alumnos` - Listar estudiantes
- `POST /api/alumnos` - Registrar estudiante
- `PUT /api/alumnos/:id` - Actualizar información

---

## Scripts de Desarrollo

### Frontend
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm test         # Ejecutar tests
npm run lint     # Linting con ESLint
```

### Backend
```bash
npm run dev      # Servidor con nodemon
npm start        # Servidor de producción
npm test         # Ejecutar tests con Jest
npm run lint     # Linting con ESLint
npm run test:coverage # Cobertura de tests
```

### Scripts de Utilidad
```bash
# Verificar configuración de MinIO
node backend/scripts/check-minio.js

# Crear roles por defecto
node backend/scripts/createDefaultRoles.js
```

---

## Arquitectura Técnica

### Patrones Implementados
- **Feature-based Architecture**: Organización por dominios de negocio
- **Repository Pattern**: Abstracción de acceso a datos
- **Result Pattern**: Manejo consistente de respuestas
- **Service Layer**: Encapsulación de lógica de negocio
- **Middleware Chain**: Procesamiento por capas

### Seguridad
- Autenticación JWT con refresh tokens
- Control de acceso basado en roles (RBAC)
- Validación de entrada con Joi
- Sanitización de datos
- Headers de seguridad configurados

### Base de Datos
- **Modelos principales**: User, Role, Material, File, Alumnos, Galeria
- **Relaciones**: Many-to-Many entre usuarios y roles, One-to-Many entre usuarios y materiales
- **Índices**: Optimización de consultas frecuentes

### Almacenamiento
- **MinIO**: Almacenamiento de archivos con buckets separados
- **Buckets**: Privados, públicos y galería
- **Validación**: Tipos de archivo y tamaños permitidos

---

## Testing

### Frontend
- **Framework**: Vitest
- **Utilidades**: React Testing Library
- **Cobertura**: Tests unitarios de componentes y hooks
- **E2E**: Tests de flujos principales

### Backend
- **Framework**: Jest
- **Tipos**: Unitarios, integración y E2E
- **Mocking**: Base de datos y servicios externos
- **Cobertura**: Mínimo 70% en funciones críticas

---

## Despliegue

### Desarrollo Local
1. Configurar MongoDB y MinIO
2. Instalar dependencias de frontend y backend
3. Configurar variables de entorno
4. Ejecutar scripts de inicialización
5. Iniciar servidores de desarrollo

### Producción
```bash
# Backend
npm run build
pm2 start ecosystem.config.js

# Frontend
npm run build
# Servir con nginx o servidor web
```

### Docker
```bash
# Backend
docker build -t escuela-musica-backend ./backend
docker run -p 80:80 --env-file .env escuela-musica-backend

# Frontend
docker build -t escuela-musica-frontend ./frontend
docker run -p 3000:3000 escuela-musica-frontend
```

---

## Estructura de Desarrollo

### Flujo de Trabajo
1. **Desarrollo**: Crear rama feature desde dev
2. **Testing**: Ejecutar tests unitarios e integración
3. **Review**: Pull request hacia dev
4. **Deploy**: Merge a main para producción

### Convenciones
- **Commits**: Conventional commits
- **Branching**: GitFlow simplificado
- **Code Style**: ESLint + Prettier
- **Documentation**: JSDoc para funciones públicas

---

## Monitoreo y Logs

### Logging
- **Backend**: Winston con rotación diaria
- **Niveles**: error, warn, info, debug
- **Formato**: JSON estructurado
- **Archivos**: `logs/error.log`, `logs/combined.log`

### Monitoreo
- Health checks automáticos
- Métricas de performance
- Alertas por email en errores críticos
- Dashboard de estado del sistema

---

## Troubleshooting

### Problemas Comunes

**Error de conexión a MongoDB**
```bash
# Verificar estado del servicio
systemctl status mongod
# Verificar variables de entorno
echo $MONGODB_URI
```

**Error de conexión a MinIO**
```bash
# Ejecutar diagnóstico
node backend/scripts/check-minio.js
# Verificar configuración
cat backend/.env | grep MINIO
```

**Errores de permisos**
```bash
# Verificar permisos de logs
chmod 755 backend/logs/
# Verificar permisos de uploads
chmod 755 uploads/
```

---

## Roadmap

### Próximas Funcionalidades
- Implementación de caching con Redis
- Sistema de notificaciones push
- API GraphQL complementaria
- Optimizaciones de performance
- Tests E2E automatizados
- CI/CD con GitHub Actions

### Mejoras Técnicas
- Migración a TypeScript
- Implementación de microservicios
- Documentación OpenAPI/Swagger
- Monitoreo con Prometheus
- Observabilidad con OpenTelemetry

---

## Contacto y Soporte

Para consultas técnicas, bugs o mejoras, contactar al equipo de desarrollo a través del repositorio del proyecto.

**Versión**: 2.0.0  
**Última actualización**: 2025-07-24