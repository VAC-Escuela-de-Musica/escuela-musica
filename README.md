# 🎵 Escuela de Música - Sistema de Gestión de Materiales

## 📋 Descripción del Proyecto

Sistema completo de gestión de materiales educativos para escuelas de música, desarrollado con arquitectura moderna y patrones de diseño optimizados.

### 🎯 Características Principales

- **Gestión de Materiales**: CRUD completo para materiales educativos
- **Autenticación Segura**: Sistema JWT con roles de usuario
- **Filtros Avanzados**: Búsqueda por instrumento, dificultad, género
- **Subida Múltiple**: Upload de archivos en lote
- **Visualización**: Visor integrado de imágenes y documentos
- **Testing Completo**: Suite de tests unitarios y E2E
- **Performance Optimizado**: Hooks personalizados con memoización

---

## 🏗️ Arquitectura del Sistema

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Patrón**: Custom Hooks Pattern
- **Optimización**: useMemo, useCallback, cache system

### Backend
- **Runtime**: Node.js con ES Modules
- **Database**: MongoDB con Mongoose
- **Autenticación**: JWT tokens
- **Patrones**: Command Pattern, Repository Pattern, Singleton
- **Storage**: MinIO para archivos

---

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
node >= 16.0.0
npm >= 8.0.0
MongoDB >= 4.4
```

### Instalación Frontend
```bash
cd frontend
npm install
npm run dev
```

### Instalación Backend
```bash
cd backend
npm install
npm start
```

### Variables de Entorno
```bash
# Backend (.env)
PORT=1230
MONGODB_URI=mongodb://localhost:27017/escuela-musica
JWT_SECRET=your-secret-key
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Frontend (.env)
VITE_API_URL=http://localhost:1230
```

---

## 📊 Scripts Disponibles

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run test         # Tests unitarios
npm run test:coverage # Tests con cobertura
npm run lint         # Linting del código
```

### Backend
```bash
npm start           # Servidor de producción
npm run dev         # Servidor de desarrollo
npm run test        # Tests del backend
npm run docs        # Generar documentación
```

---

## 🧪 Testing

### Cobertura de Tests
- **Frontend**: 24 tests (Login, Materials, Filters, Upload, etc.)
- **Backend**: Tests de servicios y controladores
- **E2E**: Tests de flujos completos
- **Cobertura**: >80% en funciones críticas

### Ejecutar Tests
```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests específicos
npm test -- Login.test.jsx
```

---

## 🔧 Desarrollo

### Estructura del Proyecto
```
escuela-musica/
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── hooks/             # Custom Hooks
│   │   ├── services/          # Servicios de API
│   │   ├── test/              # Tests y utilidades
│   │   └── utils/             # Utilidades generales
│   ├── public/                # Assets públicos
│   └── dist/                  # Build de producción
├── backend/
│   ├── src/
│   │   ├── controllers/       # Controladores
│   │   ├── services/          # Servicios de negocio
│   │   ├── models/            # Modelos de datos
│   │   ├── routes/            # Rutas de API
│   │   ├── middleware/        # Middlewares
│   │   ├── patterns/          # Patrones de diseño
│   │   └── utils/             # Utilidades
│   └── logs/                  # Logs del sistema
└── docs/                      # Documentación
```

### Patrones Implementados

#### Custom Hooks Pattern
```jsx
// useAuth.js - Gestión de autenticación
const { user, login, logout, loading } = useAuth();

// useMaterials.jsx - Gestión de materiales
const { materials, filters, stats, loadMaterials } = useMaterials();

// useUsers.jsx - Gestión de usuarios
const { users, createUser, updateUser, deleteUser } = useUsers();
```

#### Command Pattern
```javascript
// MaterialCommands.js
const commands = {
  CREATE_MATERIAL: async (data) => await materialService.create(data),
  UPDATE_MATERIAL: async (id, data) => await materialService.update(id, data),
  DELETE_MATERIAL: async (id) => await materialService.delete(id)
};
```

#### Repository Pattern
```javascript
// BaseRepository.js
export class BaseRepository {
  async create(data) { /* ... */ }
  async findById(id) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
}

// MaterialRepository.js extends BaseRepository
export class MaterialRepository extends BaseRepository {
  async findByFilters(filters) { /* ... */ }
  async getStats() { /* ... */ }
}
```

