
# 🎼 Backend - Escuela de Música

## 📋 Descripción
Backend robusto para la gestión de materiales educativos, usuarios y recursos de una escuela de música.
Construido con Node.js, Express y MongoDB (Mongoose).
Arquitectura modular, segura y orientada a roles (usuario, profesor, administrador).
Permite autenticación JWT, subida y descarga de archivos (MinIO), gestión de usuarios, materiales y control de acceso granular.
Incluye logging avanzado, validaciones, middlewares y patrones de diseño profesionales.

---


## 🏗️ Arquitectura del Backend

El backend implementa una arquitectura modular basada en Express, con separación estricta de responsabilidades y patrones profesionales (Repository, Result, Singleton). Se emplea JWT para autenticación, MinIO para almacenamiento de archivos y Mongoose para la persistencia en MongoDB. La configuración y los logs están centralizados para facilitar el mantenimiento y la escalabilidad.

### Diagrama Simplificado

```
[Cliente]
   │
   ▼
[Express Server (server.js/app.js)]
   │
   ├── [Rutas (routes/)]
   │      ├── [Middlewares (middlewares/)]
   │      └── [Controladores (controllers/)]
   │              ├── [Servicios (services/)]
   │              │      ├── [Repositorios (repositories/)]
   │              │      └── [Modelos (models/)]
   │              └── [Utils, Patterns, Schema]
   └── [Config, Constants, Logs]
```

**Flujo principal:**
- El servidor Express recibe peticiones y las enruta según el endpoint.
- Los middlewares validan, autentican y gestionan errores.
- Los controladores procesan la lógica de cada recurso (usuarios, materiales, archivos).
- Los servicios encapsulan la lógica de negocio y orquestan acceso a datos y almacenamiento.
- Los repositorios abstraen la persistencia en MongoDB.
- Los modelos definen el esquema de datos.
- Los patrones y utilidades refuerzan la mantenibilidad y consistencia.

---

## 📄 Descripción de funcionalidad por archivo principal

### Archivos raíz
- `app.js`: Configura la aplicación Express, aplica middlewares globales y monta rutas.
- `server.js`: Punto de entrada; inicia el servidor, conecta a la base de datos y ejecuta el setup inicial.

### src/config/
- `configDB.js`: Configuración y conexión a MongoDB.
- `configEnv.js`: Carga y valida variables de entorno.
- `index.js`: Exporta la configuración centralizada.
- `initialSetup.js`: Crea roles y usuarios iniciales si no existen.
- `minio.config.js`: Configuración y conexión a MinIO para almacenamiento de archivos.

### src/constants/
- `app.constants.js`: Constantes globales de la aplicación (nombres, límites, etc).
- `roles.constants.js`: Definición de roles y permisos.
- `index.js`: Exporta todas las constantes.

### src/controllers/
- `auth/`: Controladores para login, registro y autenticación JWT.
- `file/`: Controladores para subida, descarga y gestión de archivos.
- `material/`: Controladores para CRUD de materiales educativos.
- `user/`: Controladores para gestión de usuarios y roles.

### src/middlewares/
- `common.middleware.js`: Middlewares genéricos (headers, CORS, etc).
- `logging.middleware.js`: Middleware para logging de peticiones y errores.
- `index.js`: Exporta middlewares principales.
- `auth/`: Middlewares de autenticación y autorización por roles.
- `error/`: Middlewares de manejo de errores globales.
- `file/`: Middlewares para validación y procesamiento de archivos.
- `validation/`: Middlewares de validación de datos (Joi, etc).

### src/models/
- `file.model.js`: Esquema y modelo de archivos almacenados.
- `material.model.js`: Esquema y modelo de materiales educativos.
- `role.model.js`: Esquema y modelo de roles de usuario.
- `user.model.js`: Esquema y modelo de usuarios.

### src/patterns/
- `Result.js`: Implementación del patrón Result para respuestas consistentes.
- `index.js`: Exporta patrones y utilidades.

### src/repositories/
- `BaseRepository.js`: Funcionalidad base para repositorios (CRUD genérico).
- `MaterialRepository.js`: Acceso y lógica de persistencia para materiales.
- `UserRepository.js`: Acceso y lógica de persistencia para usuarios.
- `index.js`: Exporta repositorios.

### src/routes/
- `admin.routes.js`: Rutas para administración avanzada (solo admin).
- `auth.routes.js` y `auth.routes.enhanced.js`: Rutas de autenticación y variantes avanzadas.
- `file.routes.js`: Rutas para gestión de archivos.
- `index.routes.js`: Punto de entrada para todas las rutas.
- `material.routes.js`: Rutas para materiales educativos.
- `user.routes.js`: Rutas para usuarios.

