# 🏗️ PLAN DE REFACTORIZACIÓN - ESTRUCTURA POR FEATURES

## 📋 INFORMACIÓN DEL PROYECTO
- **Proyecto**: Sistema de Gestión Escuela de Música
- **Fecha inicio**: 2025-07-23
- **Rama actual**: dev
- **Estructura actual**: Separación por tipos (controllers/, services/, routes/, etc.)
- **Estructura objetivo**: Organización por features/funcionalidades de negocio

## 🎯 ESTRUCTURA OBJETIVO

```
src/
├── features/
│   ├── authentication/          # 🔐 Sistema de login/logout
│   ├── student-management/      # 👨‍🎓 Gestión de alumnos  
│   ├── content-management/      # 📁 Materiales y galería
│   ├── communication/           # 💬 Mensajería y notificaciones
│   ├── file-system/            # 📁 Gestión de archivos
│   ├── user-management/        # 👥 Usuarios y roles
│   └── website-content/        # 🌐 Carousel, cards profesores
├── core/
│   ├── models/                 # 📋 Todos los modelos de datos
│   ├── schemas/               # ✅ Validaciones
│   ├── utils/                 # 🛠️ Utilidades comunes
│   ├── middlewares/           # 🛡️ Middlewares globales
│   ├── config/               # ⚙️ Configuraciones
│   └── constants/            # 📝 Constantes
└── routes/
    └── index.js              # 🚦 Enrutador principal
```

## 📊 MAPEO DE ARCHIVOS ACTUALES → NUEVA ESTRUCTURA

### FEATURE: authentication/
```
ACTUAL → NUEVO
src/controllers/auth/auth.controller.js → src/features/authentication/auth.controller.js
src/services/auth/authentication.service.js → src/features/authentication/auth.service.js
src/services/auth/authorization.service.js → src/features/authentication/authorization.service.js
src/routes/auth.routes.enhanced.js → src/features/authentication/auth.routes.js
src/middlewares/auth/ → src/features/authentication/middlewares/
src/schema/auth.schema.js → src/core/schemas/auth.schema.js
```

### FEATURE: student-management/
```
ACTUAL → NUEVO
src/controllers/alumnos.controller.js → src/features/student-management/alumnos.controller.js
src/services/alumnos.service.js → src/features/student-management/alumnos.service.js
src/routes/alumnos.routes.js → src/features/student-management/alumnos.routes.js
src/models/alumnos.model.js → src/core/models/alumnos.model.js
src/schema/alumnos.schema.js → src/core/schemas/alumnos.schema.js
```

### FEATURE: content-management/
```
ACTUAL → NUEVO
src/controllers/material/ → src/features/content-management/controllers/
src/controllers/galeria.controller.js → src/features/content-management/galeria.controller.js
src/services/material/ → src/features/content-management/services/
src/services/galeria.service.js → src/features/content-management/galeria.service.js
src/routes/material.routes.js → src/features/content-management/material.routes.js
src/routes/galeria.routes.js → src/features/content-management/galeria.routes.js
src/models/material.model.js → src/core/models/material.model.js
src/models/galeria.model.js → src/core/models/galeria.model.js
```

### FEATURE: communication/
```
ACTUAL → NUEVO
src/controllers/messaging.controller.js → src/features/communication/messaging.controller.js
src/services/messaging.service.js → src/features/communication/messaging.service.js
src/services/whatsappWeb.service.js → src/features/communication/whatsapp.service.js
src/routes/messaging.routes.js → src/features/communication/messaging.routes.js
```

### FEATURE: file-system/
```
ACTUAL → NUEVO
src/controllers/file/ → src/features/file-system/controllers/
src/services/storage/ → src/features/file-system/services/
src/routes/file.routes.js → src/features/file-system/file.routes.js
src/middlewares/file/ → src/features/file-system/middlewares/
src/models/file.model.js → src/core/models/file.model.js
```

### FEATURE: user-management/
```
ACTUAL → NUEVO
src/controllers/user/user.controller.js → src/features/user-management/user.controller.js
src/controllers/role.controller.js → src/features/user-management/role.controller.js
src/services/user/user.service.js → src/features/user-management/user.service.js
src/routes/user.routes.js → src/features/user-management/user.routes.js
src/routes/role.routes.js → src/features/user-management/role.routes.js
src/models/user.model.js → src/core/models/user.model.js
src/models/role.model.js → src/core/models/role.model.js
src/schema/user.schema.js → src/core/schemas/user.schema.js
```

### FEATURE: website-content/
```
ACTUAL → NUEVO
src/controllers/carousel.controller.js → src/features/website-content/carousel.controller.js
src/controllers/cardsProfesores.controller.js → src/features/website-content/cards.controller.js
src/services/carousel.service.js → src/features/website-content/carousel.service.js
src/services/cardsProfesores.service.js → src/features/website-content/cards.service.js
src/routes/carousel.routes.js → src/features/website-content/carousel.routes.js
src/routes/cardsProfesores.routes.js → src/features/website-content/cards.routes.js
src/models/carousel.entity.js → src/core/models/carousel.model.js
src/models/cardsProfesores.model.js → src/core/models/cardsProfesores.model.js
```

### CORE (mantener centralizados)
```
ACTUAL → NUEVO
src/models/ → src/core/models/ (todos los modelos)
src/schema/ → src/core/schemas/ (todos los schemas)
src/config/ → src/core/config/ (mantener igual)
src/constants/ → src/core/constants/ (mantener igual)
src/middlewares/common.middleware.js → src/core/middlewares/
src/middlewares/logging.middleware.js → src/core/middlewares/
src/middlewares/error/ → src/core/middlewares/error/
src/middlewares/validation/ → src/core/middlewares/validation/
src/utils/ → src/core/utils/
src/patterns/ → src/core/patterns/
src/repositories/ → src/core/repositories/
```