---

## 📈 Performance

### Optimizaciones Implementadas

#### Frontend
- **Memoización**: useMemo para cálculos complejos
- **Cache**: Sistema de cache con TTL
- **Lazy Loading**: Componentes cargados bajo demanda
- **Bundle Optimization**: Build optimizado con Vite

#### Backend
- **Singleton Services**: Instancias únicas de servicios
- **Connection Pooling**: Pool de conexiones a MongoDB
- **Caching**: Cache de consultas frecuentes
- **Async/Await**: Operaciones asíncronas optimizadas

### Métricas
- **Frontend Build**: 232.90 kB (71.49 kB gzipped)
- **Backend Response**: <100ms para consultas básicas
- **Database**: Índices optimizados para consultas frecuentes

---

## 🔐 Seguridad

### Características de Seguridad
- **JWT Authentication**: Tokens seguros con expiración
- **Role-based Access**: Control de acceso basado en roles
- **Input Validation**: Validación de datos con esquemas
- **Rate Limiting**: Protección contra ataques DDoS
- **CORS**: Configuración de CORS adecuada
- **Helmet**: Headers de seguridad HTTP

### Roles de Usuario
- **Admin**: Acceso completo al sistema
- **Teacher**: Gestión de materiales y estudiantes
- **Student**: Acceso de solo lectura a materiales

---

## 📝 API Documentation

### Endpoints Principales

#### Authentication
```
POST /api/auth/login        # Login de usuario
POST /api/auth/logout       # Logout de usuario
POST /api/auth/refresh      # Refresh token
GET  /api/auth/verify       # Verificar token
```

#### Materials
```
GET    /api/materials       # Listar materiales
POST   /api/materials       # Crear material
GET    /api/materials/:id   # Obtener material
PUT    /api/materials/:id   # Actualizar material
DELETE /api/materials/:id   # Eliminar material
POST   /api/materials/upload-multiple # Subida múltiple
```

#### Users
```
GET    /api/users           # Listar usuarios
POST   /api/users           # Crear usuario
GET    /api/users/:id       # Obtener usuario
PUT    /api/users/:id       # Actualizar usuario
DELETE /api/users/:id       # Eliminar usuario
```

---

## 🐛 Troubleshooting

### Problemas Comunes

#### Frontend no inicia
```bash
# Verificar versión de Node
node --version  # Debe ser >= 16

# Limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Backend no conecta a MongoDB
```bash
# Verificar que MongoDB esté corriendo
mongosh

# Verificar variables de entorno
cat .env
```

#### Tests fallan
```bash
# Ejecutar tests con debug
npm test -- --reporter=verbose

# Verificar configuración
cat src/test/setup.js
```

---

## 📋 Roadmap

### Próximas Funcionalidades
- [ ] **Real-time Updates**: WebSockets para actualizaciones en tiempo real
- [ ] **Advanced Search**: Búsqueda semántica con indexación
- [ ] **Mobile App**: Aplicación móvil nativa
- [ ] **Offline Support**: Funcionalidad offline con sync
- [ ] **Analytics**: Dashboard de métricas y analytics
- [ ] **Multi-language**: Soporte para múltiples idiomas

### Optimizaciones Futuras
- [ ] **Microservices**: Migración a arquitectura de microservicios
- [ ] **GraphQL**: API GraphQL para consultas optimizadas
- [ ] **CDN**: Integración con CDN para assets estáticos
- [ ] **Monitoring**: Monitoring y alertas de producción

---

## 🤝 Contribución

### Guía de Contribución
1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- **ESLint**: Linting automático
- **Prettier**: Formateo de código
- **Conventional Commits**: Formato de commits
- **Tests**: Cobertura mínima del 80%

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Contacto

- **Proyecto**: VAC-Escuela-de-Musica/escuela-musica
- **Rama**: funcionalidad/gestion-repositorio
- **Documentación**: [CHANGELOG.md](CHANGELOG.md)

---

*Última actualización: 18 de julio de 2025*
*Versión: 3.0.0*