### src/schema/
- `auth.schema.js`: Esquemas de validación para autenticación.
- `common.schema.js`: Esquemas de validación comunes.
- `user.schema.js`: Esquemas de validación para usuarios.

### src/services/
- `base.service.js`: Lógica base para servicios reutilizables.
- `auth/`: Servicios de autenticación y gestión de sesión.
- `material/`: Servicios de lógica de negocio para materiales.
- `monitoring/`: Servicios de monitoreo y métricas.
- `storage/`: Servicios para interacción con MinIO.
- `user/`: Servicios de lógica de negocio para usuarios.
- `index.js`: Exporta servicios.

### src/utils/
- `errorHandler.util.js`: Utilidad para manejo centralizado de errores.
- `errorWrapper.util.js`: Wrapper para capturar errores en funciones async.
- `logger.util.js`: Utilidad para logging estructurado (Winston).
- `responseHandler.util.js`: Utilidad para respuestas HTTP consistentes.

### logs/
- `combined.log`: Log combinado de eventos y errores.
- `error.log`: Log exclusivo de errores.

---

## ⚙️ Funcionamiento general
- **Autenticación:** Registro y login seguro, JWT, roles y permisos.
- **Gestión de materiales:** CRUD de materiales, subida/descarga de archivos, control de acceso por rol.
- **Gestión de usuarios:** CRUD, asignación de roles, validaciones y seguridad.
- **Gestión de archivos:** Subida a MinIO, descarga segura, validación de tipos y tamaños.
- **Middlewares:** Validación, logging, manejo de errores, autorización y utilidades comunes.
- **Patrones:** Uso de Repository y Result para desacoplar lógica y mejorar mantenibilidad.
- **Logging:** Logs estructurados, rotación y trazabilidad de errores.
- **Configuración:** Variables de entorno, configuración centralizada y setup inicial automático.

---

## 🏅 Análisis profesional y puntuación (2025-07-19)

### Puntuación general
- **Arquitectura y modularidad:** ⭐⭐⭐⭐⭐ (5/5)
- **Responsabilidad única y separación de lógica:** ⭐⭐⭐⭐⭐ (5/5)
- **Seguridad y control de acceso:** ⭐⭐⭐⭐⭐ (5/5)
- **Escalabilidad y extensibilidad:** ⭐⭐⭐⭐⭐ (5/5)
- **Documentación y mantenibilidad:** ⭐⭐⭐⭐✰ (4/5)
- **Testing y cobertura:** ⭐⭐⭐✰✰ (3.5/5)
- **Performance y robustez:** ⭐⭐⭐⭐⭐ (5/5)

### Fortalezas principales
- **Modularidad:** Carpetas y archivos bien segmentados y desacoplados.
- **Seguridad:** JWT, middlewares de autorización, validaciones y control de roles.
- **Patrones profesionales:** Uso de Repository, Result y separación de capas.
- **Logging avanzado:** Winston, logs estructurados y rotación.
- **Escalabilidad:** Fácil de extender con nuevos módulos, rutas y servicios.
- **Configuración centralizada:** Variables de entorno y setup inicial automatizado.
- **Manejo de errores:** Middlewares y utilidades para respuestas consistentes.

---

### 🛠️ Posibles mejoras a implementar
- **Aumentar test coverage:** Agregar más pruebas unitarias y de integración, especialmente en servicios y middlewares críticos.
- **Documentación:** Mejorar comentarios, ejemplos de uso y guías de integración para cada módulo y middleware.
- **Internacionalización de mensajes:** Centralizar mensajes de error y éxito para facilitar traducción.
- **Validaciones avanzadas:** Robustecer validaciones de entrada y sanitización de datos.
- **Integración con sistemas externos:** Considerar monitoreo, métricas y alertas (Prometheus, Sentry, etc.).
- **Optimización de performance:** Revisar consultas a base de datos y uso de índices.
- **Automatización de despliegue:** Scripts y documentación para CI/CD y despliegue en la nube.

---

## 🚀 Instalación y uso

```bash
cd backend
npm install
npm run dev
```

---

## 📁 Estructura de carpetas

- `src/config/` - Configuración de entorno, base de datos y MinIO
- `src/constants/` - Constantes globales
- `src/controllers/` - Lógica de rutas y controladores
- `src/middlewares/` - Middlewares de autenticación, validación, logging y errores
- `src/models/` - Modelos de datos (Mongoose)
- `src/patterns/` - Patrones de diseño y utilidades
- `src/repositories/` - Acceso a datos y lógica de persistencia
- `src/routes/` - Definición de rutas
- `src/schema/` - Esquemas de validación
- `src/services/` - Lógica de negocio y servicios
- `src/utils/` - Utilidades y helpers
- `logs/` - Archivos de logs

---

## 🧑‍💻 Contacto y soporte
Para dudas o mejoras, contacta al equipo de desarrollo.