## 📋 PLAN DE EJECUCIÓN

### FASE 1: PREPARACIÓN Y UTILIDADES (CRÍTICO)
**Objetivo**: Eliminar duplicados y crear utilidades comunes
**Duración estimada**: 1-2 horas

1. **Crear estructura core/**
   - [ ] Crear `src/core/utils/auth.util.js` (consolidar verifyTokenFromUrl, isUserAdmin, etc.)
   - [ ] Crear `src/core/utils/health.util.js` (consolidar healthCheck)
   - [ ] Crear `src/core/utils/validation.util.js` (validaciones comunes)

2. **Preparar estructura base**
   - [ ] Crear directorios `src/features/` y `src/core/`
   - [ ] Crear subdirectorios para cada feature

### FASE 2: MIGRAR CORE (INFRAESTRUCTURA)
**Objetivo**: Mover componentes compartidos sin romper dependencias
**Duración estimada**: 2-3 horas

1. **Migrar modelos**
   - [ ] Mover todos los archivos de `src/models/` → `src/core/models/`
   - [ ] Actualizar imports en todos los archivos

2. **Migrar schemas**
   - [ ] Mover todos los archivos de `src/schema/` → `src/core/schemas/`
   - [ ] Actualizar imports en todos los archivos

3. **Migrar configuración**
   - [ ] Mover `src/config/` → `src/core/config/`
   - [ ] Mover `src/constants/` → `src/core/constants/`
   - [ ] Actualizar imports

### FASE 3: MIGRAR FEATURES (UNA POR UNA)
**Objetivo**: Migrar cada feature sin romper funcionalidad
**Duración estimada**: 4-6 horas

#### 3.1 authentication/ (PRIORITARIO - menos dependencias)
- [ ] Crear `src/features/authentication/`
- [ ] Mover archivos relacionados con auth
- [ ] Actualizar imports
- [ ] Probar funcionalidad de login/logout

#### 3.2 file-system/ (SEGUNDO - ya está modularizado)
- [ ] Crear `src/features/file-system/`
- [ ] Mover controladores de file/
- [ ] Mover servicios de storage/
- [ ] Actualizar imports y rutas

#### 3.3 user-management/ (TERCERO)
- [ ] Crear `src/features/user-management/`
- [ ] Mover controladores de user y role
- [ ] Mover servicios relacionados
- [ ] Actualizar imports

#### 3.4 content-management/ (CUARTO)
- [ ] Crear `src/features/content-management/`
- [ ] Mover material y galeria
- [ ] Unificar servicios relacionados
- [ ] Actualizar imports

#### 3.5 communication/ (QUINTO)
- [ ] Crear `src/features/communication/`
- [ ] Mover messaging y whatsapp
- [ ] Consolidar servicios
- [ ] Actualizar imports

#### 3.6 student-management/ (SEXTO)
- [ ] Crear `src/features/student-management/`
- [ ] Mover alumnos relacionados
- [ ] Actualizar imports

#### 3.7 website-content/ (ÚLTIMO - menos crítico)
- [ ] Crear `src/features/website-content/`
- [ ] Mover carousel y cards
- [ ] Actualizar imports

### FASE 4: ACTUALIZAR ENRUTADOR PRINCIPAL
**Objetivo**: Consolidar rutas y limpiar estructura
**Duración estimada**: 1 hora

1. **Actualizar index.routes.js**
   - [ ] Importar desde nuevas ubicaciones
   - [ ] Eliminar ruta auth.routes.js (mantener solo enhanced)
   - [ ] Verificar todas las rutas funcionen

2. **Limpiar archivos obsoletos**
   - [ ] Eliminar directorios vacíos
   - [ ] Eliminar archivos duplicados

### FASE 5: VERIFICACIÓN Y PRUEBAS
**Objetivo**: Asegurar que todo funciona correctamente
**Duración estimada**: 1-2 horas

1. **Pruebas funcionales**
   - [ ] Verificar login/logout
   - [ ] Verificar carga de materiales
   - [ ] Verificar gestión de archivos
   - [ ] Verificar todas las rutas API

2. **Linting y formato**
   - [ ] Ejecutar `npm run lint`
   - [ ] Corregir errores de estilo

## ⚠️ CONSIDERACIONES IMPORTANTES

### RIESGOS Y PRECAUCIONES
1. **Backup obligatorio**: Crear branch de respaldo antes de empezar
2. **Orden crítico**: No cambiar el orden de las fases
3. **Imports masivos**: Cada movimiento requiere actualizar imports
4. **Pruebas continuas**: Probar después de cada feature migrada

### ARCHIVOS CRÍTICOS A REVISAR
- `src/routes/index.routes.js` - Enrutador principal
- `src/app.js` - Configuración principal
- `src/server.js` - Punto de entrada

### COMANDOS DE VERIFICACIÓN
```bash
# Verificar que no hay imports rotos
npm run lint

# Verificar que el servidor inicia
npm run dev

# Verificar estructura
tree src/ -I node_modules
```

## 📝 NOTAS ADICIONALES
- Los archivos `index.js` en cada feature exportarán todos los componentes
- Mantener compatibilidad con el frontend existente
- Documentar cualquier cambio de API en el proceso